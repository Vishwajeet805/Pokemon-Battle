import React, { useState } from 'react';
import { OwnedPokemon, PokemonSpecies, EvolutionOption } from '../types/game';
import { POKEMON_SPECIES_DB } from '../data/pokemonFamilies';
import { profileManager } from '../services/playerProfile';
import { sounds } from '../utils/audio';
import { Sparkles, ArrowRight, X, AlertCircle, Check, Zap, Flame, Droplets, Shield, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EvolutionModalProps {
  ownedPokemon: OwnedPokemon;
  onClose: () => void;
  onEvolved: () => void;
}

export const EvolutionModal: React.FC<EvolutionModalProps> = ({
  ownedPokemon,
  onClose,
  onEvolved,
}) => {
  const currentSpecies: PokemonSpecies = POKEMON_SPECIES_DB[ownedPokemon.speciesId];
  const profile = profileManager.getProfile();
  const evolutions: EvolutionOption[] = currentSpecies.evolvesTo || [];

  const [selectedBranch, setSelectedBranch] = useState<string>(
    evolutions[0]?.targetSpeciesId || ''
  );
  const [isEvolvingAnimation, setIsEvolvingAnimation] = useState<boolean>(false);
  const [evolutionComplete, setEvolutionComplete] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!currentSpecies || evolutions.length === 0) return null;

  const currentEvoOption = evolutions.find((e) => e.targetSpeciesId === selectedBranch) || evolutions[0];
  const targetSpecies: PokemonSpecies = POKEMON_SPECIES_DB[currentEvoOption.targetSpeciesId];
  const requiredCandy = currentEvoOption.candyCost;
  const hasEnoughCandy = profile.candy >= requiredCandy;
  const projectedCp = ownedPokemon.cp + Math.max(300, targetSpecies.baseCp - currentSpecies.baseCp);

  const handleConfirmEvolution = () => {
    if (!hasEnoughCandy || isEvolvingAnimation) return;

    sounds.playCountdown(0);
    setIsEvolvingAnimation(true);
    setErrorMsg('');

    // Evolution sequence animation (~2.5s)
    setTimeout(() => {
      const result = profileManager.evolvePokemon(ownedPokemon.ownedId, targetSpecies.id);
      if (result.success) {
        sounds.playVictory();
        setIsEvolvingAnimation(false);
        setEvolutionComplete(true);
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#06b6d4', '#eab308', '#a855f7', '#ffffff'],
          });
        } catch {
          // ignore
        }
        onEvolved();
      } else {
        setIsEvolvingAnimation(false);
        setErrorMsg(result.message);
      }
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md rounded-3xl border border-indigo-900/80 bg-[#0c1022] p-6 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-950 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-extrabold text-lg text-white">
              {evolutionComplete ? 'Evolution Complete!' : 'Evolve Pokémon'}
            </h3>
          </div>
          {!isEvolvingAnimation && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ACTIVE ANIME EVOLUTION SEQUENCE ANIMATION */}
        {isEvolvingAnimation && (
          <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
              {/* Expanding Light Rings */}
              <div className="absolute inset-0 rounded-full bg-cyan-400/40 blur-2xl animate-ping" />
              <div className="absolute inset-2 rounded-full bg-amber-300/30 blur-xl animate-pulse" />
              <div className="absolute inset-0 border-4 border-cyan-300 rounded-full animate-spin" />

              <img
                src={targetSpecies.artwork}
                alt={targetSpecies.name}
                className="relative z-10 w-32 h-32 object-contain brightness-200 contrast-200 animate-pulse"
                referrerPolicy="no-referrer"
              />
            </div>
            <h4 className="font-display font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-amber-300 to-rose-400 uppercase tracking-widest animate-pulse">
              What? {currentSpecies.name} is evolving!
            </h4>
            <p className="text-xs text-slate-400 mt-2">
              Absorbing Mega Energy and awakening new battle power...
            </p>
          </div>
        )}

        {/* POST-EVOLUTION SUCCESS CELEBRATION */}
        {evolutionComplete && (
          <div className="py-6 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="relative w-36 h-36 flex items-center justify-center mb-4">
              <div className="absolute inset-0 bg-radial from-amber-400/30 to-transparent rounded-full blur-xl" />
              <img
                src={targetSpecies.artwork}
                alt={targetSpecies.name}
                className="relative z-10 w-32 h-32 object-contain drop-shadow-[0_8px_20px_rgba(234,179,8,0.5)] animate-bounce"
                referrerPolicy="no-referrer"
              />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
              Stage {targetSpecies.stage} Unlocked
            </span>
            <h4 className="font-display font-black text-2xl text-white mt-0.5">
              {targetSpecies.name}
            </h4>
            <span className="text-xs text-cyan-300 italic">{targetSpecies.title}</span>

            {/* CP Boost Highlight */}
            <div className="mt-4 px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-xs font-mono flex items-center gap-2">
              <span className="text-slate-400">Combat Power:</span>
              <span className="text-slate-400 line-through">{ownedPokemon.cp}</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-amber-300 text-sm">{projectedCp} CP</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-display font-bold text-sm tracking-wide text-white cursor-pointer"
            >
              Continue to Collection
            </button>
          </div>
        )}

        {/* BEFORE / AFTER PREVIEW (Standard State) */}
        {!isEvolvingAnimation && !evolutionComplete && (
          <div className="space-y-4">
            {/* Branching evolution selector if more than 1 option (e.g. Eevee) */}
            {evolutions.length > 1 && (
              <div>
                <span className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Evolution Form:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {evolutions.map((opt) => (
                    <button
                      key={opt.targetSpeciesId}
                      type="button"
                      onClick={() => {
                        sounds.playSelect();
                        setSelectedBranch(opt.targetSpeciesId);
                      }}
                      className={`p-2 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                        selectedBranch === opt.targetSpeciesId
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-sm'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      {opt.label || opt.targetSpeciesName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Side-by-side Before / After Card */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              {/* BEFORE */}
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
                  Current Form
                </span>
                <div className="w-20 h-20 mx-auto mb-2 flex items-center justify-center">
                  <img
                    src={currentSpecies.artwork}
                    alt={currentSpecies.name}
                    className="max-h-full max-w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h5 className="font-display font-bold text-sm text-white">
                  {currentSpecies.name}
                </h5>
                <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                  {ownedPokemon.cp} CP
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                  Stage {currentSpecies.stage}
                </span>
              </div>

              {/* AFTER */}
              <div className="text-center relative">
                <div className="absolute top-1/2 -left-3 -translate-y-1/2 text-cyan-400">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-2">
                  Evolved Form
                </span>
                <div className="w-20 h-20 mx-auto mb-2 flex items-center justify-center">
                  <img
                    src={targetSpecies.artwork}
                    alt={targetSpecies.name}
                    className="max-h-full max-w-full object-contain drop-shadow-[0_4px_12px_rgba(6,182,212,0.4)]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h5 className="font-display font-bold text-sm text-cyan-300">
                  {targetSpecies.name}
                </h5>
                <span className="text-[11px] font-mono font-bold text-amber-300 block mt-0.5">
                  +{projectedCp - ownedPokemon.cp} CP ({projectedCp})
                </span>
                <span className="text-[10px] text-emerald-400 uppercase font-semibold">
                  Stage {targetSpecies.stage}
                </span>
              </div>
            </div>

            {/* New Moves preview */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                Evolved Move Arsenal
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {targetSpecies.moves.slice(0, 4).map((m) => (
                  <div key={m.id} className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate">{m.name}</span>
                    <span className="font-mono text-amber-400 ml-1 shrink-0">{m.power} PWR</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Candy Requirement Banner */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-indigo-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍬</span>
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Evolution Candy
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Required: {requiredCandy} · You Have: {profile.candy}
                  </span>
                </div>
              </div>
              {hasEnoughCandy ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Ready
                </span>
              ) : (
                <span className="text-xs font-semibold text-rose-400">
                  Need {requiredCandy - profile.candy} more
                </span>
              )}
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-500/30">
                {errorMsg}
              </p>
            )}

            {/* Confirm Evolution Action Button */}
            <button
              type="button"
              disabled={!hasEnoughCandy}
              onClick={handleConfirmEvolution}
              className={`w-full h-12 rounded-xl font-display font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
                hasEnoughCandy
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/30 hover:brightness-110 active:scale-95'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Confirm Evolution (-{requiredCandy} Candy)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
