// The interactive tour. Three bunnies (a Three.js scene, see stage.js) tow each
// section of the page in like a slide; a hero bunny circles a treat begging for
// it, you drag the treat to her, and they tow the slide away and fetch the next.
// Golden eggs are hidden in the grass. No progress is kept: it's a short tour.
import { useEffect, useRef, useState } from "react";
import { tour } from "../content.js";
import LandingPage from "../components/LandingPage.jsx";
import { createStage } from "./stage.js";
import "./game.css";

const steps = tour.steps;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function GameShell({ onExit }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const slideRef = useRef(null);
  const bubbleRef = useRef(null);
  const stageRef = useRef(null);
  const [step, setStep] = useState(0);
  const [text, setText] = useState(null);
  const [finale, setFinale] = useState(false);
  const [found, setFound] = useState(0);
  const [toast, setToast] = useState("");
  const [failed, setFailed] = useState(false);
  const toastTimer = useRef(0);
  const s = steps[step];

  useEffect(() => {
    let stage;
    const flash = (msg, ms) => { clearTimeout(toastTimer.current); setToast(msg); if (msg && ms) toastTimer.current = setTimeout(() => setToast(""), ms); };
    try {
      stage = createStage({
        canvas: canvasRef.current, root: rootRef.current, slide: slideRef.current, bubble: bubbleRef.current,
        steps, reduced: reducedMotion(),
        hooks: {
          text: tour,
          onStep: (n) => { setStep(n); setFinale(false); setText(null); slideRef.current?.scrollTo({ top: 0 }); },
          onText: setText,
          onFinale: setFinale,
          onToast: (m) => flash(m, 1400),
          onFound: (n) => { setFound(n); flash(tour.found(n, steps.length), 2200); },
        },
      });
    } catch {
      setFailed(true);
      return undefined;
    }
    stageRef.current = stage;
    if (import.meta.env.DEV) window.__tour = stage;
    return () => { stage.dispose(); clearTimeout(toastTimer.current); };
  }, []);

  if (failed) {
    return (
      <div className="tour tour-plain">
        <p>{tour.noGl}</p>
        <button className="btn primary" onClick={onExit}>{tour.summary}</button>
      </div>
    );
  }

  return (
    <div className="tour" ref={rootRef}>
      <canvas ref={canvasRef} className="tour-canvas" aria-hidden="true" />
      <div className="tour-slide" ref={slideRef}>
        <LandingPage only={s.key} />
      </div>

      <div className="tour-bubble" ref={bubbleRef} role="status" aria-live="polite">
        {text && !finale && <p>{text}</p>}
        {finale && (
          <>
            <p>{tour.done(found, steps.length)}</p>
            <button className="btn primary" onClick={onExit}>{tour.summary}</button>
          </>
        )}
      </div>

      <div className="tour-keys">
        {!finale && s.treat && <button className="btn tour-give" onClick={() => stageRef.current?.give()}>{tour.give}</button>}
        <button className="btn tour-hunt" onClick={() => stageRef.current?.collectEgg()}>{tour.hunt}</button>
      </div>
      <p className="tour-hint">{tour.hint}</p>
      {toast && <div className="tour-toast" role="status">{toast}</div>}
    </div>
  );
}
