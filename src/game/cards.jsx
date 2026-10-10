// The things the bunnies tow. Each scene is up to three small cards; every card
// is one idea and fits without scrolling. Anything longer opens in the Detail
// dialog. All copy comes from content.js.
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
    <li>
      <button className="tour-row" onClick={() => onOpen({ type: "role", e })}>
        <span className="tour-row-dates">{e.dates}</span>
        <span className="tour-row-name">{roleName(e)}</span>
        <span className="tour-row-sub">{roleSub(e)}</span>
      </button>
    </li>
  );
}

function House({ i, selected, onSelect, onHover, onOpen }) {
  const p = projects[i];
  return (
    <div
      className={`tour-house${selected ? " is-sel" : ""}`}
      onClick={() => onOpen({ type: "project", p, i })}
      onMouseEnter={() => onHover(i)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onSelect(i)}
    >
      <div className="tour-roof" aria-hidden="true"><i className="tour-chimney" /></div>
      <div className="tour-wall">
        <div className="tour-window" aria-hidden="true">
          {p.image ? <img src={p.image} alt="" loading="lazy" /> : <span className="tour-pane"><ProjectIcon name={p.icon} /></span>}
        </div>
        <i className="tour-door" aria-hidden="true" />
      </div>
      <div className="tour-sign">
        <h3>{p.name}</h3>
        {p.badge && <span className="tour-badge">{p.badge}</span>}
        <p>{p.blurb}</p>
        <button className="tour-open" aria-label={tour.openLabel(p.name)}>{tour.open}</button>
      </div>
    </div>
  );
}

function Chips({ items }) {
  return <ul className="tour-chips">{items.map((t) => <li key={t}>{t}</li>)}</ul>;
}

export function Card({ card, index, selected, onSelect, onHover, onOpen, found, total, onExit }) {
  const t = tour.titles;
  switch (card.kind) {
    case "hello":
      return (
        <section className="tour-card tour-hello" aria-label={profile.name}>
          <h2>{profile.name}</h2>
          <p className="tour-tag">{profile.tagline}</p>
          <p className="tour-sum">{profile.summary}</p>
        </section>
      );
    case "skills":
      return (
        <section className="tour-card" aria-label={t.skills}>
          <h2>{t.skills}</h2>
          {profile.skills.map((g) => (
            <div key={g.group} className="tour-group">
              <h3>{g.group}</h3>
              <Chips items={g.items} />
            </div>
          ))}
        </section>
      );
    case "contact":
      return (
        <section className="tour-card tour-contact" aria-label={t.contact}>
          <h2>{t.contact}</h2>
          {profile.resume && <a className="btn primary" href={profile.resume} target="_blank" rel="noopener">Resume</a>}
          {profile.email && <a className="btn" href={`mailto:${profile.email}`}>Email</a>}
          {profile.links.map((l) => <a key={l.label} className="btn" href={l.href} target="_blank" rel="noopener">{l.label}</a>)}
        </section>
      );
    case "house":
      return (
        <section className="tour-card is-house" aria-label={projects[card.i].name}>
          <House i={card.i} selected={selected === card.i} onSelect={onSelect} onHover={onHover} onOpen={onOpen} />
        </section>
      );
    case "experience":
      return (
        <section className="tour-card" aria-label={t.experience}>
          <h2>{t.experience}</h2>
          <ul className="tour-rows">{mainRoles.map((e) => <Row key={e.org + e.title} e={e} onOpen={onOpen} />)}</ul>
        </section>
      );
    case "education":
      return (
        <section className="tour-card" aria-label={t.education}>
          <h2>{t.education}</h2>
          <button className="tour-row" onClick={() => onOpen({ type: "school" })}>
            <span className="tour-row-dates">{education.dates}</span>
            <span className="tour-row-name">{education.org}</span>
            <span className="tour-row-sub">{education.degree}</span>
          </button>
          <ul className="tour-rows">{asideRoles.map((e) => <Row key={e.org + e.title} e={e} onOpen={onOpen} />)}</ul>
        </section>
      );
    case "leadership":
      return (
        <section className="tour-card" aria-label={t.leadership}>
          <h2>{t.leadership}</h2>
          <ul className="tour-rows">{leadRoles.map((e) => <Row key={e.org + e.title} e={e} onOpen={onOpen} />)}</ul>
        </section>
      );
    case "finish":
      return (
        <section className="tour-card tour-hello" aria-label={t.finish}>
          <h2>{t.finish}</h2>
          <p>{tour.done(found, total)}</p>
          <button className="btn primary" onClick={onExit}>{tour.summary}</button>
        </section>
      );
    default:
      return null;
  }
}

// The sky over the houses: one cloud per technology the chosen project used.
export function Clouds({ project }) {
  if (!project) return null;
  return (
    <ul className="tour-clouds" key={project.slug} aria-label={tour.tech}>
      {project.tech.map((t, i) => (
        <li key={t} className="tour-cloud" style={{ "--d": `${(i % 3) * 0.7}s`, "--y": `${(i % 2) * 14}px` }}>{t}</li>
      ))}
    </ul>
  );
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
