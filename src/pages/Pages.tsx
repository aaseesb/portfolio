import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  CodeXml,
  BriefcaseBusiness,
  Mail,
  Rabbit,
  UserRound,
  FileText,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { useState } from "react";
import { profile, experiences, projects, asset, type Project } from "../data/portfolio";
import {
  NotFound,
  PageHeading,
  ProjectCard,
  ProjectVisual,
  ResumeLink,
} from "../components/Shared";

export function Home() {
  return (
    <section className="home">
      <div className="home-intro">
        <span className="eyebrow home-eyebrow">
          <span className="tiny-line" /> {profile.eyebrow} <span className="tiny-line" />
        </span>
        <h1>{profile.name}</h1>
        <nav className="home-nav" aria-label="Explore the portfolio">
          {[
            ["Experience", "/experience"],
            ["Projects", "/projects"],
            ["Links", "/links"],
            ["About me", "/about"],
          ].map(([label, to]) => (
            <Link key={to} to={to} className="home-nav-button">
              {label}
              <ArrowUpRight size={14} />
            </Link>
          ))}
        </nav>
        <p className="home-description">{profile.descriptor}</p>
      </div>
    </section>
  );
}

export function ExperiencePage() {
  return (
    <>
      <PageHeading
        eyebrow="01 / EXPERIENCE"
        title="Experience"
        description="Where I’ve worked, studied and led."
      >
        <ResumeLink />
      </PageHeading>
      {([undefined, "Leadership", "Education"] as const).map((section) => (
        <Timeline
          key={section ?? "work"}
          title={section}
          items={experiences.filter((item) => item.section === section)}
        />
      ))}
    </>
  );
}

