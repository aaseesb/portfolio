// Everything the site says lives in this file. Edit here, nowhere else.
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export const profile = {
  name: "Aasees Badesha",
  initials: "AB.",
  eyebrow: "Software engineer · Montreal, Toronto",
  descriptor:
    "I build software that sees and moves: computer vision, robotics, and the full-stack tools around them.",
  aboutTitle: ["Robots, books,", "and Lulu."],
  biography: [
    "I’m Aasees, a Software Engineering student at McGill. I like problems where code has to deal with the real world: a camera that has to find a chessboard under bad lighting, or an arm that has to put a piece down exactly where it should go.",
    "Right now I’m an AI Software Engineer intern at Xsolla, building the platform that runs their 100-person AI internship program, and I’m directing this year’s McGill Women in Computer Science hackathon.",
    "Outside of work, I’m usually reading, or spending time with my rabbit, Lulu, who supervises most of my debugging.",
  ],
  // Paths are relative to public/. Leave undefined to show the placeholder frame.
  portrait: undefined as string | undefined,
  rabbit: "images/bunny-stand.jpg" as string | undefined,
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
  start: string;
  end?: string;
  dates: string;
  type: string;
  section?: "Leadership" | "Education";
  bullets: string[];
}

// Shown in the order written here: strongest role first.
export const experiences: Experience[] = [
  {
    id: "xsolla",
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
    role: "Software Engineering",
    organization: "McGill University",
    start: "2024-08-01",
    end: "2029-04-01",
    dates: "2024 — 2029",
    type: "B.Eng.",
    section: "Education",
    bullets: ["GPA 3.77 / 4.0", "Wadad Stamboulie Entrance Award"],
  },
  {
    id: "brampton",
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
];
