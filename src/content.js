// Everything on the site comes from this file. Edit here, nowhere else.
//
// Anything left as an empty string "" is simply not rendered — no dead links,
// no empty boxes. Lines marked TODO are the only things still missing.

export const profile = {
  name: "Aasees Badesha",
  tagline: "Software engineer · Montreal & Toronto",
  summary:
    "Software Engineering student with production full-stack and AI experience, building computer vision and robotics software.",

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
  contactTitle: "Get in touch",
  lookingFor: "I'm looking for internships in robotics, computer vision and full-stack work.",

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
    { group: "Languages", items: ["C++", "Python", "Rust", "TypeScript", "Java", "SQL", "Bash"] },
    { group: "Frameworks", items: ["React", "Next.js", "Node.js", "FastAPI"] },
    { group: "Tools & cloud", items: ["PostgreSQL", "Docker", "Google Cloud Run", "GitHub Actions", "Appium", "Linux"] },
    { group: "Robotics & vision", items: ["ROS 2", "OpenCV", "YOLO", "Arduino"] },
  ],
};

export const education = {
  degree: "B.Eng. Software Engineering",
  org: "McGill University",
  dates: "Aug 2024 – Apr 2029",
  details: [
    "Wadad Stamboulie Entrance Award",
    "GPA 3.77 / 4.0",
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
    title: "Full-Stack Engineer",
    org: "Freelance",
    dates: "May 2025 – Aug 2026",
    projectSlugs: ["books-galore", "shea-tree"],
    points: [
      "Built an API that automated product creation for 650 books on Books Galore\u2019s new Next.js and Sanity storefront by pulling metadata and pricing from the Google Books and Open Library APIs, cutting listing time from ~40 minutes to seconds per product.",
      "Consulted Save the Shea Tree on their site architecture, then built it with Next.js and a headless Sanity CMS.",
    ],
  },
  {
    title: "AI Software Engineer",
    org: "Xsolla",
    orgNote: "Internship",
    dates: "Aug 2026 – present",
    points: [
      "Built the all-in-one platform for Xsolla\u2019s 100-person AI internship program, used by ~200 interns, mentors, and project owners across 9 offices (React, TypeScript, Node.js, PostgreSQL).",
      "Owned the platform as a project admin: led 4 intern developers and triaged and fixed bugs from interns, mentors, and VPs.",
      "Added a customizable LLM assistant that answers users\u2019 questions about any part of the platform, from onboarding and project matching to reviews and delivery tracking.",
      "Integrated a configurable Slack notification system with per-notification schedules, recipient lists, and manual send backups (Google Cloud Run), doubling weekly progress-report submissions from 148 interns and mentors.",
      "Designed a company-wide AI-assisted hiring platform that screens and scores Lever applicants, currently driving the 30-intern hiring push for a newly launched office, with role- and region-based access enforced through PostgreSQL row-level security.",
      "Extended an AI agent that plays 34 mobile games for monetization research from Android to iPhones on a 12-device farm (Python, Appium), and built a human review tool that creates its evaluation dataset.",
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
      "Refactored legacy web pages to meet WCAG accessibility standards, and mapped 1000+ URLs for a site migration.",
    ],
  },
  {
    title: "STEM Instructor",
    org: "City of Brampton",
    dates: "Sep 2023 – Aug 2024",
    points: [
      "Taught 6 STEM programs, from early-years robotics to high-school full-stack development, to 200+ students, and mentored 30+ projects.",
    ],
  },
];

// A club role, kept as its own list so the one-page summary can label it as
// leadership rather than filing it with the jobs. The main page's timeline
// merges it back in by date, so it still lands where it actually happened.
export const leadership = [
  {
    title: "Hackathon Director",
    org: "McGill Women in Computer Science",
    dates: "Sep 2026 – present",
    points: [
      "Directing the annual hackathon with an expected 150 participants, and secured sponsorships from Google DeepMind and Squarepoint.",
    ],
  },
];

