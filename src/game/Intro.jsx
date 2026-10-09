// The gang hops in from both edges and drags the screen in behind them. CSS
// only; under reduced motion GameShell skips this entirely.
import { useEffect } from "react";
import BunnySvg from "../components/BunnySvg.jsx";
import { gameText } from "../content.js";

export default function Intro({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="intro">
      <div className="intro-curtain" />
      <svg className="intro-scene" viewBox="0 0 400 140" aria-hidden="true">
        <g className="intro-b intro-b1"><g transform="translate(0 100) scale(0.6)"><BunnySvg fur="var(--bunny-alt-a)" blaze={false} /></g></g>
        <g className="intro-b intro-b2"><g transform="translate(0 100) scale(0.6)"><BunnySvg fur="var(--bunny-alt-b)" blaze={false} patch /></g></g>
        <g className="intro-b intro-b3"><g transform="translate(0 94) scale(0.9)"><BunnySvg /></g></g>
      </svg>
      <div className="intro-text">
        <h1>{gameText.introTitle}</h1>
        <p>{gameText.introLine}</p>
        <button className="btn primary" onClick={onDone}>Let's go</button>
      </div>
    </div>
  );
}
