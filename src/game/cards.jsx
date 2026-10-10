// What each tour scene lays over the sky: overlaid text, a village of houses with
// the skills as clouds, a long scroll of roles. Anything longer than a line opens
// as a room (room.jsx). All copy comes from content.js.
import { Fragment, useEffect, useRef, useState } from "react";
import { profile, projects, education, experience, leadership, tour } from "../content.js";
import { byRecency } from "../dates.js";
import ProjectVisual from "../components/ProjectVisual.jsx";
import ProjectIcon from "../components/ProjectIcon.jsx";
import ContactLinks, { contactLinks } from "../components/ContactLinks.jsx";

const roles = experience.slice().sort(byRecency);
const mainRoles = roles.filter((e) => !e.aside);
const asideRoles = roles.filter((e) => e.aside);
const leadRoles = leadership.slice().sort(byRecency);

export const roleName = (e) => (e.leadWithTitle ? e.title : e.org);
export const roleSub = (e) => (e.leadWithTitle ? e.org : e.title);

// Where on screen a click landed (viewport px), so a room can open out of that spot.
export function originOf(el) {
  const r = el?.getBoundingClientRect();
  return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
}

// A row of the path cards: what and where on the face, the bullets in the dialog.
function Row({ e, onOpen }) {
  return (
    <li className="reveal">
      <button className="tour-row" onClick={(ev) => onOpen({ type: "role", e }, originOf(ev.currentTarget))}>
        <span className="tour-row-dates">{e.dates}</span>
        <span className="tour-row-name">{roleName(e)}</span>
        <span className="tour-row-sub">{roleSub(e)}</span>
      </button>
    </li>
  );
}

// A project's demo videos: one view at a time, with a tab for each when there are several.
export function Demos({ p }) {
  const clips = p.clips?.length ? p.clips : p.clip ? [{ src: p.clip, poster: p.image }] : [];
  const [n, setN] = useState(0);
  const c = clips[n];
  return (
    <figure className="tour-frame">
      <ProjectVisual key={n} name={p.name} icon={p.icon} image={c?.poster || p.image} clip={c?.src || ""} variant="clip" />
      {clips.length > 1 && (
        <div className="tour-tabs" role="tablist" aria-label={tour.demos}>
          {clips.map((x, i) => (
            <button key={x.label} role="tab" aria-selected={i === n} className={i === n ? "on" : ""} onClick={() => setN(i)}>{x.label}</button>
          ))}
        </div>
      )}
    </figure>
  );
}

export function Chips({ items }) {
  return <ul className="tour-chips">{items.map((t) => <li key={t}>{t}</li>)}</ul>;
}

// ---- Hello: the name sits on the sky, the links are scattered around it ----
function Hello() {
  const links = contactLinks();
  return (
    <>
      <section className="tour-hello" aria-label={profile.name}>
        <h2>{profile.name}</h2>
        <p className="tour-tag">{profile.tagline}</p>
        <p className="tour-sum">{profile.summary}</p>
      </section>
      <nav className="tour-scatter" aria-label={tour.titles.contact}>
        {links.map((l, i) => (
          <a key={l.label} className={`btn tour-float f${i}${l.primary ? " primary" : ""}`} href={l.href} target="_blank" rel="noopener">{l.label}</a>
        ))}
      </nav>
    </>
  );
}

// ---- Village: six small houses on the hills, the whole skill set in the sky ----
// x is a percentage across; tier 0 is the far hill, 2 the foreground.
// Spaced so no house overlaps another, on wide and (xm) narrow screens.
const PLACES = [
  { i: 1, x: 11, xm: 9, tier: 1 }, { i: 0, x: 29, xm: 27, tier: 2 }, { i: 2, x: 44, xm: 43, tier: 0 },
  { i: 3, x: 56, xm: 56, tier: 0 }, { i: 5, x: 71, xm: 71, tier: 2 }, { i: 4, x: 89, xm: 90, tier: 1 },
];
// Each group gets its own rows (4 clouds a row, 3 on narrow screens), its own tint,
// and a small label in the sky, so it's clear which group a skill belongs to before
// any house is hovered.
const layoutSkills = (per) => {
  let row = 0;
  return profile.skills.flatMap((g, gi) => {
    const out = g.items.map((t, k) => ({ t, gi, r: row + Math.floor(k / per), c: k % per, n: Math.min(per, g.items.length - Math.floor(k / per) * per), first: k === 0, group: g.group }));
    row += Math.ceil(g.items.length / per);
    return out;
  });
};
const skillsWide = layoutSkills(4), skillsNarrow = layoutSkills(3);
const skillList = skillsWide.map((s) => s.t);
const jit = (i) => ((i * 37) % 11) - 5;
const norm = (t) => t.toLowerCase();

