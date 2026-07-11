import React, { useState, useRef, useCallback } from "react";
import { Minus, Plus, Ruler } from "lucide-react";

/* ------------------------------------------------------------------ *
 * Bench Rule — fraction / decimal-inch / millimetre converter
 * Graduated to 1/64".  1 in = 25.4 mm (exact).
 * ------------------------------------------------------------------ */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.br-root{
  --graphite:#191b1e; --panel:#22262c; --panel2:#2a2f36; --hair:#3a4048;
  --steel:#8b939d; --steel-dim:#606771; --bone:#e7e4dc; --bone-dim:#b9b6ad;
  --amber:#f2c84b; --amber-deep:#d9a520; --amber-soft:rgba(242,200,75,0.14);
  --blade:#f0c33f;
  font-family:'IBM Plex Mono',ui-monospace,monospace;
  background:var(--graphite);
  color:var(--bone);
  min-height:100%;
  padding:26px 22px 40px;
  box-sizing:border-box;
  -webkit-font-smoothing:antialiased;
}
.br-root *{box-sizing:border-box;}
.br-cap{font-family:'Oswald',sans-serif;text-transform:uppercase;letter-spacing:.16em;}

/* header */
.br-head{max-width:940px;margin:0 auto 22px;}
.br-eyebrow{display:flex;align-items:center;gap:9px;color:var(--amber);font-size:12px;font-weight:500;}
.br-eyebrow .rule-ico{opacity:.9;}
.br-eyebrow .div{flex:1;height:1px;background:linear-gradient(90deg,var(--hair),transparent);}
.br-title{font-family:'Oswald',sans-serif;font-weight:600;letter-spacing:.02em;
  font-size:clamp(28px,5vw,44px);line-height:1.02;margin:12px 0 6px;color:var(--bone);}
.br-title b{color:var(--amber);font-weight:700;}
.br-sub{color:var(--steel);font-size:13px;letter-spacing:.01em;max-width:52ch;}

/* layout — converter + quick reference stack on the left, tall rule on the right */
.br-grid{max-width:940px;margin:0 auto;display:grid;gap:16px;
  grid-template-columns:1fr 214px;grid-template-rows:auto auto;align-items:start;}
.br-converter{grid-column:1;grid-row:1;}
.br-rule-card{grid-column:2;grid-row:1 / span 2;position:sticky;top:16px;}
.br-grid .br-table-card{grid-column:1;grid-row:2;max-width:none;margin:0;}
@media(max-width:720px){
  .br-grid{grid-template-columns:1fr;grid-template-rows:none;}
  .br-converter,.br-rule-card,.br-grid .br-table-card{grid-column:1;grid-row:auto;position:static;}
}
.br-card{background:var(--panel);border:1px solid var(--hair);border-radius:14px;
  padding:20px;position:relative;}
.br-card-label{position:absolute;top:12px;right:14px;font-size:10px;color:var(--steel-dim);}

/* readout */
.br-readout{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin:4px 0 2px;}
.br-frac{font-family:'Oswald',sans-serif;font-weight:600;color:var(--amber);
  font-size:clamp(52px,11vw,74px);line-height:.9;letter-spacing:.01em;
  text-shadow:0 0 24px var(--amber-soft);}
.br-chip{font-family:'Oswald',sans-serif;text-transform:uppercase;letter-spacing:.14em;
  font-size:10px;font-weight:500;padding:4px 8px;border-radius:5px;white-space:nowrap;}
