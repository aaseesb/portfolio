// Small flat glyphs for the floating blocks on the island. A project picks one
// by name with `icon:` in content.js; an unknown or missing name falls back to
// a plain block, so adding a project never breaks the scene.
const paths = {
  // A chess piece, for the robotic arm.
  chess: "M8 4h8l-1 3 2 2-2 2 1 7H8l1-7-2-2 2-2z",
  // An open book.
  book: "M3 6c4-2 6-2 9 0 3-2 5-2 9 0v12c-4-2-6-2-9 0-3-2-5-2-9 0z",
  // A leaf, for the shea tree.
  leaf: "M5 19C4 11 9 5 19 4c1 9-4 14-11 15l-2 1z",
  // A film frame, for the movie picker.
  film: "M3 5h18v14H3z M6 5v14 M18 5v14",
  // A bell, for the seat alert.
  bell: "M12 3a6 6 0 0 1 6 6v5l2 3H4l2-3V9a6 6 0 0 1 6-6z M10 20h4",
  // A noughts-and-crosses grid.
  grid: "M4 9h16 M4 15h16 M9 4v16 M15 4v16",
};

export default function ProjectIcon({ name }) {
  const d = paths[name];
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="project-icon">
      {d ? (
        <path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
      )}
    </svg>
  );
}
