// Little low-poly bunnies, and treats for the interactive tour, ported
// from the island mockup: ellipsoid blobs with a cream outline shell.
import * as THREE from "three";
import { bakeSit } from "./bunnyPoses.js";

export const COL = {
  grass: 0x88a567, grassLight: 0xa4c17c, grassDark: 0x748f57, cream: 0xddd3c5,
  tan: 0xc4a276, belly: 0xf0e5d1, pink: 0xd9a9a0, gray: 0xa3a7b4, brown: 0x7c5b43,
  black: 0x262626, stem: 0x9fc07a, rope: 0xb48e60, gold: 0xe9c46a, petalPink: 0xd9a3b8,
  petalYellow: 0xecd68f,
};

// Ellipsoid with analytic normals so the outline shell keeps an even thickness.
function ellip(sx, sy, sz) {
  const g = new THREE.SphereGeometry(1, 28, 18);
  const p = g.attributes.position, n = g.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const nx = x / sx, ny = y / sy, nz = z / sz, l = Math.hypot(nx, ny, nz) || 1;
    n.setXYZ(i, nx / l, ny / l, nz / l);
    p.setXYZ(i, x * sx, y * sy, z * sz);
  }
  return g;
}
const lam = (c) => new THREE.MeshPhongMaterial({ color: c, specular: 0x000000, shininess: 0 });
const outlines = {};
function outlineMat(t, color) {
  const k = `${t}_${color}`;
  return (outlines[k] ||= new THREE.ShaderMaterial({
    uniforms: { t: { value: t }, c: { value: new THREE.Color(color) } },
    vertexShader: "uniform float t;void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position+normalize(normal)*t,1.0);}",
    fragmentShader: "uniform vec3 c;void main(){gl_FragColor=vec4(c,1.0);}",
    side: THREE.BackSide,
  }));
}
export function blob(sx, sy, sz, color, pos, o = {}) {
  const geo = ellip(sx, sy, sz);
  const m = new THREE.Mesh(geo, lam(color));
  if (pos) m.position.set(...pos);
  if (o.rot) m.rotation.set(...o.rot);
  if (o.line !== 0) m.add(new THREE.Mesh(geo, outlineMat(o.line || 0.05, o.lineColor || COL.cream)));
  return m;
}

const shadowMat = new THREE.MeshBasicMaterial({ color: 0x2f3a24, transparent: true, opacity: 0.22, depthWrite: false });
export function makeShadow(r) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(1, 20), shadowMat);
  m.rotation.x = -Math.PI / 2; m.scale.set(r, r * 0.8, 1); m.position.y = 0.012; m.renderOrder = 1;
  return m;
}

// A bunny faces +z. `root` is what gets positioned and turned.
export function makeBunny({ fur, mark, tail, size = 1 }) {
  const T = 0.05;
  const root = new THREE.Group(), body = new THREE.Group();
  root.add(body);
  const shadow = makeShadow(0.95); root.add(shadow);
  const tailB = blob(0.2, 0.2, 0.2, tail || COL.belly, [0, 0.44, -0.7], { line: T });
  const haunchL = blob(0.36, 0.38, 0.46, fur, [-0.42, 0.4, -0.08], { line: T });
  const haunchR = blob(0.36, 0.38, 0.46, fur, [0.42, 0.4, -0.08], { line: T });
  const torso = blob(0.6, 0.52, 0.62, fur, [0, 0.5, -0.02], { line: T });
  const chest = blob(0.46, 0.3, 0.3, COL.belly, [0, 0.36, 0.4], { line: 0 });
  body.add(tailB, haunchL, haunchR, torso, chest);
  const head = new THREE.Group(); head.position.set(0, 1.16, 0.16); body.add(head);
  const ears = [];
  [-1, 1].forEach((sd) => {
    const piv = new THREE.Group(); piv.position.set(sd * 0.22, 0.34, -0.04); piv.rotation.z = -sd * 0.06;
    piv.add(blob(0.16, 0.52, 0.1, fur, [0, 0.44, 0], { line: T }));
    piv.add(blob(0.085, 0.38, 0.05, COL.pink, [0, 0.42, 0.075], { line: 0 }));
    head.add(piv); ears.push(piv);
  });
  head.add(blob(0.5, 0.46, 0.46, fur, [0, 0, 0], { line: T }));
  const eyes = [-1, 1].map((sd) => { const e = blob(0.095, 0.11, 0.06, COL.black, [sd * 0.3, 0.04, 0.34], { line: 0 }); head.add(e); return e; });
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.08, 3), lam(COL.pink));
  nose.rotation.set(Math.PI / 2, 0, Math.PI); nose.scale.set(1, 1, 0.35); nose.position.set(0, -0.07, 0.46); head.add(nose);
  if (mark) {
    const d = new THREE.Mesh(new THREE.OctahedronGeometry(1), new THREE.MeshBasicMaterial({ color: 0xfffaf3 }));
    d.scale.set(0.09, 0.14, 0.04); d.position.set(0, 0.3, 0.38); d.rotation.x = -0.55; head.add(d);
  }
  const paws = [-1, 1].map((sd) => { const f = blob(0.2, 0.1, 0.27, COL.belly, [sd * 0.26, 0.1, 0.62], { line: T }); body.add(f); return f; });
  // hind feet start tucked away; the lying and running poses (bunnyPoses.js) bring them out
  const hind = [-1, 1].map((sd) => { const f = blob(0.17, 0.1, 0.3, COL.belly, [sd * 0.42, 0.1, 0.1], { line: T }); f.scale.setScalar(0.001); body.add(f); return f; });
  root.scale.setScalar(0.95 * size);
  const b = {
    root, body, head, ears, eyes, shadow, sleep: 0, sleepT: 0,
    parts: { body, head, shadow, tail: tailB, haunchL, haunchR, torso, chest, earL: ears[0], earR: ears[1],
      pawL: paws[0], pawR: paws[1], hindL: hind[0], hindR: hind[1], eyeL: eyes[0], eyeR: eyes[1] },
    x: 0, z: 0, yaw: 0, vx: 0, vz: 0, hop: 0, lift: 0, liftV: 0, squash: 0, pet: 0, lean: 0, nod: 0,
    idle: 1 + Math.random() * 3, mouth: new THREE.Vector3(),
  };
  bakeSit(b.parts); // the resting bunny is the on-all-fours pose from bunnyPoses.js
  root.userData.bunny = b;
  return b;
}

