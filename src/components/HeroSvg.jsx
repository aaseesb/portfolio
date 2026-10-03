// The hero piece: a chibi at a laptop with the bunny, on a wooden toy base.
//
// Drawn rather than photographed, so it stays crisp at any size and follows the
// theme — every colour is a CSS variable from styles.css. To restyle it (hair,
// skin, shirt), change `--hero-*` there; to replace it with a real picture,
// set `hero.image` in content.js and this is skipped entirely.
import BunnySvg from "./BunnySvg.jsx";

export default function HeroSvg() {
  const line = { stroke: "var(--border)", strokeWidth: 1.5 };
  return (
    <svg viewBox="0 0 100 100" role="presentation" className="hero-art">
      {/* Backdrop and the wooden base everything stands on. */}
      <circle cx="50" cy="50" r="46" fill="var(--surface-2)" />
      <ellipse cx="50" cy="84" rx="34" ry="7" fill="var(--hero-wood)" />
      <ellipse cx="50" cy="82" rx="34" ry="7" fill="var(--hero-wood-top)" />

      {/* The bunny, same artwork as the one that walks you through the page. */}
      <g transform="translate(76 66) scale(0.42)">
        <BunnySvg />
      </g>

      {/* Chibi: legs, torso, arms, head, hair. Drawn back to front. */}
      <g>
        <ellipse cx="40" cy="74" rx="17" ry="7" fill="var(--hero-jeans)" {...line} />
        <path
          d="M28 72 v-16 a12 12 0 0 1 24 0 v16 z"
          fill="var(--hero-shirt)"
          {...line}
        />
        <circle cx="40" cy="38" r="14" fill="var(--hero-skin)" {...line} />
        {/* Hair: a cap over the crown with a length either side of the face. */}
        <path
          d="M26 38 a14 14 0 0 1 28 0 q0 -4 -3 -6 h-22 q-3 2 -3 6 z"
          fill="var(--hero-hair)"
        />
        <path d="M26 36 q-3 12 0 20 q4 -10 3 -20 z" fill="var(--hero-hair)" />
        <path d="M54 36 q3 12 0 20 q-4 -10 -3 -20 z" fill="var(--hero-hair)" />
        <circle cx="35" cy="39" r="2" fill="var(--bunny-eye)" />
        <circle cx="45" cy="39" r="2" fill="var(--bunny-eye)" />
        <path
          d="M37 44 q3 2.5 6 0"
          fill="none"
          stroke="var(--bunny-eye)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        {/* Arms forward onto the keyboard. */}
        <path
          d="M29 58 q-5 8 1 11"
          fill="none"
          stroke="var(--hero-skin)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M51 58 q5 8 -1 11"
          fill="none"
          stroke="var(--hero-skin)"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>

      {/* Laptop, lid towards us so the accent colour reads as a lit screen. */}
      <g>
        <path d="M30 59 h20 l3.5 13 h-27 z" fill="var(--surface)" {...line} />
        <path d="M32 61 h16 l2.5 9.5 h-21 z" fill="var(--accent)" />
        <rect x="24" y="71.5" width="32" height="4.5" rx="2.2" fill="var(--hero-wood-top)" {...line} />
        {/* Hands resting on either side of the keyboard. */}
        <circle cx="25" cy="70" r="3.4" fill="var(--hero-skin)" {...line} />
        <circle cx="55" cy="70" r="3.4" fill="var(--hero-skin)" {...line} />
      </g>
    </svg>
  );
}
