// Pocket Medallion central game balancing & rules configuration

export interface GameRulesConfig {
  maxTeamSize: number;
  roundsToWin: number;
  matchPointThreshold: number;
  evolutionRules: {
    stage1To2Cost: number;
    stage2To3Cost: number;
    branchingCost: number;
  };
  rewards: {
    matchWinner: {
      xp: number;
      coins: number;
      candy: number;
    };
    matchParticipant: {
      xp: number;
      coins: number;
      candy: number;
    };
    transferToProfessorCandy: number;
    starterGrant: {
      coins: number;
      candy: number;
      bonusSpeciesIds: string[];
    };
  };
  levelProgression: {
    baseXpPerLevel: number;
    xpMultiplier: number;
  };
}

export const GAME_RULES: GameRulesConfig = {
  maxTeamSize: 6,
  roundsToWin: 3,
  matchPointThreshold: 2,
  evolutionRules: {
    stage1To2Cost: 50,
    stage2To3Cost: 100,
    branchingCost: 50,
  },
  rewards: {
    matchWinner: {
      xp: 150,
      coins: 200,
      candy: 40,
    },
    matchParticipant: {
      xp: 75,
      coins: 100,
      candy: 20,
    },
    transferToProfessorCandy: 25,
    starterGrant: {
      coins: 500,
      candy: 120,
      bonusSpeciesIds: ['pikachu', 'eevee'],
    },
  },
  levelProgression: {
    baseXpPerLevel: 200,
    xpMultiplier: 1.25,
  },
};

export function getXpRequiredForLevel(level: number): number {
  return Math.floor(GAME_RULES.levelProgression.baseXpPerLevel * Math.pow(GAME_RULES.levelProgression.xpMultiplier, level - 1));
}
