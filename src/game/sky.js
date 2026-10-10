// The sky behind the tour: one full-screen shader quad on its own canvas. A
// smooth ombre that drifts, a sun or moon, stars at night, and two soft hills.
// Each tour scene has its own palette (dawn, noon, golden afternoon, dusk, night) and they lerp
// into each other as the slides change. Dark theme dims the daytime ones.
import * as THREE from "three";

const hex = (s) => new THREE.Color(s);
// top, middle, horizon, drifting blob, far hill, near hill, night, sun x
const PALETTES = [
  { c0: "#e6a0b6", c1: "#f6c39c", c2: "#fde7c8", c3: "#ffd9ae", h0: "#d8b598", h1: "#a8bf84", night: 0, sun: 0.78 },
  { c0: "#5f9fe0", c1: "#a4d0f0", c2: "#eaf5f8", c3: "#ffffff", h0: "#9cc09c", h1: "#7fae72", night: 0, sun: 0.22 },
  { c0: "#8fa8d8", c1: "#f2cf9a", c2: "#ffe6b0", c3: "#ffd27a", h0: "#c9b688", h1: "#9bb468", night: 0, sun: 0.55 },
  { c0: "#5a4a8c", c1: "#c76f8a", c2: "#f4a95c", c3: "#f9c982", h0: "#7a6a90", h1: "#627f5e", night: 0, sun: 0.82 },
  { c0: "#0f1636", c1: "#29336a", c2: "#5a5f98", c3: "#4656a8", h0: "#2f3a62", h1: "#2c4a48", night: 1, sun: 0.7 },
];

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform float t, night, sun, par, dark;
uniform vec2 res;
uniform vec3 c0, c1, c2, c3, h0, h1;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
void main(){
  float asp = res.x / res.y;
  vec2 uv = vUv, p = vec2(uv.x * asp, uv.y);
  vec3 col = mix(c2, c1, smoothstep(0.1, 0.55, uv.y));
  col = mix(col, c0, smoothstep(0.45, 1.0, uv.y));
  float n = noise(p * 1.7 + vec2(t * 0.025, t * 0.015));
  float n2 = noise(p * 2.6 - vec2(t * 0.02, -t * 0.01) + 7.0);
  col = mix(col, c3, smoothstep(0.42, 0.88, n) * 0.38);
  col = mix(col, c0 * 1.12, smoothstep(0.5, 0.92, n2) * 0.22);
  col *= mix(1.0, 0.56, dark * (1.0 - night));
  // sun by day, moon at night
  vec2 sp = vec2(sun * asp, 0.74);
  float d = length(p - sp);
  col += (1.0 - night) * vec3(1.0, 0.92, 0.74) * (smoothstep(0.2, 0.0, d) * 0.3 + smoothstep(0.052, 0.046, d) * 0.7);
  col += night * vec3(0.9, 0.93, 1.0) * (smoothstep(0.12, 0.0, d) * 0.12 + smoothstep(0.045, 0.04, d) * 0.9);
  // stars
  vec2 g = floor(p * 70.0);
  float hs = hash(g);
  float star = step(0.986, hs) * (0.55 + 0.45 * sin(t * 2.0 + hs * 60.0)) * night * smoothstep(0.35, 0.75, uv.y);
  col += vec3(star);
  // hills, far then near
  float x = p.x + par;
  float f0 = 0.27 + 0.045 * sin(x * 2.6 + 0.6) + 0.025 * sin(x * 6.1 + 2.0);
  float f1 = 0.22 + 0.04 * sin(x * 3.4 + 3.1) + 0.02 * sin(x * 8.0 + 1.0);
  vec3 hc0 = mix(h0, c2, 0.25) * mix(1.0, 0.6, dark * (1.0 - night));
  vec3 hc1 = h1 * mix(1.0, 0.62, dark * (1.0 - night));
  col = mix(col, hc0, smoothstep(0.003, -0.003, uv.y - f0));
  col = mix(col, hc1, smoothstep(0.003, -0.003, uv.y - f1));
  gl_FragColor = vec4(col, 1.0);
}`;

export function createSky(canvas, { reduced }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setPixelRatio(1);
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const cur = {}, tgt = {};
  for (const k of ["c0", "c1", "c2", "c3", "h0", "h1"]) { cur[k] = hex(PALETTES[0][k]); tgt[k] = cur[k].clone(); }
  const U = {
    t: { value: 0 }, night: { value: 0 }, sun: { value: 0.78 }, par: { value: 0 }, dark: { value: 0 }, res: { value: new THREE.Vector2(1, 1) },
    c0: { value: cur.c0 }, c1: { value: cur.c1 }, c2: { value: cur.c2 }, c3: { value: cur.c3 }, h0: { value: cur.h0 }, h1: { value: cur.h1 },
  };
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: U, vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}", fragmentShader: FRAG, depthTest: false, depthWrite: false }));
  quad.frustumCulled = false;
  scene.add(quad);

  const readTheme = () => { U.dark.value = document.documentElement.dataset.theme === "dark" ? 1 : 0; };
  readTheme();
  const mo = new MutationObserver(readTheme);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  let nightT = 0, sunT = 0.78;
  function setStep(i, instant) {
    const p = PALETTES[Math.min(i, PALETTES.length - 1)];
    for (const k of Object.keys(tgt)) tgt[k].set(p[k]);
    nightT = p.night; sunT = p.sun;
    if (instant || reduced) { for (const k of Object.keys(cur)) cur[k].copy(tgt[k]); U.night.value = nightT; U.sun.value = sunT; }
  }
  setStep(0, true);

  return {
    setStep,
    resize(w, h) { renderer.setSize(w, h, false); U.res.value.set(w, h); },
    update(dt, t, tx) {
      const a = 1 - Math.exp(-dt * 2.2);
      for (const k of Object.keys(cur)) cur[k].lerp(tgt[k], a);
      U.night.value += (nightT - U.night.value) * a;
      U.sun.value += (sunT - U.sun.value) * a;
      U.t.value = reduced ? 0 : t;
      U.par.value = -tx * 0.0006;
    },
    render() { renderer.render(scene, cam); },
    dispose() { mo.disconnect(); quad.geometry.dispose(); quad.material.dispose(); renderer.dispose(); },
  };
}
