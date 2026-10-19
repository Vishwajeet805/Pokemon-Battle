import React, { useState } from 'react';
import { sounds } from '../utils/audio';
import { Sparkles, Swords, Zap, Check, ArrowRight, X, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TutorialBattleModalProps {
  isOpen: boolean;
  onFinishTutorial: () => void;
  onSkip: () => void;
}

export const TutorialBattleModal: React.FC<TutorialBattleModalProps> = ({
  isOpen,
  onFinishTutorial,
  onSkip,
}) => {
  const [tutStep, setTutStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  const [oppHp, setOppHp] = useState<number>(95);
  const [revealing, setRevealing] = useState<boolean>(false);
  const [showCrit, setShowCrit] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectMove = () => {
    sounds.playLockIn();
    setSelectedMove('ember');
    setTutStep(2);

    // Auto trigger reveal after 1.5s
    setTimeout(() => {
      setRevealing(true);
      sounds.playAttack('fire');

      setTimeout(() => {
        sounds.playImpact('super_effective', true);
        setShowCrit(true);
        setOppHp(0);

        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.5 },
          });
        } catch {
          // ignore
        }

        setTimeout(() => {
          setTutStep(3);
        }, 1600);
      }, 800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg rounded-3xl border border-cyan-500/50 bg-[#0c1022] p-5 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-950 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-extrabold text-base text-white">
              Guided Battle Briefing
            </h3>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-slate-400 hover:text-white"
          >
            Skip Tutorial
          </button>
        </div>

        {/* Guided Coach Dialogue */}
        <div className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 mb-4 flex items-start gap-3">
          <span className="text-2xl">🎓</span>
          <div className="text-xs text-slate-200">
            <span className="font-bold text-cyan-300 block mb-0.5">
              Professor Oak's Battle Lesson
            </span>
            {tutStep === 1 && (
              <p>
                In Pocket Medallion, both trainers choose attacks secretly at the same time. Tap your starter's <strong>Ember</strong> move below to lock it in!
              </p>
            )}
            {tutStep === 2 && (
              <p>
                Locked in! Notice your opponent cannot see your move yet. Watch the simultaneous reveal!
              </p>
            )}
            {tutStep === 3 && (
              <p>
                Outstanding! Fire deals <strong className="text-amber-300">2x Super Effective</strong> damage to Grass-types! Winning 3 rounds secures the match.
              </p>
            )}
          </div>
        </div>

        {/* Mini Battle Stage */}
        <div className="relative h-56 rounded-2xl bg-[#070b18] border border-indigo-950 overflow-hidden p-3 flex flex-col justify-between">
          {/* Opponent Mini HUD & Sprite */}
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="text-xs font-bold text-white block">Opponent Bulbasaur</span>
              <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-emerald-400 transition-all duration-700"
                  style={{ width: `${(oppHp / 95) * 100}%` }}
                />
              </div>
            </div>

            <div className="relative w-20 h-20 flex items-center justify-center">
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png"
                alt="Bulbasaur"
                className={`max-h-full max-w-full object-contain transition-all ${
                  oppHp === 0 ? 'opacity-30 grayscale translate-y-3' : 'animate-energy-pulse'
                }`}
                referrerPolicy="no-referrer"
              />
              {showCrit && (
                <span className="absolute -top-2 font-display font-black text-amber-300 text-sm animate-bounce">
                  SUPER EFFECTIVE! -95
                </span>
              )}
            </div>
          </div>

          {/* Player Mini Sprite */}
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 flex items-center justify-center">
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png"
                alt="Charmander"
                className="max-h-full max-w-full object-contain drop-shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Your Charmander</span>
              <span className="text-[10px] text-amber-400 font-mono">HP 90/90 · Fire Type</span>
            </div>
          </div>
        </div>

        {/* Move Selection Controls */}
        <div className="mt-4">
          {tutStep === 1 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Tap to Select Attack:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleSelectMove}
                  className="p-3 rounded-xl border-2 border-orange-500 bg-orange-950/40 text-left hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-lg shadow-orange-500/20"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">Ember</span>
                    <span className="text-[9px] font-bold text-orange-400 uppercase">Fire</span>
                  </div>
                  <span className="text-[10px] text-amber-300 font-mono block mt-1">
                    45 PWR · 2x Super Effective!
                  </span>
                </button>

                <button
                  type="button"
                  disabled
                  className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 text-left opacity-40 cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-400">Scratch</span>
                    <span className="text-[9px] text-slate-500 uppercase">Normal</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">40 PWR</span>
                </button>
              </div>
            </div>
          )}

          {tutStep === 2 && (
            <div className="p-3 rounded-xl bg-slate-900 text-center text-xs text-cyan-300 font-bold animate-pulse">
              Simultaneous Secret Lock Active... Revealing!
            </div>
          )}

          {tutStep === 3 && (
            <button
              type="button"
              onClick={onFinishTutorial}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-amber-500 text-white font-display font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Tutorial Complete! Claim Beginner Pack</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
