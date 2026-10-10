// What each tour scene lays over the sky: overlaid text, a village of houses with
// the skills as clouds, a long scroll of roles. Anything longer than a line opens
// in the Detail dialog. All copy comes from content.js.
import { useEffect, useRef } from "react";
import { profile, projects, education, experience, leadership, tour } from "../content.js";
import { byRecency } from "../dates.js";
import ProjectVisual from "../components/ProjectVisual.jsx";
import ProjectIcon from "../components/ProjectIcon.jsx";

const roles = experience.slice().sort(byRecency);
const mainRoles = roles.filter((e) => !e.aside);
const asideRoles = roles.filter((e) => e.aside);
const leadRoles = leadership.slice().sort(byRecency);

const roleName = (e) => (e.leadWithTitle ? e.title : e.org);
const roleSub = (e) => (e.leadWithTitle ? e.org : e.title);

// A row of the path cards: what and where on the face, the bullets in the dialog.
function Row({ e, onOpen }) {
  return (
    <li className="reveal">
      <button className="tour-row" onClick={() => onOpen({ type: "role", e })}>
        <span className="tour-row-dates">{e.dates}</span>
        <span className="tour-row-name">{roleName(e)}</span>
        <span className="tour-row-sub">{roleSub(e)}</span>
      </button>
    </li>
  );
}

function Chips({ items }) {
  return <ul className="tour-chips">{items.map((t) => <li key={t}>{t}</li>)}</ul>;
}

