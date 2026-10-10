// The interactive tour. A Three.js sky, grass and bunnies (stage.js) sit behind
// the text of each scene; the two treat buttons fade one scene into the next.
import { useCallback, useEffect, useRef, useState } from "react";
import { tour, projects } from "../content.js";
import { createStage } from "./stage.js";
import { Scene } from "./cards.jsx";
import Room from "./Room.jsx";
import "./game.css";

const scenes = tour.scenes;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The two treats, drawn flat. Back is a carrot, Next an apple.
const Carrot = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M14 30c10-8 26-8 34 2L30 56c-6-2-14-10-16-26z" fill="#e8934a" stroke="#8a4a1c" strokeWidth="3" strokeLinejoin="round" transform="rotate(-35 32 32)" />
    <path d="M44 14c2-6 8-8 12-6M44 14c-4-6-10-6-12-2M44 14c6 0 10 4 10 8" fill="none" stroke="#5f8a42" strokeWidth="4" strokeLinecap="round" />
  </svg>
);
const Apple = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M32 20c-8-6-20-2-20 12 0 12 8 24 16 24 2 0 2-1 4-1s2 1 4 1c8 0 16-12 16-24 0-14-12-18-20-12z" fill="#d9695f" stroke="#8a2f28" strokeWidth="3" strokeLinejoin="round" />
    <path d="M32 20c0-6 2-10 6-12" fill="none" stroke="#5f4730" strokeWidth="4" strokeLinecap="round" />
    <path d="M38 12c6-4 12-1 12 3-6 3-11 1-12-3z" fill="#78a456" stroke="#4a6e30" strokeWidth="2" />
  </svg>
);

export default function GameShell({ onExit }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const skyRef = useRef(null);
  const cardsRef = useRef(null);
  const stageRef = useRef(null);
  const [scene, setScene] = useState(0);
  const [sel, setSel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [dir, setDir] = useState("in");
  const [origin, setOrigin] = useState(null);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef(0);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(true);
  const [failed, setFailed] = useState(false);
  const toastTimer = useRef(0);
  const roomsRef = useRef([]);
  roomsRef.current = rooms;
  const item = rooms.length ? rooms[rooms.length - 1] : null;
  const itemRef = useRef(null);
  itemRef.current = item;
  const s = scenes[scene];
  const last = scene === scenes.length - 1;

  useEffect(() => {
    let stage;
    const flash = (msg, ms) => { clearTimeout(toastTimer.current); setToast(msg); if (msg && ms) toastTimer.current = setTimeout(() => setToast(""), ms); };
    try {
      stage = createStage({
        canvas: canvasRef.current, skyCanvas: skyRef.current, root: rootRef.current, cards: cardsRef.current,
        scenes, reduced: reducedMotion(),
        hooks: {
          text: tour,
          onScene: (n) => { setScene(n); setSel(null); },
          onBusy: setBusy,
          onToast: (m) => flash(m, 1200),
        },
      });
    } catch {
      setFailed(true);
      return undefined;
    }
    stageRef.current = stage;
    if (import.meta.env.DEV) window.__tour = stage;
    return () => { stage.dispose(); clearTimeout(toastTimer.current); clearTimeout(closeTimer.current); };
  }, []);

  const progress = useCallback((p) => stageRef.current?.sky(p > 0.5 ? 3 : 2), []);
  const back = useCallback(() => { if (!itemRef.current) stageRef.current?.nav(-1); }, []);
  const next = useCallback(() => {
    if (itemRef.current) return;
    if (last) onExit(); else stageRef.current?.nav(1);
  }, [last, onExit]);

  const go = useCallback((i) => { if (!itemRef.current) stageRef.current?.nav(Math.sign(i - sceneRef.current), i); }, []);
  const sceneRef = useRef(0);
  sceneRef.current = scene;

  // sunlight under the pointer: the glow layer reads --mx / --my / --glow
  useEffect(() => {
    const el = rootRef.current;
    const move = (e) => {
      if (e.pointerType === "touch") return;
      el.style.setProperty("--mx", `${e.clientX}px`); el.style.setProperty("--my", `${e.clientY}px`); el.style.setProperty("--glow", "1");
    };
    const leave = () => el.style.setProperty("--glow", "0");
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    return () => { window.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave); };
  }, []);

  useEffect(() => {
    const key = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [next, back]);

  // Step through a house's front door: the first room zooms out of the clicked spot.
  const open = useCallback((it, from) => {
    if (it.type === "project") setSel(it.i ?? projects.indexOf(it.p));
    setOrigin(from || null); setDir("in"); setClosing(false); setRooms([it]);
  }, []);
  // Walk through a door inside the house into the next room.
  const walk = useCallback((it) => {
    if (it.type === "project") setSel(projects.indexOf(it.p));
    setDir("fwd"); setRooms((r) => [...r, it]);
  }, []);
  // Keep `keep` rooms: back through the doors, or 0 to step back outside.
  const leave = useCallback((keep) => {
    const cur = roomsRef.current;
    if (keep >= cur.length || closeTimer.current) return;
    if (keep > 0) { setDir("back"); setRooms(cur.slice(0, keep)); return; }
    if (reducedMotion()) { setRooms([]); return; }
    setClosing(true);
    closeTimer.current = setTimeout(() => { closeTimer.current = 0; setRooms([]); setClosing(false); }, 380);
  }, []);

  if (failed) {
    return (
      <div className="tour tour-plain">
        <p>{tour.noGl}</p>
        <button className="btn primary" onClick={onExit}>{tour.summary}</button>
      </div>
    );
  }

  const nextLabel = last ? tour.last : tour.next(scenes[scene + 1].label);
  const backLabel = scene > 0 ? scenes[scene - 1].label : tour.back;

  return (
    <div className="tour" ref={rootRef}>
      <canvas ref={skyRef} className="tour-sky" aria-hidden="true" />

      <div className="tour-layer" ref={cardsRef} data-scene={s.key}>
        <Scene k={s.key} sel={sel} onSelect={setSel} onOpen={open} onExit={onExit} onProgress={progress} />
      </div>
      <canvas ref={canvasRef} className="tour-canvas" aria-hidden="true" />
      <div className="tour-glow" aria-hidden="true" />

      <div className="tour-top">
        <span className="tour-dots" role="group" aria-label={tour.sceneOf(scene + 1, scenes.length, s.label)}>
          {scenes.map((x, i) => (
            <button
              key={x.key} type="button" className={i === scene ? "on" : i < scene ? "done" : ""}
              aria-label={tour.goTo(x.label)} aria-current={i === scene ? "step" : undefined} title={x.label}
              disabled={busy || !!item || i === scene} onClick={() => go(i)}
            />
          ))}
        </span>
        <span className="tour-hint">{tour.hint}</span>
      </div>

      <div className="tour-treat tour-treat-back">
        <button className="tour-treat-btn" onClick={back} disabled={scene === 0 || busy} aria-label={tour.back}>
          <Carrot />
        </button>
        <span className="tour-treat-label">← {scene > 0 ? backLabel : tour.back}</span>
      </div>
      <div className="tour-treat tour-treat-next">
        <button className={`tour-treat-btn${busy ? "" : " is-ready"}`} onClick={next} disabled={busy} aria-label={nextLabel}>
          <Apple />
        </button>
        <span className="tour-treat-label">{nextLabel} →</span>
      </div>

      {toast && <div className="tour-toast" role="status">{toast}</div>}
      {item && <Room rooms={rooms} dir={dir} origin={origin} closing={closing} onWalk={walk} onLeave={leave} />}
    </div>
  );
}
