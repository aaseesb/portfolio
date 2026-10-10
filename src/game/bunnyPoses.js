// Resting and running poses for the bunnies. Each pose is a handful of part
// transforms (position `p`, rotation `r`, scale `s`) laid over the sitting
// bunny, which is the base. Parts a pose leaves out keep their sitting values.
// Poses ease into each other, so `stepPose` can also be used to change pose live.
//
//   setPose(b, "loaf")        pick a pose (any of POSES)
//   stepPose(b, dt, t, snap)  call every frame after poseBunny; snap skips the easing
//
// A bunny faces +z; `L` parts sit at -x, `R` parts at +x.
const HIDE = [0.001, 0.001, 0.001];
const mirror = (v) => [-v[0], v[1], v[2]];
const mirrorRot = (v) => [v[0], -v[1], -v[2]];

// Left/right pairs written once: `side(spec)` gives the R spec and the mirrored L one.
function pair(name, spec) {
  const R = { ...spec };
  const L = {};
  if (spec.p) L.p = mirror(spec.p);
  if (spec.r) L.r = mirrorRot(spec.r);
  if (spec.s) L.s = spec.s;
  return { [`${name}L`]: L, [`${name}R`]: R };
}
const merge = (...a) => Object.assign({}, ...a);

// How she rests: up on all fours, front legs straight, head high, ears pricked.
const SIT = merge(
  {
    torso: { p: [0, 0.64, 0], s: [0.95, 0.85, 1.3] },
    chest: { p: [0, 0.58, 0.55], s: [0.9, 1.1, 1] },
    tail: { p: [0, 0.66, -0.86] },
    head: { p: [0, 1.22, 0.78], r: [-0.05, 0, 0] },
    shadow: { s: [1, 1.4, 1] },
  },
  pair("haunch", { p: [0.4, 0.5, -0.4], s: [0.9, 1.05, 1] }),
  pair("hind", { p: [0.34, 0.1, -0.2], s: [1, 1, 1.1] }),
  pair("paw", { p: [0.22, 0.1, 0.78], s: [0.9, 1.4, 1] }),
  pair("ear", { r: [-0.05, 0, 0.1] }),
);
// Writes SIT onto a freshly built bunny, making it the base every pose is laid over.
export function bakeSit(parts) {
  for (const [n, c] of Object.entries(SIT)) {
    const o = parts[n];
    if (c.p) o.position.set(...c.p);
    if (c.r) o.rotation.set(...c.r);
    if (c.s) o.scale.set(...c.s);
  }
}

export const POSES = {
  sit: {}, // the resting bunny: SIT below is baked into her build, so this is a no-op

  // upright on her haunches, front paws held up at her chest
  stand: merge(
    {
      torso: { p: [0, 0.74, -0.04], s: [0.9, 1.5, 0.81] },
      chest: { p: [0, 0.72, 0.36], s: [0.87, 1.67, 0.73] },
      tail: { p: [0, 0.36, -0.68] },
      head: { p: [0, 1.5, 0.2], r: [0, 0, 0] },
      shadow: { s: [1, 1, 1] },
    },
    pair("haunch", { p: [0.4, 0.4, -0.1], s: [1.06, 1.05, 1.09] }),
    pair("paw", { p: [0.2, 0.7, 0.5], s: [0.7, 1.2, 0.74] }),
    pair("ear", { r: [0, 0, -0.06] }),
  ),

  // a tucked loaf: a round bun, paws and hind feet hidden, ears back, eyes soft
  loaf: merge(
    {
      torso: { p: [0, 0.46, -0.02], s: [1.2, 0.95, 1.1] },
      chest: { p: [0, 0.3, 0.4], s: [1.15, 0.85, 1] },
      tail: { p: [0, 0.36, -0.64] },
      head: { p: [0, 0.88, 0.42], r: [0.1, 0, 0] },
      shadow: { s: [1, 1, 1] },
      eyeL: { s: [1, 0.65, 1] }, eyeR: { s: [1, 0.65, 1] },
      hindL: { s: HIDE }, hindR: { s: HIDE },
    },
    pair("haunch", { p: [0.46, 0.34, -0.04], s: [1.15, 0.95, 1] }),
    pair("paw", { p: [0.24, 0.07, 0.56], s: [0.8, 0.7, 0.6] }), // just the toes peeking out
    pair("ear", { r: [-0.3, 0, 0.3] }),
  ),

  // stretched out flat on the grass, hind feet splooted behind, chin on the paws
  long: merge(
    {
      torso: { p: [0, 0.34, 0], s: [1.05, 0.58, 1.65] },
      chest: { p: [0, 0.2, 0.78], s: [1.1, 0.6, 1.2] },
      tail: { p: [0, 0.28, -1.06] },
      head: { p: [0, 0.74, 1.05], r: [-0.08, 0, 0] }, // head up, chin level
      shadow: { p: [0, 0.012, -0.05], s: [1.25, 2, 1] },
      eyeL: { s: [1, 0.8, 1] }, eyeR: { s: [1, 0.8, 1] },
    },
    pair("haunch", { p: [0.5, 0.26, -0.58], s: [1.05, 0.6, 0.95] }),
    pair("hind", { p: [0.46, 0.08, -1.2], r: [0, 0.18, 0], s: [1.1, 1, 1.2] }),
    pair("paw", { p: [0.26, 0.08, 1.14], s: [1, 1, 1.3] }),
    pair("ear", { r: [-0.85, 0, 0.12] }),
  ),

  // sprawled flat and boneless, head dropped sideways, ears slack, hind legs kicked out behind
  flop: merge(
    {
      torso: { p: [0, 0.3, 0], s: [1.1, 0.5, 1.5] },
      chest: { p: [0, 0.18, 0.7], s: [1.1, 0.55, 1.2] },
      tail: { p: [0, 0.26, -1.0] },
      head: { p: [0.1, 0.42, 1.0], r: [0.35, 0, 0.55] },
      shadow: { p: [0, 0.012, 0], s: [1.35, 1.9, 1] },
      eyeL: { s: [1, 0.2, 1] }, eyeR: { s: [1, 0.2, 1] },
    },
    pair("haunch", { p: [0.55, 0.22, -0.55], s: [1.05, 0.55, 0.95] }),
    pair("hind", { p: [0.7, 0.08, -1.25], r: [0, 0.5, 0], s: [1.1, 1, 1.25] }),
    pair("paw", { p: [0.3, 0.08, 1.05], r: [0, 0.25, 0], s: [1, 1, 1.2] }),
    pair("ear", { r: [-1.4, 0, 0.3] }),
  ),
};

