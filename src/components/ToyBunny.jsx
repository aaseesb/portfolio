import { useEffect, useState } from "react";
import { bunnyLines } from "../content.js";
import BunnySvg from "./BunnySvg.jsx";

// A wooden toy bunny sitting in the corner of the scene. It reacts to whichever
// project is selected rather than to scroll position, so it fits the one-state
// interaction model instead of fighting it. Its lines live in content.js.
export default function ToyBunny({ selectedSlug }) {
  const [hopKey, setHopKey] = useState(0);
  const line = bunnyLines[selectedSlug || "idle"];

  // Hop whenever the selection changes.
  useEffect(() => setHopKey((k) => k + 1), [selectedSlug]);

  if (!line) return null;

  return (
    <aside className="toy-bunny" aria-live="polite">
      <p key={line} className="bunny-bubble">{line}</p>
      <button
        className="bunny-button"
        onClick={() => setHopKey((k) => k + 1)}
        aria-label="Pet the bunny"
      >
        <svg key={hopKey} className="bunny-svg" viewBox="-30 -46 60 60" role="img" aria-label="Toy bunny">
          <g transform="translate(0, -12) scale(0.8)">
            <BunnySvg />
          </g>
        </svg>
      </button>
    </aside>
  );
}
