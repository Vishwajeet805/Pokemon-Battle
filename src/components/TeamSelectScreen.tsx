import React, { useState, useEffect } from 'react';
import { Creature } from '../types/game';
import { profileManager } from '../services/playerProfile';
import { ELEMENT_COLORS } from '../utils/typeChart';
import { sounds } from '../utils/audio';
import { Check, Info, Shield, Zap, Swords, Heart, Lock, Sparkles, X, AlertCircle } from 'lucide-react';

interface TeamSelectScreenProps {
  onLockTeam: (selectedTeam: Creature[]) => void;
  isLockedIn: boolean;
  rivalLockedIn: boolean;
  rivalName: string;
}

export const TeamSelectScreen: React.FC<TeamSelectScreenProps> = ({
  onLockTeam,
  isLockedIn,
  rivalLockedIn,
  rivalName,
}) => {
  const [ownedPool, setOwnedPool] = useState<Creature[]>(() => profileManager.getOwnedCreatures());
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const active = profileManager.getActiveTeamCreatures();
    return active.map((c) => c.ownedId || c.id);
  });
  const [inspectCreature, setInspectCreature] = useState<Creature | null>(null);
  const [errorBanner, setErrorBanner] = useState<string>('');

  useEffect(() => {
    setOwnedPool(profileManager.getOwnedCreatures());
  }, []);

  const toggleSelect = (creature: Creature) => {
    if (isLockedIn) return;
    sounds.playSelect();
    setErrorBanner('');

    const targetId = creature.ownedId || creature.id;

    if (selectedIds.includes(targetId)) {
      setSelectedIds(selectedIds.filter((id) => id !== targetId));
    } else {
      if (selectedIds.length >= 6) {
        setErrorBanner('Your squad is already full (6/6). Tap a selected Pokémon to swap it.');
        return;
      }

      // Check evolutionary family rule: only 1 member of each family allowed on a team
      const existingCreatures = selectedIds.map(
        (id) => ownedPool.find((c) => (c.ownedId || c.id) === id)!
      );
      const duplicateFamily = existingCreatures.find(
        (c) => c.familyId && creature.familyId && c.familyId === creature.familyId
      );

      if (duplicateFamily) {
        setErrorBanner(
          `Evolution Family Balance: ${creature.name} cannot be teamed with ${duplicateFamily.name} from the same family!`
        );
        return;
      }

      setSelectedIds([...selectedIds, targetId]);
    }
  };

  const handleLock = () => {
    if (selectedIds.length !== 6 || isLockedIn) return;

    // Validate family balance once more
    const team = selectedIds.map(
      (id) => ownedPool.find((c) => (c.ownedId || c.id) === id)!
    );

    const familySet = new Set<string>();
    for (const c of team) {
      if (c.familyId) {
        if (familySet.has(c.familyId)) {
          setErrorBanner(`Balance violation: Only 1 member of each evolutionary family allowed.`);
          return;
        }
        familySet.add(c.familyId);
      }
    }

    sounds.playLockIn();
    // Persist as active team preset
    profileManager.saveTeamPreset('team_default', 'Active Battle Squad', selectedIds);
    onLockTeam(team);
  };

  const totalSquadCp = selectedIds.reduce((sum, id) => {
    const c = ownedPool.find((item) => (item.ownedId || item.id) === id);
    return sum + (c?.cp || 0);
  }, 0);

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col justify-between max-w-5xl mx-auto px-4 py-4 pb-28">
      {/* Top Banner: Squad builder status & Rival status */}
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0c1022]/90 border border-indigo-900/60 p-4 rounded-2xl backdrop-blur-md shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-amber-400" />
            <h2 className="font-display font-extrabold text-lg text-white">
              Assemble Battle Squad (6 Pokémon)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Select from your collection · Max 1 member per evolutionary family · Total CP:{' '}
            <strong className="text-amber-300 font-mono">{totalSquadCp}</strong>
          </p>
        </div>

        {/* Rival Lock Indicator */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <span className="text-slate-400">{rivalName}:</span>
          {rivalLockedIn ? (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
              <Check className="w-3.5 h-3.5" />
              Locked In
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-400/90 italic">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Drafting squad...
            </span>
          )}
        </div>
      </div>

      {errorBanner && (
        <div className="mb-3 p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Owned Pokémon Collection Grid for Squad Draft */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {ownedPool.map((creature) => {
          const targetId = creature.ownedId || creature.id;
          const isSelected = selectedIds.includes(targetId);
          const colors = ELEMENT_COLORS[creature.primaryType];
          const isFull = selectedIds.length >= 6 && !isSelected;

          return (
            <div
              key={targetId}
              onClick={() => toggleSelect(creature)}
              className={`relative rounded-2xl border-2 p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer overflow-hidden ${
                isSelected
                  ? 'border-cyan-400 bg-gradient-to-b from-[#111c3a] to-[#0d1326] shadow-lg shadow-cyan-500/20 scale-[1.02]'
                  : isFull
                  ? 'border-slate-800/80 bg-slate-950/40 opacity-50'
                  : 'border-slate-800 bg-[#0d1326]/80 hover:border-slate-700'
              }`}
            >
              {/* Type Badge & Info trigger */}
              <div className="flex items-center justify-between z-10">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: `${colors.accent}25`, color: colors.accent }}
                >
                  {creature.primaryType}
                  {creature.secondaryType && ` / ${creature.secondaryType}`}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playSelect();
                    setInspectCreature(creature);
                  }}
                  className="w-6 h-6 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                  aria-label={`Inspect ${creature.name}`}
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Artwork Centerpiece */}
              <div className="relative my-2 h-28 flex items-center justify-center">
                <img
                  src={creature.artwork}
                  alt={creature.name}
                  className="relative max-h-full max-w-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>

              {/* Name & Quick Stats */}
              <div className="z-10">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-white truncate">
                    {creature.name}
                  </h3>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono font-bold text-amber-300">
                    {creature.cp} CP
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Zap className="w-3 h-3 text-amber-400" />
                    {creature.speed} Spd
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fixed Sticky Bottom Team Preview & Lock Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-gradient-to-t from-[#060913] via-[#060913]/95 to-transparent backdrop-blur-md border-t border-indigo-950/80">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          {/* 6 Team Miniature Slots */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {Array.from({ length: 6 }).map((_, index) => {
              const targetId = selectedIds[index];
              const c = targetId
                ? ownedPool.find((item) => (item.ownedId || item.id) === targetId)
                : null;

              return (
                <div
                  key={index}
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
                    c
                      ? 'border-cyan-400/80 bg-slate-900/90 shadow-sm'
                      : 'border-dashed border-slate-700 bg-slate-950/60'
                  }`}
                >
                  {c ? (
                    <img
                      src={c.artwork}
                      alt={c.name}
                      className="w-9 h-9 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-600 font-mono">#{index + 1}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Lock Action Button */}
          <button
            type="button"
            disabled={selectedIds.length !== 6 || isLockedIn}
            onClick={handleLock}
            className={`min-h-[44px] px-5 rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              isLockedIn
                ? 'bg-slate-800 text-slate-400 border border-slate-700'
                : selectedIds.length === 6
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/30 hover:brightness-110 active:scale-95'
                : 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-800'
            }`}
          >
            {isLockedIn ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Locked!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Lock ({selectedIds.length}/6)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inspect Modal */}
      {inspectCreature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-indigo-500/30 bg-[#0c1124] p-5 text-white shadow-2xl">
            <button
              type="button"
              onClick={() => setInspectCreature(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center">
                <img
                  src={inspectCreature.artwork}
                  alt={inspectCreature.name}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-lg text-white">
                  {inspectCreature.name}
                </h3>
                <span className="font-mono font-bold text-amber-300 text-sm block">
                  {inspectCreature.cp} Combat Power
                </span>
                <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                  {inspectCreature.primaryType}
                  {inspectCreature.secondaryType && ` / ${inspectCreature.secondaryType}`}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              {inspectCreature.lore}
            </p>

            <div className="mb-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Move Set
              </h4>
              <div className="space-y-1.5">
                {inspectCreature.moves.map((m) => (
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

            <button
              type="button"
              onClick={() => {
                toggleSelect(inspectCreature);
                setInspectCreature(null);
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-xs uppercase tracking-wider"
            >
              {selectedIds.includes(inspectCreature.ownedId || inspectCreature.id)
                ? 'Remove From Squad'
                : 'Add To Squad'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
