/**
 * Medallion-style battle rules engine.
 *
 * Core loop: six-medallion teams, simultaneous hidden picks, reveal,
 * one-shot powers, CP comparison, and first-to-three points.
 * Power magnitudes are data-driven so archived game values can be tuned
 * without rewriting turn resolution.
 */

export type MedalTier = "poke" | "great" | "ultra";
export type MedalPowerKind =
  | "arena"
  | "clearance"
  | "entry"
  | "priority"
  | "protect"
  | "reveal"
  | "super-effective"
  | "support";

export interface MedalPower {
  id: string;
  kind: MedalPowerKind;
  /** Optional type or tier restriction for Arena/Super Effective powers. */
  target?: string;
  /** Percentage CP modifier, e.g. 20 means +20%. */
  percent?: number;
  /** Number of opponent turns affected by Entry/Support. Defaults to 1. */
  duration?: number;
}

export interface BattleMedal {
  id: string;
  pokemonId: number;
  name: string;
  cp: number;
  tier: MedalTier;
  evolutionFamily: string;
  legendary?: boolean;
  types: string[];
  powers: MedalPower[];
}

export interface MedalTeam {
  playerId: string;
  rating: number;
  medals: BattleMedal[];
}

export interface BattleSideState {
  playerId: string;
  bench: BattleMedal[];
  score: number;
  usedPowerIds: string[];
  /** Temporary CP modifiers, consumed/expired by round count. */
  modifiers: Array<{ percent: number; remainingRounds: number; source: string }>;
}

export interface PendingRound {
  round: number;
  firstPlayerId: string;
  picks: Record<string, string>;
}

export interface MedallionMatch {
  id: string;
  status: "selecting" | "complete";
  winnerId?: string;
  sides: [BattleSideState, BattleSideState];
  round: PendingRound;
  history: RoundResult[];
  revealedBench: Record<string, string[]>;
}

export interface RoundResult {
  round: number;
  firstPlayerId: string;
  picks: Record<string, string>;
  effectiveCp: Record<string, number>;
  pointWinnerId?: string;
  outcome: "point" | "protect" | "draw";
  activatedPowers: Array<{ playerId: string; medalId: string; powerId: string; kind: MedalPowerKind; message: string }>;
}

export type TeamValidation =
  | { valid: true }
  | { valid: false; errors: string[] };

const POWER_ORDER: MedalPowerKind[] = [
  "clearance",
  "priority",
  "arena",
  "entry",
  "super-effective",
  "reveal",
  "support",
  "protect",
];

export function validateMedallionTeam(
  medals: BattleMedal[],
  maxGreatOrUltra = 2,
): TeamValidation {
  const errors: string[] = [];
  if (medals.length !== 6) errors.push("A battle team must contain exactly six Pokémon.");
  if (new Set(medals.map((m) => m.id)).size !== medals.length) errors.push("A Pokémon medal cannot appear twice.");
  const premiumCount = medals.filter((m) => m.tier === "great" || m.tier === "ultra").length;
  if (premiumCount > maxGreatOrUltra) errors.push(`Only ${maxGreatOrUltra} Great Ball or Ultra Ball medals are allowed.`);
  const families = new Set<string>();
  for (const medal of medals) {
    if (families.has(medal.evolutionFamily)) errors.push(`Only one Pokémon from the ${medal.evolutionFamily} evolution line is allowed.`);
    families.add(medal.evolutionFamily);
  }
  if (medals.filter((m) => m.legendary).length > 2) errors.push("A team can contain no more than two Legendary Pokémon.");
  return errors.length ? { valid: false, errors } : { valid: true };
}

function side(team: MedalTeam): BattleSideState {
  return {
    playerId: team.playerId,
    // Lower CP is deployed first, matching the visible bench ordering.
    bench: [...team.medals].sort((a, b) => a.cp - b.cp),
    score: 0,
    usedPowerIds: [],
    modifiers: [],
  };
}

export function createMedallionMatch(
  id: string,
  first: MedalTeam,
  second: MedalTeam,
  maxGreatOrUltra = 2,
): MedallionMatch {
  if (first.playerId === second.playerId) throw new Error("Players must have different IDs.");
  for (const team of [first, second]) {
    const validation = validateMedallionTeam(team.medals, maxGreatOrUltra);
    if (!validation.valid) throw new Error(`${team.playerId}: ${validation.errors.join(" ")}`);
  }
  const firstPlayerId = first.rating >= second.rating ? first.playerId : second.playerId;
  return {
    id,
    status: "selecting",
    sides: [side(first), side(second)],
    round: { round: 1, firstPlayerId, picks: {} },
    history: [],
    revealedBench: {},
  };
}

