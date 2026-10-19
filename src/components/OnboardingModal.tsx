import React, { useState } from 'react';
import { STARTER_OPTIONS, profileManager } from '../services/playerProfile';
import { sounds } from '../utils/audio';
import { Sparkles, Swords, User, ArrowRight, ShieldCheck, Heart, Zap, Award, Gift, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onStartTutorial: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onStartTutorial,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Profile/Guest setup
  const [trainerName, setTrainerName] = useState('Trainer Red');
  const [isGuest, setIsGuest] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
  );

  // Step 2: Starter Choice
  const [selectedStarterId, setSelectedStarterId] = useState('charmander');

  if (!isOpen) return null;

  const AVATAR_OPTIONS = [
    { name: 'Pikachu', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' },
    { name: 'Charizard', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png' },
    { name: 'Gengar', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png' },
    { name: 'Eevee', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png' },
    { name: 'Garchomp', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/445.png' },
  ];

  const handleStep1Submit = (guest: boolean) => {
    sounds.playSelect();
    setIsGuest(guest);
    profileManager.updateBasicInfo(guest ? 'Guest Trainer' : trainerName, selectedAvatar, guest);
    setStep(2);
  };

  const handleStep2Submit = () => {
    sounds.playLockIn();
    setStep(3);
  };

  const handleTutorialChoice = (playTutorial: boolean) => {
    sounds.playSelect();
    if (playTutorial) {
      onStartTutorial();
    } else {
      handleClaimRewards();
    }
  };

  const handleClaimRewards = () => {
    sounds.playVictory();
    profileManager.completeStarterSelection(selectedStarterId);
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#eab308', '#06b6d4', '#10b981', '#f97316'],
      });
    } catch {
      // ignore
    }
    setStep(4);
  };

  const selectedStarter = STARTER_OPTIONS.find((s) => s.speciesId === selectedStarterId)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-indigo-900/80 bg-[#0c1022] p-6 shadow-2xl text-slate-100">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-indigo-950 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs flex items-center justify-center font-bold">
              {step}/4
            </span>
            <span className="font-display font-bold text-sm tracking-wide text-white">
              {step === 1 && 'Welcome to Pocket Medallion'}
              {step === 2 && 'Choose Your Starter Pokémon'}
              {step === 3 && 'Guided Battle Briefing'}
              {step === 4 && 'Starter Rewards Unlocked!'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">New Trainer Setup</span>
        </div>

        {/* STEP 1: GUEST OR CREATE PROFILE */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-[#0d1226] rounded-[14px] flex items-center justify-center">
                  <User className="w-8 h-8 text-amber-400" />
                </div>
              </div>
              <h2 className="font-display font-extrabold text-xl text-white">
                Create Your Trainer Identity
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Play right away as a guest or personalize your trainer profile for match records.
              </p>
            </div>

            <div>
              <label htmlFor="trainer-name-field" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Trainer Name
              </label>
              <input
                id="trainer-name-field"
                type="text"
                maxLength={18}
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
                placeholder="Enter trainer name..."
                className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-300 mb-2">
                Choose Trainer Avatar
              </span>
              <div className="flex items-center gap-2 justify-center overflow-x-auto py-1">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av.name}
                    type="button"
                    onClick={() => {
                      sounds.playSelect();
                      setSelectedAvatar(av.url);
                    }}
                    className={`w-14 h-14 rounded-2xl border-2 p-1 bg-slate-900/90 flex items-center justify-center transition-all cursor-pointer ${
                      selectedAvatar === av.url
                        ? 'border-amber-400 bg-indigo-950/60 scale-105 shadow-md shadow-amber-400/20'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={av.url}
                      alt={av.name}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleStep1Submit(false)}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:brightness-110 text-white font-display font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Starter Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleStep1Submit(true)}
                className="w-full h-10 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Or Play Instantly as Guest
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE STARTER */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-2">
              <h2 className="font-display font-extrabold text-xl text-white">
                Select Your First Partner
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Each starter has balanced competitive stats and evolves into a powerhouse.
              </p>
            </div>

            {/* Starter 3-Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {STARTER_OPTIONS.map((starter) => {
                const isSelected = selectedStarterId === starter.speciesId;
                const isGrass = starter.type === 'grass';
                const isFire = starter.type === 'fire';
                const isWater = starter.type === 'water';

                return (
                  <div
                    key={starter.speciesId}
                    onClick={() => {
                      sounds.playSelect();
                      setSelectedStarterId(starter.speciesId);
                    }}
                    className={`relative rounded-2xl border-2 p-3.5 flex flex-col justify-between transition-all duration-200 cursor-pointer overflow-hidden ${
                      isSelected
                        ? isGrass
                          ? 'border-emerald-400 bg-emerald-950/40 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                          : isFire
                          ? 'border-orange-400 bg-orange-950/40 shadow-lg shadow-orange-500/20 scale-[1.02]'
                          : 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isGrass
                            ? 'bg-emerald-900/60 text-emerald-300'
                            : isFire
                            ? 'bg-orange-900/60 text-amber-300'
                            : 'bg-cyan-900/60 text-cyan-300'
                        }`}
                      >
                        {starter.type}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-white text-slate-950 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <div className="my-2 h-24 flex items-center justify-center">
                      <img
                        src={starter.artwork}
                        alt={starter.name}
                        className="max-h-full max-w-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-sm text-white">
                        {starter.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        CP {starter.baseCp} · Stage 1
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Starter Preview & Lore */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <span className="text-amber-400 font-semibold block mb-0.5">
                {selectedStarter.name} — {selectedStarter.title}
              </span>
              <p className="text-slate-400">{selectedStarter.lore}</p>
            </div>

            <button
              type="button"
              onClick={handleStep2Submit}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:brightness-110 text-white font-display font-bold text-sm tracking-wide shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Choose {selectedStarter.name} as Partner</span>
            </button>
          </div>
        )}

        {/* STEP 3: GUIDED FIRST BATTLE BRIEFING */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#0d1226] rounded-[14px] flex items-center justify-center">
                <Swords className="w-8 h-8 text-cyan-400" />
              </div>
            </div>

            <h2 className="font-display font-extrabold text-xl text-white">
              Ready for Your First Battle?
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Learn the secret simultaneous move selection, elemental advantages, and first-to-3 round scoring in a quick guided sparring round.
            </p>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <span className="text-slate-300">
                  <strong>Secret Locks:</strong> Tap your attack move secretly. The server hides your choice until both lock in.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <span className="text-slate-300">
                  <strong>Type & Speed:</strong> High speed strikes first; elemental weaknesses deal 2x Super Effective damage!
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <span className="text-slate-300">
                  <strong>Medallion Points:</strong> Win 3 creature rounds to claim the match and earn Evolution Candy.
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleTutorialChoice(true)}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:brightness-110 text-white font-display font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Swords className="w-4 h-4" />
                <span>Start Practice Sparring Battle</span>
              </button>

              <button
                type="button"
                onClick={() => handleTutorialChoice(false)}
                className="w-full h-10 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Skip Tutorial & Claim Rewards Directly
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: STARTER REWARD CLAIM & REVEAL */}
        {step === 4 && (
          <div className="space-y-5 animate-fade-in text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 p-0.5 shadow-xl shadow-amber-500/30 animate-energy-pulse">
              <div className="w-full h-full bg-[#0d1226] rounded-[22px] flex items-center justify-center">
                <Gift className="w-10 h-10 text-amber-400" />
              </div>
            </div>

            <div>
              <h2 className="font-display font-black text-2xl text-white">
                Beginner Pack Unlocked!
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Your starter pack has been delivered to your collection bag:
              </p>
            </div>

            {/* Grant cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <img
                  src={selectedStarter.artwork}
                  alt={selectedStarter.name}
                  className="w-8 h-8 object-contain"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="font-bold text-xs text-white block">{selectedStarter.name}</span>
                  <span className="text-[10px] text-amber-300 font-mono">Starter</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <img
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
                  alt="Pikachu"
                  className="w-8 h-8 object-contain"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="font-bold text-xs text-white block">Pikachu</span>
                  <span className="text-[10px] text-yellow-300 font-mono">Electric</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <img
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png"
                  alt="Eevee"
                  className="w-8 h-8 object-contain"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="font-bold text-xs text-white block">Eevee</span>
                  <span className="text-[10px] text-indigo-300 font-mono">Multi-Evo</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 font-black text-sm flex items-center justify-center">
                  🍬
                </span>
                <div>
                  <span className="font-bold text-xs text-white block">+120 Candy</span>
                  <span className="text-[10px] text-slate-400 font-mono">+500 Coins</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Your default 6-Pokémon squad is prepared. You can customize it anytime in Collection & Bag!
            </p>

            <button
              type="button"
              onClick={() => {
                sounds.playSelect();
                onComplete();
              }}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-amber-500 text-white font-display font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter Battle Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
