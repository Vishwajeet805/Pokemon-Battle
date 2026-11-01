export type BattleMove={name:string;type:string;power:number;accuracy:number;pp:number;maxPp:number;category:"physical"|"special"|"status";priority?:number};
export type BattlePokemon={id:number;name:string;type:string;cp:number;maxHp:number;hp:number;speed:number;moves:BattleMove[];protected:boolean;fainted:boolean};
type MoveSeed=Omit<BattleMove,"pp"|"maxPp">;
const pool=(type:string,category:MoveSeed["category"],accuracy:number,entries:[string,number][]):MoveSeed[]=>entries.map(([name,power])=>({name,type,power,accuracy,category}));
const POOLS:Record<string,MoveSeed[]> = {
 fire:pool("fire","special",90,[["Flamethrower",90],["Fire Blast",110],["Flame Charge",50],["Heat Wave",95]]),
 water:pool("water","special",95,[["Surf",90],["Aqua Tail",90],["Water Pulse",60],["Hydro Pump",110]]),
 grass:pool("grass","physical",95,[["Energy Ball",90],["Leaf Blade",90],["Razor Leaf",55],["Power Whip",120]]),
 electric:pool("electric","special",95,[["Thunderbolt",90],["Thunder",110],["Wild Charge",90],["Electro Ball",80]]),
 psychic:pool("psychic","special",100,[["Psychic",90],["Psyshock",80],["Psybeam",65],["Future Sight",120]]),
 dragon:pool("dragon","physical",100,[["Dragon Claw",80],["Dragon Pulse",85],["Outrage",120],["Breaking Swipe",60]]),
 flying:pool("flying","physical",95,[["Air Slash",75],["Aerial Ace",60],["Brave Bird",120],["Wing Attack",60]]),
 poison:pool("poison","physical",100,[["Sludge Bomb",90],["Poison Jab",80],["Venoshock",65],["Cross Poison",70]]),
 ghost:pool("ghost","special",100,[["Shadow Ball",80],["Shadow Claw",70],["Hex",65],["Phantom Force",90]]),
 fighting:pool("fighting","physical",95,[["Aura Sphere",80],["Close Combat",120],["Brick Break",75],["Focus Blast",120]]),
 steel:pool("steel","physical",95,[["Flash Cannon",80],["Iron Head",80],["Metal Claw",50],["Meteor Mash",90]]),
 ground:pool("ground","physical",95,[["Earthquake",100],["Earth Power",90],["Bulldoze",60],["Drill Run",80]]),
 ice:pool("ice","special",90,[["Ice Beam",90],["Blizzard",110],["Ice Punch",75],["Avalanche",60]]),
 bug:pool("bug","physical",100,[["X-Scissor",80],["Bug Buzz",90],["U-turn",70],["Leech Life",80]]),
 rock:pool("rock","physical",90,[["Stone Edge",100],["Rock Slide",75],["Power Gem",80],["Rock Tomb",60]]),
 dark:pool("dark","physical",100,[["Dark Pulse",80],["Crunch",80],["Night Slash",70],["Snarl",55]]),
 fairy:pool("fairy","special",95,[["Moonblast",95],["Dazzling Gleam",80],["Play Rough",90],["Draining Kiss",50]]),
 normal:[{name:"Quick Attack",type:"normal",power:40,accuracy:100,category:"physical",priority:1},{name:"Body Slam",type:"normal",power:85,accuracy:100,category:"physical"},{name:"Swift",type:"normal",power:60,accuracy:100,category:"special"},{name:"Hyper Beam",type:"normal",power:150,accuracy:90,category:"special"}]
};
const SUPER:Record<string,string[]>={fire:["grass","ice","bug","steel"],water:["fire","ground","rock"],electric:["water","flying"],grass:["water","ground","rock"],ice:["grass","ground","flying","dragon"],fighting:["normal","ice","rock","dark","steel"],poison:["grass","fairy"],ground:["fire","electric","poison","rock","steel"],flying:["grass","fighting","bug"],psychic:["fighting","poison"],bug:["grass","psychic","dark"],rock:["fire","ice","flying","bug"],ghost:["psychic","ghost"],dragon:["dragon"],dark:["psychic","ghost"],steel:["ice","rock","fairy"],fairy:["fighting","dragon","dark"]};
const RESIST:Record<string,string[]>={normal:["rock","steel"],fire:["fire","water","rock","dragon"],water:["water","grass","dragon"],electric:["electric","grass","dragon"],grass:["fire","grass","poison","flying","bug","dragon","steel"],ice:["fire","water","ice","steel"],fighting:["poison","flying","psychic","bug","fairy"],poison:["poison","ground","rock","ghost"],ground:["grass","bug"],flying:["electric","rock","steel"],psychic:["psychic","steel"],bug:["fire","fighting","poison","flying","ghost","steel","fairy"],rock:["fighting","ground","steel"],ghost:["dark"],dragon:["steel"],dark:["fighting","dark","fairy"],steel:["fire","water","electric","steel"],fairy:["fire","poison","steel"]};
const IMMUNE:Record<string,string[]>={normal:["ghost"],electric:["ground"],fighting:["ghost"],poison:["steel"],ground:["flying"],psychic:["dark"],ghost:["normal"],dragon:["fairy"]};
export function getTypeEffectiveness(moveType:string,defenderTypes:string[]){return defenderTypes.reduce((m,t)=>{const d=t.toLowerCase(),a=moveType.toLowerCase();if((IMMUNE[a]||[]).includes(d))return 0;if((SUPER[a]||[]).includes(d))return m*2;if((RESIST[a]||[]).includes(d))return m*.5;return m;},1);}
function movesFor(types:string[]):BattleMove[]{const poolMoves=[...(POOLS[types[0]]||POOLS.normal).slice(0,2),...(POOLS[types[1]]||POOLS.normal).slice(0,1),{name:"Protect",type:"normal",power:0,accuracy:100,category:"status" as const,priority:4}];return poolMoves.map(m=>({...m,pp:m.category==="status"?10:15,maxPp:m.category==="status"?10:15}));}
export function createBattlePokemon(p:{id:number;name:string;type:string;cp:number;hp:number}):BattlePokemon{const types=p.type.split(" · ").map(t=>t.toLowerCase()),maxHp=Math.max(90,Math.round(70+p.hp*1.25+p.cp/65));return{id:p.id,name:p.name,type:p.type,cp:p.cp,maxHp,hp:maxHp,speed:Math.round(p.cp/18)+(p.id%17),moves:movesFor(types),protected:false,fainted:false};}
export function createOpponent(){return createBattlePokemon({id:150,name:"Mewtwo",type:"Psychic",cp:3210,hp:100});}
export function calculateDamage(a:BattlePokemon,d:BattlePokemon,m:BattleMove){if(m.category==="status"||m.power<=0)return{damage:0,effectiveness:1,stab:false};const effectiveness=getTypeEffectiveness(m.type,d.type.split(" · ")),stab=a.type.toLowerCase().split(" · ").includes(m.type.toLowerCase()),random=.92+Math.random()*.08,damage=effectiveness===0?0:Math.max(1,Math.floor(m.power*(.55+a.cp/4200)*(stab?1.5:1)*effectiveness*random/5));return{damage,effectiveness,stab};}
export function chooseOpponentMove(a:BattlePokemon,d:BattlePokemon){return a.moves.filter(m=>m.pp>0&&m.category!=="status").sort((x,y)=>calculateDamage(a,d,y).damage-calculateDamage(a,d,x).damage)[0]||a.moves.find(m=>m.name==="Struggle")||a.moves[0];}
export function effectivenessLabel(v:number){if(v===0)return"No effect";if(v>=4)return"Super effective ×4";if(v===2)return"Super effective";if(v===.5)return"Not very effective";if(v>0&&v<.5)return"Barely effective";return"Normal effectiveness";}

