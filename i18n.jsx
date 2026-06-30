// i18n — language toggle between Mixed (terminal English + Czech) and Pure Czech
const LANG_KEY = "fallout-tracker-lang";

const I18N = {
  mixed: {
    // Topbar
    brand: "⌬ TERMLINK / WASTELAND BESTIARY",
    new: "＋ NEW [N]",
    bestiary: "★ BESTIARY [T]",
    sortInit: "⇅ SORT BY INIT [R]",
    reboot: "⏻ REBOOT",
    // Sidebar
    initiativeQueue: "INITIATIVE QUEUE",
    sNew: "+ NEW",
    sSort: "⇅ SORT",
    sortByInitTitle: "Seřadit podle iniciativy",
    round: "ROUND",
    next: "NEXT ▶",
    emptyQueueAscii: `┌─────────────┐
│   E M P T Y │
│   QUEUE     │
└─────────────┘`,
    emptyQueueText: <>Žádné cíle.<br/>Stiskni [+ NEW] pro přidání.</>,
    init: "INIT",
    hp: "HP",
    lvl: "LVL",
    clearEncounter: "CLEAR ENCOUNTER",
    // Status bar
    link: "● LINK",
    combatants: "COMBATANTS",
    alive: "ALIVE",
    acting: (n) => `▶ ACTING: ${n.toUpperCase()}`,
    awaiting: "▷ AWAITING TURN ORDER",
    hotkeys: "HOTKEYS: [N]EW · [T]PL · [R] SORT · [SPACE] NEXT",
    // Main empty
    encounterViewport: "ENCOUNTER VIEWPORT",
    noTargetAscii: `        ╔════════════════╗
        ║   NO  TARGET   ║
        ║    SELECTED    ║
        ╚════════════════╝
              ▲
              │
        SELECT FROM QUEUE`,
    noTargetText: "Vyber příšeru z fronty vlevo, nebo přidej novou.",
    targetDossier: "TARGET DOSSIER //",
    xp: "XP",
    // Vital signs
    vitalSigns: "VITAL SIGNS",
    deceased: "✗ DECEASED",
    critical: "⚠ CRITICAL",
    wounded: "WOUNDED",
    stable: "STABLE",
    max: "MAX",
    // Body parts
    somaticMap: "SOMATIC INTEGRITY MAP",
    bpOk: "OK",
    bpInjury: (n) => `▲ ${n}× ÚRAZ`,
    bpClickHint: "Klik = vybrat | Pravý klik = + úraz",
    selected: "VYBRÁNO",
    injuryCount: (n) => `(${n}× úraz)`,
    addInjury: "+ ÚRAZ",
    removeInjury: "− ÚRAZ",
    healPart: "HEAL",
    // Damage panel
    damageIntake: "DAMAGE INTAKE",
    type: "TYP:",
    damagePh: "DAMAGE",
    apply: (p) => `APPLY → ${p.toUpperCase()}`,
    stageApply: (n) => `⚔ ATTACK −${n}`,
    stageReadout: (n) => `STAGED −${n}`,
    stageHint: "Stage hits with −1 / −5, then ATTACK to apply through DR.",
    stageClear: "clear staged damage",
    heal5: "+5 HEAL",
    full: "FULL",
    // Stats
    attributes: "ATTRIBUTES",
    attributesSpecial: "S.P.E.C.I.A.L",
    body: "BODY", mind: "MIND", melee: "MELEE", guns: "GUNS", other: "OTHER",
    hpMax: "HP MAX", initiativeStat: "INITIATIVE", defense: "DEFENSE",
    damageResistance: "DAMAGE RESISTANCE",
    physDR: "PHYS DR", energyDR: "ENERGY DR", radDR: "RAD DR", poisonDR: "POISON DR",
    statusEffects: "STATUS EFFECTS",
    armament: "ARMAMENT // ATTACKS",
    specialAbilities: "SPECIAL ABILITIES",
    inventoryTitle: "INVENTORY // SALVAGE",
    gmNotes: "GM NOTES",
    edit: "✎ EDIT",
    duplicate: "⎘ DUPLICATE",
    saveTpl: "★ SAVE AS TEMPLATE",
    remove: "✗ REMOVE",
    // Log
    combatLog: "COMBAT LOG",
    entries: "ENTRIES",
    awaitingData: "> awaiting combat data...",
    clearLog: "CLEAR LOG",
    // Edit modal
    creatureEditor: "CREATURE EDITOR",
    bestiaryEntry: "BESTIARY ENTRY",
    record: "RECORD",
    cancelBtn: "CANCEL",
    commitBtn: "✓ ADD TO ENCOUNTER",
    toBestiaryBtn: "★ SAVE TO BESTIARY",
    saveTplBtn: "✓ SAVE TO BESTIARY",
    editTplBtn: "✎ EDIT",
    nameLabel: "Název / Name",
    customNameLabel: "Custom name (DM)",
    customNamePh: "custom name…",
    tagsLabel: "Tagy (čárkami)",
    levelLabel: "Level",
    xpLabel: "XP",
    hpMaxLabel: "HP Max",
    hpCurLabel: "HP Current",
    initLabel: "Initiative",
    defLabel: "Defense",
    attrTitle: "▸ ATTRIBUTES (Fallout 2d20)",
    attrModeLabel: "SET:",
    attrModeCreature: "CREATURE",
    attrModeSpecial: "S.P.E.C.I.A.L",
    specialTitle: "▸ S.P.E.C.I.A.L (player)",
    spLabel: { str: "STR", per: "PER", end: "END", cha: "CHA", int: "INT", agi: "AGI", lck: "LCK" },
    skillsTitle: "▸ SKILLS",
    skillsLabel: "SKILLS",
    skillTag: "TAG",
    meleeBonusLabel: "MELEE",
    luckPtsLabel: "LUCK",
    meleeBonusFull: "MELEE DMG BONUS",
    luckPtsFull: "LUCK POINTS",
    skillsHint: "Set a rank for trained skills; TAG marks specialties. Only filled skills show on the card.",
    skLabel: { athletics: "ATHLETICS", barter: "BARTER", bigGuns: "BIG GUNS", energyWeapons: "ENERGY WPN", explosives: "EXPLOSIVES", lockpick: "LOCKPICK", medicine: "MEDICINE", meleeWeapons: "MELEE WPN", pilot: "PILOT", repair: "REPAIR", science: "SCIENCE", smallGuns: "SMALL GUNS", sneak: "SNEAK", speech: "SPEECH", survival: "SURVIVAL", throwing: "THROWING", unarmed: "UNARMED" },
    drTitle: "▸ DAMAGE RESISTANCE",
    drModeLabel: "MODE:",
    drModeCommon: "COMMON",
    drModePerPart: "PER BODY PART",
    drPartHint: "Empty cell = inherits the COMMON value.",
    drFieldLabel: (k) => `${k.toUpperCase()} DR (číslo nebo „Immune")`,
    drTypedPh: "typed override (volitelné)",
    attacksTitle: "▸ ATTACKS",
    addBtn: "+ ADD",
    abilitiesTitle: "▸ SPECIAL ABILITIES",
    abNamePh: "Název",
    abDescPh: "Popis",
    invTitle: "▸ INVENTORY (řádek = položka)",
    notesTitle: "▸ GM NOTES",
    cancel: "CANCEL",
    commit: "✓ COMMIT",
    // Templates
    bestiaryTitle: "BESTIARY // SELECT TEMPLATE",
    deleteBtn: "✗ DELETE",
    close: "CLOSE",
    // Confirm
    confirmTitle: "CONFIRM ACTION",
    confirmCancel: "[ESC] ZRUŠIT",
    confirmYes: "[Y] POTVRDIT",
    // Confirm messages
    confirmRemove: (n) => `Odstranit ${n} z encounteru? Tuto akci nelze vrátit.`,
    confirmClearAll: "Vymazat celý encounter? Všechny příšery budou ztraceny.",
    // Tweaks
    tweaksTitle: "TERMINAL TWEAKS",
    tDisplay: "DISPLAY",
    tTheme: "Theme",
    tScanline: "Scanline intensity",
    tFontSize: "Font size",
    tFlicker: "CRT flicker",
    tAudio: "AUDIO",
    tSound: "Sound effects",
    tData: "DATA",
    tWipe: "WIPE LOCAL STORAGE",
    tLanguage: "LANGUAGE",
    tLangLabel: "Jazyk",
    langMixed: "MIX",
    langCs: "CZ",
    // Boot
    bootScript: [
      "TERMLINK PROTOCOL v3.14.7",
      "(C) WASTELAND OPS // UNAUTHORIZED ACCESS PROHIBITED",
      "",
      "INITIATING COMBAT TELEMETRY MODULE...",
      "LOADING BESTIARY DATABASE.......... [OK]",
      "CALIBRATING VITAL SIGNS MONITOR.... [OK]",
      "MOUNTING /USR/GM/INITIATIVE........ [OK]",
      "ESTABLISHING SECURE LINK........... [OK]",
      "",
      "WELCOME, OVERSEER.",
      "PRESS ANY KEY TO BEGIN ENCOUNTER >",
    ],
    // Log dynamic
    logSpawned: (n, hp, max) => `+ Vyvolán: ${n} (HP ${hp}/${max})`,
    logRemoved: (n) => `– Odstraněn: ${n}`,
    logSorted: "▸ Seřazeno podle iniciativy.",
    logRound: (n) => `═══ KOLO ${n} ═══`,
    logActing: (n) => `▶ Na tahu: ${n}`,
    logCleared: "▸ Encounter vymazán.",
    logSavedTpl: (n) => `★ Šablona uložena: ${n}`,
    logTplUpdated: (n) => `✎ Šablona upravena: ${n}`,
    logCreated: (n) => `+ Vytvořen: ${n}`,
    logDamage: (n, r, type, dr, p, dead) => `${n}: -${r} HP (${type.toUpperCase()}, ${dr} DR) → ${p.toUpperCase()}${dead ? " ☠ ELIMINOVÁN" : ""}`,
    logHeal: (n, a, hp, max) => `${n}: +${a} HP → ${hp}/${max}`,
    logInjAdd: (n, p, t) => `${n} / ${p.toUpperCase()}: + ÚRAZ (celkem ${t})`,
    logInjRem: (n, p, t) => `${n} / ${p.toUpperCase()}: − ÚRAZ (celkem ${t})`,
    logInjHeal: (n, p) => `${n} / ${p.toUpperCase()}: VYLÉČENO`,
  },

  cs: {
    // Topbar
    brand: "⌬ TERMLINK / BESTIÁŘ PUSTINY",
    new: "＋ NOVÁ [N]",
    bestiary: "★ BESTIÁŘ [T]",
    sortInit: "⇅ SEŘADIT PODLE INICIATIVY [R]",
    reboot: "⏻ RESTARTOVAT",
    // Sidebar
    initiativeQueue: "FRONTA INICIATIVY",
    sNew: "+ NOVÁ",
    sSort: "⇅ SEŘADIT",
    sortByInitTitle: "Seřadit podle iniciativy",
    round: "KOLO",
    next: "DALŠÍ ▶",
    emptyQueueAscii: `┌─────────────┐
│  P R Á Z D  │
│   FRONTA    │
└─────────────┘`,
    emptyQueueText: <>Žádné cíle.<br/>Stiskni [+ NOVÁ] pro přidání.</>,
    init: "INIC",
    hp: "ZD",
    lvl: "ÚR",
    clearEncounter: "VYMAZAT STŘETNUTÍ",
    // Status bar
    link: "● SPOJENÍ",
    combatants: "BOJOVNÍCI",
    alive: "ŽIVÍ",
    acting: (n) => `▶ NA TAHU: ${n.toUpperCase()}`,
    awaiting: "▷ ČEKÁNÍ NA POŘADÍ",
    hotkeys: "KLÁVESY: [N]OVÁ · [T] ŠABLONY · [R] ŘADIT · [MEZERNÍK] DALŠÍ",
    // Main empty
    encounterViewport: "OKNO STŘETNUTÍ",
    noTargetAscii: `        ╔════════════════╗
        ║  ŽÁDNÝ  CÍL    ║
        ║    VYBRÁN      ║
        ╚════════════════╝
              ▲
              │
        VYBER Z FRONTY`,
    noTargetText: "Vyber příšeru z fronty vlevo, nebo přidej novou.",
    targetDossier: "DOSSIER CÍLE //",
    xp: "ZK",
    // Vital signs
    vitalSigns: "ŽIVOTNÍ FUNKCE",
    deceased: "✗ MRTVÁ",
    critical: "⚠ KRITICKÝ STAV",
    wounded: "ZRANĚNÁ",
    stable: "STABILNÍ",
    max: "MAX",
    // Body parts
    somaticMap: "MAPA TĚLESNÉ INTEGRITY",
    bpOk: "OK",
    bpInjury: (n) => `▲ ${n}× ÚRAZ`,
    bpClickHint: "Klik = vybrat | Pravý klik = + úraz",
    selected: "VYBRÁNO",
    injuryCount: (n) => `(${n}× úraz)`,
    addInjury: "+ ÚRAZ",
    removeInjury: "− ÚRAZ",
    healPart: "VYLÉČIT",
    // Damage panel
    damageIntake: "PŘÍJEM ZRANĚNÍ",
    type: "TYP:",
    damagePh: "ZRANĚNÍ",
    apply: (p) => `POUŽÍT → ${p.toUpperCase()}`,
    stageApply: (n) => `⚔ ZAÚTOČIT −${n}`,
    stageReadout: (n) => `NAČTENO −${n}`,
    stageHint: "Naskládej zásahy přes −1 / −5, pak ZAÚTOČIT pro uplatnění přes odolnost.",
    stageClear: "vymazat načtené zranění",
    heal5: "+5 LÉČBA",
    full: "PLNÉ ZD",
    // Stats
    attributes: "ATRIBUTY",
    attributesSpecial: "S.P.E.C.I.A.L",
    body: "TĚLO", mind: "MYSL", melee: "BLÍZKÝ", guns: "ZBRANĚ", other: "OSTATNÍ",
    hpMax: "MAX ZD", initiativeStat: "INICIATIVA", defense: "OBRANA",
    damageResistance: "ODOLNOST PROTI ZRANĚNÍ",
    physDR: "FYZ. OD", energyDR: "ENERG. OD", radDR: "RAD. OD", poisonDR: "JED. OD",
    statusEffects: "STAVOVÉ EFEKTY",
    armament: "VÝZBROJ // ÚTOKY",
    specialAbilities: "ZVLÁŠTNÍ SCHOPNOSTI",
    inventoryTitle: "INVENTÁŘ // KOŘIST",
    gmNotes: "POZNÁMKY VYPRAVĚČE",
    edit: "✎ UPRAVIT",
    duplicate: "⎘ DUPLIKOVAT",
    saveTpl: "★ ULOŽIT JAKO ŠABLONU",
    remove: "✗ ODSTRANIT",
    // Log
    combatLog: "BOJOVÝ ZÁZNAM",
    entries: "ZÁZNAMŮ",
    awaitingData: "> čekání na bojová data...",
    clearLog: "VYMAZAT ZÁZNAM",
    // Edit modal
    creatureEditor: "EDITOR PŘÍŠER",
    bestiaryEntry: "ZÁZNAM V BESTIÁŘI",
    record: "ZÁZNAM",
    cancelBtn: "ZRUŠIT",
    commitBtn: "✓ PŘIDAT DO STŘETNUTÍ",
    toBestiaryBtn: "★ ULOŽIT DO BESTIÁŘE",
    saveTplBtn: "✓ ULOŽIT DO BESTIÁŘE",
    editTplBtn: "✎ UPRAVIT",
    nameLabel: "Název",
    customNameLabel: "Vlastní jméno (DM)",
    customNamePh: "vlastní jméno…",
    tagsLabel: "Štítky (čárkami)",
    levelLabel: "Úroveň",
    xpLabel: "ZK",
    hpMaxLabel: "Max ZD",
    hpCurLabel: "Aktuální ZD",
    initLabel: "Iniciativa",
    defLabel: "Obrana",
    attrTitle: "▸ ATRIBUTY (Fallout 2d20)",
    attrModeLabel: "SADA:",
    attrModeCreature: "PŘÍŠERA",
    attrModeSpecial: "S.P.E.C.I.A.L",
    specialTitle: "▸ S.P.E.C.I.A.L (hráč)",
    spLabel: { str: "SÍL", per: "VNÍ", end: "VýD", cha: "CHA", int: "INT", agi: "OBR", lck: "ŠTĚ" },
    skillsTitle: "▸ DOVEDNOSTI",
    skillsLabel: "DOVEDNOSTI",
    skillTag: "TAG",
    meleeBonusLabel: "MELEE",
    luckPtsLabel: "LUCK",
    meleeBonusFull: "BONUS K MELEE",
    luckPtsFull: "BODY ŠTĚSTÍ",
    skillsHint: "Nastav úroveň u trénovaných dovedností; TAG označí specializace. Na kartě se zobrazí jen vyplněné.",
    skLabel: { athletics: "ATLETIKA", barter: "SMLOUVÁNÍ", bigGuns: "TĚŽKÉ ZBR.", energyWeapons: "ENERG. ZBR.", explosives: "VÝBUŠNINY", lockpick: "PÁČENÍ", medicine: "MEDICÍNA", meleeWeapons: "ZBR. NABLÍŽKO", pilot: "PILOTOVÁNÍ", repair: "OPRAVY", science: "VĚDA", smallGuns: "LEHKÉ ZBR.", sneak: "PLÍŽENÍ", speech: "MLUVENÍ", survival: "PŘEŽITÍ", throwing: "HÁZENÍ", unarmed: "BEZE ZBRANĚ" },
    drTitle: "▸ ODOLNOST PROTI ZRANĚNÍ",
    drModeLabel: "REŽIM:",
    drModeCommon: "SPOLEČNÁ",
    drModePerPart: "PO ČÁSTECH TĚLA",
    drPartHint: "Prázdné pole = převezme SPOLEČNOU hodnotu.",
    drFieldLabel: (k) => {
      const map = { phys: "FYZ.", energy: "ENERG.", rad: "RAD.", poison: "JED." };
      return `${map[k] || k.toUpperCase()} OD (číslo nebo „Imunní")`;
    },
    drTypedPh: "vlastní popis (volitelné)",
    attacksTitle: "▸ ÚTOKY",
    addBtn: "+ PŘIDAT",
    abilitiesTitle: "▸ ZVLÁŠTNÍ SCHOPNOSTI",
    abNamePh: "Název",
    abDescPh: "Popis",
    invTitle: "▸ INVENTÁŘ (řádek = položka)",
    notesTitle: "▸ POZNÁMKY VYPRAVĚČE",
    cancel: "ZRUŠIT",
    commit: "✓ POTVRDIT",
    // Templates
    bestiaryTitle: "BESTIÁŘ // VYBER ŠABLONU",
    deleteBtn: "✗ SMAZAT",
    close: "ZAVŘÍT",
    // Confirm
    confirmTitle: "POTVRZENÍ AKCE",
    confirmCancel: "[ESC] ZRUŠIT",
    confirmYes: "[Y] POTVRDIT",
    confirmRemove: (n) => `Odstranit ${n} ze střetnutí? Tuto akci nelze vrátit.`,
    confirmClearAll: "Vymazat celé střetnutí? Všechny příšery budou ztraceny.",
    // Tweaks
    tweaksTitle: "NASTAVENÍ TERMINÁLU",
    tDisplay: "ZOBRAZENÍ",
    tTheme: "Motiv",
    tScanline: "Intenzita řádkování",
    tFontSize: "Velikost písma",
    tFlicker: "Blikání CRT",
    tAudio: "ZVUK",
    tSound: "Zvukové efekty",
    tData: "DATA",
    tWipe: "VYMAZAT MÍSTNÍ ÚLOŽIŠTĚ",
    tLanguage: "JAZYK",
    tLangLabel: "Jazyk",
    langMixed: "MIX",
    langCs: "ČJ",
    // Boot
    bootScript: [
      "PROTOKOL TERMLINK v3.14.7",
      "(C) OPERACE PUSTINY // NEOPRÁVNĚNÝ PŘÍSTUP ZAKÁZÁN",
      "",
      "SPOUŠTĚNÍ MODULU BOJOVÉ TELEMETRIE...",
      "NAČÍTÁNÍ DATABÁZE BESTIÁŘE........ [OK]",
      "KALIBRACE MONITORU ŽIVOT. FUNKCÍ.. [OK]",
      "PŘIPOJOVÁNÍ /USR/VYP/INICIATIVA... [OK]",
      "NAVAZOVÁNÍ ZABEZPEČENÉHO SPOJENÍ.. [OK]",
      "",
      "VÍTEJ, VYPRAVĚČI.",
      "STISKNI LIBOVOLNOU KLÁVESU PRO ZAČÁTEK >",
    ],
    // Log dynamic
    logSpawned: (n, hp, max) => `+ Vyvolán: ${n} (ZD ${hp}/${max})`,
    logRemoved: (n) => `– Odstraněn: ${n}`,
    logSorted: "▸ Seřazeno podle iniciativy.",
    logRound: (n) => `═══ KOLO ${n} ═══`,
    logActing: (n) => `▶ Na tahu: ${n}`,
    logCleared: "▸ Střetnutí vymazáno.",
    logSavedTpl: (n) => `★ Šablona uložena: ${n}`,
    logTplUpdated: (n) => `✎ Šablona upravena: ${n}`,
    logCreated: (n) => `+ Vytvořen: ${n}`,
    logDamage: (n, r, type, dr, p, dead) => {
      const typeMap = { phys: "FYZ", energy: "ENERG", rad: "RAD", poison: "JED" };
      const partMap = { head: "HLAVA", torso: "HRUDNÍK", larm: "L.RUKA", rarm: "P.RUKA", lleg: "L.NOHA", rleg: "P.NOHA" };
      return `${n}: -${r} ZD (${typeMap[type] || type.toUpperCase()}, ${dr} OD) → ${partMap[p] || p.toUpperCase()}${dead ? " ☠ ELIMINOVÁN" : ""}`;
    },
    logHeal: (n, a, hp, max) => `${n}: +${a} ZD → ${hp}/${max}`,
    logInjAdd: (n, p, t) => {
      const partMap = { head: "HLAVA", torso: "HRUDNÍK", larm: "L.RUKA", rarm: "P.RUKA", lleg: "L.NOHA", rleg: "P.NOHA" };
      return `${n} / ${partMap[p] || p.toUpperCase()}: + ÚRAZ (celkem ${t})`;
    },
    logInjRem: (n, p, t) => {
      const partMap = { head: "HLAVA", torso: "HRUDNÍK", larm: "L.RUKA", rarm: "P.RUKA", lleg: "L.NOHA", rleg: "P.NOHA" };
      return `${n} / ${partMap[p] || p.toUpperCase()}: − ÚRAZ (celkem ${t})`;
    },
    logInjHeal: (n, p) => {
      const partMap = { head: "HLAVA", torso: "HRUDNÍK", larm: "L.RUKA", rarm: "P.RUKA", lleg: "L.NOHA", rleg: "P.NOHA" };
      return `${n} / ${partMap[p] || p.toUpperCase()}: VYLÉČENO`;
    },
  },
};

