// One side-scrolling level: run, jump, collect the project's treats, then feed
// the gatekeeper at the gate. Sim state lives in a ref and is stepped at 60Hz;
// React only re-renders once per frame to draw it.
import { useEffect, useMemo, useRef, useState } from "react";
import BunnySvg from "../components/BunnySvg.jsx";
import useGameLoop from "./useGameLoop.js";
import { buildLevel, GROUND, VIEW_W, VIEW_H, TREATS_NEEDED } from "./levels.js";
import { gameText } from "../content.js";

const HALF_W = 13;

export default function Level({ index, project, treat, onWin, onSkip, onHub }) {
  const level = useMemo(() => buildLevel(index), [index]);
  const sim = useRef(null);
  const keys = useRef({ left: false, right: false, jump: false });
  const [, setTick] = useState(0);
  const [reached, setReached] = useState(false);

  if (!sim.current) {
    sim.current = {
      x: 60, y: GROUND, vx: 0, vy: 0, face: 1, ground: true, safe: 60,
      got: level.treats.map(() => false), count: 0,
    };
  }

  // Keyboard.
  useEffect(() => {
    const set = (e, v) => {
      const k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") keys.current.left = v;
      else if (k === "ArrowRight" || k === "d" || k === "D") keys.current.right = v;
      else if (k === " " || k === "ArrowUp" || k === "w" || k === "W") {
        keys.current.jump = v;
        if (v) e.preventDefault();
      } else return;
    };
    const down = (e) => set(e, true);
    const up = (e) => set(e, false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  const step = () => {
    const s = sim.current;
    const k = keys.current;
    s.vx = ((k.right ? 1 : 0) - (k.left ? 1 : 0)) * 3.4;
    if (s.vx) s.face = Math.sign(s.vx);
    if (k.jump && s.ground) { s.vy = -11; s.ground = false; }
    s.vy += 0.55;
    s.x = Math.max(HALF_W, Math.min(level.width - HALF_W, s.x + s.vx));
    const prev = s.y;
    s.y += s.vy;
    s.ground = false;
    if (s.vy >= 0) {
      for (const p of level.platforms) {
        if (s.x + HALF_W > p.x && s.x - HALF_W < p.x + p.w && prev <= p.y + 1 && s.y >= p.y) {
          s.y = p.y; s.vy = 0; s.ground = true; s.safe = Math.max(p.x + 20, Math.min(s.x, p.x + p.w - 20));
          break;
        }
      }
    }
    if (s.y > VIEW_H + 80) { s.x = s.safe; s.y = GROUND - 200; s.vy = 0; }
    level.treats.forEach((t, i) => {
      if (!s.got[i] && Math.abs(t.x - s.x) < 24 && Math.abs(t.y - (s.y - 26)) < 32) {
        s.got[i] = true; s.count += 1;
      }
    });
    const near = Math.abs(s.x - level.gateX) < 70 && s.count >= TREATS_NEEDED;
    setReached((r) => (r === near ? r : near));
  };

  useGameLoop(step, () => setTick((n) => n + 1));

  // Enter / E feeds the gatekeeper when you're standing at the gate.
  useEffect(() => {
    const onKey = (e) => {
      if (reached && (e.key === "Enter" || e.key === "e" || e.key === "E")) onWin(sim.current.count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reached, onWin]);

  const s = sim.current;
  const cam = Math.max(0, Math.min(level.width - VIEW_W, s.x - VIEW_W / 2));
  const hold = (name, v) => () => { keys.current[name] = v; };
  const btn = (name, label, cls) => (
    <button
      className={`pad-btn ${cls}`}
      aria-label={label}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); hold(name, true)(); }}
      onPointerUp={hold(name, false)}
      onPointerCancel={hold(name, false)}
    >{label}</button>
  );

  return (
    <div className="lvl">
      <div className="lvl-hud">
        <button className="btn" onClick={onHub}>‹ Burrow</button>
        <strong>{project.name}</strong>
        <span className="lvl-count">{treat} {s.count} / {TREATS_NEEDED}</span>
        <button className="btn" onClick={onSkip}>Skip level</button>
      </div>
      <svg className="lvl-svg" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-label={`${project.name} level`}>
        <rect width={VIEW_W} height={VIEW_H} fill="var(--pond-light)" />
        <g transform={`translate(${-cam} 0)`}>
          {level.platforms.map((p, i) => (
            <g key={i}>
              <rect x={p.x} y={p.y} width={p.w} height={p.y === GROUND ? VIEW_H - p.y : 14} fill="var(--soil)" />
              <rect x={p.x} y={p.y} width={p.w} height="10" rx="4" fill="var(--grass)" />
            </g>
          ))}
          {level.treats.map((t, i) => !s.got[i] && (
            <text key={i} x={t.x} y={t.y + 8} fontSize="24" textAnchor="middle">{treat}</text>
          ))}
          <g transform={`translate(${level.gateX} ${GROUND - 24}) scale(0.9)`}>
            <BunnySvg fur="var(--bunny-alt-a)" blaze={false} />
          </g>
          <text x={level.gateX} y={GROUND - 80} fontSize="12" textAnchor="middle" fill="var(--text)">
            {s.count >= TREATS_NEEDED ? "Feed me!" : `${TREATS_NEEDED - s.count} to go`}
          </text>
          <g transform={`translate(${s.x} ${s.y - 27}) scale(${0.9 * s.face} 0.9)`}>
            <BunnySvg />
          </g>
        </g>
      </svg>
      {reached && (
        <button className="btn primary lvl-feed" onClick={() => onWin(s.count)}>
          Feed the gatekeeper {treat}
        </button>
      )}
      <p className="lvl-help">{gameText.levelHelp}</p>
      <div className="pad" aria-hidden="true">
        {btn("left", "◀", "pad-l")}{btn("right", "▶", "pad-r")}{btn("jump", "⤒", "pad-j")}
      </div>
    </div>
  );
}
