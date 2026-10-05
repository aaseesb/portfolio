// Everything on the site comes from this file. Edit here, nowhere else.
//
// Anything left as an empty string "" is simply not rendered — no dead links,
// no empty boxes. Lines marked TODO are the only things still missing.

export const profile = {
  name: "Aasees Badesha",
  tagline: "Software engineer · Montreal & Toronto",
  summary:
    "Software engineering student at McGill focused on robotics and computer vision, with production full-stack experience. I like problems where the software has to meet something real — a camera, a motor, or a customer's checkout.",

  // The resume gets its own button — it's the thing a recruiter is here for.
  // Put resume.pdf in public/. Leave href empty to hide the button entirely.
  // The web copy of the resume — no phone number, since a PDF on a public URL
  // gets scraped. Keep the phone on the version you send to employers.
  resume: "/resume.pdf",

  links: [
    { label: "GitHub", href: "https://github.com/aaseesb" },
    { label: "LinkedIn", href: "https://linkedin.com/in/aasees-badesha" },
  ],
  email: "aaseesbadesha13@gmail.com",

  // The contact form at the bottom of the main page. Leave `formEndpoint` empty
  // and the form isn't rendered at all — the email button stands in for it.
  // To turn it on: make a free form at formspree.io (or web3forms.com), paste
  // the endpoint URL it gives you here, and confirm the address it emails you.
  // Nothing secret goes here; the endpoint is meant to be public.
  formEndpoint: "",

  // Grouped the way a resume groups them, so a recruiter scanning for one
  // language isn't reading a single long comma list. Add, rename or reorder
  // groups freely — the layout just renders whatever is here.
  //
  // Selecting a project lights up the entries it used and dims the rest, so
  // these strings have to match the `tech` arrays below exactly.
  skills: [
    { group: "Languages", items: ["Python", "Java", "C++", "TypeScript", "JavaScript", "SQL"] },
    { group: "Frameworks", items: ["React", "Next.js", "Flask", "Tailwind CSS"] },
    { group: "Machine vision", items: ["YOLO", "OpenCV"] },
    { group: "Platforms & tools", items: ["AWS", "Sanity", "Selenium", "Git"] },
  ],
};

export const education = {
  degree: "B.Eng. Software Engineering",
  org: "McGill University",
  dates: "Aug 2024 – Apr 2029",
  details: [
    "GPA 3.77 / 4.0",
    "Wadad Stamboulie Entrance Award",
  ],
};

// `orgNote` is a short flag on the role — "Internship", "Part-time",
// "Student team". It renders as a small pill beside the role, never as part of
// the employer's name, so the title can stay the title.
//
// `aside: true` moves a row out of the main timeline and into the side column
// on the main page, under "Other roles". It's for work that isn't engineering
// work: a recent one sitting at the top of the timeline would be the first
// thing a recruiter reads, ahead of the roles that actually make the case.
//
// Give a row `points` and it becomes clickable: the bullets unfold underneath.
// A row with no `points` stays plain text.
// `projectSlugs` lists projects to link to from the row, for a role that
// produced several of them (the freelance work).
// `projectSlug` instead makes the row open the matching project's panel.
export const experience = [
  {
    // Rows normally lead with the org. There's no employer here, so this one
    // flips: `leadWithTitle` puts the role on the big line and "Independent"
    // underneath where a company name would be.
    leadWithTitle: true,
    title: "Freelance Developer",
    org: "Independent",
    dates: "May 2025 – present",
    projectSlugs: ["books-galore", "shea-tree"],
    points: [
      "Build and ship production sites for small businesses and non-profits end to end — scoping, build, deploy, and handover.",
      "Clients include Books Galore and Save the Shea Tree — both in the projects.",
      "Available for freelance and contract work alongside full-time roles.",
    ],
  },
  {
    title: "Software Engineer (AI)",
    org: "Xsolla",
    orgNote: "Internship",
    dates: "Aug 2026 – present",
    points: [
      "Build internal applications and integrations against the company's APIs and SDKs.",
      "Shipped production apps in React with Neo4j and PostgreSQL behind them, used by hundreds of employees.",
    ],
  },
  {
    // Side column: the work here is content and markup upkeep rather than
    // engineering, so it reads better beside school than above Xsolla.
    aside: true,
    title: "Web Systems Assistant",
    org: "McGill Desautels",
    orgNote: "Part-time",
    dates: "May 2026 – present",
    points: [
      "Refactor legacy pages to clean, WCAG-compliant HTML.",
      "Mapped 100+ URLs and their metadata for a site migration, and documented the workflow so it could be repeated.",
    ],
  },
  {
    title: "Computer Vision Engineer",
    org: "McGill Aerial Design",
    orgNote: "Student team",
    dates: "Sep 2025 – May 2026",
    points: [
      "Built a YOLOv8 model in Python for autonomous target detection from the drone's camera.",
      "Tuned confidence thresholds and retrained on low-light and occluded samples to cut false positives in competition conditions.",
    ],
  },
  {
    title: "Software Engineer",
    org: "Anchor Repair Co.",
    orgNote: "Internship",
    dates: "May – Aug 2025",
    points: [
      "Built a Flask, SQL and React application that replaced paper client and service records.",
      "Deployed it on AWS EC2 and S3 with GitHub Actions CI/CD.",
      "Redesigned the UI and cut page load times by roughly 30%.",
    ],
  },
  {
    title: "Software Engineering Instructor",
    org: "City of Brampton",
    dates: "Sep 2023 – Aug 2024",
    points: [
      "Led 5+ STEM courses for over 100 students.",
      "Mentored 30+ student projects from idea to working demo.",
    ],
  },
];

