"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { calculateDamage, chooseOpponentMove, createBattlePokemon, createOpponent, effectivenessLabel, type BattleMove, type BattlePokemon } from "./battle-engine";
import {
  Activity, Bell, BookOpen, Check, ChevronDown, ChevronRight, Coins, Crown,
  Flame, Gem, Gift, Grid2X2, Home, Menu, PackageOpen,
  Search, Settings, Shield, ShoppingBag, Sparkles, Swords, Trophy, Users,
  X, Zap, Plus, Star, ArrowUpRight, Lock
} from "lucide-react";

const BattleScene = dynamic(() => import("./battle-scene"), {
  ssr: false,
  loading: () => <div className="battle-scene-loading">Preparing arena...</div>,
});

const ART = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";
type Pokemon = { id: number; name: string; type: string; cp: number; hp: number; rarity: string; };
type Screen = "dashboard" | "pokedex" | "collection" | "team" | "battle" | "packs" | "gyms" | "raids" | "friends" | "guild" | "tech" | "profile";

const roster: Pokemon[] = [
  {id:6,name:"Charizard",type:"Fire · Flying",cp:2840,hp:100,rarity:"Legendary"},
  {id:25,name:"Pikachu",type:"Electric",cp:1920,hp:92,rarity:"Rare"},
  {id:9,name:"Blastoise",type:"Water",cp:2630,hp:96,rarity:"Epic"},
  {id:3,name:"Venusaur",type:"Grass · Poison",cp:2510,hp:88,rarity:"Epic"},
  {id:94,name:"Gengar",type:"Ghost · Poison",cp:2380,hp:84,rarity:"Epic"},
  {id:150,name:"Mewtwo",type:"Psychic",cp:3210,hp:100,rarity:"Mythical"},
  {id:149,name:"Dragonite",type:"Dragon · Flying",cp:2760,hp:93,rarity:"Legendary"},
  {id:130,name:"Gyarados",type:"Water · Flying",cp:2670,hp:89,rarity:"Rare"},
  {id:448,name:"Lucario",type:"Fighting · Steel",cp:2580,hp:91,rarity:"Epic"},
  {id:197,name:"Umbreon",type:"Dark",cp:2240,hp:95,rarity:"Rare"},
  {id:384,name:"Rayquaza",type:"Dragon · Flying",cp:3400,hp:100,rarity:"Mythical"},
  {id:249,name:"Lugia",type:"Psychic · Flying",cp:3150,hp:100,rarity:"Legendary"},
  {id:445,name:"Garchomp",type:"Dragon · Ground",cp:2980,hp:96,rarity:"Legendary"},
  {id:59,name:"Arcanine",type:"Fire",cp:2310,hp:90,rarity:"Rare"},
  {id:131,name:"Lapras",type:"Water · Ice",cp:2190,hp:98,rarity:"Epic"},
  {id:282,name:"Gardevoir",type:"Psychic · Fairy",cp:2460,hp:87,rarity:"Epic"},
  {id:448,name:"Lucario",type:"Fighting · Steel",cp:2580,hp:91,rarity:"Epic"},
  {id:778,name:"Mimikyu",type:"Ghost · Fairy",cp:2180,hp:86,rarity:"Rare"},
];

const navGroups = [
  { label: "Main Activities", items: [
    { id:"dashboard" as Screen, label:"Dashboard", icon:Home, meta:"HOME" },
    { id:"battle" as Screen, label:"Battle Arena", icon:Swords, meta:"LIVE" },
    { id:"pokedex" as Screen, label:"Pokédex", icon:BookOpen, meta:"1,025" },
    { id:"collection" as Screen, label:"Collection", icon:Grid2X2, meta:"BINDER" },
    { id:"team" as Screen, label:"Team Builder", icon:Users, meta:"6 SLOTS" },
  ]},
  { label: "Gameplay Modes", items: [
    { id:"packs" as Screen, label:"Card Packs", icon:PackageOpen, meta:"STORE" },
    { id:"gyms" as Screen, label:"Gym Challenges", icon:Shield, meta:"7/8" },
    { id:"raids" as Screen, label:"Raid Bosses", icon:Zap, meta:"EVENT" },
  ]},
  { label: "Social & Progress", items: [
    { id:"friends" as Screen, label:"Friends & Party", icon:Users, meta:"5 ONLINE" },
    { id:"guild" as Screen, label:"Guild Hub", icon:Crown, meta:"GUILD" },
    { id:"tech" as Screen, label:"Alliance Perks", icon:Activity, meta:"TREE" },
  ]},
];

