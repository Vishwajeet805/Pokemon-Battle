import React, { useState } from 'react';
import { Wifi, Swords, Bot, User, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { sounds } from '../utils/audio';

interface LobbyScreenProps {
  onCreateRoom: (trainerName: string) => void;
  onJoinRoom: (roomCode: string, trainerName: string) => void;
  onStartPractice: (trainerName: string) => void;
}

const DEFAULT_NAMES = [
  'Trainer Red',
  'Trainer Blue',
  'Champion Cynthia',
  'Ace Trainer Leon',
  'Gym Leader Misty',
  'Master Steven',
  'Ranger Ash',
];

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  onCreateRoom,
  onJoinRoom,
  onStartPractice,
}) => {
  const [trainerName, setTrainerName] = useState(() => {
    return DEFAULT_NAMES[Math.floor(Math.random() * DEFAULT_NAMES.length)];
  });
  const [joinCode, setJoinCode] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [errorMsg, setErrorMsg] = useState('');

  const randomizeName = () => {
    sounds.playSelect();
    const currentIdx = DEFAULT_NAMES.indexOf(trainerName);
    let nextIdx = Math.floor(Math.random() * DEFAULT_NAMES.length);
    if (nextIdx === currentIdx) {
      nextIdx = (nextIdx + 1) % DEFAULT_NAMES.length;
    }
    setTrainerName(DEFAULT_NAMES[nextIdx]);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerName.trim()) {
      setErrorMsg('Please enter a trainer name');
      return;
    }
    sounds.playSelect();
    onCreateRoom(trainerName.trim());
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerName.trim()) {
      setErrorMsg('Please enter a trainer name');
      return;
    }
    if (!joinCode.trim()) {
      setErrorMsg('Please enter a room code');
      return;
    }
    sounds.playSelect();
    onJoinRoom(joinCode.trim().toUpperCase(), trainerName.trim());
  };

  const handlePractice = () => {
    sounds.playSelect();
    onStartPractice(trainerName.trim() || 'Trainer Red');
  };

  return (
    <div className="relative min-h-[calc(100vh-60px)] flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
      {/* Background Arena Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[130px]" />
        <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
        {/* Emblem Hero & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-4 group">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/40 via-cyan-500/30 to-purple-500/40 blur-xl animate-energy-pulse" />
            <img
              src="/src/assets/images/game_logo_emblem_1792434005302.jpg"
              alt="Pocket Medallion Emblem"
              className="relative w-full h-full object-contain drop-shadow-[0_0_25px_rgba(234,179,8,0.4)] transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-white uppercase drop-shadow-md">
            Pocket Medallion
          </h1>
          <p className="text-sm font-medium text-indigo-300/90 mt-1 max-w-xs">
            Choose your team. Outsmart your rival.
          </p>
        </div>

        {/* Main Card */}
        <div className="w-full rounded-2xl border border-indigo-900/60 bg-[#0c1022]/90 backdrop-blur-xl p-5 shadow-2xl">
          {/* Trainer Name Bar */}
          <div className="mb-5">
            <label htmlFor="trainer-name-input" className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Trainer Handle
              </span>
              <button
                type="button"
                onClick={randomizeName}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Randomize
              </button>
            </label>
            <div className="relative">
              <input
                id="trainer-name-input"
                type="text"
                maxLength={20}
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
                placeholder="Enter your trainer name..."
                className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          {/* Mode Selector Tabs (Create Room vs Join Room) */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/70 rounded-xl mb-4 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                sounds.playSelect();
                setActiveTab('create');
                setErrorMsg('');
              }}
              className={`h-10 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'create'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              Create Room
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playSelect();
                setActiveTab('join');
                setErrorMsg('');
              }}
              className={`h-10 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'join'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              Join Room
            </button>
          </div>

          {errorMsg && (
            <div className="mb-3 p-2.5 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {activeTab === 'create' ? (
            <form onSubmit={handleCreate} className="space-y-3">
              <p className="text-xs text-slate-400 leading-normal">
                Host a battle match on your local Wi-Fi or mobile hotspot. A short room code will be created for your rival.
              </p>
              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:brightness-110 text-white font-display font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Create Battle Room
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoin} className="space-y-3">
              <div>
                <label htmlFor="room-code-input" className="block text-xs font-semibold text-slate-300 mb-1">
                  Enter 6-Digit Room Code
                </label>
                <input
                  id="room-code-input"
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. BLAZE-482"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white font-mono font-bold tracking-wider text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 uppercase transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:brightness-110 text-white font-display font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                Connect & Battle
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Practice Mode Option */}
          <div className="relative my-4 flex items-center">
            <div className="flex-grow border-t border-slate-800" />
            <span className="flex-shrink mx-2 text-[11px] text-slate-500 font-medium uppercase tracking-wider">
              Solo Road-Trip Sparring
            </span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          <button
            type="button"
            onClick={handlePractice}
            className="w-full h-11 rounded-xl border border-indigo-700/50 bg-indigo-950/40 hover:bg-indigo-950/70 text-indigo-200 font-medium text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Practice vs Rival Bot</span>
            <span className="text-[10px] text-cyan-400 font-semibold">(Instant Solo)</span>
          </button>
        </div>

        {/* Road-trip instructions hint */}
        <div className="mt-5 text-center text-xs text-slate-400 flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Both players connect to same local Wi-Fi or car hotspot</span>
        </div>
      </div>
    </div>
  );
};
