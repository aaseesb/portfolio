// The hero: a blocky grass island with the chibi and the bunny on it, and a
// project block floating above each corner.
//
// Two layers. The island itself is one SVG — fixed artwork, no interaction.
// The floating blocks on top of it are real HTML buttons, so they tab, focus
// and announce like the project grid below does; drawing them inside the SVG
// would have cost all of that. Which projects float up here comes from
// content.js (the first `islandCount` of them) — never hardcode a project.
import BunnySvg from "./BunnySvg.jsx";
import ProjectIcon from "./ProjectIcon.jsx";

// Where each floating block sits, as a percentage of the stage. Four spots,
// spread around the island so they read as orbiting it rather than stacked.
const spots = [
  { left: "6%", top: "6%" },
  { left: "66%", top: "2%" },
  { left: "1%", top: "44%" },
  { left: "72%", top: "38%" },
];

export default function IslandHero({ projects, onSelect }) {
  const line = { stroke: "var(--border)", strokeWidth: 1.2 };
  return (
    <div className="island-stage">
      <svg viewBox="22 58 156 156" className="island-svg" role="img" aria-label="A grass island with a bunny on it">
        {/* Grass top, then the two visible dirt faces below it. The island is
            drawn in isometric, so every face is a sheared diamond. */}
        <g className="island-body">
          <path d="M100 150 L28 114 L28 136 L100 172 z" fill="var(--soil-dark)" {...line} />
          <path d="M100 150 L172 114 L172 136 L100 172 z" fill="var(--soil)" {...line} />
          {/* The ragged underside, so it reads as torn out of the ground. */}
          <path d="M28 136 L44 160 L58 142 L72 170 L86 150 L100 186 L114 150 L128 172 L142 144 L156 162 L172 136 L100 172 z"
                fill="var(--soil-dark)" />
          <path d="M100 114 L172 114 L100 150 L28 114 z" fill="none" />
          <path d="M100 92 L172 114 L100 136 L28 114 z" fill="var(--grass)" {...line} />
          {/* A couple of lighter tiles so the top doesn't read as flat. */}
          <path d="M100 100 L124 107 L100 114 L76 107 z" fill="var(--grass-light)" />
          <path d="M64 114 L88 121 L64 128 L40 121 z" fill="var(--grass-light)" />
        </g>

        {/* A tuft and a sapling, for scale. */}
        <path d="M150 112 l0 -8 M147 112 l-2 -6 M153 112 l2 -6" stroke="var(--grass-light)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <g>
          <rect x="43" y="98" width="3" height="12" fill="var(--hero-wood)" />
          <circle cx="44.5" cy="96" r="7" fill="var(--grass-light)" {...line} />
        </g>

        {/* The bunny, hopping. Same artwork as the one in the corner. */}
        {/* The hop is a CSS animation on the outer group — a CSS transform would
            otherwise overwrite the transform attribute that places her. */}
        <g className="island-bunny">
          <g transform="translate(130 110) scale(0.42)">
            <BunnySvg />
          </g>
        </g>

        {/* The chibi, sitting on the island with a laptop.
            The hair is three pieces in a deliberate order: the long mass behind
            her, then the face, then the fringe and the two strands that fall in
            front of her shoulders. The fringe has to be drawn as a cap that
            follows the skull's own arc — an arc-and-chord crescent leaves the
            crown bare, which is how the first version ended up with a bald
            spot. Nothing here is interactive; it is one drawing. */}
        <g transform="translate(82 104) scale(0.8)">
          {/* Hair behind the head, falling past the shoulders. Wider than the
              skull (r 16.5 against 14) so it frames the face on both sides. */}
          <path d="M0 -34.5 a16.5 16.5 0 0 1 16.5 16.5 v19 q0 5 -4 5 h-25 q-4 0 -4 -5 v-19 A16.5 16.5 0 0 1 0 -34.5 z"
                fill="var(--hero-hair)" {...line} />

          <ellipse cx="0" cy="18" rx="17" ry="6" fill="var(--hero-jeans)" {...line} />
          <path d="M-12 16 v-16 a12 12 0 0 1 24 0 v16 z" fill="var(--hero-shirt)" {...line} />

          <circle cx="0" cy="-18" r="14" fill="var(--hero-skin)" {...line} />

          {/* The fringe: over the crown along the skull's arc, then back across
              the forehead with a part just left of centre. */}
          <path d="M-14 -18 a14 14 0 0 1 28 0 L13 -23 C6 -19 1 -21 -3 -26 C-7 -21 -11 -20 -13 -23 z"
                fill="var(--hero-hair)" />
          {/* One lit strand, so the black doesn't read as a flat silhouette. */}
          <path d="M-3 -26 C1 -22 6 -20 12 -23 l1 1 C7 -18 1 -20 -3 -24 z"
                fill="var(--hero-hair-shine)" />

          {/* Strands in front of the shoulders. */}
          <path d="M-14 -21 q-5 15 -3 29 q4 2 7 0 q-4 -14 -2 -28 z" fill="var(--hero-hair)" {...line} />
          <path d="M14 -21 q5 15 3 29 q-4 2 -7 0 q4 -14 2 -28 z" fill="var(--hero-hair)" {...line} />

          <ellipse cx="-9" cy="-13" rx="2.6" ry="1.6" fill="var(--hero-blush)" />
          <ellipse cx="9" cy="-13" rx="2.6" ry="1.6" fill="var(--hero-blush)" />

          {/* Brows, then eyes with a glint — the glint is what makes a chibi
              face read as looking at you rather than as two dots. */}
          <path d="M-8 -21.5 q3 -1.5 6 -0.5" fill="none" stroke="var(--hero-hair)" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M8 -21.5 q-3 -1.5 -6 -0.5" fill="none" stroke="var(--hero-hair)" strokeWidth="1.1" strokeLinecap="round" />
          <ellipse cx="-5" cy="-16.5" rx="2.5" ry="2.9" fill="var(--bunny-eye)" />
          <ellipse cx="5" cy="-16.5" rx="2.5" ry="2.9" fill="var(--bunny-eye)" />
          <circle cx="-5.9" cy="-17.6" r="0.9" fill="var(--surface)" />
          <circle cx="4.1" cy="-17.6" r="0.9" fill="var(--surface)" />
          <path d="M-2.5 -10.5 q2.5 2.2 5 0" fill="none" stroke="var(--bunny-eye)" strokeWidth="1.2" strokeLinecap="round" />

          <path d="M-10 2 h20 l3.5 13 h-27 z" fill="var(--surface)" {...line} />
          <path d="M-8 4 h16 l2.5 9.5 h-21 z" fill="var(--accent)" />
          <rect x="-16" y="14.5" width="32" height="4.5" rx="2.2" fill="var(--hero-wood-top)" {...line} />
        </g>
      </svg>

      {/* One floating block per project, in the same order as content.js. */}
      {projects.map((p, i) => (
        <button
          key={p.slug}
          className="island-block float"
          style={{ ...spots[i], animationDelay: `${i * 0.6}s` }}
          onClick={() => onSelect(p.slug)}
          aria-label={`View the ${p.name} project`}
        >
          <ProjectIcon name={p.icon} />
          <span className="island-block-name">{p.name}</span>
        </button>
      ))}
    </div>
  );
}