// A club role, kept as its own list so the one-page summary can label it as
// leadership rather than filing it with the jobs. The main page's timeline
// merges it back in by date, so it still lands where it actually happened.
export const leadership = [
  {
    title: "Hackathon Director",
    org: "McGill Women in Computer Science (McWiCS)",
    dates: "Sep 2026 – present",
    points: [
      "TODO — one line on what you're running and at what scale.",
    ],
  },
];

// `engagement` is the credibility line in the panel — who it was for, what you
// were to them, and when. Leave it off for personal projects.
//
// `clip` is a demo video (muted, looping) and `image` is its poster frame.
// Give a project just an `image` for a still, or neither for a placeholder.
export const projects = [
  {
    slug: "argm",
    icon: "chess",
    name: "ARGM Chess Arm",
    badge: "personal project",
    blurb: "A camera watches a chessboard and plays back.",
    description:
      "ARGM — Artificial Robotic GrandMaster — is an autonomous chess robot. A YOLO-assisted pipeline locates the board, OpenCV warps it flat and splits it into 64 squares, and occupancy changes between frames are read as moves, validated, and handed to Stockfish — all coordinated by a finite state machine, with a live visualizer mirroring the physical game. The hard parts were the physical ones: shadows cast onto neighbouring squares, hands occluding the board mid-move, and wood grain under changing light. Board detection, move tracking and engine play work today; the Python-to-Arduino link and the arm itself are the next milestone.",
    tech: ["Python", "OpenCV", "YOLO", "C++"],
    repo: "https://github.com/ZawarG/ARGM-Robotic-Chess-Arm",
    demo: "",
    image: "/images/argm-board.jpg",
    clips: [
      { label: "Board detection", src: "/images/argm-board.mp4", poster: "/images/argm-board.jpg" },
      { label: "Occupancy", src: "/images/argm-occupancy.mp4", poster: "/images/argm-occupancy.jpg" },
      { label: "Visualizer", src: "/images/argm-visualizer.mp4", poster: "/images/argm-visualizer.jpg" },
    ],
  },
  {
    slug: "books-galore",
    icon: "book",
    name: "Books Galore",
    badge: "client work",
    engagement: {
      client: "Books Galore",
      role: "Front-end developer",
      period: "May – Dec 2025",
    },
    blurb: "A bookstore's storefront, rebuilt and automated.",
    description:
      "Re-architected the store from a WordPress and PHP monolith to a headless Next.js stack on Vercel with Sanity. Built an API that pulls from Google Books and Open Library to create products and fill in metadata and pricing automatically — around 500 hours of manual cataloguing that no longer happens — plus browsing and checkout with overdraft and oversell protection. The migration off WordPress is still in progress.",
    tech: ["Next.js", "React", "JavaScript", "Sanity", "Tailwind CSS"],
    repo: "",
    demo: "", // TODO — the store URL, once the migration is live.
    image: "",
    clip: "",
  },
  {
    slug: "shea-tree",
    icon: "leaf",
    name: "Save the Shea Tree",
    badge: "client work",
    engagement: {
      client: "Save the Shea Tree",
      role: "Full-stack engineer",
      period: "Jun – Aug 2026",
    },
    blurb: "A non-profit's site, editable by the people who run it.",
    description:
      "A responsive web app for a non-profit, built on a headless Sanity CMS so non-technical staff can publish and edit everything themselves without touching code or waiting on a developer. Live on a temporary deployment while the domain and the remaining sub-pages are finished.",
    tech: ["Next.js", "React", "Sanity", "Tailwind CSS"],
    repo: "",
    demo: "https://my-sanity-site-teal.vercel.app/", // Temporary — swap for the real domain.
    // A screenshot of the live homepage. Re-shoot it once the real domain and
    // the remaining sub-pages are up — see the README for the command.
    // `wide` gives it the 16:9 stage instead of the square one, so a site
    // screenshot isn't cropped down to its middle.
    wide: true,
    image: "/images/shea-tree.jpg",
    clip: "",
  },
  {
    slug: "swipeflix",
    icon: "film",
    name: "SwipeFlix",
    badge: "hackathon",
    blurb: "Tinder for movies, learning as you swipe.",
    description:
      "A movie recommender built at McGill CodeJam 15. Every swipe updates a Bayesian-style score over genres, actors, countries and decades, and the next pick mixes 90% exploitation with a decaying exploration rate — so it gets sharper the longer you use it, and tells you why it picked what it picked.",
    tech: ["Python", "Flask", "JavaScript", "Tailwind CSS"],
    repo: "https://github.com/aaseesb/SwipeFlix",
    demo: "https://devpost.com/software/swipeflix",
    image: "/images/swipeflix.jpg",
    clip: "/images/swipeflix.mp4",
  },
  {
    slug: "seat-alert",
    icon: "bell",
    name: "McGill Seat Alert",
    badge: "open source",
    blurb: "Watches for a seat in a full class and tells you.",
    description:
      "A course availability monitor for McGill's Visual Schedule Builder. Runs free on GitHub Actions every hour, filters by CRN, and alerts by email or phone push the moment a section frees up. An open-source contribution: rebuilt for the current VSB site with per-section filtering and new notification backends.",
    tech: ["Python", "Selenium", "Git"],
    repo: "https://github.com/aaseesb/McGill-Seat-Alert",
    demo: "",
    image: "",
    clip: "",
  },
  {
    slug: "tic-tac-toe-ml",
    icon: "grid",
    name: "Tic-Tac-Toe Q-Learning",
    badge: "personal project",
    blurb: "An agent that teaches itself tic-tac-toe.",
    description:
      "A reinforcement learning agent that learns tic-tac-toe from self-play, updating its Q-table with a value-iteration update and balancing exploration against exploitation with an epsilon-greedy strategy. Playable in the browser against the trained agent.",
    tech: ["Python", "Flask", "JavaScript"],
    repo: "https://github.com/aaseesb/Tic-Tac-Toe-ML",
    demo: "",
    image: "/images/tictactoe.jpg",
    clip: "/images/tictactoe.mp4",
  },
];

// The grass island on the main page (src/components/IslandHero.jsx) floats one
// block per project, in the order of `projects` above — reorder them and the
// island reorders with them. Which glyph a block shows comes from that
// project's `icon` field.

// What the bunny says. `idle` is the default; the rest are keyed by project slug.
export const bunnyLines = {
  idle: "I'm just a wooden bunny. Pick something up 🥕",
  argm: "It watches the board, picks a move, and is still waiting on its arm.",
  "books-galore": "Five hundred hours of typing, gone. Nobody misses them.",
  "shea-tree": "They edit it themselves now. No developer required.",
  swipeflix: "Swipe twice and it already has your number.",
  "tic-tac-toe-ml": "It beat itself a few thousand times until it got good.",
  "seat-alert": "Someone drops the class, your phone buzzes. Go register.",
};
