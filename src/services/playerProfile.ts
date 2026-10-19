import { TrainerProfile, OwnedPokemon, Creature } from '../types/game';
import { GAME_RULES, getXpRequiredForLevel } from '../config/gameRules';
import { POKEMON_SPECIES_DB } from '../data/pokemonFamilies';
import { speciesToCreature } from '../data/creatures';

const STORAGE_KEY = 'pm_trainer_profile_v2';

export const STARTER_OPTIONS = [
  {
    speciesId: 'bulbasaur',
    name: 'Bulbasaur',
    type: 'grass',
    title: 'The Forest Starter',
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
    lore: 'Calm, sturdy, and reliable. Evolves into the mighty Venusaur with massive Solar Beam power.',
    baseCp: 450,
  },
  {
    speciesId: 'charmander',
    name: 'Charmander',
    type: 'fire',
    title: 'The Flame Starter',
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
    lore: 'Passionate and fiery. Evolves into Charizard with devastating dragon aerial assaults.',
    baseCp: 480,
  },
  {
    speciesId: 'squirtle',
    name: 'Squirtle',
    type: 'water',
    title: 'The Ocean Starter',
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
    lore: 'Resilient and tactical. Evolves into Blastoise with high-pressure twin hydraulic cannons.',
    baseCp: 440,
  },
];

type ProfileListener = (profile: TrainerProfile) => void;

class ProfileManager {
  private profile: TrainerProfile;
  private listeners: Set<ProfileListener> = new Set();

  constructor() {
    this.profile = this.loadProfile();
  }

