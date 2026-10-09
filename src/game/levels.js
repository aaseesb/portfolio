// Level layouts, generated from the project's position in the list so adding a
// project adds a level with no extra data. Deterministic: the same project is
// always the same level.
//
// World units are SVG px. Jump physics (see Level.jsx) clears about 110px up
// and 130px across, so gaps stay under 95 and ledges within 90 of the ground.
export const GROUND = 340;
export const VIEW_W = 800;
export const VIEW_H = 400;
export const TREATS_NEEDED = 5;

export function buildLevel(index) {
  const platforms = []; // {x, y, w} — top surfaces you can stand on
  const treats = [];
  let x = 0;
  const start = 320;
  platforms.push({ x: 0, y: GROUND, w: start });
  x = start;
  let k = 0;
  while (treats.length < TREATS_NEEDED) {
    const gap = 55 + ((k * 23 + index * 17) % 40); // 55–94
    const len = 200 + ((k * 41 + index * 29) % 120);
    const gx = x + gap;
    platforms.push({ x: gx, y: GROUND, w: len });
    // A ledge over the gap's far side every other chunk, carrying a treat.
    if (k % 2 === 0) {
      const lx = gx + 30;
      platforms.push({ x: lx, y: GROUND - 80, w: 90 });
      treats.push({ x: lx + 45, y: GROUND - 80 - 26, got: false });
    } else {
      treats.push({ x: gx + len / 2, y: GROUND - 26, got: false });
    }
    x = gx + len;
    k += 1;
  }
  const end = x + 120;
  platforms.push({ x, y: GROUND, w: 120 });
  return { platforms, treats, gateX: x + 60, width: end };
}
