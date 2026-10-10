// A project, role or school opens as a room in a 2D cutaway house. The first
// room zooms out of the door you clicked; linked items are doors on the right
// that slide you into the next room, and the door on the left walks you back.
// Links that leave the site (GitHub, the live site, a full video) are green doors.
import { useEffect, useRef } from "react";
import { education, projects, bunnyLines, tour } from "../content.js";
import { Demos, Chips, roleName, roleSub } from "./cards.jsx";
import Bunny2D from "./Bunny2D.jsx";

const T = tour.room;

export const roomTitle = (r) => (r.type === "project" ? r.p.name : r.type === "role" ? roleName(r.e) : education.org);

function Door({ kind, label, sub, mark, href, onClick }) {
  const inner = (
    <>
      <span className="door-sign"><b>{label}</b>{sub && <small>{sub}</small>}</span>
      <span className="door-frame" aria-hidden="true"><i className="door-leaf">{mark}</i></span>
    </>
  );
  return href
    ? <a className={`door ${kind}`} href={href} target="_blank" rel="noopener">{inner}</a>
    : <button type="button" className={`door ${kind}`} onClick={onClick}>{inner}</button>;
}

// A wooden signpost beside the house pointing to the neighbouring project.
function Signpost({ side, project, onGo }) {
  if (!project) return <span className="room-sign gap" aria-hidden="true" />;
  const label = side === "prev" ? T.prev(project.name) : T.next(project.name);
  return (
    <button type="button" className={`room-sign ${side}`} aria-label={label} title={label} onClick={(e) => { e.stopPropagation(); onGo(); }}>
      <span className="room-sign-arrow" aria-hidden="true">{side === "prev" ? "‹" : "›"}</span>
      <span className="room-sign-name" aria-hidden="true">{project.name}</span>
    </button>
  );
}

export default function Room({ rooms, dir, origin, closing, onWalk, onStep, onLeave }) {
  const scrollRef = useRef(null);
  const n = rooms.length;
  const room = rooms[n - 1];
  const title = roomTitle(room);

  const at = room.type === "project" ? projects.indexOf(room.p) : -1;
  const prev = at > 0 ? projects[at - 1] : null;
  const next = at >= 0 && at < projects.length - 1 ? projects[at + 1] : null;
  const go = (p, d) => onStep({ type: "project", p }, d);

  useEffect(() => { scrollRef.current?.focus({ preventScroll: true }); }, [n, title]);
  useEffect(() => {
    const key = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); onLeave(n - 1); }
      else if (e.key === "ArrowRight" && next) { e.stopPropagation(); go(next, "fwd"); }
      else if (e.key === "ArrowLeft" && prev) { e.stopPropagation(); go(prev, "back"); }
    };
    window.addEventListener("keydown", key, true);
    return () => window.removeEventListener("keydown", key, true);
  }, [n, onLeave, prev, next]);

  let meta = "", body, pose = "sit", line = "";
  const doors = [];
  if (room.type === "project") {
    const p = room.p;
    meta = p.engagement ? [p.engagement.role, p.engagement.client, p.engagement.period].filter(Boolean).join(" · ") : p.badge || "";
    body = (
      <>
        <Demos p={p} />
        <div className="room-board"><p>{p.description}</p></div>
        <div>
          <h3>{tour.tech}</h3>
          <div className="tour-shelf"><Chips items={p.tech} /></div>
        </div>
      </>
    );
    pose = "stand";
    line = bunnyLines[p.slug] || "";
    if (p.repo) doors.push({ kind: "ext", label: T.code, sub: T.leaves, mark: "↗", href: p.repo });
    if (p.demo) doors.push({ kind: "ext", label: T.site, sub: T.leaves, mark: "↗", href: p.demo });
    if (p.video) doors.push({ kind: "ext", label: T.video, sub: T.leaves, mark: "▶", href: p.video });
  } else if (room.type === "role") {
    const e = room.e;
    meta = [roleSub(e), e.orgNote, e.dates].filter(Boolean).join(" · ");
    body = (
      <div className="room-board">
        <h3>{tour.pointsTitle}</h3>
        <ul className="tour-points">{(e.points || []).map((x) => <li key={x}>{x}</li>)}</ul>
      </div>
    );
    (e.projectSlugs || []).forEach((s) => {
      const p = projects.find((x) => x.slug === s);
      if (p) doors.push({ kind: "room", label: p.name, sub: T.walkIn, mark: "", onClick: () => onWalk({ type: "project", p }) });
    });
  } else {
    meta = [education.degree, education.dates].join(" · ");
    body = <div className="room-board"><ul className="tour-points">{education.details.map((x) => <li key={x}>{x}</li>)}</ul></div>;
    pose = "loaf";
  }

  const trail = [T.trailHome, ...rooms.map(roomTitle)];
  const backLabel = n > 1 ? T.backTo(roomTitle(rooms[n - 2])) : T.outside;
  const style = origin ? { "--ox": `${origin.x}px`, "--oy": `${origin.y}px` } : undefined;

  return (
    <div className={`room-wrap${closing ? " is-closing" : ""}`} style={style} onClick={() => onLeave(0)}>
      {at >= 0 && <Signpost side="prev" project={prev} onGo={() => go(prev, "back")} />}
      <div
        key={`${n}:${title}`} className={`room kind-${room.type} ${dir === "fwd" ? "from-right" : dir === "back" ? "from-left" : ""}`}
        role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
      >
        <div className="room-top">
          <nav className="room-trail" aria-label={T.trail}>
            {trail.map((name, i) => (
              <span key={i} className="room-crumb">
                {i > 0 && <span aria-hidden="true"> › </span>}
                {i < trail.length - 1
                  ? <button type="button" onClick={() => onLeave(i)}>{name}</button>
                  : <span aria-current="page">{name}</span>}
              </span>
            ))}
          </nav>
          <button type="button" className="room-x" onClick={() => onLeave(0)} aria-label={T.leave}>×</button>
        </div>

        <div className="room-scroll" ref={scrollRef} tabIndex={0}>
          <div className="room-head">
            <div className="room-plaque">
              <h2>{title}</h2>
              {meta && <p className="tour-meta">{meta}</p>}
            </div>
            <span className="room-window" aria-hidden="true" />
          </div>
          {body}
        </div>

        <div className="room-stage">
          <div className="room-doors left">
            <Door kind="back" label={backLabel} mark="←" onClick={() => onLeave(n - 1)} />
          </div>
          <i className={`room-prop prop-${room.type}`} aria-hidden="true"><b /></i>
          <figure className="room-bunny">
            <Bunny2D pose={pose} />
            {line && <figcaption className="room-say">{line}</figcaption>}
          </figure>
          <div className="room-doors right">
            {doors.map((d) => <Door key={d.label} {...d} />)}
          </div>
        </div>
        <div className="room-floor" aria-hidden="true" />
      </div>
      {at >= 0 && <Signpost side="next" project={next} onGo={() => go(next, "fwd")} />}
    </div>
  );
}
