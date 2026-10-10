// The two hill ridges behind the village, shared by the sky shader (which paints
// them) and the village (which stands each house on the ridge it belongs to).
// Heights are fractions of the screen height; x is in screen-height units
// (uv.x * aspect) plus the scene's parallax drift.
export const HILLS = [
  { base: 0.27, waves: [[0.045, 2.6, 0.6], [0.014, 6.1, 2.0]] }, // far
  { base: 0.22, waves: [[0.04, 3.4, 3.1], [0.012, 8.0, 1.0]] }, // near
];

// How far the hills drift per tour scene (stage.js eases toward -scene * 420, sky.js scales by 0.0006).
export const PAR_PER_SCENE = 420 * 0.0006;

export const hillY = (layer, x) => {
  const h = HILLS[layer];
  return h.waves.reduce((y, [a, f, p]) => y + a * Math.sin(x * f + p), h.base);
};

// The same curves as GLSL: `float f0 = ...; float f1 = ...;` in terms of `x`.
export const hillGLSL = HILLS.map((h, i) => `float f${i} = ${h.base} + ${h.waves.map(([a, f, p]) => `${a} * sin(x * ${f.toFixed(1)} + ${p.toFixed(1)})`).join(" + ")};`).join("\n  ");