function Timeline({ title, items }: { title?: string; items: typeof experiences }) {
  return (
    <>
      {title && <h2 className="timeline-heading">{title}</h2>}
      <div className="timeline">
        {items.map((item, i) => (
          <article className="timeline-item" key={item.id}>
            <div className="timeline-date">
              <span>{item.dates}</span>
              {!item.end && (
                <small>
                  <span className="status-dot" />
                  Currently
                </small>
              )}
            </div>
            <div className={`timeline-marker ${i === 0 ? "current" : ""}`} />
            <div className="timeline-content">
              <span className="eyebrow">{item.type}</span>
              <h2>{item.role}</h2>
              <p className="organization">{item.organization}</p>
              {item.bullets.length > 0 && (
                <ul>
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export function ProjectsPage() {
  return (
    <>
      <PageHeading
        eyebrow="02 / PROJECTS"
        title="Selected projects"
        description="Robots, client sites, hackathon builds and experiments."
      />
      <div className="section-rule">
        <span>{projects.length} projects</span>
        <span>Robotics · Vision · Full-stack</span>
      </div>
      <div className="project-grid">
        {projects.map((project, index) => (
          <ProjectCard key={project.slug} project={project} index={index} />
        ))}
      </div>
    </>
  );
}

// A project with demo clips plays them in the hero slot, with tabs to switch;
// otherwise the hero is the same visual as its card.
function ProjectHero({ project }: { project: Project }) {
  const [active, setActive] = useState(0);
  const clips = project.clips ?? [];
  if (!clips.length) return <ProjectVisual project={project} />;
  const clip = clips[active];
  return (
    <>
      <div className="project-video">
        <video
          key={clip.src}
          src={asset(clip.src)}
          poster={asset(clip.poster)}
          autoPlay
          muted
          loop
          playsInline
          aria-label={`${project.title}: ${clip.label}`}
        />
      </div>
      {clips.length > 1 && (
        <div className="clip-tabs" aria-label="Demo views">
          {clips.map((c, i) => (
            <button key={c.src} onClick={() => setActive(i)} aria-pressed={active === i}>
              {c.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export function ProjectPage() {
  const { slug } = useParams();
  const project = projects.find((item) => item.slug === slug);
  if (!project) return <NotFound />;
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  return (
    <>
      <Link className="back-link" to="/projects">
        <ArrowLeft size={15} />
        All projects
      </Link>
      <div className="project-detail-heading">
        <div>
          <span className="eyebrow">{project.category}</span>
          <h1>
            {project.title}
            <span className="title-dot">.</span>
          </h1>
          <p>{project.summary}</p>
        </div>
        {(project.demo || project.source) && (
          <div className="inline-actions">
            {project.demo && (
              <a className="button" href={project.demo} target="_blank" rel="noopener noreferrer">
                Visit site <ExternalLink size={15} />
              </a>
            )}
            {project.source && (
              <a
                className="button button-outline"
                href={project.source}
                target="_blank"
                rel="noopener noreferrer"
              >
                Source code <CodeXml size={15} />
              </a>
            )}
          </div>
        )}
      </div>
      <div className="detail-visual">
        <ProjectHero key={project.slug} project={project} />
      </div>
      <div className="case-study">
        <aside>
          <div>
            <span className="eyebrow">ROLE</span>
            <p>{project.role}</p>
          </div>
          {project.year && (
            <div>
              <span className="eyebrow">YEAR</span>
              <p>{project.year}</p>
            </div>
          )}
          <div>
            <span className="eyebrow">MADE WITH</span>
            <p>{project.tags.join(", ")}</p>
          </div>
        </aside>
        <div>
          {project.sections.map((section, i) => (
            <section key={section.title}>
              <span className="eyebrow">0{i + 1}</span>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </div>
      <Link className="next-project" to={`/projects/${next.slug}`}>
        <div>
          <span className="eyebrow">NEXT PROJECT</span>
          <h2>{next.title}</h2>
        </div>
        <ArrowRight size={28} strokeWidth={1} />
      </Link>
    </>
  );
}

export function LinksPage() {
  const links = [
    { label: "GitHub", detail: "Code and repositories", value: profile.github, Icon: CodeXml },
    {
      label: "LinkedIn",
      detail: "Professional profile",
      value: profile.linkedin,
      Icon: BriefcaseBusiness,
    },
    { label: "Email", detail: profile.email, value: `mailto:${profile.email}`, Icon: Mail },
  ];
  return (
    <div className="links-page">
      <PageHeading eyebrow="03 / CONTACT" title="Links & contact" description={profile.lookingFor} />
      <div className="contact-list">
        <div className="contact-row">
          <FileText size={22} strokeWidth={1.2} />
          <div>
            <h2>Resume</h2>
            <p>Download a PDF copy</p>
          </div>
          <ResumeLink className="button button-outline" />
        </div>
        {links.map(({ label, detail, value, Icon }) => (
          <div className="contact-row" key={label}>
            <Icon size={22} strokeWidth={1.2} />
            <div>
              <h2>{label}</h2>
              <p>{detail}</p>
            </div>
            <a
              className="button button-outline"
              href={value}
              target={label === "Email" ? undefined : "_blank"}
              rel="noopener noreferrer"
            >
              {label === "Email" ? "Send email" : `View ${label}`} <ArrowUpRight size={16} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhotoSlot({ src, kind }: { src?: string; kind: "portrait" | "rabbit" }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`photo-slot ${kind}`}>
      {src && !failed ? (
        <img
          src={asset(src)}
          alt={kind === "portrait" ? `Portrait of ${profile.name}` : "Lulu, my rabbit"}
          onError={() => setFailed(true)}
        />
      ) : (
        <>
          {kind === "portrait" ? (
            <UserRound size={55} strokeWidth={0.65} />
          ) : (
            <Rabbit size={58} strokeWidth={0.7} />
          )}
          <span>{kind === "portrait" ? "Photo coming soon" : "Lulu is camera-shy"}</span>
        </>
      )}
    </div>
  );
}

export function AboutPage() {
  return (
    <>
      <PageHeading eyebrow="04 / ABOUT" title="About me" />
      <div className="about-layout">
        <div className="photo-composition">
          <div className="portrait-frame">
            <PhotoSlot src={profile.portrait} kind="portrait" />
            <span className="photo-caption">01. Aasees</span>
          </div>
          <div className="rabbit-frame" id="lulu">
            <PhotoSlot src={profile.rabbit} kind="rabbit" />
            <span className="photo-caption">02. Lulu, my rabbit</span>
          </div>
        </div>
        <div className="about-copy">
          <span className="eyebrow">HI, I’M {profile.name.toUpperCase()}.</span>
          <h2>
            {profile.aboutTitle[0]}
            <br />
            <i>{profile.aboutTitle[1]}</i>
          </h2>
          {profile.biography.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <Link className="button button-outline about-hello" to="/links">
            Contact & links <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </>
  );
}
