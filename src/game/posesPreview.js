// Draft gallery of the bunny poses: every pose in a column, one fur colour per row.
import * as THREE from "three";
import { COL, makeBunny } from "./bunny3d.js";
import { POSES, setPose, stepPose } from "./bunnyPoses.js";

THREE.ColorManagement.enabled = false;
const canvas = document.getElementById("c"), labels = document.getElementById("labels");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa9cfe0);
scene.add(new THREE.AmbientLight(0xffffff, 0.86 * Math.PI));
const sun = new THREE.DirectionalLight(0xfff3e0, 0.26 * Math.PI); sun.position.set(6, 8, 5); scene.add(sun);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshPhongMaterial({ color: COL.grass, specular: 0, shininess: 0 }));
ground.rotation.x = -Math.PI / 2; scene.add(ground);

const only = new URLSearchParams(location.search).get("only"); // ?only=flop zooms in on one pose
const names = only ? [only] : [...Object.keys(POSES), "run"];
const rows = [{ fur: COL.tan, mark: true }, { fur: COL.gray, tail: COL.cream }, { fur: COL.brown, tail: COL.cream }];
const GX = 3.8, GZ = 4.2;
const bunnies = [];
rows.forEach((spec, r) => names.forEach((name, c) => {
  const b = makeBunny(spec);
  b.x = (c - (names.length - 1) / 2) * GX; b.z = (r - 1) * GZ;
  b.root.position.set(b.x, 0, b.z);
  setPose(b, name); stepPose(b, 0, 0, true);
  scene.add(b.root); bunnies.push(b);
}));
names.forEach(() => labels.appendChild(document.createElement("span")));
[...labels.children].forEach((s, i) => (s.textContent = names[i]));

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 200);
let yaw = 0.9, pitch = THREE.MathUtils.degToRad(30), drag = null;
function aim() {
  const d = 60;
  camera.position.set(0, Math.sin(pitch) * d, Math.cos(pitch) * d);
  bunnies.forEach((b) => (b.root.rotation.y = yaw));
  camera.lookAt(0, 0.6, 0);
}
function resize() {
  const W = innerWidth, H = innerHeight, hw = Math.max(names.length * GX, 7.6) / 2 + 0.2, hh = hw / (W / H);
  camera.left = -hw; camera.right = hw; camera.top = hh; camera.bottom = -hh; camera.updateProjectionMatrix();
  renderer.setSize(W, H, false);
}
addEventListener("resize", resize); resize(); aim();
canvas.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, yaw, pitch }; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener("pointermove", (e) => {
  if (!drag) return;
  yaw = drag.yaw - (e.clientX - drag.x) * 0.006;
  pitch = THREE.MathUtils.clamp(drag.pitch + (e.clientY - drag.y) * 0.004, 0.15, 1.3);
  aim();
});
canvas.addEventListener("pointerup", () => (drag = null));

const clock = new THREE.Clock(), v = new THREE.Vector3();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  bunnies.forEach((b) => { stepPose(b, dt, t); });
  renderer.render(scene, camera);
  const W = innerWidth, H = innerHeight;
  [...labels.children].forEach((s, i) => {
    v.set((i - (names.length - 1) / 2) * GX, 0, GZ + 1.1).project(camera);
    s.style.left = `${(v.x * 0.5 + 0.5) * W}px`; s.style.top = `${(-v.y * 0.5 + 0.5) * H}px`;
  });
});