function getSide(match: MedallionMatch, playerId: string): BattleSideState {
  const found = match.sides.find((s) => s.playerId === playerId);
  if (!found) throw new Error("Player is not part of this match.");
  return found;
}

function activePower(medal: BattleMedal, sideState: BattleSideState): MedalPower[] {
  return medal.powers.filter((power) => !sideState.usedPowerIds.includes(power.id));
}

function effectiveCp(medal: BattleMedal, sideState: BattleSideState): number {
  const multiplier = sideState.modifiers.reduce((value, mod) => value * (1 + mod.percent / 100), 1);
  return Math.max(1, Math.floor(medal.cp * multiplier));
}

function addPowerResult(
  results: RoundResult["activatedPowers"],
  playerId: string,
  medal: BattleMedal,
  power: MedalPower,
  message: string,
): void {
  results.push({ playerId, medalId: medal.id, powerId: power.id, kind: power.kind, message });
}

function pickPower(
  medal: BattleMedal,
  sideState: BattleSideState,
  kind: MedalPowerKind,
): MedalPower | undefined {
  return activePower(medal, sideState).find((power) => power.kind === kind);
}

/** Submit one hidden pick. Resolution happens only after both players submit. */
export function submitMedallionPick(
  match: MedallionMatch,
  playerId: string,
  medalId: string,
  random: () => number = Math.random,
): MedallionMatch {
  if (match.status !== "selecting") throw new Error("This match is already complete.");
  const playerSide = getSide(match, playerId);
  if (match.round.picks[playerId]) throw new Error("This player has already selected a medal this round.");
  const medal = playerSide.bench.find((item) => item.id === medalId);
  if (!medal) throw new Error("Selected medal is not available on this player's bench.");

  const next: MedallionMatch = {
    ...match,
    sides: match.sides.map((s) => ({ ...s, bench: [...s.bench], usedPowerIds: [...s.usedPowerIds], modifiers: [...s.modifiers] })) as [BattleSideState, BattleSideState],
    round: { ...match.round, picks: { ...match.round.picks, [playerId]: medalId } },
    revealedBench: { ...match.revealedBench },
    history: [...match.history],
  };
  if (Object.keys(next.round.picks).length < 2) return next;
  return resolveMedallionRound(next, random);
}