function Village({ sel, onSelect, onOpen }) {
  const pointer = useRef("mouse");
  const p = sel === null ? null : projects[sel];
  const used = p ? new Set(p.tech.map(norm)) : null;
  // the chosen project's clouds gather on an ellipse round the explanation
  const chosen = used ? skillList.filter((t) => used.has(norm(t))) : [];
  const ring = (t, rx, ry, cy) => {
    const a = (-90 + (360 * chosen.indexOf(t)) / chosen.length) * (Math.PI / 180);
    return [`${50 + rx * Math.cos(a)}%`, `${cy + ry * Math.sin(a)}%`];
  };
  return (
    <>
      <ul className={`tour-clouds${used ? " has-sel" : ""}`} aria-label={tour.village.cloudsLabel}>
        {skillsWide.map(({ t, gi, r, c, n, first, group }, i) => {
          const state = used ? (used.has(norm(t)) ? " on" : " off") : "";
          const [ox, oy] = state === " on" ? ring(t, 37, 19, 37) : [];
          const [oxm, oym] = state === " on" ? ring(t, 36, 17, 33) : [];
          const { r: rm, c: cm, n: nm } = skillsNarrow[i];
          // spread each row across the sky (not packed from the left), staggered up and down
          const y = 18 + r * 8.5 + (i % 2 ? 1.2 : -1.2), ym = 8 + rm * 5.6 + (gi + 1) * 3.4;
          const x = Math.min(93, 24 + ((c + 0.5) / n) * 72 + ((r % 2) - 0.5) * 16 + jit(i) * 0.5);
          const xm = Math.min(90, 14 + ((cm + 0.5) / nm) * 80 + ((rm % 2) - 0.5) * 12 + jit(i) * 0.4);
          return (
            <Fragment key={t}>
              {first && <li className="tour-glabel" aria-hidden="true" style={{ "--y": `${y}%`, "--ym": `${ym - 3.6}%` }}>{group}</li>}
              <li
                className={`tour-cloud g${gi}${state}`} title={group}
                style={{
                  "--x": `${x}%`, "--y": `${y}%`,
                  "--xm": `${xm}%`, "--ym": `${ym}%`,
                  "--ox": ox, "--oy": oy, "--oxm": oxm, "--oym": oym,
                }}
              >{t}</li>
            </Fragment>
          );
        })}
      </ul>
      <div className={`tour-info${p ? " has" : ""}`} aria-live="polite">
        {p ? (
          <>
            <h2>{p.name}{p.badge && <span className="tour-badge">{p.badge}</span>}</h2>
            <p>{p.blurb}</p>
            <span className="tour-open">{tour.clickHouse}</span>
          </>
        ) : <p>{tour.village.hint}</p>}
      </div>
      <div className="tour-village">
        {PLACES.map(({ i, x, xm, tier }) => {
          const q = projects[i];
          return (
            <button
              key={i} className={`tour-house t${tier}${sel === i ? " is-sel" : ""}`} style={{ "--x": `${x}%`, "--xm": `${xm}%` }}
              aria-label={tour.openLabel(q.name)}
              onPointerDown={(e) => { pointer.current = e.pointerType; }}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") onSelect(i); }}
              onPointerLeave={(e) => { if (e.pointerType === "mouse") onSelect(null); }}
              onFocus={() => onSelect(i)}
              onBlur={() => onSelect(null)}
              onClick={(e) => { if (pointer.current !== "mouse" && sel !== i) onSelect(i); else onOpen({ type: "project", p: q, i }, originOf(e.currentTarget.querySelector(".tour-door"))); pointer.current = "mouse"; }}
            >
              <span className="tour-roof" aria-hidden="true"><i className="tour-chimney" /></span>
              <span className="tour-wall" aria-hidden="true">
                <span className="tour-window">
                  {q.image ? <img src={q.image} alt="" loading="lazy" /> : <span className="tour-pane"><ProjectIcon name={q.icon} /></span>}
                </span>
                <i className="tour-door" />
              </span>
              <span className="tour-name">{q.name}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ---- Path: one long scroll; each role fades in over the sky as it arrives ----
function Path({ onOpen, onProgress }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    el.scrollTop = 0;
    const items = el.querySelectorAll(".reveal");
    let io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")), { root: el, rootMargin: "0px 0px -14% 0px", threshold: 0.1 });
      items.forEach((n) => io.observe(n));
    } else items.forEach((n) => n.classList.add("in"));
    const onScroll = () => {
      onProgress?.(el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight));
      el.classList.toggle("scrolled", el.scrollTop > 20);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { io?.disconnect(); el.removeEventListener("scroll", onScroll); };
  }, [onProgress]);
  const t = tour.titles;
  return (
    <div className="tour-scroll" ref={ref} tabIndex={0} role="region" aria-label={t.experience}>
      <h2 className="reveal">{t.experience}</h2>
      <ul className="tour-rows">{mainRoles.map((e) => <Row key={e.org + e.title} e={e} onOpen={onOpen} />)}</ul>
      <div className="tour-duo">
      <div>
      <h2 className="reveal">{t.education}</h2>
      <ul className="tour-rows">
        <li className="reveal">
          <button className="tour-row" onClick={(ev) => onOpen({ type: "school" }, originOf(ev.currentTarget))}>
            <span className="tour-row-dates">{education.dates}</span>
            <span className="tour-row-name">{education.org}</span>
            <span className="tour-row-sub">{education.degree}</span>
          </button>
        </li>
        {asideRoles.map((e) => <Row key={e.org + e.title} e={e} onOpen={onOpen} />)}
      </ul>
      </div>
      <div>
      <h2 className="reveal">{t.leadership}</h2>
      <ul className="tour-rows">{leadRoles.map((e) => <Row key={e.org + e.title} e={e} onOpen={onOpen} />)}</ul>
      </div>
      </div>
      <p className="tour-scroll-hint" aria-hidden="true">{tour.scroll} ↓</p>
    </div>
  );
}

function End({ onExit }) {
  return (
    <section className="tour-hello tour-end" aria-label={tour.titles.finish}>
      <h2>{tour.titles.finish}</h2>
      <p className="tour-sum">{profile.lookingFor}</p>
      <ContactLinks className="tour-end-links" />
      <button className="btn primary" onClick={onExit}>{tour.summary}</button>
    </section>
  );
}

export function Scene({ k, sel, onSelect, onOpen, onExit, onProgress }) {
  if (k === "hello") return <Hello />;
  if (k === "village") return <Village sel={sel} onSelect={onSelect} onOpen={onOpen} />;
  if (k === "path") return <Path onOpen={onOpen} onProgress={onProgress} />;
  return <End onExit={onExit} />;
}
