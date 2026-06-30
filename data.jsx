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
    name: "Raider Scum",
    type: "Normal",
    tags: ["Human", "Raider"],
    level: 2,
    xp: 15,
    hp: 12, hpMax: 12,
    initiative: 7,
    defense: 1,
    stats: { body: 6, mind: 5, melee: 6, guns: 6, other: 5 },
    dr: { phys: { all: 1, typed: "" }, energy: { all: 0, typed: "" }, rad: { all: 0, typed: "" }, poison: { all: 0, typed: "" } },
    attacks: [
      { id: uid(), name: "Pipe Pistol", type: "Guns", tn: 6, damage: "3CD", dmgType: "phys", range: "M", effects: ["Piercing 1"] },
      { id: uid(), name: "Lead Pipe", type: "Melee", tn: 6, damage: "3CD", dmgType: "phys", range: "C", effects: ["Vicious"] },
    ],
    abilities: [
      { name: "Threat Display", desc: "+1 k Charisma testu zastrašení." },
    ],
    inventory: ["Pipe pistol (.38)", "Lead pipe", "Few caps", "Stim x1"],
  },
  {
    name: "Feral Ghoul",
    type: "Normal Creature",
    tags: ["Ghoul", "Mutant"],
    level: 3,
    xp: 25,
    hp: 15, hpMax: 15,
    initiative: 9,
    defense: 2,
    stats: { body: 8, mind: 3, melee: 8, guns: 1, other: 4 },
    dr: { phys: { all: 1, typed: "" }, energy: { all: 0, typed: "" }, rad: { all: 999, typed: "Immune" }, poison: { all: 1, typed: "" } },
    attacks: [
      { id: uid(), name: "Claws", type: "Melee", tn: 8, damage: "4CD", dmgType: "phys", range: "C", effects: ["Vicious"] },
      { id: uid(), name: "Lunge", type: "Melee", tn: 7, damage: "3CD", dmgType: "phys", range: "C", effects: ["Knockdown on 2+"] },
    ],
    abilities: [
      { name: "Feral", desc: "Imunní vůči radiaci a strachu. Útočí do bezvědomí." },
      { name: "Play Dead", desc: "Může se předstírat mrtvý; INT+Perception (TN16) k odhalení." },
    ],
    inventory: ["Tattered rags", "Bone fragments"],
  },
  {
    name: "Mister Handy",
    type: "Robot",
    tags: ["Robot", "Mechanical"],
    level: 5,
    xp: 40,
    hp: 18, hpMax: 18,
    initiative: 11,
    defense: 1,
    stats: { body: 7, mind: 6, melee: 7, guns: 7, other: 6 },
    dr: { phys: { all: 2, typed: "" }, energy: { all: 1, typed: "" }, rad: { all: 999, typed: "Immune" }, poison: { all: 999, typed: "Immune" } },
    attacks: [
      { id: uid(), name: "Buzz Saw", type: "Melee", tn: 7, damage: "4CD", dmgType: "phys", range: "C", effects: ["Vicious", "Piercing 1"] },
      { id: uid(), name: "Flamer", type: "Energy", tn: 7, damage: "5CD", dmgType: "energy", range: "C", effects: ["Burst", "Persistent"] },
      { id: uid(), name: "Laser", type: "Energy", tn: 7, damage: "4CD", dmgType: "energy", range: "M", effects: ["Piercing 2"] },
    ],
    abilities: [
      { name: "Robot", desc: "Nepoužívá jídlo, vodu, chemy. Med-X nemá efekt. Lze opravit (Repair)." },
      { name: "Hover", desc: "Ignoruje obtížný terén." },
    ],
    inventory: ["Fusion cell x10", "Robot scrap", "Aluminum"],
  },
  {
    name: "Radroach",
    type: "Normal Creature",
    tags: ["Insect", "Mutant"],
    level: 1,
    xp: 5,
    hp: 4, hpMax: 4,
    initiative: 8,
    defense: 1,
    stats: { body: 3, mind: 1, melee: 5, guns: 0, other: 3 },
    dr: { phys: { all: 0, typed: "" }, energy: { all: 0, typed: "" }, rad: { all: 999, typed: "Immune" }, poison: { all: 1, typed: "" } },
    attacks: [
      { id: uid(), name: "Bite", type: "Melee", tn: 5, damage: "1CD", dmgType: "phys", range: "C", effects: [] },
    ],
    abilities: [
      { name: "Skitter", desc: "Může přežit do 2 útočniků současně." },
    ],
    inventory: ["Radroach meat"],
  },
  {
    name: "Super Mutant Brute",
    type: "Normal",
    tags: ["Super Mutant", "Mutant"],
    level: 6,
    xp: 60,
    hp: 24, hpMax: 24,
    initiative: 8,
    defense: 1,
    stats: { body: 11, mind: 3, melee: 9, guns: 6, other: 5 },
    dr: { phys: { all: 2, typed: "" }, energy: { all: 1, typed: "" }, rad: { all: 999, typed: "Immune" }, poison: { all: 2, typed: "" } },
    attacks: [
      { id: uid(), name: "Sledgehammer", type: "Melee", tn: 9, damage: "6CD", dmgType: "phys", range: "C", effects: ["Vicious", "Stun on 2+"] },
      { id: uid(), name: "Hunting Rifle", type: "Guns", tn: 6, damage: "4CD", dmgType: "phys", range: "L", effects: ["Piercing 1"] },
    ],
    abilities: [
      { name: "Massive", desc: "Zvětšený, +1 zone of influence." },
      { name: "Fearless", desc: "Imunní vůči Fear." },
    ],
    inventory: ["Sledgehammer", "Hunting rifle (.308)", "Mutant meat"],
  },
  {
    name: "Mole Rat",
    type: "Normal Creature",
    tags: ["Mammal", "Mutant"],
    level: 2,
    xp: 10,
    hp: 8, hpMax: 8,
    initiative: 7,
    defense: 1,
    stats: { body: 5, mind: 2, melee: 6, guns: 0, other: 4 },
    dr: { phys: { all: 0, typed: "" }, energy: { all: 0, typed: "" }, rad: { all: 2, typed: "" }, poison: { all: 0, typed: "" } },
    attacks: [
      { id: uid(), name: "Bite", type: "Melee", tn: 6, damage: "3CD", dmgType: "phys", range: "C", effects: ["Vicious"] },
      { id: uid(), name: "Burrow Charge", type: "Melee", tn: 5, damage: "4CD", dmgType: "phys", range: "C", effects: ["Knockdown on 2+"] },
    ],
    abilities: [
      { name: "Burrower", desc: "Může zmizet pod zemí; pohyb skrz těsné prostory." },
    ],
    inventory: ["Mole rat meat", "Mole rat teeth"],
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