export function resolveMedallionRound(
  match: MedallionMatch,
  random: () => number = Math.random,
): MedallionMatch {
  if (Object.keys(match.round.picks).length !== 2) throw new Error("Both players must choose a medal before reveal.");
  const sides = match.sides;
  const firstSide = getSide(match, match.round.firstPlayerId);
  const secondSide = sides.find((s) => s.playerId !== firstSide.playerId)!;
  const selected = sides.map((s) => ({
    side: s,
    medal: s.bench.find((m) => m.id === match.round.picks[s.playerId])!,
  }));
  const activated: RoundResult["activatedPowers"] = [];
  const cp: Record<string, number> = {};
  let protectedRound = false;
  const cleared = new Set<string>();

  const activate = (entry: typeof selected[number], power: MedalPower, message: string) => {
    entry.side.usedPowerIds.push(power.id);
    addPowerResult(activated, entry.side.playerId, entry.medal, power, message);
  };

  // Resolve each power class in the documented activation order.
  for (const kind of POWER_ORDER) {
    for (const entry of selected) {
      const power = pickPower(entry.medal, entry.side, kind);
      if (!power) continue;
      const opponent = selected.find((other) => other.side.playerId !== entry.side.playerId)!;
      switch (kind) {
        case "clearance": {
          activate(entry, power, "Cleared active Entry and Support effects.");
          for (const sideState of sides) {
            sideState.modifiers = sideState.modifiers.filter((m) => !m.source.startsWith("entry:") && !m.source.startsWith("support:"));
          }
          cleared.add(entry.side.playerId);
          break;
        }
        case "priority":
          activate(entry, power, "Priority power activated before other powers.");
          break;
        case "arena": {
          const applies = !power.target || entry.medal.types.includes(power.target) || entry.medal.tier === power.target;
          if (applies) {
            const percent = power.percent ?? 20;
            entry.side.modifiers.push({ percent, remainingRounds: power.duration ?? 99, source: "arena:" + power.id });
            activate(entry, power, `Arena power: +${percent}% CP.`);
          }
          break;
        }
        case "entry": {
          if (cleared.has(opponent.side.playerId)) break;
          const percent = -(power.percent ?? 20);
          opponent.side.modifiers.push({ percent, remainingRounds: power.duration ?? 1, source: "entry:" + power.id });
          activate(entry, power, `Entry power: opponent CP ${percent}%.`);
          break;
        }
        case "super-effective": {
          const applies = !power.target || opponent.medal.types.includes(power.target) || opponent.medal.tier === power.target;
          if (applies) {
            const percent = power.percent ?? 30;
            entry.side.modifiers.push({ percent, remainingRounds: 1, source: "super-effective:" + power.id });
            activate(entry, power, `Super Effective power: +${percent}% CP against ${power.target ?? "opponent"}.`);
          }
          break;
        }
        case "reveal": {
          const hidden = opponent.side.bench;
          if (hidden.length) {
            const index = Math.min(hidden.length - 1, Math.floor(random() * hidden.length));
            const revealed = hidden[index];
            match.revealedBench[opponent.side.playerId] = [
              ...(match.revealedBench[opponent.side.playerId] ?? []),
              revealed.id,
            ];
            activate(entry, power, `Revealed an opposing bench medal: ${revealed.name}.`);
          }
          break;
        }
        case "support": {
          if (cleared.has(entry.side.playerId)) break;
          const percent = power.percent ?? 20;
          entry.side.modifiers.push({ percent, remainingRounds: power.duration ?? 1, source: "support:" + power.id });
          activate(entry, power, `Support power: next CP +${percent}%.`);
          break;
        }
        case "protect": {
          const ownCp = effectiveCp(entry.medal, entry.side);
          const rivalCp = effectiveCp(opponent.medal, opponent.side);
          if (ownCp < rivalCp) {
            activate(entry, power, "Protect returned both medals to their benches; this player leads next round.");
            protectedRound = true;
          }
          break;
        }
      }
    }
  }

  for (const entry of selected) cp[entry.side.playerId] = effectiveCp(entry.medal, entry.side);

  let pointWinnerId: string | undefined;
  let outcome: RoundResult["outcome"] = "draw";
  if (protectedRound) {
    outcome = "protect";
  } else {
    const [a, b] = selected;
    if (cp[a.side.playerId] > cp[b.side.playerId]) pointWinnerId = a.side.playerId;
    else if (cp[b.side.playerId] > cp[a.side.playerId]) pointWinnerId = b.side.playerId;
    else pointWinnerId = match.round.firstPlayerId; // first player wins ties
    outcome = "point";
    getSide(match, pointWinnerId).score += 1;
    for (const entry of selected) entry.side.bench = entry.side.bench.filter((m) => m.id !== entry.medal.id);
  }

  // Temporary effects tick down after the resolved comparison.
  for (const sideState of sides) {
    sideState.modifiers = sideState.modifiers
      .map((mod) => ({ ...mod, remainingRounds: mod.remainingRounds - 1 }))
      .filter((mod) => mod.remainingRounds > 0);
  }

  const result: RoundResult = {
    round: match.round.round,
    firstPlayerId: match.round.firstPlayerId,
    picks: { ...match.round.picks },
    effectiveCp: cp,
    pointWinnerId,
    outcome,
    activatedPowers: activated,
  };
  const winner = sides.find((s) => s.score >= 3);
  const remaining = sides.every((s) => s.bench.length === 0);
  const nextFirst = outcome === "protect" ? selected.find((e) => e.medal.powers.some((p) => p.kind === "protect" && e.side.usedPowerIds.includes(p.id)))!.side.playerId
    : pointWinnerId ?? match.round.firstPlayerId;

  return {
    ...match,
    status: winner || remaining ? "complete" : "selecting",
    winnerId: winner?.playerId ?? (remaining ? sides.sort((a, b) => b.score - a.score)[0].playerId : undefined),
    round: {
      round: match.round.round + 1,
      firstPlayerId: nextFirst,
      picks: {},
    },
    history: [...match.history, result],
  };
}
