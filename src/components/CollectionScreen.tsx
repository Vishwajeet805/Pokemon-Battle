import React, { useState } from 'react';
import { OwnedPokemon, PokemonSpecies, ElementType } from '../types/game';
import { POKEMON_SPECIES_DB } from '../data/pokemonFamilies';
import { profileManager } from '../services/playerProfile';
import { EvolutionModal } from './EvolutionModal';
import { ELEMENT_COLORS } from '../utils/typeChart';
import { sounds } from '../utils/audio';
import { Sparkles, Trash2, ArrowUpCircle, Info, Heart, Zap, Search, Filter, X, Gift, Check, ArrowRight } from 'lucide-react';

interface CollectionScreenProps {
  onOpenPack: () => void;
  onGoToBuilder: () => void;
}

export const CollectionScreen: React.FC<CollectionScreenProps> = ({
  onOpenPack,
  onGoToBuilder,
}) => {
  const [profile, setProfile] = useState(profileManager.getProfile());
  const [selectedOwned, setSelectedOwned] = useState<OwnedPokemon | null>(null);
  const [evolvingOwned, setEvolvingOwned] = useState<OwnedPokemon | null>(null);
  const [confirmTransfer, setConfirmTransfer] = useState<OwnedPokemon | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'cp' | 'name' | 'stage'>('cp');
  const [toastMsg, setToastMsg] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const refreshProfile = () => {
    setProfile(profileManager.getProfile());
  };

  const handleTransfer = (owned: OwnedPokemon) => {
    sounds.playSelect();
    const res = profileManager.transferToProfessor(owned.ownedId);
    if (res.success) {
      showToast(res.message);
      setConfirmTransfer(null);
      setSelectedOwned(null);
      refreshProfile();
    } else {
      showToast(res.message);
    }
  };

  // Filter and sort owned collection
  const filteredList = profile.collection.filter((item) => {
    const s = POKEMON_SPECIES_DB[item.speciesId];
    if (!s) return false;
    if (filterType === 'all') return true;
    return s.primaryType === filterType || s.secondaryType === filterType;
  });

  const sortedList = [...filteredList].sort((a, b) => {
    const sa = POKEMON_SPECIES_DB[a.speciesId];
    const sb = POKEMON_SPECIES_DB[b.speciesId];
    if (sortBy === 'cp') return b.cp - a.cp;
    if (sortBy === 'name') return sa.name.localeCompare(sb.name);
    if (sortBy === 'stage') return (sb.stage || 1) - (sa.stage || 1);
    return 0;
  });

  const selectedSpecies: PokemonSpecies | null = selectedOwned
    ? POKEMON_SPECIES_DB[selectedOwned.speciesId]
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 pb-28">
      {/* Top Currency & Status Header */}
      <div className="mb-4 bg-[#0c1022]/90 border border-indigo-900/60 p-4 rounded-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div>
          <h2 className="font-display font-extrabold text-xl text-white">
            Trainer Collection Bag
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {profile.collection.length} Pokémon in bag · Evolve and build your 6-squad
          </p>
        </div>

        {/* Currency Pill / Metrics */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs font-mono font-bold text-amber-300">
            <span>🪙</span>
            <span>{profile.coins}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300">
            <span>🍬</span>
            <span>{profile.candy} Candy</span>
          </div>

          <button
            type="button"
            onClick={onOpenPack}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-white font-display font-bold text-xs flex items-center gap-1 shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Reward Pack</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="mb-4 p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 text-xs font-semibold text-center animate-fade-in shadow-lg">
          {toastMsg}
        </div>
      )}

      {/* Filter and Sort Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
          {['all', 'fire', 'water', 'grass', 'electric', 'psychic', 'dragon', 'dark'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                sounds.playSelect();
                setFilterType(t);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                filterType === t
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Sort selector & Squad builder shortcut */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="cp">Highest CP</option>
            <option value="name">Name (A-Z)</option>
            <option value="stage">Evolution Stage</option>
          </select>

          <button
            type="button"
            onClick={onGoToBuilder}
            className="h-8 px-3 rounded-lg bg-indigo-900/60 hover:bg-indigo-900 border border-indigo-600/40 text-indigo-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <span>Squad Builder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {sortedList.map((item) => {
          const species = POKEMON_SPECIES_DB[item.speciesId];
          if (!species) return null;
          const colors = ELEMENT_COLORS[species.primaryType];
          const hasEvolutions = (species.evolvesTo?.length || 0) > 0;
          const canEvolve = hasEvolutions && profile.candy >= (species.evolvesTo![0].candyCost || 50);

          return (
            <div
              key={item.ownedId}
              onClick={() => {
                sounds.playSelect();
                setSelectedOwned(item);
              }}
              className="relative rounded-2xl border-2 border-slate-800/80 bg-[#0d1326]/80 hover:border-slate-700 p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer group"
            >
              {/* Type Badge & Evolution status */}
              <div className="flex items-center justify-between z-10">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: `${colors.accent}25`, color: colors.accent }}
                >
                  {species.primaryType}
                </span>

                {canEvolve && (
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm animate-pulse">
                    <Sparkles className="w-2.5 h-2.5" />
                    Evolve
                  </span>
                )}
              </div>

              {/* Artwork */}
              <div className="relative my-2 h-24 flex items-center justify-center">
                <img
                  src={species.artwork}
                  alt={species.name}
                  className="max-h-full max-w-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-transform duration-200 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>

              {/* Name & CP */}
              <div className="z-10">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-white truncate">
                    {species.name}
                  </h3>
                  <span className="font-mono font-bold text-amber-300 text-xs">
                    {item.cp} CP
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Stage {species.stage}</span>
                  <span className="text-slate-500 font-mono">#{species.id.slice(0, 4)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INSPECT & ACTIONS MODAL */}
      {selectedOwned && selectedSpecies && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-indigo-900/80 bg-[#0c1124] p-5 text-white shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedOwned(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Lockup */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center">
                <img
                  src={selectedSpecies.artwork}
                  alt={selectedSpecies.name}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-lg text-white">
                  {selectedSpecies.name}
                </h3>
                <span className="font-mono font-bold text-amber-400 text-sm block">
                  {selectedOwned.cp} Combat Power
                </span>
                <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                  {selectedSpecies.primaryType}
                  {selectedSpecies.secondaryType && ` / ${selectedSpecies.secondaryType}`} · Stage {selectedSpecies.stage}
                </span>
              </div>
            </div>

            {/* Lore */}
            <p className="text-xs text-slate-300 mb-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              {selectedSpecies.lore}
            </p>

            {/* Moves List */}
            <div className="mb-4">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Move Set
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {selectedSpecies.moves.map((m) => (
                  <div
                    key={m.id}
                    className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white block">{m.name}</span>
                      <span className="text-[10px] text-slate-400">{m.description}</span>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="font-mono font-bold text-amber-300">{m.power} PWR</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{m.accuracy}% Acc</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              {/* Evolve Button (if evolutions available) */}
              {(selectedSpecies.evolvesTo?.length || 0) > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setEvolvingOwned(selectedOwned);
                    setSelectedOwned(null);
                  }}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  <span>Evolve {selectedSpecies.name}</span>
                </button>
              ) : (
                <div className="p-2 text-center text-xs text-slate-500 italic bg-slate-900/40 rounded-xl">
                  Max Evolution Stage Reached
                </div>
              )}

              {/* Transfer to Professor Button */}
              <button
                type="button"
                onClick={() => setConfirmTransfer(selectedOwned)}
                className="w-full h-10 rounded-xl border border-rose-500/40 bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Send to Professor (+25 Candy)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM TRANSFER DIALOG */}
      {confirmTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-rose-500/40 bg-[#0c1124] p-5 text-white shadow-2xl text-center">
            <Trash2 className="w-10 h-10 text-rose-400 mx-auto mb-2" />
            <h4 className="font-display font-bold text-base text-white">
              Transfer to Professor?
            </h4>
            <p className="text-xs text-slate-300 mt-1 mb-4">
              Are you sure you want to send this {POKEMON_SPECIES_DB[confirmTransfer.speciesId]?.name} to the Professor? You will permanently receive <strong className="text-amber-300">+25 Evolution Candy</strong>.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmTransfer(null)}
                className="py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleTransfer(confirmTransfer)}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Confirm (+25 🍬)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EVOLUTION MODAL */}
      {evolvingOwned && (
        <EvolutionModal
          ownedPokemon={evolvingOwned}
          onClose={() => setEvolvingOwned(null)}
          onEvolved={() => {
            refreshProfile();
            showToast('Evolution successful!');
          }}
        />
      )}
    </div>
  );
};
