# Stitch UI/UX reference — Apex Battle

This document records the visual language extracted from the supplied Stitch export. The export contains 13 screen folders, including the main dashboard, 3D battle arena, team builder, Pokédex, pack opening, gym progression, raid lobby, friends/guild hub, guild war map, alliance tech tree, booster animation and two card-inspection variants.

## Design tokens

### Core colors
- Midnight canvas: #0B0F19 / #0F131D
- Lowest surface: #0A0E18
- Surface: #111827 / #171B26
- Raised surface: #1C1F2A / #262A35
- Champion gold: #F59E0B
- Gold highlight: #FFC174 / #FBBF24
- Electric blue: #38BDF8 / #7BD0FF
- Psychic violet: #A855F7
- Grass: #10B981
- Fire: #EF4444
- Water: #06B6D4
- Electric: #FACC15

### Rarity colors
- Common: slate silver
- Rare: cobalt/cyan
- Epic: royal amethyst
- Legendary: radiant gold
- Mythical: prismatic violet/cyan/gold

### Typography
- Display and headings: Outfit (600–800)
- Interface and body: Plus Jakarta Sans (400–700)
- HP, XP, counters and battle telemetry: JetBrains Mono (500–700)

### Layout and components
- Desktop application shell with persistent left navigation and top resource bar.
- Dark mechanical surfaces, fine borders, restrained glow and beveled gold primary actions.
- Collectible cards use 3:4 or 5:7 proportions and rarity-specific frames.
- HP/XP gauges use segmented or clearly bounded bars with numeric telemetry.
- Battle arena uses a wide cinematic stage; action controls stay in a clear lower command area.
- Mobile layouts collapse the sidebar and reorganize grids instead of simply shrinking desktop layouts.

## Screen references

1. Main game dashboard
2. 3D battle arena
3. Team builder / synergy lab
4. Card pack opening reveal
5. Pokédex database inspection
6. Gym challenges and progression map
7. Raid bosses / world event lobby
8. Friends, guild and clan hub
9. Guild war tactical battlefront
10. Guild technology tree / alliance perks
11. Booster pack opening animation
12. Charizard VMAX alternate-art inspection variant A
13. Charizard VMAX alternate-art inspection variant B

## Interaction principles

- All navigation items should open a meaningful screen.
- Every primary action should have a defined outcome and feedback state.
- Team selection must enforce a maximum of six Pokémon.
- Pack opening must validate currency, show the reveal and add cards to the collection.
- Battle commands must visibly update battle state and communicate the result.
- Destructive actions require confirmation.
- Loading, empty, error, disabled and success states are part of the design—not afterthoughts.

## Implementation boundaries

The Stitch export is a visual and interaction reference, not a source of game data or backend logic. Pokémon identity, stats, moves, evolution chains and types should come from PokeAPI or a validated game-data layer. Player-owned cards, currencies, teams and results must eventually be stored server-side. Do not treat sample values in a mockup as real player data.
