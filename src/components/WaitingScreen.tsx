import React, { useState } from 'react';
import { Copy, Check, Users, Sparkles, Swords, Loader2, ArrowLeft } from 'lucide-react';
import { sounds } from '../utils/audio';

interface WaitingScreenProps {
  roomCode: string;
  playerName: string;
  rivalName?: string;
  onSimulateRival?: () => void;
  onCancel: () => void;
}

export const WaitingScreen: React.FC<WaitingScreenProps> = ({
  roomCode,
  playerName,
  rivalName,
  onSimulateRival,
  onCancel,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    sounds.playSelect();
    try {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col items-center justify-center px-4 py-8 relative">
      <div className="w-full max-w-md mx-auto">
        {/* Back Button */}
        <button
          type="button"
          onClick={onCancel}
          className="mb-4 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel & Exit Room
        </button>

        <div className="rounded-2xl border border-indigo-900/60 bg-[#0c1022]/90 backdrop-blur-xl p-6 shadow-2xl text-center">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 mb-4 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full">
            <Users className="w-3.5 h-3.5" />
            <span>Room Lobby Active</span>
          </div>

          <h2 className="font-display font-extrabold text-2xl text-white mb-1">
            Waiting for Rival
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Share this code with your friend on the same Wi-Fi
          </p>

          {/* Large Room Code Box */}
          <div className="relative p-5 rounded-2xl bg-slate-950/90 border-2 border-indigo-500/40 shadow-inner mb-6 flex flex-col items-center">
            <span className="text-[11px] text-slate-400 uppercase tracking-widest font-mono mb-1">
              Room Code
            </span>
            <div className="font-mono font-black text-3xl sm:text-4xl text-amber-300 tracking-wider">
              {roomCode}
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-900/40 hover:bg-indigo-900/70 border border-indigo-600/40 text-indigo-200 text-xs font-medium transition-all active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Connection Status Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Player 1 (Host) */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-left">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-1">
                Player 1 (Host)
              </span>
              <p className="font-semibold text-sm text-white truncate">{playerName}</p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ready</span>
              </div>
            </div>

            {/* Player 2 (Rival) */}
            <div
              className={`p-3.5 rounded-xl border text-left transition-all ${
                rivalName
                  ? 'bg-slate-900/80 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/40 border-slate-800'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Player 2 (Rival)
              </span>
              {rivalName ? (
                <>
                  <p className="font-semibold text-sm text-cyan-300 truncate">{rivalName}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-cyan-400">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Connected!</span>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-500 italic">Waiting...</p>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-400/80">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Searching</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Animated Moment when Rival joins */}
          {rivalName ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border border-cyan-500/40 text-cyan-200 text-xs animate-pulse">
              <Swords className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
              <strong>{rivalName} has joined!</strong> Entering Team Selection...
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Tell your friend on the same car Wi-Fi to enter this code on their screen.
              </p>
              {onSimulateRival && (
                <button
                  type="button"
                  onClick={onSimulateRival}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
                >
                  (Or simulate rival connecting now to test)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
