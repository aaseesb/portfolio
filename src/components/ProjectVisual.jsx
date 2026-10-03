// One component for every visual on the page.
//
// With a `clip` it plays the demo (muted, looping, no controls) using `image`
// as the poster. With only an `image` it renders the still. Without either it
// renders `art` if it was given one, and otherwise a deliberate placeholder —
// same box, same dimensions, so swapping one in never reflows anything. Never pass a hardcoded path or name here; it all
// comes from content.js.
import { useEffect, useRef } from "react";

export default function ProjectVisual({
  name,
  image,
  clip,
  art,
  variant = "thumb",
  label = "render pending",
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

  // Hand-drawn stand-in: a real picture in `image` always wins over it.
  if (art) {
    return (
      <div className={`${className} visual-art`} role="img" aria-label={name}>
        {art}
      </div>
    );
  }

  return (
    <div className={`${className} visual-empty`} role="img" aria-label={`${name} — ${label}`}>
      <span className="visual-name">{name}</span>
      <span className="visual-label">{label}</span>
    </div>
  );
}
