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

The whole page runs on one piece of state: which project is selected. Selecting
one swaps the right column for a detail panel, lights up that project's
technologies in the tech line, changes the bunny's line, and puts `?p=<slug>` in
the URL so projects are linkable and the back button works.

| File | Purpose |
| --- | --- |
| `src/content.js` | All your content. Edit this. |
| `src/App.jsx` | Layout, selection state, URL sync. |
| `src/components/ProjectVisual.jsx` | One visual box — real image or placeholder. |
| `src/components/HeroParallax.jsx` | Cursor tilt on the hero piece. |
| `src/components/ToyBunny.jsx` | The bunny and its speech bubble. |
| `src/components/BunnySvg.jsx` | The bunny artwork. |
| `src/components/HeroSvg.jsx` | The drawn hero piece. |
| `src/styles.css` | Theme colors, layout, and all the motion. |

Both themes are supported; the toggle is top-right and the choice is
remembered. All animation is wrapped in `prefers-reduced-motion`.

## Deploy

**Vercel** (recommended): push to GitHub, import the repo at vercel.com, accept
the detected Vite settings.

**GitHub Pages:** set `base: "/repo-name/"` in `vite.config.js`, run
`npm run build`, and publish the `dist/` folder.
