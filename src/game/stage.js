// The 3D half of the interactive tour. Three bunnies tow small DOM cards in on
// ropes (bunny i tows card i); the Back and Next treat buttons send a treat to
// the hero, she eats it, and the gang tows the cards off and fetches the next
// scene. This file owns the canvas and the choreography; GameShell owns the cards.
import * as THREE from "three";
import { COL, makeBunny, poseBunny, hopNow, makeTreat, makeEgg, makeFlower, makeTuft, makeCart, spawnFx, updateFx } from "./bunny3d.js";
import { createSky } from "./sky.js";

THREE.ColorManagement.enabled = false; // match the look the mockup was tuned in

const ease = (u) => 1 - Math.pow(1 - u, 3);
const easeIn = (u) => u * u * u;
const rng = (seed) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export function createStage({ canvas, skyCanvas, root, cards, scenes, reduced, hooks }) {
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

  // ---- layout: world x = (px - W/2) / u, and the world origin sits `E` px above the bottom.
  // The cards stand on the grass strip (strip = E + 1.75u), which is fixed height
  // because the treat buttons live in it. ----
  let W = 1, H = 1, u = 40, E = 100, strip = 130;
  const clamp = THREE.MathUtils.clamp;
  const toX = (px) => (px - W / 2) / u;
  const sinP = Math.sin(pitch), cosP = Math.cos(pitch);
  function layout() {
    strip = clamp(H * 0.18, 130, 160);
    E = strip - 1.75 * u;
    camera.left = -W / 2 / u; camera.right = W / 2 / u; camera.top = (H - E) / u; camera.bottom = -E / u;
    camera.updateProjectionMatrix();
    root.style.setProperty("--strip", `${strip.toFixed(1)}px`);
  }
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    u = clamp(H * 0.05, 34, 56);
    renderer.setSize(W, H, false);
    sky?.resize(W, H);
    layout();
    ground.scale.x = (W / u + 8) / 100;
    scatter.forEach((s) => s.g.position.x = s.f * (W / u / 2 + 1));
  }

  // ---- ground and scenery ----
  let sky = null;
  try { sky = createSky(skyCanvas, { reduced }); } catch { /* the sky is decoration */ }
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 15.5), new THREE.MeshPhongMaterial({ color: COL.grass, specular: 0, shininess: 0 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, 4.25); scene.add(ground);
  const rand = rng(11), scatter = [];
  for (let i = 0; i < 70; i++) {
    const g = rand() < 0.4 ? makeFlower(rand() < 0.5 ? COL.petalPink : COL.petalYellow) : makeTuft();
    g.position.z = -2.6 + rand() * 6.4; g.rotation.y = rand() * 6; scene.add(g);
    scatter.push({ g, f: rand() * 2 - 1 });
  }

  // ---- cast ----
  const bunnies = [
    makeBunny({ fur: COL.tan, mark: true }),
    makeBunny({ fur: COL.gray, tail: COL.cream }),
    makeBunny({ fur: COL.brown, tail: COL.cream }),
  ];
  const lane = [0.3, -0.9, 1.3];
  bunnies.forEach((b) => scene.add(b.root));
  const hero = bunnies[0];
  const ropeMat = new THREE.MeshPhongMaterial({ color: COL.rope, specular: 0, shininess: 0 });
  const ropes = bunnies.map(() => { const m = new THREE.Mesh(new THREE.BufferGeometry(), ropeMat); m.frustumCulled = false; scene.add(m); return m; });
  const eggObj = makeEgg(); scene.add(eggObj.group);
  // one little cart under each card
  const carts = bunnies.map(() => { const c = makeCart(); scene.add(c.group); return c; });
  let treat = null;
  const fx = [];

  // ---- state ----
  // phases: swap -> in -> rest -> eat -> out -> swap ... ; `dir` is +1 for Next
  // (cards leave to the left, arrive from the right) and -1 for Back.
  const S = { scene: 0, phase: "swap", t: 0, tx: 0, dir: 1, target: 0, found: {}, eatT: 0 };
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pickRay(cx, cy) { ndc.set((cx / W) * 2 - 1, -(cy / H) * 2 + 1); ray.setFromCamera(ndc, camera); }
  const key = () => scenes[S.scene].key;

  const turn = (b, yaw, dt) => { b.yaw += wrap(yaw - b.yaw) * (1 - Math.exp(-dt * 10)); };
  const headPos = (b) => new THREE.Vector3(b.x, 1.9, b.z);
  const love = (b, n = 3, ch = "♥", color = "#e0707e") => spawnFx(fx, scene, headPos(b), ch, color, n);
  const setBusy = (v) => { if (S.busy !== v) { S.busy = v; hooks.onBusy?.(v); } };

  // ---- the cards: their rectangles on screen drive the 3D ----
  let rects = [];
  const readCards = () => {
    const els = cards.children;
    rects = [];
    for (let i = 0; i < els.length && i < 3; i++) {
      const r = els[i].getBoundingClientRect();
      rects.push({ l: r.left, r: r.right, b: r.bottom, cx: (r.left + r.right) / 2 });
    }
  };
  // stacked = the cards share one column (narrow screens)
  const stacked = () => rects.length > 1 && Math.abs(rects[0].cx - rects[1].cx) < 40;
  const wheelScale = () => (stacked() ? 0.55 : W < 900 ? 0.8 : 1);
  // The card each bunny tows (single-card scenes use all three on the one card).
  const cardOf = (i) => rects[Math.min(i, rects.length - 1)];
  // where bunny i stands while resting: in front of its card
  function restX(i) {
    const n = rects.length;
    if (n === 1) return toX(rects[0].cx) + (i - 1) * 2.3;
    if (stacked()) return toX(W * (0.34 + 0.16 * i));
    return toX(rects[i].cx) + (i === 1 ? 0 : (i === 0 ? 1 : -1) * 0.6);
  }
  const hitchX = (i) => toX(S.dir > 0 ? cardOf(i).l + 14 : cardOf(i).r - 14);
  // while towing the bunny walks ahead of the hitch, in the direction of travel
  function towXof(i) {
    const spread = rects.length === 1 || stacked() ? 1.3 * i : 0;
    return hitchX(i) - S.dir * (1.7 + spread);
  }
  const towYaw = () => -S.dir * Math.PI / 2 * 0.45; // walks sideways but looks mostly at us
  const glance = (b) => clamp(-b.x / Math.max(1, W / u / 2), -1, 1) * 0.35;

  // ---- phases ----
  function placeEgg() {
    const st = scenes[S.scene];
    eggObj.group.visible = !S.found[st.key];
    eggObj.t = 0; eggObj.found = false; eggObj.group.scale.setScalar(1); eggObj.egg.position.y = 0;
    eggObj.group.position.set(toX(W * st.egg.x), 0, st.egg.z);
  }
  function startIn() {
    S.phase = "in"; S.t = 0;
    placeEgg();
    readCards();
    if (reduced) { S.tx = 0; enterRest(); } else S.tx = S.dir * (W + 80);
  }
  function enterRest() {
    S.phase = "rest"; S.t = 0; S.tx = 0;
    readCards();
    bunnies.forEach((b, i) => { b.x = restX(i); b.z = lane[i]; b.vx = b.vz = 0; });
    if (!reduced) carts.forEach((c, i) => i < rects.length && c.wheels.forEach((w) => spawnFx(fx, scene, new THREE.Vector3(w.position.x, 0.2, w.position.z + 0.6), "☁", "#d8d0bd", 1)));
    setBusy(false);
  }
  // Called from the Back and Next buttons. Ignored while anything is moving.
  function nav(dir) {
    if (S.phase !== "rest") return false;
    const target = S.scene + dir;
    if (target < 0 || target >= scenes.length) return false;
    S.dir = dir; S.target = target; S.phase = "eat"; S.t = 0; S.eatT = 0; setBusy(true);
    hero.nod = 0;
    if (treat) scene.remove(treat.group);
    treat = makeTreat(dir > 0 ? "apple" : "carrot");
    treat.vy = 0; treat.gone = false; treat.ring.visible = false;
    treat.from = new THREE.Vector3(toX(W * (dir > 0 ? 0.92 : 0.08)), 3.4, 2.4);
    treat.group.position.copy(treat.from); treat.group.scale.setScalar(1.6);
    scene.add(treat.group);
    if (reduced) { treat.group.visible = false; finishEat(); }
    return true;
  }
  function finishEat() {
    if (treat) { treat.gone = true; treat.group.visible = false; }
    love(hero, 4);
    if (!reduced) { hopNow(hero); hooks.onToast(hooks.text.yum); }
    hero.nod = 0;
    S.phase = "out"; S.t = 0;
    if (reduced) arrive();
  }
  function arrive() {
    S.scene = S.target;
    hooks.onScene(S.scene);
    sky?.setStep(scenes[S.scene].sky);
    S.phase = "swap"; S.t = 0; S.tx = S.dir * (W + 80);
    if (reduced) S.t = 0.2;
  }
  function collectEgg() {
    if (eggObj.found || S.found[key()]) return;
    S.found[key()] = true; eggObj.found = true; eggObj.t = 0;
    spawnFx(fx, scene, new THREE.Vector3(eggObj.group.position.x, 1, eggObj.group.position.z), "✦", "#e9b93a", 6);
    hooks.onFound(Object.keys(S.found).length);
  }

  // ---- input: the canvas sits over the cards and ignores the pointer, so the
  // window listens and asks the scene what was under it ----
  let pointer = { x: 0, y: 0, over: false };
  const objectsHit = (cx, cy) => {
    pickRay(cx, cy);
    if (eggObj.group.visible && !eggObj.found && ray.intersectObject(eggObj.group, true).length) return { kind: "egg" };
    for (const b of bunnies) if (ray.intersectObject(b.root, true).length) return { kind: "bunny", b };
    return null;
  };
  function petBunny(b) { b.pet = 1.5; b.squash = 0.12; b.liftV = 3.2; love(b, 3); if (b === hero && !reduced) hopNow(b); }
  const onControl = (e) => !!e.target.closest?.("button, a, input, .tour-card, .tour-dialog");
  function down(e) {
    pointer.x = e.clientX; pointer.y = e.clientY;
    if (e.button > 0 || onControl(e)) return;
    const h = objectsHit(e.clientX, e.clientY);
    if (!h) return;
    e.preventDefault();
    if (h.kind === "egg") collectEgg(); else petBunny(h.b);
  }
  function move(e) { pointer.x = e.clientX; pointer.y = e.clientY; pointer.over = true; }
  window.addEventListener("pointerdown", down);
  window.addEventListener("pointermove", move);
  window.addEventListener("resize", resize);

  // ---- per-frame ----
  const anchors = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  function placeCarts(prevTx, towing) {
    const ws = wheelScale();
    carts.forEach((c, i) => {
      const r = rects[i];
      c.group.visible = !!r && S.phase !== "swap";
      if (!r) return;
      // z puts a wheel centre (y = 0.85 ws) at the card's bottom edge on screen
      const up = (H - r.b - E) / u;
      const z = (0.85 * ws * cosP - up) / sinP;
      const inset = Math.min(0.85 * ws * u + 6, (r.r - r.l) * 0.28);
      c.wheels[0].position.set(toX(r.l + inset), 0.85 * ws, z);
      c.wheels[1].position.set(toX(r.r - inset), 0.85 * ws, z);
      c.wheels.forEach((w) => { w.scale.setScalar(ws); if (towing) w.rotation.z -= (S.tx - prevTx) / u / (0.85 * ws); });
      c.hitch.scale.setScalar(ws);
      c.hitch.position.set(hitchX(i), 0.15 * ws, z);
      anchors[i].set(hitchX(i), 0.15 * ws + 0.9 * ws, z);
    });
  }
  function updateRopes() {
    ropes.forEach((r, i) => {
      const b = bunnies[i], towing = S.phase === "in" || S.phase === "out";
      r.visible = towing && !!rects.length && S.phase !== "swap";
      if (!r.visible) return;
      const anchor = anchors[Math.min(i, rects.length - 1)];
      const a = b.mouth, d = a.distanceTo(anchor);
      const pts = [];
      for (let k = 0; k <= 12; k++) {
        const s = k / 12, p = a.clone().lerp(anchor, s);
        p.y = Math.max(0.06, p.y - 4 * s * (1 - s) * 0.12 * Math.min(d, 6) * 0.35);
        pts.push(p);
      }
      r.geometry.dispose();
      r.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, 0.05, 5);
    });
  }

  const tmpV = new THREE.Vector3();
  function tick(dt, t) {
    S.t += dt;
    const ph = S.phase;
    const prevTx = S.tx;
    readCards();

    if (ph === "swap") {
      // wait for React to render the new cards before bringing them in
      if (S.t > 0.15 && cards.dataset.scene === scenes[S.scene].key && rects.length) startIn();
    } else if (ph === "in") {
      const u1 = Math.min(1, S.t / 1.0); S.tx = S.dir * (W + 80) * (1 - ease(u1));
      if (u1 >= 1) enterRest();
    } else if (ph === "out") {
      // the gang gathers at the hitches first, then everything rolls off
      const g = Math.min(1, S.t / 0.35), u1 = clamp((S.t - 0.35) / 0.85, 0, 1);
      S.tx = -S.dir * (W + 80) * easeIn(u1);
      if (u1 >= 1) arrive();
      void g;
    }
    const moving = ph === "in" || ph === "out";
    const vTx = (S.tx - prevTx) / Math.max(dt, 1e-4);
    cards.style.transform = `translateX(${S.tx.toFixed(1)}px)`;
    readCards(); // now including the translation, so wheels and hitches follow

    if (ph === "swap") {
      bunnies.forEach((b, i) => { b.x = (S.dir > 0 ? 1 : -1) * (W / u / 2 + 6 + i); b.z = lane[i]; b.vx = b.vz = 0; });
    } else if (moving && rects.length) {
      const g = ph === "out" ? ease(Math.min(1, S.t / 0.35)) : 1;
      bunnies.forEach((b, i) => {
        const tx = towXof(i);
        // on the way out they first walk from where they rested to the hitch
        b.x = ph === "out" && S.t < 0.35 ? b.x + (tx - b.x) * Math.min(1, dt * 14) : tx;
        b.z += (lane[i] - b.z) * Math.min(1, dt * 8);
        b.vx = ph === "out" && S.t < 0.35 ? (tx - b.x) * 6 : vTx / u; b.vz = 0;
        turn(b, towYaw() * g, dt);
      });
    } else if (ph === "rest" || ph === "eat") {
      bunnies.forEach((b, i) => {
        const rx = restX(i);
        b.x += (rx - b.x) * Math.min(1, dt * 4); b.z += (lane[i] - b.z) * Math.min(1, dt * 4);
        b.vx = b.vz = 0;
        turn(b, ph === "eat" && b === hero ? 0 : glance(b), dt);
        if (!reduced && (b.idle -= dt) <= 0) { b.idle = (key() === "end" ? 1.2 : 3) + Math.random() * 3; if (b !== hero || ph === "rest") { hopNow(b); if (key() === "end" && Math.random() < 0.5) love(b, 1); } }
      });
    }

    // the treat flies to the hero's mouth, she eats it
    if (ph === "eat" && treat && !reduced) {
      S.eatT += dt;
      const f = Math.min(1, S.eatT / 0.45);
      const m = hero.mouth;
      tmpV.lerpVectors(treat.from, m, ease(f)); tmpV.y += Math.sin(f * Math.PI) * 2.2;
      treat.group.position.copy(tmpV);
      treat.group.scale.setScalar(f < 1 ? 1.6 - 0.6 * f : Math.max(0.05, 1 - (S.eatT - 0.45) / 0.3));
      treat.bob.rotation.y += dt * 8;
      hero.nod = f < 1 ? 0 : Math.min(1, (S.eatT - 0.45) / 0.3);
      if (S.eatT > 0.75) finishEat();
    }

    // the egg: wiggles now and then so the curious find it
    const eg = eggObj;
    if (eg.found) { eg.t += dt; eg.egg.position.y = Math.sin(Math.min(1, eg.t * 1.6) * Math.PI) * 1.8; eg.egg.rotation.y += dt * 12; eg.group.scale.setScalar(Math.max(0.001, 1 - Math.max(0, eg.t - 0.6) * 2.5)); if (eg.t > 1) { eg.group.visible = false; eg.found = false; eg.group.scale.setScalar(1); eg.egg.position.y = 0; } }
    else if (!reduced) eg.egg.rotation.z = Math.max(0, Math.sin(t * 1.3 + 2)) ** 24 * Math.sin(t * 30) * 0.25;

    bunnies.forEach((b) => poseBunny(b, dt, t, ph === "swap"));
    placeCarts(prevTx, moving);
    updateRopes();
    updateFx(fx, scene, dt);
    sky?.update(dt, t, S.tx);

    // cursor hint
    if (pointer.over) {
      const h = objectsHit(pointer.x, pointer.y);
      if (!(pointer.x && document.elementFromPoint(pointer.x, pointer.y)?.closest?.("button, a, .tour-card, .tour-dialog"))) root.style.cursor = h ? "pointer" : "";
    }
  }

  let last = performance.now(), raf = 0, t0 = last;
  function loop(now) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    tick(dt, (now - t0) / 1000);
    sky?.render();
    renderer.render(scene, camera);
  }
  resize();
  S.busy = true;
  hooks.onScene(0);
  sky?.setStep(scenes[0].sky, true);
  S.phase = "swap"; S.t = 0.1; S.tx = W + 80;
  raf = requestAnimationFrame(loop);

  return {
    nav, collectEgg,
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      sky?.dispose();
      renderer.dispose();
    },
    _S: S,
  };
}
