// The interactive tour. Three bunnies (a Three.js scene, see stage.js) tow each
// section of the page in like a slide; a hero bunny circles a treat begging for
// it, you drag the treat to her, and they tow the slide away and fetch the next.
// Golden eggs are hidden in the grass. No progress is kept: it's a short tour.
import { useCallback, useEffect, useRef, useState } from "react";
import { tour } from "../content.js";
import LandingPage from "../components/LandingPage.jsx";
import { createStage } from "./stage.js";
import "./game.css";

const steps = tour.steps;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function GameShell({ onExit }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const skyRef = useRef(null);
  const scrollRef = useRef(null);
  const slideRef = useRef(null);
  const bubbleRef = useRef(null);
  const stageRef = useRef(null);
  const [step, setStep] = useState(0);
  const [text, setText] = useState(null);
  const [phase, setPhase] = useState("swap");
  const [more, setMore] = useState(false);
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
        canvas: canvasRef.current, skyCanvas: skyRef.current, root: rootRef.current, slide: slideRef.current, bubble: bubbleRef.current,
        steps, reduced: reducedMotion(),
        hooks: {
          text: tour,
          onStep: (n) => { setStep(n); setFinale(false); setText(null); scrollRef.current?.scrollTo({ top: 0 }); },
          onPhase: setPhase,
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

  // Tells the stage when the card has been read to the end, and whether to hint at more.
  const check = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const left = el.scrollHeight - el.scrollTop - el.clientHeight;
    setMore(left > 24);
    stageRef.current?.setAtEnd(left <= 24);
  }, []);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    const id = requestAnimationFrame(check);
    return () => { el.removeEventListener("scroll", check); ro.disconnect(); cancelAnimationFrame(id); };
  }, [check, step, failed]);

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
      <canvas ref={skyRef} className="tour-sky" aria-hidden="true" />
      <div className="tour-slide" ref={slideRef}>
        <div className="tour-scroll" ref={scrollRef}>
          <LandingPage only={s.key} />
        </div>
        <div className={`tour-fade${more ? " on" : ""}`} aria-hidden="true" />
        {more && (
          <button className="tour-more" onClick={() => scrollRef.current?.scrollBy({ top: scrollRef.current.clientHeight * 0.7, behavior: "smooth" })}>
            {tour.scroll} ↓
          </button>
        )}
        <div className="tour-deck" aria-hidden="true" />
      </div>
      <canvas ref={canvasRef} className="tour-canvas" aria-hidden="true" />

      <div className="tour-top">
        <span className="tour-dots" role="img" aria-label={tour.stepOf(step + 1, steps.length)}>
          {steps.map((x, i) => <i key={x.key} className={i === step ? "on" : i < step ? "done" : ""} />)}
        </span>
        {s.next && (
          <span className={`tour-next${phase === "ask" || phase === "chase" ? " pulse" : ""}`}>
            {tour.feed(s.next)} →
          </span>
        )}
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
      <p className="tour-hint">{phase === "read" ? tour.read : tour.hint}</p>
      {toast && <div className="tour-toast" role="status">{toast}</div>}
    </div>
  );
}
