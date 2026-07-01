// Default monster presets + utilities
const BODY_PARTS = [
  { id: "head", name: "Hlava", short: "HEAD" },
  { id: "torso", name: "Hrudník", short: "TORSO" },
  { id: "larm", name: "Levá ruka", short: "L.ARM" },
  { id: "rarm", name: "Pravá ruka", short: "R.ARM" },
  { id: "lleg", name: "Levá noha", short: "L.LEG" },
  { id: "rleg", name: "Pravá noha", short: "R.LEG" },
];

// S.P.E.C.I.A.L attributes — used when a sheet represents a human/player character
const SPECIAL_ATTRS = [
  { id: "str", short: "STR" },
  { id: "per", short: "PER" },
  { id: "end", short: "END" },
  { id: "cha", short: "CHA" },
  { id: "int", short: "INT" },
  { id: "agi", short: "AGI" },
  { id: "lck", short: "LCK" },
];

function makeSpecial() {
  const s = {};
  SPECIAL_ATTRS.forEach((a) => { s[a.id] = 5; });
  return s;
}

// Fallout RPG skills — used in S.P.E.C.I.A.L (player) mode. Each has a rank and
// can be flagged as a "tag" skill (specialty). `attr` is the governing attribute.
const FALLOUT_SKILLS = [
  { id: "athletics", short: "ATHLETICS", attr: "str" },
  { id: "barter", short: "BARTER", attr: "cha" },
  { id: "bigGuns", short: "BIG GUNS", attr: "end" },
  { id: "energyWeapons", short: "ENERGY WPN", attr: "per" },
  { id: "explosives", short: "EXPLOSIVES", attr: "per" },
  { id: "lockpick", short: "LOCKPICK", attr: "per" },
  { id: "medicine", short: "MEDICINE", attr: "int" },
  { id: "meleeWeapons", short: "MELEE WPN", attr: "str" },
  { id: "pilot", short: "PILOT", attr: "per" },
  { id: "repair", short: "REPAIR", attr: "int" },
  { id: "science", short: "SCIENCE", attr: "int" },
  { id: "smallGuns", short: "SMALL GUNS", attr: "agi" },
  { id: "sneak", short: "SNEAK", attr: "agi" },
  { id: "speech", short: "SPEECH", attr: "cha" },
  { id: "survival", short: "SURVIVAL", attr: "end" },
  { id: "throwing", short: "THROWING", attr: "agi" },
  { id: "unarmed", short: "UNARMED", attr: "str" },
];

function makeSkills() {
  const s = {};
  FALLOUT_SKILLS.forEach((sk) => { s[sk.id] = { rank: 0, tag: false }; });
  return s;
}

function makeDrParts() {
  const s = {};
  BODY_PARTS.forEach((bp) => { s[bp.id] = 0; });
  return s;
}

