// The game's state machine: intro → hub ⇄ level → card → finale. Progress is
// kept in localStorage when it's available; the game works without it.
import { useCallback, useState } from "react";
import { projects, profile, treats, bunnyLines } from "../content.js";
import ProjectVisual from "../components/ProjectVisual.jsx";
import ContactForm from "../components/ContactForm.jsx";
import Intro from "./Intro.jsx";
import Hub from "./Hub.jsx";
import Level from "./Level.jsx";
import "./game.css";

const KEY = "bunny-progress";
const load = () => {
  try {
    const p = JSON.parse(localStorage.getItem(KEY));
    if (p && Array.isArray(p.done)) return { done: p.done, treats: p.treats || 0 };
  } catch { /* no storage */ }
  return { done: [], treats: 0 };
};
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function GameShell({ onExit }) {
  const [progress, setProgress] = useState(load);
  const [scene, setScene] = useState(() => (reduced() ? "hub" : "intro"));
  const [level, setLevel] = useState(0);

  const save = useCallback((next) => {
    setProgress(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  const win = useCallback((collected) => {
    const slug = projects[level].slug;
    save({
      done: progress.done.includes(slug) ? progress.done : [...progress.done, slug],
      treats: progress.treats + (progress.done.includes(slug) ? 0 : collected || 0),
    });
    setScene("card");
  }, [level, progress, save]);

  const intro = useCallback(() => setScene("hub"), []);
  const p = projects[level];

  if (scene === "intro") return <Intro onDone={intro} />;
  if (scene === "level")
    return (
      <Level key={level} index={level} project={p} treat={treats[p.slug] || "🥕"}
        onWin={win} onSkip={() => win(0)} onHub={() => setScene("hub")} />
    );
  if (scene === "card")
    return (
      <div className="game-card">
        <p className="game-card-line">{bunnyLines[p.slug]}</p>
        <ProjectVisual name={p.name} icon={p.icon} image={p.image} variant="hero" />
        <h2>{p.name}</h2>
        <p className="muted">{p.badge}</p>
        <p>{p.description}</p>
        <ul className="panel-tech">{p.tech.map((t) => <li key={t}>{t}</li>)}</ul>
        <div className="panel-actions">
          {p.demo && <a className="btn primary" href={p.demo} target="_blank" rel="noopener">Visit site ↗</a>}
          {p.repo && <a className="btn" href={p.repo} target="_blank" rel="noopener">Code</a>}
          <button className="btn" onClick={() => setScene("hub")}>Back to burrow</button>
        </div>
      </div>
    );
  if (scene === "finale")
    return (
      <div className="game-card">
        <h2>Everyone's fed!</h2>
        <p>Thanks for playing. Here's how to reach me.</p>
        <ContactForm endpoint={profile.formEndpoint} email={profile.email} />
        <div className="panel-actions">
          <button className="btn primary" onClick={onExit}>See the summary</button>
          <button className="btn" onClick={() => setScene("hub")}>Back to burrow</button>
        </div>
      </div>
    );
  return (
    <Hub progress={progress} onPlay={(i) => { setLevel(i); setScene("level"); }}
      onFeed={() => save({ ...progress, treats: Math.max(0, progress.treats - 1) })}
      onFinale={() => setScene("finale")} />
  );
}
