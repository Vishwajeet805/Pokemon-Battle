import React, { useEffect, useState } from 'react';
import { sounds } from '../utils/audio';

interface CountdownOverlayProps {
  onComplete: () => void;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(3); // 3, 2, 1, 0 (BATTLE!)

  useEffect(() => {
    sounds.playCountdown(3);

    const t2 = setTimeout(() => {
      setStep(2);
      sounds.playCountdown(2);
    }, 800);

    const t1 = setTimeout(() => {
      setStep(1);
      sounds.playCountdown(1);
    }, 1600);

    const t0 = setTimeout(() => {
      setStep(0);
      sounds.playCountdown(0);
    }, 2400);

    const end = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearTimeout(t2);
      clearTimeout(t1);
      clearTimeout(t0);
      clearTimeout(end);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden pointer-events-none select-none">
      {/* Background radial shockwave */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.25)_0%,transparent_70%)] animate-pulse" />

      {step > 0 ? (
        <div
          key={step}
          className="relative font-display font-black text-8xl sm:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-orange-400 to-rose-500 drop-shadow-[0_0_50px_rgba(249,115,22,0.8)] animate-[ping_0.8s_cubic-bezier(0,0,0.2,1)_infinite]"
        >
          {step}
        </div>
      ) : (
        <div
          key="battle"
          className="relative text-center px-4 animate-bounce"
        >
          <span className="block font-display font-black text-6xl sm:text-8xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-rose-500 drop-shadow-[0_0_60px_rgba(6,182,212,0.9)]">
            BATTLE!
          </span>
          <span className="block text-xs uppercase tracking-widest text-indigo-200 mt-2 font-mono">
            Fight for the Medallion
          </span>
        </div>
      )}
    </div>
  );
};
