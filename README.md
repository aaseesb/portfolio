# Portfolio

Personal portfolio site built with React + Vite. No animation library — the
motion is plain CSS.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Edit your content

Everything you'd normally change lives in **`src/content.js`** — your name,
links, tech line, education, experience, projects, and the bunny's lines. You
shouldn't need to touch any other file to keep the site up to date.

- **Resume:** put `resume.pdf` in the `public/` folder.
- **Project visuals:** put images in `public/images/` and set a project's
  `image` field to `"/images/your-file.png"`. Until you do, the site shows a
  deliberate placeholder at exactly the same size, so filling one in never
  shifts the layout.
- **Demos:** a project's `clip` field is a muted, looping video played in the
  detail panel, with `image` as its poster frame. For a project with several
  clips, use `clips: [{ label, src, poster }]` instead and the panel shows a row
  of step buttons. To turn a screen recording or a README GIF into one:

  ```bash
  ffmpeg -i demo.gif -vf "scale=800:-2,fps=15" -pix_fmt yuv420p -crf 30 -an public/images/demo.mp4
  ffmpeg -i demo.gif -vf "select=eq(n\,0),scale=800:-2" -vframes 1 -q:v 4 public/images/demo.jpg
  ```

  For a **live site**, grab a still with headless Chrome instead — that's how
  the Save the Shea Tree image is made:

  ```bash
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
    --hide-scrollbars --virtual-time-budget=12000 --window-size=1280,720 \
    --screenshot=page.png https://example.com
  ffmpeg -i page.png -vf "scale=640:-2" -q:v 5 public/images/site.jpg
  ```

- **Links:** an empty `href` is simply omitted — no dead links on the page.
  Same for a project's `demo` and `repo`.

## How it works

There are two views onto the same content. The main page is the long scrolling
one: an intro, the island with a project window beside it, a rail of project
cards, and a timeline of experience. The toggle in the corner switches to the
one-page summary — everything at once, in two columns, the way a recruiter
skimming for thirty seconds wants it.

Both views run on one piece of state: which project is selected. It drives the
island, the detail panel, the bunny's line, and `?p=<slug>` in the URL, so
projects are linkable and the back button works. `?view=summary` links the
summary view.

| File | Purpose |
| --- | --- |
| `src/content.js` | All your content. Edit this. |
| `src/App.jsx` | The two views, selection state, URL sync. |
| `src/components/LandingPage.jsx` | The main page: intro, island + project window, card rail, timeline. |
| `src/components/OnePage.jsx` | The one-page summary: two columns, everything at once. |
| `src/components/IslandHero.jsx` | The grass island you can drag to turn, with a floating button per project. |
| `src/components/ProjectVisual.jsx` | One visual box — demo clip, still image, or placeholder. |
| `src/components/ProjectIcon.jsx` | The glyphs the floating blocks use, keyed by each project's `icon` field. |
| `src/components/Reveal.jsx` | Fades a block in the first time you scroll to it. |
| `src/components/ToyBunny.jsx` | The bunny and its speech bubble. |
| `src/components/BunnySvg.jsx` | The bunny artwork. |
| `src/styles.css` | Theme colors, layout, and all the motion. |

Both themes are supported; the toggle is top-right and the choice is
remembered. All animation is wrapped in `prefers-reduced-motion`.

## Deploy

**Vercel** (recommended): push to GitHub, import the repo at vercel.com, accept
the detected Vite settings.

**GitHub Pages:** set `base: "/repo-name/"` in `vite.config.js`, run
`npm run build`, and publish the `dist/` folder.
