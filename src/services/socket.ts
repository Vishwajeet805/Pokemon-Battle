import { io, Socket } from 'socket.io-client';
import { Creature, Move, ActionResolution, TurnOutcome, Effectiveness } from '../types/game';
import { CREATURE_ROSTER } from '../data/creatures';
import { getTypeMultiplier, getEffectivenessCategory } from '../utils/typeChart';

export type SocketEventHandler = (...args: any[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private isPracticeMode: boolean = false;
  private practiceListeners: Map<string, SocketEventHandler[]> = new Map();
  private practiceState: {
    roomCode: string;
    playerTeam: Creature[];
    rivalTeam: Creature[];
    playerActiveIndex: number;
    rivalActiveIndex: number;
    playerScore: number;
    rivalScore: number;
    round: number;
    playerMoveId?: string;
  } | null = null;

  public init() {
    if (typeof window === 'undefined') return;

    // Connect to real server on same host/origin
    try {
      this.socket = io({
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('[Pocket Medallion] Real Socket.IO connected:', this.socket?.id);
      });

      this.socket.on('connect_error', (err) => {
        console.warn('[Pocket Medallion] Socket connect warning, can use practice fallback:', err.message);
      });
    } catch (e) {
      console.warn('[Pocket Medallion] Socket initialization note:', e);
    }
  }

  public isConnected(): boolean {
    if (this.isPracticeMode) return true;
    return !!this.socket?.connected;
  }

  public getSocketId(): string {
    if (this.isPracticeMode) return 'practice-player-id';
    return this.socket?.id || '';
  }

  public setPracticeMode(enabled: boolean) {
    this.isPracticeMode = enabled;
  }

  public getIsPracticeMode(): boolean {
    return this.isPracticeMode;
  }

  public on(event: string, handler: SocketEventHandler) {
    if (this.socket) {
      this.socket.on(event, handler);
    }
    // Also register for practice events
    if (!this.practiceListeners.has(event)) {
      this.practiceListeners.set(event, []);
    }
    this.practiceListeners.get(event)!.push(handler);
  }

  public off(event: string, handler: SocketEventHandler) {
    if (this.socket) {
      this.socket.off(event, handler);
    }
    const handlers = this.practiceListeners.get(event);
    if (handlers) {
      this.practiceListeners.set(event, handlers.filter(h => h !== handler));
    }
  }

  private triggerPractice(event: string, payload?: any) {
    const handlers = this.practiceListeners.get(event);
    if (handlers) {
      handlers.forEach(h => h(payload));
    }
  }

  // Action methods
  public createRoom(playerName: string) {
    if (this.isPracticeMode) {
      const code = `PRACTICE-${Math.floor(100 + Math.random() * 900)}`;
      this.practiceState = {
        roomCode: code,
        playerTeam: [],
        rivalTeam: [],
        playerActiveIndex: 0,
        rivalActiveIndex: 0,
        playerScore: 0,
        rivalScore: 0,
        round: 1,
      };
      setTimeout(() => {
        this.triggerPractice('room:created', {
          roomCode: code,
          playerNum: 1,
          playerState: { name: playerName, playerNum: 1, score: 0 },
        });
      }, 300);
      return;
    }
    this.socket?.emit('room:create', { playerName });
  }

  public joinRoom(roomCode: string, playerName: string) {
    if (this.isPracticeMode) {
      // In practice mode, joining simulates opponent connection
      this.triggerPractice('room:joined', {
        roomCode,
        playerNum: 2,
        rivalName: 'Rival Blue',
      });
      return;
    }
    this.socket?.emit('room:join', { roomCode, playerName });
  }

  public simulateRivalConnect(rivalName: string = 'Rival Blue') {
    if (this.isPracticeMode && this.practiceState) {
      setTimeout(() => {
        this.triggerPractice('room:player_joined', {
          rivalName,
          roomCode: this.practiceState?.roomCode,
        });
      }, 700);
    }
  }

  public lockTeam(roomCode: string, team: Creature[]) {
    if (this.isPracticeMode && this.practiceState) {
      this.practiceState.playerTeam = team.map(c => ({ ...c, hp: c.maxHp }));

      // Pick 6 random distinct creatures for Rival
      const available = [...CREATURE_ROSTER].filter(c => !team.some(pt => pt.id === c.id));
      const shuffled = available.sort(() => 0.5 - Math.random());
      const rivalSelection = shuffled.slice(0, 6).map(c => ({ ...c, hp: c.maxHp }));
      this.practiceState.rivalTeam = rivalSelection;

      // Simulate rival locked in
      setTimeout(() => {
        this.triggerPractice('team:rival_locked', { rivalName: 'Rival Blue' });
      }, 600);

      // Countdown and battle start
      setTimeout(() => {
        this.triggerPractice('battle:countdown_start');
        setTimeout(() => {
          this.triggerPractice('battle:start', {
            yourTeam: this.practiceState!.playerTeam,
            yourActiveIndex: 0,
            rivalName: 'Rival Blue',
            rivalTeam: this.practiceState!.rivalTeam,
            rivalActiveIndex: 0,
            round: 1,
            playerNum: 1,
          });
        }, 3200);
      }, 1400);

      return;
    }
    this.socket?.emit('team:lock', { roomCode, team });
  }

  public selectMove(roomCode: string, moveId: string) {
    if (this.isPracticeMode && this.practiceState) {
      this.practiceState.playerMoveId = moveId;
      this.triggerPractice('battle:self_locked_in');

      // Rival bot AI picks a move based on type matchup and highest damage
      const rivalCreature = this.practiceState.rivalTeam[this.practiceState.rivalActiveIndex];
      const playerCreature = this.practiceState.playerTeam[this.practiceState.playerActiveIndex];

      // Simulated rival thinking delay (0.8s - 1.6s)
      const thinkingDelay = 800 + Math.random() * 800;

      setTimeout(() => {
        this.triggerPractice('battle:rival_locked_in');

        // Choose best rival move
        let bestMove = rivalCreature.moves[0];
        let bestWeight = -1;
        for (const m of rivalCreature.moves) {
          const mult = getTypeMultiplier(m.type, playerCreature.primaryType, playerCreature.secondaryType);
          const weight = m.power * mult + (m.priority ? 50 : 0);
          if (weight > bestWeight) {
            bestWeight = weight;
            bestMove = m;
          }
        }

        // Authoritative resolution
        const playerMove = playerCreature.moves.find(m => m.id === moveId) || playerCreature.moves[0];
        const outcome = this.resolvePracticeTurn(playerCreature, rivalCreature, playerMove, bestMove);

        setTimeout(() => {
          this.triggerPractice('battle:round_resolve', outcome);
        }, 600);
      }, thinkingDelay);

      return;
    }
    this.socket?.emit('battle:move_select', { roomCode, moveId });
  }

  public nextRound(roomCode: string) {
    if (this.isPracticeMode && this.practiceState) {
      this.practiceState.round += 1;
      setTimeout(() => {
        this.triggerPractice('battle:round_ready', { round: this.practiceState!.round });
      }, 300);
      return;
    }
    this.socket?.emit('battle:next_round', { roomCode });
  }

  public requestRematch(roomCode: string, reDraft: boolean) {
    if (this.isPracticeMode && this.practiceState) {
      this.practiceState.playerScore = 0;
      this.practiceState.rivalScore = 0;
      this.practiceState.round = 1;
      this.practiceState.playerTeam.forEach(c => (c.hp = c.maxHp));
      this.practiceState.rivalTeam.forEach(c => (c.hp = c.maxHp));

      if (reDraft) {
        this.triggerPractice('match:rematch_redraft');
      } else {
        this.triggerPractice('battle:countdown_start');
        setTimeout(() => {
          this.triggerPractice('battle:start', {
            yourTeam: this.practiceState!.playerTeam,
            yourActiveIndex: 0,
            rivalName: 'Rival Blue',
            rivalTeam: this.practiceState!.rivalTeam,
            rivalActiveIndex: 0,
            round: 1,
            playerNum: 1,
          });
        }, 3200);
      }
      return;
    }
    this.socket?.emit('match:rematch', { roomCode, reDraft });
  }

  private resolvePracticeTurn(
    pCreature: Creature,
    rCreature: Creature,
    pMove: Move,
    rMove: Move
  ): TurnOutcome {
    if (!this.practiceState) throw new Error('No practice state');

    const actions: ActionResolution[] = [];
    const pPrio = pMove.priority || 0;
    const rPrio = rMove.priority || 0;

    let pFirst = false;
    if (pPrio !== rPrio) {
      pFirst = pPrio > rPrio;
    } else if (pCreature.speed !== rCreature.speed) {
      pFirst = pCreature.speed > rCreature.speed;
    } else {
      pFirst = Math.random() > 0.5;
    }

    const calcDmg = (atkC: Creature, defC: Creature, move: Move) => {
      const isSpec = move.category === 'special';
      const a = isSpec ? atkC.specialAttack : atkC.attack;
      const d = isSpec ? defC.specialDefense : defC.defense;
      const mult = getTypeMultiplier(move.type, defC.primaryType, defC.secondaryType);
      const isCrit = Math.random() < 0.12;
      const critMult = isCrit ? 1.5 : 1.0;
      const variance = 0.88 + Math.random() * 0.12;
      const cpRatio = atkC.cp && defC.cp ? Math.pow(atkC.cp / defC.cp, 0.25) : 1.0;
      const raw = Math.max(12, Math.floor((((22 * move.power * (a / d) * cpRatio) / 50) + 4) * mult * critMult * variance));
      const damage = mult === 0 ? 0 : raw;
      const effectiveness: Effectiveness = getEffectivenessCategory(mult);
      return { damage, effectiveness, isCrit };
    };

    const doAtk = (
      num: 1 | 2,
      atkName: string,
      defName: string,
      atkC: Creature,
      defC: Creature,
      move: Move
    ) => {
      const hit = Math.random() * 100 <= move.accuracy;
      if (!hit) {
        actions.push({
          attackerNum: num,
          attackerName: atkName,
          defenderName: defName,
          move,
          damage: 0,
          effectiveness: 'normal',
          isCrit: false,
          defenderRemainingHp: defC.hp,
          defenderMaxHp: defC.maxHp,
          defenderFainted: false,
          message: `${atkC.name}'s ${move.name} missed!`,
        });
        return false;
      }

      const { damage, effectiveness, isCrit } = calcDmg(atkC, defC, move);
      defC.hp = Math.max(0, defC.hp - damage);
      const fainted = defC.hp === 0;

      let msg = `${atkC.name} used ${move.name}!`;
      if (isCrit) msg += ' Critical hit!';
      if (effectiveness === 'super_effective') msg += ' Super effective!';
      if (effectiveness === 'not_effective') msg += ' Not very effective...';
      if (effectiveness === 'immune') msg += ' No effect!';
      if (fainted) msg += ` ${defC.name} fainted!`;

      actions.push({
        attackerNum: num,
        attackerName: atkName,
        defenderName: defName,
        move,
        damage,
        effectiveness,
        isCrit,
        defenderRemainingHp: defC.hp,
        defenderMaxHp: defC.maxHp,
        defenderFainted: fainted,
        message: msg,
      });

      return fainted;
    };

    if (pFirst) {
      const fainted = doAtk(1, 'Trainer Red', 'Rival Blue', pCreature, rCreature, pMove);
      if (!fainted) {
        doAtk(2, 'Rival Blue', 'Trainer Red', rCreature, pCreature, rMove);
      }
    } else {
      const fainted = doAtk(2, 'Rival Blue', 'Trainer Red', rCreature, pCreature, rMove);
      if (!fainted) {
        doAtk(1, 'Trainer Red', 'Rival Blue', pCreature, rCreature, pMove);
      }
    }

    let roundWinner: 'player1' | 'player2' | 'draw' | null = null;
    if (rCreature.hp <= 0 && pCreature.hp > 0) {
      roundWinner = 'player1';
      this.practiceState.playerScore += 1;
    } else if (pCreature.hp <= 0 && rCreature.hp > 0) {
      roundWinner = 'player2';
      this.practiceState.rivalScore += 1;
    } else if (pCreature.hp <= 0 && rCreature.hp <= 0) {
      roundWinner = 'draw';
    }

    const p1Score = this.practiceState.playerScore;
    const p2Score = this.practiceState.rivalScore;
    const isMatchPoint = p1Score === 2 || p2Score === 2;
    let matchWinner: 1 | 2 | null = null;

    if (p1Score >= 3) {
      matchWinner = 1;
    } else if (p2Score >= 3) {
      matchWinner = 2;
    }

    return {
      round: this.practiceState.round,
      player1Move: pMove,
      player2Move: rMove,
      actions,
      roundWinner,
      newScore: { player1: p1Score, player2: p2Score },
      isMatchPoint,
      matchWinner,
    };
  }
}

export const socketService = new SocketService();
