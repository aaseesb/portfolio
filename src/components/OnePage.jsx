// The one-page summary: everything about me on a single screen, no scrolling
// story and nothing to discover.
//
// This is the recruiter's view, and it is ordered the way one reads: the intro
// across the top, then the jobs down the main column with education and
// leadership beside them, then skills and the projects full width underneath.
// Experience leads, because for a student engineer that's the question being
// asked — the projects are the evidence for it, not the headline. Skills sit
// directly above the projects because opening one highlights them, and a
// highlight you have to scroll back up to see isn't one. Running the intro the
// whole width is what stops a short left column leaving a hole in the page.
// The big scrolling site (LandingPage.jsx) is the other door into exactly the
// same content.js; neither view has any content of its own.
import { useRef, useState } from "react";
import { profile, education, experience, leadership, projects } from "../content.js";
import { byRecency } from "../dates.js";
import ProjectVisual from "./ProjectVisual.jsx";
import BunnySvg from "./BunnySvg.jsx";

const findProject = (slug) => projects.find((p) => p.slug === slug) || null;

// Sorted here rather than in content.js, so adding a job is just adding a job —
// nothing has to be slotted into the right place by hand, which is how the list
// quietly stopped being chronological the last two times.
const jobs = experience.slice().sort(byRecency);
// A row flagged `aside` in content.js sits in the right column under "Other
// roles", the same as on the exploring page — see the note there.
const mainJobs = jobs.filter((e) => !e.aside);
const asideJobs = jobs.filter((e) => e.aside);
const leadRoles = leadership.slice().sort(byRecency);

