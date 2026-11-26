// Everything the site says lives in this file. Edit here, nowhere else.
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

// Every image in src/assets/logos/, keyed by file name without its extension:
// `src/assets/logos/xsolla.png` becomes `logos.xsolla`. Vite bundles each one
// and gives back its URL, so a missing file is just `undefined`, never a 404.
const logos = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>("../assets/logos/*.{svg,png,webp,jpg,jpeg}", {
      eager: true,
      import: "default",
    }),
  ).map(([path, url]) => [path.split("/").pop()!.replace(/\.\w+$/, ""), url]),
);

export const profile = {
  name: "Aasees Badesha",
  initials: "AB",
  eyebrow: "Software engineer · Montreal, Toronto",
  descriptor:
    "I build software that sees and moves: computer vision, robotics, and full-stack.",
  aboutTitle: ["Robots, books,", "and Lulu"],
  biography: [
    "I’m Aasees, a Software Engineering student at McGill. I like problems where code has to deal with the real world: a camera that has to find a chessboard under bad lighting, or an arm that has to put a piece down exactly where it should go.",
    "Right now I’m an AI Software Engineer intern at Xsolla, building the platform that runs their 100-person AI internship program, and I’m directing this year’s McGill Women in Computer Science hackathon.",
    "Outside of work, I’m usually reading, or spending time with my rabbit, Lulu, who supervises most of my debugging.",
  ],
  // Paths are relative to public/. Leave undefined to show the placeholder frame.
  portrait: undefined as string | undefined,
  rabbit: "images/bunny-study.jpg" as string | undefined,
  github: "https://github.com/aaseesb",
  linkedin: "https://linkedin.com/in/aasees-badesha",
  email: "aaseesbadesha13@gmail.com",
  lookingFor: "Looking for internships in robotics, computer vision and full-stack work.",
  resume: { path: "resume.pdf", filename: "Aasees-Badesha-Resume.pdf" },
};

export interface Experience {
  id: string;
  role: string;
  organization: string;
  // The logo image: a file in src/assets/logos/ (see `logos` above), or any
  // `import myLogo from "../assets/....png"`. Without one, the tile shows the
  // organization's initials.
  logo?: string;
  // For a role done for several clients: each gets its own logo in the
  // "Worked with" strip, all pointing at this one role.
  clients?: { name: string; logo?: string }[];
  start: string;
  end?: string;
  dates: string;
  type: string;
  // Education and Leadership entries get their own headed timelines.
  section?: "Leadership" | "Education";
  bullets: string[];
}

