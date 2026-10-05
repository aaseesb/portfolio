// The hero: a blocky grass island you can turn, with the bunnies on it and a
// project block orbiting above it.
//
// Two layers. The island drawing is one SVG; the project blocks on top of it
// are real HTML buttons, so they tab, focus and announce like the project grid
// below does — drawing them inside the SVG would have cost all of that. Which
// projects orbit up here is whatever the caller passes in, which comes from
// content.js — never hardcode a project.
//
// The whole thing is a lazy Susan. Drag it and one angle, `turn`, drives
// everything: where each prop sits on the grass, where each block sits in its
// orbit, and which project is at the front. Let go and it snaps to the nearest
// project. Arrow keys turn it one project per press, and focusing a block
// brings it round, so none of this needs a pointer.
import { useCallback, useEffect, useRef, useState } from "react";
import BunnySvg from "./BunnySvg.jsx";
import ProjectIcon from "./ProjectIcon.jsx";

const TAU = Math.PI * 2;
// The front of the turntable: the angle where a thing is nearest the viewer.
const FRONT = Math.PI / 2;

// The island's top face is a diamond centred on (100 114) spanning 72 x 22, so
// anything standing on the grass orbits that same ellipse. `r` is how far out
// from the middle, 0 to 1; `a` is where it starts.
const ISLE = { cx: 100, cy: 114, rx: 72, ry: 22 };

// The scenery. Depth-sorted every frame, so a bunny at the front overlaps the
// sapling behind her instead of the other way round.
const scenery = [
  // She needs a radius of her own: at r 0.08 she sat almost exactly on the axis
  // the island turns about, so she hopped in place while everything else swung
  // round her. The small two are different colours, and only she wears the blaze.
  { kind: "bunny", a: 0.0, r: 0.3, s: 0.5 },
  { kind: "bunny", a: 2.3, r: 0.5, s: 0.3, fur: "var(--bunny-alt-a)", blaze: false },
  { kind: "bunny", a: 4.4, r: 0.56, s: 0.28, fur: "var(--bunny-alt-b)", blaze: false, patch: true },
  { kind: "sapling", a: 3.5, r: 0.74 },
  { kind: "tuft", a: 0.8, r: 0.68 },
  { kind: "tuft", a: 1.55, r: 0.3 },
  { kind: "flower", a: 1.3, r: 0.6, c: "var(--flower-a)" },
  { kind: "flower", a: 2.9, r: 0.3, c: "var(--flower-b)" },
  { kind: "flower", a: 4.0, r: 0.66, c: "var(--flower-b)" },
  { kind: "flower", a: 5.9, r: 0.52, c: "var(--flower-a)" },
];

// The pond. One point on the grass like everything else, so it turns with the
// island; it's drawn as a flat ellipse on the same 72:22 slope as the ground,
// which is what the earlier stream never managed — strung between six turned
// points it just read as a wandering line.
const pond = { a: 5.0, r: 0.4 };

// The two lighter ground tiles turn with the island too, or the grass reads as
// sliding underneath its own scenery.
const tiles = [
  { a: 1.9, r: 0.34, s: 1 },
  { a: 4.8, r: 0.42, s: 0.8 },
];

// How far a drag turns the island: about 520px of travel per full revolution.
const DRAG_TO_RAD = 0.012;

