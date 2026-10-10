// A soft low-poly village house for the 3D stage (prototype: one house). The DOM
// <button> in cards.jsx stays as the hit area, focus ring and label; this draws the
// house over it. Each frame the stage reads the button's box and fits the house to it.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { COL, makeShadow } from "./bunny3d.js";

const mat = (color) => new THREE.MeshPhongMaterial({ color, specular: 0x000000, shininess: 0 });
const box = (w, h, d, color, pos, r = 0.05) => {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat(color));
  m.position.set(...pos);
  return m;
};

// 1 unit wide at the walls; sits on y = 0 and faces +z
export function makeHouse({ roof = 0xb5584a, image } = {}) {
  const root = new THREE.Group();
  const g = new THREE.Group(); // everything that fades together
  root.add(g);

  g.add(box(1.04, 0.1, 0.84, 0x9a9288, [0, 0.05, 0], 0.04));       // stone footing
  g.add(box(0.96, 0.7, 0.76, 0xefe3cc, [0, 0.45, 0], 0.07));        // walls

  // roof: a rounded triangular prism with an overhang
  const tri = new THREE.Shape();
  tri.moveTo(-0.6, 0); tri.lineTo(0.6, 0); tri.lineTo(0, 0.44); tri.closePath();
  const rg = new THREE.ExtrudeGeometry(tri, { depth: 0.8, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 3, curveSegments: 4 });
  rg.translate(0, 0, -0.4);
  const rm = new THREE.Mesh(rg, mat(roof));
  rm.position.y = 0.8; g.add(rm);
  g.add(box(0.12, 0.3, 0.12, 0x8a6b45, [0.3, 1.1, -0.1], 0.03));    // chimney
  g.add(box(0.15, 0.05, 0.15, 0x5d4729, [0.3, 1.26, -0.1], 0.02));

  g.add(box(0.2, 0.4, 0.06, 0x8a6b45, [0.32, 0.3, 0.38], 0.04));    // door
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), mat(COL.gold));
  knob.position.set(0.37, 0.3, 0.42); g.add(knob);

  // window: wooden frame round a pane that shows the project's screenshot
  g.add(box(0.46, 0.38, 0.05, 0x5f4730, [-0.18, 0.5, 0.385], 0.03));
  const paneMat = new THREE.MeshBasicMaterial({ color: 0xa9d4ee });
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.3), paneMat);
  pane.position.set(-0.18, 0.5, 0.415); g.add(pane);
  g.add(box(0.5, 0.05, 0.08, 0x8a6b45, [-0.18, 0.28, 0.41], 0.02)); // sill
  if (image) new THREE.TextureLoader().load(image, (t) => { paneMat.map = t; paneMat.color.set(0xffffff); paneMat.needsUpdate = true; });

  const shadow = makeShadow(0.85); shadow.position.z = 0.05; root.add(shadow);

  const fadeMats = [];
  g.traverse((o) => { if (o.material) fadeMats.push(o.material); });
  return {
    root,
    set(opacity, glow) {
      fadeMats.forEach((m) => {
        m.transparent = opacity < 1; m.opacity = opacity;
        if (m.emissive) m.emissive.setRGB(glow * 0.12, glow * 0.09, glow * 0.04);
      });
      shadow.visible = opacity > 0.3;
    },
  };
}
