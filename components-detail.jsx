// Comma-separated list input that keeps a raw text buffer, so spaces inside
// and at the end of entries can be typed (parsing/trimming only feeds the model).
function CommaListInput({ value, onChange, ...rest }) {
  const [text, setText] = React.useState(() => (value || []).join(", "));
  React.useEffect(() => {
    const incoming = (value || []).join(", ");
    const mine = text.split(",").map((s) => s.trim()).filter(Boolean).join(", ");
    if (incoming !== mine) setText(incoming);
  }, [value]);
  return (
    <input {...rest} value={text} onChange={(e) => {
      setText(e.target.value);
      onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean));
    }} />);
}

// Newline-separated list textarea that keeps a raw text buffer, so spaces,
// trailing spaces, and blank lines can be typed freely (parsing/trimming only
// feeds the model on read).
function LineListTextarea({ value, onChange, ...rest }) {
  const [text, setText] = React.useState(() => (value || []).join("\n"));
  React.useEffect(() => {
    const incoming = (value || []).join("\n");
    const mine = text.split("\n").map((s) => s.trim()).filter(Boolean).join("\n");
    if (incoming !== mine) setText(incoming);
  }, [value]);
  return (
    <textarea {...rest} value={text} onChange={(e) => {
      setText(e.target.value);
      onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean));
    }} />);
}

// Combat log + Templates + Edit modal
function LogPanel({ entries, onClear }) {
  const { t } = useI18n();
  return (
    <Frame className="area-detail">
      <div className="titlebar">
        <span className="dot" /> {t.combatLog}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--fg-dim)" }}>{entries.length} {t.entries}</span>
      </div>
      <div className="log-list">
        {entries.length === 0 &&
        <div style={{ color: "var(--fg-dim)", padding: 12, fontSize: 13 }}>
            {t.awaitingData}
            <span className="cursor"></span>
          </div>
        }
        {entries.map((e, i) =>
        <div key={i} className={"log-line " + (e.kind || "")}>
            <span className="log-time">[{e.time}]</span>
            {e.text}
          </div>
        )}
      </div>
      <div style={{ padding: 6, borderTop: "1px solid var(--border)", display: "flex", gap: 4 }}>
        <button className="term-btn ghost" style={{ fontSize: 11, flex: 1 }} onClick={onClear}>{t.clearLog}</button>
      </div>
    </Frame>);

}