export default function OnePage({ selectedSlug, onSelect }) {
  // Which experience row is unfolded. Independent of the project selection:
  // a job is a row you unfold in place, a project is a thing you open below.
  const [openExp, setOpenExp] = useState(null);
  const [clipIndex, setClipIndex] = useState(0);

  const selected = findProject(selectedSlug);
  const links = profile.links.filter((l) => l.href);

  // A project carries either one `clip` or a list of them; normalise to a list
  // so the panel only has one case to render.
  const clips = !selected
    ? []
    : selected.clips?.length
      ? selected.clips
      : selected.clip
        ? [{ src: selected.clip, poster: selected.image }]
        : [];

  // The panel opens in the slot the grid occupied, at the top of the projects
  // row. Clicking a tile from further down that row leaves that top above you,
  // so come back up to it — otherwise the panel opens off-screen and it looks
  // like nothing happened. Only when it's actually off the top.
  const areaRef = useRef(null);
  const select = (slug) => {
    setClipIndex(0);
    onSelect(slug);
    if (slug && (areaRef.current?.getBoundingClientRect().top ?? 0) < 0) {
      areaRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Step to the previous/next project, wrapping at both ends, so the panel can
  // be walked through without going back up to the grid every time.
  const index = projects.findIndex((p) => p.slug === selectedSlug);
  const step = (d) => select(projects[(index + d + projects.length) % projects.length].slug);


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
        {/* Where, then what. The name of the place is what someone scanning
            this is looking for, so it leads and the role sits under it, unless
            the row sets `leadWithTitle` because there's no employer to name.
            `orgNote` qualifies the role, so it sits on the meta line. */}
        <span className="exp-title">{e.leadWithTitle ? e.title : e.org}</span>
        <span className="exp-meta">
          {e.leadWithTitle ? e.org : e.title}
          {e.orgNote && <span className="exp-flag">{e.orgNote}</span>}
          <span className="exp-dates">{e.dates}</span>
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
            {e.projectSlugs?.map((slug) => findProject(slug) && (
              <li key={slug} className="exp-work">
                <button onClick={() => select(slug)}>{findProject(slug).name} →</button>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      {/* Across the top — who, in one band. The name, the line under it, the
          paragraph and the links all read left to right rather than stacking in
          a narrow column, which is both how an intro wants to be read and why
          there's no longer a gap beside it. */}
      <header className="intro-band">
        <div className="intro-text">
          <h1>{profile.name}</h1>
          <p className="tagline">{profile.tagline}</p>
          <p className="summary">{profile.summary}</p>
        </div>

        {/* Resume first: it's the thing a recruiter came for, and it's the only
            one of these that is a button. The address follows it. */}
        <p className="links">
          {profile.resume && (
            <a className="btn primary resume-btn" href={profile.resume} target="_blank" rel="noopener">
              Resume
            </a>
          )}
          {profile.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>}
          {links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener">{l.label}</a>
          ))}
        </p>
      </header>

      {/* Main column — the work. First thing under the intro, because it's the
          first thing someone is looking for. */}
      <div className="col-left">
        <h2 className="col-heading exp-heading">Experience</h2>
        <ul className="experience">{mainJobs.map(expRow)}</ul>
      </div>

      {/* Beside it — the shorter facts: education and the leadership role. */}
      <div className="col-right">
        {/* Laid out like one of the job rows rather than as a paragraph with
            middle dots in it: the school, the dates off to the right where the
            eye can find them, the degree under it, and the honours as chips —
            a GPA and an award aren't really bullet points. */}
        <section className="education" aria-label="Education">
          <h2 className="col-heading">Education</h2>
          <div className="edu-top">
            <p className="edu-degree">{education.org}</p>
            <p className="edu-dates">{education.dates}</p>
          </div>
          <p className="edu-meta">{education.degree}</p>
          {education.details?.length > 0 && (
            <ul className="edu-details">
              {education.details.map((d) => <li key={d}>{d}</li>)}
            </ul>
          )}
        </section>

        {asideJobs.length > 0 && (
          <>
            <h2 className="col-heading exp-heading aside-heading">Other roles</h2>
            <ul className="experience aside-list">{asideJobs.map(expRow)}</ul>
          </>
        )}

        {/* Leadership is kept out of the job list on purpose — a club role
            shouldn't compete chronologically with employment, and over
            here it's also what levels the two columns up. */}
        {leadRoles.length > 0 && (
          <>
            <h2 className="col-heading exp-heading lead-heading">Leadership</h2>
            <ul className="experience lead-list">{leadRoles.map(expRow)}</ul>
          </>
        )}
      </div>

      {/* Skills, directly above the projects and across the whole page. They
          used to sit up in the right column, which meant that clicking a project
          lit up a list that was by then far off the top of the screen — the
          highlight is the whole point of the list, so it now lives next to the
          thing that drives it. */}
      <section className="skills-band" aria-label="Skills">
        <h2 className="col-heading">Skills</h2>

        {/* Grouped like a resume's skills block: the label tells you what kind
            of thing the row is, so you can find one language without reading
            sixteen names. When a project is selected its technologies light up
            and the rest dim, which is what ties it back to this list. */}
        <div className={`skills${selected ? " is-filtered" : ""}`}>
          {profile.skills.map((g) => (
            <div className="skill-group" key={g.group}>
              <span className="skill-label">{g.group}</span>
              <p className="skill-items">
                {g.items.map((t, i) => (
                  <span
                    key={t}
                    className={`tech-item${selected?.tech.includes(t) ? " is-on" : ""}`}
                  >
                    {t}
                    {i < g.items.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Underneath, the full width of the page — what was built */}
      <section className="projects-row" aria-label="Projects">
        <h2 className="col-heading">Projects</h2>

        {/* The grid and the open project share one slot, so opening one never
            pushes the page down or shuffles what's below it. The arrows are
            what replace the grid while it's hidden. */}
        <div className="project-area" ref={areaRef}>
        {!selected ? (
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
                  <ProjectVisual name={p.name} icon={p.icon} image={p.image} />
                </span>
                <span className="project-name">{p.name}</span>
                <span className="project-badge">{p.badge || " "}</span>
              </button>
            ))}
          </div>
        ) : (
          <section className="panel" aria-label={`${selected.name} details`}>
            <div className="panel-nav">
              <button className="panel-step" onClick={() => step(-1)} aria-label="Previous project">‹</button>
              <span className="panel-count">{index + 1} / {projects.length}</span>
              <button className="panel-step" onClick={() => step(1)} aria-label="Next project">›</button>
              <button className="panel-close" onClick={() => select(null)}>
                All projects
              </button>
            </div>

            <div className="panel-split">
            {/* Left half: the thing itself. */}
            <div className="panel-media">
            <div className="panel-stage">
              {/* A project with demo clips plays them here, 16:9, in place of
                  the still. More than one and you get a row of step buttons. */}
              <ProjectVisual
                name={selected.name}
                icon={selected.icon}
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
            </div>

            {/* Right half: what it is. */}
            <div className="panel-body">
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
                  <a className="btn primary" href={selected.demo} target="_blank" rel="noopener">Visit site ↗</a>
                )}
                {selected.repo && (
                  <a className="btn" href={selected.repo} target="_blank" rel="noopener">Code</a>
                )}
              </div>
            )}
            </div>
            </div>
          </section>
        )}
        </div>
      </section>

      {/* Three bunnies along the bottom, and that's all they are. She's the one
          the rest of the site is about; the other two are only here for anyone
          who scrolls to the very end. Decoration, so it's hidden from screen
          readers entirely. */}
      <div className="onepage-bunnies" aria-hidden="true">
        <svg viewBox="0 0 400 92" className="bunny-row" role="presentation">
          {/* Sized and placed so all three stand on the same ground line, with
              the small two out towards the edges rather than huddled around her. */}
          <g transform="translate(96 70) scale(0.42)">
            <BunnySvg fur="var(--bunny-alt-a)" blaze={false} />
          </g>
          <g transform="translate(304 70) scale(0.42)">
            <BunnySvg fur="var(--bunny-alt-b)" blaze={false} patch />
          </g>
          <g transform="translate(200 58) scale(0.82)">
            <BunnySvg />
          </g>
        </svg>
      </div>
    </>
  );
}