.br-chip.exact{color:#0c0d0e;background:var(--amber);}
.br-chip.approx{color:var(--amber);background:transparent;border:1px solid var(--amber-deep);}
.br-lines{margin-top:10px;display:flex;gap:26px;flex-wrap:wrap;}
.br-lines .val{font-size:19px;color:var(--bone);}
.br-lines .val small{color:var(--steel);font-size:12px;margin-left:5px;}
.br-lines .k{display:block;font-size:9.5px;color:var(--steel-dim);margin-bottom:3px;
  font-family:'Oswald',sans-serif;text-transform:uppercase;letter-spacing:.14em;}
.br-delta{margin-top:12px;font-size:11.5px;color:var(--steel);min-height:15px;}
.br-delta b{color:var(--bone-dim);font-weight:500;}

.br-sep{height:1px;background:var(--hair);margin:18px -4px;}

/* inputs */
.br-inputs{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:12px;}
@media(max-width:520px){.br-inputs{grid-template-columns:1fr;}}
.br-field label{display:block;font-size:9.5px;color:var(--steel);margin-bottom:6px;
  font-family:'Oswald',sans-serif;text-transform:uppercase;letter-spacing:.14em;}
.br-inwrap{display:flex;align-items:stretch;background:var(--panel2);
  border:1px solid var(--hair);border-radius:8px;overflow:hidden;transition:border-color .15s;}
.br-inwrap:focus-within{border-color:var(--amber-deep);}
.br-inwrap input{flex:1;min-width:0;background:transparent;border:0;outline:0;
  color:var(--bone);font-family:'IBM Plex Mono',monospace;font-size:16px;
  padding:10px 11px;}
.br-inwrap .unit{align-self:center;color:var(--steel-dim);font-size:11px;padding-right:11px;}
.br-step{width:34px;border:0;background:transparent;color:var(--steel);cursor:pointer;
  display:flex;align-items:center;justify-content:center;transition:background .12s,color .12s;}
.br-step:first-child{border-right:1px solid var(--hair);}
.br-step:last-child{border-left:1px solid var(--hair);}
.br-step:hover{background:var(--amber-soft);color:var(--amber);}
.br-step:active{background:var(--amber);color:#0c0d0e;}

/* snap toggle */
.br-toggle{margin-top:16px;display:flex;align-items:center;gap:10px;
  font-size:12px;color:var(--steel);cursor:pointer;user-select:none;width:fit-content;}
.br-switch{width:38px;height:21px;border-radius:11px;background:var(--panel2);
  border:1px solid var(--hair);position:relative;transition:background .16s,border-color .16s;flex-shrink:0;}
.br-switch::after{content:"";position:absolute;top:2px;left:2px;width:15px;height:15px;
  border-radius:50%;background:var(--steel);transition:transform .16s,background .16s;}
.br-toggle.on .br-switch{background:var(--amber-soft);border-color:var(--amber-deep);}
.br-toggle.on .br-switch::after{transform:translateX(17px);background:var(--amber);}
.br-toggle.on{color:var(--bone-dim);}

/* rule */
.br-rule-card{padding:14px 8px;display:flex;flex-direction:column;align-items:center;}
.br-rule-card .br-card-label{right:12px;}
.br-rule-svg{width:100%;max-width:200px;height:auto;display:block;touch-action:none;
  cursor:ns-resize;outline:none;}
.br-rule-svg:focus-visible{filter:drop-shadow(0 0 3px var(--amber));}
.br-rule-hint{font-size:10px;color:var(--steel-dim);text-align:center;margin-top:8px;line-height:1.4;}

/* table */
.br-table-card{max-width:940px;margin:16px auto 0;}
.br-table-head{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
.br-table-head .t{font-family:'Oswald',sans-serif;text-transform:uppercase;
  letter-spacing:.14em;font-size:12px;color:var(--bone);}
.br-table-head .d{flex:1;height:1px;background:var(--hair);}
.br-table-head .n{font-size:10px;color:var(--steel-dim);}
.br-tbl{display:grid;grid-template-columns:1fr 1fr;gap:4px 18px;}
@media(max-width:560px){.br-tbl{grid-template-columns:1fr;}}
.br-row{display:grid;grid-template-columns:64px 1fr 1fr;align-items:center;
  padding:7px 10px;border-radius:7px;cursor:pointer;border:1px solid transparent;
  transition:background .1s,border-color .1s;font-size:13.5px;}
.br-row:hover{background:var(--panel2);}
.br-row.active{background:var(--amber-soft);border-color:var(--amber-deep);}
.br-row .rf{font-family:'Oswald',sans-serif;font-weight:600;font-size:15px;color:var(--bone);}
.br-row.active .rf{color:var(--amber);}
.br-row .rd{color:var(--steel);text-align:right;}
.br-row .rm{color:var(--bone-dim);text-align:right;}
.br-colhead{display:grid;grid-template-columns:64px 1fr 1fr;padding:0 10px 4px;
  font-family:'Oswald',sans-serif;text-transform:uppercase;letter-spacing:.1em;
  font-size:9px;color:var(--steel-dim);}
.br-colhead span:not(:first-child){text-align:right;}

.br-foot{max-width:940px;margin:22px auto 0;font-size:11px;color:var(--steel-dim);
  line-height:1.6;border-top:1px solid var(--hair);padding-top:14px;}
.br-foot b{color:var(--steel);font-weight:500;}

@media(prefers-reduced-motion:reduce){.br-root *{transition:none!important;}}
`;

/* ------- math ------- */
const MM = 25.4;
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

function roundHalfUp(v, p) {
  const f = Math.pow(10, p);
  const s = v < 0 ? -1 : 1;
  return ((Math.round(Math.abs(v) * f + 1e-9) / f) * s).toFixed(p);
}
function nearestFraction(inches) {
  const n = Math.round(inches * 64);
  const w = Math.floor(n / 64);
  const r = n - w * 64;
  if (r === 0) return w === 0 ? "0" : `${w}`;
  const g = gcd(r, 64);
  const s = `${r / g}/${64 / g}`;
  return w > 0 ? `${w} ${s}` : s;
}
const isExact = (inches) => Math.abs(inches * 64 - Math.round(inches * 64)) < 1e-7;

function parseFraction(text) {
  const t = text.trim();
  if (!t) return null;
  const parts = t.split(/\s+/);
  let whole = 0, frac = t;
  if (parts.length === 2) { whole = parseFloat(parts[0]); frac = parts[1]; }
  if (frac.includes("/")) {
    const [n, d] = frac.split("/");
    const nn = parseFloat(n), dd = parseFloat(d);
    if (!isFinite(nn) || !isFinite(dd) || dd === 0) return null;
    return (whole < 0 ? -1 : 1) * (Math.abs(whole) + nn / dd);
  }
  const v = parseFloat(t);
  return isFinite(v) ? v : null;
}

/* the quick-reference fractions, matching the source sheet */
const REF = ["0","1/64","1/32","3/64","1/16","5/64","3/32","7/64","1/8","5/32",
  "3/16","7/32","1/4","5/16","3/8","7/16","1/2","9/16","5/8","11/16","3/4",
  "13/16","7/8","15/16","1"].map((label) => {
    const [n, d] = label.includes("/") ? label.split("/").map(Number) : [Number(label), 1];
    return { label, inches: n / d };
  });

/* ------- rule geometry -------
 * Dual scale: inch/64ths grow leftward from the right blade edge,
 * millimetres grow rightward from the left blade edge. The blade spans
 * exactly 0–1 in, i.e. 0–25.4 mm. */
const VB_W = 210, VB_H = 780, TOP = 30, BOT = 752, SPAN = BOT - TOP;
const BLADE_X0 = 50, BLADE_X1 = 176, CENTER = 113;
const INCH_LBL_X = CENTER + 30;   // right-aligned inch fraction labels
const MM_LBL_X = CENTER - 29;     // left-aligned millimetre labels
const yOf = (frac) => TOP + frac * SPAN;

function inchTickLen(i) {
  if (i % 64 === 0) return 31;
  if (i % 32 === 0) return 26;
  if (i % 16 === 0) return 21;
  if (i % 8 === 0) return 16;
  if (i % 4 === 0) return 11;
  if (i % 2 === 0) return 7;
  return 4;
}
function mmTickLen(i) {
  if (i % 10 === 0) return 32;   // whole centimetre
  if (i % 5 === 0) return 21;
  return 11;
}
const EIGHTHS = [[0,"0"],[8,"1/8"],[16,"1/4"],[24,"3/8"],[32,"1/2"],
  [40,"5/8"],[48,"3/4"],[56,"7/8"],[64,"1"]];
const MM_LABELS = [0, 5, 10, 15, 20, 25];

/* ================================================================== */
export default function BenchRule() {
  const [inches, setInches] = useState(0.375);
  const [snap, setSnap] = useState(true);
  const [editing, setEditing] = useState(null); // {field, text}
  const svgRef = useRef(null);
  const dragging = useRef(false);

  const commit = (v) => { setInches(Math.max(0, v)); setEditing(null); };

  /* derived display values */
  const fracStr = nearestFraction(inches);
  const exact = isExact(inches);
  const snapped = Math.round(inches * 64) / 64;
  const dInch = inches - snapped;

  const fracVal = editing?.field === "frac" ? editing.text : fracStr;
  const decVal = editing?.field === "dec" ? editing.text : roundHalfUp(inches, 4);
  const mmVal = editing?.field === "mm" ? editing.text : roundHalfUp(inches * MM, 3);

  const onFrac = (t) => { setEditing({ field: "frac", text: t }); const v = parseFraction(t); if (v != null) setInches(Math.max(0, v)); };
  const onDec = (t) => { setEditing({ field: "dec", text: t }); const v = parseFloat(t); if (isFinite(v)) setInches(Math.max(0, v)); };
  const onMM = (t) => { setEditing({ field: "mm", text: t }); const v = parseFloat(t); if (isFinite(v)) setInches(Math.max(0, v / MM)); };
  const step = (dir) => commit((Math.round(inches * 64) + dir) / 64);

  /* rule drag → set fractional part, preserve whole inches */
  const setFromClientY = useCallback((clientY) => {
    const el = svgRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const localY = ((clientY - rect.top) / rect.height) * VB_H;
    let frac = Math.min(1, Math.max(0, (localY - TOP) / SPAN));
    if (snap) frac = Math.round(frac * 64) / 64;
    const whole = Math.floor(inches);
    commit(whole + frac);
  }, [snap, inches]);

  const onPointerDown = (e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); setFromClientY(e.clientY); };
  const onPointerMove = (e) => { if (dragging.current) setFromClientY(e.clientY); };
  const onPointerUp = () => { dragging.current = false; };
  const onKey = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") { step(1); e.preventDefault(); }
    if (e.key === "ArrowDown" || e.key === "ArrowLeft") { step(-1); e.preventDefault(); }
  };

  const fracPart = inches - Math.floor(inches);
  const cursorY = yOf(Math.min(1, fracPart === 0 && inches >= 1 ? 1 : fracPart));
  const wholeInches = Math.floor(inches + 1e-9);

  const deltaText = exact
    ? "On grid — exact 1/64 graduation."
    : `Off nearest 1/64 by ${dInch >= 0 ? "+" : "\u2212"}${roundHalfUp(Math.abs(dInch), 4)} in \u00b7 ${dInch >= 0 ? "+" : "\u2212"}${roundHalfUp(Math.abs(dInch) * MM, 3)} mm \u00b7 ${dInch >= 0 ? "+" : "\u2212"}${roundHalfUp(Math.abs(dInch) * 1000, 1)} thou`;

  return (
    <div className="br-root">
      <style>{STYLES}</style>

      <header className="br-head">
        <div className="br-eyebrow">
          <Ruler size={15} className="rule-ico" strokeWidth={2} />
          <span>Bench Reference · 0–1 in</span>
          <span className="div" />
          <span>1/64″ graduations</span>
        </div>
        <h1 className="br-title">Fraction <b>·</b> Decimal <b>·</b> Millimetre</h1>
        <p className="br-sub">Type any value, step the rule, or drag the blade. Off-grid measurements
          snap to the nearest sixty-fourth and report how far off you are.</p>
      </header>

      <div className="br-grid">
        {/* converter */}
        <section className="br-card br-converter">
          <span className="br-card-label br-cap">Readout</span>

          <div className="br-readout">
            <span className="br-frac">{exact ? fracStr : `\u2248 ${fracStr}`}″</span>
            <span className={`br-chip ${exact ? "exact" : "approx"}`}>{exact ? "Exact" : "Nearest 1/64"}</span>
          </div>

          <div className="br-lines">
            <div className="val"><span className="k">Decimal inch</span>{roundHalfUp(inches, 4)}<small>in</small></div>
            <div className="val"><span className="k">Millimetre</span>{roundHalfUp(inches * MM, 3)}<small>mm</small></div>
            {wholeInches >= 1 && (
              <div className="val"><span className="k">Whole + frac</span>{nearestFraction(inches)}<small>in</small></div>
            )}
          </div>

          <div className="br-delta">{exact ? <b>{deltaText}</b> : deltaText}</div>

          <div className="br-sep" />

          <div className="br-inputs">
            <div className="br-field">
              <label>Fraction</label>
              <div className="br-inwrap">
                <button className="br-step" onClick={() => step(-1)} aria-label="Down one sixty-fourth"><Minus size={14} /></button>
                <input value={fracVal} onChange={(e) => onFrac(e.target.value)} onBlur={() => setEditing(null)}
                  inputMode="text" spellCheck={false} aria-label="Fraction in inches" />
                <button className="br-step" onClick={() => step(1)} aria-label="Up one sixty-fourth"><Plus size={14} /></button>
              </div>
            </div>
            <div className="br-field">
              <label>Decimal in</label>
              <div className="br-inwrap">
                <input value={decVal} onChange={(e) => onDec(e.target.value)} onBlur={() => setEditing(null)}
                  inputMode="decimal" spellCheck={false} aria-label="Decimal inches" />
                <span className="unit">in</span>
              </div>
            </div>
            <div className="br-field">
              <label>Millimetre</label>
              <div className="br-inwrap">
                <input value={mmVal} onChange={(e) => onMM(e.target.value)} onBlur={() => setEditing(null)}
                  inputMode="decimal" spellCheck={false} aria-label="Millimetres" />
                <span className="unit">mm</span>
              </div>
            </div>
          </div>

          <div className={`br-toggle ${snap ? "on" : ""}`} onClick={() => setSnap(!snap)}
            role="switch" aria-checked={snap} tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setSnap(!snap); e.preventDefault(); } }}>
            <span className="br-switch" />
            <span>Snap rule to 1/64″</span>
          </div>
        </section>

        {/* rule */}
        <section className="br-card br-rule-card">
          <span className="br-card-label br-cap">Rule</span>
          <svg ref={svgRef} className="br-rule-svg" viewBox={`0 0 ${VB_W} ${VB_H}`}
            role="slider" tabIndex={0} aria-label="Measuring rule, 0 to 1 inch"
            aria-valuemin={0} aria-valuemax={1} aria-valuenow={Number(roundHalfUp(fracPart, 4))}
            onPointerDown={onPointerDown} onPointerMove={onPointerMove}
            onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onKeyDown={onKey}>

            {/* scale headers */}
            <text x={MM_LBL_X} y="17" textAnchor="start"
              fontFamily="Oswald, sans-serif" fontSize="9" fontWeight="600"
              letterSpacing="0.12em" fill="var(--steel)">MM</text>
            <text x={INCH_LBL_X} y="17" textAnchor="end"
              fontFamily="Oswald, sans-serif" fontSize="9" fontWeight="600"
              letterSpacing="0.12em" fill="var(--steel)">IN</text>

            {/* blade */}
            <rect x={BLADE_X0} y={TOP - 10} width={BLADE_X1 - BLADE_X0} height={SPAN + 20}
              rx="7" fill="var(--blade)" />
            <rect x={BLADE_X0} y={TOP - 10} width="6" height={SPAN + 20} fill="rgba(0,0,0,0.10)" />
            {/* centre spine dividing the two scales */}
            <line x1={CENTER} y1={TOP - 4} x2={CENTER} y2={BOT + 4}
              stroke="rgba(0,0,0,0.12)" strokeWidth="1" />

            {/* inch graduations (right) */}
            {Array.from({ length: 65 }, (_, i) => {
              const y = yOf(i / 64);
              const len = inchTickLen(i);
              return <line key={`in${i}`} x1={BLADE_X1 - len} y1={y} x2={BLADE_X1} y2={y}
                stroke="#171717" strokeWidth={i % 8 === 0 ? 1.6 : 0.9} />;
            })}
            {EIGHTHS.map(([i, lbl]) => (
              <text key={`inl${lbl}`} x={INCH_LBL_X} y={yOf(i / 64) + 3.2} textAnchor="end"
                fontFamily="Oswald, sans-serif" fontSize="9" fontWeight="600" fill="#171717">{lbl}</text>
            ))}

            {/* millimetre graduations (left) */}
            {Array.from({ length: 26 }, (_, i) => {
              const y = yOf(i / MM);
              const len = mmTickLen(i);
              return <line key={`mm${i}`} x1={BLADE_X0} y1={y} x2={BLADE_X0 + len} y2={y}
                stroke="#171717" strokeWidth={i % 10 === 0 ? 1.6 : 0.9} />;
            })}
            {MM_LABELS.map((i) => (
              <text key={`mml${i}`} x={MM_LBL_X} y={yOf(i / MM) + 3.2} textAnchor="start"
                fontFamily="Oswald, sans-serif" fontSize="9" fontWeight="600" fill="#171717">{i}</text>
            ))}

            {/* active marker — spans both scales */}
            <line x1="6" y1={cursorY} x2={BLADE_X1 + 4} y2={cursorY}
              stroke="var(--amber)" strokeWidth="1.6" />
            <circle cx={BLADE_X0} cy={cursorY} r="5.5" fill="var(--amber)" stroke="#0c0d0e" strokeWidth="1.4" />
            <g>
              <rect x="2" y={cursorY - 14} width="44" height="28" rx="5" fill="#0c0d0e" stroke="var(--amber-deep)" strokeWidth="1" />
              <text x="24" y={cursorY - 2} textAnchor="middle"
                fontFamily="IBM Plex Mono, monospace" fontSize="10.5" fontWeight="600" fill="var(--amber)">
                {fracPart === 0 && inches >= 1 ? "1" : nearestFraction(fracPart)}
              </text>
              <text x="24" y={cursorY + 9} textAnchor="middle"
                fontFamily="IBM Plex Mono, monospace" fontSize="8" fill="var(--steel)">
                {roundHalfUp(fracPart * MM, 1)} mm
              </text>
            </g>
          </svg>
          <div className="br-rule-hint">
            {wholeInches >= 1 ? `${wholeInches} in + ` : ""}drag or arrow-key<br />to graduate
          </div>
        </section>

        {/* reference table — beside the rule so both stay in view */}
        <section className="br-card br-table-card">
        <div className="br-table-head">
          <span className="t">Quick reference</span>
          <span className="d" />
          <span className="n">tap a row to load</span>
        </div>
        <div className="br-colhead"><span>Frac</span><span>Decimal in</span><span>mm</span></div>
        <div className="br-tbl">
          {REF.map((r) => {
            const active = Math.round(inches * 64) === Math.round(r.inches * 64);
            return (
              <div key={r.label} className={`br-row ${active ? "active" : ""}`} onClick={() => commit(r.inches)}>
                <span className="rf">{r.label}</span>
                <span className="rd">{roundHalfUp(r.inches, 4)}</span>
                <span className="rm">{roundHalfUp(r.inches * MM, 3)}</span>
              </div>
            );
          })}
        </div>
        </section>
      </div>

      <p className="br-foot">
        <b>1 inch = 25.4 mm, exact.</b> Decimal inches shown to 4 places, millimetres to 3, rounded half-up
        to match a standard workshop quick-reference. The rule is graduated 0–1″ in sixty-fourths; values
        above 1″ carry a whole-inch count while the blade shows the remaining fraction.
      </p>
    </div>
  );
}
