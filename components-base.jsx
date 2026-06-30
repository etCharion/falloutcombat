// Reusable UI atoms
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// === SOUND (visual click feedback via tiny WebAudio beeps) ===
let _audioCtx = null;
function getCtx() {
  if (!_audioCtx) {
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { _audioCtx = null; }
  }
  return _audioCtx;
}
function beep(freq = 660, dur = 0.04, type = "square", gain = 0.04) {
  const ctx = getCtx();
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  o.stop(ctx.currentTime + dur + 0.01);
}
window._sfx = {
  click: () => beep(900, 0.025, "square", 0.03),
  type: () => beep(1400 + Math.random()*200, 0.012, "square", 0.015),
  damage: () => { beep(180, 0.05, "sawtooth", 0.06); setTimeout(()=>beep(120, 0.06, "sawtooth", 0.05), 30); },
  heal: () => { beep(880, 0.06, "sine", 0.04); setTimeout(()=>beep(1200, 0.06, "sine", 0.04), 50); },
  death: () => { beep(220, 0.08, "sawtooth", 0.06); setTimeout(()=>beep(110, 0.18, "sawtooth", 0.06), 80); },
  beep: (f) => beep(f, 0.04, "square", 0.03),
};

// === HP segmented bar ===
function HPBar({ hp, hpMax, segments = 20 }) {
  const pct = Math.max(0, Math.min(1, hp / Math.max(1, hpMax)));
  const filled = Math.round(pct * segments);
  let cls = "hpbar";
  if (pct <= 0.25) cls += " crit";
  else if (pct <= 0.5) cls += " warn";
  return (
    <div className={cls}>
      {Array.from({ length: segments }).map((_, i) => (
        <div key={i} className={"seg" + (i >= filled ? " lost" : "")} />
      ))}
    </div>
  );
}

// === Stat cell ===
function StatCell({ label, value, small }) {
  return (
    <div className="stat-cell">
      <div className="stat-val" style={small ? { fontSize: 18 } : null}>{value}</div>
      <div className="stat-key">{label}</div>
    </div>
  );
}

// === Boot screen (typewriter intro) ===
function BootScreen({ onDone }) {
  const { t } = useI18n();
  const [lines, setLines] = useState([]);
  const [done, setDone] = useState(false);
  const script = t.bootScript;
  useEffect(() => {
    let i = 0;
    const tick = () => {
      if (i < script.length) {
        setLines((prev) => [...prev, script[i]]);
        if (script[i] && script[i].length > 2) window._sfx.type();
        i++;
        setTimeout(tick, 80 + Math.random() * 50);
      } else {
        setDone(true);
      }
    };
    setTimeout(tick, 200);
  }, []);
  useEffect(() => {
    if (!done) return;
    const handler = () => onDone();
    window.addEventListener("keydown", handler);
    window.addEventListener("click", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("click", handler);
    };
  }, [done, onDone]);
  return (
    <div className="boot">
      <pre>
        {lines.join("\n")}
        {done ? <span className="cursor"></span> : <span className="cursor"></span>}
      </pre>
    </div>
  );
}

// === ASCII corner brackets ===
function Frame({ children, className = "", style = {} }) {
  return (
    <div className={"term-frame " + className} style={style}>
      <span className="corner-tl"></span>
      <span className="corner-br"></span>
      {children}
    </div>
  );
}

// === Confirm dialog ===
function Confirm({ open, msg, onYes, onNo }) {
  const { t } = useI18n();
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onNo}>
      <Frame className="modal" style={{ maxWidth: 480 }}>
        <div className="titlebar"><span className="dot" /> {t.confirmTitle}</div>
        <div className="modal-body">
          <p style={{ margin: 0 }}>{msg}</p>
        </div>
        <div className="modal-footer">
          <button className="term-btn ghost" onClick={onNo}>{t.confirmCancel}</button>
          <button className="term-btn danger" onClick={onYes}>{t.confirmYes}</button>
        </div>
      </Frame>
    </div>
  );
}

Object.assign(window, {
  HPBar, StatCell, BootScreen, Frame, Confirm,
});
