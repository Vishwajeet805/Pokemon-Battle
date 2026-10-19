import React, { useState, useEffect, useCallback } from 'react';
import { BattlePhase, Creature, TurnOutcome, TrainerProfile } from './types/game';
import { socketService } from './services/socket';
import { profileManager } from './services/playerProfile';
import { Header } from './components/Header';
import { LobbyScreen } from './components/LobbyScreen';
import { WaitingScreen } from './components/WaitingScreen';
import { TeamSelectScreen } from './components/TeamSelectScreen';
import { CountdownOverlay } from './components/CountdownOverlay';
import { BattleScreen } from './components/BattleScreen';
import { MatchResultScreen } from './components/MatchResultScreen';
import { CollectionScreen } from './components/CollectionScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { TutorialBattleModal } from './components/TutorialBattleModal';
import { PackOpeningModal } from './components/PackOpeningModal';
import { RulesModal } from './components/RulesModal';
import { sounds } from './utils/audio';

export default function App() {
  const [profile, setProfile] = useState<TrainerProfile>(profileManager.getProfile());
  const [currentNav, setCurrentNav] = useState<'battle' | 'collection' | 'profile'>('battle');

  // Modals & Onboarding
  const [showOnboarding, setShowOnboarding] = useState<boolean>(!profile.hasCompletedOnboarding);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [showPackModal, setShowPackModal] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Battle session states
  const [phase, setPhase] = useState<BattlePhase>('welcome');
  const [roomCode, setRoomCode] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>(profile.name);
  const [rivalName, setRivalName] = useState<string>('Rival Blue');
  const [playerNum, setPlayerNum] = useState<1 | 2>(1);

  // Active Teams & Match
  const [playerTeam, setPlayerTeam] = useState<Creature[]>([]);
  const [rivalTeam, setRivalTeam] = useState<Creature[]>([]);
  const [playerActiveIndex, setPlayerActiveIndex] = useState<number>(0);
  const [rivalActiveIndex, setRivalActiveIndex] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [rivalScore, setRivalScore] = useState<number>(0);

  // Lock states
  const [isSelfLocked, setIsSelfLocked] = useState<boolean>(false);
  const [isRivalLocked, setIsRivalLocked] = useState<boolean>(false);
  const [showCountdown, setShowCountdown] = useState<boolean>(false);
  const [turnOutcome, setTurnOutcome] = useState<TurnOutcome | null>(null);

  // Listen to profile manager changes
  useEffect(() => {
    return profileManager.subscribe((updated) => {
      setProfile(updated);
      setPlayerName(updated.name);
    });
  }, []);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  }, []);

  // Initialize socket connections
  useEffect(() => {
    socketService.init();

    const handleRoomCreated = ({
      roomCode,
      playerNum,
    }: {
      roomCode: string;
      playerNum: 1 | 2;
    }) => {
      setRoomCode(roomCode);
      setPlayerNum(playerNum);
      setPhase('waiting_room');
      setCurrentNav('battle');
    };

    const handleRoomJoined = ({
      roomCode,
      playerNum,
      rivalName,
    }: {
      roomCode: string;
      playerNum: 1 | 2;
      rivalName?: string;
    }) => {
      setRoomCode(roomCode);
      setPlayerNum(playerNum);
      if (rivalName) setRivalName(rivalName);
      setPhase('team_select');
      setCurrentNav('battle');
      showNotification(`Connected to Room ${roomCode}!`);
    };

    const handlePlayerJoined = ({ rivalName }: { rivalName: string }) => {
      setRivalName(rivalName);
      sounds.playLockIn();
      showNotification(`⚡ ${rivalName} has connected! Entering Team Selection...`);
      setTimeout(() => {
        setPhase('team_select');
      }, 1200);
    };

    const handleTeamRivalLocked = ({ rivalName }: { rivalName: string }) => {
      setIsRivalLocked(true);
      showNotification(`${rivalName} locked their squad!`);
    };

    const handleCountdownStart = () => {
      setShowCountdown(true);
    };

    const handleBattleStart = ({
      yourTeam,
      yourActiveIndex,
      rivalName,
      rivalTeam,
      rivalActiveIndex,
      round,
      playerNum,
    }: {
      yourTeam: Creature[];
      yourActiveIndex: number;
      rivalName: string;
      rivalTeam: Creature[];
      rivalActiveIndex: number;
      round: number;
      playerNum: 1 | 2;
    }) => {
      setShowCountdown(false);
      setPlayerTeam(yourTeam);
      setPlayerActiveIndex(yourActiveIndex);
      setRivalName(rivalName);
      setRivalTeam(rivalTeam);
      setRivalActiveIndex(rivalActiveIndex);
      setRound(round);
      setPlayerNum(playerNum);
      setIsSelfLocked(false);
      setIsRivalLocked(false);
      setTurnOutcome(null);
      setPhase('turn_select');
      setCurrentNav('battle');
    };

    const handleRivalLockedIn = () => {
      setIsRivalLocked(true);
    };

    const handleSelfLockedIn = () => {
      setIsSelfLocked(true);
    };

    const handleRoundResolve = (outcome: TurnOutcome) => {
      setTurnOutcome(outcome);
      setPlayerScore(playerNum === 1 ? outcome.newScore.player1 : outcome.newScore.player2);
      setRivalScore(playerNum === 1 ? outcome.newScore.player2 : outcome.newScore.player1);

      if (outcome.matchWinner) {
        setTimeout(() => {
          setPhase('match_over');
        }, 3000);
      }
    };

    const handleRoundReady = ({ round }: { round: number }) => {
      setRound(round);
      setIsSelfLocked(false);
      setIsRivalLocked(false);
      setTurnOutcome(null);
    };

    const handleRematchRedraft = () => {
      setPlayerScore(0);
      setRivalScore(0);
      setIsSelfLocked(false);
      setIsRivalLocked(false);
      setTurnOutcome(null);
      setPhase('team_select');
    };

    const handleOpponentLeft = () => {
      showNotification('Rival left the room. Returning to lobby...');
      setTimeout(() => {
        handleLeaveRoom();
      }, 2000);
    };

    const handleRoomError = ({ message }: { message: string }) => {
      showNotification(`Error: ${message}`);
    };

    socketService.on('room:created', handleRoomCreated);
    socketService.on('room:joined', handleRoomJoined);
    socketService.on('room:player_joined', handlePlayerJoined);
    socketService.on('team:rival_locked', handleTeamRivalLocked);
    socketService.on('battle:countdown_start', handleCountdownStart);
    socketService.on('battle:start', handleBattleStart);
    socketService.on('battle:rival_locked_in', handleRivalLockedIn);
    socketService.on('battle:self_locked_in', handleSelfLockedIn);
    socketService.on('battle:round_resolve', handleRoundResolve);
    socketService.on('battle:round_ready', handleRoundReady);
    socketService.on('match:rematch_redraft', handleRematchRedraft);
    socketService.on('room:opponent_left', handleOpponentLeft);
    socketService.on('room:error', handleRoomError);

    return () => {
      socketService.off('room:created', handleRoomCreated);
      socketService.off('room:joined', handleRoomJoined);
      socketService.off('room:player_joined', handlePlayerJoined);
      socketService.off('team:rival_locked', handleTeamRivalLocked);
      socketService.off('battle:countdown_start', handleCountdownStart);
      socketService.off('battle:start', handleBattleStart);
      socketService.off('battle:rival_locked_in', handleRivalLockedIn);
      socketService.off('battle:self_locked_in', handleSelfLockedIn);
      socketService.off('battle:round_resolve', handleRoundResolve);
      socketService.off('battle:round_ready', handleRoundReady);
      socketService.off('match:rematch_redraft', handleRematchRedraft);
      socketService.off('room:opponent_left', handleOpponentLeft);
      socketService.off('room:error', handleRoomError);
    };
  }, [playerNum, showNotification]);

  // Actions
  const handleCreateRoom = (name: string) => {
    setPlayerName(name);
    socketService.setPracticeMode(false);
    socketService.createRoom(name);
  };

  const handleJoinRoom = (code: string, name: string) => {
    setPlayerName(name);
    socketService.setPracticeMode(false);
    socketService.joinRoom(code, name);
  };

  const handleStartPractice = (name: string) => {
    setPlayerName(name);
    setRivalName('Rival Blue (AI)');
    socketService.setPracticeMode(true);
    socketService.createRoom(name);
    setTimeout(() => {
      socketService.simulateRivalConnect('Rival Blue (AI)');
    }, 500);
  };

  const handleLockTeam = (selectedTeam: Creature[]) => {
    setIsSelfLocked(true);
    setPlayerTeam(selectedTeam);
    socketService.lockTeam(roomCode, selectedTeam);
  };

  const handleSelectMove = (moveId: string) => {
    socketService.selectMove(roomCode, moveId);
  };

  const handleNextRound = () => {
    socketService.nextRound(roomCode);
  };

  const handleRematch = (reDraft: boolean) => {
    socketService.requestRematch(roomCode, reDraft);
  };

  const handleLeaveRoom = () => {
    setPhase('welcome');
    setRoomCode('');
    setPlayerScore(0);
    setRivalScore(0);
    setIsSelfLocked(false);
    setIsRivalLocked(false);
    setTurnOutcome(null);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col selection:bg-cyan-500/30">
      {/* Top Bar Header */}
      <Header
        roomCode={roomCode}
        isOnlineMode={!socketService.getIsPracticeMode()}
        currentNav={currentNav}
        onNavChange={(nav) => {
          if (phase === 'welcome') {
            setCurrentNav(nav);
          } else {
            showNotification('Finish or leave current battle room first.');
          }
        }}
        onOpenRules={() => setIsRulesOpen(true)}
        onLeaveRoom={phase !== 'welcome' ? handleLeaveRoom : undefined}
      />

      {/* Floating Notifications */}
      {notification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900/95 border border-cyan-500/50 text-cyan-200 text-xs font-semibold shadow-xl shadow-cyan-500/10 backdrop-blur-md animate-fade-in text-center max-w-sm">
          {notification}
        </div>
      )}

      {/* Main Flow Content */}
      <main className="flex-1 flex flex-col justify-center">
        {/* Navigation Tab: Collection & Bag */}
        {currentNav === 'collection' && phase === 'welcome' && (
          <CollectionScreen
            onOpenPack={() => setShowPackModal(true)}
            onGoToBuilder={() => {
              setPhase('team_select');
              setRoomCode('SOLO-BUILDER');
            }}
          />
        )}

        {/* Navigation Tab: Trainer Profile */}
        {currentNav === 'profile' && phase === 'welcome' && (
          <ProfileScreen />
        )}

        {/* Navigation Tab: Battle Hub */}
        {currentNav === 'battle' && (
          <>
            {phase === 'welcome' && (
              <LobbyScreen
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinRoom}
                onStartPractice={handleStartPractice}
              />
            )}

            {phase === 'waiting_room' && (
              <WaitingScreen
                roomCode={roomCode}
                playerName={playerName}
                rivalName={rivalName !== 'Rival Blue' ? rivalName : undefined}
                onSimulateRival={
                  socketService.getIsPracticeMode()
                    ? () => socketService.simulateRivalConnect('Rival Blue')
                    : undefined
                }
                onCancel={handleLeaveRoom}
              />
            )}

            {phase === 'team_select' && (
              <TeamSelectScreen
                onLockTeam={handleLockTeam}
                isLockedIn={isSelfLocked}
                rivalLockedIn={isRivalLocked}
                rivalName={rivalName}
              />
            )}

            {(phase === 'turn_select' || phase === 'attacking' || phase === 'round_result') && (
              <BattleScreen
                playerNum={playerNum}
                playerName={playerName}
                rivalName={rivalName}
                playerTeam={playerTeam}
                rivalTeam={rivalTeam}
                playerActiveIndex={playerActiveIndex}
                rivalActiveIndex={rivalActiveIndex}
                round={round}
                playerScore={playerScore}
                rivalScore={rivalScore}
                isSelfLocked={isSelfLocked}
                isRivalLocked={isRivalLocked}
                turnOutcome={turnOutcome}
                onSelectMove={handleSelectMove}
                onNextRound={handleNextRound}
              />
            )}

            {phase === 'match_over' && (
              <MatchResultScreen
                isWinner={playerScore >= 3}
                playerName={playerName}
                rivalName={rivalName}
                playerScore={playerScore}
                rivalScore={rivalScore}
                roomCode={roomCode}
                onRematch={handleRematch}
                onReturnToLobby={handleLeaveRoom}
              />
            )}
          </>
        )}
      </main>

      {/* 3... 2... 1... BATTLE! Overlay */}
      {showCountdown && (
        <CountdownOverlay
          onComplete={() => {
            setShowCountdown(false);
          }}
        />
      )}

      {/* Onboarding Flow Modal (Guest/Profile + Starter Choice + Beginner Rewards) */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false);
          showNotification('Starter Squad unlocked! Ready to battle.');
        }}
        onStartTutorial={() => {
          setShowOnboarding(false);
          setShowTutorial(true);
        }}
      />

      {/* Guided Tutorial Battle Modal */}
      <TutorialBattleModal
        isOpen={showTutorial}
        onFinishTutorial={() => {
          setShowTutorial(false);
          profileManager.completeStarterSelection(profile.starterChosen || 'charmander');
          showNotification('Tutorial completed! Beginner rewards granted.');
        }}
        onSkip={() => {
          setShowTutorial(false);
          profileManager.completeStarterSelection(profile.starterChosen || 'charmander');
          showNotification('Beginner rewards granted.');
        }}
      />

      {/* Reward Pack Opening Modal */}
      <PackOpeningModal
        isOpen={showPackModal}
        onClose={() => setShowPackModal(false)}
      />

      {/* Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
}