export async function fetchPokemonMoves(pokemonId:number):Promise<BattleMove[]>{
 const response=await fetch("https://pokeapi.co/api/v2/pokemon/"+pokemonId);
 if(!response.ok)throw new Error("Could not load Pokémon move list");
 const pokemon=await response.json();
 const candidates=(pokemon.moves as Array<{move:{url:string};version_group_details:Array<{level_learned_at:number;move_learn_method:{name:string}}>}>)
  .filter(entry=>entry.version_group_details.some(detail=>detail.move_learn_method.name==="level-up"))
  .sort((a,b)=>Math.max(...a.version_group_details.map(v=>v.level_learned_at))-Math.max(...b.version_group_details.map(v=>v.level_learned_at)));
 const unique=candidates.filter((entry,index,array)=>array.findIndex(other=>other.move.url===entry.move.url)===index).slice(-4).reverse();
 const moves=await Promise.all(unique.map(async entry=>{
  const data=await (await fetch(entry.move.url)).json();
  return {name:data.name.split("-").map((part:string)=>part[0]?.toUpperCase()+part.slice(1)).join(" "),type:data.type.name,power:data.power||0,accuracy:data.accuracy??100,pp:data.pp||10,maxPp:data.pp||10,category:data.damage_class.name as BattleMove["category"],priority:data.priority||0};
 }));
 return moves.length?moves:[{name:"Tackle",type:"normal",power:40,accuracy:100,pp:35,maxPp:35,category:"physical"}];
}
