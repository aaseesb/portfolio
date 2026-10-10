// The 3D half of the interactive tour: sky, grass and three bunnies. The Back and
// Next treat buttons send a treat to the hero; she eats it, the scene's text
// fades out and the next one fades in (CSS follows `data-phase` on the layer).
// This file owns the canvas and the choreography; GameShell owns the text.
import * as THREE from "three";
import { COL, makeBunny, poseBunny, hopNow, makeTreat, makeFlower, makeTuft, spawnFx, updateFx } from "./bunny3d.js";
import { setPose, stepPose } from "./bunnyPoses.js";
import { createSky } from "./sky.js";
import { makeHouse } from "./house3d.js";

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
    makeBunny({ fur: COL.brown, tail: COL.cream, lop: 1 }),
    makeBunny({ fur: 0xe4d2b4, tail: COL.cream, size: 0.62, lop: 1 }), // the babies
    makeBunny({ fur: 0xb9bcc8, tail: COL.cream, size: 0.55 }),
    makeBunny({ fur: 0x9a7456, tail: COL.cream, size: 0.68 }),
  ];
  bunnies.forEach((b) => { b.calm = reduced; scene.add(b.root); });
  const hero = bunnies[0];
  let treat = null;
  const fx = [];

  // ---- treats scattered on the grass: tap one and the nearest bunny eats it; drag one and the bunnies follow it ----
  const treats = ["apple", "carrot", "leaf", "apple", "carrot"].map((kind) => {
    const tr = { ...makeTreat(kind), fx: 0, z: 0, gone: true, eater: null, respawn: 0.5 + Math.random() * 2, pop: 0 };
    tr.ring.visible = false; tr.drag = false; tr.group.scale.setScalar(1.3); tr.group.visible = false; scene.add(tr.group);
    return tr;
  });
  const placeTreat = (tr) => { // somewhere on the grass, not on top of another treat
    for (let k = 0; k < 12; k++) {
      tr.fx = 0.18 + Math.random() * 0.64; tr.z = 0.5 + Math.random() * 1.2;
      if (treats.every((o) => o === tr || o.gone || Math.hypot((o.fx - tr.fx) * W / u, o.z - tr.z) > 1.4)) break;
    }
    tr.gone = false; tr.pop = 0;
  };

  // ---- state ----
  // phases: swap -> in -> rest -> eat -> out -> swap ... ; `dir` is +1 for Next
  // (cards leave to the left, arrive from the right) and -1 for Back.
  const S = { scroll: 0, scene: 0, phase: "swap", t: 0, par: 0, dir: 1, target: 0, eatT: 0 };
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pickRay(cx, cy) { ndc.set((cx / W) * 2 - 1, -(cy / H) * 2 + 1); ray.setFromCamera(ndc, camera); }
  const key = () => scenes[S.scene].key;

  const turn = (b, yaw, dt) => { b.yaw += wrap(yaw - b.yaw) * (1 - Math.exp(-dt * 10)); };
  const headPos = (b) => new THREE.Vector3(b.x, 1.9, b.z);
  const love = (b, n = 3, ch = "♥", color = "#e0707e") => spawnFx(fx, scene, headPos(b), ch, color, n);
  const setBusy = (v) => { if (S.busy !== v) { S.busy = v; hooks.onBusy?.(v); } };

  // ---- where the bunnies rest: a little group in the middle of the grass ----
  // seven evenly spread spots across the meadow; the hero keeps the middle one, the rest take turns at the others
  const SLOT = [0.16, 0.28, 0.39, 0.5, 0.61, 0.72, 0.84], SLOT_Z = [0.9, -0.3, 1.2, 0.3, 1.0, -0.6, 0.8];
  const slotOf = [3, 1, 5, 2, 0, 6];
  const restX = (i) => toX(W * SLOT[slotOf[i]]);
  const restZ = (i) => (key() === "village" ? Math.max(SLOT_Z[slotOf[i]], 0.8) : SLOT_Z[slotOf[i]]); // keep clear of the houses
  const shuffle = (n = 1) => { // one bunny at a time picks a free spot (or trades) and runs over to it
    for (let k = 0; k < n; k++) {
      const i = 1 + Math.floor(Math.random() * (bunnies.length - 1));
      const free = SLOT.map((_, j) => j).filter((j) => j !== 3 && !slotOf.includes(j));
      const j = free.length ? free[Math.floor(Math.random() * free.length)] : slotOf[1 + Math.floor(Math.random() * (bunnies.length - 1))];
      const o = slotOf.indexOf(j);
      if (o > 0 && o !== i) slotOf[o] = slotOf[i];
      slotOf[i] = j;
    }
  };
  let moveT = 5, scrollStep = 0;
  // they face the screen, angled a little toward the middle and a little apart from each other
  // sitting and standing bunnies turn a good way round, lying ones go side-on; never away from the screen
  const side = [1, -1, 1, -1, 1, -1];
  const TURN = { sit: 0.6, stand: 0.4, loaf: 0.7, long: 1.15, flop: 1.1, run: 0.5 };
  const glance = (b, i) => clamp(-b.x / Math.max(1, W / u / 2), -1, 1) * 0.25 + side[i] * (TURN[b.poseName] ?? 0.5);
  // who is doing what in each scene (the hero stands up for treats, everyone runs to their spot)
  const POSE = { hello: ["stand", "sit", "sit", "sit", "loaf", "sit"], village: ["sit", "loaf", "sit", "loaf", "sit", "sit"], path: ["sit", "sit", "long", "sit", "sit", "loaf"], end: ["sit", "sit", "sit", "sit", "sit", "sit"] };
  // [dx, dz, height] around the hero when they sleep
  const HUDDLE = [[0, 0.2, 0], [-1.0, -0.6, 0], [1.05, 0.7, 0], [0.2, 0.15, 0.5], [-1.3, 0.8, 0], [1.05, 0.7, 0.45]];
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
    drop();
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
    S.scene = S.target; S.scroll = 0; scrollStep = 0; shuffle(2);
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
    for (const tr of treats) if (!tr.gone && tr.group.visible && ray.intersectObject(tr.group, true).length) return { kind: "treat", tr };
    return null;
  };
  // Press and hold to pick a bunny up (it dangles and kicks); let go and it drops back to the grass.
  // A quick tap pets, and so does sweeping the cursor back and forth over one.
  let hold = null; // { b, x, y, t, up } while the pointer is down on a bunny
  const holdAt = (cx, cy, b) => { // where to carry it: under the cursor, at the depth it was grabbed
    const z = b.z, yy = ((H - cy - E) / u + z * sinP) / cosP;
    hold.wx = toX(cx); hold.wz = z; b.holdY = Math.max(1.1, yy - 0.7);
  };
  const releaseGoal = (b) => { if (b.goal) { b.goal.eater = null; b.goal = null; } };
  function feed(tr) { // the nearest free bunny goes for it
    if (S.phase !== "rest" || key() === "end" || tr.eater) return;
    const tx = toX(W * tr.fx);
    let best = null, bd = 1e9;
    for (const b of bunnies) {
      if (b.held || b.goal || b.pet > 0 || b === hold?.b) continue;
      const d = Math.hypot(b.x - tx, b.z - tr.z);
      if (d < bd) { bd = d; best = b; }
    }
    if (best) { best.goal = tr; tr.eater = best; }
  }
  function dragTreat(e) { // carry it under the cursor on the grass; the two nearest bunnies tag along
    const tr = hold.tr;
    tr.fx = Math.min(0.84, Math.max(0.16, e.clientX / W));
    tr.z = Math.min(2.4, Math.max(0.2, -((H - e.clientY - E) / u) / sinP));
    if (hold.up) return;
    hold.up = true; tr.drag = true; root.style.cursor = "grabbing";
    if (S.phase !== "rest" || key() === "end") return;
    const tx = toX(W * tr.fx);
    bunnies.filter((b) => !b.held && !b.goal).sort((a, b) => Math.hypot(a.x - tx, a.z - tr.z) - Math.hypot(b.x - tx, b.z - tr.z))
      .slice(0, 2).forEach((b) => { b.goal = tr; b.pet = 0; });
  }
  function pickUp() {
    const b = hold.b; releaseGoal(b); hold.up = true; b.held = true; b.hopImpulse = false; b.running = false; b.pet = 0;
    if (!reduced) spawnFx(fx, scene, headPos(b), "!", "#f0b44c", 1);
    root.style.cursor = "grabbing";
  }
  function drop() {
    if (!hold) return;
    if (hold.tr) { hold.tr.drag = false; root.style.cursor = ""; hold = null; return; }
    const b = hold.b;
    if (hold.up) { b.held = false; b.pet = 1.4; b.liftV = 0; love(b, 2); root.style.cursor = ""; }
    hold = null;
  }
  function petBunny(b) { b.pet = 1.5; b.squash = 0.12; b.liftV = 3.2; love(b, 3); if (b === hero && !reduced) hopNow(b); }
  const onScroll = (e) => { const el = e.target; if (el?.scrollHeight > el.clientHeight) { S.scroll = el.scrollTop / (el.scrollHeight - el.clientHeight); const st = Math.floor(S.scroll * 4); if (st !== scrollStep) { scrollStep = st; shuffle(); } } };
  cards.addEventListener("scroll", onScroll, true);
  const onControl = (e) => !!e.target.closest?.("button, a, input, .tour-dialog, .tour-scroll");
  function down(e) {
    pointer.x = e.clientX; pointer.y = e.clientY;
    if (e.button > 0 || onControl(e)) return;
    const h = objectsHit(e.clientX, e.clientY);
    if (!h) return;
    e.preventDefault();
    drop();
    if (h.kind === "treat") { hold = { tr: h.tr, x: e.clientX, y: e.clientY, up: false }; return; }
    hold = { b: h.b, x: e.clientX, y: e.clientY, t: 0, up: false };
    holdAt(e.clientX, e.clientY, h.b);
  }
  function up() {
    if (hold?.tr && !hold.up) feed(hold.tr);
    else if (hold && !hold.tr && !hold.up) petBunny(hold.b);
    drop();
  }
  function move(e) {
    const dx = e.clientX - pointer.x, dy = e.clientY - pointer.y;
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.over = true;
    if (hold?.tr) { if (hold.up || Math.hypot(e.clientX - hold.x, e.clientY - hold.y) > 8) dragTreat(e); return; }
    if (hold) {
      holdAt(e.clientX, e.clientY, hold.b);
      if (!hold.up && Math.hypot(e.clientX - hold.x, e.clientY - hold.y) > 10) pickUp();
      return;
    }
    if (e.pointerType !== "mouse" || e.buttons || onControl(e) || reduced) return;
    const h = objectsHit(e.clientX, e.clientY);
    bunnies.forEach((b) => { if (h?.b !== b) b.rub = Math.max(0, b.rub - 4); });
    if (h?.kind !== "bunny") return;
    h.b.rub += Math.hypot(dx, dy);
    if (h.b.rub > 90) { h.b.rub = 0; h.b.pet = Math.max(h.b.pet, 0.9); love(h.b, 1); }
  }
  window.addEventListener("pointerdown", down);
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);
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

    if (ph === "rest" && !reduced && key() !== "end" && (moveT -= dt) <= 0) { moveT = 6 + Math.random() * 5; shuffle(); }
    if (hold && !hold.up && (hold.t += dt) > 0.3) pickUp();
    bunnies.forEach((b, i) => {
      if (b.held) { // carried: follows the cursor, faces the screen, flails
        b.x += (hold.wx - b.x) * Math.min(1, dt * 16); b.z = hold.wz; b.vx = b.vz = 0; b.sleepT = 0;
        turn(b, 0, dt); setPose(b, "held");
        return;
      }
      const rx = restX(i);
      // sitting bunnies potter about their spot; everyone else is eased to it
      const roam = upright(b) && ph === "rest" && !reduced && b.pet <= 0;
      if (!roam) { b.wx = b.wz = 0; }
      else if ((b.wander = (b.wander ?? 2 + i * 1.7) - dt) <= 0) {
        b.wander = 4 + Math.random() * 6;
        b.wx = (Math.random() - 0.5) * 0.3; b.wz = (Math.random() - 0.5) * 0.2;
      }
            let tx = rx + (b.wx || 0), tz = restZ(i) + (b.wz || 0);
      if (b.goal && (ph !== "rest" || key() === "end")) releaseGoal(b);
      if (b.goal?.gone) releaseGoal(b);
      if (b.goal) { tx = toX(W * b.goal.fx) + (b.goal.drag ? (i % 2 ? 0.55 : -0.55) : 0); tz = b.goal.z; }
      // bedtime: everyone piles up around the hero, the little ones sleeping on top of the big ones
      const asleep = key() === "end" && (ph === "in" || ph === "rest") && b.pet <= 0;
      if (asleep) { tx = restX(0) + HUDDLE[i][0]; tz = 0.3 + HUDDLE[i][1]; }
      b.perch = (b.perch || 0) + ((asleep ? HUDDLE[i][2] : 0) - (b.perch || 0)) * Math.min(1, dt * 2.5);
      const gap = Math.hypot(tx - b.x, tz - b.z);
      b.vx = b.vz = 0;
      if (b.goal && !b.goal.drag && gap < 0.3) { // reached the treat: munch
        const tr = b.goal; releaseGoal(b);
        tr.gone = true; tr.group.visible = false; tr.respawn = 5 + Math.random() * 5;
        b.pet = 1.2; b.running = false; love(b, 3); if (!reduced) hopNow(b);
      }
      // a bunny with somewhere to be sets off at a run, facing where it's going, and settles when it gets there
      if (b.pet > 0 || ph === "eat") b.running = false;
      else if (!b.running && gap > (b.goal ? 0.35 : 0.9) && !reduced) b.running = true;
      else if (b.running && gap < 0.12) b.running = false;
      if (reduced) { b.x = tx; b.z = tz; }
      else if (b.running) {
        const dx = tx - b.x, dz = tz - b.z;
        b.runV = Math.min(3.6, (b.runV || 0) + dt * 9);
        const k = Math.min(1, b.runV * dt / gap);
        b.x += dx * k; b.z += dz * k;
        b.vx = dx / gap * b.runV; b.vz = dz / gap * b.runV;
        turn(b, Math.atan2(dx, Math.max(dz, -Math.abs(dx) * 0.4)), dt);
      } else {
        b.runV = 0;
        if (roam && gap < 1.2 && gap > 0.05) {
          const sp = Math.min(1.1, gap / dt), k = sp * dt / gap;
          b.x += (tx - b.x) * k; b.z += (tz - b.z) * k;
          b.vx = (tx - b.x) / gap * sp; b.vz = (tz - b.z) / gap * sp;
        } else { b.x += (tx - b.x) * Math.min(1, dt * 4); b.z += (tz - b.z) * Math.min(1, dt * 4); }
        turn(b, ph === "eat" && b === hero ? 0 : glance(b, i), dt);
      }
      // the last scene is bedtime: they curl up and drift off, a petting wakes one briefly
      b.sleepT = asleep ? 1 : 0;
      const far = b.running;
      setPose(b, far ? "run" : asleep ? ["flop", "loaf", "flop", "loaf", "loaf", "flop"][i] : ph === "eat" && b === hero ? "stand" : (POSE[key()] || POSE.end)[i]);
      if (!reduced && ph !== "swap" && (b.idle -= dt) <= 0) {
        b.idle = (asleep ? 1.4 : 3) + Math.random() * (asleep ? 1.8 : 3);
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

    treats.forEach((tr, i) => {
      if (tr.gone) { if ((tr.respawn -= dt) <= 0 && ph === "rest" && key() !== "end") placeTreat(tr); else { tr.group.visible = false; return; } }
      tr.pop = Math.min(1, tr.pop + dt * 3);
      tr.group.visible = key() !== "end";
      tr.group.position.set(toX(W * tr.fx), tr.drag ? 0.7 : 0, tr.z);
      tr.group.scale.setScalar(1.3 * (1 - Math.pow(1 - tr.pop, 3)));
      if (!reduced) { tr.bob.rotation.y = t * 1.4 + i; tr.bob.position.y = 0.06 + Math.sin(t * 2.4 + i * 1.7) * 0.05; }
    });
    bunnies.forEach((b) => { stepPose(b, dt, t); poseBunny(b, dt, t, false); });
    updateFx(fx, scene, dt);
    sky?.update(dt, t, S.par);

    // cursor hint
    if (pointer.over) {
      const h = objectsHit(pointer.x, pointer.y);
      if (!(pointer.x && document.elementFromPoint(pointer.x, pointer.y)?.closest?.("button, a, .tour-dialog, .tour-scroll"))) root.style.cursor = hold?.up ? "grabbing" : h ? "grab" : "";
    }
  }

  // ---- the 3D house: fitted over its DOM button (the button stays as the hit area) ----
  let house = null, houseEl = null;
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
  function syncHouse() {
    const el = cards.querySelector(".tour-house.is-3d");
    if (el !== houseEl) {
      if (house) { scene.remove(house.root); house = null; }
      houseEl = el;
      if (el) { house = makeHouse({ image: el.querySelector(".tour-window img")?.currentSrc }); scene.add(house.root); }
    }
    if (!house) return;
    const wall = el.querySelector(".tour-wall").getBoundingClientRect();
    pickRay(wall.left + wall.width / 2, wall.bottom);
    if (!ray.ray.intersectPlane(groundPlane, hit)) return;
    house.root.position.copy(hit);
    const k = (wall.width / u) * 0.9;
    house.root.scale.set(k, k / cosP, k);
    house.set(Number(getComputedStyle(cards).opacity), el.classList.contains("is-sel") ? 1 : 0, getComputedStyle(document.documentElement).getPropertyValue("--hill-near").trim());
  }

  let last = performance.now(), raf = 0, t0 = last;
  function loop(now) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    tick(dt, (now - t0) / 1000);
    sky?.render();
    syncHouse();
    renderer.render(scene, camera);
  }
  resize();
  bunnies.forEach((b, i) => { b.x = restX(i); b.z = restZ(i); }); // start spread out, not piled in the middle
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
      cards.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      sky?.dispose();
      renderer.dispose();
    },
    _S: S,
  };
}
