// A project, role or school opens as a room in a 2D cutaway house. The first
// room zooms out of the door you clicked; linked items are doors on the right
// that slide you into the next room, and the door on the left walks you back.
// Links that leave the site (GitHub, the live site, a full video) are green doors.
import { useEffect, useRef } from "react";
import { education, profile, projects, bunnyLines, tour } from "../content.js";
import { Demos, Chips, roleName, roleSub, VILLAGE_ORDER, PATH_ORDER } from "./cards.jsx";
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

  const at = room.type === "project" ? VILLAGE_ORDER.indexOf(room.p) : -1;
  const prev = at > 0 ? VILLAGE_ORDER[at - 1] : null;
  const next = at >= 0 && at < VILLAGE_ORDER.length - 1 ? VILLAGE_ORDER[at + 1] : null;
  const go = (p, d) => onStep({ type: "project", p }, d);

  useEffect(() => { scrollRef.current?.focus({ preventScroll: true }); }, [n, title]);
  useEffect(() => {
    const key = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); onLeave(n - 1); }
      else if (e.key === "ArrowRight" && right) { e.stopPropagation(); right.go(); }
      else if (e.key === "ArrowLeft" && left) { e.stopPropagation(); left.go(); }
    };
    window.addEventListener("keydown", key, true);
    return () => window.removeEventListener("keydown", key, true);
  }, [rooms, onLeave]);

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

  const p = room.type === "project" ? room.p : null;
  const have = p ? new Set(p.tech.map((t) => t.toLowerCase())) : null;
  const groups = p ? profile.skills.map((g) => ({ group: g.group, items: g.items.filter((t) => have.has(t.toLowerCase())) })).filter((g) => g.items.length) : [];
  const cleanBody = p ? (
    <>
      <Demos p={p} />
      <p>{p.description}</p>
      <dl className="tour-tech">
        {groups.map((g) => <div key={g.group}><dt>{g.group}</dt><dd>{g.items.join(" · ")}</dd></div>)}
      </dl>
    </>
  ) : room.type === "role" ? (
    <ul className="tour-points">{(room.e.points || []).map((x) => <li key={x}>{x}</li>)}</ul>
  ) : (
    <ul className="tour-points">{education.details.map((x) => <li key={x}>{x}</li>)}</ul>
  );
  const pAt = p ? -1 : PATH_ORDER.findIndex((x) => x.type === room.type && x.e === room.e);
  const pStep = (d) => onStep(PATH_ORDER[pAt + d], d > 0 ? "fwd" : "back");
  const left = n > 1 ? { label: roomTitle(rooms[n - 2]), go: () => onLeave(n - 1) } : prev ? { label: prev.name, go: () => go(prev, "back") } : pAt > 0 ? { label: roomTitle(PATH_ORDER[pAt - 1]), go: () => pStep(-1) } : null;
  const right = n > 1 ? null : next ? { label: next.name, go: () => go(next, "fwd") } : pAt >= 0 && pAt < PATH_ORDER.length - 1 ? { label: roomTitle(PATH_ORDER[pAt + 1]), go: () => pStep(1) } : null;
  return (
    <div className={`room-wrap${closing ? " is-closing" : ""}`} style={origin ? { "--ox": `${origin.x}px`, "--oy": `${origin.y}px` } : undefined} onClick={() => onLeave(0)}>
      <div key={`${n}:${title}`} className="room-clean" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="room-x" onClick={() => onLeave(0)} aria-label={T.leave}>×</button>
        <div className="room-clean-body" ref={scrollRef} tabIndex={0}>
          <div className="room-clean-head">
            {p && doors.length > 0 && (
              <div className="room-clean-links">
                {doors.map((d) => d.href
                  ? <a key={d.label} href={d.href} target="_blank" rel="noopener">{d.label} {d.mark}</a>
                  : <button key={d.label} type="button" onClick={d.onClick}>{d.label} ›</button>)}
              </div>
            )}
            <div>
              <h2>{title}</h2>
              {meta && <p className="tour-meta">{meta}</p>}
            </div>
          </div>
          {cleanBody}
        </div>
        {!p && doors.length > 0 && (
          <div className="room-clean-foot">
            {doors.map((d) => <button key={d.label} type="button" onClick={d.onClick}>{d.label} ›</button>)}
          </div>
        )}
        {(left || right) && <nav className="room-clean-nav" aria-label={T.trail}>
          {left ? <button type="button" onClick={left.go}>‹ {left.label}</button> : <span />}
          {right ? <button type="button" onClick={right.go}>{right.label} ›</button> : <span />}
        </nav>}
      </div>
    </div>
  );
}
