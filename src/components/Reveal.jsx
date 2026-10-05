// Fades a block in the first time it scrolls into view, and leaves it alone
// after that — a thing that re-hides when you scroll back up reads as a bug.
//
// An IntersectionObserver rather than a scroll handler, so nothing runs on the
// main thread between entrances. The motion itself is CSS; if the visitor has
// asked for less of it, the stylesheet simply never dims the block and this
// component becomes a no-op wrapper.
import { useEffect, useRef, useState } from "react";

export default function Reveal({ children, className = "", delay = 0, as: Tag = "div" }) {
  const el = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      // A little way in from the bottom, so things arrive just before you
      // reach them rather than popping in under your eyes.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={el}
      className={`reveal${shown ? " is-in" : ""}${className ? ` ${className}` : ""}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
