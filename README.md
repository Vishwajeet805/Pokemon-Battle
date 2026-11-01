# Pokémon Battle

A browser-based Pokémon fan-game prototype combining a premium collectible-card interface with a 3D-inspired turn-based battle experience.

## Tech stack

- Next.js App Router, React 19 and TypeScript
- Three.js, React Three Fiber and Drei for the battle scene
- PokeAPI for National Pokédex data
- PokeAPI community sprite repository for official-artwork sprite URLs
- Responsive custom CSS design system based on the Stitch Apex Battle export

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Current implementation

- Stitch-inspired dark navy, champion gold and electric blue application shell
- Responsive sidebar navigation and trainer resource header
- Trainer dashboard with squad preview, XP, objectives and daily reward interaction
- Live National Pokédex index loaded from PokeAPI, search and Pokémon detail inspection
- Collection binder with rarity-based card styling
- Six-slot team builder with add/remove validation and team power summary
- Practice battle screen with active Pokémon switching, move actions, HP updates and victory state
- Pack store with coin deduction, card reveal and collection additions
- Gym progression, raid event, friends, guild and alliance research screens
- Responsive layouts for desktop, tablet and mobile

## Important implementation notes

- The current economy, trainer identity, collection and battle state are client-side prototype state. They are not yet backed by authentication or a database.
- The practice battle is a UI/interaction prototype, not the final competitive battle engine. Type effectiveness, move PP, status conditions, turn resolution and opponent AI are future gameplay-engine work.
- Pokémon artwork URLs currently use the PokeAPI sprites GitHub repository. Verify asset terms and permissions before public distribution or monetization.
- Pokémon and related characters, names, artwork and marks belong to their respective rights holders. This project is an unofficial fan-made prototype.

## Design reference

The Stitch design reference is documented in [docs/STITCH-DESIGN-SYSTEM.md](docs/STITCH-DESIGN-SYSTEM.md).

## Next milestones

1. Refine every screen against the remaining Stitch exports.
2. Add complete card data, rarity rules, movesets and evolution requirements.
3. Implement a deterministic turn-based battle engine and type effectiveness.
4. Add persistent player accounts, collections, teams and rewards.
5. Build gyms, raids, matchmaking and real-time multiplayer services.
6. Add licensed/appropriately sourced 3D Pokémon models with an asset provenance registry.
