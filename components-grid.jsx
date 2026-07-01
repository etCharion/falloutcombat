// Grid layout — every NPC has its own compact card with all info.
// Cards flow left→right then wrap, like the napkin sketch.
function GridView({ monsters, currentTurn, selectedId, onSelect, onUpdate, onLog, onDelete, onAdd }) {
  const { t } = useI18n();

  if (monsters.length === 0) {
    return (
      <Frame className="area-grid">
        <div className="titlebar"><span className="dot" /> {t.encounterViewport}</div>
        <div className="empty">
          <pre>{t.noTargetAscii}</pre>
          <div>{t.noTargetText}</div>
          <button className="term-btn accent" onClick={onAdd} style={{ marginTop: 12 }}>{t.sNew}</button>
        </div>
      </Frame>
    );
  }

  return (
    <Frame className="area-grid">
      <div className="titlebar">
        <span className="dot" />
        {t.encounterViewport}
        <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--fg-dim)", letterSpacing: "0.15em" }}>
          {monsters.length} {t.combatants}
        </span>
      </div>
      <div className="npc-grid-scroll">
        <div className="npc-grid">
          {monsters.map((m) => (
            <NPCCard
              key={m.id}
              m={m}
              isTurn={currentTurn === m.id}
              isSelected={selectedId === m.id}
              onSelect={() => onSelect(m.id)}
              onUpdate={onUpdate}
              onLog={onLog}
              onDelete={() => onDelete(m.id)}
            />
          ))}
        </div>
      </div>
    </Frame>
  );
}