  private getDefaultProfile(): TrainerProfile {
    return {
      id: `trainer_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: 'Trainer Red',
      avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
      isGuest: true,
      level: 1,
      xp: 0,
      coins: 0,
      candy: 0,
      wins: 0,
      losses: 0,
      collection: [],
      savedTeams: [],
      activeTeamId: 'team_default',
      matchHistory: [],
      hasCompletedOnboarding: false,
    };
  }

  private loadProfile(): TrainerProfile {
    if (typeof window === 'undefined') return this.getDefaultProfile();
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return this.getDefaultProfile();
  }

  private saveProfile() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch {
      // ignore
    }
    this.notify();
  }

  public subscribe(listener: ProfileListener): () => void {
    this.listeners.add(listener);
    listener(this.profile);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.profile }));
  }

  public getProfile(): TrainerProfile {
    return { ...this.profile };
  }

  // --- ONBOARDING STEPS ---

  public updateBasicInfo(name: string, avatar: string, isGuest: boolean) {
    this.profile.name = name.trim() || 'Trainer Red';
    this.profile.avatar = avatar;
    this.profile.isGuest = isGuest;
    this.saveProfile();
  }

  public completeStarterSelection(starterSpeciesId: string) {
    const starterSpecies = POKEMON_SPECIES_DB[starterSpeciesId] || POKEMON_SPECIES_DB['bulbasaur'];
    this.profile.starterChosen = starterSpeciesId;

    // Create unique starter instance
    const starterInstance: OwnedPokemon = {
      ownedId: `owned_${starterSpecies.id}_${Date.now()}`,
      speciesId: starterSpecies.id,
      cp: starterSpecies.baseCp,
      acquiredAt: Date.now(),
      isFavorite: true,
    };

    // Grant bonus beginner Pokémon (Pikachu & Eevee)
    const bonusInstances: OwnedPokemon[] = GAME_RULES.rewards.starterGrant.bonusSpeciesIds.map((bId, idx) => {
      const s = POKEMON_SPECIES_DB[bId] || POKEMON_SPECIES_DB['pikachu'];
      return {
        ownedId: `owned_${s.id}_${Date.now() + idx + 1}`,
        speciesId: s.id,
        cp: s.baseCp,
        acquiredAt: Date.now(),
      };
    });

    // Also grant additional beginner wild encounters to ensure player has at least 6 Pokémon to form a squad!
    const extraStarters: string[] = ['gastly', 'gible', 'lapras'];
    const extraInstances: OwnedPokemon[] = extraStarters.map((eId, idx) => {
      const s = POKEMON_SPECIES_DB[eId] || POKEMON_SPECIES_DB['lapras'];
      return {
        ownedId: `owned_${s.id}_${Date.now() + idx + 10}`,
        speciesId: s.id,
        cp: s.baseCp,
        acquiredAt: Date.now(),
      };
    });

    this.profile.collection = [starterInstance, ...bonusInstances, ...extraInstances];
    this.profile.coins = GAME_RULES.rewards.starterGrant.coins;
    this.profile.candy = GAME_RULES.rewards.starterGrant.candy;
    this.profile.hasCompletedOnboarding = true;

    // Auto-create initial default squad of 6
    const first6OwnedIds = this.profile.collection.slice(0, 6).map((p) => p.ownedId);
    this.profile.savedTeams = [
      {
        id: 'team_default',
        name: 'Starter Squad',
        pokemonOwnedIds: first6OwnedIds,
      },
    ];
    this.profile.activeTeamId = 'team_default';

    this.saveProfile();
  }

  // --- COLLECTION & EVOLUTION ---

  public getOwnedCreatures(): Creature[] {
    return this.profile.collection.map((owned) =>
      speciesToCreature(owned.speciesId, owned.ownedId, owned.cp)
    );
  }

  public getActiveTeamCreatures(): Creature[] {
    const activeTeam = this.profile.savedTeams.find((t) => t.id === this.profile.activeTeamId) || this.profile.savedTeams[0];
    if (!activeTeam || activeTeam.pokemonOwnedIds.length === 0) {
      // Fallback to first 6 owned
      return this.profile.collection.slice(0, 6).map((owned) =>
        speciesToCreature(owned.speciesId, owned.ownedId, owned.cp)
      );
    }

    const teamCreatures: Creature[] = [];
    for (const ownedId of activeTeam.pokemonOwnedIds) {
      const owned = this.profile.collection.find((p) => p.ownedId === ownedId);
      if (owned) {
        teamCreatures.push(speciesToCreature(owned.speciesId, owned.ownedId, owned.cp));
      }
    }

    // If less than 6 (e.g. transferred), fill with remaining available
    if (teamCreatures.length < 6) {
      const missing = 6 - teamCreatures.length;
      const unused = this.profile.collection.filter(
        (p) => !teamCreatures.some((tc) => tc.ownedId === p.ownedId)
      );
      for (let i = 0; i < missing && i < unused.length; i++) {
        teamCreatures.push(speciesToCreature(unused[i].speciesId, unused[i].ownedId, unused[i].cp));
      }
    }

    return teamCreatures;
  }

  public saveTeamPreset(teamId: string, name: string, ownedIds: string[]): { success: boolean; message?: string } {
    if (ownedIds.length !== 6) {
      return { success: false, message: 'A team must have exactly 6 Pokémon.' };
    }

    // Check unique owned
    const uniqueIds = new Set(ownedIds);
    if (uniqueIds.size !== 6) {
      return { success: false, message: 'Cannot use the exact same Pokémon twice.' };
    }

    // Evolutionary family balance rule: only 1 Pokémon from each family allowed
    const familySet = new Set<string>();
    for (const id of ownedIds) {
      const owned = this.profile.collection.find((p) => p.ownedId === id);
      if (owned) {
        const species = POKEMON_SPECIES_DB[owned.speciesId];
        if (species) {
          if (familySet.has(species.familyId)) {
            return {
              success: false,
              message: `Balance rule: Only 1 member of the ${species.name} evolutionary family is allowed in a single squad!`,
            };
          }
          familySet.add(species.familyId);
        }
      }
    }

    const existingIdx = this.profile.savedTeams.findIndex((t) => t.id === teamId);
    if (existingIdx >= 0) {
      this.profile.savedTeams[existingIdx] = { id: teamId, name, pokemonOwnedIds: ownedIds };
    } else {
      this.profile.savedTeams.push({ id: teamId, name, pokemonOwnedIds: ownedIds });
    }
    this.profile.activeTeamId = teamId;
    this.saveProfile();
    return { success: true };
  }

  public transferToProfessor(ownedId: string): { success: boolean; candyAwarded: number; message: string } {
    const idx = this.profile.collection.findIndex((p) => p.ownedId === ownedId);
    if (idx === -1) {
      return { success: false, candyAwarded: 0, message: 'Pokémon not found.' };
    }

    // Don't allow transferring if total collection is <= 6 (needs at least 6 for battles)
    if (this.profile.collection.length <= 6) {
      return {
        success: false,
        candyAwarded: 0,
        message: 'You need at least 6 Pokémon in your collection to battle!',
      };
    }

    const transferred = this.profile.collection[idx];
    const species = POKEMON_SPECIES_DB[transferred.speciesId];
    const candyReward = GAME_RULES.rewards.transferToProfessorCandy;

    this.profile.collection.splice(idx, 1);
    this.profile.candy += candyReward;

    // Remove from saved teams if present
    this.profile.savedTeams.forEach((team) => {
      team.pokemonOwnedIds = team.pokemonOwnedIds.filter((id) => id !== ownedId);
    });

    this.saveProfile();
    return {
      success: true,
      candyAwarded: candyReward,
      message: `Transferred ${species.name} to Professor! Awarded +${candyReward} Candy.`,
    };
  }

  public evolvePokemon(
    ownedId: string,
    targetSpeciesId: string
  ): { success: boolean; evolvedSpecies?: any; newCp?: number; message: string } {
    const owned = this.profile.collection.find((p) => p.ownedId === ownedId);
    if (!owned) {
      return { success: false, message: 'Pokémon not found.' };
    }

    const currentSpecies = POKEMON_SPECIES_DB[owned.speciesId];
    const targetSpecies = POKEMON_SPECIES_DB[targetSpeciesId];
    if (!currentSpecies || !targetSpecies) {
      return { success: false, message: 'Invalid species data.' };
    }

    const evolutionOption = currentSpecies.evolvesTo?.find((e) => e.targetSpeciesId === targetSpeciesId);
    if (!evolutionOption) {
      return { success: false, message: `${currentSpecies.name} cannot evolve into ${targetSpecies.name}.` };
    }

    const requiredCandy = evolutionOption.candyCost;
    if (this.profile.candy < requiredCandy) {
      return {
        success: false,
        message: `Not enough Candy! Required: ${requiredCandy}, You have: ${this.profile.candy}`,
      };
    }

    // Deduct candy
    this.profile.candy -= requiredCandy;

    // Calculate new CP: targetSpecies baseCp + retained bonus
    const cpIncrease = Math.max(300, targetSpecies.baseCp - currentSpecies.baseCp);
    const newCp = owned.cp + cpIncrease;

    // Mutate owned record
    owned.speciesId = targetSpeciesId;
    owned.cp = newCp;

    this.saveProfile();

    return {
      success: true,
      evolvedSpecies: targetSpecies,
      newCp,
      message: `Congratulations! ${currentSpecies.name} evolved into ${targetSpecies.name}!`,
    };
  }

  // --- REWARDS & PROGRESSION ---

  public processMatchRewards(isWinner: boolean, rivalName: string, scoreStr: string): {
    coins: number;
    candy: number;
    xp: number;
    leveledUp: boolean;
    newLevel: number;
  } {
    const rewardConfig = isWinner
      ? GAME_RULES.rewards.matchWinner
      : GAME_RULES.rewards.matchParticipant;

    const coins = rewardConfig.coins;
    const candy = rewardConfig.candy;
    const xp = rewardConfig.xp;

    this.profile.coins += coins;
    this.profile.candy += candy;
    this.profile.xp += xp;

    if (isWinner) {
      this.profile.wins += 1;
    } else {
      this.profile.losses += 1;
    }

    // Check level up
    let leveledUp = false;
    let xpReq = getXpRequiredForLevel(this.profile.level);
    while (this.profile.xp >= xpReq) {
      this.profile.xp -= xpReq;
      this.profile.level += 1;
      leveledUp = true;
      // Level up bonuses
      this.profile.coins += 100 * this.profile.level;
      this.profile.candy += 20 * this.profile.level;
      xpReq = getXpRequiredForLevel(this.profile.level);
    }

    // Record history
    this.profile.matchHistory.unshift({
      id: `match_${Date.now()}`,
      timestamp: Date.now(),
      rivalName,
      result: isWinner ? 'win' : 'loss',
      score: scoreStr,
      coinsEarned: coins,
      candyEarned: candy,
      xpEarned: xp,
    });

    // Keep last 15 matches
    if (this.profile.matchHistory.length > 15) {
      this.profile.matchHistory = this.profile.matchHistory.slice(0, 15);
    }

    this.saveProfile();

    return {
      coins,
      candy,
      xp,
      leveledUp,
      newLevel: this.profile.level,
    };
  }

  public openRewardPack(): { pokemon: OwnedPokemon; coins: number; candy: number } {
    // Pick a random species from available pool
    const speciesList = ['charmander', 'squirtle', 'bulbasaur', 'pikachu', 'eevee', 'gastly', 'gible', 'lapras'];
    const randomSpeciesId = speciesList[Math.floor(Math.random() * speciesList.length)];
    const species = POKEMON_SPECIES_DB[randomSpeciesId];

    const newPokemon: OwnedPokemon = {
      ownedId: `owned_${species.id}_${Date.now()}`,
      speciesId: species.id,
      cp: species.baseCp + Math.floor(Math.random() * 40 - 20),
      acquiredAt: Date.now(),
    };

    const coinsReward = 150;
    const candyReward = 35;

    this.profile.collection.push(newPokemon);
    this.profile.coins += coinsReward;
    this.profile.candy += candyReward;

    this.saveProfile();

    return {
      pokemon: newPokemon,
      coins: coinsReward,
      candy: candyReward,
    };
  }
}

export const profileManager = new ProfileManager();
