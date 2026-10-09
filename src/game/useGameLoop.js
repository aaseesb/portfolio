// A fixed-timestep loop: `step` runs at 60Hz however fast frames arrive, so the
// jump arc is the same on a 144Hz screen. Pauses while the tab is hidden.
import { useEffect, useRef } from "react";

export default function useGameLoop(step, render, active = true) {
  const fns = useRef({ step, render });
  fns.current = { step, render };
  useEffect(() => {
    if (!active) return;
    const DT = 1000 / 60;
    let raf;
    let last = performance.now();
    let acc = 0;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) { last = now; return; }
      acc += Math.min(now - last, 100);
      last = now;
      while (acc >= DT) { fns.current.step(); acc -= DT; }
      fns.current.render();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}
