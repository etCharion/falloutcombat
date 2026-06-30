// Initiative side panel + main encounter view
const { useState: _useState, useEffect: _useEffect, useRef: _useRef } = React;

function InitiativeSidebar({ monsters, currentTurn, selectedId, onSelect, onAdd, onSort, onNextRound, round, onClearAll }) {
  const { t, seLabel } = useI18n();
  return (
    <Frame className="area-sidebar" style={{ display: "flex", flexDirection: "column" }}>
      <div className="titlebar"><span className="dot" /> {t.initiativeQueue}</div>
      <div style={{ padding: "8px 10px", display: "flex", gap: 4, flexWrap: "wrap", borderBottom: "1px solid var(--border)" }}>
        <button className="term-btn accent" onClick={onAdd}>{t.sNew}</button>
        <button className="term-btn" onClick={onSort} title={t.sortByInitTitle}>{t.sSort}</button>
      </div>
      <div className="initiative-bar" style={{ borderTop: "none" }}>
        <span className="round-counter">{t.round}<span className="num">{round}</span></span>
        <button className="term-btn" style={{ marginLeft: "auto" }} onClick={onNextRound}>{t.next}</button>
      </div>
      <div className="init-list">
        {monsters.length === 0 && (
          <div className="empty" style={{ padding: 12 }}>
            <pre>{t.emptyQueueAscii}</pre>
            <div style={{ fontSize: 13 }}>{t.emptyQueueText}</div>
          </div>
        )}
        {monsters.map((m, i) => {
          const isTurn = currentTurn === m.id;
          let cls = "init-card";
          if (selectedId === m.id) cls += " active";
          if (m.dead) cls += " dead";
          if (isTurn) cls += " turn";
          return (
            <div key={m.id} className={cls} onClick={() => { onSelect(m.id); window._sfx.click(); }}>
              <div className="init-row">
                <span className="init-num">[{String(i+1).padStart(2,"0")}] {t.init} {m.initiative ?? "—"}</span>
                <span className="init-num">{t.hp} {m.hp}/{m.hpMax}</span>
              </div>
              <div className="init-name">{m.customName || m.name}</div>
              <HPBar hp={m.hp} hpMax={m.hpMax} segments={16} />
              <div className="init-meta">
                {t.lvl} {m.level} • {m.tags?.[0] ?? m.type}
                {m.effects?.length > 0 && (
                  <span style={{ marginLeft: 6, color: "var(--warn)" }}>
                    [{m.effects.map(e => (seLabel[e.id] || e.id).toUpperCase()).join("/")}]
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {monsters.length > 0 && (
        <div style={{ padding: 8, borderTop: "1px solid var(--border)" }}>
          <button className="term-btn ghost" style={{ width: "100%", fontSize: 12 }} onClick={onClearAll}>{t.clearEncounter}</button>
        </div>
      )}
    </Frame>
  );
}

window.InitiativeSidebar = InitiativeSidebar;