const _v = new THREE.Vector3();
// Pose from state. Layers on top of whatever stepPose (bunnyPoses.js) just set, so call that first. `moving` drives the hop cycle, `lean` stands her up to beg,
// `nod` is the eating dip, `pet` makes her wriggle happy.
export function poseBunny(b, dt, t, still) {
  const speed = Math.hypot(b.vx, b.vz);
  const moving = !still && speed > 0.6;
  if (moving) b.hop += dt * 9; else if (b.hopImpulse) { b.hop += dt * 9; if (Math.sin(b.hop) <= 0.02 && b.hop > b.hopStart + 1) b.hopImpulse = false; } else b.hop = 0;
  const j = moving || b.hopImpulse ? Math.max(0, Math.sin(b.hop)) : 0;
  b.liftV -= 22 * dt; b.lift += b.liftV * dt;
  if (b.lift <= 0) { const imp = -b.liftV; b.lift = 0; b.liftV = 0; if (imp > 2) b.squash = Math.min(0.25, imp * 0.04); }
  b.squash *= Math.exp(-dt * 8);
  if (b.pet > 0) b.pet -= dt;
  const happy = b.pet > 0 ? 1 : 0;
  b.sleep += (b.sleepT - b.sleep) * (1 - Math.exp(-dt * 2.5));
  const sl = b.sleep;
  b.eyes.forEach((e) => { e.scale.y *= 1 - sl * 0.92; e.scale.x *= 1 + sl * 0.35; });
  const br = sl * Math.sin(t * 2 + b.x * 3); // slow breathing while asleep
  b.root.position.set(b.x, j * 0.42 + b.lift + (b.perch || 0), b.z);
  b.root.rotation.y = b.yaw;
  const sq = b.squash - j * 0.05;
  b.body.scale.multiply(_v.set(1 + sq * 0.6 + sl * 0.12 - br * 0.02, 1 - sq - sl * 0.08 + br * 0.045, 1 + sq * 0.6 + sl * 0.12 - br * 0.02));
  b.body.rotation.x += -b.lean * 0.5 + j * -0.1;
  b.body.position.z += -b.lean * 0.15;
  b.head.rotation.x += sl * (0.55 + Math.sin(t * 1.6) * 0.04) + b.lean * 0.55 + Math.sin(b.nod * Math.PI * 6) * 0.4 * (b.nod > 0 ? 1 : 0) + happy * Math.sin(t * 22) * 0.08;
  b.head.rotation.z += happy * Math.sin(t * 18) * 0.12;
  b.ears.forEach((e, i) => { e.rotation.x += -j * 0.5 - happy * 0.3 - b.lean * 0.2 - sl * 0.9; e.rotation.z += (i ? 1 : -1) * (happy * 0.1 + Math.sin(t * 2 + i) * 0.03); });
  const s = 1 - Math.min(0.5, b.lift * 0.5);
  b.shadow.scale.x *= 0.95 * s; b.shadow.scale.y *= 0.76 * s;
  b.head.updateWorldMatrix(true, false);
  b.mouth.set(0, -0.15, 0.5).applyMatrix4(b.head.matrixWorld);
}
export function hopNow(b) { b.hopImpulse = true; b.hopStart = b.hop; }

