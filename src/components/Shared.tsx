import { ArrowRight, ArrowUpRight, FileText, Mail } from "lucide-react";
import { Link } from "react-router";
import { asset, profile, projects, type Project } from "../data/portfolio";

export function ResumeLink({ className = "button" }: { className?: string }) {
  return (
    <a className={className} href={asset(profile.resume.path)} target="_blank" rel="noopener">
      <FileText size={15} />
      View resume
      <ArrowUpRight size={15} />
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

// lucide dropped brand icons, so GitHub and LinkedIn are their official marks.
const GitHubMark = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.27 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

const LinkedInMark = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
);

// Footer links: a small logo beside plain text, styled like the copyright line.
export function SocialLinks() {
  const links = [
    { label: "Resume", href: asset(profile.resume.path), icon: <FileText size={14} />, external: true },
    { label: "LinkedIn", href: profile.linkedin, icon: <LinkedInMark />, external: true },
    { label: "GitHub", href: profile.github, icon: <GitHubMark />, external: true },
    { label: "Email", href: `mailto:${profile.email}`, icon: <Mail size={14} />, external: false },
  ];
  return (
    <nav className="social-links" aria-label="Links">
      {links.map(({ label, href, icon, external }) => (
        <a
          key={label}
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {icon}
          {label}
        </a>
      ))}
    </nav>
  );
}