// === Edit / Create modal ===
function EditMonsterModal({ open, monster, onSave, onSaveToBestiary, onClose }) {
  const { t, dmgLabel, bpShort } = useI18n();
  const [m, setM] = React.useState(() => monster ? normalizeMonster(JSON.parse(JSON.stringify(monster))) : monster);
  React.useEffect(() => {setM(monster ? normalizeMonster(JSON.parse(JSON.stringify(monster))) : monster);}, [monster]);
  if (!open || !m) return null;
  const isTpl = !!m.__tid;

  const set = (path, val) => {
    setM((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let o = next;
      for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
      o[keys[keys.length - 1]] = val;
      return next;
    });
  };

  const addAttack = () => {
    setM((prev) => ({ ...prev, attacks: [...(prev.attacks || []), { id: uid(), name: "New Attack", type: "Melee", tn: 6, damage: "3CD", range: "C", effects: [] }] }));
  };
  const removeAttack = (id) => setM((prev) => ({ ...prev, attacks: prev.attacks.filter((a) => a.id !== id) }));
  const addAbility = () => setM((prev) => ({ ...prev, abilities: [...(prev.abilities || []), { name: "New Ability", desc: "" }] }));
  const removeAbility = (i) => setM((prev) => ({ ...prev, abilities: prev.abilities.filter((_, idx) => idx !== i) }));

  return (
    <div className="modal-backdrop">
      <Frame className="modal" style={{ maxWidth: 900 }} onClick={(e) => e.stopPropagation && e.stopPropagation()}>
        <div className="titlebar" onClick={(e) => e.stopPropagation()}>
          <span className="dot" /> {isTpl ? t.bestiaryEntry : t.creatureEditor}
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--fg-dim)" }}>{t.record} #{isTpl ? m.__tid : m.id}</span>
        </div>
        <div className="modal-body" onClick={(e) => e.stopPropagation()}>
          <div className="form-grid cols-2">
            <div className="form-row">
              <label className="lbl">{t.nameLabel}</label>
              <input className="term-input" value={m.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="form-row">
              <label className="lbl">{t.customNameLabel}</label>
              <input className="term-input" value={m.customName || ""} placeholder={t.customNamePh} onChange={(e) => set("customName", e.target.value)} />
            </div>
            <div className="form-row">
              <label className="lbl">{t.tagsLabel}</label>
              <CommaListInput className="term-input" value={m.tags} onChange={(tags) => set("tags", tags)} />
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: 10 }}>
            <div className="form-row"><label className="lbl">{t.levelLabel}</label><input className="term-input" type="number" value={m.level} onChange={(e) => set("level", +e.target.value)} /></div>
            <div className="form-row"><label className="lbl">{t.xpLabel}</label><input className="term-input" type="number" value={m.xp} onChange={(e) => set("xp", +e.target.value)} /></div>
            <div className="form-row"><label className="lbl">{t.hpMaxLabel}</label><input className="term-input" type="number" value={m.hpMax} onChange={(e) => {const v = +e.target.value;setM((prev) => ({ ...prev, hpMax: v, hp: Math.min(prev.hp, v) }));}} /></div>
            <div className="form-row"><label className="lbl">{t.hpCurLabel}</label><input className="term-input" type="number" value={m.hp} onChange={(e) => set("hp", +e.target.value)} /></div>
            <div className="form-row"><label className="lbl">{t.initLabel}</label><input className="term-input" type="number" value={m.initiative} onChange={(e) => set("initiative", +e.target.value)} /></div>
            <div className="form-row"><label className="lbl">{t.defLabel}</label><input className="term-input" type="number" value={m.defense} onChange={(e) => set("defense", +e.target.value)} /></div>
          </div>

          <div className="form-section" data-comment-anchor="33e79fa676-div-85-11">
            <div className="form-section-title" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <span>{m.attrMode === "special" ? t.specialTitle : t.attrTitle}</span>
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                <span className="lbl" style={{ margin: 0 }}>{t.attrModeLabel}</span>
                <button type="button" className={"term-btn" + (m.attrMode !== "special" ? " accent" : " ghost")}
                style={{ fontSize: 11, padding: "2px 8px" }} onClick={() => set("attrMode", "creature")}>{t.attrModeCreature}</button>
                <button type="button" className={"term-btn" + (m.attrMode === "special" ? " accent" : " ghost")}
                style={{ fontSize: 11, padding: "2px 8px" }} onClick={() => set("attrMode", "special")}>{t.attrModeSpecial}</button>
              </span>
            </div>
            {m.attrMode === "special" ?
            <div className="form-grid" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
              {SPECIAL_ATTRS.map((a) =>
              <div key={a.id} className="form-row">
                  <label className="lbl">{t.spLabel[a.id]}</label>
                  <input className="term-input" type="number" value={m.special[a.id]} onChange={(e) => set("special." + a.id, +e.target.value)} />
                </div>
              )}
              <div className="form-row">
                <label className="lbl">{t.meleeBonusFull}</label>
                <input className="term-input" type="number" value={m.meleeBonus || 0} onChange={(e) => set("meleeBonus", +e.target.value)} />
              </div>
              <div className="form-row">
                <label className="lbl">{t.luckPtsFull}</label>
                <input className="term-input" type="number" value={m.luckPoints || 0} onChange={(e) => set("luckPoints", +e.target.value)} />
              </div>
            </div> :
            <div className="form-grid">
              {["body", "mind", "melee", "guns", "other"].map((k) =>
              <div key={k} className="form-row">
                  <label className="lbl">{k}</label>
                  <input className="term-input" type="number" value={m.stats[k]} onChange={(e) => set("stats." + k, +e.target.value)} />
                </div>
              )}
            </div>
            }
          </div>

          {m.attrMode === "special" &&
          <div className="form-section">
            <div className="form-section-title">{t.skillsTitle}</div>
            <div className="skill-grid">
              {FALLOUT_SKILLS.map((sk) => {
                const sv = m.skills[sk.id] || { rank: 0, tag: false };
                return (
                <div key={sk.id} className={"skill-row" + (sv.tag ? " is-tag" : "")}>
                  <label className="lbl skill-name">{t.skLabel[sk.id]} <span className="skill-attr">{t.spLabel[sk.attr]}</span></label>
                  <input className="term-input" type="number" value={sv.rank}
                    onChange={(e) => set("skills." + sk.id + ".rank", +e.target.value)} />
                  <button type="button" className={"term-btn skill-tag" + (sv.tag ? " accent" : " ghost")}
                    onClick={() => set("skills." + sk.id + ".tag", !sv.tag)} title={t.skillsHint}>{t.skillTag}</button>
                </div>);
              })}
            </div>
            <div className="lbl" style={{ marginTop: 6 }}>{t.skillsHint}</div>
          </div>
          }

          <div className="form-section" data-comment-anchor="e74fd25c01-div-97-11">
            <div className="form-section-title" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <span>{t.drTitle}</span>
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                <span className="lbl" style={{ margin: 0 }}>{t.drModeLabel}</span>
                <button type="button" className={"term-btn" + (m.drMode !== "perPart" ? " accent" : " ghost")}
                style={{ fontSize: 11, padding: "2px 8px" }} onClick={() => set("drMode", "common")}>{t.drModeCommon}</button>
                <button type="button" className={"term-btn" + (m.drMode === "perPart" ? " accent" : " ghost")}
                style={{ fontSize: 11, padding: "2px 8px" }} onClick={() => set("drMode", "perPart")}>{t.drModePerPart}</button>
              </span>
            </div>
            {m.drMode === "perPart" ?
            <div style={{ overflowX: "auto" }}>
              <table className="dr-matrix">
                <thead>
                  <tr>
                    <th></th>
                    {BODY_PARTS.map((bp) => <th key={bp.id}>{bpShort[bp.id] || bp.short}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {["phys", "energy", "rad", "poison"].map((k) =>
                  <tr key={k}>
                    <th>{dmgLabel[k]}</th>
                    {BODY_PARTS.map((bp) =>
                    <td key={bp.id}>
                      <input className="term-input" type="number"
                      value={m.dr[k].parts[bp.id] == null ? "" : m.dr[k].parts[bp.id]}
                      placeholder={String(m.dr[k].all || 0)}
                      onChange={(e) => set(`dr.${k}.parts.${bp.id}`, e.target.value === "" ? null : +e.target.value)} />
                    </td>
                    )}
                  </tr>
                  )}
                </tbody>
              </table>
              <div className="lbl" style={{ marginTop: 6 }}>{t.drPartHint}</div>
            </div> :
            <div className="form-grid cols-2">
              {["phys", "energy", "rad", "poison"].map((k) =>
              <div key={k} className="form-row">
                  <label className="lbl">{t.drFieldLabel(k)}</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    <input className="term-input" type="number" value={m.dr[k].all} style={{ width: 80 }}
                  onChange={(e) => set(`dr.${k}.all`, +e.target.value)} />
                    <input className="term-input" placeholder={t.drTypedPh} value={m.dr[k].typed} onChange={(e) => set(`dr.${k}.typed`, e.target.value)} />
                  </div>
                </div>
              )}
            </div>
            }
          </div>

          <div className="form-section">
            <div className="form-section-title">{t.attacksTitle} <button className="term-btn accent" style={{ fontSize: 11, marginLeft: 10 }} onClick={addAttack}>{t.addBtn}</button></div>
            {(m.attacks || []).map((a, i) =>
            <div key={a.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 0.8fr 0.6fr 0.7fr 0.5fr 1.5fr auto", gap: 4, marginBottom: 6, alignItems: "end" }}>
                <div className="form-row"><label className="lbl">name</label><input className="term-input" value={a.name} onChange={(e) => {const arr = [...m.attacks];arr[i] = { ...a, name: e.target.value };set("attacks", arr);}} /></div>
                <div className="form-row"><label className="lbl">type</label>
                  <select className="term-input" value={a.type} onChange={(e) => {const arr = [...m.attacks];arr[i] = { ...a, type: e.target.value };set("attacks", arr);}}>
                    <option>Melee</option><option>Guns</option><option>Energy</option><option>Explosive</option><option>Unarmed</option>
                  </select>
                </div>
                <div className="form-row"><label className="lbl">TN</label><input className="term-input" type="number" value={a.tn} onChange={(e) => {const arr = [...m.attacks];arr[i] = { ...a, tn: +e.target.value };set("attacks", arr);}} /></div>
                <div className="form-row"><label className="lbl">dmg</label><input className="term-input" value={a.damage} onChange={(e) => {const arr = [...m.attacks];arr[i] = { ...a, damage: e.target.value };set("attacks", arr);}} /></div>
                <div className="form-row"><label className="lbl">rng</label><input className="term-input" value={a.range} onChange={(e) => {const arr = [...m.attacks];arr[i] = { ...a, range: e.target.value };set("attacks", arr);}} /></div>
                <div className="form-row"><label className="lbl">effects</label><CommaListInput className="term-input" value={a.effects} onChange={(eff) => {const arr = [...m.attacks];arr[i] = { ...a, effects: eff };set("attacks", arr);}} /></div>
                <button className="term-btn danger" style={{ height: 30 }} onClick={() => removeAttack(a.id)}>✗</button>
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="form-section-title">{t.abilitiesTitle} <button className="term-btn accent" style={{ fontSize: 11, marginLeft: 10 }} onClick={addAbility}>{t.addBtn}</button></div>
            {(m.abilities || []).map((a, i) =>
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 4, marginBottom: 6, alignItems: "end" }}>
                <input className="term-input" placeholder={t.abNamePh} value={a.name} onChange={(e) => {const arr = [...m.abilities];arr[i] = { ...a, name: e.target.value };set("abilities", arr);}} />
                <input className="term-input" placeholder={t.abDescPh} value={a.desc} onChange={(e) => {const arr = [...m.abilities];arr[i] = { ...a, desc: e.target.value };set("abilities", arr);}} />
                <button className="term-btn danger" onClick={() => removeAbility(i)}>✗</button>
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="form-section-title">{t.invTitle}</div>
            <LineListTextarea className="term-input" rows={4} value={m.inventory}
            onChange={(inv) => set("inventory", inv)} data-comment-anchor="ccb63adefc-textarea-201-13" />
          </div>

          <div className="form-section">
            <div className="form-section-title">▸ GM NOTES</div>
            <textarea className="term-input" rows={3} value={m.notes || ""} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="term-btn ghost" onClick={onClose}>{t.cancelBtn}</button>
          {isTpl ?
          <button className="term-btn accent" onClick={() => onSave(m)}>{t.saveTplBtn}</button> :

          <>
              <button className="term-btn" onClick={() => onSaveToBestiary(m)}>{t.toBestiaryBtn}</button>
              <button className="term-btn accent" onClick={() => onSave(m)}>{t.commitBtn}</button>
            </>
          }
        </div>
      </Frame>
    </div>);

}

// === Templates browser modal ===
function TemplatesModal({ open, templates, onPick, onEdit, onDelete, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <Frame className="modal" onClick={(e) => e.stopPropagation && e.stopPropagation()}>
        <div className="titlebar" onClick={(e) => e.stopPropagation()}>
          <span className="dot" /> BESTIARY // SELECT TEMPLATE
        </div>
        <div className="modal-body" onClick={(e) => e.stopPropagation()}>
          <div className="tpl-list">
            {templates.map((t, i) =>
            <div key={t.__tid || i} className="tpl-card" onClick={() => onPick(t)}>
                <div className="t-name">{t.name}</div>
                <div className="t-meta">
                  LVL {t.level} • HP {t.hpMax} • {t.tags?.join(" / ")}
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-dim)", marginTop: 4 }}>
                  {(t.attacks || []).slice(0, 2).map((a) => a.name).join(" • ")}
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  <button className="term-btn" style={{ fontSize: 10, padding: "2px 6px", alignSelf: "flex-start" }}
                onClick={(e) => {e.stopPropagation();onEdit(t);}}>✎ EDIT</button>
                  {t.__custom &&
                <button className="term-btn danger" style={{ fontSize: 10, padding: "2px 6px", alignSelf: "flex-start" }}
                onClick={(e) => {e.stopPropagation();onDelete(t.__tid);}}>✗ DELETE</button>
                }
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="term-btn ghost" onClick={onClose}>CLOSE</button>
        </div>
      </Frame>
    </div>);

}

Object.assign(window, { LogPanel, EditMonsterModal, TemplatesModal });
