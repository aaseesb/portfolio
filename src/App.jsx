import { useEffect, useState, useCallback } from "react";
import { profile, education, experience, leadership, projects, hero } from "./content.js";
import ProjectVisual from "./components/ProjectVisual.jsx";
import ToyBunny from "./components/ToyBunny.jsx";
import HeroParallax from "./components/HeroParallax.jsx";
import HeroSvg from "./components/HeroSvg.jsx";

const slugFromUrl = () => new URLSearchParams(window.location.search).get("p");
const findProject = (slug) => projects.find((p) => p.slug === slug) || null;

export default function App() {
  const [theme, setTheme] = useState(
    () =>
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );

  // The one piece of state the whole page runs on.
  // Which experience row is unfolded. Independent of the project selection:
  // the left column is a list you read, the right column is a thing you open.
  const [openExp, setOpenExp] = useState(null);

  // Which demo clip is showing, for projects that have more than one.
  const [clipIndex, setClipIndex] = useState(0);

  const [selectedSlug, setSelectedSlug] = useState(() =>
    findProject(slugFromUrl()) ? slugFromUrl() : null
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
    document.title = `${profile.name} — ${profile.tagline}`;
  }, [theme]);

  // Keep the URL in step so a project is linkable and Back works.
  const select = useCallback((slug) => {
    setSelectedSlug(slug);
    setClipIndex(0);
    const url = slug ? `?p=${slug}` : window.location.pathname;
    window.history.pushState({ p: slug }, "", url);
  }, []);

  useEffect(() => {
    const onPop = () => {
      const slug = slugFromUrl();
      setSelectedSlug(findProject(slug) ? slug : null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Escape closes the panel, same as the close button.
  useEffect(() => {
    if (!selectedSlug) return;
    const onKey = (e) => e.key === "Escape" && select(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedSlug, select]);

  const selected = findProject(selectedSlug);

  // A project carries either one `clip` or a list of them; normalise to a list
  // so the panel only has one case to render.
  const clips = !selected
    ? []
    : selected.clips?.length
      ? selected.clips
      : selected.clip
        ? [{ src: selected.clip, poster: selected.image }]
        : [];
  const links = profile.links.filter((l) => l.href);

  // One row of the left column. Used by both lists below, so an experience row
  // and a leadership row behave identically — click to unfold, or to open a
  // project if the row points at one.
  const expRow = (e) => {
    const key = e.org + e.dates;
    const linked = e.projectSlug && findProject(e.projectSlug);
    const isSelected = linked && e.projectSlug === selectedSlug;
    const expandable = !linked && e.points?.length > 0;
    const isOpen = openExp === key;
    const body = (
      <>
        <span className="exp-title">{e.title}</span>
        <span className="exp-meta">
          {e.org}
          {e.orgNote ? ` (${e.orgNote})` : ""} · {e.dates}
        </span>
      </>
    );
    return (
      <li
        key={key}
        className={`exp-row${isSelected ? " is-selected" : ""}${isOpen ? " is-open" : ""}`}
      >
        {linked ? (
          <button
            className="exp-button"
            onClick={() => select(e.projectSlug)}
            aria-label={`View the ${linked.name} project`}
          >
            {body}
          </button>
        ) : expandable ? (
          <button
            className="exp-button"
            onClick={() => setOpenExp(isOpen ? null : key)}
            aria-expanded={isOpen}
          >
            {body}
            <span className="exp-chevron" aria-hidden="true">›</span>
          </button>
        ) : (
          body
        )}

        {expandable && isOpen && (
          <ul className="exp-points">
            {e.points.map((pt) => <li key={pt}>{pt}</li>)}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="page">
      <button
        className="theme-toggle"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle color theme"
      >
        {theme === "dark" ? "☀" : "☾"}
      </button>

      {/* Left — who and where */}
      <div className="col-left">
        <header>
          <h1>{profile.name}</h1>
          <p className="tagline">{profile.tagline}</p>
        </header>

        <p className="summary">{profile.summary}</p>

        {/* When a project is selected its technologies light up and the rest dim. */}
        <p className={`tech-line${selected ? " is-filtered" : ""}`}>
          {profile.techLine.map((t, i) => (
            <span
              key={t}
              className={`tech-item${selected?.tech.includes(t) ? " is-on" : ""}`}
            >
              {t}
              {i < profile.techLine.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>

        <p className="links">
          {profile.resume && (
            <a className="btn primary resume-btn" href={profile.resume} target="_blank" rel="noopener">
              Resume
            </a>
          )}
          {links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener">{l.label}</a>
          ))}
        </p>

        {/* Education reads as its own thing, not as the oldest job. */}
        <section className="education" aria-label="Education">
          <h2 className="col-heading">Education</h2>
          <p className="edu-degree">{education.degree}</p>
          <p className="edu-meta">
            {education.org} · <span className="muted">{education.dates}</span>
          </p>
          {education.details?.length > 0 && (
            <ul className="edu-details">
              {education.details.map((d) => <li key={d}>{d}</li>)}
            </ul>
          )}
        </section>

        <h2 className="col-heading exp-heading">Experience</h2>

        <ul className="experience">{experience.map(expRow)}</ul>

        {/* Leadership is kept out of the job timeline on purpose — a club role
            shouldn't compete chronologically with employment. */}
        {leadership?.length > 0 && (
          <>
            <h2 className="col-heading exp-heading">Leadership</h2>
            <ul className="experience">{leadership.map(expRow)}</ul>
          </>
        )}
      </div>

      {/* Right — what was built */}
      <div className="col-right">
        {selected ? (
          <section className="panel" aria-label={`${selected.name} details`}>
            <button className="panel-close" onClick={() => select(null)} aria-label="Close project details">
              ×
            </button>

            <div className="panel-stage">
              {/* A project with demo clips plays them here, 16:9, in place of
                  the still. More than one and you get a row of step buttons. */}
              <ProjectVisual
                name={selected.name}
                image={clips[clipIndex]?.poster || selected.image}
                clip={clips[clipIndex]?.src}
                variant={clips.length || selected.wide ? "clip" : "hero"}
              />
            </div>

            {clips.length > 1 && (
              <div className="clip-steps" role="tablist" aria-label={`${selected.name} demo steps`}>
                {clips.map((c, i) => (
                  <button
                    key={c.src}
                    role="tab"
                    aria-selected={i === clipIndex}
                    className={`clip-step${i === clipIndex ? " is-on" : ""}`}
                    onClick={() => setClipIndex(i)}
                  >
                    {c.label || `Step ${i + 1}`}
                  </button>
                ))}
              </div>
            )}

            <h2 className="panel-name">{selected.name}</h2>

            {/* Who it was for, in what capacity, and when — so paid work reads
                as paid work and not as a side project. */}
            {selected.engagement ? (
              <p className="panel-engagement">
                <span className="engagement-role">{selected.engagement.role}</span>
                {selected.engagement.client && (
                  <span className="muted"> · {selected.engagement.client}</span>
                )}
                {selected.engagement.period && (
                  <span className="muted"> · {selected.engagement.period}</span>
                )}
              </p>
            ) : (
              selected.badge && <p className="panel-badge">{selected.badge}</p>
            )}
            <p className="panel-description">{selected.description}</p>

            <ul className="panel-tech">
              {selected.tech.map((t) => <li key={t}>{t}</li>)}
            </ul>

            {(selected.demo || selected.repo) && (
              <div className="panel-actions">
                {selected.demo && (
                  <a className="btn primary" href={selected.demo} target="_blank" rel="noopener">Demo</a>
                )}
                {selected.repo && (
                  <a className="btn" href={selected.repo} target="_blank" rel="noopener">Code</a>
                )}
              </div>
            )}
          </section>
        ) : (
          <div className="diorama">
            <HeroParallax>
              <div className="hero-slot">
                <div className="float float-hero">
                  <ProjectVisual
                    name={hero.label}
                    image={hero.image}
                    art={<HeroSvg />}
                    variant="hero"
                  />
                </div>
              </div>
            </HeroParallax>

            <div className="project-grid">
              {projects.map((p) => (
                <button
                  key={p.slug}
                  className="project-block"
                  onClick={() => select(p.slug)}
                  aria-label={`View the ${p.name} project`}
                >
                  {/* The float lives on an inner wrapper so the focus ring stays put. */}
                  <span className="float">
                    <ProjectVisual name={p.name} image={p.image} />
                  </span>
                  <span className="project-name">{p.name}</span>
                  <span className="project-badge">{p.badge || " "}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <ToyBunny selectedSlug={selectedSlug} />
    </div>
  );
}
