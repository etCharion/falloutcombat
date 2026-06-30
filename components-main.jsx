// Main encounter view: HP, body parts, damage panel, attacks, abilities, inventory
function MainView({ monster, onUpdate, onLog, onDelete }) {
  const { t, dmgLabel, bpShort, seLabel } = useI18n();
  const [selectedPart, setSelectedPart] = React.useState("torso");
  const [dmgInput, setDmgInput] = React.useState("");
  const [dmgType, setDmgType] = React.useState("phys");
  const [glitch, setGlitch] = React.useState(false);

  if (!monster) {
    return (
      <Frame className="area-main">
        <div className="titlebar"><span className="dot" /> {t.encounterViewport}</div>
        <div className="empty">
          <pre>{t.noTargetAscii}</pre>
          <div>{t.noTargetText}</div>
        </div>
      </Frame>
    );
  }

  const m = monster;

  const triggerGlitch = () => {
    setGlitch(true);
    setTimeout(() => setGlitch(false), 200);
  };

  const applyDamage = (rawAmount, partId = selectedPart) => {
    const amt = Number(rawAmount);
    if (!amt || isNaN(amt)) return;
    const dr = effectiveDR(m, dmgType, partId);
    const reduced = Math.max(0, amt - dr);
    const newHp = Math.max(0, m.hp - reduced);
    const newDead = newHp === 0;
    const updated = { ...m, hp: newHp, dead: newDead };
    onUpdate(updated);
    onLog({
      kind: newDead ? "kill" : "dmg",
      text: t.logDamage(m.name, reduced, dmgType, dr, partId, newDead),
    });
    triggerGlitch();
    if (newDead) window._sfx.death(); else window._sfx.damage();
    setDmgInput("");
  };

  const heal = (amt) => {
    const newHp = Math.min(m.hpMax, m.hp + amt);
    onUpdate({ ...m, hp: newHp, dead: newHp === 0 });
    onLog({ kind: "heal", text: t.logHeal(m.name, amt, newHp, m.hpMax) });
    window._sfx.heal();
  };

  const addInjury = (partId) => {
    const cur = m.bodyParts[partId]?.injuries || 0;
    const next = cur + 1;
    const newParts = { ...m.bodyParts, [partId]: { ...m.bodyParts[partId], injuries: next } };
    onUpdate({ ...m, bodyParts: newParts });
    onLog({ kind: "dmg", text: t.logInjAdd(m.name, partId, next) });
    window._sfx.beep(440 - Math.min(next, 4) * 60);
  };
  const removeInjury = (partId) => {
    const cur = m.bodyParts[partId]?.injuries || 0;
    if (cur <= 0) return;
    const next = cur - 1;
    const newParts = { ...m.bodyParts, [partId]: { ...m.bodyParts[partId], injuries: next } };
    onUpdate({ ...m, bodyParts: newParts });
    onLog({ kind: "heal", text: t.logInjRem(m.name, partId, next) });
    window._sfx.heal();
  };
  const clearInjuries = (partId) => {
    const newParts = { ...m.bodyParts, [partId]: { ...m.bodyParts[partId], injuries: 0 } };
    onUpdate({ ...m, bodyParts: newParts });
    onLog({ kind: "info", text: t.logInjHeal(m.name, partId) });
    window._sfx.heal();
  };

  const toggleEffect = (eid) => {
    const exists = m.effects.find(e => e.id === eid);
    const newEff = exists ? m.effects.filter(e => e.id !== eid) : [...m.effects, { id: eid, rounds: 3 }];
    onUpdate({ ...m, effects: newEff });
    window._sfx.click();
  };

  return (
    <Frame className={"area-main" + (glitch ? " glitching" : "")}>
      <div className="titlebar">
        <span className="dot" />
        {t.targetDossier}
        <span style={{ color: "var(--accent)", textShadow: "var(--glow)" }}>{(m.customName || m.name).toUpperCase()}</span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <span className="tag">{t.lvl} {m.level}</span>
          {m.tags?.map(tag => <span key={tag} className="tag">{tag}</span>)}
          <span className="tag">{m.xp} {t.xp}</span>
        </span>
      </div>

      <div className="detail-scroll">
        {/* HP big readout */}
        <div className="panel-section">
          <h3>{t.vitalSigns}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 16, alignItems: "center" }}>
            <div>
              <HPBar hp={m.hp} hpMax={m.hpMax} segments={30} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 12, color: "var(--fg-dim)", letterSpacing: "0.15em" }}>
                <span>{t.hp}</span>
                <span>{m.dead ? t.deceased : m.hp <= m.hpMax * 0.25 ? t.critical : m.hp <= m.hpMax * 0.5 ? t.wounded : t.stable}</span>
                <span>{t.max} {m.hpMax}</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className="bignum" style={{ color: m.dead ? "var(--danger)" : "var(--fg-bright)" }}>
                {String(m.hp).padStart(2, "0")}
              </span>
              <span style={{ fontSize: 24, color: "var(--fg-dim)" }}>/{m.hpMax}</span>
            </div>
          </div>
        </div>

        {/* Body parts */}
        <div className="panel-section">
          <h3>{t.somaticMap}</h3>
          <div className="body-diagram">
            {BODY_PARTS.map(bp => {
              const inj = m.bodyParts[bp.id]?.injuries || 0;
              const cls = "body-part bp-" + bp.id + (selectedPart === bp.id ? " selected" : "") + (inj > 0 && inj < 3 ? " injured" : "") + (inj >= 3 ? " crippled" : "");
              const symbol = inj === 0 ? t.bpOk : t.bpInjury(inj);
              return (
                <div key={bp.id} className={cls}
                  onClick={() => { setSelectedPart(bp.id); window._sfx.click(); }}
                  onContextMenu={(e) => { e.preventDefault(); addInjury(bp.id); }}
                  title={t.bpClickHint}
                >
                  <div className="bp-name">{bpShort[bp.id] || bp.short}</div>
                  <div className="bp-status">{symbol}</div>
                </div>
              );
            })}
            <div className="bp-spacer">⌬</div>
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center", marginTop: 10, fontSize: 12, color: "var(--fg-dim)", flexWrap: "wrap" }}>
            <span>{t.selected}: <span style={{ color: "var(--fg-bright)", textShadow: "var(--glow)" }}>{BODY_PARTS.find(b=>b.id===selectedPart)?.name}</span> {t.injuryCount(m.bodyParts[selectedPart]?.injuries || 0)}</span>
            <span style={{ color: "var(--border-bright)" }}>│</span>
            <button className="term-btn danger" style={{ fontSize: 11, padding: "2px 8px" }} onClick={() => addInjury(selectedPart)}>{t.addInjury}</button>
            <button className="term-btn" style={{ fontSize: 11, padding: "2px 8px" }} onClick={() => removeInjury(selectedPart)}>{t.removeInjury}</button>
            <button className="term-btn ghost" style={{ fontSize: 11, padding: "2px 8px" }} onClick={() => clearInjuries(selectedPart)}>{t.healPart}</button>
          </div>
        </div>

        {/* Damage panel */}
        <div className="panel-section">
          <h3>{t.damageIntake}</h3>
          <div className="dmg-panel">
            <div className="dmg-row">
              <span className="lbl" style={{ margin: 0 }}>{t.type}</span>
              {["phys","energy","rad","poison"].map(tp => {
                const drv = effectiveDR(m, tp, selectedPart);
                return (
                <button key={tp} className={"term-btn" + (dmgType === tp ? " accent" : " ghost")} style={{ fontSize: 12, padding: "3px 8px" }} onClick={() => { setDmgType(tp); window._sfx.click(); }}>
                  {dmgLabel[tp]} {drv > 0 ? `(${drv})` : ""}
                </button>
                );
              })}
            </div>
            <div className="dmg-row">
              <input className="term-input" type="number" placeholder={t.damagePh} value={dmgInput} onChange={e => setDmgInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") applyDamage(dmgInput); }}
                style={{ flex: "0 0 120px" }} />
              <button className="term-btn danger" onClick={() => applyDamage(dmgInput)} disabled={!dmgInput}>{t.apply(bpShort[selectedPart] || selectedPart)}</button>
              <span style={{ flex: 1 }}></span>
              <button className="term-btn" onClick={() => heal(5)}>{t.heal5}</button>
              <button className="term-btn" onClick={() => onUpdate({ ...m, hp: m.hpMax, dead: false })}>{t.full}</button>
            </div>
            <div className="dmg-quick">
              {[1,2,3,5,8,12].map(n => (
                <button key={n} className="term-btn" onClick={() => applyDamage(n)}>-{n}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats grid + DR */}
        <div className="panel-section">
          <h3>{(m.attrMode === "special") ? t.attributesSpecial : t.attributes}</h3>
          {(m.attrMode === "special") ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 10 }}>
              {SPECIAL_ATTRS.map(a => (
                <StatCell key={a.id} label={t.spLabel[a.id]} value={(m.special && m.special[a.id] != null) ? m.special[a.id] : 5} />
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, marginBottom: 10 }}>
              <StatCell label={t.body} value={m.stats.body} />
              <StatCell label={t.mind} value={m.stats.mind} />
              <StatCell label={t.melee} value={m.stats.melee} />
              <StatCell label={t.guns} value={m.stats.guns} />
              <StatCell label={t.other} value={m.stats.other} />
            </div>
          )}
          {m.attrMode === "special" && m.skills && FALLOUT_SKILLS.some(sk => m.skills[sk.id] && (m.skills[sk.id].rank > 0 || m.skills[sk.id].tag)) && (
            <>
              <div className="lbl">{t.skillsLabel}</div>
              <div className="npc-skills" style={{ marginBottom: 10 }}>
                {FALLOUT_SKILLS.filter(sk => m.skills[sk.id] && (m.skills[sk.id].rank > 0 || m.skills[sk.id].tag)).map(sk => {
                  const sv = m.skills[sk.id];
                  return (
                  <span key={sk.id} className={"npc-skill" + (sv.tag ? " is-tag" : "")} title={sv.tag ? "TAG" : ""}>
                    <span className="npc-skill-name">{sv.tag ? "▸ " : ""}{t.skLabel[sk.id]}</span>
                    <b>{sv.rank}</b>
                  </span>);
                })}
              </div>
            </>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, marginBottom: 10 }}>
            <StatCell label={t.hpMax} value={m.hpMax} small />
            <StatCell label={t.initiativeStat} value={m.initiative} small />
            <StatCell label={t.defense} value={m.defense} small />
          </div>
          <div className="lbl">{t.damageResistance}</div>
          {(m.drMode === "perPart") ? (
            <div style={{ overflowX: "auto" }}>
              <table className="dr-matrix">
                <thead>
                  <tr>
                    <th></th>
                    {BODY_PARTS.map(bp => <th key={bp.id}>{bpShort[bp.id] || bp.short}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {["phys","energy","rad","poison"].map(k => (
                    <tr key={k}>
                      <th>{dmgLabel[k]}</th>
                      {BODY_PARTS.map(bp => (
                        <td key={bp.id} className={selectedPart === bp.id ? "sel" : ""}>{effectiveDR(m, k, bp.id)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="dr-row">
              <StatCell label={t.physDR} value={abbrImmune(m.dr.phys.typed || m.dr.phys.all)} small />
              <StatCell label={t.energyDR} value={abbrImmune(m.dr.energy.typed || m.dr.energy.all)} small />
              <StatCell label={t.radDR} value={abbrImmune(m.dr.rad.typed || m.dr.rad.all)} small />
              <StatCell label={t.poisonDR} value={abbrImmune(m.dr.poison.typed || m.dr.poison.all)} small />
            </div>
          )}
        </div>

        {/* Status effects */}
        <div className="panel-section">
          <h3>{t.statusEffects}</h3>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {STATUS_EFFECTS.map(e => {
              const active = m.effects.find(x => x.id === e.id);
              return (
                <span key={e.id} className={"effect-pill" + (active ? " active" : "")} onClick={() => toggleEffect(e.id)} title={e.desc}>
                  {active ? "● " : "○ "}{seLabel[e.id] || e.name}{active ? ` (${active.rounds})` : ""}
                </span>
              );
            })}
          </div>
        </div>

        {/* Attacks */}
        {m.attacks?.length > 0 && (
          <div className="panel-section">
            <h3>{t.armament}</h3>
            {m.attacks.map(a => (
              <div key={a.id} className="attack-item">
                <div>
                  <span className="at-name">▸ {a.name}</span>
                  <span className="at-meta" style={{ marginLeft: 10 }}>
                    {a.type} • TN {a.tn} • {a.damage} • RNG {a.range}
                  </span>
                </div>
                {a.effects?.length > 0 && (
                  <div className="at-effects">[{a.effects.join(", ")}]</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Abilities */}
        {m.abilities?.length > 0 && (
          <div className="panel-section">
            <h3>{t.specialAbilities}</h3>
            {m.abilities.map((a, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <span style={{ color: "var(--fg-bright)", textShadow: "var(--glow)" }}>● {a.name}.</span>{" "}
                <span style={{ color: "var(--fg-dim)" }}>{a.desc}</span>
              </div>
            ))}
          </div>
        )}

        {/* Inventory */}
        {m.inventory?.length > 0 && (
          <div className="panel-section">
            <h3>{t.inventoryTitle}</h3>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--fg)" }}>
              {m.inventory.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
          </div>
        )}

        {m.notes && (
          <div className="panel-section">
            <h3>{t.gmNotes}</h3>
            <div style={{ color: "var(--fg-dim)", whiteSpace: "pre-wrap", fontSize: 14 }}>{m.notes}</div>
          </div>
        )}

        <div style={{ padding: 14, display: "flex", gap: 6 }}>
          <button className="term-btn" onClick={() => window._dispatchEdit && window._dispatchEdit(m)}>{t.edit}</button>
          <button className="term-btn" onClick={() => window._dispatchDuplicate && window._dispatchDuplicate(m)}>{t.duplicate}</button>
          <button className="term-btn" onClick={() => window._dispatchSaveTpl && window._dispatchSaveTpl(m)}>{t.saveTpl}</button>
          <button className="term-btn danger" style={{ marginLeft: "auto" }} onClick={() => onDelete(m.id)}>{t.remove}</button>
        </div>
      </div>
    </Frame>
  );
}

window.MainView = MainView;