// Damage type localized labels
const DMG_TYPE_LABEL = {
  mixed: { phys: "PHYS", energy: "ENERGY", rad: "RAD", poison: "POISON" },
  cs:    { phys: "FYZ",  energy: "ENERG",  rad: "RAD", poison: "JED" },
};

// Body part localized short labels
const BP_SHORT_LOCAL = {
  mixed: { head: "HEAD", torso: "TORSO", larm: "L.ARM", rarm: "R.ARM", lleg: "L.LEG", rleg: "R.LEG" },
  cs:    { head: "HLAVA", torso: "HRUDNÍK", larm: "L.RUKA", rarm: "P.RUKA", lleg: "L.NOHA", rleg: "P.NOHA" },
};

// Status effect localized
const SE_LOCAL = {
  mixed: { bleed: "Bleed", burn: "Burn", poison: "Poison", rad: "Radiation", stun: "Stun", fear: "Fear" },
  cs:    { bleed: "Krvácení", burn: "Popálení", poison: "Otrava", rad: "Radiace", stun: "Omráčení", fear: "Strach" },
};

const I18nContext = React.createContext({ lang: "mixed", t: I18N.mixed, setLang: () => {} });

function I18nProvider({ children }) {
  const initial = (() => {
    try { return localStorage.getItem(LANG_KEY) || "mixed"; } catch (e) { return "mixed"; }
  })();
  const [lang, setLangState] = React.useState(initial);
  const setLang = React.useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
  }, []);
  const value = React.useMemo(() => ({
    lang,
    setLang,
    t: I18N[lang] || I18N.mixed,
    dmgLabel: DMG_TYPE_LABEL[lang] || DMG_TYPE_LABEL.mixed,
    bpShort: BP_SHORT_LOCAL[lang] || BP_SHORT_LOCAL.mixed,
    seLabel: SE_LOCAL[lang] || SE_LOCAL.mixed,
  }), [lang, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18n() { return React.useContext(I18nContext); }

Object.assign(window, { I18nContext, I18nProvider, useI18n, I18N });