// `engagement` is the credibility line in the panel — who it was for, what you
// were to them, and when. Leave it off for personal projects.
//
// `video` is an optional link to a full-length video; it shows up as a door in
// the project's room, next to `repo` and `demo`.
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
      "An autonomous chess robot. OpenCV and YOLO localize the board and classify occupancy of all 64 squares from HSV colour statistics, confirming moves by majority vote across 17 frames, including castling, en passant and promotion. Stockfish generates the replies, and a ROS 2 architecture turns them into ordered pick-and-place steps. Arm actuation, with Arduino (C++) firmware and a Rust serial driver, is in progress.",
    tech: ["Python", "OpenCV", "YOLO", "C++", "Rust", "ROS 2", "Arduino"],
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
      "Rebuilt a bookstore's WordPress and PHP site as a headless Next.js and Sanity stack. An API pulls each book's metadata and pricing from the Google Books and Open Library APIs, automating product creation for 650 books and cutting listing time from ~40 minutes to seconds per product.",
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
      "A responsive site for a non-profit, built on Sanity so non-technical staff can publish and edit everything themselves. Live on a temporary deployment while the domain and remaining pages are finished.",
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
      "A movie recommender from McGill CodeJam 15. Every swipe updates a score over genres, actors and decades, so the picks get sharper the longer you use it — and it tells you why it chose each one.",
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
      "Watches McGill's Visual Schedule Builder for an open seat and alerts you by email or phone push. Runs free on GitHub Actions every hour. An open-source contribution, rebuilt for the current site.",
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
      "A reinforcement learning agent that teaches itself tic-tac-toe through self-play. Playable in the browser against the trained agent.",
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
  "books-galore": "650 books listed automatically. Nobody misses the typing.",
  "shea-tree": "They edit it themselves now. No developer required.",
  swipeflix: "Swipe twice and it already has your number.",
  "tic-tac-toe-ml": "It beat itself a few thousand times until it got good.",
  "seat-alert": "Someone drops the class, your phone buzzes. Go register.",
};

// The game. Each project's level is themed by a treat to collect, and the
// gatekeeper bunny says a line when fed. Nothing about the game lives in the
// components — add a project and give it a treat here.
// The interactive tour: the bunnies drag in one section of the page at a time,
// and a treat fed to the bunny sends it off for the next.
export const tour = {
  // Four scenes. `sky` is the palette the sky settles on; `next` names the scene
  // the Next treat leads to. Each scene's text lives in cards.jsx.
  scenes: [
    { key: "hello", label: "Hello", next: "my work", sky: 0 },
    { key: "village", label: "Work", next: "my path", sky: 1 },
    { key: "path", label: "Path", next: "the finish", sky: 2 },
    { key: "end", label: "Finish", sky: 4 },
  ],
  titles: {
    contact: "Say hi",
    experience: "Experience",
    education: "School & other roles",
    leadership: "Leadership",
    finish: "Thank you for visiting",
  },
  village: {
    hint: "Hover a house to see what it's built with",
    cloudsLabel: "Skills",
  },
  yum: "Yum!",
  hint: "Press the treats to go back or forward",
  scroll: "Scroll down",
  back: "Back",
  backTo: (label) => `Back: ${label}`,
  goTo: (label) => `Go to ${label}`,
  demos: "Demo views",
  next: (label) => `Next: ${label}`,
  last: "See the summary",
  open: "Open",
  room: {
    outside: "Back outside",
    backTo: (name) => `Back to ${name}`,
    trailHome: "Outside",
    trail: "Rooms you have walked through",
    walkIn: "walk in",
    leaves: "new tab ↗",
    site: "Visit site",
    code: "GitHub",
    video: "Full video",
    leave: "Leave the house",
  prev: (name) => `Previous project${name ? `: ${name}` : ""}`,
  next: (name) => `Next project${name ? `: ${name}` : ""}`,
  },
  clickHouse: "Click the house to look inside",
  openLabel: (name) => `Open ${name}`,
  close: "Close",
  tech: "Built with",
  pointsTitle: "What I did",
  sceneOf: (n, of, label) => `Scene ${n} of ${of}: ${label}`,
  summary: "See the summary",
  noGl: "Your browser can't draw the 3D island, so here is the plain version.",
};