// Shown in the order written here: strongest role first.
export const experiences: Experience[] = [
  {
    id: "xsolla",
    logo: logos.xsolla,
    role: "AI Software Engineer",
    organization: "Xsolla",
    start: "2026-08-01",
    dates: "Aug 2026 — Present",
    type: "Internship",
    bullets: [
      "Built the all-in-one platform for a 100-person AI internship program, used by ~200 interns, mentors and project owners across 9 offices (React, TypeScript, Node.js, PostgreSQL).",
      "Own the platform as project admin: lead 4 intern developers and triage bugs reported by interns, mentors and VPs.",
      "Added a customizable LLM assistant that answers questions about any part of the platform, from onboarding and project matching to reviews and delivery tracking.",
      "Integrated configurable Slack notifications with per-message schedules and recipient lists on Google Cloud Run, doubling weekly progress-report submissions.",
      "Designed an AI-assisted hiring platform that screens and scores Lever applicants for a new office’s 30-intern hiring push, with role- and region-based access enforced by PostgreSQL row-level security.",
      "Extended an AI agent that plays 34 mobile games for monetization research from Android to iOS on a 12-device farm (Python, Appium), and built the human review tool that creates its evaluation dataset.",
    ],
  },
  {
    id: "wics",
    logo: logos.mcwics,
    role: "Hackathon Director",
    organization: "McGill Women in Computer Science",
    start: "2026-09-01",
    dates: "Sep 2026 — Present",
    type: "Student club",
    section: "Leadership",
    bullets: [
      "Directing the hackathon for an expected 150 participants.",
      "Secured sponsorships from Google DeepMind and Squarepoint.",
    ],
  },
  {
    id: "desautels",
    logo: logos.desautels,
    role: "Web Systems Assistant",
    organization: "McGill Desautels Faculty of Management",
    start: "2026-05-01",
    dates: "May 2026 — Present",
    type: "Part-time",
    bullets: [
      "Refactored legacy pages to meet WCAG accessibility standards.",
      "Mapped 1,000+ URLs for the faculty’s site migration.",
    ],
  },
  {
    id: "freelance",
    role: "Full-Stack Engineer",
    organization: "Freelance",
    clients: [
      { name: "Books Galore", logo: logos["books-galore"] },
      { name: "Save the Shea Tree", logo: logos["shea-tree"] },
    ],
    start: "2025-05-01",
    end: "2026-08-01",
    dates: "May 2025 — Aug 2026",
    type: "Client work",
    bullets: [
      "Built an API that automated product creation for 650 books on Books Galore’s new Next.js and Sanity storefront, pulling metadata and pricing from Google Books and Open Library and cutting listing time from ~40 minutes to seconds per product.",
      "Advised Save the Shea Tree on their site architecture, then built it with Next.js and a headless Sanity CMS so their staff can edit everything themselves.",
    ],
  },
  {
    id: "mcgill",
    logo: logos.mcgill,
    role: "B.Eng. Software Engineering",
    organization: "McGill University",
    start: "2024-08-01",
    end: "2029-04-01",
    dates: "2024 — 2029",
    type: "Education",
    section: "Education",
    bullets: ["GPA 3.77 / 4.0", "Wadad Stamboulie Entrance Award"],
  },
  {
    id: "brampton",
    logo: logos.brampton,
    role: "STEM Instructor",
    organization: "City of Brampton",
    start: "2023-09-01",
    end: "2024-08-01",
    dates: "Sep 2023 — Aug 2024",
    type: "Teaching",
    bullets: [
      "Taught 6 STEM programs, from early-years robotics to high-school full-stack development, to 200+ students.",
      "Mentored 30+ student projects.",
    ],
  },
];

export interface Project {
  slug: string;
  title: string;
  category: string;
  summary: string;
  tags: string[];
  year?: string;
  role: string;
  image?: string;
  clips?: { label: string; src: string; poster: string }[];
  youtube?: string; // video id, shown in the hero instead of the image
  sections: { title: string; body: string }[];
  source?: string;
  demo?: string;
  play?: string; // in-site route for a playable demo
}