// The run is two key poses, stretched mid-air and gathered at the landing, mixed by a cycle.
const RUN_STRETCH = merge(
  {
    body: { p: [0, 0.34, 0], r: [0.08, 0, 0] },
    torso: { p: [0, 0.5, 0.05], s: [0.95, 0.8, 1.55] },
    chest: { p: [0, 0.4, 0.62], s: [1, 1, 1.4] },
    tail: { p: [0, 0.62, -0.98] },
    head: { p: [0, 1, 0.95], r: [0.25, 0, 0] },
    shadow: { s: [0.9, 1.6, 1] },
  },
  pair("haunch", { p: [0.36, 0.52, -0.6], r: [-0.35, 0, 0], s: [0.85, 0.85, 1] }),
  pair("hind", { p: [0.3, 0.55, -1.36], r: [-0.5, 0, 0], s: [1, 1, 1] }),
  pair("paw", { p: [0.26, 0.35, 1.06], r: [0.3, 0, 0], s: [1, 1, 1.3] }),
  pair("ear", { r: [-1.3, 0, 0.15] }),
);
const RUN_GATHER = merge(
  {
    body: { p: [0, 0, 0], r: [0.14, 0, 0] }, // haunches high, shoulders low
    torso: { p: [0, 0.5, 0.05], s: [0.95, 0.9, 1.2] },
    chest: { p: [0, 0.34, 0.52] },
    tail: { p: [0, 0.5, -0.74] },
    head: { p: [0, 1.05, 0.5], r: [0.1, 0, 0] },
    shadow: { s: [1, 1, 1] },
  },
  pair("haunch", { p: [0.42, 0.36, 0.3], s: [1, 1, 1] }),
  pair("hind", { p: [0.55, 0.1, 0.55], s: [1, 1, 1] }),
  pair("paw", { p: [0.24, 0.1, 0.6] }),
  pair("ear", { r: [-0.35, 0, 0.1] }),
);

// ---- engine ----
const KEYS = ["body", "head", "shadow", "tail", "haunchL", "haunchR", "torso", "chest", "earL", "earR",
  "pawL", "pawR", "hindL", "hindR", "eyeL", "eyeR"];
const read = (o) => ({ p: o.position.toArray(), r: [o.rotation.x, o.rotation.y, o.rotation.z], s: o.scale.toArray() });
const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const resolve = (spec, base) => Object.fromEntries(KEYS.map((n) => [n, { ...base[n], ...spec[n] }]));
const lerpSpec = (A, B, k) => Object.fromEntries(KEYS.map((n) => [n, { p: mix(A[n].p, B[n].p, k), r: mix(A[n].r, B[n].r, k), s: mix(A[n].s, B[n].s, k) }]));

export function setPose(b, name) {
  if (!(name in POSES) && name !== "run") throw new Error(`unknown bunny pose "${name}"`);
  b.poseName = name;
}

export function stepPose(b, dt, t, snap = false) {
  b.poseBase ||= Object.fromEntries(KEYS.map((n) => [n, read(b.parts[n])]));
  const base = b.poseBase, name = b.poseName || "sit";
  let target;
  if (name === "run") {
    const k = 0.5 + 0.5 * Math.sin(t * 11);
    target = lerpSpec(resolve(RUN_GATHER, base), resolve(RUN_STRETCH, base), k);
  } else target = resolve(POSES[name], base);
  const ease = snap || !b.posePose ? 1 : 1 - Math.exp(-dt * (name === "run" ? 30 : 9));
  b.posePose = b.posePose && !snap ? lerpSpec(b.posePose, target, ease) : target;
  for (const n of KEYS) {
    const o = b.parts[n], c = b.posePose[n];
    o.position.set(...c.p); o.rotation.set(...c.r); o.scale.set(...c.s);
  }
}
