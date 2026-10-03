# Portfolio site — build spec

A recruiter-facing software engineering portfolio for Aasees Badesha.

## Goal

A single-page site that a recruiter can read in 40 seconds, with optional depth
behind one click. Visual personality comes from pre-rendered 3D stills in a
wooden-toy-diorama style — **those renders do not exist yet**. The site must look
complete and intentional without them.

## Critical constraint: the placeholder system

The 3D assets are being made later, one at a time, over weeks. Adding one must be
a **data change, not a code change**.

- Every visual is a `ProjectVisual` component reading an optional image path from
  `content.ts`.
- When the path is absent, it renders a styled placeholder: a soft rounded surface
  with the project name and a muted label. It must look deliberate, not broken.
- Placeholder and real image occupy identical dimensions. Filling one in must not
  reflow the page.
- Never hardcode an image path or a project name in a component.

## Stack

Next.js (App Router), TypeScript, Tailwind. Deployed on Vercel. No Three.js, no
React Three Fiber, no 3D libraries of any kind — all 3D is pre-rendered PNG/MP4.
No animation library unless something genuinely needs it; prefer CSS.

## Content model

Create `content.ts` as the single source of truth. Components import from it and
contain no literal content.

```ts
type Link = { label: string; href: string };

type Experience = {
  title: string;
  org: string;
  orgNote?: string;      // e.g. "student team", "volunteer"
  dates: string;
  projectSlug?: string;  // links this row to a project detail panel
};

type Project = {
  slug: string;
  name: string;
  badge?: string;        // e.g. "client work", "pro bono"
  blurb: string;         // one line, shown under the name in lists
  description: string;   // 2–3 sentences, shown in the detail panel
  tech: string[];
  demo?: string;
  repo?: string;
  image?: string;        // absent until the render exists
};
```

### Data to seed it with

```
profile
  name     Aasees Badesha
  tagline  Software engineering student · Montreal
  summary  TODO — 2 sentences, to be supplied
  links    Resume (TODO), GitHub (TODO), LinkedIn (TODO)

education
  B.Eng. Software Engineering · McGill University · expected April 2029

experience (newest first)
  Software Engineer Intern, AI   Xsolla                Aug 2026 – present
  Web Systems Assistant          McGill Desautels      May 2026 – present
  Computer Vision Engineer       McGill Aerial Design  Sep 2025 – May 2026   orgNote: student team
  Software Engineer Intern       Anchor Repair Co.     May – Aug 2025
  Front-End Developer            Books Galore          May – Dec 2025        orgNote: volunteer, projectSlug: books-galore

projects
  argm          ARGM                 badge: —            tech: Python, OpenCV, C++
  shea-tree     Save the Shea Tree   badge: pro bono     tech: Next.js, Sanity, Vercel
  books-galore  Books Galore         badge: client work  tech: JavaScript, PHP, WooCommerce
  seat-alert    McGill Seat Alert    badge: —            tech: Python
```

Blurbs, descriptions, demo and repo URLs are TODO — leave clearly marked
placeholder strings. Do not invent them.

## Layout

Two columns on desktop. Each column has exactly one job.

**Left — who and where**
1. Name, tagline
2. Summary (2 sentences)
3. Tech line — plain comma-separated text, not chips or pills
4. Links — underlined text, not buttons: Resume · GitHub · LinkedIn
5. Education — one line
6. Experience — bordered rows, no bullet points. Title, then org · dates muted
   underneath. Rows with a `projectSlug` are clickable.

**Right — what was built**
- Centre: hero visual, 180–200px square
- Around it: four project blocks, each a small card with a thumbnail area, the
  project name, and the badge in muted text underneath

Resist adding sections. Density is the main design risk here.

## Interaction

Single piece of state: `selectedSlug: string | null`.

- `null` → right panel shows the hero visual with the four project blocks around it
- a slug → right panel is replaced by that project's detail: visual, name, badge,
  description, tech tags, then Demo and Code buttons side by side. Close button
  top right.
- Clicking a project block, or an experience row with a `projectSlug`, sets it.
  Both routes open the same panel.
- The matching left-column item gets a selected state.
- Omit the Demo or Code button entirely when the URL is absent. Never render a
  dead link.

**Sync to the URL** as `?p=<slug>` via `useSearchParams` so a project is directly
linkable and the back button works.

## Responsive

Below 768px, single column in this order: name, tagline, summary, tech line,
links, hero (static image, never video), projects as a plain 2×2 grid, education,
experience. The floating arrangement is desktop-only.

## Accessibility and motion

- Project blocks are real `<button>` elements with `aria-label`, reachable by
  keyboard, with a visible focus ring.
- The float animation goes on an inner wrapper so focus outlines don't move.
- Everything animated is wrapped in `@media (prefers-reduced-motion: no-preference)`.
- Hero `<video>` gets `autoplay muted loop playsinline` and a `poster` image; the
  poster alone is shown on mobile and under reduced motion.
- Verify contrast in both light and dark if a dark mode is added.

## Creative details

In priority order. The first two matter most.

1. **Staggered float.** Each project block drifts vertically on a 6–8s loop with a
   different delay and duration. Transform only, compositor-friendly. This is what
   makes the page feel alive before any render exists.
2. **Tech-line highlighting.** When a project is selected, technologies in the
   left-column tech line that appear in that project's `tech` array are emphasized
   and the rest dim slightly. Connects the two columns and shows which skills map
   to which work without extra copy.
3. **Hover as a physical nudge.** Blocks respond with a slight rotate and scale
   rather than a lift-and-glow — toy object, not web card.
4. **Mouse parallax on the hero.** Small `rotateX`/`rotateY` from cursor position,
   capped at ~6°, eased. Desktop only, disabled under reduced motion.
5. **Detail panel as a workbench.** The selected project's visual sits on a subtle
   surface with a soft contact shadow, as if the object were set down.

Explicitly not wanted: scroll-jacking, page transition animations, sound, custom
cursors, typewriter effects.

## Build order

1. `create-next-app`, deploy to Vercel, confirm the domain resolves
2. `content.ts` with the data above
3. Static two-column layout, all placeholders, no interactivity
4. `selectedSlug` state and the panel swap, then URL sync
5. Responsive, accessibility, reduced-motion
6. Creative details 1 and 2, then 3–5 if they earn their place

Each step should be independently deployable.

## Known open questions

- Books Galore appears in both experience and projects. This is intentional — the
  clickable row makes them two doors to one panel. If it reads as repetitive once
  built, the experience row is the one to cut.
- Floating blocks may feel cluttered in practice. Build them as a plain 2×2 grid
  first and switch to the floating arrangement only if the grid feels flat. Same
  markup, different CSS.
