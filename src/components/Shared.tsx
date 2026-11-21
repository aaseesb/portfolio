import { ArrowDownToLine, ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { asset, profile, projects, type Project } from "../data/portfolio";

export function ResumeLink({ className = "button" }: { className?: string }) {
  return (
    <a className={className} href={asset(profile.resume.path)} download={profile.resume.filename}>
      <ArrowDownToLine size={15} />
      Download resume
    </a>
  );
}

// A screenshot when the project has one; otherwise a typeset card in one of the
// design's four tints, picked by the project's position so neighbours differ.
export function ProjectVisual({ project }: { project: Project }) {
  const tint = projects.indexOf(project) % 4;
  return (
    <div className={`project-visual visual-${tint}`} aria-hidden="true">
      {project.image ? (
        <img src={asset(project.image)} alt="" loading="lazy" />
      ) : (
        <>
          <span className="mini-caption">{project.category}</span>
          <span className="visual-label">{project.title}</span>
        </>
      )}
    </div>
  );
}

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <Link to={`/projects/${project.slug}`} className="project-card">
      <ProjectVisual project={project} />
      <div className="project-card-meta">
        <span className="eyebrow">
          {String(index + 1).padStart(2, "0")} / {project.category}
        </span>
        <ArrowUpRight size={19} />
      </div>
      <h2>{project.title}</h2>
      <p>{project.summary}</p>
      <div className="tags">
        {project.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </Link>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>
          {title}
          <span className="title-dot">.</span>
        </h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function NotFound() {
  return (
    <section className="not-found">
      <span className="eyebrow">404 / A small detour</span>
      <h1>
        Not quite <i>here.</i>
      </h1>
      <p>This page hasn’t found its place yet. Let’s get you back.</p>
      <div className="inline-actions">
        <Link className="button" to="/">
          Back home <ArrowRight size={16} />
        </Link>
        <Link className="text-link" to="/projects">
          Explore projects
        </Link>
      </div>
    </section>
  );
}