function NPCCard({ m, isTurn, isSelected, onSelect, onUpdate, onLog, onDelete }) {
  const { t, lang, dmgLabel, bpShort, seLabel } = useI18n();
  const drAbbr = { phys: "PH", energy: "EN", rad: "RA", poison: "PO" };
  // Resolve a DR value to show on a body-part cell, for either DR mode.
  // Common mode: shared value (typed string wins over number); per-part: effective value.
  const drDisplay = (mm, k, partId) => {
    const d = (mm.dr && mm.dr[k]) || {};
    if (mm.drMode === "perPart") {
      const v = effectiveDR(mm, k, partId);
      return v > 0 ? v : null;
    }
    if (d.typed) return abbrImmune(d.typed);
    return (d.all > 0) ? d.all : null;
  };
  const [dmgInput, setDmgInput] = React.useState("");
  const [dmgType, setDmgType] = React.useState("phys");
  const [selectedPart, setSelectedPart] = React.useState("torso"); // target body part for DR + damage
  const [glitch, setGlitch] = React.useState(false);
  const [showDmg, setShowDmg] = React.useState(false);
  const [pending, setPending] = React.useState(0); // staged raw damage, applied via ATTACK
  const [info, setInfo] = React.useState(null); // {title, desc, anchorTop, anchorBottom, anchorCenter}
  const popoverRef = React.useRef(null);
  const [popoverPos, setPopoverPos] = React.useState(null); // {left, top, placement}

  // Clamp popover within viewport once rendered
  React.useLayoutEffect(() => {
    if (!info) { setPopoverPos(null); return; }
    const el = popoverRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const pad = 12;
    let left = info.anchorCenter - w / 2;
    let top = info.anchorBottom + 8;
    let placement = "below";
    // Flip vertically if no room below
    if (top + h > window.innerHeight - pad) {
      const above = info.anchorTop - h - 8;
      if (above >= pad) { top = above; placement = "above"; }
      else { top = Math.max(pad, window.innerHeight - h - pad); }
    }
    // Clamp horizontally
    left = Math.max(pad, Math.min(left, window.innerWidth - w - pad));
    setPopoverPos({ left, top, placement, anchorCenter: info.anchorCenter });
  }, [info]);

  // Close popover on outside click / escape
  React.useEffect(() => {
    if (!info) return;
    const close = (e) => {
      if (e.target.closest && e.target.closest(".npc-info-popover")) return;
      setInfo(null);
    };
    const esc = (e) => { if (e.key === "Escape") setInfo(null); };
    // Defer so the click that opened it doesn't immediately close
    const id = setTimeout(() => {
      document.addEventListener("mousedown", close);
      document.addEventListener("keydown", esc);
    }, 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [info]);

  const showInfo = (e, title, desc) => {
    e.stopPropagation();
    if (!desc) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setInfo({
      title,
      desc,
      anchorCenter: rect.left + rect.width / 2,
      anchorTop: rect.top,
      anchorBottom: rect.bottom,
    });
    window._sfx.click();
  };

  const showTerm = (e, term) => {
    const found = getTermDesc(term, lang);
    if (!found) return;
    showInfo(e, found.name, found.desc);
  };

  const triggerGlitch = () => { setGlitch(true); setTimeout(() => setGlitch(false), 180); };

  const applyDamage = (raw) => {
    const amt = Number(raw);
    if (!amt || isNaN(amt)) return;
    const dr = effectiveDR(m, dmgType, selectedPart);
    const reduced = Math.max(0, amt - dr);
    const newHp = Math.max(0, m.hp - reduced);
    const newDead = newHp === 0;
    onUpdate({ ...m, hp: newHp, dead: newDead });
    onLog({ kind: newDead ? "kill" : "dmg", text: t.logDamage(m.name, reduced, dmgType, dr, selectedPart, newDead) });
    triggerGlitch();
    if (newDead) window._sfx.death(); else window._sfx.damage();
    setDmgInput("");
  };

  // Quick HP change (skips DR, just direct number)
  const directHp = (delta) => {
    const newHp = Math.max(0, Math.min(m.hpMax, m.hp + delta));
    const newDead = newHp === 0;
    onUpdate({ ...m, hp: newHp, dead: newDead });
    if (delta < 0) {
      onLog({ kind: newDead ? "kill" : "dmg", text: t.logDamage(m.name, -delta, "phys", 0, "torso", newDead) });
      if (newDead) window._sfx.death(); else window._sfx.damage();
      triggerGlitch();
    } else {
      onLog({ kind: "heal", text: t.logHeal(m.name, delta, newHp, m.hpMax) });
      window._sfx.heal();
    }
  };

  const heal = (amt) => directHp(amt);

  const cycleInjury = (partId) => {
    const cur = m.bodyParts[partId]?.injuries || 0;
    const next = (cur + 1) % 5;
    const newParts = { ...m.bodyParts, [partId]: { ...m.bodyParts[partId], injuries: next } };
    onUpdate({ ...m, bodyParts: newParts });
    if (next > cur) onLog({ kind: "dmg", text: t.logInjAdd(m.name, partId, next) });
    else onLog({ kind: "info", text: t.logInjHeal(m.name, partId) });
    window._sfx.beep(440 - Math.min(next, 4) * 60);
  };

  const toggleEffect = (eid) => {
    const exists = m.effects.find(e => e.id === eid);
    const newEff = exists ? m.effects.filter(e => e.id !== eid) : [...m.effects, { id: eid, rounds: 3 }];
    onUpdate({ ...m, effects: newEff });
    window._sfx.click();
  };

  const pct = m.hp / Math.max(1, m.hpMax);
  const hpStatus = m.dead ? t.deceased : pct <= 0.25 ? t.critical : pct <= 0.5 ? t.wounded : t.stable;

  let cls = "npc-card";
  if (isTurn) cls += " turn";
  if (isSelected) cls += " selected";
  if (m.dead) cls += " dead";
  if (glitch) cls += " glitching";

  return (
    <div className={cls} onClick={onSelect}>
      {/* Corner brackets */}
      <span className="npc-corner tl"></span>
      <span className="npc-corner tr"></span>
      <span className="npc-corner bl"></span>
      <span className="npc-corner br"></span>

      {/* Header: name, level, turn marker */}
      <div className="npc-head">
        <div className="npc-head-line">
          {isTurn && <span className="npc-turn-marker">▶</span>}
          <span className="npc-name">{m.name}</span>
          <input
            className="npc-custom-input"
            value={m.customName || ""}
            placeholder={t.customNamePh}
            spellCheck={false}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => onUpdate({ ...m, customName: e.target.value })}
          />
          <span className="npc-lvl">L{m.level}</span>
        </div>
        <div className="npc-tags">
          {m.tags?.slice(0,3).map(tag => <span key={tag} className="npc-tag">{tag}</span>)}
          <span className="npc-init-mini info-clickable"
            onClick={(e) => showTerm(e, "initiative")} title="Iniciativa">
            {t.init} <b>{m.initiative ?? "—"}</b>
          </span>
        </div>
      </div>

      {/* HP block — with inline +/- controls */}
      <div className="npc-section">
        <div className="npc-hp-row">
          <span className="npc-hp-label info-clickable" onClick={(e) => showTerm(e, "hp")}>{t.hp}</span>
          <span className="npc-hp-num" style={{ color: m.dead ? "var(--danger)" : "var(--fg-bright)" }}>
            {String(m.hp).padStart(2,"0")}<span className="npc-hp-max">/{m.hpMax}</span>
          </span>
          <span className="npc-hp-status" style={{ color: m.dead || pct<=0.25 ? "var(--danger)" : pct<=0.5 ? "var(--warn)" : "var(--fg-dim)" }}>
            {hpStatus}
          </span>
        </div>
        <HPBar hp={m.hp} hpMax={m.hpMax} segments={20} />
        <div className="npc-hp-controls" onClick={(e) => e.stopPropagation()}>
          <button className="term-btn danger npc-hp-btn" onClick={() => { setPending(p => p + 5); window._sfx.beep(320); }} title={t.stageHint}>−5</button>
          <button className="term-btn danger npc-hp-btn" onClick={() => { setPending(p => p + 1); window._sfx.beep(360); }} title={t.stageHint}>−1</button>
          <button className="term-btn npc-hp-btn" onClick={() => directHp(+1)} title="+1 HP (heal)">+1</button>
          <button className="term-btn npc-hp-btn" onClick={() => directHp(+5)} title="+5 HP (heal)">+5</button>
          <button className="term-btn npc-hp-btn" onClick={() => onUpdate({ ...m, hp: m.hpMax, dead: false })} title={t.full}>{t.full}</button>
          <span className="npc-dmg-sep"></span>
          {["phys","energy","rad","poison"].map(tp => {
            const dv = effectiveDR(m, tp, selectedPart);
            return (
            <button key={tp} className={"term-btn npc-hp-btn npc-dtype" + (dmgType === tp ? " active" : " ghost")}
              onClick={() => { setDmgType(tp); window._sfx.click(); }}
              title={`${dmgLabel[tp]} — ${t.damageResistance} ${dv}`}>
              {drAbbr[tp]}{dv > 0 ? ` ${dv}` : ""}
            </button>);
          })}
          {pending > 0 && (
            <>
              <button className="term-btn danger npc-hp-btn npc-stage-attack"
                onClick={() => { applyDamage(pending); setPending(0); }}
                title={`${t.stageApply(pending)}  (${dmgLabel[dmgType]} DR ${effectiveDR(m, dmgType, selectedPart)})`}>
                ⚔ −{pending}
              </button>
              <button className="term-btn ghost npc-hp-btn" onClick={() => setPending(0)} title={t.stageClear}>✕</button>
            </>
          )}
        </div>
      </div>

      {/* Body parts + Stats + DR — side by side for compactness */}
      <div className="npc-section npc-row-split">
        <div className="npc-bs-left">
          <div className="npc-section-title">{t.somaticMap}</div>
          <div className="npc-body-mini">
            {BODY_PARTS.map(bp => {
              const inj = m.bodyParts[bp.id]?.injuries || 0;
              let bcls = "npc-bp bp-" + bp.id;
              if (inj > 0 && inj < 3) bcls += " injured";
              if (inj >= 3) bcls += " crippled";
              const drCells = ["phys","energy","rad","poison"]
                .map(k => ({ k, v: drDisplay(m, k, bp.id) }))
                .filter(c => c.v != null);
              return (
                <div key={bp.id} className={bcls + (selectedPart === bp.id ? " bp-selected" : "")}
                  onClick={(e) => { e.stopPropagation(); setSelectedPart(bp.id); window._sfx.click(); }}
                  onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); cycleInjury(bp.id); }}
                  title={`${bp.name} — ${t.bpClickHint}`}
                >
                  <div className="npc-bp-name">{bpShort[bp.id] || bp.short}</div>
                  <div className="npc-bp-status">{inj === 0 ? "OK" : `▲${inj}`}</div>
                  {drCells.length > 0 && (
                  <div className="npc-bp-dr">
                    {drCells.map(c => <span key={c.k}>{drAbbr[c.k]}<b>{c.v}</b></span>)}
                  </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="npc-bs-right">
          <div className="npc-section-title">{(m.attrMode === "special") ? t.attributesSpecial : t.attributes}</div>
          {(m.attrMode === "special") ? (
          <div className="npc-stats special-row">
            {SPECIAL_ATTRS.map(a => (
              <div key={a.id} className="npc-stat"><b>{(m.special && m.special[a.id] != null) ? m.special[a.id] : 5}</b><span>{t.spLabel[a.id]}</span></div>
            ))}
            <div className="npc-stat alt info-clickable" onClick={(e) => showTerm(e, "defense")}><b>{m.defense}</b><span>{t.defense}</span></div>
            <div className="npc-stat derived"><b>{(m.meleeBonus || 0) > 0 ? "+" + m.meleeBonus : (m.meleeBonus || 0)}</b><span>{t.meleeBonusLabel}</span></div>
            <div className="npc-stat derived"><b>{m.luckPoints || 0}</b><span>{t.luckPtsLabel}</span></div>
          </div>
          ) : (
          <div className="npc-stats">
            <div className="npc-stat info-clickable" onClick={(e) => showTerm(e, "body")}><b>{m.stats.body}</b><span>{t.body}</span></div>
            <div className="npc-stat info-clickable" onClick={(e) => showTerm(e, "mind")}><b>{m.stats.mind}</b><span>{t.mind}</span></div>
            <div className="npc-stat info-clickable" onClick={(e) => showTerm(e, "melee")}><b>{m.stats.melee}</b><span>{t.melee}</span></div>
            <div className="npc-stat info-clickable" onClick={(e) => showTerm(e, "guns")}><b>{m.stats.guns}</b><span>{t.guns}</span></div>
            <div className="npc-stat info-clickable" onClick={(e) => showTerm(e, "other")}><b>{m.stats.other}</b><span>{t.other}</span></div>
            <div className="npc-stat alt info-clickable" onClick={(e) => showTerm(e, "defense")}><b>{m.defense}</b><span>{t.defense}</span></div>
          </div>
          )}
          {(m.attrMode === "special") && m.skills && FALLOUT_SKILLS.some(sk => m.skills[sk.id] && (m.skills[sk.id].rank > 0 || m.skills[sk.id].tag)) && (
          <>
            <div className="npc-section-title" style={{ marginTop: 6 }}>{t.skillsLabel}</div>
            <div className="npc-skills">
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
        </div>
      </div>

      {/* Weapons — effect chips clickable */}
      {m.attacks?.length > 0 && (
        <div className="npc-section">
          <div className="npc-section-title">{t.armament}</div>
          <div className="npc-weapons">
            {m.attacks.map(a => (
              <div key={a.id} className="npc-weapon">
                <div className="npc-weapon-line">
                  <span className="npc-weapon-name">▸ {a.name}</span>
                  <span className="npc-weapon-meta">{a.damage} · TN{a.tn} · {a.range}</span>
                </div>
                {a.effects?.length > 0 && (
                  <div className="npc-weapon-eff">
                    {a.effects.map((eff, i) => {
                      const desc = getTermDesc(eff, lang);
                      return (
                        <span key={i}
                          className={"npc-weapon-effchip" + (desc ? " info-clickable" : "")}
                          onClick={desc ? (e) => showTerm(e, eff) : undefined}
                          title={desc ? `${desc.name}: ${desc.desc}` : undefined}>
                          {eff}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Abilities — clickable to expand full desc */}
      {m.abilities?.length > 0 && (
        <div className="npc-section">
          <div className="npc-section-title">{t.specialAbilities}</div>
          <div className="npc-abilities">
            {m.abilities.map((a, i) => (
              <div key={i} className="npc-ability info-clickable"
                onClick={(e) => showInfo(e, a.name, a.desc)}
                title={a.desc}>
                <b>● {a.name}.</b> <span>{a.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status effects (compact) */}
      <div className="npc-section">
        <div className="npc-status-row">
          {STATUS_EFFECTS.map(e => {
            const active = m.effects.find(x => x.id === e.id);
            // Map effect id to GAME_TERMS key (some collide with attr names)
            const termKey = e.id === "stun" ? "stun_eff" : e.id === "rad" ? "rad_eff" : e.id;
            return (
              <span key={e.id} className={"npc-eff info-clickable" + (active ? " active" : "")}
                onClick={(ev) => { ev.stopPropagation(); toggleEffect(e.id); }}
                onContextMenu={(ev) => { ev.preventDefault(); showTerm(ev, termKey); }}
                title={e.desc + " (klik = toggle, pravý klik = popis)"}>
                {seLabel[e.id] || e.name}{active ? ` ${active.rounds}` : ""}
              </span>
            );
          })}
        </div>
      </div>

      {/* Footer: edit / duplicate / remove */}
      <div className="npc-footer" onClick={(e) => e.stopPropagation()}>
        <div className="npc-quick-row">
          <button className="term-btn ghost" onClick={() => window._dispatchEdit && window._dispatchEdit(m)} style={{ fontSize: 12, padding: "3px 10px" }}>{t.edit}</button>
          <button className="term-btn ghost" onClick={() => window._dispatchDuplicate && window._dispatchDuplicate(m)} style={{ fontSize: 12, padding: "3px 10px" }}>{t.duplicate}</button>
          <span style={{ flex: 1 }}></span>
          <button className="term-btn danger" onClick={onDelete} style={{ fontSize: 12, padding: "3px 10px" }}>{t.remove}</button>
        </div>
      </div>

      {/* Info popover */}
      {info && (
        <div className={"npc-info-popover" + (popoverPos ? " placement-" + popoverPos.placement : " measuring")}
          ref={popoverRef}
          style={popoverPos
            ? { left: popoverPos.left, top: popoverPos.top, "--arrow-x": (popoverPos.anchorCenter - popoverPos.left) + "px" }
            : { left: 0, top: 0, visibility: "hidden" }}
          onClick={(e) => { e.stopPropagation(); setInfo(null); }}>
          <div className="info-arrow"></div>
          <div className="info-title">{info.title}</div>
          <div className="info-desc">{info.desc}</div>
          <div className="info-hint">klik pro zavření</div>
        </div>
      )}
    </div>
  );
}

window.GridView = GridView;
window.NPCCard = NPCCard;
