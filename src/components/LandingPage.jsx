// The main site: the long, scrolling version of me.
//
// Three acts. A landing that is just a name and a sentence, so the first
// screen isn't a wall of resume. Then the work, where the island is the
// control — turn it and the panel beside it swaps to whatever project came
// round, and the row of cards underneath turns it the other way. Then the
// path: education, then the jobs as a timeline that assembles itself
// as you scroll past it.
//
// Every word here comes from content.js. The other view (OnePage.jsx) is the
// same content with none of the theatre.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { profile, education, experience, leadership, projects } from "../content.js";
import IslandHero from "./IslandHero.jsx";
import ProjectVisual from "./ProjectVisual.jsx";
import ProjectIcon from "./ProjectIcon.jsx";
import Reveal from "./Reveal.jsx";
import ContactForm from "./ContactForm.jsx";
import { byRecency } from "../dates.js";

// The jobs, newest first. Leadership used to be merged in here and sorted by
// date with them, which put a club role at the very top of the list as the most
// recent thing I'd done — it read like my current job. It has its own section
// under the timeline now, where it's clearly something else.
// Education isn't in here either: a degree isn't a job.
const timeline = experience.slice().sort(byRecency);
// A row flagged `aside` in content.js comes out of the main column: see the
// note there. The side column is where the things that aren't engineering jobs
// live, so it is the right home for one.
const mainRoles = timeline.filter((e) => !e.aside);
const asideRoles = timeline.filter((e) => e.aside);
const leadRoles = leadership.slice().sort(byRecency);

// One row of either timeline. The two lists render identically — the only
// difference is which heading they sit under.
const entryRow = (e, i, setFront) => (
  <Reveal as="li" className="lp-entry" key={e.org + e.dates} delay={Math.min(i, 4) * 60}>
    <span className="lp-dot" aria-hidden="true" />
    <p className="lp-entry-dates">{e.dates}</p>
    {/* The place first and in the larger type: that's what someone
        skimming a CV is actually looking for. The role sits under it.
        A row with `leadWithTitle` flips the two, for work with no
        employer behind it. `orgNote` is a qualifier, not part of the
        name, so it rides on the lower line with the badges. */}
    <h3 className="lp-entry-title">{e.leadWithTitle ? e.title : e.org}</h3>
    <p className="lp-entry-org">
      {e.leadWithTitle ? e.org : e.title}
      {e.orgNote && <span className="lp-entry-note">{e.orgNote}</span>}
    </p>
    {e.points?.length > 0 && (
      <ul className="lp-entry-points">
        {e.points.map((pt) => <li key={pt}>{pt}</li>)}
      </ul>
    )}
    {e.projectSlugs?.length > 0 && (
      <p className="lp-entry-work">
        {e.projectSlugs.map((slug) => {
          const at = projects.findIndex((p) => p.slug === slug);
          return at < 0 ? null : (
            <a key={slug} href="#work" onClick={() => setFront(at)}>{projects[at].name} →</a>
          );
        })}
      </p>
    )}
  </Reveal>
);

// A description is only worth folding if it runs long enough to take over the
// card. Eight lines is about where a paragraph stops reading as a paragraph;
// under that the whole thing shows and there is no control at all.
const MAX_LINES = 8;

