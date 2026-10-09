// Three doors into one content.js.
//
// The chooser is the front page: a waving bunny and two buttons. Interactive
// is the game (src/game); the summary is the compact one-page version
// (LandingPage). App owns only what all of them need — the theme, which door
// you're at, and which project is in the URL — and none holds content of its own.
import { useEffect, useState, useCallback } from "react";
import { profile, projects } from "./content.js";
import LandingPage from "./components/LandingPage.jsx";
import Chooser from "./game/Chooser.jsx";
import GameShell from "./game/GameShell.jsx";

const params = () => new URLSearchParams(window.location.search);
const slugFromUrl = () => params().get("p");
// An old link with only ?p=<slug> predates the chooser and meant the site.
const viewFromUrl = () => {
  const v = params().get("view");
  if (v === "summary" || v === "play") return v;
  return slugFromUrl() ? "summary" : "chooser";
};
const findProject = (slug) => projects.find((p) => p.slug === slug) || null;

export default function App() {
  const [theme, setTheme] = useState(
    () =>
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );

  // Which door. `?view=summary` is linkable, so a resume can point straight at
  // the plain version. The front page is always the site itself: a first visit
  // should get the thing I actually built, not a remembered preference.
  const [view, setView] = useState(viewFromUrl);

  const [selectedSlug, setSelectedSlug] = useState(() =>
    findProject(slugFromUrl()) ? slugFromUrl() : null
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
    document.title = `${profile.name} — ${profile.tagline}`;
  }, [theme]);

  // Writes the current view and project into the address bar. `replace` is for
  // the landing page, where the island turning past a project shouldn't leave
  // six entries in the history for the Back button to walk through.
  const syncUrl = useCallback((nextView, slug, replace) => {
    const q = new URLSearchParams();
    if (nextView === "summary" || nextView === "play") q.set("view", nextView);
    if (slug) q.set("p", slug);
    const qs = q.toString();
    const url = qs ? `?${qs}` : window.location.pathname;
    const state = { view: nextView, p: slug };
    if (replace) window.history.replaceState(state, "", url);
    else window.history.pushState(state, "", url);
  }, []);

  // The island turning past a project on the landing page — the same idea of
  // "what you're looking at", but it isn't a navigation.
  const trackFront = useCallback(
    (slug) => {
      setSelectedSlug(slug);
      syncUrl("summary", slug, true);
    },
    [syncUrl]
  );

  // Switching view drops any open project: the two views disagree about what
  // a selection means, and inheriting one across would be a surprise.
  const switchView = useCallback(
    (next) => {
      setView(next);
      setSelectedSlug(null);
      syncUrl(next, null, false);
      window.scrollTo({ top: 0 });
    },
    [syncUrl]
  );

  useEffect(() => {
    const onPop = () => {
      const slug = slugFromUrl();
      setSelectedSlug(findProject(slug) ? slug : null);
      setView(viewFromUrl());
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const themeBtn = (
    <button
      className="theme-toggle"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle color theme"
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );

  if (view === "chooser") {
    return (
      <>
        <div className="view-controls">{themeBtn}</div>
        <Chooser onInteractive={() => switchView("play")} onSummary={() => switchView("summary")} />
      </>
    );
  }

  if (view === "play") {
    return (
      <>
        <div className="view-controls">
          <button className="view-toggle" onClick={() => switchView("summary")}>
            Skip to summary
          </button>
          {themeBtn}
        </div>
        <GameShell onExit={() => switchView("summary")} />
      </>
    );
  }

  return (
    <div className="page-landing">
      <div className="view-controls">
        <button className="view-toggle" onClick={() => switchView("play")}>
          Play the game
        </button>
        {themeBtn}
      </div>
      <LandingPage selectedSlug={selectedSlug} onFrontChange={trackFront} />
    </div>
  );
}
