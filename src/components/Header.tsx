import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ShieldAlert, Sparkles, HelpCircle, Smartphone, User, Briefcase, Swords } from 'lucide-react';
import { sounds } from '../utils/audio';
import { profileManager } from '../services/playerProfile';

interface HeaderProps {
  roomCode?: string;
  isOnlineMode: boolean;
  currentNav: 'battle' | 'collection' | 'profile';
  onNavChange: (nav: 'battle' | 'collection' | 'profile') => void;
  onOpenRules: () => void;
  onLeaveRoom?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomCode,
  isOnlineMode,
  currentNav,
  onNavChange,
  onOpenRules,
  onLeaveRoom,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getIsMuted());
  const [haptics, setHaptics] = useState(sounds.getHaptics());
  const [profile, setProfile] = useState(profileManager.getProfile());

  useEffect(() => {
    return profileManager.subscribe((p) => setProfile(p));
  }, []);

  const handleToggleSound = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  const handleToggleHaptics = () => {
    const next = sounds.toggleHaptics();
    setHaptics(next);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-indigo-950/60 bg-[#060913]/95 backdrop-blur-md px-3 sm:px-4 py-2">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div
          onClick={() => onNavChange('battle')}
          className="flex items-center gap-2 cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-amber-500/40 shadow-sm shadow-amber-500/20 shrink-0">
            <img
              src="/src/assets/images/game_logo_emblem_1792434005302.jpg"
              alt="Pocket Medallion Emblem"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="font-display font-black text-sm sm:text-base tracking-tight text-white block leading-none">
              Pocket Medallion
            </span>
            <span className="text-[10px] text-indigo-300/80 tracking-wide font-semibold block mt-0.5">
              LV {profile.level} · {profile.name}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Battle, Collection, Profile) */}
        {!roomCode && (
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.playSelect();
                onNavChange('battle');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
                currentNav === 'battle'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Battle</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playSelect();
                onNavChange('collection');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
                currentNav === 'collection'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Collection</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playSelect();
                onNavChange('profile');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
                currentNav === 'profile'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>
          </nav>
        )}

        {roomCode && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-400 font-medium">Room:</span>
            <span className="font-mono font-bold text-amber-300 tracking-wider bg-slate-900/90 px-2 py-0.5 rounded border border-amber-500/30">
              {roomCode}
            </span>
          </div>
        )}

        {/* Zone 3: Interactive Affordances (Sound, Haptics, Rules, Leave) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenRules}
            aria-label="View Battle Rules"
            className="w-8 h-8 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleToggleHaptics}
            title={haptics ? 'Haptic feedback on' : 'Haptic feedback off'}
            aria-label="Toggle haptic vibration"
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
              haptics
                ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300'
                : 'border-slate-800 bg-slate-900/80 text-slate-500'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={isMuted ? 'Unmute game audio' : 'Mute game audio'}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
              !isMuted
                ? 'border-amber-500/40 bg-amber-950/40 text-amber-300'
                : 'border-slate-800 bg-slate-900/80 text-slate-500'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {roomCode && onLeaveRoom && (
            <button
              type="button"
              onClick={onLeaveRoom}
              className="text-xs px-2.5 py-1 rounded-lg border border-red-500/30 bg-red-950/30 text-red-300 hover:bg-red-950/60 transition-colors ml-1 cursor-pointer"
            >
              Leave
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
