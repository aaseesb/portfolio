import { useRef } from "react";

// The hero tilts a few degrees toward the cursor, so the piece reads as an
// object sitting in space rather than a picture. Pointer-driven and capped;
// skipped entirely on touch and under reduced motion.
const MAX_DEG = 6;

export default function HeroParallax({ children }) {
  const ref = useRef(null);

  const canTilt = () =>
    window.matchMedia("(hover: hover)").matches &&
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

  const onMove = (e) => {
    const el = ref.current;
    if (!el || !canTilt()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const clamp = (n) => Math.max(-1, Math.min(1, n));
    el.style.setProperty("--ry", `${clamp(x) * MAX_DEG}deg`);
    el.style.setProperty("--rx", `${clamp(-y) * MAX_DEG}deg`);
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  };

  return (
    <div
      ref={ref}
      className="hero-parallax"
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </div>
  );
}
