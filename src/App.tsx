import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  FolderGit2,
  Folders,
  GitFork,
  Github,
  Globe2,
  Layers3,
  Menu,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Star,
  Tag,
  Users,
  X,
} from "lucide-react";
import {
  api,
  categories,
  categoryOf,
  owner,
  pinFor,
  pins,
  profileUrl,
  selectRepos,
  totals,
  verifiedSite,
  webUrl,
  type Category,
  type Details,
  type Repo,
  type Sort,
} from "./model";
import { useCatalog } from "./useCatalog";

const format = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const date = (s: string) => format.format(new Date(s));
const languages: Record<string, string> = {
  HTML: "#e98961",
  TypeScript: "#689cdd",
  JavaScript: "#e4cd67",
  Rust: "#d9a58b",
  Python: "#80acd6",
  CSS: "#ad8fe2",
};
function Wordmark() {
  return (
    <span className="wordmark">
      <img src="/favicon.svg" width="30" height="30" alt="" />
      Zenou<span className="wordmark-period">.</span>
    </span>
  );
}
function Header() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState("home");
  useEffect(() => {
    const sync = () => {
      const ids = ["about", "projects", "featured", "home"];
      const id =
        ids.find(
          (id) =>
            (document.getElementById(id)?.getBoundingClientRect().top ??
              Infinity) <
            window.innerHeight * 0.42,
        ) ?? "home";
      setSection(id === "featured" ? "projects" : id);
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);
  return (
    <header>
      <div className="wrap nav-wrap">
        <a href="#home" aria-label="Zenou home" onClick={() => setOpen(false)}>
          <Wordmark />
        </a>
        <button
          type="button"
          className="menu icon-button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          id="navigation"
          className={open ? "opened" : ""}
          aria-label="Main navigation"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              document.querySelector<HTMLButtonElement>(".menu")?.focus();
            }
          }}
        >
          {["Home", "Projects", "About"].map((name) => (
            <a
              key={name}
              href={"#" + name.toLowerCase()}
              aria-current={
                section === name.toLowerCase() ? "location" : undefined
              }
              onClick={() => setOpen(false)}
            >
              {name}
            </a>
          ))}
          <a className="nav-git" href={profileUrl}>
            <Github size={16} />
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
function Hero() {
  return (
    <section id="home" aria-labelledby="hero-title" className="hero">
      <div className="wrap hero-layout">
        <div className="hero-text">
          <p className="eyebrow">
            <i />
            Developer portfolio
          </p>
          <h1 id="hero-title">
            Building things
            <br />
            for the web
            <br />
            <em>and beyond.</em>
          </h1>
          <p className="intro">
            I’m Zenou. I build websites, apps and tools, experimenting with new
            ideas and improving them along the way.
          </p>
          <div className="actions">
            <a className="button primary" href="#projects">
              <Folders size={17} />
              View projects
            </a>
            <a className="button secondary" href={profileUrl}>
              <Github size={17} />
              GitHub profile
            </a>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="corner tl" />
          <span className="corner tr" />
          <span className="corner bl" />
          <span className="corner br" />
          <img
            src="/media/zenou-mark.webp"
            fetchPriority="high"
            width="930"
            height="660"
            alt=""
          />
        </div>
      </div>
    </section>
  );
}
function Language({ value }: { value: string | null }) {
  return (
    <span className="language">
      <i
        style={
          { "--lang": languages[value ?? ""] ?? "#9b97ab" } as CSSProperties
        }
      />
      {value ?? "Unspecified"}
    </span>
  );
}
function CardArt({ repo }: { repo: Repo }) {
  const art = pinFor(repo)?.art;
  if (art === "math")
    return (
      <div className="cover math-cover" aria-hidden="true">
        <div className="math-lockup">
          <img
            src="/media/zenoumath.png"
            width="54"
            height="54"
            alt=""
            loading="lazy"
          />
          <b>
            Zenou<span>Math</span>
          </b>
        </div>
      </div>
    );
  if (art === "frame")
    return (
      <div className="cover frame-cover" aria-hidden="true">
        <img
          src="/media/framelab.webp"
          width="1336"
          height="868"
          alt=""
          loading="lazy"
        />
      </div>
    );
  return (
    <div className="cover generic-cover">
      <FolderGit2 aria-hidden="true" size={58} />
    </div>
  );
}
function CardLinks({ repo, meta }: { repo: Repo; meta?: Details }) {
  const site = verifiedSite(repo, meta);
  return (
    <div className="card-links">
      <a href={repo.html_url} aria-label={"View " + repo.name + " on GitHub"}>
        <Github />
        Source
      </a>
      {site && (
        <a href={site} aria-label={"Visit " + repo.name + " website"}>
          <Globe2 />
          Website
        </a>
      )}
    </div>
  );
}
function Feature({
  repo,
  meta,
  onOpen,
}: {
  repo: Repo;
  meta?: Details;
  onOpen: () => void;
}) {
  const pin = pinFor(repo)!;
  return (
    <article className="feature interactive-card">
      <CardArt repo={repo} />
      <div className="card-body">
        <div className="feature-type">
          <span>
            {categoryOf(repo) === "Applications"
              ? "Desktop application"
              : categoryOf(repo) === "Websites"
                ? "Website"
                : "Project"}
          </span>
          {meta?.release && (
            <a href={meta.release.url}>
              <Tag size={12} />
              {meta.release.tag}
            </a>
          )}
        </div>
        <h3>
          <button className="stretched" onClick={onOpen}>
            {pin.title}
          </button>
        </h3>
        <p>{pin.summary ?? repo.description}</p>
        <div className="feature-meta">
          <Language value={repo.language} />
          <span aria-label={repo.stargazers_count + " stars"}>
            <Star />
            {repo.stargazers_count}
          </span>
          <time dateTime={repo.updated_at}>{date(repo.updated_at)}</time>
        </div>
        <CardLinks repo={repo} meta={meta} />
      </div>
    </article>
  );
}
function RepositoryCard({
  repo,
  meta,
  onOpen,
}: {
  repo: Repo;
  meta?: Details;
  onOpen: () => void;
}) {
  return (
    <article className="repo-card interactive-card">
      <div className="repo-top">
        <FolderGit2 size={19} />
        <span className="visibility">Public</span>
      </div>
      <h3>
        <button className="stretched" onClick={onOpen}>
          {repo.name}
        </button>
      </h3>
      <p>{repo.description ?? "No repository description provided."}</p>
      <div className="repo-details">
        <Language value={repo.language} />
        <span aria-label={repo.stargazers_count + " stars"}>
          <Star />
          {repo.stargazers_count}
        </span>
        <span aria-label={repo.forks_count + " forks"}>
          <GitFork />
          {repo.forks_count}
        </span>
      </div>
      <time dateTime={repo.updated_at}>Updated {date(repo.updated_at)}</time>
      <CardLinks repo={repo} meta={meta} />
    </article>
  );
}
function Dialog({
  repo,
  meta,
  onClose,
}: {
  repo: Repo;
  meta?: Details;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [detail, setDetail] = useState<Details>(meta ?? {});
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const d = dialog.current!;
    d.showModal();
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      d.close();
      document.body.style.overflow = before;
    };
  }, []);
  useEffect(() => {
    let active = true;
    const ctl = new AbortController();
    void (async () => {
      const base =
        api + "/repos/" + owner + "/" + encodeURIComponent(repo.name);
      async function read(path: string) {
        const res = await fetch(base + path, {
          signal: AbortSignal.any([ctl.signal, AbortSignal.timeout(9000)]),
        });
        if (path.includes("release") && res.status === 404) return null;
        if (!res.ok) throw Error("Unavailable");
        return res.json();
      }
      setState("loading");
      const [rel, lang] = await Promise.allSettled([
        read("/releases/latest"),
        read("/languages"),
      ]);
      if (!active) return;
      const next = { ...meta };
      if (rel.status === "fulfilled") {
        const r = rel.value;
        next.release =
          r && webUrl(r.html_url)
            ? { tag: r.tag_name, url: r.html_url, published: r.published_at }
            : null;
      }
      if (lang.status === "fulfilled") next.languages = Object.keys(lang.value);
      setDetail(next);
      setState(
        rel.status === "rejected" || lang.status === "rejected"
          ? "error"
          : "ready",
      );
    })();
    return () => {
      active = false;
      ctl.abort();
    };
  }, [repo.name, meta, attempt]);
  const pin = pinFor(repo),
    site = verifiedSite(repo, detail);
  return (
    <dialog
      ref={dialog}
      aria-labelledby="detail-title"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog-body">
        <div className="detail-head">
          <span className="eyebrow">
            <i />
            Project details
          </span>
          <button
            className="icon-button"
            autoFocus
            aria-label="Close project details"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <h2 id="detail-title">{pin?.title ?? repo.name}</h2>
        <p>
          {pin?.summary ??
            repo.description ??
            "No description provided on GitHub."}
        </p>
        {pin?.art === "frame" && (
          <img
            className="detail-shot"
            alt="FrameLab’s Windows performance overview in dark mode"
            src="/media/framelab.webp"
            width="1336"
            height="868"
            loading="lazy"
          />
        )}
        <dl className="facts">
          <div>
            <dt>Technologies</dt>
            <dd>
              {detail.languages?.join(", ") ||
                repo.language ||
                (state === "loading" ? "Loading…" : "Unspecified")}
            </dd>
          </div>
          <div>
            <dt>Latest release</dt>
            <dd>
              {detail.release ? (
                <a href={detail.release.url}>
                  {detail.release.tag} · {date(detail.release.published)}
                </a>
              ) : detail.release === null ? (
                "No published release"
              ) : state === "loading" ? (
                "Loading…"
              ) : (
                "Unavailable"
              )}
            </dd>
          </div>
          <div>
            <dt>Last push</dt>
            <dd>{repo.pushed_at ? date(repo.pushed_at) : "Unavailable"}</dd>
          </div>
          <div>
            <dt>Activity</dt>
            <dd>
              {repo.stargazers_count} stars · {repo.forks_count} forks
            </dd>
          </div>
        </dl>
        {state === "error" && (
          <p className="detail-status" role="status">
            Live details are temporarily unavailable.{" "}
            <button onClick={() => setAttempt((n) => n + 1)}>Retry</button>
          </p>
        )}
        <div className="actions">
          <a className="button secondary" href={repo.html_url}>
            <Github size={16} />
            Repository
          </a>
          {site && (
            <a className="button secondary" href={site}>
              <Globe2 size={16} />
              Website
            </a>
          )}
          <a className="text-link" href={repo.html_url + "#readme"}>
            <BookOpen size={15} />
            README
          </a>
        </div>
      </div>
    </dialog>
  );
}
export default function App() {
  const { snapshot, details, status, retry } = useCatalog();
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState<Category>("All"),
    [sort, setSort] = useState<Sort>("updated");
  const [selected, setSelected] = useState<Repo | null>(null);
  const repos = snapshot?.repos ?? [];
  const featured = pins
    .map((p) => repos.find((r) => p.names.includes(r.name.toLowerCase())))
    .filter((r): r is Repo => !!r);
  const matches = selectRepos(repos, query, category, sort);
  const metrics = snapshot ? totals(snapshot) : [];
  const stats = [
    { label: "Public repositories", Icon: FolderGit2 },
    { label: "Repository stars", Icon: Star },
    { label: "Repository forks", Icon: GitFork },
    { label: "GitHub followers", Icon: Users },
  ];
  return (
    <>
      <a href="#projects" className="skip">
        Skip to projects
      </a>
      <Header />
      <main>
        <Hero />
        <div className="wrap">
          {(featured.length > 0 || status === "loading") && (
            <section className="section featured-section" id="featured">
              <div className="section-title">
                <div>
                  <div className="eyebrow">
                    <i />
                    Selected work
                  </div>
                  <h2>Featured projects</h2>
                </div>
                <a className="text-link hub-link" href="#projects">
                  <Layers3 size={15} />
                  Repository hub
                </a>
              </div>
              <div className="featured-grid">
                {featured.map((r) => (
                  <Feature
                    key={r.id}
                    repo={r}
                    meta={details[r.name]}
                    onOpen={() => setSelected(r)}
                  />
                ))}
              </div>
              {!snapshot && <p role="status">Loading projects…</p>}
            </section>
          )}
          <section
            id="projects"
            className="section hub-section"
            aria-labelledby="hub-title"
          >
            <div className="section-title">
              <div>
                <div className="eyebrow">
                  <i />
                  GitHub
                </div>
                <h2 id="hub-title">Repository hub</h2>
              </div>
            </div>
            <dl className="stats">
              {stats.map(({ label, Icon }, i) => (
                <div key={label}>
                  <dt>
                    <Icon size={16} />
                    {label}
                  </dt>
                  <dd>{metrics[i]?.toLocaleString() ?? "—"}</dd>
                </div>
              ))}
            </dl>
            <div className="search-row">
              <label className="search">
                <Search size={18} />
                <span className="sr-only">Search repositories</span>
                <input
                  type="search"
                  placeholder="Search repositories…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <label className="sort">
                <SlidersHorizontal size={15} />
                <span className="sr-only">Sort repositories</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                >
                  <option value="updated">Recently updated</option>
                  <option value="stars">Most stars</option>
                  <option value="name">Alphabetical</option>
                  <option value="created">Recently created</option>
                </select>
                <ChevronDown size={15} />
              </label>
            </div>
            <div
              className="filters"
              role="group"
              aria-label="Repository categories"
            >
              {categories.map((c) => (
                <button
                  key={c}
                  aria-pressed={category === c}
                  onClick={() => setCategory(c)}
                >
                  {c === "All"
                    ? "All repositories"
                    : c === "Other"
                      ? "Other projects"
                      : c}
                </button>
              ))}
            </div>
            <div className="hub-status">
              <span aria-live="polite">
                {snapshot
                  ? matches.length +
                    " " +
                    (matches.length === 1 ? "repository" : "repositories")
                  : status === "loading"
                    ? "Loading repositories…"
                    : "Repositories unavailable"}
              </span>
              {snapshot && (
                <span>
                  <span className={"sync-icon " + status}>
                    <Check size={13} />
                  </span>
                  {status === "live"
                    ? "Synced with GitHub"
                    : status === "loading"
                      ? "Updating…"
                      : "Cached " + date(snapshot.fetched)}
                  <button
                    className="refresh"
                    aria-label="Refresh GitHub data"
                    disabled={status === "loading"}
                    onClick={retry}
                  >
                    <RefreshCw size={13} />
                  </button>
                </span>
              )}
            </div>
            {matches.length > 0 ? (
              <div className="repo-grid">
                {matches.map((r) => (
                  <RepositoryCard
                    key={r.id}
                    repo={r}
                    meta={details[r.name]}
                    onOpen={() => setSelected(r)}
                  />
                ))}
              </div>
            ) : snapshot ? (
              <div className="empty">
                <Search />
                <h3>No matching repositories</h3>
                <p>Try another search or category.</p>
                <button
                  className="button secondary"
                  onClick={() => {
                    setQuery("");
                    setCategory("All");
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : status === "failed" ? (
              <div className="empty">
                <h3>GitHub data is unavailable</h3>
                <p>Try again or visit Zenou on GitHub.</p>
                <button className="button secondary" onClick={retry}>
                  Retry
                </button>
              </div>
            ) : null}
          </section>
          <section id="about" className="section about">
            <div>
              <div className="eyebrow">
                <i />
                About
              </div>
              <h2>Hey, I’m Zenou.</h2>
            </div>
            <div>
              <p>
                I like building things I can use, from a home for browser games
                to a way to see how my PC handles them. Web development and
                desktop software give me plenty of ideas to experiment with.
              </p>
              <a className="text-link" href={profileUrl}>
                <Github size={16} />
                @zenou101
              </a>
            </div>
          </section>
        </div>
      </main>
      <footer>
        <div className="wrap">
          <Wordmark />
          <span>Developer portfolio</span>
          <a href="#home">Back to top</a>
        </div>
      </footer>
      {selected && (
        <Dialog
          key={selected.id}
          repo={selected}
          meta={details[selected.name]}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
