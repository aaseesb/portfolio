// The 3D half of the interactive tour. Three bunnies tow each "slide" (a DOM
// panel) in on ropes; a hero bunny circles a treat begging for it; you drag the
// treat to her, she eats, and they tow the slide away and bring the next.
// This file owns the canvas and the choreography; GameShell owns the slides.
import * as THREE from "three";
import { COL, makeBunny, poseBunny, hopNow, makeTreat, makeEgg, makeFlower, makeTuft, spawnFx, updateFx } from "./bunny3d.js";

THREE.ColorManagement.enabled = false; // match the look the mockup was tuned in

const ease = (u) => 1 - Math.pow(1 - u, 3);
const easeIn = (u) => u * u * u;
const rng = (seed) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export function createStage({ canvas, root, slide, bubble, steps, reduced, hooks }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 200);
  const pitch = THREE.MathUtils.degToRad(30);
  camera.position.set(0, Math.sin(pitch) * 60, Math.cos(pitch) * 60);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.AmbientLight(0xffffff, 0.86 * Math.PI));
  const sun = new THREE.DirectionalLight(0xfff3e0, 0.26 * Math.PI); sun.position.set(6, 8, 5); scene.add(sun);

  // ---- layout: world x = (px - W/2) / u, and world origin sits in the strip ----
  let W = 1, H = 1, u = 40, stripH = 240;
  const toX = (px) => (px - W / 2) / u;
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    u = THREE.MathUtils.clamp(H * 0.05, 34, 56);
    stripH = THREE.MathUtils.clamp(H * 0.3, 220, 340);
    const y0 = H - stripH * 0.4;
    renderer.setSize(W, H, false);
    camera.left = -W / 2 / u; camera.right = W / 2 / u; camera.top = y0 / u; camera.bottom = -(H - y0) / u;
    camera.updateProjectionMatrix();
    root.style.setProperty("--strip", `${stripH}px`);
    ground.scale.x = (W / u + 8) / 100;
    scatter.forEach((s) => s.g.position.x = s.f * (W / u / 2 + 1));
  }

  // ---- ground and scenery ----
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 30), new THREE.MeshPhongMaterial({ color: COL.grass, specular: 0, shininess: 0 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, 11.5); scene.add(ground);
  const rand = rng(11), scatter = [];
  for (let i = 0; i < 70; i++) {
    const g = rand() < 0.4 ? makeFlower(rand() < 0.5 ? COL.petalPink : COL.petalYellow) : makeTuft();
    g.position.z = -3.6 + rand() * 7; g.rotation.y = rand() * 6; scene.add(g);
    scatter.push({ g, f: rand() * 2 - 1 });
  }

  // ---- cast ----
  const bunnies = [
    makeBunny({ fur: COL.tan, mark: true }),
    makeBunny({ fur: COL.gray, tail: COL.cream }),
    makeBunny({ fur: COL.brown, tail: COL.cream }),
  ];
  const lane = [0.3, -0.9, 1.3];
  const offs = [-150, -235, -320];
  bunnies.forEach((b) => scene.add(b.root));
  const hero = bunnies[0];
  const ropeMat = new THREE.MeshPhongMaterial({ color: COL.rope, specular: 0, shininess: 0 });
  const ropes = bunnies.map(() => { const m = new THREE.Mesh(new THREE.BufferGeometry(), ropeMat); m.frustumCulled = false; scene.add(m); return m; });
  const eggObj = makeEgg(); scene.add(eggObj.group);
  let treat = null;
  const fx = [];

  // ---- state ----
  const S = { step: 0, phase: "swap", t: 0, tx: 0, prevTx: 0, found: {}, begging: false, begT: 2.5, a: 0, held: false, eatT: 0, text: null, tiltT: 0 };
  const sc = () => Math.min(1, W / 900);
  const anchorPx = () => W / 2 + S.tx;
  const towX = (i) => toX(anchorPx() + offs[i] * sc());
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), tmp = new THREE.Vector3();
  function pickRay(cx, cy) { ndc.set((cx / W) * 2 - 1, -(cy / H) * 2 + 1); ray.setFromCamera(ndc, camera); }
  function groundAt(cx, cy, y = 0) { pickRay(cx, cy); plane.constant = -y; return ray.ray.intersectPlane(plane, tmp.set(0, 0, 0)) ? tmp.clone() : null; }
  const key = () => steps[S.step].key;
  const say = (text) => { if (S.text !== text) { S.text = text; hooks.onText(text); } };

  function moveTo(b, x, z, max, dt) {
    const dx = x - b.x, dz = z - b.z, d = Math.hypot(dx, dz) || 1;
    const sp = Math.min(max, d * 5);
    b.vx += (dx / d * sp - b.vx) * Math.min(1, dt * 12); b.vz += (dz / d * sp - b.vz) * Math.min(1, dt * 12);
    b.x += b.vx * dt; b.z += b.vz * dt;
    return d;
  }
  const turn = (b, yaw, dt) => { b.yaw += wrap(yaw - b.yaw) * (1 - Math.exp(-dt * 12)); };
  function heading(b, dt, fallback) { if (Math.hypot(b.vx, b.vz) > 0.6) turn(b, Math.atan2(b.vx, b.vz), dt); else if (fallback !== undefined) turn(b, fallback, dt); }
  const headPos = (b) => new THREE.Vector3(b.x, 1.9, b.z);
  const love = (b, n = 3, ch = "♥", color = "#e0707e") => spawnFx(fx, scene, headPos(b), ch, color, n);

  // ---- phases ----
  function startIn() {
    S.phase = "in"; S.t = 0; S.begging = false; S.held = false; S.eatT = 0;
    hero.lean = 0; hero.nod = 0;
    const st = steps[S.step];
    if (treat) { scene.remove(treat.group); treat = null; }
    if (st.treat) {
      treat = makeTreat(st.treat);
      const hit = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.y = 0.3; treat.group.add(hit);
      treat.group.position.set(toX(W * (W < 700 ? 0.72 : 0.68)), 14, 0.7);
      treat.vy = 0; treat.gone = false; scene.add(treat.group);
    }
    eggObj.group.visible = !S.found[st.key];
    eggObj.t = 0; eggObj.group.scale.setScalar(1); eggObj.egg.position.y = 0;
    eggObj.group.position.set(toX(W * st.egg.x), 0, st.egg.z);
    say(null);
    if (reduced) { S.tx = 0; enterAsk(); }
    else S.tx = W + 24;
  }
  function enterAsk() {
    S.phase = key() === "end" ? "finale" : "ask";
    S.tx = 0;
    if (reduced && treat) { treat.group.position.y = 0; }
    if (S.phase === "finale") hooks.onFinale(true);
  }
  function advance() {
    if (S.step >= steps.length - 1) return;
    S.step++;
    hooks.onStep(S.step);
    S.phase = "swap"; S.t = 0;
    if (reduced) startIn();
  }
  function give() {
    if (S.phase !== "ask" || !treat) return;
    treat.held = false;
    treat.group.position.set(hero.x + Math.sin(hero.yaw) * 1.2, 0, hero.z + Math.cos(hero.yaw) * 1.2);
    startChase();
  }
  function startChase() {
    S.phase = "chase"; S.held = false; S.begging = false; hero.lean = 0; say(null);
    if (reduced) { say(null); finishEat(); }
  }
  function finishEat() {
    if (treat) { treat.gone = true; treat.group.visible = false; }
    bunnies.forEach((b, i) => { love(b, i ? 2 : 4); if (!reduced) setTimeout(() => hopNow(b), i * 140); });
    hero.nod = 0;
    S.phase = "cheer"; S.t = 0; say(null); hooks.onToast(hooks.text.yum);
    if (reduced) advance();
  }

  // ---- input ----
  let pointer = { x: 0, y: 0, down: false, over: false };
  const objectsHit = (cx, cy) => {
    pickRay(cx, cy);
    if (treat && !treat.gone && S.phase === "ask" && ray.intersectObject(treat.group, true).length) return { kind: "treat" };
    if (eggObj.group.visible && !eggObj.found && ray.intersectObject(eggObj.group, true).length) return { kind: "egg" };
    for (const b of bunnies) if (ray.intersectObject(b.root, true).length) return { kind: "bunny", b };
    return null;
  };
  function petBunny(b) { b.pet = 1.5; b.squash = 0.12; b.liftV = 3.2; love(b, 3); if (b === hero && !reduced) hopNow(b); }
  function collectEgg() {
    if (eggObj.found || S.found[key()]) return;
    S.found[key()] = true; eggObj.found = true; eggObj.t = 0;
    spawnFx(fx, scene, new THREE.Vector3(eggObj.group.position.x, 1, eggObj.group.position.z), "✦", "#e9b93a", 6);
    hooks.onFound(Object.keys(S.found).length);
  }
  function down(e) {
    pointer.x = e.clientX; pointer.y = e.clientY;
    const h = objectsHit(e.clientX, e.clientY);
    if (!h) return;
    e.preventDefault();
    if (h.kind === "egg") collectEgg();
    else if (h.kind === "bunny") petBunny(h.b);
    else if (h.kind === "treat") { treat.held = true; S.held = true; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"; }
  }
  function move(e) { pointer.x = e.clientX; pointer.y = e.clientY; pointer.over = true; }
  function up(e) {
    if (!(treat && treat.held)) return;
    treat.held = false; S.held = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch {}
    if (S.phase === "ask") startChase();
  }
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("pointerleave", () => { pointer.over = false; });
  window.addEventListener("resize", resize);

  // ---- per-frame ----
  const anchorW = new THREE.Vector3();
  function updateRopes(t) {
    const ap = groundAtAnchor();
    anchorW.copy(ap);
    ropes.forEach((r, i) => {
      const b = bunnies[i];
      const hide = i === 0 && ["ask", "chase", "eat", "cheer"].includes(S.phase);
      r.visible = !hide && S.phase !== "swap";
      if (!r.visible) return;
      const a = b.mouth, d = a.distanceTo(anchorW);
      const slack = S.phase === "in" || S.phase === "out" ? 0.12 : Math.min(1.4, 0.3 + Math.max(0, 14 - d) * 0.1);
      const pts = [];
      for (let k = 0; k <= 12; k++) {
        const s = k / 12, p = a.clone().lerp(anchorW, s);
        p.y = Math.max(0.06, p.y - 4 * s * (1 - s) * slack * Math.min(d, 6) * 0.35);
        pts.push(p);
      }
      r.geometry.dispose();
      r.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, 0.05, 5);
    });
  }
  function groundAtAnchor() { return groundAt(anchorPx(), H - stripH - 4, 1.2) || new THREE.Vector3(); }

  const q = new THREE.Vector3();
  function tick(dt, t) {
    S.t += dt;
    const ph = S.phase;
    const prevTx = S.tx;

    // slide and gang position
    if (ph === "swap") { if (S.t > 0.15) startIn(); }
    else if (ph === "in") {
      const u1 = Math.min(1, S.t / 1.5); S.tx = (W + 24) * (1 - ease(u1));
      if (u1 >= 1) enterAsk();
    } else if (ph === "out") {
      const u1 = Math.min(1, S.t / 1.1); S.tx = -(W + 40) * easeIn(u1);
      if (u1 >= 1) advance();
    }
    const towing = ph === "in" || ph === "out";
    const vTx = (S.tx - prevTx) / Math.max(dt, 1e-4);
    bunnies.forEach((b, i) => {
      if (towing) { b.x = towX(i); b.z = lane[i]; b.vx = vTx / u; b.vz = 0; turn(b, -Math.PI / 2, dt); }
    });
    if (ph === "swap") bunnies.forEach((b, i) => { b.x = towX(i) - (W + 60) / u; });

    // the hero's job
    const tp = treat ? treat.group.position : null;
    if (ph === "ask" && tp) {
      if (treat.held) {
        const g = groundAt(pointer.x, pointer.y);
        if (g) { const lim = W / u / 2 - 0.8; tp.x += (THREE.MathUtils.clamp(g.x, -lim, lim) - tp.x) * Math.min(1, dt * 20); tp.z += (THREE.MathUtils.clamp(g.z, -3, 3.4) - tp.z) * Math.min(1, dt * 20); }
        tp.y += (1.0 - tp.y) * Math.min(1, dt * 12);
        say(hooks.text.hold);
      } else say(steps[S.step].ask);
      if (reduced) { moveTo(hero, tp.x - 1.6, tp.z, 0, dt); turn(hero, Math.PI / 2, dt); }
      else if (S.begging) {
        hero.vx *= 0.8; hero.vz *= 0.8; hero.lean += (1 - hero.lean) * Math.min(1, dt * 8);
        turn(hero, Math.atan2(tp.x - hero.x, tp.z - hero.z), dt);
        if ((S.begT -= dt) <= 0) { S.begging = false; S.begT = 3 + Math.random() * 2; }
      } else {
        S.a += dt * (treat.held ? 1.7 : 1.0);
        hero.lean += (0 - hero.lean) * Math.min(1, dt * 8);
        moveTo(hero, tp.x + Math.cos(S.a) * 2.2, tp.z + Math.sin(S.a) * 1.15, 6, dt);
        heading(hero, dt);
        if (!treat.held && (S.begT -= dt) <= 0) { S.begging = true; S.begT = 1.7; }
      }
    } else if (ph === "chase" && tp) {
      const dx = tp.x - hero.x, dz = tp.z - hero.z, d = Math.hypot(dx, dz);
      if (d > 0.95) moveTo(hero, tp.x - dx / d * 0.9, tp.z - dz / d * 0.9, 6.5, dt);
      else { hero.vx = hero.vz = 0; S.phase = "eat"; S.eatT = 0; }
      heading(hero, dt, Math.atan2(dx, dz));
    } else if (ph === "eat" && tp) {
      S.eatT += dt; hero.nod = Math.min(1, S.eatT / 1.5);
      hero.vx = hero.vz = 0; turn(hero, Math.atan2(tp.x - hero.x, tp.z - hero.z), dt);
      treat.group.scale.setScalar(Math.max(0.05, 1 - S.eatT / 1.5));
      if (S.eatT > 1.5) finishEat();
    } else if (ph === "cheer") {
      if (S.t > 0.9) { S.phase = "gather"; S.t = 0; hooks.onToast(""); }
    } else if (ph === "gather") {
      let far = 0;
      bunnies.forEach((b, i) => { far = Math.max(far, moveTo(b, towX(i), lane[i], 7, dt)); heading(b, dt, -Math.PI / 2); });
      if (far < 0.25 || S.t > 4) { S.phase = "out"; S.t = 0; }
    } else if (ph === "finale") {
      say("finale");
      bunnies.forEach((b, i) => {
        moveTo(b, toX(W / 2 + (i - 1) * 130 * sc()), lane[i] + 0.4, 5, dt);
        heading(b, dt, 0);
        if (!reduced && (b.idle -= dt) <= 0) { b.idle = 1.2 + Math.random() * 2.2; hopNow(b); if (Math.random() < 0.5) love(b, 1); }
      });
    }

    // the others watch her, fidget, and wait
    if (ph === "ask" || ph === "chase" || ph === "eat" || ph === "cheer") {
      bunnies.forEach((b, i) => {
        if (i === 0) return;
        b.x += (towX(i) - b.x) * Math.min(1, dt * 3); b.z += (lane[i] - b.z) * Math.min(1, dt * 3);
        b.vx = b.vz = 0; turn(b, Math.atan2(hero.x - b.x, hero.z - b.z), dt);
        if (!reduced && (b.idle -= dt) <= 0) { b.idle = 2 + Math.random() * 4; hopNow(b); }
      });
    }
    if (ph === "cheer" || ph === "eat") bunnies.forEach((b) => { if (b !== hero) b.lean *= 0.9; });

    // treat falls and settles
    if (treat && !treat.gone) {
      const g = treat.group;
      if (!treat.held) {
        treat.vy -= 22 * dt; g.position.y += treat.vy * dt;
        if (g.position.y <= 0) { g.position.y = 0; treat.vy = treat.vy < -3 ? -treat.vy * 0.3 : 0; }
      }
      treat.bob.position.y = treat.held ? Math.sin(t * 9) * 0.05 : Math.sin(t * 2.4) * 0.03 + (ph === "ask" ? 0.04 : 0);
      treat.bob.rotation.y += dt * (treat.held ? 4 : 0.8);
      const sh = 1 - Math.min(0.5, g.position.y * 0.1); treat.shadow.scale.set(0.4 * sh, 0.32 * sh, 1);
      treat.shadow.position.y = 0.012 - g.position.y;
    }

    // the egg: wiggles now and then so the curious find it
    const eg = eggObj;
    if (eg.found) { eg.t += dt; eg.egg.position.y = Math.sin(Math.min(1, eg.t * 1.6) * Math.PI) * 1.8; eg.egg.rotation.y += dt * 12; eg.group.scale.setScalar(Math.max(0.001, 1 - Math.max(0, eg.t - 0.6) * 2.5)); if (eg.t > 1) { eg.group.visible = false; eg.found = false; eg.group.scale.setScalar(1); eg.egg.position.y = 0; } }
    else if (!reduced) eg.egg.rotation.z = Math.max(0, Math.sin(t * 1.3 + 2)) ** 24 * Math.sin(t * 30) * 0.25;

    bunnies.forEach((b) => poseBunny(b, dt, t, ph === "swap"));
    updateRopes(t);
    updateFx(fx, scene, dt);

    // the DOM slide follows the gang; it sways a little as they hop
    const tilt = towing ? Math.sin(hero.hop) * 0.4 * (Math.abs(vTx) > 40 ? 1 : 0) : 0;
    slide.style.transform = `translateX(${S.tx.toFixed(1)}px) rotate(${tilt.toFixed(2)}deg)`;

    // the speech bubble rides above whoever is talking
    const talking = S.text && ["ask", "finale"].includes(ph);
    if (talking) {
      const b = ph === "finale" ? bunnies[1] : hero;
      q.set(b.x, 3.0, b.z).project(camera);
      const px = THREE.MathUtils.clamp((q.x * 0.5 + 0.5) * W, 110, W - 110), py = (-q.y * 0.5 + 0.5) * H;
      bubble.style.transform = `translate(${px.toFixed(0)}px, ${py.toFixed(0)}px) translate(-50%, -100%)`;
      bubble.style.opacity = "1"; bubble.style.visibility = "visible";
    } else { bubble.style.opacity = "0"; bubble.style.visibility = "hidden"; }

    // cursor hint
    if (!treat?.held && pointer.over) {
      const h = objectsHit(pointer.x, pointer.y);
      canvas.style.cursor = h ? (h.kind === "treat" ? "grab" : "pointer") : "default";
    }
  }

  let last = performance.now(), raf = 0, t0 = last;
  function loop(now) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    tick(dt, (now - t0) / 1000);
    renderer.render(scene, camera);
  }
  resize();
  hooks.onStep(0);
  S.phase = "swap"; S.t = 0.1;
  if (reduced) startIn();
  raf = requestAnimationFrame(loop);

  const api = {
    give, collectEgg,
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      renderer.dispose();
    },
    _S: S,
  };
  return api;
}
