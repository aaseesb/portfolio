// Origin-centred so it can be dropped anywhere with a translate().
// The outline keeps a white bunny visible against a light background.
export default function BunnySvg() {
  const outline = { stroke: "var(--border)", strokeWidth: 1.5 };
  return (
    <g>
      <g className="bunny-ears">
        <ellipse cx="-7" cy="-22" rx="6" ry="18" fill="var(--bunny)" {...outline} />
        <ellipse cx="-7" cy="-20" rx="2.5" ry="12" fill="var(--bunny-inner)" />
        <ellipse cx="8" cy="-22" rx="6" ry="18" fill="var(--bunny)" {...outline} />
        <ellipse cx="8" cy="-20" rx="2.5" ry="12" fill="var(--bunny-inner)" />
      </g>
      <circle cx="22" cy="16" r="7" fill="var(--bunny)" {...outline} />
      <ellipse cx="0" cy="10" rx="24" ry="18" fill="var(--bunny)" {...outline} />
      <circle cx="0" cy="0" r="16" fill="var(--bunny)" {...outline} />
      <circle cx="-6" cy="-2" r="3" fill="var(--bunny-eye)" />
      <circle cx="6" cy="-2" r="3" fill="var(--bunny-eye)" />
      <path d="M0 4 l-3 3 h6 z" fill="var(--bunny-inner)" />
    </g>
  );
}
