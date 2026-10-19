import React, { useState } from 'react';
import { profileManager } from '../services/playerProfile';
import { POKEMON_SPECIES_DB } from '../data/pokemonFamilies';
import { sounds } from '../utils/audio';
import { Gift, Sparkles, X, Check, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PackOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PackOpeningModal: React.FC<PackOpeningModalProps> = ({ isOpen, onClose }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [packResult, setPackResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleOpen = () => {
    sounds.playCountdown(0);
    setIsOpening(true);

    setTimeout(() => {
      const reward = profileManager.openRewardPack();
      setPackResult(reward);
      setIsOpening(false);
      sounds.playVictory();

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#06b6d4', '#eab308', '#ec4899', '#10b981'],
        });
      } catch {
        // ignore
      }
    }, 1800);
  };

  const species = packResult ? POKEMON_SPECIES_DB[packResult.pokemon.speciesId] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm rounded-3xl border border-indigo-900/80 bg-[#0c1022] p-6 shadow-2xl text-slate-100 text-center overflow-hidden">
        {!isOpening && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {!packResult && !isOpening && (
          <div className="py-4 space-y-4">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 p-0.5 shadow-xl shadow-amber-500/30 animate-energy-pulse">
              <div className="w-full h-full bg-[#0d1226] rounded-[22px] flex items-center justify-center">
                <Gift className="w-12 h-12 text-amber-400" />
              </div>
            </div>

            <div>
              <h3 className="font-display font-black text-xl text-white">
                Mystery Battle Pack
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Open to discover a new wild recruit Pokémon, bonus Coins, and Candy!
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpen}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-display font-bold text-sm tracking-wide shadow-lg shadow-orange-500/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Open Pack
            </button>
          </div>
        )}

        {isOpening && (
          <div className="py-12 space-y-4">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-cyan-400/40 blur-xl animate-ping" />
              <div className="w-20 h-20 rounded-2xl bg-amber-400/20 border-2 border-amber-300 animate-spin flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-amber-300" />
              </div>
            </div>
            <h4 className="font-display font-bold text-lg text-white animate-pulse">
              Opening Reward Pack...
            </h4>
          </div>
        )}

        {packResult && species && (
          <div className="py-2 space-y-4 animate-fade-in">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
              New Pokémon Recruited!
            </span>

            {/* Revealed Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#111c3a] to-[#0a0f20] border-2 border-cyan-400/80 shadow-xl shadow-cyan-500/20">
              <div className="h-28 flex items-center justify-center mb-2">
                <img
                  src={species.artwork}
                  alt={species.name}
                  className="max-h-full max-w-full object-contain drop-shadow-[0_4px_12px_rgba(6,182,212,0.4)] animate-bounce"
                  referrerPolicy="no-referrer"
                />
              </div>

              <h4 className="font-display font-black text-xl text-white">
                {species.name}
              </h4>
              <span className="text-xs text-amber-300 font-mono font-bold block mt-0.5">
                {packResult.pokemon.cp} CP
              </span>
              <span className="text-[10px] text-cyan-300 uppercase font-semibold">
                {species.primaryType} {species.secondaryType && `· ${species.secondaryType}`}
              </span>
            </div>

            {/* Bonus Currencies */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-300">
                +{packResult.coins} Coins 🪙
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300">
                +{packResult.candy} Candy 🍬
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-display font-bold text-xs uppercase tracking-wider text-white cursor-pointer"
            >
              Collect Rewards
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
