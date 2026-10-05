// One component for every visual on the page.
//
// With a `clip` it plays the demo (muted, looping, no controls) using `image`
// as the poster. With only an `image` it renders the still. Without either it
// draws a cover: the project's own glyph on a tinted plate, same box and same
// dimensions, so dropping a screenshot in later never reflows anything.
//
// The cover replaced a flat box with "render pending" printed in it, which at
// the size of the main card was a slab of nothing — it read as a page that had
// failed to load rather than a project whose screenshot isn't taken yet.
// Never pass a hardcoded path or name here; it all comes from content.js.
import { useEffect, useRef } from "react";
import ProjectIcon from "./ProjectIcon.jsx";

export default function ProjectVisual({
  name,
  image,
  clip,
  icon,
  variant = "thumb",
  label = "screenshot coming",
}) {
  const className = `visual visual-${variant}`;

  // Demo clips loop silently like a GIF. Under reduced motion they don't play
  // on their own — the poster sits there with controls, so it's still watchable.
  const videoRef = useRef(null);
  const autoplay =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

  // Some browsers ignore the autoplay attribute until the clip is buffered, so
  // nudge it on mount and again once it's ready. A refused play is not an error.
  const nudge = () => {
    const v = videoRef.current;
    if (v && autoplay) v.play().catch(() => {});
  };
  useEffect(nudge, [clip, autoplay]);

  // Browsers stop a muted autoplaying clip once it scrolls out of view and
  // don't always restart it on the way back, which leaves a frozen frame where
  // the demo should be. Nudge it again whenever it re-enters the viewport.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !clip || !autoplay) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) v.play().catch(() => {}); },
      { threshold: 0.2 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [clip, autoplay]);

  if (clip) {
    return (
      <div className={className}>
        <video
          ref={videoRef}
          src={clip}
          poster={image || undefined}
          aria-label={`${name} demo`}
          autoPlay={autoplay}
          controls={!autoplay}
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={nudge}
        />
      </div>
    );
  }

  if (image) {
    return (
      <div className={className}>
        <img src={image} alt={`${name} visual`} loading="lazy" />
      </div>
    );
  }

  return (
    <div className={`${className} visual-empty`} role="img" aria-label={`${name} — ${label}`}>
      <span className="visual-plate">
        <ProjectIcon name={icon} />
      </span>
      <span className="visual-name">{name}</span>
      <span className="visual-label">{label}</span>
    </div>
  );
}
