// The resume, email and profile links, as one row of buttons. Both the summary
// footer and the tour's last scene use it; the tour's first scene scatters the
// same list with contactLinks().
import { profile } from "../content.js";

export const contactLinks = () => [
  profile.resume && { label: "Resume", href: profile.resume, primary: true },
  profile.email && { label: "Email", href: `mailto:${profile.email}` },
  ...profile.links,
].filter(Boolean);

export default function ContactLinks({ className = "" }) {
  return (
    <p className={`contact-links ${className}`}>
      {contactLinks().map((l) => (
        <a key={l.label} className={`btn${l.primary ? " primary" : ""}`} href={l.href} target="_blank" rel="noopener">{l.label}</a>
      ))}
    </p>
  );
}
