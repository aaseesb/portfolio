import { useEffect, useRef } from "react";
import {
  createBrowserRouter,
  Link,
  NavLink,
  Outlet,
  ScrollRestoration,
  useLocation,
  useRouteError,
} from "react-router";
import { ArrowRight, Mail } from "lucide-react";
import { profile, projects } from "../data/portfolio";
import {
  Home,
  ExperiencePage,
  ProjectsPage,
  ProjectPage,
  LinksPage,
  AboutPage,
} from "../pages/Pages";
import { NotFound } from "../components/Shared";

const navigation = [
  ["Experience", "/experience"],
  ["Projects", "/projects"],
  ["Links", "/links"],
  ["About me", "/about"],
];

function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const main = useRef<HTMLElement>(null);
  const previous = useRef(pathname);
  useEffect(() => {
    const project = projects.find((item) => pathname.startsWith(`/projects/${item.slug}`));
    const page =
      navigation.find(([, path]) => path === pathname)?.[0] ??
      project?.title ??
      (isHome ? "" : "Page not found");
    document.title = page ? `${page} — ${profile.name}` : `${profile.name} — Software engineer`;
    if (previous.current !== pathname) main.current?.focus({ preventScroll: true });
    previous.current = pathname;
  }, [pathname, isHome]);
  return (
    <div className={`site ${isHome ? "is-home" : ""}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link to="/" className="wordmark" aria-label={`${profile.name}, home`}>
          {profile.initials}
        </Link>
        {!isHome && (
          <nav className="header-nav" aria-label="Main navigation">
            {navigation.map(([label, to]) => (
              <NavLink key={to} to={to}>
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <main id="main" ref={main} tabIndex={-1} className={isHome ? "home-main" : "page-main"}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <Link to="/links" className="button button-outline footer-contact">
          <Mail size={14} /> Contact & links <ArrowRight size={14} />
        </Link>
      </footer>
      <ScrollRestoration />
    </div>
  );
}

function RouteError() {
  const error = useRouteError();
  return (
    <div className="error-page">
      <h1>Something didn’t load.</h1>
      <p>
        {error instanceof Error
          ? "Please refresh to try again."
          : "This page is temporarily unavailable."}
      </p>
      <a className="button" href={import.meta.env.BASE_URL}>
        Back home
      </a>
    </div>
  );
}

export const router = createBrowserRouter(
  [
    {
      Component: Layout,
      ErrorBoundary: RouteError,
      children: [
        { index: true, Component: Home },
        { path: "experience", Component: ExperiencePage },
        { path: "projects", Component: ProjectsPage },
        { path: "projects/:slug", Component: ProjectPage },
        { path: "links", Component: LinksPage },
        { path: "about", Component: AboutPage },
        { path: "*", Component: NotFound },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" },
);
