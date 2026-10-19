import React from 'react';
import { ElementType } from '../types/game';

interface AttackEffectOverlayProps {
  type: ElementType;
  target: 'opponent' | 'player';
  moveName: string;
}

export const AttackEffectOverlay: React.FC<AttackEffectOverlayProps> = ({
  type,
  target,
  moveName,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center overflow-hidden">
      {/* Element-specific visual manifestations */}
      {type === 'fire' && (
        <div className={`relative w-64 h-64 flex items-center justify-center ${target === 'opponent' ? 'translate-y-[-10%]' : 'translate-y-[20%]'}`}>
          <div className="absolute inset-0 bg-radial from-orange-500/80 via-amber-500/40 to-transparent rounded-full animate-ping" />
          <div className="absolute w-32 h-32 bg-amber-400 rounded-full blur-xl animate-pulse" />
          {/* Flame particles */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-6 bg-gradient-to-t from-orange-600 to-yellow-300 rounded-full blur-xs animate-bounce"
              style={{
                transform: `rotate(${i * 30}deg) translateY(-60px)`,
                animationDelay: `${i * 0.05}s`,
                opacity: 0.9,
              }}
            />
          ))}
        </div>
      )}

      {type === 'water' && (
        <div className={`relative w-72 h-72 flex items-center justify-center ${target === 'opponent' ? 'translate-y-[-10%]' : 'translate-y-[20%]'}`}>
          <div className="absolute inset-0 bg-radial from-cyan-400/70 via-blue-600/30 to-transparent rounded-full animate-ping" />
          <div className="absolute w-40 h-40 border-4 border-cyan-300/80 rounded-full animate-spin" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-8 bg-cyan-300/90 rounded-full blur-[1px]"
              style={{
                transform: `rotate(${i * 45}deg) translateY(-70px) scale(${1 + (i % 3) * 0.2})`,
                opacity: 0.85,
              }}
            />
          ))}
        </div>
      )}

      {type === 'electric' && (
        <div className={`relative w-72 h-72 flex items-center justify-center ${target === 'opponent' ? 'translate-y-[-10%]' : 'translate-y-[20%]'}`}>
          <div className="absolute inset-0 bg-radial from-yellow-300/80 via-amber-400/30 to-transparent rounded-full animate-ping" />
          {/* Jagged electric arc SVG */}
          <svg className="absolute inset-0 w-full h-full text-yellow-300 animate-pulse" viewBox="0 0 100 100">
            <polyline
              points="15,20 40,45 35,55 65,45 55,65 85,80"
              fill="none"
              stroke="#fef08a"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_8px_#eab308]"
            />
            <polyline
              points="80,15 55,40 60,50 30,60 40,75 15,85"
              fill="none"
              stroke="#67e8f9"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_8px_#06b6d4]"
            />
          </svg>
        </div>
      )}

      {type === 'grass' && (
        <div className={`relative w-72 h-72 flex items-center justify-center ${target === 'opponent' ? 'translate-y-[-10%]' : 'translate-y-[20%]'}`}>
          <div className="absolute inset-0 bg-radial from-emerald-500/80 via-green-600/30 to-transparent rounded-full animate-ping" />
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-7 bg-emerald-400 rounded-full blur-xs"
              style={{
                transform: `rotate(${i * 25}deg) translateY(-70px) rotate(45deg)`,
                opacity: 0.9,
              }}
            />
          ))}
        </div>
      )}

      {type === 'ice' && (
        <div className={`relative w-72 h-72 flex items-center justify-center ${target === 'opponent' ? 'translate-y-[-10%]' : 'translate-y-[20%]'}`}>
          <div className="absolute inset-0 bg-radial from-sky-300/80 via-cyan-400/30 to-transparent rounded-full animate-ping" />
          {/* Crystalline shards */}
          <div className="absolute w-36 h-36 border-2 border-sky-200 rotate-45 animate-spin" />
          <div className="absolute w-28 h-28 border-2 border-cyan-100 rotate-12" />
        </div>
      )}

      {type === 'psychic' && (
        <div className={`relative w-72 h-72 flex items-center justify-center ${target === 'opponent' ? 'translate-y-[-10%]' : 'translate-y-[20%]'}`}>
          <div className="absolute inset-0 bg-radial from-fuchsia-500/80 via-purple-600/30 to-transparent rounded-full animate-ping" />
          <div className="absolute w-44 h-44 rounded-full border-4 border-fuchsia-400/70 animate-ping" />
          <div className="absolute w-24 h-24 rounded-full bg-fuchsia-300/40 blur-md animate-pulse" />
        </div>
      )}

      {(type === 'normal' || type === 'ground' || type === 'dark' || type === 'dragon') && (
        <div className={`relative w-72 h-72 flex items-center justify-center ${target === 'opponent' ? 'translate-y-[-10%]' : 'translate-y-[20%]'}`}>
          {/* Shockwave Rings & Speed impact */}
          <div className="absolute w-48 h-48 rounded-full border-4 border-white/80 animate-ping" />
          <div className="absolute w-32 h-32 rounded-full border-2 border-amber-300/90 animate-ping [animation-delay:0.1s]" />
          <div className="absolute w-16 h-16 bg-white/90 rounded-full blur-md" />
        </div>
      )}

      {/* Move Announcement Banner in center */}
      <div className="absolute bottom-16 px-4 py-1.5 rounded-full bg-slate-950/85 border border-white/30 text-white font-display font-bold text-sm tracking-wide shadow-2xl backdrop-blur-md animate-fade-in">
        {moveName}!
      </div>
    </div>
  );
};