const screenTitles: Record<Screen, { title:string; eyebrow:string; subtitle:string }> = {
  dashboard:{title:"Trainer Command Center",eyebrow:"Season 04 · Apex Evolution",subtitle:"Your next legendary moment starts here. Prepare your squad and enter the arena."},
  pokedex:{title:"National Pokédex Archive",eyebrow:"Field Research · Generations 1–9",subtitle:"Search Pokémon, inspect their details and discover your next team member."},
  collection:{title:"Your Card Collection",eyebrow:"Personal Binder · Digital Vault",subtitle:"Every discovery tells a story. Inspect, sort and celebrate your collection."},
  team:{title:"Team Synergy Lab",eyebrow:"Squad Management · 6 Slots",subtitle:"Build a balanced six-Pokémon lineup before entering competitive play."},
  battle:{title:"Battle Arena",eyebrow:"Live Combat · Turn Based",subtitle:"Read the field, choose your move and outplay your opponent."},
  packs:{title:"Booster Pack Foundry",eyebrow:"Card Store · New Drops",subtitle:"Choose a pack, reveal its contents and expand your collection."},
  gyms:{title:"Champion's Road",eyebrow:"League Progression · Kanto Circuit",subtitle:"Challenge gym leaders, earn badges and unlock the next stage."},
  raids:{title:"World Event: Raid Bosses",eyebrow:"Cooperative Encounter · Limited Event",subtitle:"Join the event, prepare your strongest squad and take on a colossal boss."},
  friends:{title:"Friends & Party Hub",eyebrow:"Social Network · Trainer Connections",subtitle:"Find fellow trainers, build a party and challenge friends."},
  guild:{title:"Trainer Alliance Guild",eyebrow:"Community Operations · Guild HQ",subtitle:"Coordinate your alliance, review activity and contribute to shared goals."},
  tech:{title:"Alliance Tech Tree",eyebrow:"Guild Research · Shared Perks",subtitle:"Contribute research points to unlock permanent alliance advantages."},
  profile:{title:"Trainer Profile",eyebrow:"Identity · Records · Settings",subtitle:"Review your trainer record and personalize your game experience."},
};

function PokemonArt({ pokemon, size=100, className="" }: { pokemon:Pokemon; size?:number; className?:string }) {
  return <Image src={ART + pokemon.id + ".png"} alt={pokemon.name} width={size} height={size} unoptimized className={className} />;
}
function TypeBadge({type}:{type:string}) {
  const key=type.split(" · ")[0].toLowerCase();
  return <span className={"type-badge type-"+key}>{type}</span>;
}
function Rarity({value}:{value:string}) { return <span className={"rarity-tag rarity-"+value.toLowerCase()}>{value}</span>; }

