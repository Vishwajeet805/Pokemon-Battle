export type ElementType =
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'ice'
  | 'psychic'
  | 'ground'
  | 'dark'
  | 'dragon'
  | 'normal';

export interface Move {
  id: string;
  name: string;
  type: ElementType;
  power: number; // 40 - 120
  accuracy: number; // 75 - 100
  priority?: number; // e.g. Quick attack has priority 1
  category: 'physical' | 'special' | 'status';
  description: string;
}

export interface EvolutionOption {
  targetSpeciesId: string;
  targetSpeciesName: string;
  candyCost: number;
  label?: string; // e.g., "Water Stone / Vaporeon", "Thunder Stone / Jolteon"
}

export interface PokemonSpecies {
  id: string;
  name: string;
  title: string;
  primaryType: ElementType;
  secondaryType?: ElementType;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  baseSpecialAttack: number;
  baseSpecialDefense: number;
  baseCp: number;
  stage: 1 | 2 | 3;
  familyId: string; // e.g. 'bulbasaur_family'
  artwork: string;
  moves: Move[];
  lore: string;
  evolvesTo?: EvolutionOption[];
}

export interface OwnedPokemon {
  ownedId: string;
  speciesId: string;
  cp: number;
  acquiredAt: number;
  isFavorite?: boolean;
}

export interface Creature {
  id: string; // instance or species ID
  speciesId?: string;
  ownedId?: string;
  name: string;
  title: string;
  primaryType: ElementType;
  secondaryType?: ElementType;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  specialAttack: number;
  specialDefense: number;
  cp: number;
  stage?: 1 | 2 | 3;
  familyId?: string;
  artwork: string;
  moves: Move[];
  lore: string;
}

export interface MatchHistoryItem {
  id: string;
  timestamp: number;
  rivalName: string;
  result: 'win' | 'loss';
  score: string; // e.g. '3 - 1'
  coinsEarned: number;
  candyEarned: number;
  xpEarned: number;
}

export interface TrainerProfile {
  id: string;
  name: string;
  avatar: string;
  isGuest: boolean;
  level: number;
  xp: number;
  coins: number;
  candy: number;
  wins: number;
  losses: number;
  collection: OwnedPokemon[];
  savedTeams: {
    id: string;
    name: string;
    pokemonOwnedIds: string[]; // 6 owned IDs
  }[];
  activeTeamId: string;
  matchHistory: MatchHistoryItem[];
  hasCompletedOnboarding: boolean;
  starterChosen?: string;
}

export type BattlePhase =
  | 'welcome'
  | 'create_join'
  | 'waiting_room'
  | 'team_select'
  | 'countdown'
  | 'turn_select'
  | 'locked_in'
  | 'revealing'
  | 'attacking'
  | 'round_result'
  | 'match_over';

export interface PlayerState {
  id: string;
  name: string;
  playerNum: 1 | 2;
  team: Creature[];
  activeCreatureIndex: number;
  score: number; // rounds won (first to 3)
  isLockedIn: boolean;
  selectedMoveId?: string;
  connected: boolean;
}

export type Effectiveness = 'super_effective' | 'normal' | 'not_effective' | 'immune';

export interface ActionResolution {
  attackerNum: 1 | 2;
  attackerName: string;
  defenderName: string;
  move: Move;
  damage: number;
  effectiveness: Effectiveness;
  isCrit: boolean;
  defenderRemainingHp: number;
  defenderMaxHp: number;
  defenderFainted: boolean;
  message: string;
}

export interface TurnOutcome {
  round: number;
  player1Move: Move;
  player2Move: Move;
  actions: ActionResolution[];
  roundWinner: 'player1' | 'player2' | 'draw' | null;
  newScore: { player1: number; player2: number };
  isMatchPoint: boolean;
  matchWinner: 1 | 2 | null;
}

export interface RoomData {
  roomCode: string;
  player1: PlayerState | null;
  player2: PlayerState | null;
  gameState: 'waiting' | 'team_select' | 'battle' | 'finished';
  currentRound: number;
}
