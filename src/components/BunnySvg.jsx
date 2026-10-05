// Origin-centred so it can be dropped anywhere with a translate().
// Beige by default, with the diamond blaze on her forehead — that's the one the
// site is about. The small bunnies on the island pass their own `fur`, and some
// of them a `patch`, so the three of them aren't triplets. Only she wears the
// blaze, so it stays hers.
export default function BunnySvg({
  fur = "var(--bunny)",
  belly = "var(--bunny-belly)",
  blaze = true,
  patch = false,
}) {
  const outline = { stroke: "var(--border)", strokeWidth: 1.5 };
  return (
    <g>
      <g className="bunny-ears">
        <ellipse cx="-7" cy="-22" rx="6" ry="18" fill={fur} {...outline} />
        <ellipse cx="-7" cy="-20" rx="2.5" ry="12" fill="var(--bunny-inner)" />
        <ellipse cx="8" cy="-22" rx="6" ry="18" fill={fur} {...outline} />
        <ellipse cx="8" cy="-20" rx="2.5" ry="12" fill="var(--bunny-inner)" />
      </g>
      <circle cx="22" cy="16" r="7" fill={fur} {...outline} />
      <ellipse cx="0" cy="10" rx="24" ry="18" fill={fur} {...outline} />
      {/* A dappled back, for the ones that aren't her. Clipped to the body so
          it reads as markings rather than a blob floating over her side. */}
      {patch && (
        <>
          <ellipse cx="11" cy="3" rx="9" ry="7" fill={belly} opacity="0.75" />
          <ellipse cx="-11" cy="8" rx="6" ry="5" fill={belly} opacity="0.55" />
        </>
      )}
      {/* Cream underside and front feet, like hers. */}
      <ellipse cx="-2" cy="20" rx="18" ry="8" fill={belly} />
      <ellipse cx="-14" cy="25" rx="7" ry="4" fill={belly} {...outline} />
      <ellipse cx="4" cy="26" rx="7" ry="4" fill={belly} {...outline} />
      <circle cx="0" cy="0" r="16" fill={fur} {...outline} />
      {blaze && <path d="M0 -14 l3.5 5 l-3.5 5 l-3.5 -5 z" fill="var(--bunny-blaze)" />}
      <circle cx="-6" cy="-2" r="3" fill="var(--bunny-eye)" />
      <circle cx="6" cy="-2" r="3" fill="var(--bunny-eye)" />
      <path d="M0 4 l-3 3 h6 z" fill="var(--bunny-inner)" />
    </g>
  );
}
