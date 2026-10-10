// The 3D half of the interactive tour: sky, grass and three bunnies. The Back and
// Next treat buttons send a treat to the hero; she eats it, the scene's text
// fades out and the next one fades in (CSS follows `data-phase` on the layer).
// This file owns the canvas and the choreography; GameShell owns the text.
import * as THREE from "three";
import { COL, makeBunny, poseBunny, hopNow, makeTreat, makeFlower, makeTuft, spawnFx, updateFx } from "./bunny3d.js";
import { setPose, stepPose } from "./bunnyPoses.js";
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
  let treat = null;
  const fx = [];

  // ---- state ----
  // phases: swap -> in -> rest -> eat -> out -> swap ... ; `dir` is +1 for Next
  // (cards leave to the left, arrive from the right) and -1 for Back.
  const S = { scene: 0, phase: "swap", t: 0, par: 0, dir: 1, target: 0, eatT: 0 };
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pickRay(cx, cy) { ndc.set((cx / W) * 2 - 1, -(cy / H) * 2 + 1); ray.setFromCamera(ndc, camera); }
  const key = () => scenes[S.scene].key;

  const turn = (b, yaw, dt) => { b.yaw += wrap(yaw - b.yaw) * (1 - Math.exp(-dt * 10)); };
  const headPos = (b) => new THREE.Vector3(b.x, 1.9, b.z);
  const love = (b, n = 3, ch = "♥", color = "#e0707e") => spawnFx(fx, scene, headPos(b), ch, color, n);
  const setBusy = (v) => { if (S.busy !== v) { S.busy = v; hooks.onBusy?.(v); } };

  // ---- where the bunnies rest: a little group in the middle of the grass ----
  const stand = [0.5, 0.41, 0.59];
  const restX = (i) => toX(W * stand[i]);
  // they face the screen, angled a little toward the middle and a little apart from each other
  const angle = [0.3, -0.28, 0.22];
  const glance = (b, i) => clamp(-b.x / Math.max(1, W / u / 2), -1, 1) * 0.3 + angle[i];
  // who is doing what in each scene (the hero stands up for treats, everyone runs to their spot)
  const POSE = { hello: ["stand", "sit", "sit"], village: ["sit", "loaf", "sit"], path: ["sit", "sit", "long"], end: ["sit", "sit", "sit"] };
  const upright = (b) => b.poseName === "sit" || b.poseName === "stand";
  const setPhase = (ph) => { S.phase = ph; S.t = 0; cards.dataset.phase = ph; };

  // ---- phases: the scene's text fades out, the next one fades in (CSS reads data-phase) ----
  function startIn() {
    setPhase("in");
    if (reduced) enterRest();
  }
  function enterRest() {
    setPhase("rest");
    bunnies.forEach((b, i) => { b.vx = b.vz = 0; if (!reduced && key() !== "end" && upright(b)) setTimeout(() => hopNow(b), 120 * i); });
    setBusy(false);
  }
  // Called from the Back and Next buttons. Ignored while anything is moving.
  function nav(dir, to) {
    if (S.phase !== "rest") return false;
    const target = to ?? S.scene + dir;
    if (target < 0 || target >= scenes.length || target === S.scene) return false;
    S.dir = dir; S.target = target; setPhase("eat"); S.eatT = 0; setBusy(true);
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
    setPhase("out");
    if (reduced) arrive();
  }
  function arrive() {
    S.scene = S.target;
    hooks.onScene(S.scene);
    sky?.setStep(scenes[S.scene].sky);
    setPhase("swap");
    if (reduced) S.t = 0.2;
  }

  // ---- input: the canvas sits over the cards and ignores the pointer, so the
  // window listens and asks the scene what was under it ----
  let pointer = { x: 0, y: 0, over: false };
  const objectsHit = (cx, cy) => {
    pickRay(cx, cy);
    for (const b of bunnies) if (ray.intersectObject(b.root, true).length) return { kind: "bunny", b };
    return null;
  };
  function petBunny(b) { b.pet = 1.5; b.squash = 0.12; b.liftV = 3.2; love(b, 3); if (b === hero && !reduced) hopNow(b); }
  const onControl = (e) => !!e.target.closest?.("button, a, input, .tour-dialog, .tour-scroll");
  function down(e) {
    pointer.x = e.clientX; pointer.y = e.clientY;
    if (e.button > 0 || onControl(e)) return;
    const h = objectsHit(e.clientX, e.clientY);
    if (!h) return;
    e.preventDefault();
    petBunny(h.b);
  }
  function move(e) { pointer.x = e.clientX; pointer.y = e.clientY; pointer.over = true; }
  window.addEventListener("pointerdown", down);
  window.addEventListener("pointermove", move);
  window.addEventListener("resize", resize);

  // ---- per-frame ----
  const tmpV = new THREE.Vector3();
  function tick(dt, t) {
    S.t += dt;
    const ph = S.phase;
    if (ph === "swap") {
      // wait for React to render the new scene before fading it in
      if (S.t > 0.15 && cards.dataset.scene === scenes[S.scene].key) startIn();
    } else if (ph === "in") {
      if (S.t >= 0.8) enterRest();
    } else if (ph === "out") {
      if (S.t >= 0.6) arrive();
    }
    // the hills drift a little as the scenes change
    S.par += (-S.scene * 420 - S.par) * (1 - Math.exp(-dt * 1.5));

    bunnies.forEach((b, i) => {
      const rx = restX(i);
      b.x += (rx - b.x) * Math.min(1, dt * 4); b.z += (lane[i] - b.z) * Math.min(1, dt * 4);
      b.vx = b.vz = 0;
      turn(b, ph === "eat" && b === hero ? 0 : glance(b, i), dt);
      // the last scene is bedtime: they curl up and drift off, a petting wakes one briefly
      const asleep = key() === "end" && (ph === "in" || ph === "rest") && b.pet <= 0;
      b.sleepT = asleep ? 1 : 0;
      const far = Math.hypot(rx - b.x, lane[i] - b.z) > 0.5;
      setPose(b, far ? "run" : asleep ? "flop" : ph === "eat" && b === hero ? "stand" : (POSE[key()] || POSE.end)[i]);
      if (!reduced && ph !== "swap" && (b.idle -= dt) <= 0) {
        b.idle = (asleep ? 2.4 : 3) + Math.random() * 3;
        if (asleep) { if (b.sleep > 0.8) spawnFx(fx, scene, headPos(b), "z", "#dfe6ff", 1); }
        else if (upright(b) && (b !== hero || ph === "rest")) hopNow(b);
      }
    });

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

    bunnies.forEach((b) => { stepPose(b, dt, t); poseBunny(b, dt, t, false); });
    updateFx(fx, scene, dt);
    sky?.update(dt, t, S.par);

    // cursor hint
    if (pointer.over) {
      const h = objectsHit(pointer.x, pointer.y);
      if (!(pointer.x && document.elementFromPoint(pointer.x, pointer.y)?.closest?.("button, a, .tour-dialog, .tour-scroll"))) root.style.cursor = h ? "pointer" : "";
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
  S.phase = "swap"; S.t = 0.1; cards.dataset.phase = "swap";
  raf = requestAnimationFrame(loop);

  return {
    nav,
    sky: (i) => sky?.setStep(i),
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
