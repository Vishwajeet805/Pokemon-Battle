import React, { useState, useEffect } from 'react';
import { Creature, Move, TurnOutcome, ActionResolution } from '../types/game';
import { ELEMENT_COLORS, getTypeMultiplier } from '../utils/typeChart';
import { sounds } from '../utils/audio';
import { AttackEffectOverlay } from './AttackEffectOverlay';
import { Zap, Heart, Shield, Award, Check, Sparkles, AlertCircle, Flame, ArrowRight } from 'lucide-react';

interface BattleScreenProps {
  playerNum: 1 | 2;
  playerName: string;
  rivalName: string;
  playerTeam: Creature[];
  rivalTeam: Creature[];
  playerActiveIndex: number;
  rivalActiveIndex: number;
  round: number;
  playerScore: number;
  rivalScore: number;
  isSelfLocked: boolean;
  isRivalLocked: boolean;
  turnOutcome: TurnOutcome | null;
  onSelectMove: (moveId: string) => void;
  onNextRound: () => void;
  onSwitchCreature?: (newIndex: number) => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  playerNum,
  playerName,
  rivalName,
  playerTeam,
  rivalTeam,
  playerActiveIndex,
  rivalActiveIndex,
  round,
  playerScore,
  rivalScore,
  isSelfLocked,
  isRivalLocked,
  turnOutcome,
  onSelectMove,
  onNextRound,
  onSwitchCreature,
}) => {
  const playerCreature = playerTeam[playerActiveIndex] || playerTeam[0];
  const rivalCreature = rivalTeam[rivalActiveIndex] || rivalTeam[0];

  // Visual animation states
  const [selectedMoveId, setSelectedMoveId] = useState<string | null>(null);
  const [revealingPhase, setRevealingPhase] = useState<boolean>(false);
  const [activeActionIndex, setActiveActionIndex] = useState<number>(-1);
  const [playerHp, setPlayerHp] = useState<number>(playerCreature.hp);
  const [rivalHp, setRivalHp] = useState<number>(rivalCreature.hp);
  const [screenShake, setScreenShake] = useState<'none' | 'light' | 'heavy'>('none');
  const [activeVfx, setActiveVfx] = useState<{
    type: any;
    target: 'opponent' | 'player';
    moveName: string;
  } | null>(null);
  const [floatingDamage, setFloatingDamage] = useState<{
    target: 'opponent' | 'player';
    amount: number;
    effectiveness: string;
    isCrit: boolean;
  } | null>(null);
  const [actionMessage, setActionMessage] = useState<string>('Choose your move to strike!');
  const [isRoundFinished, setIsRoundFinished] = useState<boolean>(false);
  const [attackerLunge, setAttackerLunge] = useState<'none' | 'player' | 'opponent'>('none');
  const [faintedCreature, setFaintedCreature] = useState<'player' | 'opponent' | null>(null);

  // Sync HP when creature switches or initializes
  useEffect(() => {
    setPlayerHp(playerCreature.hp);
  }, [playerCreature.hp]);

  useEffect(() => {
    setRivalHp(rivalCreature.hp);
  }, [rivalCreature.hp]);

  // Is match point active?
  const isMatchPoint = playerScore === 2 || rivalScore === 2;

  // Handle move selection
  const handleMoveClick = (move: Move) => {
    if (isSelfLocked || revealingPhase || isRoundFinished) return;
    sounds.playSelect();
    setSelectedMoveId(move.id);
    onSelectMove(move.id);
  };

  // Turn Outcome Sequence Engine
  useEffect(() => {
    if (!turnOutcome) return;

    // Phase 1: Both locked -> Tension pause & Reveal
    setRevealingPhase(true);
    setActionMessage('Both trainers locked! Revealing attacks...');

    const timer1 = setTimeout(() => {
      // Announce revealed moves
      const pMove = playerNum === 1 ? turnOutcome.player1Move : turnOutcome.player2Move;
      const rMove = playerNum === 1 ? turnOutcome.player2Move : turnOutcome.player1Move;
      setActionMessage(`${playerCreature.name} prepares ${pMove.name}! ${rivalCreature.name} prepares ${rMove.name}!`);

      // Phase 2: Action 1
      const timer2 = setTimeout(() => {
        executeAction(0, turnOutcome.actions);
      }, 1200);

      return () => clearTimeout(timer2);
    }, 1400);

    return () => clearTimeout(timer1);
  }, [turnOutcome]);

  const executeAction = (index: number, actions: ActionResolution[]) => {
    if (index >= actions.length) {
      // Both actions resolved, show round summary
      setRevealingPhase(false);
      setActiveVfx(null);
      setAttackerLunge('none');
      setFloatingDamage(null);
      setIsRoundFinished(true);

      if (turnOutcome?.roundWinner) {
        if ((turnOutcome.roundWinner === 'player1' && playerNum === 1) || (turnOutcome.roundWinner === 'player2' && playerNum === 2)) {
          setActionMessage(`Round won! ${rivalCreature.name} was defeated!`);
          sounds.playImpact('super_effective', true);
        } else if (turnOutcome.roundWinner === 'draw') {
          setActionMessage('Double knockout! It is a draw round!');
        } else {
          setActionMessage(`Round lost! ${playerCreature.name} was defeated!`);
          sounds.playFaint();
        }
      } else {
        setActionMessage('Exchange completed! Prepare next move.');
      }
      return;
    }

    const action = actions[index];
    setActiveActionIndex(index);

    const isPlayerAttacking = action.attackerNum === playerNum;
    setAttackerLunge(isPlayerAttacking ? 'player' : 'opponent');
    setActionMessage(action.message);

    // Play attack element sound
    sounds.playAttack(action.move.type);

    // Trigger visual overlay
    setActiveVfx({
      type: action.move.type,
      target: isPlayerAttacking ? 'opponent' : 'player',
      moveName: action.move.name,
    });

    // Impact timing
    const impactTimer = setTimeout(() => {
      // Hit reaction
      sounds.playImpact(action.effectiveness, action.isCrit);

      if (action.damage > 0) {
        setScreenShake(action.damage > 45 ? 'heavy' : 'light');
        setFloatingDamage({
          target: isPlayerAttacking ? 'opponent' : 'player',
          amount: action.damage,
          effectiveness: action.effectiveness,
          isCrit: action.isCrit,
        });

        // Decrement HP smoothly
        if (isPlayerAttacking) {
          setRivalHp(action.defenderRemainingHp);
        } else {
          setPlayerHp(action.defenderRemainingHp);
        }
      }

      if (action.defenderFainted) {
        setFaintedCreature(isPlayerAttacking ? 'opponent' : 'player');
        sounds.playFaint();
      }

      const postImpactTimer = setTimeout(() => {
        setScreenShake('none');
        setActiveVfx(null);
        setAttackerLunge('none');

        // Next action in 1.2s
        setTimeout(() => {
          setFloatingDamage(null);
          executeAction(index + 1, actions);
        }, 800);
      }, 700);

      return () => clearTimeout(postImpactTimer);
    }, 450);

    return () => clearTimeout(impactTimer);
  };

  const handleNextRoundClick = () => {
    sounds.playSelect();
    setIsRoundFinished(false);
    setSelectedMoveId(null);
    setFaintedCreature(null);
    onNextRound();
  };

  // Helper for HP percent
  const playerHpPercent = Math.max(0, Math.min(100, Math.round((playerHp / playerCreature.maxHp) * 100)));
  const rivalHpPercent = Math.max(0, Math.min(100, Math.round((rivalHp / rivalCreature.maxHp) * 100)));

  return (
    <div
      className={`relative min-h-[calc(100vh-60px)] flex flex-col justify-between max-w-4xl mx-auto overflow-hidden transition-all duration-300 ${
        screenShake === 'heavy' ? 'shake-heavy' : screenShake === 'light' ? 'shake-light' : ''
      }`}
    >
      {/* Background Arena Art */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/src/assets/images/arena_midnight_colosseum_1792434004366.jpg"
          alt="Midnight Arena"
          className="w-full h-full object-cover opacity-35 filter brightness-75 contrast-125"
          referrerPolicy="no-referrer"
        />
        {/* Match Point Alert Aura */}
        {isMatchPoint && (
          <div className="absolute inset-0 bg-gradient-to-b from-rose-950/40 via-transparent to-rose-950/40 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* TOP HEADER HUD: Score, Round, Match Point */}
      <div className="relative z-10 p-3 flex items-center justify-between bg-[#060913]/85 backdrop-blur-md border-b border-indigo-900/40">
        {/* Player Medallion Score */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-white max-w-[80px] sm:max-w-none truncate">
              {playerName}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">({playerScore}/3)</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((star) => (
              <span
                key={star}
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                  star <= playerScore
                    ? 'border-amber-400 bg-amber-400 shadow-sm shadow-amber-400/80'
                    : 'border-slate-700 bg-slate-900/60'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Center Round Banner & Match Point */}
        <div className="flex flex-col items-center">
          {isMatchPoint ? (
            <span className="px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-500 text-rose-300 text-[10px] font-black uppercase tracking-widest animate-pulse">
              MATCH POINT
            </span>
          ) : (
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-bold">
              Round {round}
            </span>
          )}
        </div>

        {/* Rival Medallion Score */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((star) => (
              <span
                key={star}
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                  star <= rivalScore
                    ? 'border-cyan-400 bg-cyan-400 shadow-sm shadow-cyan-400/80'
                    : 'border-slate-700 bg-slate-900/60'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-slate-200 max-w-[80px] sm:max-w-none truncate">
              {rivalName}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">({rivalScore}/3)</span>
          </div>
        </div>
      </div>

      {/* ARENA BATTLEFIELD */}
      <div className="relative z-10 flex-1 flex flex-col justify-between px-4 py-2">
        {/* OPPONENT CREATURE AREA (Top Right) */}
        <div className="flex flex-col items-end w-full max-w-sm ml-auto">
          {/* Opponent Status Card */}
          <div className="w-full bg-[#0a0f22]/90 border border-indigo-900/60 rounded-xl p-2.5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-1">
              <span className="font-display font-bold text-sm text-white truncate">
                {rivalCreature.name}
              </span>
              <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.2 rounded">
                {rivalCreature.primaryType}
              </span>
            </div>

            {/* HP Bar */}
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  rivalHpPercent > 50
                    ? 'bg-emerald-400'
                    : rivalHpPercent > 20
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${rivalHpPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
              <div className="flex items-center gap-1">
                {/* 6 Remaining team balls */}
                {rivalTeam.map((c, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      c.hp > 0 ? 'bg-cyan-400' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span>HP {rivalHp}/{rivalCreature.maxHp}</span>
            </div>
          </div>

          {/* Opponent Sprite Stage */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 mt-1 flex items-center justify-center">
            {/* Glowing Arena Platform */}
            <div className="absolute bottom-1 w-32 h-10 bg-cyan-500/20 rounded-[100%] border border-cyan-400/40 blur-[1px] shadow-[0_0_20px_rgba(6,182,212,0.5)]" />

            {/* Floating Damage Number */}
            {floatingDamage && floatingDamage.target === 'opponent' && (
              <div className="absolute top-0 z-30 font-display font-black text-rose-400 text-2xl drop-shadow-[0_2px_10px_rgba(244,63,94,0.9)] animate-damage-pop">
                -{floatingDamage.amount}
                {floatingDamage.effectiveness === 'super_effective' && (
                  <span className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                    Super Effective!
                  </span>
                )}
                {floatingDamage.isCrit && (
                  <span className="block text-[10px] font-bold text-yellow-200 uppercase">
                    Critical Hit!
                  </span>
                )}
              </div>
            )}

            <img
              src={rivalCreature.artwork}
              alt={rivalCreature.name}
              className={`relative z-10 max-h-full max-w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] transition-transform duration-300 ${
                attackerLunge === 'opponent' ? 'animate-lunge-opponent' : 'animate-energy-pulse'
              } ${faintedCreature === 'opponent' ? 'opacity-30 translate-y-6 grayscale' : ''}`}
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Attack VFX Overlay inside arena */}
        {activeVfx && (
          <AttackEffectOverlay
            type={activeVfx.type}
            target={activeVfx.target}
            moveName={activeVfx.moveName}
          />
        )}

        {/* PLAYER CREATURE AREA (Bottom Left) */}
        <div className="flex flex-col items-start w-full max-w-sm mr-auto mt-2">
          {/* Player Sprite Stage */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
            {/* Glowing Arena Platform */}
            <div className="absolute bottom-1 w-36 h-11 bg-amber-500/20 rounded-[100%] border border-amber-400/40 blur-[1px] shadow-[0_0_20px_rgba(245,158,11,0.5)]" />

            {/* Floating Damage Number */}
            {floatingDamage && floatingDamage.target === 'player' && (
              <div className="absolute top-0 z-30 font-display font-black text-rose-400 text-2xl drop-shadow-[0_2px_10px_rgba(244,63,94,0.9)] animate-damage-pop">
                -{floatingDamage.amount}
                {floatingDamage.effectiveness === 'super_effective' && (
                  <span className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                    Super Effective!
                  </span>
                )}
                {floatingDamage.isCrit && (
                  <span className="block text-[10px] font-bold text-yellow-200 uppercase">
                    Critical Hit!
                  </span>
                )}
              </div>
            )}

            <img
              src={playerCreature.artwork}
              alt={playerCreature.name}
              className={`relative z-10 max-h-full max-w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] transition-transform duration-300 ${
                attackerLunge === 'player' ? 'animate-lunge-player' : 'animate-energy-pulse'
              } ${faintedCreature === 'player' ? 'opacity-30 translate-y-6 grayscale' : ''}`}
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Player Status Card */}
          <div className="w-full bg-[#0a0f22]/90 border border-indigo-900/60 rounded-xl p-2.5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-1">
              <span className="font-display font-bold text-sm text-white truncate">
                {playerCreature.name}
              </span>
              <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.2 rounded">
                {playerCreature.primaryType}
              </span>
            </div>

            {/* HP Bar */}
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  playerHpPercent > 50
                    ? 'bg-emerald-400'
                    : playerHpPercent > 20
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${playerHpPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
              <div className="flex items-center gap-1">
                {/* 6 Remaining team balls */}
                {playerTeam.map((c, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      c.hp > 0 ? 'bg-amber-400' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-slate-200">
                HP {playerHp}/{playerCreature.maxHp}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SUSPENSE STATUS BANNER */}
      <div className="relative z-20 px-4 py-2 bg-[#080d1e]/95 border-t border-indigo-950/80 backdrop-blur-md text-center">
        <p className="text-xs font-semibold text-cyan-200 tracking-wide animate-fade-in flex items-center justify-center gap-2">
          {actionMessage}
        </p>
      </div>

      {/* MOVE SELECTION & CONTROLS (Natural Thumb Zone) */}
      <div className="relative z-20 p-3 bg-[#060913]/95 border-t border-indigo-900/60 backdrop-blur-md">
        {isRoundFinished ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-300">
              {turnOutcome?.roundWinner === (playerNum === 1 ? 'player1' : 'player2')
                ? '🏆 Outstanding play! You scored a victory point.'
                : turnOutcome?.roundWinner === 'draw'
                ? '🤝 Equal power! The round ended in a tie.'
                : '⚡ Stand strong! Counter the rival in the next round.'}
            </div>
            <button
              type="button"
              onClick={handleNextRoundClick}
              className="w-full sm:w-auto min-h-[44px] px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-amber-500 text-white font-display font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue Battle</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            {/* Move Grid */}
            <div className="grid grid-cols-2 gap-2">
              {playerCreature.moves.map((move) => {
                const colors = ELEMENT_COLORS[move.type];
                const isSelected = selectedMoveId === move.id;
                const mult = getTypeMultiplier(move.type, rivalCreature.primaryType, rivalCreature.secondaryType);
                const isSuper = mult > 1.2;

                return (
                  <button
                    key={move.id}
                    type="button"
                    disabled={isSelfLocked || revealingPhase}
                    onClick={() => handleMoveClick(move)}
                    className={`relative min-h-[54px] p-2.5 rounded-xl border-2 text-left flex flex-col justify-between transition-all duration-150 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/40 shadow-lg shadow-amber-500/20'
                        : isSelfLocked
                        ? 'border-slate-800 bg-slate-900/40 opacity-40 cursor-not-allowed'
                        : 'border-slate-800 bg-[#0c1228]/90 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-xs text-white truncate">
                        {move.name}
                      </span>
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${colors.accent}25`, color: colors.accent }}
                      >
                        {move.type}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{move.power} PWR</span>
                      {move.priority ? (
                        <span className="text-cyan-400 font-semibold">+1 PRIO</span>
                      ) : isSuper ? (
                        <span className="text-amber-400 font-bold">EFF+</span>
                      ) : (
                        <span>{move.accuracy}% ACC</span>
                      )}
                    </div>

                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full shadow-md">
                        Locked
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Turn Status Indicators */}
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="font-medium">You:</span>
                {isSelfLocked ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Locked In
                  </span>
                ) : (
                  <span className="text-amber-300">Tap a move</span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-medium">{rivalName}:</span>
                {isRivalLocked ? (
                  <span className="text-cyan-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Ready
                  </span>
                ) : (
                  <span className="text-slate-500 italic">Choosing...</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