export function makeTreat(kind) {
  const g = new THREE.Group();
  const bob = new THREE.Group(); g.add(bob);
  if (kind === "apple") {
    bob.add(blob(0.2, 0.19, 0.2, 0xd9695f, [0, 0.2, 0], { line: 0.04 }));
    bob.add(blob(0.07, 0.05, 0.04, COL.stem, [0.03, 0.43, 0], { line: 0, rot: [0, 0, 0.5] }));
  } else if (kind === "leaf") {
    bob.add(blob(0.2, 0.04, 0.34, 0x78a456, [0, 0.12, 0], { line: 0.035, rot: [0.2, 0.4, 0.15] }));
    bob.add(blob(0.03, 0.03, 0.2, 0x5f8a42, [0, 0.15, -0.3], { line: 0, rot: [0.2, 0.4, 0.15] }));
  } else {
    bob.add(blob(0.12, 0.12, 0.38, 0xe8934a, [0, 0.14, 0], { line: 0.04 }));
    bob.add(blob(0.06, 0.06, 0.17, COL.stem, [0.05, 0.16, -0.48], { line: 0 }));
    bob.add(blob(0.06, 0.06, 0.17, COL.stem, [-0.05, 0.16, -0.48], { line: 0 }));
  }
  const shadow = makeShadow(0.4); g.add(shadow);
  // a soft gold ring on the grass so it reads as the thing to pick up
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.68, 28), new THREE.MeshBasicMaterial({ color: COL.gold, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; ring.renderOrder = 1; g.add(ring);
  return { group: g, bob, shadow, ring, held: false, lift: 0, size: 1 };
}

// The cart the bunnies tow: two spoked wheels (placed by the stage under the
// DOM board's corners) and a hitch post the ropes tie to.
export function makeCart() {
  const group = new THREE.Group();
  const wood = lam(0x8a6b45), dark = lam(0x5f4730);
  const wheels = [0, 1].map(() => {
    const w = new THREE.Group();
    w.add(new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.13, 8, 28), wood));
    for (let i = 0; i < 3; i++) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.11, 0.11), dark);
      sp.rotation.z = (i * Math.PI) / 3; w.add(sp);
    }
    w.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 12), dark)).rotation.x = 0;
    w.children[w.children.length - 1].rotation.x = Math.PI / 2;
    group.add(w);
    return w;
  });
  const hitch = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.9, 8), dark); post.position.y = 0.45; hitch.add(post);
  const loop = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.05, 6, 14), lam(0x9a9a9a)); loop.position.y = 0.9; hitch.add(loop);
  group.add(hitch);
  return { group, wheels, hitch };
}

// Soft hearts and dust puffs as sprites with canvas textures.
const texCache = {};
function glyph(ch, color) {
  const k = ch + color;
  if (texCache[k]) return texCache[k];
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const x = c.getContext("2d"); x.font = "48px serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = color;
  x.fillText(ch, 32, 36);
  return (texCache[k] = new THREE.CanvasTexture(c));
}
export function spawnFx(list, scene, pos, ch = "♥", color = "#e0707e", n = 3) {
  for (let i = 0; i < n; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glyph(ch, color), transparent: true, depthTest: false }));
    s.scale.setScalar(0.55); s.position.copy(pos).add(new THREE.Vector3((Math.random() - 0.5) * 0.8, Math.random() * 0.3, (Math.random() - 0.5) * 0.4));
    s.renderOrder = 10; scene.add(s);
    list.push({ s, vy: 1.4 + Math.random() * 0.8, vx: (Math.random() - 0.5) * 0.6, age: -i * 0.12, life: 1.3 });
  }
}
export function updateFx(list, scene, dt) {
  for (let i = list.length - 1; i >= 0; i--) {
    const f = list[i]; f.age += dt;
    if (f.age < 0) { f.s.visible = false; continue; }
    f.s.visible = true; f.s.position.y += f.vy * dt; f.s.position.x += f.vx * dt;
    f.s.material.opacity = Math.max(0, 1 - f.age / f.life);
    if (f.age > f.life) { scene.remove(f.s); f.s.material.dispose(); list.splice(i, 1); }
  }
}

// A flower or a tuft of grass, to make the ground feel lived in.
export function makeFlower(petal) {
  const g = new THREE.Group();
  g.add(blob(0.02, 0.18, 0.02, COL.stem, [0, 0.18, 0], { line: 0 }));
  g.add(blob(0.11, 0.05, 0.11, petal, [0, 0.38, 0], { line: 0.02 }));
  g.add(blob(0.04, 0.03, 0.04, 0xf4e6a8, [0, 0.42, 0], { line: 0 }));
  return g;
}
export function makeTuft() {
  const g = new THREE.Group();
  [-0.1, 0, 0.1].forEach((x, i) => g.add(blob(0.03, 0.16 + i % 2 * 0.06, 0.03, COL.grassLight, [x, 0.14, 0], { line: 0, rot: [0, 0, (i - 1) * 0.35] })));
  return g;
}
