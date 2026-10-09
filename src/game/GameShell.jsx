// The interactive tour. The bunnies drag the page in one section at a time
// (intro, work, path, contact); to send them for the next, drag a treat onto
// the bunny. Secret treats are hidden in each section. No progress is kept:
// it's a short tour, not a save file.
import { useRef, useState } from "react";
import { tour } from "../content.js";
import LandingPage from "../components/LandingPage.jsx";
import BunnySvg from "../components/BunnySvg.jsx";
import "./game.css";

const steps = tour.steps;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const OUT_MS = 650;

export default function GameShell({ onExit }) {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState("in"); // in | idle | out
  const [found, setFound] = useState([]);
  const [toast, setToast] = useState("");
  const [drag, setDrag] = useState(null); // {x, y} while a treat is held
  const bunnyRef = useRef(null);
  const moved = useRef(false);
  const s = steps[step];
  const last = step === steps.length - 1;
  const fast = reduced();

  const feed = () => {
    if (phase === "out") return;
    setToast(tour.yum);
    setPhase("out");
    setTimeout(() => {
      setToast("");
      setStep((n) => n + 1);
      setPhase("in");
      window.scrollTo({ top: 0 });
    }, fast ? 0 : OUT_MS);
  };

  const release = (e) => {
    const r = bunnyRef.current?.getBoundingClientRect();
    const hit = r && e.clientX > r.left - 30 && e.clientX < r.right + 30 && e.clientY > r.top - 30 && e.clientY < r.bottom + 30;
    setDrag(null);
    if (hit && moved.current) feed();
  };

  const findEgg = (key) => {
    if (found.includes(key)) return;
    const next = [...found, key];
    setFound(next);
    setToast(tour.found(next.length, steps.length));
    setTimeout(() => setToast(""), 1800);
  };

  return (
    <div className="tour">
      <div className={`tour-page is-${phase}`} key={step} onAnimationEnd={() => phase === "in" && setPhase("idle")}>
        <div className="tour-tow" aria-hidden="true">
          {[0, 1].map((i) => (
            <svg key={i} viewBox="-40 -50 80 90" className="tour-tow-bunny">
              <BunnySvg fur={i ? "var(--bunny-alt-b)" : "var(--bunny-alt-a)"} blaze={false} />
            </svg>
          ))}
        </div>
        <LandingPage only={s.key} />
        {!found.includes(s.key) && (
          <button className="tour-egg" style={{ left: `${s.egg.x}%`, top: `${s.egg.y}%` }}
            aria-label="A hidden treat" onClick={() => findEgg(s.key)}>🥚</button>
        )}
      </div>

      <div className="tour-bar">
        {last ? (
          <>
            <p>{tour.done(found.length, steps.length)}</p>
            <button className="btn primary" onClick={onExit}>{tour.summary}</button>
          </>
        ) : (
          <>
            <button className="tour-treat" aria-label={`Feed the bunny ${s.treat}`}
              style={drag ? { transform: `translate(${drag.dx}px, ${drag.dy}px)`, zIndex: 20 } : undefined}
              onClick={() => { if (!moved.current) feed(); moved.current = false; }}
              onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); moved.current = false; setDrag({ sx: e.clientX, sy: e.clientY, dx: 0, dy: 0 }); }}
              onPointerMove={(e) => { if (!drag) return; if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) moved.current = true; setDrag({ ...drag, dx: e.clientX - drag.sx, dy: e.clientY - drag.sy }); }}
              onPointerUp={release}
              onPointerCancel={() => setDrag(null)}>
              {s.treat}
            </button>
            <p className="tour-ask">{s.ask}<small>{tour.drag}</small></p>
            <svg ref={bunnyRef} viewBox="-40 -50 80 90" className="tour-bunny" role="img" aria-label="A hungry bunny">
              <BunnySvg pose="wave" />
            </svg>
          </>
        )}
      </div>
      {toast && <div className="tour-toast" role="status">{toast}</div>}
    </div>
  );
}