export default function GameClient() {
  const [screen,setScreen]=useState<Screen>("dashboard");
  const [mobileNav,setMobileNav]=useState(false);
  const [toast,setToast]=useState("");
  const [coins,setCoins]=useState(48250);
  const [gems]=useState(1420);
  const [selectedTeam,setSelectedTeam]=useState<number[]>([6,9,3,94,150,448]);
  const [activePokemon,setActivePokemon]=useState(6);
  const [search,setSearch]=useState("");
  const [typeFilter,setTypeFilter]=useState("All Pokémon");
  const [pokedex,setPokedex]=useState<{id:number;name:string}[]>([]);
  const [dexLoaded,setDexLoaded]=useState(false);
  const [dexLoading,setDexLoading]=useState(false);
  const [dexError,setDexError]=useState("");
  const [dexDetail,setDexDetail]=useState<any>(null);
  const [owned,setOwned]=useState<number[]>([6,25,9,3,94,150,149,130,448,197,384,249]);
  const [packReveal,setPackReveal]=useState(false);
  const [revealed,setRevealed]=useState<Pokemon[]>([]);
  const [claimed,setClaimed]=useState(false);
  const [activeTab,setActiveTab]=useState("All Cards");

  const team=useMemo(()=>selectedTeam.map(id=>roster.find(p=>p.id===id)).filter(Boolean) as Pokemon[],[selectedTeam]);
  const active=roster.find(p=>p.id===activePokemon) || roster[0];
  const title=screenTitles[screen];

  function notify(message:string) {
    setToast(message);
    window.setTimeout(()=>setToast(""),2800);
  }
  function navigate(next:Screen) {
    setScreen(next);
    setMobileNav(false);
    setSearch("");
  }
  function toggleTeam(id:number) {
    setSelectedTeam(old=>{
      if(old.includes(id)) return old.filter(x=>x!==id);
      if(old.length>=6) { notify("Your team is full. Remove a Pokémon before adding another."); return old; }
      return [...old,id];
    });
  }

  function openPack(packName:string) {
    if(coins<1200) { notify("Not enough coins for this pack."); return; }
    setCoins(v=>v-1200);
    const picks=[roster[(turn+1)%roster.length],roster[(turn+4)%roster.length],roster[(turn+6)%roster.length],roster[(turn+8)%roster.length],roster[(turn+10)%roster.length]];
    setRevealed(picks);
    setPackReveal(true);
    setOwned(old=>Array.from(new Set([...old,...picks.map(p=>p.id)])));
    notify(packName+" opened. Five cards added to your binder.");
  }

  useEffect(()=>{
    if(screen!=="pokedex" || dexLoaded || dexLoading) return;
    setDexLoading(true);
    fetch("https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0")
      .then(r=>{if(!r.ok) throw new Error("Pokédex service is unavailable"); return r.json();})
      .then(data=>{
        const entries=data.results.map((item:{name:string;url:string})=>({id:Number(item.url.split("/").filter(Boolean).pop()),name:item.name}));
        setPokedex(entries);
        setDexLoaded(true);
        setDexError("");
      })
      .catch(()=>setDexError("Could not load the live Pokédex. Check your connection and try again."))
      .finally(()=>setDexLoading(false));
  },[screen,dexLoaded,dexLoading]);

  async function inspectPokemon(id:number) {
    setDexDetail({loading:true,id});
    try {
      const response=await fetch("https://pokeapi.co/api/v2/pokemon/"+id);
      if(!response.ok) throw new Error("Unable to load Pokémon details");
      const data=await response.json();
      setDexDetail({
        id:data.id,name:data.name,types:data.types.map((t:any)=>t.type.name),
        height:data.height,weight:data.weight,
        stats:data.stats.map((s:any)=>({name:s.stat.name,value:s.base_stat})),
        abilities:data.abilities.map((a:any)=>a.ability.name),
      });
    } catch { setDexDetail({id,name:"Unavailable",error:true}); }
  }

  const visibleDex=(pokedex.length?pokedex:roster.map(p=>({id:p.id,name:p.name.toLowerCase()})))
    .filter(p=>p.name.includes(search.toLowerCase().trim()) || String(p.id).includes(search.trim()))
    .slice(0,72);
  const visibleCollection=roster.filter(p=>owned.includes(p.id) && (activeTab==="All Cards" || (activeTab==="Legendary" ? ["Legendary","Mythical"].includes(p.rarity) : p.rarity===activeTab)));

  return <div className="app-frame">
    <header className="global-topbar">
      <button className="mobile-menu" onClick={()=>setMobileNav(v=>!v)} aria-label="Toggle navigation">{mobileNav?<X/>:<Menu/>}</button>
      <button className="brand-lockup" onClick={()=>navigate("dashboard")}><span className="brand-emblem">◉</span><span><b>POKÉMON <i>BATTLE</i></b><small>TRAIN · COLLECT · CONQUER</small></span></button>
      <div className="season-chip"><span/> SEASON 04: APEX EVOLUTION</div>
      <div className="topbar-right">
        <div className="currency-chip"><Coins size={15}/><b>{coins.toLocaleString("en-US")}</b><button onClick={()=>navigate("packs")} aria-label="Get coins"><Plus size={13}/></button></div>
        <div className="currency-chip gem-chip"><Gem size={15}/><b>{gems.toLocaleString("en-US")}</b></div>
        <div className="level-chip"><Crown size={15}/><b>LVL 64</b><span><i/></span><small>82% XP</small></div>
        <button className="icon-button" onClick={()=>notify("You're all caught up on notifications.")} aria-label="Notifications"><Bell size={17}/><em/></button>
        <button className="trainer-chip" onClick={()=>navigate("profile")}><span className="trainer-avatar">R</span><span><b>Champion Red_Apex</b><small>3,480 ELO · Master IV</small></span><ChevronDown size={14}/></button>
      </div>
    </header>

    <aside className={"sidebar "+(mobileNav?"sidebar-open":"")}>
      <div className="sidebar-scroll">
        {navGroups.map(group=><div className="nav-group" key={group.label}>
          <div className="nav-label">{group.label}</div>
          {group.items.map(item=>{
            const Icon=item.icon;
            return <button key={item.id} className={"nav-item "+(screen===item.id?"nav-active":"")} onClick={()=>navigate(item.id)}>
              <Icon size={17}/><span>{item.label}</span><small>{item.meta}</small>
            </button>;
          })}
        </div>)}
      </div>
      <div className="sidebar-bottom"><div className="league-card"><div className="league-icon"><Trophy size={20}/></div><div><b>Kanto League</b><small>Champion tier · 7/8 badges</small></div></div><button className="nav-item" onClick={()=>navigate("profile")}><Settings size={17}/><span>Settings & Profile</span><ChevronRight size={14}/></button><div className="sidebar-version">POKÉMON BATTLE · BUILD 0.2.0</div></div>
    </aside>

    <main className="main-content">
      <div className="page-heading"><div><div className="eyebrow">{title.eyebrow}</div><h1>{title.title}</h1><p>{title.subtitle}</p></div><div className="heading-actions"><span className="connection-pill"><i/> GAME SYSTEMS ONLINE</span><button className="outline-button" onClick={()=>notify("Trainer guide is coming in the next update.")}> <BookOpen size={14}/> Guide</button></div></div>

      {screen==="dashboard" && <Dashboard team={team} owned={owned.length} coins={coins} claimed={claimed} onClaim={()=>{if(!claimed){setCoins(v=>v+500);setClaimed(true);notify("Daily reward claimed: +500 coins.");}}} onNavigate={navigate} onToast={notify}/>}
      {screen==="pokedex" && <section className="panel-stack">
        <div className="panel toolbar-panel"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by Pokémon name or number..."/></div><select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}><option>All Pokémon</option><option>Owned</option><option>Unowned</option></select><span className="result-count">{pokedex.length? "1,025": "Featured"} ENTRIES</span></div>
        {dexLoading&&<div className="panel loading-panel"><Sparkles className="spin-icon"/> Connecting to PokéAPI and loading the National Pokédex...</div>}
        {dexError&&<div className="panel error-panel">{dexError}<button className="outline-button" onClick={()=>{setDexLoaded(false);setDexError("");}}>Retry</button></div>}
        <div className="dex-grid">{visibleDex.map(p=>{
          const mon=roster.find(m=>m.id===p.id);
          const isOwned=owned.includes(p.id);
          if(typeFilter==="Owned"&&!isOwned) return null;
          if(typeFilter==="Unowned"&&isOwned) return null;
          return <button className={"dex-card "+(!isOwned?"dex-unowned":"")} key={p.id} onClick={()=>inspectPokemon(p.id)}><span className="dex-number">#{String(p.id).padStart(4,"0")}</span><img src={ART+p.id+".png"} alt={p.name} loading="lazy"/><b>{p.name.replace(/-/g," ")}</b><small>{mon?.type||"Pokémon species"}</small><span className="dex-owned">{isOwned?"IN BINDER":"UNDISCOVERED"}</span></button>;
        })}</div>
        {!dexLoading&&visibleDex.length===0&&<div className="empty-panel">No Pokémon matched your search.</div>}
        {dexDetail&&<div className="modal-backdrop" onClick={()=>setDexDetail(null)}><div className="detail-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setDexDetail(null)}><X/></button>{dexDetail.loading?<div className="loading-panel">Loading Pokémon data...</div>:<><div className="detail-art"><img src={ART+dexDetail.id+".png"} alt={dexDetail.name}/></div><div className="detail-content"><div className="eyebrow">NATIONAL POKÉDEX #{dexDetail.id}</div><h2>{dexDetail.name?.replace(/-/g," ")}</h2>{dexDetail.error?<p>Pokémon details could not be loaded.</p>:<><div className="type-row">{dexDetail.types?.map((t:string)=><TypeBadge key={t} type={t}/>)}</div><div className="detail-facts"><span>HEIGHT <b>{(dexDetail.height/10).toFixed(1)} m</b></span><span>WEIGHT <b>{(dexDetail.weight/10).toFixed(1)} kg</b></span></div><h3>BASE STATS</h3>{dexDetail.stats?.map((s:any)=><div className="stat-line" key={s.name}><span>{s.name.replace("-"," ")}</span><b>{s.value}</b><i><em style={{width:Math.min(100,s.value/2)+"%"}}/></i></div>)}<p className="ability-line">Abilities: {dexDetail.abilities?.join(", ")}</p></>}</div></>}</div></div>}
      </section>}

      {screen==="collection"&&<section className="panel-stack"><div className="panel collection-toolbar"><div><b>{owned.length} / 1,025</b><small>DISCOVERED SPECIES</small></div><div className="tab-row">{["All Cards","Rare","Epic","Legendary"].map(t=><button key={t} className={activeTab===t?"tab-active":""} onClick={()=>setActiveTab(t)}>{t}</button>)}</div></div><div className="collectible-grid">{visibleCollection.map(p=><PokemonCard key={p.id} pokemon={p} onClick={()=>{setActivePokemon(p.id);notify(p.name+" selected in your collection.");}}/>)}</div></section>}

      {screen==="team"&&<section className="team-builder-layout"><div className="panel team-board"><div className="section-heading"><div><h2>ACTIVE SQUAD</h2><p>Select up to six Pokémon for your battle formation.</p></div><span className="team-counter">{selectedTeam.length}/6</span></div><div className="team-slots">{Array.from({length:6}).map((_,i)=>{const p=team[i];return <div className={"team-slot "+(p?"slot-filled":"")} key={i}>{p?<><button className="slot-remove" onClick={()=>toggleTeam(p.id)} aria-label={"Remove "+p.name}><X size={13}/></button><PokemonArt pokemon={p} size={112}/><b>{p.name}</b><small>{p.type}</small><Rarity value={p.rarity}/></>:<><Plus size={22}/><b>EMPTY SLOT</b><small>Choose a Pokémon</small></>}</div>;})}</div><div className="team-footer"><div><small>TEAM POWER</small><b>{team.reduce((n,p)=>n+p.cp,0).toLocaleString("en-US")} CP</b></div><button className="gold-button" disabled={selectedTeam.length!==6} onClick={()=>notify("Six-Pokémon lineup saved for this session.")}><Check size={15}/> SAVE TEAM</button></div></div><div className="panel roster-panel"><div className="section-heading"><div><h2>AVAILABLE POKÉMON</h2><p>Choose from your discovered roster.</p></div><span>{roster.length} SPECIES</span></div><div className="mini-roster">{roster.map(p=><button key={p.id} className={"mini-mon "+(selectedTeam.includes(p.id)?"mini-selected":"")} onClick={()=>toggleTeam(p.id)}><PokemonArt pokemon={p} size={56}/><span><b>{p.name}</b><small>{p.type}</small></span>{selectedTeam.includes(p.id)?<Check size={16}/>:<Plus size={16}/>}</button>)}</div></div></section>}

      {screen==="battle"&&<BattleView key={screen} active={active} team={team} onSelect={setActivePokemon} onReward={()=>{setCoins(v=>v+250);notify("Victory reward claimed: +250 coins.");}}/>}

      {screen==="packs"&&<section className="panel-stack"><div className="pack-feature"><div><div className="eyebrow">FEATURED DROP · LIMITED TIME</div><h2>PRIMAL APEX SUMMON</h2><p>Five cards. One chance at a legendary pull. Add fresh discoveries to your binder.</p><div className="pack-meta"><span><Star size={14}/> RARE · EPIC · LEGENDARY</span><span><PackageOpen size={14}/> 5 CARDS</span></div><button className="gold-button" onClick={()=>openPack("Primal Apex Summon")}><PackageOpen size={16}/> OPEN PACK · 1,200 COINS</button></div><div className="pack-art"><div className="pack-glow"/><div className="pack-card"><Sparkles size={38}/><b>PRIMAL<br/>APEX</b><small>COLLECTOR SERIES</small></div></div></div><div className="section-heading"><div><h2>AVAILABLE PACKS</h2><p>Choose a booster to expand your collection.</p></div></div><div className="pack-grid">{["Primal Apex","Kanto Origins","Elemental Clash"].map((p,i)=><div className="panel pack-tile" key={p}><div className={"pack-mini pack-mini-"+i}><PackageOpen size={28}/></div><b>{p}</b><small>5 CARDS · GUARANTEED RARE</small><button className="outline-button" onClick={()=>openPack(p)}>OPEN · 1,200 <Coins size={13}/></button></div>)}</div></section>}

      {screen==="gyms"&&<section className="panel-stack"><div className="gym-progress"><div><div className="eyebrow">KANTO LEAGUE CIRCUIT</div><h2>7 OF 8 BADGES ACQUIRED</h2><p>One final challenge stands between you and the Indigo Champion.</p></div><div className="badge-medal"><Trophy size={34}/><b>7/8</b></div></div><div className="gym-grid">{["Pewter · Brock","Cerulean · Misty","Vermilion · Lt. Surge","Celadon · Erika","Fuchsia · Koga","Saffron · Sabrina","Cinnabar · Blaine","Viridian · Giovanni"].map((g,i)=><div className={"panel gym-tile "+(i<7?"gym-cleared":"gym-locked")} key={g}><div className="gym-icon">{i<7?<Shield size={25}/>:<Lock size={23}/>}</div><span className="eyebrow">GYM {String(i+1).padStart(2,"0")}</span><b>{g}</b><small>{i<7?"BADGE EARNED":"FINAL CHALLENGE"}</small><button className={i<7?"outline-button":"gold-button"} onClick={()=>i<7?notify(g+" — replay challenge selected."):navigate("battle")}>{i<7?"VIEW RECORD":"CHALLENGE LEADER"}</button></div>)}</div></section>}

      {screen==="raids"&&<section className="panel raid-panel"><div className="raid-art"><img src={ART+"384.png"} alt="Rayquaza"/></div><div className="raid-info"><div className="eyebrow">WORLD EVENT · 02H 48M REMAINING</div><h2>SKY-SERPENT<br/>RAYQUAZA</h2><p>A legendary presence has appeared above the ancient ruins. Assemble your strongest team for this limited raid encounter.</p><div className="boss-health"><div><span>BOSS VITALITY</span><b>68% REMAINING</b></div><i><em/></i></div><div className="raid-stats"><span>DIFFICULTY <b>MYTHIC</b></span><span>RECOMMENDED <b>2,800 CP</b></span><span>PARTY <b>3 / 5</b></span></div><button className="gold-button" onClick={()=>notify("Raid lobby joined. Matchmaking will be enabled with multiplayer services.")}>JOIN RAID PARTY <ChevronRight size={16}/></button></div></section>}

      {screen==="friends"&&<section className="panel-stack"><div className="panel friends-toolbar"><div className="search-box"><Search size={16}/><input placeholder="Search trainer by name or ID..." onChange={e=>setSearch(e.target.value)}/></div><button className="gold-button" onClick={()=>notify("Friend invite link copied to your clipboard in the full release.")}><Plus size={15}/> ADD FRIEND</button></div><div className="friends-grid">{["MistyWave","OakResearch","EeveeMaster","VoltRunner","ShadowK"].filter(n=>n.toLowerCase().includes(search.toLowerCase())).map((n,i)=><div className="panel friend-card" key={n}><div className="friend-avatar">{n[0]}</div><div><b>{n}</b><small><i/> {i===3?"IN BATTLE":"ONLINE"} · LVL {42+i*3}</small></div><button className="outline-button" onClick={()=>notify("Challenge invitation prepared for "+n+".")}>CHALLENGE</button></div>)}</div></section>}

      {screen==="guild"&&<section className="panel-stack"><div className="guild-hero"><div><div className="eyebrow">TRAINER ALLIANCE · EST. 2025</div><h2>APEX DRAGONFORGE</h2><p>United by strategy. Defined by victory.</p><div className="guild-meta"><span>RANK #08</span><span>24 / 30 MEMBERS</span><span>1.8M GUILD XP</span></div></div><div className="guild-crest"><Crown size={46}/></div></div><div className="guild-stats">{[["WEEKLY CONTRIBUTION","12,450"],["GUILD WINS","186"],["ACTIVE MEMBERS","21/24"]].map(x=><div className="panel stat-tile" key={x[0]}><small>{x[0]}</small><b>{x[1]}</b></div>)}</div><div className="panel"><div className="section-heading"><h2>GUILD ACTIVITY</h2><span>RECENT</span></div>{["MistyWave contributed 2,500 research points","VoltRunner won a guild battle","OakResearch unlocked Dragon Mastery I"].map(x=><div className="activity-row" key={x}><Activity size={15}/>{x}</div>)}</div></section>}

      {screen==="tech"&&<section className="panel-stack"><div className="panel tech-intro"><div className="eyebrow">SHARED ALLIANCE RESEARCH</div><h2>INVEST IN THE NEXT EVOLUTION</h2><p>Spend guild research points to unlock passive perks for every alliance member.</p><b>AVAILABLE RESEARCH POINTS · 18,400</b></div><div className="tech-grid">{[{n:"Dragon Mastery",d:"+5% Dragon-type move power",cost:"4,000 RP",icon:Flame},{n:"Fortified Resolve",d:"+3% team HP in guild raids",cost:"3,500 RP",icon:Shield},{n:"Rapid Training",d:"+10% trainer XP from battles",cost:"5,000 RP",icon:Zap}].map((x,i)=>{const Icon=x.icon;return <div className="panel tech-card" key={x.n}><Icon size={26}/><h3>{x.n}</h3><p>{x.d}</p><small>{x.cost}</small><button className="gold-button" onClick={()=>notify(x.n+" research contribution queued.")}>CONTRIBUTE</button></div>;})}</div></section>}

      {screen==="profile"&&<section className="profile-layout"><div className="panel profile-hero"><div className="profile-avatar-large">R</div><div><div className="eyebrow">MASTER IV · 3,480 ELO</div><h2>Champion Red_Apex</h2><p>Trainer since Season 01 · Kanto League Champion</p><div className="profile-xp"><i/></div><small>LEVEL 64 · 14,200 / 17,500 XP</small></div></div><div className="profile-stat-grid">{[["TOTAL BATTLES","428"],["VICTORIES","312"],["WIN RATE","72.9%"],["CARDS OWNED",String(owned.length)]].map(x=><div className="panel stat-tile" key={x[0]}><small>{x[0]}</small><b>{x[1]}</b></div>)}</div><div className="panel settings-panel"><h2>GAME PREFERENCES</h2><button onClick={()=>notify("Audio preferences are ready for the settings release.")}>Sound & Music <ChevronRight/></button><button onClick={()=>notify("Graphics preferences are ready for the settings release.")}>Graphics Quality <ChevronRight/></button><button onClick={()=>notify("Account security settings will be connected to authentication.")}>Account & Security <ChevronRight/></button></div></section>}
    </main>

    {packReveal&&<div className="modal-backdrop" onClick={()=>setPackReveal(false)}><div className="pack-reveal-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setPackReveal(false)}><X/></button><div className="eyebrow">PACK OPENED · NEW DISCOVERIES</div><h2>YOUR CARDS HAVE ARRIVED</h2><p>Five cards have been added to your collection.</p><div className="reveal-grid">{revealed.map((p,i)=><div className="reveal-card" key={p.id+"-"+i}><PokemonArt pokemon={p} size={120}/><b>{p.name}</b><Rarity value={p.rarity}/></div>)}</div><button className="gold-button" onClick={()=>{setPackReveal(false);navigate("collection");}}>VIEW MY COLLECTION <ChevronRight size={15}/></button></div></div>}
    {toast&&<div className="toast-message"><Check size={15}/>{toast}</div>}
  </div>;
}

function Dashboard({team,owned,coins,claimed,onClaim,onNavigate,onToast}:{team:Pokemon[];owned:number;coins:number;claimed:boolean;onClaim:()=>void;onNavigate:(s:Screen)=>void;onToast:(s:string)=>void}) {
  return <div className="dashboard-grid">
    <div className="dashboard-main">
      <section className="hero-banner"><div className="hero-copy"><div className="eyebrow"><span className="live-dot"/> SEASON 04 · APEX EVOLUTION</div><h2>WELCOME BACK,<br/><strong>CHAMPION.</strong></h2><p>Your next legendary moment is waiting. The arena is calling, Trainer.</p><div className="hero-ctas"><button className="gold-button" onClick={()=>onNavigate("battle")}><Swords size={16}/> ENTER THE ARENA</button><button className="outline-button" onClick={()=>onNavigate("team")}>MANAGE SQUAD <ChevronRight size={14}/></button></div><div className="hero-metrics"><span><b>3,480</b><small>TRAINER ELO</small></span><span><b>72.9%</b><small>WIN RATE</small></span><span><b>{owned}</b><small>SPECIES FOUND</small></span></div></div><div className="hero-character"><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><img src={ART+"6.png"} alt="Charizard"/></div><div className="hero-corner-label">APEX<br/>CHAMPION</div></section>
      <div className="quick-actions"><button onClick={()=>onNavigate("battle")}><span className="quick-icon quick-fire"><Swords/></span><span><b>Battle Arena</b><small>Test your strength</small></span><ChevronRight/></button><button onClick={()=>onNavigate("packs")}><span className="quick-icon quick-blue"><PackageOpen/></span><span><b>Open Card Packs</b><small>Discover new cards</small></span><ChevronRight/></button><button onClick={()=>onNavigate("pokedex")}><span className="quick-icon quick-purple"><BookOpen/></span><span><b>Explore Pokédex</b><small>Research 1,025 species</small></span><ChevronRight/></button></div>
      <section className="panel dashboard-team"><div className="section-heading"><div><h2>YOUR ACTIVE SQUAD</h2><p>Your six selected Pokémon are ready for battle.</p></div><button className="text-action" onClick={()=>onNavigate("team")}>EDIT TEAM <ArrowUpRight size={14}/></button></div><div className="squad-strip">{team.map(p=><button key={p.id} className="squad-mon" onClick={()=>onNavigate("team")}><PokemonArt pokemon={p} size={76}/><b>{p.name}</b><small>{p.type.split(" · ")[0]}</small></button>)}</div></section>
      <section className="panel recent-cards"><div className="section-heading"><div><h2>RECENTLY DISCOVERED</h2><p>Latest additions to your digital binder.</p></div><button className="text-action" onClick={()=>onNavigate("collection")}>VIEW BINDER <ArrowUpRight size={14}/></button></div><div className="recent-card-row">{roster.slice(0,5).map(p=><button key={p.id} className="recent-card" onClick={()=>onNavigate("collection")}><PokemonArt pokemon={p} size={80}/><span><b>{p.name}</b><small>{p.rarity}</small></span></button>)}</div></section>
    </div>
    <aside className="dashboard-aside">
      <section className="panel trainer-progress"><div className="section-heading"><h2>TRAINER PROGRESS</h2><span>LVL 64</span></div><div className="level-ring"><div><b>64</b><small>LEVEL</small></div></div><div className="xp-copy"><b>14,200 / 17,500 XP</b><span>82% to next level</span></div><div className="xp-track"><i/></div><div className="progress-foot"><span>MASTER IV</span><span>3,480 ELO</span></div></section>
      <section className="panel daily-panel"><div className="section-heading"><h2>DAILY OBJECTIVES</h2><span>RESET IN 08:42:16</span></div><div className="mission-row"><span className="mission-icon"><Swords/></span><div><b>Win 3 battles</b><small>2 / 3 completed</small><i><em style={{width:"66%"}}/></i></div><strong>+300</strong></div><div className="mission-row"><span className="mission-icon"><BookOpen/></span><div><b>Discover 5 Pokémon</b><small>5 / 5 completed</small><i><em style={{width:"100%"}}/></i></div><strong>+200</strong></div><button className={"claim-button "+(claimed?"claimed":"")} onClick={onClaim} disabled={claimed}>{claimed?<><Check size={14}/> CLAIMED</>:<><Gift size={14}/> CLAIM DAILY REWARD · +500</>}</button></section>
      <section className="league-promo"><div className="eyebrow">NEXT MILESTONE</div><h3>INDIGO PLATEAU</h3><p>One final gym leader remains before the Champion's challenge.</p><button onClick={()=>onNavigate("gyms")}>VIEW PROGRESSION <ChevronRight size={13}/></button></section>
      <section className="panel currency-summary"><div><Coins/><span>COIN BALANCE</span><b>{coins.toLocaleString("en-US")}</b></div><button onClick={()=>onNavigate("packs")}>VISIT STORE <ShoppingBag size={13}/></button></section>
    </aside>
  </div>;
}

function PokemonCard({pokemon,onClick}:{pokemon:Pokemon;onClick:()=>void}) {
  return <button className={"collect-card rarity-border-"+pokemon.rarity.toLowerCase()} onClick={onClick}><div className="collect-card-top"><span>POKÉMON · #{String(pokemon.id).padStart(3,"0")}</span><Rarity value={pokemon.rarity}/></div><div className="collect-art"><div/><PokemonArt pokemon={pokemon} size={150}/></div><div className="collect-info"><b>{pokemon.name}</b><TypeBadge type={pokemon.type}/><div className="collect-stats"><span>HP <strong>{pokemon.hp*2+40}</strong></span><span>POWER <strong>{pokemon.cp.toLocaleString("en-US")}</strong></span></div></div></button>;
}

function BattleView({active,team,onSelect,onReward}:{active:Pokemon;team:Pokemon[];onSelect:(id:number)=>void;onReward:()=>void}) {
 const [party,setParty]=useState<BattlePokemon[]>(()=> (team.length?team:[active]).map(createBattlePokemon));
 const [enemy,setEnemy]=useState<BattlePokemon>(createOpponent);
 const [activeId,setActiveId]=useState(active.id);
 const [turn,setTurn]=useState(1);
 const [logs,setLogs]=useState(["A wild Mewtwo challenges your team! Choose your first move."]);
 const [status,setStatus]=useState<"active"|"victory"|"defeat">("active");
 const [attackKey,setAttackKey]=useState(0),[attackType,setAttackType]=useState("Fire"),[lastEffect,setLastEffect]=useState("Battle started");
 const rewarded=useRef(false);
 const current=party.find(p=>p.id===activeId&&!p.fainted)||party.find(p=>!p.fainted);
 useEffect(()=>{if(status==="victory"&&!rewarded.current){rewarded.current=true;onReward();}},[status,onReward]);
 const log=(lines:string[])=>setLogs(old=>[...lines,...old].slice(0,7));
 const reset=()=>{setParty((team.length?team:[active]).map(createBattlePokemon));setEnemy(createOpponent());setActiveId(active.id);setTurn(1);setLogs(["A wild Mewtwo challenges your team! Choose your first move."]);setStatus("active");setAttackKey(0);setLastEffect("Battle restarted");rewarded.current=false;};
 const doDamage=(attacker:BattlePokemon,defender:BattlePokemon,move:BattleMove,lines:string[])=>{
  if(move.category==="status"&&move.name==="Protect"){defender.protected=true;lines.push(attacker.name+" used Protect! The next hit is reduced.");return;}
  if(Math.random()*100>move.accuracy){lines.push(attacker.name+" used "+move.name+", but missed!");return;}
  const result=calculateDamage(attacker,defender,move),damage=defender.protected?Math.floor(result.damage*.25):result.damage;
  defender.protected=false;defender.hp=Math.max(0,defender.hp-damage);lines.push(attacker.name+" used "+move.name+" — "+damage+" damage. "+effectivenessLabel(result.effectiveness)+".");
  if(!defender.hp){defender.fainted=true;lines.push(defender.name+" fainted!");}
 };
 const runMove=(index:number)=>{
  if(status!=="active"||!current)return;
  const nextParty=party.map(p=>({...p,moves:p.moves.map(m=>({...m}))})),player=nextParty.find(p=>p.id===current.id)!;
  const foe={...enemy,moves:enemy.moves.map(m=>({...m}))},move=player.moves[index],lines:string[]=[];
  if(!move||move.pp<=0)return;move.pp--;setAttackType(move.type);setAttackKey(k=>k+1);
  const playerFirst=(move.priority||0)>0||player.speed>=foe.speed;
  if(playerFirst)doDamage(player,foe,move,lines);
  if(!foe.fainted){
   const target=playerFirst?player:player;
   if(!target.fainted){const ai=chooseOpponentMove(foe,target);if(ai){ai.pp=Math.max(0,ai.pp-1);setAttackType(ai.type);setAttackKey(k=>k+1);doDamage(foe,target,ai,lines);}}
  }
  if(!playerFirst&&!player.fainted&&!foe.fainted)doDamage(player,foe,move,lines);
  let nextActive=player;
  if(player.fainted){const replacement=nextParty.find(p=>!p.fainted);if(replacement){nextActive=replacement;setActiveId(replacement.id);onSelect(replacement.id);lines.push("Go, "+replacement.name+"!");}}
  setParty(nextParty);setEnemy(foe);setTurn(t=>t+1);log(lines);
  if(foe.fainted){setStatus("victory");setLastEffect("Opponent defeated · +250 coins");}
  else if(nextParty.every(p=>p.fainted)){setStatus("defeat");setLastEffect("Your entire party has fainted");}
  else setLastEffect(lines[lines.length-1]||"Turn complete");
 };
 const switchPokemon=(id:number)=>{
  if(status!=="active"||id===activeId)return;
  const nextParty=party.map(p=>({...p,moves:p.moves.map(m=>({...m}))})),next=nextParty.find(p=>p.id===id),foe={...enemy,moves:enemy.moves.map(m=>({...m}))};
  if(!next||next.fainted)return;setActiveId(id);onSelect(id);
  const lines=["Go, "+next.name+"!"];
  const ai=chooseOpponentMove(foe,next);if(ai){ai.pp=Math.max(0,ai.pp-1);setAttackType(ai.type);setAttackKey(k=>k+1);doDamage(foe,next,ai,lines);}
  setParty(nextParty);setEnemy(foe);setTurn(t=>t+1);log(lines);
  if(nextParty.every(p=>p.fainted))setStatus("defeat");
 };
 const percent=(p:BattlePokemon)=>Math.max(0,p.hp/p.maxHp*100);
 return <div className="battle-page-grid"><div className="panel battle-panel">
  <div className="battle-topline"><span><i/> TURN-BASED PRACTICE · TURN {turn}</span><button className="outline-button" onClick={reset}>RESET MATCH</button></div>
  <div className="arena-stage"><div className="battle-scene-canvas"><BattleScene attackKey={attackKey} attackType={attackType}/></div>
   <div className="combatant combatant-player"><div className="combatant-label"><b>{current?.name||"No Pokémon"}</b><small>YOUR ACTIVE POKÉMON · {current?.type||"—"}</small><i><em style={{width:(current?percent(current):0)+"%"}}/></i><small>HP {current?.hp||0}/{current?.maxHp||0}</small></div></div><div className="vs-mark">VS</div>
   <div className="combatant combatant-enemy"><div className="combatant-label"><b>{enemy.name}</b><small>LV. 58 · OPPONENT · {enemy.type}</small><i><em style={{width:percent(enemy)+"%"}}/></i><small>HP {enemy.hp}/{enemy.maxHp}</small></div></div><div className="arena-ground"/></div>
  <div className="battle-command"><div><div className="eyebrow">COMMAND PHASE · {status.toUpperCase()}</div><h3>{status==="victory"?"OPPONENT DEFEATED":status==="defeat"?"YOUR PARTY FAINTED":"WHAT WILL "+(current?.name||"YOUR POKÉMON").toUpperCase()+" DO?"}</h3><p>{lastEffect}</p></div>
   {status==="active"&&current&&<div className="move-grid battle-move-grid">{current.moves.map((m,i)=><button key={m.name} onClick={()=>runMove(i)} disabled={!m.pp} className={"battle-move battle-type-"+m.type}><span className="battle-move-type">{m.type.toUpperCase()}</span><b>{m.name}</b><small>{m.category.toUpperCase()} · POWER {m.power||"—"}</small><small>PP {m.pp}/{m.maxPp}</small></button>)}</div>}
   {status!=="active"&&<div className={"battle-result "+(status==="victory"?"result-win":"result-loss")}><Trophy size={19}/><b>{status==="victory"?"VICTORY · +250 COINS":"DEFEAT · TRAIN AGAIN"}</b><button className="gold-button" onClick={reset}>BATTLE AGAIN</button></div>}
  </div></div><aside className="panel battle-side"><div className="section-heading"><h2>YOUR PARTY</h2><span>{party.filter(p=>!p.fainted).length}/{party.length} READY</span></div>
  {party.map(p=><button key={p.id} className={"battle-party-row "+(p.id===activeId?"party-active":"")+(p.fainted?" party-fainted":"")} onClick={()=>switchPokemon(p.id)} disabled={p.fainted||status!=="active"}><PokemonArt pokemon={team.find(t=>t.id===p.id)||active} size={52}/><span><b>{p.name}</b><small>{p.fainted?"FAINTED":p.hp+"/"+p.maxHp+" HP"}</small><i className="party-hp-track"><em style={{width:percent(p)+"%"}}/></i></span>{p.id===activeId?<Check size={15}/>:<ChevronRight size={15}/>}</button>)}
  <div className="battle-log"><b>BATTLE LOG</b>{logs.map((line,i)=><p key={i} className={i===0?"log-latest":""}>{line}</p>)}</div></aside></div>;
}
