// A dropdown under a role that lists the projects it produced, so the work can
// be seen where the claim is made without taking you away from the page.
// Closed it is one line; open it is a strip of cards you can scroll sideways.
// "More info" is the only thing that moves you, and only if you ask: it hands
// the slug to `onOpen`, which each page uses to take you to the full project.
import { useState } from "react";
import { projects } from "../content.js";
import ProjectVisual from "./ProjectVisual.jsx";

export default function ClientWork({ slugs, onOpen, label = "Client work" }) {
  const [open, setOpen] = useState(false);
  const items = slugs.map((s) => projects.find((p) => p.slug === s)).filter(Boolean);
  if (!items.length) return null;
  return (
    <div className={`cw${open ? " is-open" : ""}`}>
      <button className="cw-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {label}
        <span className="cw-chevron" aria-hidden="true">›</span>
      </button>
      {open && (
        <ul className="cw-strip">
          {items.map((p) => (
            <li className="cw-card" key={p.slug}>
              <ProjectVisual name={p.name} icon={p.icon} image={p.image} />
              {p.badge && <span className="cw-tag">{p.badge}</span>}
              <p className="cw-name">{p.name}</p>
              {p.engagement && (
                <p className="cw-meta">{p.engagement.role} · {p.engagement.period}</p>
              )}
              <p className="cw-blurb">{p.blurb}</p>
              <button className="cw-more" onClick={() => onOpen(p.slug)}>More info →</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
