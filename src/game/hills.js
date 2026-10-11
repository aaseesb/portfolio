// The two hill ridges behind the village, shared by the sky shader (which paints
// them) and the village (which stands each house on the ridge it belongs to).
// Heights are fractions of the screen height; x is in screen-height units
// (uv.x * aspect) plus the scene's parallax drift.
export const HILLS = [
  { base: 0.36, waves: [[0.06, 2.2, -1.29], [0.014, 6.1, 2.0]] }, // far: rises to the right
  { base: 0.3, waves: [[0.07, 2.0, 0.57], [0.012, 8.0, 1.0]] }, // near: the big hill on the left
];

// How far the hills drift per tour scene (stage.js eases toward -scene * 420, sky.js scales by 0.0006).
export const PAR_PER_SCENE = 420 * 0.0006;

export const hillY = (layer, x) => {
  const h = HILLS[layer];
  return h.waves.reduce((y, [a, f, p]) => y + a * Math.sin(x * f + p), h.base);
};

// The same curves as GLSL: `float f0 = ...; float f1 = ...;` in terms of `x`.
export const hillGLSL = HILLS.map((h, i) => `float f${i} = ${h.base} + ${h.waves.map(([a, f, p]) => `${a} * sin(x * ${f.toFixed(1)} + ${p.toFixed(1)})`).join(" + ")};`).join("\n  ");
