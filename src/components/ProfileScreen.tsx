import React, { useState } from 'react';
import { profileManager } from '../services/playerProfile';
import { getXpRequiredForLevel } from '../config/gameRules';
import { sounds } from '../utils/audio';
import { User, Trophy, Award, Zap, History, Edit3, Check, Sparkles } from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState(profileManager.getProfile());
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);

  const xpRequired = getXpRequiredForLevel(profile.level);
  const xpPercent = Math.min(100, Math.round((profile.xp / xpRequired) * 100));
  const totalMatches = profile.wins + profile.losses;
  const winRate = totalMatches > 0 ? Math.round((profile.wins / totalMatches) * 100) : 0;

  const handleSaveName = () => {
    sounds.playSelect();
    profileManager.updateBasicInfo(editName, profile.avatar, false);
    setProfile(profileManager.getProfile());
    setIsEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-28 space-y-4">
      {/* Profile Card */}
      <div className="bg-[#0c1022]/90 border border-indigo-900/60 p-5 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Avatar */}
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 shrink-0 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#0d1226] rounded-[14px] flex items-center justify-center overflow-hidden">
              <img
                src={profile.avatar}
                alt="Trainer Avatar"
                className="w-16 h-16 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="absolute -bottom-2 -right-1 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md font-mono">
              LV {profile.level}
            </span>
          </div>

          {/* Name & Title */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              {isEditing ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    maxLength={18}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="p-1.5 rounded-lg bg-cyan-600 text-white"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-display font-black text-xl text-white">
                    {profile.name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-slate-400 hover:text-cyan-300"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              {profile.isGuest && (
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                  Guest
                </span>
              )}
            </div>

            <p className="text-xs text-indigo-300 mt-0.5 font-medium">
              Pocket Medallion Arena Contender
            </p>

            {/* Level XP Progress Bar */}
            <div className="mt-3 max-w-sm">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>Trainer XP</span>
                <span className="text-amber-300 font-bold">
                  {profile.xp} / {xpRequired} XP
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Currencies Box */}
          <div className="flex sm:flex-col items-center gap-2 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
              <span>🪙</span>
              <span>{profile.coins} Coins</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
              <span>🍬</span>
              <span>{profile.candy} Candy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Record Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-1">
            Victories
          </span>
          <span className="font-display font-black text-2xl text-white block">
            {profile.wins}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Matches Won</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/30 text-center">
          <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block mb-1">
            Defeats
          </span>
          <span className="font-display font-black text-2xl text-white block">
            {profile.losses}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Matches Lost</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 text-center">
          <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block mb-1">
            Win Rate
          </span>
          <span className="font-display font-black text-2xl text-cyan-300 block">
            {winRate}%
          </span>
          <span className="text-[10px] text-slate-500 font-mono">{totalMatches} Played</span>
        </div>
      </div>

      {/* Match History */}
      <div className="bg-[#0c1022]/90 border border-indigo-900/60 p-5 rounded-3xl backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="font-display font-bold text-base text-white">
            Recent Match History
          </h3>
        </div>

        {profile.matchHistory.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-6">
            No matches played yet. Enter the battle arena or practice sparring to record battles!
          </p>
        ) : (
          <div className="space-y-2">
            {profile.matchHistory.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`font-black text-[11px] uppercase px-2 py-0.5 rounded-md ${
                      m.result === 'win'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {m.result === 'win' ? 'WIN' : 'LOSS'}
                  </span>
                  <div>
                    <span className="font-semibold text-white block">
                      vs {m.rivalName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-amber-300">
                    {m.score}
                  </span>
                  <div className="text-right text-[10px] font-mono text-slate-400">
                    <span className="text-amber-400 block">+{m.coinsEarned} 🪙</span>
                    <span className="text-cyan-400 block">+{m.candyEarned} 🍬</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
