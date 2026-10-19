import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { profileManager } from '../services/playerProfile';
import { Trophy, RotateCcw, Home, Sparkles, Frown, Users, Award, Gift } from 'lucide-react';

interface MatchResultScreenProps {
  isWinner: boolean;
  playerName: string;
  rivalName: string;
  playerScore: number;
  rivalScore: number;
  roomCode: string;
  onRematch: (reDraft: boolean) => void;
  onReturnToLobby: () => void;
}

export const MatchResultScreen: React.FC<MatchResultScreenProps> = ({
  isWinner,
  playerName,
  rivalName,
  playerScore,
  rivalScore,
  roomCode,
  onRematch,
  onReturnToLobby,
}) => {
  const [rewardData, setRewardData] = useState<{
    coins: number;
    candy: number;
    xp: number;
    leveledUp: boolean;
    newLevel: number;
  } | null>(null);

  useEffect(() => {
    // Process match rewards and progression
    const scoreStr = `${playerScore} - ${rivalScore}`;
    const rewards = profileManager.processMatchRewards(isWinner, rivalName, scoreStr);
    setRewardData(rewards);

    if (isWinner) {
      sounds.playVictory();
      try {
        confetti({
          particleCount: 110,
          spread: 75,
          origin: { y: 0.55 },
          colors: ['#06b6d4', '#eab308', '#f97316', '#a855f7'],
        });
      } catch {
        // ignore
      }
    } else {
      sounds.playDefeat();
    }
  }, [isWinner, playerName, rivalName, playerScore, rivalScore]);

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col items-center justify-center px-4 py-8 relative pb-20">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Result Card */}
        <div className="rounded-3xl border border-indigo-900/60 bg-[#0c1022]/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Header Glow */}
          <div
            className={`absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-[90px] pointer-events-none ${
              isWinner ? 'bg-amber-500/30' : 'bg-slate-700/20'
            }`}
          />

          {/* Trophy / Result Icon */}
          <div className="relative mx-auto w-20 h-20 mb-3 flex items-center justify-center">
            {isWinner ? (
              <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/30">
                <div className="w-full h-full bg-[#0a0f22] rounded-[14px] flex items-center justify-center">
                  <Trophy className="w-9 h-9 text-amber-400 animate-bounce" />
                </div>
              </div>
            ) : (
              <div className="w-18 h-18 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <Frown className="w-9 h-9 text-slate-400" />
              </div>
            )}
          </div>

          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-white mb-1">
            {isWinner ? 'VICTORY!' : 'DEFEAT'}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-300 mb-5">
            {isWinner
              ? `${playerName} conquered the arena!`
              : `${rivalName} claimed the medallion.`}
          </p>

          {/* Final Score Board */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-indigo-950 mb-4">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block mb-1">
              Final Match Score
            </span>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <span className="font-display font-black text-3xl text-white block">
                  {playerScore}
                </span>
                <span className="text-xs font-semibold text-slate-300 truncate max-w-[90px] block">
                  {playerName}
                </span>
              </div>
              <span className="text-xl font-bold text-slate-600 font-mono">—</span>
              <div className="text-center">
                <span className="font-display font-black text-3xl text-slate-400 block">
                  {rivalScore}
                </span>
                <span className="text-xs font-semibold text-slate-400 truncate max-w-[90px] block">
                  {rivalName}
                </span>
              </div>
            </div>
          </div>

          {/* Match Rewards Card */}
          {rewardData && (
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 mb-5 text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300 block mb-1.5 flex items-center gap-1">
                <Gift className="w-3.5 h-3.5 text-cyan-400" />
                Match Rewards Earned
              </span>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-mono font-bold text-amber-300 text-sm block">
                    +{rewardData.coins}
                  </span>
                  <span className="text-[10px] text-slate-400">🪙 Coins</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-mono font-bold text-cyan-300 text-sm block">
                    +{rewardData.candy}
                  </span>
                  <span className="text-[10px] text-slate-400">🍬 Candy</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-mono font-bold text-indigo-300 text-sm block">
                    +{rewardData.xp}
                  </span>
                  <span className="text-[10px] text-slate-400">XP</span>
                </div>
              </div>

              {rewardData.leveledUp && (
                <div className="mt-2.5 p-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-cyan-500/20 border border-amber-400/50 text-center animate-pulse">
                  <span className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    TRAINER LEVEL UP! Reached Level {rewardData.newLevel}!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Rematch Options */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => {
                sounds.playSelect();
                onRematch(false);
              }}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-amber-500 text-white font-display font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Rematch (Keep Teams)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playSelect();
                onRematch(true);
              }}
              className="w-full h-11 rounded-xl border border-indigo-700/60 bg-indigo-950/40 hover:bg-indigo-950/70 text-indigo-200 text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Rematch (Draft New Teams)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playSelect();
                onReturnToLobby();
              }}
              className="w-full h-10 text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer pt-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Lobby</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
