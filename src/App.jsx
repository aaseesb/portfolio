// Two doors into one content.js.
//
// The main site (LandingPage) is the long scrolling one: a landing, the island
// you turn to read each project, and a timeline. The summary (OnePage) is
// everything on one screen for someone who is skimming. App itself owns only
// what both need — the theme, which door you're at, and which project is in
// the URL — and neither view holds any content of its own.
import { useEffect, useState, useCallback } from "react";
import { profile, projects } from "./content.js";
import LandingPage from "./components/LandingPage.jsx";
import OnePage from "./components/OnePage.jsx";

const params = () => new URLSearchParams(window.location.search);
const slugFromUrl = () => params().get("p");
const viewFromUrl = () => params().get("view");
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
  const [view, setView] = useState(() =>
    viewFromUrl() === "summary" ? "summary" : "explore"
  );

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
    if (nextView === "summary") q.set("view", "summary");
    if (slug) q.set("p", slug);
    const qs = q.toString();
    const url = qs ? `?${qs}` : window.location.pathname;
    const state = { view: nextView, p: slug };
    if (replace) window.history.replaceState(state, "", url);
    else window.history.pushState(state, "", url);
  }, []);

  // Opening a project from the summary view. Back closes it again.
  const select = useCallback(
    (slug) => {
      setSelectedSlug(slug);
      syncUrl("summary", slug, false);
    },
    [syncUrl]
  );

  // The island turning past a project on the landing page — the same idea of
  // "what you're looking at", but it isn't a navigation.
  const trackFront = useCallback(
    (slug) => {
      setSelectedSlug(slug);
      syncUrl("explore", slug, true);
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
      setView(viewFromUrl() === "summary" ? "summary" : "explore");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Escape closes the summary view's panel, same as its close button.
  useEffect(() => {
    if (view !== "summary" || !selectedSlug) return;
    const onKey = (e) => e.key === "Escape" && select(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, selectedSlug, select]);

  const controls = (
    <div className="view-controls">
      {/* The label says what you get, not what you are in — a button called
          "Explore" is one you can press. */}
      <button
        className="view-toggle"
        onClick={() => switchView(view === "summary" ? "explore" : "summary")}
      >
        {view === "summary" ? "Explore the site" : "One-page summary"}
      </button>
      <button
        className="theme-toggle"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle color theme"
      >
        {theme === "dark" ? "☀" : "☾"}
      </button>
    </div>
  );

  if (view === "summary") {
    return (
      <div className="page">
        {controls}
        <OnePage selectedSlug={selectedSlug} onSelect={select} />
      </div>
    );
  }

  return (
    <div className="page-landing">
      {controls}
      <LandingPage selectedSlug={selectedSlug} onFrontChange={trackFront} />
    </div>
  );
}
