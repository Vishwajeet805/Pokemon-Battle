import express from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { Creature, Move, ActionResolution, TurnOutcome, Effectiveness } from './src/types/game.js';
import { getTypeMultiplier, getEffectivenessCategory } from './src/utils/typeChart.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ServerPlayer {
  socketId: string;
  name: string;
  playerNum: 1 | 2;
  team: Creature[];
  activeCreatureIndex: number;
  score: number;
  selectedMoveId?: string;
  isLockedIn: boolean;
  connected: boolean;
}

interface ServerRoom {
  code: string;
  state: 'waiting' | 'team_select' | 'battle' | 'finished';
  round: number;
  player1: ServerPlayer | null;
  player2: ServerPlayer | null;
  createdAt: number;
}

const rooms = new Map<string, ServerRoom>();

function generateRoomCode(): string {
  const words = ['BOLT', 'BLAZE', 'TIDE', 'AURA', 'FROST', 'EMBER', 'STORM', 'SHADOW', 'SPARK', 'DRAGON'];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${word}-${num}`;
}

function resolveRound(room: ServerRoom): TurnOutcome {
  const p1 = room.player1!;
  const p2 = room.player2!;
  const c1 = p1.team[p1.activeCreatureIndex];
  const c2 = p2.team[p2.activeCreatureIndex];

  const m1 = c1.moves.find(m => m.id === p1.selectedMoveId) || c1.moves[0];
  const m2 = c2.moves.find(m => m.id === p2.selectedMoveId) || c2.moves[0];

  const actions: ActionResolution[] = [];

  // Determine turn order based on Priority first, then Speed, then coin flip
  const prio1 = m1.priority || 0;
  const prio2 = m2.priority || 0;
  let p1First = false;

  if (prio1 !== prio2) {
    p1First = prio1 > prio2;
  } else if (c1.speed !== c2.speed) {
    p1First = c1.speed > c2.speed;
  } else {
    p1First = Math.random() > 0.5;
  }

  const computeDamage = (attackerCreature: Creature, defenderCreature: Creature, move: Move) => {
    const isSpecial = move.category === 'special';
    const attackStat = isSpecial ? attackerCreature.specialAttack : attackerCreature.attack;
    const defenseStat = isSpecial ? defenderCreature.specialDefense : defenderCreature.defense;

    const mult = getTypeMultiplier(move.type, defenderCreature.primaryType, defenderCreature.secondaryType);
    const effectiveness: Effectiveness = getEffectivenessCategory(mult);

    // Critical hit chance (~10%)
    const isCrit = Math.random() < 0.10;
    const critMult = isCrit ? 1.5 : 1.0;

    // Random variance between 0.85 and 1.00
    const variance = 0.85 + Math.random() * 0.15;

    // Standard Pokémon-like formula scaled for 100-140 HP pools + CP scaling
    const cpRatio = attackerCreature.cp && defenderCreature.cp ? Math.pow(attackerCreature.cp / defenderCreature.cp, 0.25) : 1.0;
    const baseDamage = Math.max(12, Math.floor((((22 * move.power * (attackStat / defenseStat) * cpRatio) / 50) + 4) * mult * critMult * variance));
    const finalDamage = mult === 0 ? 0 : baseDamage;

    return { damage: finalDamage, effectiveness, isCrit };
  };

  const executeAttack = (
    attackerNum: 1 | 2,
    attacker: ServerPlayer,
    attackerCreature: Creature,
    defender: ServerPlayer,
    defenderCreature: Creature,
    move: Move
  ) => {
    // Check accuracy
    const hit = Math.random() * 100 <= move.accuracy;
    if (!hit) {
      actions.push({
        attackerNum,
        attackerName: attacker.name,
        defenderName: defender.name,
        move,
        damage: 0,
        effectiveness: 'normal',
        isCrit: false,
        defenderRemainingHp: defenderCreature.hp,
        defenderMaxHp: defenderCreature.maxHp,
        defenderFainted: false,
        message: `${attackerCreature.name}'s ${move.name} missed!`,
      });
      return false;
    }

    const { damage, effectiveness, isCrit } = computeDamage(attackerCreature, defenderCreature, move);
    defenderCreature.hp = Math.max(0, defenderCreature.hp - damage);
    const fainted = defenderCreature.hp === 0;

    let msg = `${attackerCreature.name} used ${move.name}!`;
    if (isCrit) msg += ' A critical hit!';
    if (effectiveness === 'super_effective') msg += ' It was super effective!';
    if (effectiveness === 'not_effective') msg += ' It was not very effective...';
    if (effectiveness === 'immune') msg += ' It had no effect!';
    if (fainted) msg += ` ${defenderCreature.name} fainted!`;

    actions.push({
      attackerNum,
      attackerName: attacker.name,
      defenderName: defender.name,
      move,
      damage,
      effectiveness,
      isCrit,
      defenderRemainingHp: defenderCreature.hp,
      defenderMaxHp: defenderCreature.maxHp,
      defenderFainted: fainted,
      message: msg,
    });

    return fainted;
  };

  if (p1First) {
    const fainted = executeAttack(1, p1, c1, p2, c2, m1);
    if (!fainted) {
      executeAttack(2, p2, c2, p1, c1, m2);
    }
  } else {
    const fainted = executeAttack(2, p2, c2, p1, c1, m2);
    if (!fainted) {
      executeAttack(1, p1, c1, p2, c2, m1);
    }
  }

  // Check round outcome
  let roundWinner: 'player1' | 'player2' | 'draw' | null = null;
  if (c2.hp <= 0 && c1.hp > 0) {
    roundWinner = 'player1';
    p1.score += 1;
  } else if (c1.hp <= 0 && c2.hp > 0) {
    roundWinner = 'player2';
    p2.score += 1;
  } else if (c1.hp <= 0 && c2.hp <= 0) {
    roundWinner = 'draw';
  }

  const isMatchPoint = p1.score === 2 || p2.score === 2;
  let matchWinner: 1 | 2 | null = null;
  if (p1.score >= 3) {
    matchWinner = 1;
    room.state = 'finished';
  } else if (p2.score >= 3) {
    matchWinner = 2;
    room.state = 'finished';
  }

  return {
    round: room.round,
    player1Move: m1,
    player2Move: m2,
    actions,
    roundWinner,
    newScore: { player1: p1.score, player2: p2.score },
    isMatchPoint,
    matchWinner,
  };
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      activeRooms: rooms.size,
      time: new Date().toISOString(),
    });
  });

  io.on('connection', (socket: Socket) => {
    let currentRoomCode: string | null = null;

    socket.on('room:create', ({ playerName }: { playerName: string }) => {
      const code = generateRoomCode();
      const room: ServerRoom = {
        code,
        state: 'waiting',
        round: 1,
        createdAt: Date.now(),
        player1: {
          socketId: socket.id,
          name: playerName || 'Trainer Red',
          playerNum: 1,
          team: [],
          activeCreatureIndex: 0,
          score: 0,
          isLockedIn: false,
          connected: true,
        },
        player2: null,
      };

      rooms.set(code, room);
      currentRoomCode = code;
      socket.join(code);

      socket.emit('room:created', {
        roomCode: code,
        playerNum: 1,
        playerState: room.player1,
      });
    });

    socket.on('room:join', ({ roomCode, playerName }: { roomCode: string; playerName: string }) => {
      const formattedCode = roomCode.trim().toUpperCase();
      const room = rooms.get(formattedCode);

      if (!room) {
        socket.emit('room:error', { message: `Room "${formattedCode}" not found.` });
        return;
      }

      if (room.player2 && room.player2.connected) {
        socket.emit('room:error', { message: `Room "${formattedCode}" is already full.` });
        return;
      }

      room.player2 = {
        socketId: socket.id,
        name: playerName || 'Trainer Blue',
        playerNum: 2,
        team: [],
        activeCreatureIndex: 0,
        score: 0,
        isLockedIn: false,
        connected: true,
      };

      room.state = 'team_select';
      currentRoomCode = formattedCode;
      socket.join(formattedCode);

      socket.emit('room:joined', {
        roomCode: formattedCode,
        playerNum: 2,
        playerState: room.player2,
        rivalName: room.player1!.name,
      });

      // Notify player 1 that rival connected
      io.to(room.player1!.socketId).emit('room:player_joined', {
        rivalName: room.player2.name,
        roomCode: formattedCode,
      });
    });

    socket.on('team:lock', ({ roomCode, team }: { roomCode: string; team: Creature[] }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      const player = socket.id === room.player1?.socketId ? room.player1 : room.player2;
      const rival = socket.id === room.player1?.socketId ? room.player2 : room.player1;

      if (!player) return;
      player.team = team.map(c => ({ ...c, hp: c.maxHp }));
      player.activeCreatureIndex = 0;
      player.isLockedIn = true;

      if (rival) {
        io.to(rival.socketId).emit('team:rival_locked', { rivalName: player.name });
      }

      // If both locked teams -> Countdown & start battle!
      if (room.player1?.isLockedIn && room.player2?.isLockedIn) {
        room.state = 'battle';
        room.round = 1;
        room.player1.isLockedIn = false;
        room.player2.isLockedIn = false;

        io.to(roomCode).emit('battle:countdown_start');

        setTimeout(() => {
          io.to(room.player1!.socketId).emit('battle:start', {
            yourTeam: room.player1!.team,
            yourActiveIndex: 0,
            rivalName: room.player2!.name,
            rivalTeam: room.player2!.team.map(c => ({
              ...c,
              // Keep stats visible, but keep active battle state
            })),
            rivalActiveIndex: 0,
            round: 1,
            playerNum: 1,
          });

          io.to(room.player2!.socketId).emit('battle:start', {
            yourTeam: room.player2!.team,
            yourActiveIndex: 0,
            rivalName: room.player1!.name,
            rivalTeam: room.player1!.team,
            rivalActiveIndex: 0,
            round: 1,
            playerNum: 2,
          });
        }, 3200);
      }
    });

    socket.on('battle:move_select', ({ roomCode, moveId }: { roomCode: string; moveId: string }) => {
      const room = rooms.get(roomCode);
      if (!room || room.state !== 'battle') return;

      const isP1 = socket.id === room.player1?.socketId;
      const player = isP1 ? room.player1 : room.player2;
      const rival = isP1 ? room.player2 : room.player1;

      if (!player || !rival) return;

      player.selectedMoveId = moveId;
      player.isLockedIn = true;

      // Notify the rival that player locked in, WITHOUT revealing the move!
      io.to(rival.socketId).emit('battle:rival_locked_in');
      socket.emit('battle:self_locked_in');

      // Both locked in -> Resolve the round authoritatively
      if (room.player1?.isLockedIn && room.player2?.isLockedIn) {
        const outcome = resolveRound(room);

        // Reset lock flags
        room.player1.isLockedIn = false;
        room.player2.isLockedIn = false;
        room.player1.selectedMoveId = undefined;
        room.player2.selectedMoveId = undefined;

        io.to(roomCode).emit('battle:round_resolve', outcome);
      }
    });

    socket.on('battle:switch_creature', ({ roomCode, newIndex }: { roomCode: string; newIndex: number }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      const isP1 = socket.id === room.player1?.socketId;
      const player = isP1 ? room.player1 : room.player2;
      const rival = isP1 ? room.player2 : room.player1;

      if (!player || !rival) return;
      player.activeCreatureIndex = newIndex;

      io.to(rival.socketId).emit('battle:rival_switched', {
        newIndex,
        newCreature: player.team[newIndex],
      });
    });

    socket.on('battle:next_round', ({ roomCode }: { roomCode: string }) => {
      const room = rooms.get(roomCode);
      if (!room) return;
      room.round += 1;
      io.to(roomCode).emit('battle:round_ready', { round: room.round });
    });

    socket.on('match:rematch', ({ roomCode, reDraft }: { roomCode: string; reDraft: boolean }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      if (room.player1) {
        room.player1.score = 0;
        room.player1.isLockedIn = false;
        room.player1.team.forEach(c => (c.hp = c.maxHp));
      }
      if (room.player2) {
        room.player2.score = 0;
        room.player2.isLockedIn = false;
        room.player2.team.forEach(c => (c.hp = c.maxHp));
      }

      room.round = 1;
      if (reDraft) {
        room.state = 'team_select';
        io.to(roomCode).emit('match:rematch_redraft');
      } else {
        room.state = 'battle';
        io.to(roomCode).emit('battle:countdown_start');
        setTimeout(() => {
          io.to(room.player1!.socketId).emit('battle:start', {
            yourTeam: room.player1!.team,
            yourActiveIndex: 0,
            rivalName: room.player2!.name,
            rivalTeam: room.player2!.team,
            rivalActiveIndex: 0,
            round: 1,
            playerNum: 1,
          });
          io.to(room.player2!.socketId).emit('battle:start', {
            yourTeam: room.player2!.team,
            yourActiveIndex: 0,
            rivalName: room.player1!.name,
            rivalTeam: room.player1!.team,
            rivalActiveIndex: 0,
            round: 1,
            playerNum: 2,
          });
        }, 3200);
      }
    });

    socket.on('disconnect', () => {
      if (currentRoomCode) {
        const room = rooms.get(currentRoomCode);
        if (room) {
          const isP1 = socket.id === room.player1?.socketId;
          const rival = isP1 ? room.player2 : room.player1;
          if (rival && rival.connected) {
            io.to(rival.socketId).emit('room:opponent_left');
          }
          // Clean up room after 10 minutes
          setTimeout(() => {
            rooms.delete(currentRoomCode!);
          }, 600000);
        }
      }
    });
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Pocket Medallion server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Pocket Medallion server:', err);
});