export const projects: Project[] = [
  {
    slug: "argm",
    title: "ARGM Chess Arm",
    category: "Robotics",
    summary: "A camera watches a real chessboard, and a robot arm plays back.",
    tags: ["Python", "OpenCV", "YOLO", "ROS 2", "C++", "Rust", "Arduino"],

    role: "Computer vision & robotics",
    image: "images/argm-board.jpg",
    clips: [
      { label: "Visualizer", src: "images/argm-visualizer.mp4", poster: "images/argm-visualizer.jpg" },
      { label: "Occupancy", src: "images/argm-occupancy.mp4", poster: "images/argm-occupancy.jpg" },
      { label: "Board detection", src: "images/argm-board.mp4", poster: "images/argm-board.jpg" },
    ],
    source: "https://github.com/ZawarG/ARGM-Robotic-Chess-Arm",
    sections: [
      {
        title: "Seeing the board",
        body: "OpenCV and YOLO find the board, then classify all 64 squares as empty or occupied from HSV colour statistics. A move only counts once it survives a majority vote across 17 frames, which is what lets it handle castling, en passant and promotion without false alarms.",
      },
      {
        title: "Playing back",
        body: "Stockfish picks the reply, and a ROS 2 architecture breaks it into ordered pick-and-place steps for the arm.",
      },
      {
        title: "Where it stands",
        body: "Vision and move logic work end to end. Arm actuation, with Arduino (C++) firmware and a Rust serial driver, is in progress.",
      },
    ],
  },
  {
    slug: "expressive-lamp",
    title: "Expressive Lamp",
    category: "Robotics",
    summary: "A desk lamp robot that notices when you look at it.",
    tags: ["Python", "MediaPipe", "MuJoCo"],
    role: "Software & computer vision",
    source: "https://github.com/aaseesb/LeLamp-SW-CV-Hiring-Challenge",
    sections: [
      {
        title: "What it does",
        body: "MediaPipe tracks your face and gaze to work out whether you’re paying attention, and a behaviour manager decides how the lamp should react, simulated in MuJoCo on an open-source lamp model.",
      },
      {
        title: "Where it stands",
        body: "Perception and behaviour work end to end. Memory and conversation are in progress.",
      },
    ],
  },
  {
    slug: "books-galore",
    title: "Books Galore",
    category: "Client work",
    summary: "A bookstore’s storefront, rebuilt and automated.",
    image: "images/books-galore.jpg",
    tags: ["Next.js", "React", "Sanity", "Tailwind CSS"],
    year: "2025",
    role: "Front-end developer",
    sections: [
      {
        title: "The problem",
        body: "The store ran on an aging WordPress and PHP site, and every new book took about 40 minutes to list by hand.",
      },
      {
        title: "What I built",
        body: "A headless Next.js and Sanity storefront, plus an API that pulls each book’s metadata and pricing from the Google Books and Open Library APIs.",
      },
      {
        title: "The outcome",
        body: "Product creation is automated for 650 books, and listing time dropped from ~40 minutes to seconds per product.",
      },
    ],
  },
  {
    slug: "shea-tree",
    title: "Save the Shea Tree",
    category: "Client work",
    summary: "A non-profit’s site, editable by the people who run it.",
    tags: ["Next.js", "React", "Sanity", "Tailwind CSS"],
    year: "2026",
    role: "Full-stack engineer",
    image: "images/shea-tree.jpg",
    demo: "https://my-sanity-site-teal.vercel.app/",
    sections: [
      {
        title: "The brief",
        body: "A small non-profit needed a site their non-technical staff could keep up to date without calling a developer.",
      },
      {
        title: "What I built",
        body: "I consulted on the site architecture, then built a responsive Next.js site on Sanity, so staff can publish and edit every page themselves.",
      },
      {
        title: "Where it stands",
        body: "Live on a temporary deployment while the domain and remaining pages are finished.",
      },
    ],
  },
  {
    slug: "nana",
    title: "Nana",
    category: "Machine learning",
    summary: "Screening EEG recordings for signs of Alzheimer’s.",
    tags: ["Python", "XGBoost", "scikit-learn", "Flask", "React"],
    year: "2026",
    role: "PharmaHacks 2026 · model training",
    image: "images/nana.jpg",
    youtube: "tJms2QI5cpU",
    source: "https://github.com/jennysaad/Nana",
    demo: "https://devpost.com/software/nana-cxato3",
    sections: [
      {
        title: "The idea",
        body: "Upload a patient’s EEG recording and Nana predicts whether it looks like Alzheimer’s or a healthy control, built in a team of four.",
      },
      {
        title: "The model",
        body: "I worked on training and evaluation: 30-second windows from 19 electrodes become 380 features (band powers and coherence between channels). We compared CatBoost, Random Forest, XGBoost and LightGBM, and XGBoost won.",
      },
      {
        title: "Keeping it honest",
        body: "Splits are grouped by subject so no person appears in both training and validation, and each subject’s windows are combined by majority vote.",
      },
    ],
  },
  {
    slug: "swipeflix",
    title: "SwipeFlix",
    category: "Hackathon",
    summary: "Tinder for movies, learning as you swipe.",
    tags: ["Python", "Flask", "JavaScript", "Tailwind CSS"],
    year: "2025",
    role: "McGill CodeJam 15",
    image: "images/swipeflix.jpg",
    clips: [{ label: "Demo", src: "images/swipeflix.mp4", poster: "images/swipeflix.jpg" }],
    source: "https://github.com/aaseesb/SwipeFlix",
    demo: "https://swipeflix.aasees.dev",
    sections: [
      {
        title: "The idea",
        body: "Picking a movie takes longer than watching one. SwipeFlix turns it into a few quick swipes.",
      },
      {
        title: "How it works",
        body: "Every swipe updates a score over genres, actors and decades, so recommendations sharpen the longer you use it, and each pick comes with the reason it was chosen.",
      },
    ],
  },
  {
    slug: "seat-alert",
    title: "McGill Seat Alert",
    category: "Open source",
    summary: "Watches a full class and tells you when a seat opens.",
    tags: ["Python", "Selenium", "GitHub Actions"],

    role: "Contributor",
    source: "https://github.com/aaseesb/McGill-Seat-Alert",
    sections: [
      {
        title: "What it does",
        body: "Checks McGill’s Visual Schedule Builder for an open seat and alerts you by email or phone push.",
      },
      {
        title: "How it runs",
        body: "Free, every hour, on GitHub Actions. An open-source project I rebuilt to work with the current site.",
      },
    ],
  },
  {
    slug: "tic-tac-toe-ml",
    title: "Tic-Tac-Toe Q-Learning",
    category: "Machine learning",
    summary: "An agent that teaches itself tic-tac-toe.",
    tags: ["Python", "Flask", "JavaScript"],

    role: "Personal project",
    image: "images/tictactoe.jpg",
    clips: [{ label: "Demo", src: "images/tictactoe.mp4", poster: "images/tictactoe.jpg" }],
    demo: "https://tictactoe.aasees.dev",
    source: "https://github.com/aaseesb/Tic-Tac-Toe-ML",
    sections: [
      {
        title: "The idea",
        body: "A reinforcement learning agent that learns tic-tac-toe from nothing, purely through self-play.",
      },
      {
        title: "Try it",
        body: "The trained agent is playable in the browser, so you can see how well it learned.",
      },
    ],
  },
  {
    slug: "bookscout",
    title: "BookScout",
    category: "Web app",
    summary: "Type a title, get everything about the book.",
    tags: ["Python", "Flask", "JavaScript"],
    year: "2025",
    role: "Built with Zawar",
    image: "images/bookscout.jpg",
    clips: [{ label: "Demo", src: "images/bookscout.mp4", poster: "images/bookscout.jpg" }],
    source: "https://github.com/ZawarG/BookScout",
    sections: [
      {
        title: "What it does",
        body: "Combines Google Books (author, description, pages) with Open Library (genres, first publication year) and a cover API into one page. No exact match? It shows the five closest.",
      },
    ],
  },
  {
    slug: "soundwave",
    title: "SoundWave",
    category: "Web app",
    summary: "Search any song and play it right there.",
    tags: ["Python", "Flask", "yt-dlp"],
    role: "Personal project",
    image: "images/soundwave.jpg",
    clips: [{ label: "Demo", src: "images/soundwave.mp4", poster: "images/soundwave.jpg" }],
    source: "https://github.com/aaseesb/SoundWave",
    sections: [
      {
        title: "What it does",
        body: "Searches the iTunes and Deezer APIs for songs, then streams playback through yt-dlp.",
      },
    ],
  },
  {
    slug: "penguin-run",
    title: "Penguin Run",
    category: "Game",
    summary: "A two-player puzzle platformer.",
    tags: ["Java"],
    role: "Grade 11 project",
    image: "images/penguin-run.jpg",
    clips: [{ label: "Gameplay", src: "images/penguin-run.mp4", poster: "images/penguin-run.jpg" }],
    source: "https://github.com/aaseesb/Penguin-Run",
    sections: [
      {
        title: "The game",
        body: "Two players share one keyboard, one on the arrow keys and one on W/A/D, and both penguins have to reach the igloo while dodging spikes.",
      },
      {
        title: "The puzzles",
        body: "Push a button, or slide an ice block onto it, to lower the ice wall. A pink-only button boosts jump height. Fewer frames means a better score, saved to a leaderboard.",
      },
      {
        title: "How it’s built",
        body: "Plain Java Swing: a custom paint loop, gravity and jump physics, and rectangle collision checks.",
      },
    ],
  },
];
