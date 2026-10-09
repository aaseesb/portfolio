// The front door: the bunny waves, and there are two ways in. Interactive is
// the game; the summary is the same content with none of the play.
import { profile } from "../content.js";
import BunnySvg from "../components/BunnySvg.jsx";

export default function Chooser({ onInteractive, onSummary }) {
  return (
    <main className="chooser">
      <svg viewBox="-60 -60 120 110" className="chooser-bunny" role="img" aria-label="A bunny waving hello">
        <BunnySvg pose="wave" />
      </svg>
      <h1 className="chooser-name">{profile.name}</h1>
      <p className="chooser-tag">{profile.tagline}</p>
      <div className="chooser-buttons">
        <button className="btn primary chooser-btn" onClick={onInteractive}>
          Interactive
          <span>the bunnies drag in each section; feed them to go on</span>
        </button>
        <button className="btn chooser-btn" onClick={onSummary}>
          Summary
          <span>everything on one page</span>
        </button>
      </div>
    </main>
  );
}
