import { Creature } from '../types/game';
import { POKEMON_SPECIES_DB } from './pokemonFamilies';

export function speciesToCreature(speciesId: string, ownedId?: string, customCp?: number): Creature {
  const s = POKEMON_SPECIES_DB[speciesId] || POKEMON_SPECIES_DB['bulbasaur'];
  const cp = customCp || s.baseCp;

  // Scale HP slightly with CP progression
  const hpBonus = Math.floor((cp - s.baseCp) * 0.05);
  const maxHp = s.baseHp + hpBonus;

  return {
    id: ownedId || s.id,
    speciesId: s.id,
    ownedId: ownedId || `owned_${s.id}`,
    name: s.name,
    title: s.title,
    primaryType: s.primaryType,
    secondaryType: s.secondaryType,
    hp: maxHp,
    maxHp: maxHp,
    attack: s.baseAttack,
    defense: s.baseDefense,
    speed: s.baseSpeed,
    specialAttack: s.baseSpecialAttack,
    specialDefense: s.baseSpecialDefense,
    cp: cp,
    stage: s.stage,
    familyId: s.familyId,
    artwork: s.artwork,
    moves: s.moves,
    lore: s.lore,
  };
}

// Default roster for quick battles, sparring bot, and fallbacks
export const CREATURE_ROSTER: Creature[] = [
  speciesToCreature('charizard'),
  speciesToCreature('blastoise'),
  speciesToCreature('venusaur'),
  speciesToCreature('raichu'),
  speciesToCreature('gengar'),
  speciesToCreature('garchomp'),
  speciesToCreature('vaporeon'),
  speciesToCreature('jolteon'),
  speciesToCreature('flareon'),
  speciesToCreature('espeon'),
  speciesToCreature('umbreon'),
  speciesToCreature('lapras'),
  speciesToCreature('mewtwo'),
  speciesToCreature('pikachu'),
  speciesToCreature('eevee'),
];
