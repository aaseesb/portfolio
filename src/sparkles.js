// Little hearts and sparkles that pop where you click. One global listener,
// started from App; the particles are throwaway DOM nodes that remove
// themselves when their CSS animation ends. Skipped under reduced motion.
const GLYPHS = ["✦", "♥", "✿", "✧", "♥"];
const COLORS = ["#f4a6b8", "#f7c948", "#ffd9e2", "#b9e3a6", "#ffffff"];

export function startSparkles() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const layer = document.createElement("div");
  layer.className = "sparkle-layer";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);

  const onDown = (e) => {
    if (reduced.matches) return;
    const n = 5;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("span");
      p.className = "sparkle";
      p.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      const angle = (Math.PI * 2 * i) / n + Math.random() * 0.8;
      const dist = 26 + Math.random() * 26;
      p.style.left = `${e.clientX}px`;
      p.style.top = `${e.clientY}px`;
      p.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      p.style.fontSize = `${10 + Math.random() * 9}px`;
      p.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      p.style.setProperty("--dy", `${Math.sin(angle) * dist - 14}px`);
      p.addEventListener("animationend", () => p.remove(), { once: true });
      layer.appendChild(p);
    }
  };
  window.addEventListener("pointerdown", onDown);
  return () => {
    window.removeEventListener("pointerdown", onDown);
    layer.remove();
  };
}