export default function LandingPage({ selectedSlug, onFrontChange }) {
  const [front, setFront] = useState(0);
  const [clipIndex, setClipIndex] = useState(0);
  const island = useRef(null);
  const railRef = useRef(null);
  const windowRef = useRef(null);
  const textRef = useRef(null);
  // Starts collapsed. The description is the only thing that collapses — the
  // picture, the demo steps, the name, the tags and the links are all drawn at
  // full size either way. Shrinking those too made the card look like a
  // different, lesser card rather than the same one with its prose folded.
  // The whole section has to fit one screen, and the prose is what overflows.
  const [openCard, setOpenCard] = useState(false);

  const project = projects[front] || projects[0];

  // A different project means the clip steps start over.
  useEffect(() => setClipIndex(0), [front]);

  // Keep the URL on whatever is facing us, so the project someone is looking
  // at is the one they can send to somebody.
  useEffect(() => {
    onFrontChange?.(projects[front]?.slug);
  }, [front, onFrontChange]);

  // Arriving on ?p=<slug> should turn the island to that project rather than
  // dropping you on the first one. Only on the way in — after that the island
  // is in charge of what's showing.
  useEffect(() => {
    const i = projects.findIndex((p) => p.slug === selectedSlug);
    if (i > 0) island.current?.face(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the card for whatever is facing us scrolled into the rail, or the
  // highlight wanders off the end of a row you can't see.
  useEffect(() => {
    const rail = railRef.current;
    const card = rail?.children[front];
    if (!card) return;
    rail.scrollTo({
      left: card.offsetLeft - rail.clientWidth / 2 + card.clientWidth / 2,
      behavior: "smooth",
    });
  }, [front]);

  // Turning to another project leaves the card however you had it: if you
  // asked for the long version once, you probably want it for the next one.
  const handleFront = useCallback((i) => setFront(i), []);

  // The collapsed description, or null when the full text already fits inside
  // the line budget — then nothing is cut and no control is drawn.
  //
  // Measured, not counted in characters. A character budget cuts the same words
  // whatever the paragraph is doing, so the same 180 characters is three lines
  // in a wide window and seven in a narrow one: descriptions that were never
  // too long got folded, and long ones got folded too hard.
  const [summary, setSummary] = useState(null);

  useLayoutEffect(() => {
    const el = textRef.current;
    const full = project?.description || "";
    if (!el) return;

    const measure = () => {
      const cs = getComputedStyle(el);
      const line = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.6;
      const budget = line * MAX_LINES + 1;

      // A hidden twin of the paragraph. The text has to be tried at a few
      // lengths to find the cut, and doing that in the real one would flicker
      // every attempt onto the screen.
      const probe = document.createElement("p");
      probe.className = el.className;
      probe.setAttribute(
        "style",
        "position:absolute;visibility:hidden;pointer-events:none;height:auto;" +
          `width:${el.clientWidth}px;max-width:none;`
      );
      el.parentNode.appendChild(probe);
      const fits = (t) => {
        probe.textContent = t;
        return probe.scrollHeight <= budget;
      };

      let cut = null;
      if (!fits(full)) {
        // The longest prefix that still leaves the ellipsis and the control
        // room on the last line, then backed up to the nearest word.
        const tail = "… Read more";
        let lo = 0;
        let hi = full.length;
        while (lo < hi) {
          const mid = Math.ceil((lo + hi) / 2);
          if (fits(full.slice(0, mid) + tail)) lo = mid;
          else hi = mid - 1;
        }
        const head = full.slice(0, lo);
        const stop = head.lastIndexOf(" ");
        cut = `${(stop > 0 ? head.slice(0, stop) : head).replace(/[,;:.\s]+$/, "")}…`;
      }
      probe.remove();
      setSummary(cut);
    };

    // Run before paint, so a long description is never briefly drawn in full.
    measure();
    // The budget is a number of lines, so it moves with the column width.
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [project]);

  // A project carries either one `clip` or a list of them; normalise so the
  // panel only has one case to render.
  const clips = project?.clips?.length
    ? project.clips
    : project?.clip
      ? [{ src: project.clip, poster: project.image }]
      : [];

  const links = profile.links.filter((l) => l.href);

  return (
    <main className="lp">
      {/* ---------- The landing ---------- */}
      <section className="lp-intro">
        <Reveal className="lp-intro-inner">
          <p className="lp-eyebrow">{profile.tagline}</p>
          <h1 className="lp-name">{profile.name}</h1>
          <p className="lp-summary">{profile.summary}</p>
          <p className="lp-links">
            {profile.resume && (
              <a className="btn primary" href={profile.resume} target="_blank" rel="noopener">
                Resume
              </a>
            )}
            {profile.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>}
            {links.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener">{l.label}</a>
            ))}
          </p>
        </Reveal>
        <a className="lp-scroll-cue" href="#work">
          <span>the work</span>
          <span className="lp-cue-arrow" aria-hidden="true">↓</span>
        </a>
      </section>

      {/* ---------- The work ---------- */}
      <section className="lp-work" id="work">
        {/* The heading sits inside the left column rather than across the top,
            so the panel on the right starts level with "Things I've built"
            instead of a heading's worth of empty space below it. */}
        <div className="lp-stage">
          {/* Left column: the island, with the rail of projects underneath it.
              The rail used to run the full width below both columns, which put
              the list of projects below the description of the one you are
              already reading — it belongs under the thing it drives. */}
          <div className="lp-stage-left">
            <Reveal as="header" className="lp-section-head">
              <p className="lp-sec-eyebrow"><b>01</b> The work</p>
              <h2>Things I've built</h2>
              <p className="lp-section-note">
                Turn the island, or use the arrows — whatever comes round is what you'll read.
              </p>
            </Reveal>

            <div className="lp-island">
              <IslandHero
                projects={projects}
                onFront={handleFront}
                controls={island}
              />
            </div>

            {/* The rail: every project at a glance, and another way to drive the
                island for anyone who would rather pick than turn. */}
            <div className="lp-rail" ref={railRef}>
              {projects.map((p, i) => (
                <button
                  key={p.slug}
                  className={`lp-rail-card${i === front ? " is-on" : ""}`}
                  onClick={() => island.current?.face(i)}
                  aria-current={i === front}
                  aria-label={`Show the ${p.name} project`}
                >
                  <span className="lp-rail-icon"><ProjectIcon name={p.icon} /></span>
                  <span className="lp-rail-name">{p.name}</span>
                  <span className="lp-rail-blurb">{p.blurb || p.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* The window beside it. Swapping `key` on the card restarts its
              entrance animation, so turning the island reads as a change of
              page rather than text quietly rewriting itself. */}
          <div className={`lp-window${openCard ? "" : " is-compact"}`} ref={windowRef}>
            <div className="lp-window-nav">
              <button
                className="lp-arrow"
                onClick={() => island.current?.prev()}
                aria-label="Previous project"
              >
                ‹
              </button>
              <span className="lp-counter">
                {front + 1} / {projects.length}
              </span>
              <button
                className="lp-arrow"
                onClick={() => island.current?.next()}
                aria-label="Next project"
              >
                ›
              </button>
            </div>

            {/* Announced politely, so a screen reader is told what turned up
                without having the current sentence cut off. */}
            <article className="lp-card" id="lp-card" key={project.slug} aria-live="polite">
              <div className="lp-card-stage">
                <ProjectVisual
                  name={project.name}
                  icon={project.icon}
                  image={clips[clipIndex]?.poster || project.image}
                  clip={clips[clipIndex]?.src}
                  // With nothing to show yet, the cover takes the wide frame
                  // rather than the small square: a 230px plate adrift in a
                  // full-width stage reads as a picture that failed to load.
                  variant={
                    clips.length || project.wide || !project.image
                      ? "clip"
                      : "hero"
                  }
                />
              </div>

              {clips.length > 1 && (
                <div className="clip-steps" role="tablist" aria-label={`${project.name} demo steps`}>
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

              <h3 className="lp-card-name">{project.name}</h3>

              {/* Who it was for and when, so paid work reads as paid work. */}
              {project.engagement ? (
                <p className="lp-card-meta">
                  <span className="engagement-role">{project.engagement.role}</span>
                  {project.engagement.client && <span className="muted"> · {project.engagement.client}</span>}
                  {project.engagement.period && <span className="muted"> · {project.engagement.period}</span>}
                </p>
              ) : (
                project.badge && <p className="lp-card-meta muted">{project.badge}</p>
              )}

              {/* The control sits at the end of the sentence it cuts off, where
                  the ellipsis has just told you there is more. It used to be a
                  pill up in the nav row, which is a long way from the text it
                  acts on and easy to miss entirely. */}
              <p className="lp-card-text" id="lp-card-text" ref={textRef}>
                {openCard || !summary ? project.description : summary}
                {summary && (
                  <button
                    className="lp-more"
                    onClick={() => setOpenCard((v) => !v)}
                    aria-expanded={openCard}
                  >
                    {openCard ? "Read less" : "Read more"}
                  </button>
                )}
              </p>

              <ul className="panel-tech">
                {project.tech.map((t) => <li key={t}>{t}</li>)}
              </ul>

              {(project.demo || project.repo) && (
                <div className="panel-actions">
                  {project.demo && (
                    <a className="btn primary" href={project.demo} target="_blank" rel="noopener">Visit site ↗</a>
                  )}
                  {project.repo && (
                    <a className="btn" href={project.repo} target="_blank" rel="noopener">Code</a>
                  )}
                </div>
              )}
            </article>
          </div>
        </div>

      </section>

      {/* ---------- The path ---------- */}
      <section className="lp-path" id="path">
        <Reveal as="header" className="lp-section-head">
          <p className="lp-sec-eyebrow"><b>02</b> The path</p>
          <h2>How I got here</h2>
        </Reveal>

        {/* Two columns: the jobs down the main one, school and the club off to
            the side. They are different kinds of thing, and keeping them apart
            is what stopped a club role reading as my latest job — this makes
            that visible rather than relying on the order. */}
        <div className="lp-path-grid">
          <div className="lp-path-main">
            <Reveal as="h3" className="lp-subhead">Experience</Reveal>
            <ol className="lp-timeline">
              {mainRoles.map((e, i) => entryRow(e, i, setFront))}
            </ol>
          </div>

          <aside className="lp-path-side">
            <Reveal className="lp-edu">
              <p className="lp-entry-dates">{education.dates}</p>
              <h3 className="lp-entry-title">{education.org}</h3>
              <p className="lp-entry-org">
                {education.degree}
                <span className="lp-entry-kind">Education</span>
              </p>
              {education.details?.length > 0 && (
                <ul className="lp-entry-points">
                  {education.details.map((d) => <li key={d}>{d}</li>)}
                </ul>
              )}
            </Reveal>

            {asideRoles.length > 0 && (
              <>
                <Reveal as="h3" className="lp-subhead">Other roles</Reveal>
                <ol className="lp-timeline lp-timeline-lead">
                  {asideRoles.map((e, i) => entryRow(e, i, setFront))}
                </ol>
              </>
            )}

            {leadRoles.length > 0 && (
              <>
                <Reveal as="h3" className="lp-subhead">Leadership</Reveal>
                <ol className="lp-timeline lp-timeline-lead">
                  {leadRoles.map((e, i) => entryRow(e, i, setFront))}
                </ol>
              </>
            )}
          </aside>
        </div>
      </section>

      {/* ---------- The end ---------- */}
      <footer className="lp-end">
        <Reveal>
          <h2>Still reading?</h2>
          <p className="lp-end-text">
            I'm looking for internships in robotics, computer vision and full-stack work.
            The quickest way to reach me is email{profile.formEndpoint ? ", or this form" : ""}.
          </p>
          <ContactForm endpoint={profile.formEndpoint} email={profile.email} />
          <p className="lp-links">
            {profile.email && (
              <a className="btn primary" href={`mailto:${profile.email}`}>{profile.email}</a>
            )}
            {links.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener">{l.label}</a>
            ))}
          </p>
        </Reveal>
      </footer>
    </main>
  );
}
