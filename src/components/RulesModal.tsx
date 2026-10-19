import React from 'react';
import { X, Zap, Flame, Droplets, Leaf, Shield, Swords, Award } from 'lucide-react';
import { sounds } from '../utils/audio';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleClose = () => {
    sounds.playSelect();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-indigo-500/30 bg-[#0b0f1e] p-6 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between border-b border-indigo-900/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-400" />
            <h2 className="font-display font-bold text-lg text-white">How To Play</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm leading-relaxed">
          <section className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
            <h3 className="font-display font-semibold text-amber-400 text-sm mb-1.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Victory Objective
            </h3>
            <p className="text-slate-300 text-xs">
              First trainer to win <strong className="text-amber-300">3 creature rounds</strong> wins the match! When a player reaches 2 wins, the arena enters high-stakes <span className="text-rose-400 font-semibold">Match Point</span>.
            </p>
          </section>

          <section className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
            <h3 className="font-display font-semibold text-cyan-400 text-sm mb-1.5 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              Simultaneous Secret Turn Mechanics
            </h3>
            <p className="text-slate-300 text-xs mb-2">
              Both trainers secretly lock in their moves at the same time. Neither player can see the opponent’s choice until both have locked in!
            </p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li><strong className="text-slate-200">Priority Moves:</strong> Moves like Quick Step, Aqua Jet, or Swift Slash strike first regardless of speed.</li>
              <li><strong className="text-slate-200">Speed Stat:</strong> If priority is equal, the creature with the higher speed strikes first.</li>
            </ul>
          </section>

          <section className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
            <h3 className="font-display font-semibold text-emerald-400 text-sm mb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              Key Elemental Matchups
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-orange-950/30 border border-orange-500/20">
                <span className="text-orange-400 font-bold block mb-1">🔥 Fire</span>
                <span className="text-slate-300">2x vs Grass & Ice</span>
              </div>
              <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/20">
                <span className="text-cyan-400 font-bold block mb-1">💧 Water</span>
                <span className="text-slate-300">2x vs Fire & Ground</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
                <span className="text-emerald-400 font-bold block mb-1">🌿 Grass</span>
                <span className="text-slate-300">2x vs Water & Ground</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/20">
                <span className="text-yellow-400 font-bold block mb-1">⚡ Electric</span>
                <span className="text-slate-300">2x vs Water (0x vs Ground)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-500/20">
                <span className="text-sky-300 font-bold block mb-1">❄️ Ice</span>
                <span className="text-slate-300">2x vs Grass & Dragon</span>
              </div>
              <div className="p-2.5 rounded-lg bg-fuchsia-950/30 border border-fuchsia-500/20">
                <span className="text-fuchsia-300 font-bold block mb-1">🔮 Psychic</span>
                <span className="text-slate-300">Resisted by Dark</span>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-sm shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Ready for Battle
          </button>
        </div>
      </div>
    </div>
  );
};