const STATUS_EFFECTS = [
  { id: "bleed", name: "Bleed", desc: "Krvácení" },
  { id: "burn", name: "Burn", desc: "Popálenina" },
  { id: "poison", name: "Poison", desc: "Otrava" },
  { id: "rad", name: "Radiation", desc: "Radiace" },
  { id: "stun", name: "Stun", desc: "Omráčení" },
  { id: "fear", name: "Fear", desc: "Strach" },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function makeBodyPartState() {
  const s = {};
  BODY_PARTS.forEach((bp) => {
    s[bp.id] = { injuries: 0, note: "" }; // 0 = healthy/OK, 1+ = number of injuries
  });
  return s;
}

function makeMonster(partial = {}) {
  return {
    id: uid(),
    name: "Unnamed Creature",
    type: "Normal",
    tags: ["Creature"],
    level: 1,
    xp: 10,
    hp: 10,
    hpMax: 10,
    initiative: 0,
    initRoll: null,
    defense: 0,
    attrMode: "creature", // "creature" = BODY/MIND/… | "special" = S.P.E.C.I.A.L (player)
    stats: { body: 6, mind: 4, melee: 6, guns: 5, other: 5 },
    special: makeSpecial(),
    meleeBonus: 0, // S.P.E.C.I.A.L only: bonus melee damage (CD)
    luckPoints: 0, // S.P.E.C.I.A.L only: spendable Luck points
    skills: makeSkills(),
    drMode: "common", // "common" = one DR for whole body | "perPart" = separate per body part
    dr: { phys: { all: 0, typed: "" }, energy: { all: 0, typed: "" }, rad: { all: 0, typed: "" }, poison: { all: 0, typed: "" } },
    bodyParts: makeBodyPartState(),
    attacks: [],
    abilities: [],
    inventory: [],
    notes: "",
    effects: [], // [{id, rounds}]
    dead: false,
    ...partial,
  };
}

const DEFAULT_TEMPLATES = [
  {
    name: "Raider",
    type: "Normal",
    tags: ["Human", "Raider"],
    level: 2,
    xp: 17,
    hp: 8, hpMax: 8,
    initiative: 11,
    defense: 1,
    attrMode: "special",
    special: { str: 6, per: 5, end: 6, cha: 4, int: 5, agi: 6, lck: 4 },
    meleeBonus: 0,
    luckPoints: 0,
    skills: {
      athletics: { rank: 0, tag: false },
      barter: { rank: 0, tag: false },
      bigGuns: { rank: 0, tag: false },
      energyWeapons: { rank: 0, tag: false },
      explosives: { rank: 0, tag: false },
      lockpick: { rank: 0, tag: false },
      medicine: { rank: 1, tag: false },
      meleeWeapons: { rank: 2, tag: true },
      pilot: { rank: 0, tag: false },
      repair: { rank: 1, tag: false },
      science: { rank: 0, tag: false },
      smallGuns: { rank: 2, tag: true },
      sneak: { rank: 1, tag: false },
      speech: { rank: 0, tag: false },
      survival: { rank: 1, tag: false },
      throwing: { rank: 1, tag: false },
      unarmed: { rank: 2, tag: false },
    },
    drMode: "perPart",
    dr: {
      phys:   { all: 0, typed: "", parts: { head: 0, torso: 1, larm: 1, rarm: 1, lleg: 0, rleg: 0 } },
      energy: { all: 0, typed: "", parts: { head: 0, torso: 1, larm: 1, rarm: 1, lleg: 0, rleg: 0 } },
      rad:    { all: 0, typed: "", parts: { head: 0, torso: 0, larm: 0, rarm: 0, lleg: 0, rleg: 0 } },
      poison: { all: 0, typed: "", parts: { head: 0, torso: 0, larm: 0, rarm: 0, lleg: 0, rleg: 0 } },
    },
    attacks: [
      { id: uid(), name: "Unarmed Strike", type: "Melee", tn: 8, damage: "2CD", dmgType: "phys", range: "C", effects: [] },
      { id: uid(), name: "Tire Iron", type: "Melee", tn: 8, damage: "4CD", dmgType: "phys", range: "C", effects: [] },
      { id: uid(), name: "Pipe Gun", type: "Guns", tn: 8, damage: "3CD", dmgType: "phys", range: "C", effects: ["Fire Rate 2", "Close Quarters", "Unreliable"] },
    ],
    abilities: [
      { name: "Let Rip", desc: "Jednou za boj může vystřelit salvu z Pipe Gun — přičte Fire Rate 2 ke zranění zbraně pro jeden útok (celkem 5CD)." },
    ],
    inventory: ["Road Leathers", "Pipe Gun", "Tire Iron", "Wealth 1"],
  },
  {
    name: "Raider Scavver",
    type: "Normal",
    tags: ["Human", "Raider"],
    level: 7,
    xp: 60,
    hp: 13, hpMax: 13,
    initiative: 13,
    defense: 1,
    attrMode: "special",
    special: { str: 6, per: 7, end: 6, cha: 5, int: 5, agi: 6, lck: 4 },
    meleeBonus: 0,
    luckPoints: 0,
    skills: {
      athletics: { rank: 2, tag: false },
      barter: { rank: 0, tag: false },
      bigGuns: { rank: 1, tag: false },
      energyWeapons: { rank: 2, tag: false },
      explosives: { rank: 0, tag: false },
      lockpick: { rank: 0, tag: false },
      medicine: { rank: 0, tag: false },
      meleeWeapons: { rank: 3, tag: true },
      pilot: { rank: 0, tag: false },
      repair: { rank: 1, tag: false },
      science: { rank: 0, tag: false },
      smallGuns: { rank: 3, tag: true },
      sneak: { rank: 0, tag: false },
      speech: { rank: 0, tag: false },
      survival: { rank: 2, tag: false },
      throwing: { rank: 1, tag: false },
      unarmed: { rank: 1, tag: false },
    },
    drMode: "perPart",
    dr: {
      phys:   { all: 0, typed: "", parts: { head: 0, torso: 3, larm: 3, rarm: 3, lleg: 2, rleg: 2 } },
      energy: { all: 0, typed: "", parts: { head: 0, torso: 3, larm: 3, rarm: 3, lleg: 2, rleg: 2 } },
      rad:    { all: 0, typed: "", parts: { head: 0, torso: 0, larm: 0, rarm: 0, lleg: 0, rleg: 0 } },
      poison: { all: 0, typed: "", parts: { head: 0, torso: 0, larm: 0, rarm: 0, lleg: 0, rleg: 0 } },
    },
    attacks: [
      { id: uid(), name: "Unarmed Strike", type: "Melee", tn: 7, damage: "2CD", dmgType: "phys", range: "C", effects: [] },
      { id: uid(), name: "Machete", type: "Melee", tn: 9, damage: "4CD", dmgType: "phys", range: "C", effects: ["Piercing 1"] },
      { id: uid(), name: "Combat Shotgun", type: "Guns", tn: 9, damage: "5CD", dmgType: "phys", range: "C", effects: ["Spread", "Inaccurate", "Two-Handed"] },
    ],
    abilities: [
      { name: "Aggressive", desc: "Scavver rychle reaguje, když ucítí kořist. Když vstoupí do scény, okamžitě vygeneruje 1 Action Point — pokud je spojenec, jde do skupinové zásoby, pokud je nepřítel, jde do zásoby vypravěče (GM)." },
    ],
    inventory: ["Heavy Raider Chest Piece", "Sturdy Raider Leg x2", "Heavy Raider Arm x2", "Combat Shotgun", "Machete", "Wealth 1"],
  },
  {
    name: "Raider Veteran",
    type: "Notable",
    tags: ["Human", "Raider", "Notable"],
    level: 8,
    xp: 120,
    hp: 21, hpMax: 21,
    initiative: 17,
    defense: 1,
    attrMode: "special",
    special: { str: 7, per: 8, end: 7, cha: 6, int: 5, agi: 7, lck: 6 },
    meleeBonus: 1,
    luckPoints: 3,
    skills: {
      athletics: { rank: 2, tag: false },
      barter: { rank: 0, tag: false },
      bigGuns: { rank: 0, tag: false },
      energyWeapons: { rank: 0, tag: false },
      explosives: { rank: 1, tag: false },
      lockpick: { rank: 0, tag: false },
      medicine: { rank: 1, tag: false },
      meleeWeapons: { rank: 4, tag: true },
      pilot: { rank: 0, tag: false },
      repair: { rank: 0, tag: false },
      science: { rank: 0, tag: false },
      smallGuns: { rank: 4, tag: true },
      sneak: { rank: 1, tag: false },
      speech: { rank: 2, tag: false },
      survival: { rank: 2, tag: false },
      throwing: { rank: 0, tag: false },
      unarmed: { rank: 2, tag: false },
    },
    dr: { phys: { all: 2, typed: "" }, energy: { all: 2, typed: "" }, rad: { all: 0, typed: "" }, poison: { all: 0, typed: "" } },
    attacks: [
      { id: uid(), name: "Unarmed Strike", type: "Melee", tn: 9, damage: "3CD", dmgType: "phys", range: "C", effects: [] },
      { id: uid(), name: "Machete", type: "Melee", tn: 11, damage: "3CD", dmgType: "phys", range: "C", effects: ["Piercing 1"] },
      { id: uid(), name: "Combat Rifle", type: "Guns", tn: 11, damage: "3CD", dmgType: "phys", range: "M", effects: ["Fire Rate 2", "Two-Handed"] },
      { id: uid(), name: "Molotov Cocktail", type: "Energy", tn: 9, damage: "3CD", dmgType: "energy", range: "M", effects: ["Persistent", "Blast", "Throwing"] },
    ],
    abilities: [
      { name: "In Charge", desc: "Velitel může utratit minor akci a rozkázat raiderovi nižšího levelu v Close range okamžitě provést minor akci. Nebo utratí major akci a rozkáže jinému raiderovi okamžitě provést major akci." },
      { name: "Let Rip", desc: "Jednou za boj může vystřelit salvu z Combat Rifle — přičte Fire Rate 2 ke zranění zbraně pro jeden útok (celkem 7CD)." },
    ],
    inventory: ["Spike Armor", "Combat Rifle", "Machete", "Wealth 2"],
  },
  {
    name: "Raider Boss",
    type: "Major",
    tags: ["Human", "Raider", "Major"],
    level: 10,
    xp: 222,
    hp: 30, hpMax: 30,
    initiative: 17,
    defense: 1,
    attrMode: "special",
    special: { str: 8, per: 9, end: 8, cha: 8, int: 7, agi: 8, lck: 6 },
    meleeBonus: 1,
    luckPoints: 6,
    skills: {
      athletics: { rank: 2, tag: false },
      barter: { rank: 0, tag: false },
      bigGuns: { rank: 4, tag: true },
      energyWeapons: { rank: 0, tag: false },
      explosives: { rank: 2, tag: true },
      lockpick: { rank: 0, tag: false },
      medicine: { rank: 0, tag: false },
      meleeWeapons: { rank: 1, tag: true },
      pilot: { rank: 0, tag: false },
      repair: { rank: 2, tag: false },
      science: { rank: 0, tag: false },
      smallGuns: { rank: 2, tag: true },
      sneak: { rank: 1, tag: false },
      speech: { rank: 2, tag: false },
      survival: { rank: 3, tag: false },
      throwing: { rank: 1, tag: false },
      unarmed: { rank: 2, tag: false },
    },
    drMode: "perPart",
    dr: {
      phys:   { all: 0, typed: "", parts: { head: 0, torso: 3, larm: 3, rarm: 3, lleg: 2, rleg: 2 } },
      energy: { all: 0, typed: "", parts: { head: 0, torso: 3, larm: 3, rarm: 3, lleg: 2, rleg: 2 } },
      rad:    { all: 0, typed: "", parts: { head: 0, torso: 0, larm: 0, rarm: 0, lleg: 0, rleg: 0 } },
      poison: { all: 0, typed: "", parts: { head: 0, torso: 0, larm: 0, rarm: 0, lleg: 0, rleg: 0 } },
    },
    attacks: [
      { id: uid(), name: "Unarmed Strike", type: "Melee", tn: 10, damage: "3CD", dmgType: "phys", range: "C", effects: [] },
      { id: uid(), name: "Frag Grenade", type: "Explosive", tn: 9, damage: "6CD", dmgType: "phys", range: "M", effects: ["Blast", "Throwing"] },
      { id: uid(), name: "Hunting Rifle", type: "Guns", tn: 10, damage: "6CD", dmgType: "phys", range: "M", effects: ["Piercing 1", "Two-Handed"] },
    ],
    abilities: [
      { name: "Aggressive", desc: "Raider boss rychle reaguje, když ucítí kořist. Když vstoupí do scény, okamžitě vygeneruje 1 Action Point — pokud je spojenec, jde do skupinové zásoby, pokud je nepřítel, jde do zásoby vypravěče (GM)." },
      { name: "Action Packed", desc: "Raider boss je cílevědomý a bere věci do vlastních rukou. Každou scénu začíná s osobní zásobou 4 Action Pointů, které může utrácet místo čerpání z jiných zdrojů." },
    ],
    inventory: ["Heavy Raider Chest Piece", "Sturdy Raider Leg x2", "Heavy Raider Arm x2", "3 Frag Grenades", "Hunting Rifle", "Wealth 2"],
  },
];

// Fill in fields that may be missing on monsters loaded from older saved data
function normalizeMonster(m) {
  if (!m) return m;
  if (!m.attrMode) m.attrMode = "creature";
  if (!m.special) m.special = makeSpecial();
  else SPECIAL_ATTRS.forEach((a) => { if (m.special[a.id] == null) m.special[a.id] = 5; });
  if (!m.skills) m.skills = makeSkills();
  else FALLOUT_SKILLS.forEach((sk) => {
    if (m.skills[sk.id] == null) m.skills[sk.id] = { rank: 0, tag: false };
    else if (typeof m.skills[sk.id] === "number") m.skills[sk.id] = { rank: m.skills[sk.id], tag: false };
  });
  if (m.meleeBonus == null) m.meleeBonus = 0;
  if (m.luckPoints == null) m.luckPoints = 0;
  if (!m.drMode) m.drMode = "common";
  ["phys", "energy", "rad", "poison"].forEach((k) => {
    if (!m.dr[k]) m.dr[k] = { all: 0, typed: "" };
    if (!m.dr[k].parts) m.dr[k].parts = makeDrParts();
  });
  (m.attacks || []).forEach((a) => { if (!a.dmgType) a.dmgType = "phys"; });
  return m;
}

// Resolve the DR value that should apply to a given damage type + body part
function effectiveDR(m, type, partId) {
  const d = (m.dr && m.dr[type]) || {};
  if (m.drMode === "perPart" && d.parts && partId != null) {
    const v = d.parts[partId];
    return v == null ? (d.all || 0) : v;
  }
  return d.all || 0;
}

// Shorten the "Immune" typed override for compact card display
function abbrImmune(v) {
  if (typeof v === "string" && /^immune$/i.test(v.trim())) return "Imn";
  return v;
}

window.BODY_PARTS = BODY_PARTS;
window.SPECIAL_ATTRS = SPECIAL_ATTRS;
window.FALLOUT_SKILLS = FALLOUT_SKILLS;
window.makeSpecial = makeSpecial;
window.makeSkills = makeSkills;
window.makeDrParts = makeDrParts;
window.normalizeMonster = normalizeMonster;
window.effectiveDR = effectiveDR;
window.abbrImmune = abbrImmune;window.STATUS_EFFECTS = STATUS_EFFECTS;
window.uid = uid;
window.makeBodyPartState = makeBodyPartState;
window.makeMonster = makeMonster;
window.DEFAULT_TEMPLATES = DEFAULT_TEMPLATES;

// === GAME TERMS (descriptions for click-popovers) ===
// Localized. Keys are normalized strings (lowercase, trimmed, with possible suffix number).
// Function getTermDesc(termString, lang) handles "Piercing 1" → look up "piercing".
const GAME_TERMS = {
  cs: {
    // Weapon qualities (Fallout 2d20)
    "piercing":    { name: "Piercing", desc: "Ignoruje N bodů odolnosti cíle (kde N = hodnota za názvem)." },
    "vicious":     { name: "Vicious",  desc: "Za každý efekt na kostce přidá +1 zranění navíc." },
    "burst":       { name: "Burst",    desc: "Útok zasahuje plochu — možnost zasáhnout více cílů. Spotřebuje extra munici." },
    "persistent":  { name: "Persistent", desc: "Efekt přetrvává — cíl utrpí stejné zranění i v dalším kole, dokud se neuhasí/neošetří." },
    "knockdown":   { name: "Knockdown", desc: "Při daném výsledku na kostce cíl spadne na zem (akce na vstávání)." },
    "stun":        { name: "Stun",     desc: "Při daném výsledku cíl ztrácí příští akci." },
    "spread":      { name: "Spread",   desc: "Brokový rozptyl — bonus k zásahu na blízko, postih na dálku." },
    "accurate":    { name: "Accurate", desc: "+1k Combat Dice při využití Aim action." },
    "inaccurate":  { name: "Inaccurate", desc: "−1k Combat Dice při útoku." },
    "blast":       { name: "Blast",    desc: "Výbuch — zasahuje všechny v zóně." },
    "two-handed":  { name: "Two-Handed", desc: "Vyžaduje obě ruce." },
    "unreliable":  { name: "Unreliable", desc: "Při neúspěchu se může zbraň zaseknout." },
    "reliable":    { name: "Reliable", desc: "Snížená šance na zaseknutí." },
    "close quarters": { name: "Close Quarters", desc: "Bez postihu na blízko (Close range)." },
    "gun bash":    { name: "Gun Bash", desc: "Lze použít jako melee zbraň (1CD)." },
    // Attributes
    "body":   { name: "TĚLO", desc: "Fyzická síla, odolnost, výdrž. Používá se pro úsilí, tělesnou kondici a nesení nákladu." },
    "mind":   { name: "MYSL", desc: "Intelekt, vůle, vnímavost. Používá se pro vědu, technologii, vyjednávání a smysly." },
    "melee":  { name: "BLÍZKÝ BOJ", desc: "Dovednost v boji zblízka — pěsti, nože, palice, sekery." },
    "guns":   { name: "ZBRANĚ", desc: "Dovednost se střelnými zbraněmi — pistole, pušky, lasery, brokovnice." },
    "other":  { name: "OSTATNÍ", desc: "Souhrn ostatních dovedností (Survival, Repair, Sneak, Medicine atd.)." },
    "defense":{ name: "OBRANA", desc: "Snižuje úspěšnost příchozích útoků (přidává se k cílovému číslu útočníka)." },
    "initiative":{ name: "INICIATIVA", desc: "Určuje pořadí jednání v boji. Vyšší = jedná dříve." },
    "hp":     { name: "ZDRAVÍ", desc: "Životní body. Při 0 je tvor neschopný boje / mrtvý." },
    // Damage types / resistances
    "phys":   { name: "FYZICKÁ ODOLNOST", desc: "Odečítá se od fyzického zranění (kulky, ostří, údery)." },
    "energy": { name: "ENERGETICKÁ ODOLNOST", desc: "Odečítá se od energetického zranění (laser, plasma, oheň)." },
    "rad":    { name: "RADIAČNÍ ODOLNOST", desc: "Odečítá se od radiačního zranění. „Immune\" = nedotčeno radiací." },
    "poison": { name: "JEDOVÁ ODOLNOST", desc: "Odečítá se od jedového a chemického zranění." },
    // Status effects (full)
    "bleed":  { name: "Krvácení", desc: "Cíl ztrácí 1 HP na začátku každého kola, dokud není ošetřen (Medicine TN 10)." },
    "burn":   { name: "Popálení", desc: "Cíl ztrácí 1 HP na začátku každého kola; lze uhasit válením po zemi (akce)." },
    "stun_eff":{ name: "Omráčení", desc: "Cíl má −1k k akčním testům a nemůže reagovat na útoky." },
    "fear":   { name: "Strach", desc: "Cíl musí utéct, nebo má postih ke všem akcím proti zdroji strachu." },
    "rad_eff":{ name: "Radiace", desc: "Akumuluje radiační zranění; snižuje maximální HP." },
  },
  mixed: {
    "piercing":    { name: "Piercing", desc: "Ignores N points of the target's DR (where N = value after name)." },
    "vicious":     { name: "Vicious",  desc: "Each effect rolled on Combat Dice adds +1 extra damage." },
    "burst":       { name: "Burst",    desc: "Hits an area — can hit multiple targets. Uses extra ammo." },
    "persistent":  { name: "Persistent", desc: "Effect persists — target takes same damage next round until extinguished/treated." },
    "knockdown":   { name: "Knockdown", desc: "On the listed dice result, target falls prone." },
    "stun":        { name: "Stun",     desc: "On the listed result, target loses next action." },
    "spread":      { name: "Spread",   desc: "Shotgun spread — bonus to hit close, penalty at range." },
    "accurate":    { name: "Accurate", desc: "+1 CD when using Aim action." },
    "inaccurate":  { name: "Inaccurate", desc: "−1 CD on attack." },
    "blast":       { name: "Blast",    desc: "Explosive — hits everyone in the zone." },
    "two-handed":  { name: "Two-Handed", desc: "Requires both hands." },
    "unreliable":  { name: "Unreliable", desc: "May jam on failure." },
    "reliable":    { name: "Reliable", desc: "Reduced jam chance." },
    "close quarters": { name: "Close Quarters", desc: "No penalty at Close range." },
    "gun bash":    { name: "Gun Bash", desc: "Can be used as a melee weapon (1CD)." },
    "body":   { name: "BODY",   desc: "Physical strength, toughness, stamina. Used for exertion, fitness, carrying load." },
    "mind":   { name: "MIND",   desc: "Intellect, willpower, perception. Used for science, tech, negotiation, senses." },
    "melee":  { name: "MELEE",  desc: "Skill in close combat — fists, blades, clubs, axes." },
    "guns":   { name: "GUNS",   desc: "Skill with firearms — pistols, rifles, lasers, shotguns." },
    "other":  { name: "OTHER",  desc: "Catch-all for other skills (Survival, Repair, Sneak, Medicine, etc.)." },
    "defense":{ name: "DEFENSE", desc: "Adds to attacker's target number, reducing chance of being hit." },
    "initiative":{ name: "INITIATIVE", desc: "Determines turn order in combat. Higher acts first." },
    "hp":     { name: "HP", desc: "Hit points. At 0 the creature is incapacitated / dead." },
    "phys":   { name: "PHYS DR",   desc: "Subtracted from physical damage (bullets, blades, impact)." },
    "energy": { name: "ENERGY DR", desc: "Subtracted from energy damage (laser, plasma, fire)." },
    "rad":    { name: "RAD DR",    desc: "Subtracted from radiation damage. \"Immune\" = unaffected by radiation." },
    "poison": { name: "POISON DR", desc: "Subtracted from poison & chemical damage." },
    "bleed":  { name: "Bleed",  desc: "Target loses 1 HP at start of each round until treated (Medicine TN 10)." },
    "burn":   { name: "Burn",   desc: "Target loses 1 HP at start of each round; extinguishable by dropping and rolling." },
    "stun_eff":{ name: "Stun",  desc: "Target has −1 CD on action tests and cannot react to attacks." },
    "fear":   { name: "Fear",   desc: "Target must flee, or suffers penalty to all actions against the fear source." },
    "rad_eff":{ name: "Radiation", desc: "Accumulates radiation damage; reduces maximum HP." },
  },
};

// Lookup helper — strips trailing numbers ("Piercing 1" → "piercing"), normalizes case
function getTermDesc(term, lang = "mixed") {
  if (!term) return null;
  const dict = GAME_TERMS[lang] || GAME_TERMS.mixed;
  const key = String(term).toLowerCase().trim().replace(/\s+\d+(\+)?$/, "").replace(/\s+on\s+\d+\+?$/, "");
  return dict[key] || null;
}

window.GAME_TERMS = GAME_TERMS;
window.getTermDesc = getTermDesc;
