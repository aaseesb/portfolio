// The burrow between levels: one door per project, locked until the one before
// it is done. Treats you've collected can be fed to the gang (click a bunny).
import { useState } from "react";
import BunnySvg from "../components/BunnySvg.jsx";
import ProjectIcon from "../components/ProjectIcon.jsx";
import { projects, bunnyLines, gameText } from "../content.js";

const gang = [
  { x: 90, fur: "var(--bunny-alt-a)", blaze: false },
  { x: 200, fur: undefined, blaze: true, big: true },
  { x: 310, fur: "var(--bunny-alt-b)", blaze: false, patch: true },
];

export default function Hub({ progress, onPlay, onFeed, onFinale }) {
  const [munch, setMunch] = useState(null);
  const all = projects.every((p) => progress.done.includes(p.slug));
  const feed = (i) => {
    if (progress.treats < 1) return;
    onFeed();
    setMunch(i);
    setTimeout(() => setMunch(null), 900);
  };
  return (
    <div className="hub">
      <h1>{gameText.hubTitle}</h1>
      <p className="hub-line">{gameText.hubLine}</p>
      <svg viewBox="0 0 400 120" className="hub-gang">
        <rect x="0" y="96" width="400" height="24" fill="var(--grass)" />
        {gang.map((g, i) => (
          <g key={i} transform={`translate(${g.x} ${g.big ? 72 : 78}) scale(${g.big ? 0.85 : 0.6})`}
             onClick={() => feed(i)} role="button" aria-label="Feed a bunny" style={{ cursor: "pointer" }}>
            <BunnySvg fur={g.fur} blaze={g.blaze} patch={g.patch} />
          </g>
        ))}
        {munch !== null && (
          <text x={gang[munch].x} y="20" textAnchor="middle" fontSize="16">❤ {gameText.fed}</text>
        )}
      </svg>
      <p className="hub-pouch">Treats in your pouch: <b>{progress.treats}</b></p>
      <ul className="hub-doors">
        {projects.map((p, i) => {
          const done = progress.done.includes(p.slug);
          const open = i === 0 || progress.done.includes(projects[i - 1].slug);
          return (
            <li key={p.slug}>
              <button className={`hub-door${done ? " is-done" : ""}`} disabled={!open} onClick={() => onPlay(i)}>
                <ProjectIcon name={p.icon} />
                <span>{p.name}</span>
                <small>{done ? "✓ fed — read again" : open ? bunnyLines[p.slug] ? "Open door" : "Open" : "Locked"}</small>
              </button>
            </li>
          );
        })}
      </ul>
      {all && <button className="btn primary" onClick={onFinale}>Everyone's fed — what's next?</button>}
    </div>
  );
}