// `static` draws the island and nothing else: no drag, no keyboard. The
// one-page summary uses it as a picture, because that view is meant to be
// read rather than played with.
//
// There used to be a ring of floating project tiles orbiting the island, a
// third way to pick a project alongside the rail and the arrows. Three
// controls for one job, and the one hardest to hit — small, moving, and
// half of them behind the island — so it is the one that went.
export default function IslandHero({ projects, onFront, controls, static: isStatic }) {
  const line = { stroke: "var(--border)", strokeWidth: 1.2 };
  const n = Math.max(projects.length, 1);
  const step = TAU / n;

  // Start with the first project facing front.
  const [turn, setTurn] = useState(FRONT);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const drag = useRef(null);

  // Snap to whichever project is closest to the front, so the turntable never
  // rests between two of them.
  const snap = useCallback(
    (from) => {
      const i = Math.round((FRONT - from) / step);
      setTurn(FRONT - i * step);
    },
    [step]
  );

  const faceProject = useCallback(
    (i) => {
      // Go the short way round from where we are, so bringing block 0 forward
      // from block 3 turns one step rather than three.
      setTurn((t) => {
        const target = FRONT - i * step;
        return t + ((((target - t) % TAU) + TAU * 1.5) % TAU) - Math.PI;
      });
    },
    [step]
  );

  const onPointerDown = (e) => {
    // Let a real click on a block through; only the island itself drags.
    drag.current = { x: e.clientX, from: turn, moved: 0 };
    setDragging(true);
    setTouched(true);
    // Deliberately no setPointerCapture here. Capturing from the first
    // pointerdown retargets everything that follows at the turntable, which
    // costs the blocks their click; a drag doesn't need it to work.
    
  };

  const onPointerMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
    setTurn(drag.current.from + dx * DRAG_TO_RAD);
  };

  const endDrag = () => {
    if (!drag.current) return;
    const { from, moved } = drag.current;
    drag.current = null;
    setDragging(false);
    // A drag that went nowhere is a click; put it back where it was.
    snap(moved < 4 ? from : turn);
  };

  const onKeyDown = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setTouched(true);
    setTurn((t) => {
      const next = t + (e.key === "ArrowRight" ? -step : step);
      const i = Math.round((FRONT - next) / step);
      return FRONT - i * step;
    });
  };

  // Which project is facing us. Everything visual keys off this.
  const front = ((Math.round((FRONT - turn) / step) % n) + n) % n;

  // Tell whoever is wrapping us which project is up, so a panel beside the
  // island can follow it.
  useEffect(() => {
    onFront?.(front);
  }, [front, onFront]);

  // And hand them the controls, so their own prev/next buttons turn this
  // island rather than each of us keeping a separate idea of the angle.
  useEffect(() => {
    if (!controls) return;
    controls.current = {
      prev: () => setTurn((t) => t + step),
      next: () => setTurn((t) => t - step),
      face: faceProject,
    };
  }, [controls, step, faceProject]);

  useEffect(() => {
    const stop = () => endDrag();
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  });

  // Where a thing standing on the grass ends up, plus how near the front it is
  // (-1 behind, 1 in front) for depth sorting and scale.
  const place = ({ a, r }) => {
    const t = a + turn;
    return {
      x: ISLE.cx + r * ISLE.rx * Math.cos(t),
      y: ISLE.cy + r * ISLE.ry * Math.sin(t),
      depth: Math.sin(t),
    };
  };

  const placed = scenery
    .map((item) => ({ ...item, ...place(item) }))
    .sort((p, q) => p.y - q.y);

  return (
    <div className="island-stage">
      <div
        className={`island-turntable${dragging ? " is-dragging" : ""}${isStatic ? " is-static" : ""}`}
        onPointerDown={isStatic ? undefined : onPointerDown}
        onPointerMove={isStatic ? undefined : onPointerMove}
        onKeyDown={isStatic ? undefined : onKeyDown}
        role={isStatic ? undefined : "group"}
        aria-hidden={isStatic || undefined}
        aria-label={
          isStatic
            ? undefined
            : "The island. Drag it, or use the left and right arrow keys, to turn it and bring each project to the front."
        }
      >
        <svg viewBox="26 62 148 114" className="island-svg" aria-hidden="true">
          {/* One diamond, one depth. The top face is the diamond centred on
              (100 114) with a 72x22 half-span; both side faces hang 22 straight
              down from its lower edges, so every piece meets on the same two
              lines. Getting those two numbers out of step is what left a wedge
              of background showing between the grass and the soil. */}
          <g className="island-body">
            <path d="M28 114 L100 136 L100 158 L28 136 z" fill="var(--soil-dark)" {...line} />
            <path d="M172 114 L100 136 L100 158 L172 136 z" fill="var(--soil)" {...line} />
            {/* The ragged underside, so it reads as torn out of the ground. The
                teeth hang off the same V the two faces end on. */}
            <path d="M28 136 L37 152 L46 141.5 L55 158 L64 147 L73 164 L82 153 L91 170 L100 158
                     L109 170 L118 153 L127 164 L136 147 L145 158 L154 141.5 L163 152 L172 136 L100 158 z"
                  fill="var(--soil-dark)" />
            <path d="M100 92 L172 114 L100 136 L28 114 z" fill="var(--grass)" {...line} />
          </g>

          {/* Lighter patches of ground. Same 72:22 slope as the face, or they
              look pasted on rather than lying flat. */}
          {tiles.map((tile, i) => {
            const { x, y } = place(tile);
            return (
              <path
                key={i}
                transform={`translate(${x} ${y}) scale(${tile.s})`}
                d="M0 -7.3 L24 0 L0 7.3 L-24 0 z"
                fill="var(--grass-light)"
              />
            );
          })}

          {/* The pond, lying flat in the grass with a pale rim where the
              water meets the bank and a highlight across the top of it. */}
          {(() => {
            const { x, y } = place(pond);
            return (
              <g className="island-pond" transform={`translate(${x} ${y})`}>
                <ellipse rx="21" ry="6.4" fill="var(--pond-rim)" />
                <ellipse rx="18" ry="5" fill="var(--pond)" />
                <ellipse cx="-4" cy="-1.4" rx="7" ry="1.5" fill="var(--pond-light)" opacity="0.8" />
              </g>
            );
          })()}

          {placed.map((item, i) => {
            // Things further forward are nearer, so a little larger.
            const k = 1 + 0.1 * item.depth;
            const at = `translate(${item.x} ${item.y})`;
            if (item.kind === "bunny") {
              return (
                // The hop is a CSS animation on the outer group — a CSS
                // transform would otherwise overwrite the transform attribute
                // that places her. They hop off the beat from one another so
                // the three don't move in lockstep.
                <g key={i} className="island-bunny" style={{ animationDelay: `${item.a * 0.7}s` }}>
                  <g transform={`${at} scale(${item.s * k})`}>
                    <BunnySvg fur={item.fur} blaze={item.blaze} patch={item.patch} />
                  </g>
                </g>
              );
            }
            if (item.kind === "sapling") {
              return (
                <g key={i} transform={`${at} scale(${k})`}>
                  <rect x="-1.5" y="-12" width="3" height="12" fill="var(--hero-wood)" />
                  <circle cx="0" cy="-14" r="7" fill="var(--grass-light)" {...line} />
                </g>
              );
            }
            if (item.kind === "tuft") {
              return (
                <path
                  key={i}
                  transform={`${at} scale(${k})`}
                  d="M0 0 l0 -8 M-3 0 l-2 -6 M3 0 l2 -6"
                  stroke="var(--grass-light)" strokeWidth="2" fill="none" strokeLinecap="round"
                />
              );
            }
            // A flower: a stem and four petals round a centre. No outline — at
            // this size a 1.2 stroke would swallow the petal it edges.
            return (
              <g key={i} transform={`${at} scale(${k})`}>
                <path d="M0 0 v-5" stroke="var(--grass-light)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <circle cx="0" cy="-7" r="1.7" fill={item.c} />
                <circle cx="-2.4" cy="-5.6" r="1.7" fill={item.c} />
                <circle cx="2.4" cy="-5.6" r="1.7" fill={item.c} />
                <circle cx="0" cy="-4.2" r="1.7" fill={item.c} />
                <circle cx="0" cy="-5.6" r="1.1" fill="var(--grass-light)" />
              </g>
            );
          })}
        </svg>

      </div>

      {/* The hint retires once they've worked out that it turns. */}
      {!isStatic && (
        <p className={`island-hint${touched ? " is-done" : ""}`} aria-hidden="true">
          ‹ drag to turn ›
        </p>
      )}
    </div>
  );
}
