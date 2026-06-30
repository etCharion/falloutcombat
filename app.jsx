// Main app — combines all components, manages state
const { useState, useEffect, useRef, useCallback } = React;

const LS_KEY = "fallout-tracker-v1";

function AppInner() {
  const { t, lang, setLang } = useI18n();
  const [tweaks, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "theme": "green",
    "scanlineIntensity": 0.08,
    "fontSize": 18,
    "soundEnabled": true,
    "crtCurve": false,
    "flicker": true,
    "layout": "pipboy"
  }/*EDITMODE-END*/);

  const saved = (() => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || null; } catch (e) { return null; } })();

  const [booted, setBooted] = useState(saved?.booted || false);
  const [monsters, setMonsters] = useState(saved?.monsters || []);
  const [selectedId, setSelectedId] = useState(saved?.selectedId || null);
  const [round, setRound] = useState(saved?.round || 1);
  const [currentTurn, setCurrentTurn] = useState(saved?.currentTurn || null);
  const [log, setLog] = useState(saved?.log || []);
  const [tplsCustom, setTplsCustom] = useState(saved?.tplsCustom || []);

  const [editing, setEditing] = useState(null);
  const [showTpls, setShowTpls] = useState(false);
  const [confirmState, setConfirmState] = useState({ open: false });

  // Persist
  useEffect(() => {
    const data = { booted, monsters, selectedId, round, currentTurn, log: log.slice(0, 100), tplsCustom };
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (e) {}
  }, [booted, monsters, selectedId, round, currentTurn, log, tplsCustom]);

  // Apply theme to root + dynamic css vars
  useEffect(() => {
    document.documentElement.dataset.theme = tweaks.theme;
    document.documentElement.style.setProperty("--scanline-opacity", String(tweaks.scanlineIntensity));
    document.body.style.fontSize = tweaks.fontSize + "px";
    document.body.style.animationPlayState = tweaks.flicker ? "running" : "paused";
    document.body.classList.toggle("pipboy-mode", tweaks.layout === "pipboy");
  }, [tweaks]);

  // Sound enable based on tweak
  useEffect(() => {
    const orig = window._sfx;
    if (!tweaks.soundEnabled) {
      window._sfx = new Proxy({}, { get: () => () => {} });
    } else {
      window._sfx = orig.click ? orig : window._sfxOriginal || window._sfx;
    }
  }, [tweaks.soundEnabled]);

  // Helper: append log
  const pushLog = useCallback((entry) => {
    const time = new Date().toLocaleTimeString("cs-CZ", { hour12: false });
    setLog(prev => [{ ...entry, time }, ...prev].slice(0, 200));
  }, []);

  // Selected monster
  const selected = monsters.find(m => m.id === selectedId) || null;

  // Add new monster (from blank or template)
  const addMonster = (data) => {
    const m = makeMonster({ ...(data || {}), id: uid(), bodyParts: makeBodyPartState() });
    setMonsters(prev => [...prev, m]);
    setSelectedId(m.id);
    pushLog({ kind: "info", text: t.logSpawned(m.name, m.hp, m.hpMax) });
    window._sfx.beep && window._sfx.beep(1200);
  };

  const updateMonster = (m) => {
    setMonsters(prev => prev.map(x => x.id === m.id ? m : x));
  };

  const deleteMonster = (id) => {
    const m = monsters.find(x => x.id === id);
    setConfirmState({
      open: true,
      msg: t.confirmRemove(m?.name),
      onYes: () => {
        setMonsters(prev => prev.filter(x => x.id !== id));
        if (selectedId === id) setSelectedId(null);
        if (currentTurn === id) setCurrentTurn(null);
        pushLog({ kind: "info", text: t.logRemoved(m?.name) });
        setConfirmState({ open: false });
      }
    });
  };

  const sortByInit = () => {
    setMonsters(prev => [...prev].sort((a,b) => (b.initiative||0) - (a.initiative||0)));
    pushLog({ kind: "info", text: t.logSorted });
    window._sfx.click();
  };

  const nextRound = () => {
    // Decrement effect rounds
    setMonsters(prev => prev.map(m => {
      const eff = (m.effects||[]).map(e => ({ ...e, rounds: e.rounds - 1 })).filter(e => e.rounds > 0);
      return { ...m, effects: eff };
    }));
    // Cycle current turn through alive monsters
    const alive = monsters.filter(m => !m.dead);
    if (alive.length === 0) return;
    const curIdx = alive.findIndex(m => m.id === currentTurn);
    const nextIdx = (curIdx + 1) % alive.length;
    const next = alive[nextIdx];
    if (curIdx >= alive.length - 1 || curIdx === -1) {
      setRound(r => r + 1);
      pushLog({ kind: "info", text: t.logRound(round + 1) });
    }
    setCurrentTurn(next.id);
    setSelectedId(next.id);
    pushLog({ kind: "info", text: t.logActing(next.name) });
    window._sfx.beep && window._sfx.beep(900);
  };

  const clearAll = () => {
    setConfirmState({
      open: true,
      msg: t.confirmClearAll,
      onYes: () => {
        setMonsters([]); setSelectedId(null); setCurrentTurn(null); setRound(1); setLog([]);
        pushLog({ kind: "info", text: t.logCleared });
        setConfirmState({ open: false });
      }
    });
  };

  const saveAsTemplate = (m) => {
    upsertTemplate(m);
    pushLog({ kind: "info", text: t.logSavedTpl(m.name) });
    window._sfx.heal && window._sfx.heal();
  };

  // Insert or update a bestiary template (custom). Returns the cleaned template.
  const upsertTemplate = (src) => {
    const tpl = JSON.parse(JSON.stringify(src));
    delete tpl.id; delete tpl.dead; delete tpl.effects; delete tpl.bodyParts; delete tpl.initRoll;
    if (!tpl.__tid) tpl.__tid = uid();
    tpl.__custom = true;
    setTplsCustom(prev => prev.find(x => x.__tid === tpl.__tid)
      ? prev.map(x => x.__tid === tpl.__tid ? tpl : x)
      : [tpl, ...prev]);
    return tpl;
  };

  // Open the editor on a bestiary template (defaults fork into a custom copy).
  const editTemplate = (tpl) => {
    setShowTpls(false);
    setEditing({ ...makeMonster(JSON.parse(JSON.stringify(tpl))), __tid: tpl.__tid || uid(), __custom: true });
  };

  // Wire up window dispatchers used by deeply nested buttons
  useEffect(() => {
    window._dispatchEdit = (m) => setEditing(m);
    window._dispatchDuplicate = (m) => addMonster(JSON.parse(JSON.stringify({ ...m, name: m.name + " (2)", hp: m.hpMax })));
    window._dispatchSaveTpl = (m) => saveAsTemplate(m);
  });

  const allTemplates = [...tplsCustom, ...DEFAULT_TEMPLATES];

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === "n" || e.key === "N") { setEditing(makeMonster()); }
      if (e.key === "t" || e.key === "T") { setShowTpls(true); }
      if (e.key === " ") { e.preventDefault(); nextRound(); }
      if (e.key === "r" || e.key === "R") { sortByInit(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [monsters, currentTurn, round]);

  // Clock for status bar
  const [clock, setClock] = useState("");
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("cs-CZ", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!booted) return <BootScreen onDone={() => { setBooted(true); window._sfx.beep && window._sfx.beep(1500); }} />;

  const acting = currentTurn && monsters.find(m => m.id === currentTurn);

  const isGrid = tweaks.layout === "grid" || tweaks.layout === "pipboy";
  const layoutClass = tweaks.layout === "pipboy" ? "layout-grid layout-pipboy" : tweaks.layout === "grid" ? "layout-grid" : "layout-detail";

  return (
    <>
      <div id="app" className={layoutClass}>
        {/* TOP BAR */}
        <Frame className="area-topbar">
          <div className="topbar">
            <span className="brand glow-strong">{t.brand}</span>
            <span className="tag">v3.14.7</span>
            <span className="clock">UTC {clock}</span>
            {isGrid && (
              <span className="grid-round">{t.round} <b>{round}</b></span>
            )}
            <nav>
              <div className="layout-switcher" title="Layout">
                {[
                  { id: "detail", label: "DETAIL" },
                  { id: "grid", label: "GRID" },
                  { id: "pipboy", label: "PIP-BOY" },
                ].map(opt => (
                  <button key={opt.id}
                    className={"ls-btn" + (tweaks.layout === opt.id ? " active" : "")}
                    onClick={() => { setTweak("layout", opt.id); window._sfx.click(); }}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <button className="term-btn accent" onClick={() => setEditing(makeMonster())}>{t.new}</button>
              <button className="term-btn" onClick={() => setShowTpls(true)}>{t.bestiary}</button>
              <button className="term-btn" onClick={sortByInit}>{t.sortInit}</button>
              {isGrid && <button className="term-btn" onClick={nextRound}>{t.next}</button>}
              {isGrid && monsters.length > 0 && <button className="term-btn ghost" onClick={clearAll}>{t.clearEncounter}</button>}
              <button className="term-btn ghost" onClick={() => { setBooted(false); }}>{t.reboot}</button>
            </nav>
          </div>
        </Frame>

        {!isGrid && (
          <InitiativeSidebar
            monsters={monsters}
            currentTurn={currentTurn}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAdd={() => setShowTpls(true)}
            onSort={sortByInit}
            onNextRound={nextRound}
            round={round}
            onClearAll={clearAll}
          />
        )}

        {!isGrid && (
          <MainView
            monster={selected}
            onUpdate={updateMonster}
            onLog={pushLog}
            onDelete={deleteMonster}
          />
        )}

        {isGrid && (
          <GridView
            monsters={monsters}
            currentTurn={currentTurn}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdate={updateMonster}
            onLog={pushLog}
            onDelete={deleteMonster}
            onAdd={() => setShowTpls(true)}
          />
        )}

        {!isGrid && <LogPanel entries={log} onClear={() => setLog([])} />}

        {/* STATUS BAR */}
        <Frame className="area-status">
          <div className="statusbar">
            <span style={{ color: "var(--fg-bright)" }}>{t.link}</span>
            <span className="sep">│</span>
            <span>{t.combatants}: {monsters.length}</span>
            <span className="sep">│</span>
            <span>{t.alive}: {monsters.filter(m => !m.dead).length}</span>
            <span className="sep">│</span>
            <span>{t.round} {round}</span>
            <span className="sep">│</span>
            <span className="ticker">
              {acting ? t.acting(acting.name) : t.awaiting}
            </span>
            <span className="sep">│</span>
            <span>{t.hotkeys}</span>
          </div>
        </Frame>
      </div>

      <EditMonsterModal
        open={!!editing}
        monster={editing}
        onSave={(m) => {
          if (m.__tid) {
            upsertTemplate(m);
            pushLog({ kind: "info", text: t.logTplUpdated(m.name) });
          } else {
            const exists = monsters.find(x => x.id === m.id);
            if (exists) updateMonster(m);
            else { setMonsters(prev => [...prev, m]); setSelectedId(m.id); pushLog({ kind: "info", text: t.logCreated(m.name) }); }
          }
          setEditing(null);
          window._sfx.heal && window._sfx.heal();
        }}
        onSaveToBestiary={(m) => {
          upsertTemplate(m);
          pushLog({ kind: "info", text: t.logSavedTpl(m.name) });
          setEditing(null);
          window._sfx.heal && window._sfx.heal();
        }}
        onClose={() => setEditing(null)}
      />

      <TemplatesModal
        open={showTpls}
        templates={allTemplates}
        onPick={(t) => {
          const { __tid, __custom, ...clean } = t;
          addMonster(clean);
          setShowTpls(false);
        }}
        onEdit={editTemplate}
        onDelete={(tid) => setTplsCustom(prev => prev.filter(t => t.__tid !== tid))}
        onClose={() => setShowTpls(false)}
      />

      <Confirm
        open={confirmState.open}
        msg={confirmState.msg}
        onYes={confirmState.onYes}
        onNo={() => setConfirmState({ open: false })}
      />

      <TweaksPanel title={t.tweaksTitle}>
        <TweakSection label={t.tLanguage}>
          <TweakRadio label={t.tLangLabel} value={lang} onChange={v => setLang(v)}
            options={[{ value: "mixed", label: t.langMixed }, { value: "cs", label: t.langCs }]} />
        </TweakSection>
        <TweakSection label={t.tDisplay}>
          <TweakSelect label="Layout" value={tweaks.layout} onChange={v => setTweak("layout", v)}
            options={[{ value: "detail", label: "Detail" }, { value: "grid", label: "Grid (Terminal)" }, { value: "pipboy", label: "Pip-Boy" }]} />
          <TweakRadio label={t.tTheme} value={tweaks.theme} onChange={v => setTweak("theme", v)}
            options={[{ value: "green", label: "Green" }, { value: "amber", label: "Amber" }, { value: "science", label: "Sci" }, { value: "radiation", label: "Rad" }]} />
          <TweakSlider label={t.tScanline} min={0} max={0.25} step={0.01} value={tweaks.scanlineIntensity} onChange={v => setTweak("scanlineIntensity", v)} />
          <TweakSlider label={t.tFontSize} min={14} max={22} step={1} value={tweaks.fontSize} onChange={v => setTweak("fontSize", v)} />
          <TweakToggle label={t.tFlicker} value={tweaks.flicker} onChange={v => setTweak("flicker", v)} />
        </TweakSection>
        <TweakSection label={t.tAudio}>
          <TweakToggle label={t.tSound} value={tweaks.soundEnabled} onChange={v => setTweak("soundEnabled", v)} />
        </TweakSection>
        <TweakSection label={t.tData}>
          <TweakButton label={t.tWipe} onClick={() => { localStorage.removeItem(LS_KEY); location.reload(); }} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

function App() {
  return (
    <I18nProvider>
      <AppInner />
    </I18nProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