// ---- Hello: the name sits on the sky, the links are scattered around it ----
function Hello() {
  const links = [
    profile.resume && { label: "Resume", href: profile.resume, primary: true },
    profile.email && { label: "Email", href: `mailto:${profile.email}` },
    ...profile.links,
  ].filter(Boolean);
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
const PLACES = [
  { i: 0, x: 30, tier: 2 }, { i: 1, x: 15, tier: 1 }, { i: 2, x: 34, tier: 0 },
  { i: 3, x: 66, tier: 0 }, { i: 4, x: 85, tier: 1 }, { i: 5, x: 70, tier: 2 },
];
const skillList = profile.skills.flatMap((g) => g.items);
const jit = (i) => ((i * 37) % 11) - 5;
const norm = (t) => t.toLowerCase();

function Village({ sel, onSelect, onOpen }) {
  const pointer = useRef("mouse");
  const p = sel === null ? null : projects[sel];
  const used = p ? new Set(p.tech.map(norm)) : null;
  return (
    <>
      <ul className="tour-clouds" aria-label={tour.village.cloudsLabel}>
        {skillList.map((t, i) => {
          const r = Math.floor(i / 4), c = i % 4, rm = Math.floor(i / 3), cm = i % 3;
          const state = used ? (used.has(norm(t)) ? " on" : " off") : "";
          return (
            <li
              key={t} className={`tour-cloud${state}`}
              style={{
                "--x": `${14 + c * 24 + (r % 2) * 9 + jit(i)}%`, "--y": `${27 + r * 8.5}%`,
                "--xm": `${20 + cm * 30 + (rm % 2) * 7 + jit(i) * 0.6}%`, "--ym": `${17 + rm * 6.6}%`,
                "--d": `${(i % 5) * 0.8}s`,
              }}
            >{t}</li>
          );
        })}
      </ul>
      <div className="tour-info" aria-live="polite">
        {p ? (
          <>
            <h2>{p.name}{p.badge && <span className="tour-badge">{p.badge}</span>}</h2>
            <p>{p.blurb}</p>
            <button className="tour-open" onClick={() => onOpen({ type: "project", p, i: sel })} aria-label={tour.openLabel(p.name)}>{tour.open}</button>
          </>
        ) : <p>{tour.village.hint}</p>}
      </div>
      <div className="tour-village">
        {PLACES.map(({ i, x, tier }) => {
          const q = projects[i];
          return (
            <button
              key={i} className={`tour-house t${tier}${sel === i ? " is-sel" : ""}`} style={{ "--x": `${x}%` }}
              aria-label={tour.openLabel(q.name)}
              onPointerDown={(e) => { pointer.current = e.pointerType; }}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") onSelect(i); }}
              onFocus={() => onSelect(i)}
              onClick={() => { if (pointer.current !== "mouse" && sel !== i) onSelect(i); else onOpen({ type: "project", p: q, i }); pointer.current = "mouse"; }}
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
      <h2 className="reveal">{t.education}</h2>
      <ul className="tour-rows">
        <li className="reveal">
          <button className="tour-row" onClick={() => onOpen({ type: "school" })}>
            <span className="tour-row-dates">{education.dates}</span>
            <span className="tour-row-name">{education.org}</span>
            <span className="tour-row-sub">{education.degree}</span>
          </button>
        </li>
        {asideRoles.map((e) => <Row key={e.org + e.title} e={e} onOpen={onOpen} />)}
      </ul>
      <h2 className="reveal">{t.leadership}</h2>
      <ul className="tour-rows">{leadRoles.map((e) => <Row key={e.org + e.title} e={e} onOpen={onOpen} />)}</ul>
      <p className="tour-scroll-hint" aria-hidden="true">{tour.scroll} ↓</p>
    </div>
  );
}

function End({ onExit }) {
  return (
    <section className="tour-hello tour-end" aria-label={tour.titles.finish}>
      <h2>{tour.titles.finish}</h2>
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

// The only scrolling surface. Esc, the backdrop and the button all close it.
export function Detail({ item, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    const key = (e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    window.addEventListener("keydown", key, true);
    return () => window.removeEventListener("keydown", key, true);
  }, [onClose]);

  let head = null, body = null;
  if (item.type === "project") {
    const p = item.p;
    head = (
      <>
        <h2>{p.name}</h2>
        {p.engagement
          ? <p className="tour-meta">{[p.engagement.role, p.engagement.client, p.engagement.period].filter(Boolean).join(" · ")}</p>
          : p.badge && <p className="tour-meta">{p.badge}</p>}
      </>
    );
    body = (
      <>
        <ProjectVisual name={p.name} icon={p.icon} image={p.image} clip={p.clip} variant="clip" />
        <p>{p.description}</p>
        <h3>{tour.tech}</h3>
        <Chips items={p.tech} />
        <div className="tour-links">
          {p.demo && <a className="btn primary" href={p.demo} target="_blank" rel="noopener">Visit site ↗</a>}
          {p.repo && <a className="btn" href={p.repo} target="_blank" rel="noopener">Code</a>}
        </div>
      </>
    );
  } else if (item.type === "role") {
    const e = item.e;
    head = (
      <>
        <h2>{roleName(e)}</h2>
        <p className="tour-meta">{[roleSub(e), e.orgNote, e.dates].filter(Boolean).join(" · ")}</p>
      </>
    );
    body = (
      <>
        <h3>{tour.pointsTitle}</h3>
        <ul className="tour-points">{(e.points || []).map((x) => <li key={x}>{x}</li>)}</ul>
        {e.projectSlugs && (
          <div className="tour-links">
            {e.projectSlugs.map((s) => {
              const p = projects.find((x) => x.slug === s);
              return p ? <button key={s} className="btn" onClick={() => item.go?.(p)}>{p.name}</button> : null;
            })}
          </div>
        )}
      </>
    );
  } else {
    head = (
      <>
        <h2>{education.org}</h2>
        <p className="tour-meta">{[education.degree, education.dates].join(" · ")}</p>
      </>
    );
    body = <ul className="tour-points">{education.details.map((x) => <li key={x}>{x}</li>)}</ul>;
  }

  return (
    <div className="tour-dialog" onClick={onClose}>
      <div className="tour-dialog-box" role="dialog" aria-modal="true" aria-label={tour.open} onClick={(e) => e.stopPropagation()}>
        <button ref={ref} className="tour-close" onClick={onClose} aria-label={tour.close}>×</button>
        <header>{head}</header>
        <div className="tour-dialog-body">{body}</div>
      </div>
    </div>
  );
}
