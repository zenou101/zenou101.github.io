import { Wordmark } from "./Wordmark";

export type Route = "home" | "privacy" | "terms";

export function parseRoute(hash: string): Route {
  const path = hash
    .replace(/^#\/?/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
  if (path === "privacy") return "privacy";
  if (path === "terms") return "terms";
  return "home";
}

function Privacy() {
  return (
    <>
      <p className="eyebrow">
        <i />
        Legal
      </p>
      <h1>Privacy policy</h1>
      <p className="legal-updated">Last updated 22 November 2026</p>
      <p>
        This is a personal portfolio for Zenou, published at zenou101.github.io.
        It has no accounts, no contact forms and no newsletter. This page
        describes the small amount of data the site handles.
      </p>

      <h2>Stored in your browser</h2>
      <p>
        The site keeps one entry in your browser’s local storage, under the key{" "}
        <code>zenou.public-repos.v1</code>. It holds a copy of Zenou’s public
        repository list so repeat visits do not download it again. It stays on
        your device and is reused for up to 15 minutes before the site asks
        GitHub again. Clearing site data removes it.
      </p>

      <h2>Requests to GitHub</h2>
      <p>
        When the page loads, it requests public profile, repository, release and
        language data from GitHub’s REST API at api.github.com. GitHub receives
        those requests, including your IP address, as it does for any website
        request. GitHub handles that data under its own privacy statement.
      </p>

      <h2>Hosting</h2>
      <p>
        The site is served by GitHub Pages. GitHub may record standard request
        logs, such as IP address, browser type and time of access, when it
        delivers the page. Those logs are controlled by GitHub.
      </p>

      <h2>No analytics, cookies or advertising</h2>
      <p>
        The site sets no cookies and runs no analytics, advertising, tracking
        pixels or third-party embeds. Fonts and scripts are served from this
        site rather than a content network, apart from the GitHub API requests
        described above.
      </p>

      <h2>Links to other sites</h2>
      <p>
        Project links open GitHub, zenoumath.space and the FrameLab site. Each
        of those sites has its own privacy policy, which applies once you leave
        this one.
      </p>

      <h2>Your choices</h2>
      <p>
        You can clear stored site data in your browser settings at any time.
        Blocking JavaScript or the GitHub API stops the repository list from
        loading.
      </p>

      <h2>Changes</h2>
      <p>
        If the site starts handling data differently, this page will be updated
        and the date at the top will change.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy can go to{" "}
        <a href="https://github.com/zenou101">Zenou on GitHub</a>.
      </p>

      <div className="legal-links">
        <a href="#/terms">Terms and conditions</a>
        <a href="/">Back to the portfolio</a>
      </div>
    </>
  );
}

function Terms() {
  return (
    <>
      <p className="eyebrow">
        <i />
        Legal
      </p>
      <h1>Terms and conditions</h1>
      <p className="legal-updated">Last updated 22 November 2026</p>
      <p>
        These terms cover your use of zenou101.github.io, a personal portfolio
        maintained by Zenou. By using the site you accept them.
      </p>

      <h2>Purpose of the site</h2>
      <p>
        The site introduces Zenou’s projects, links to their source code and
        provides a searchable index of public repositories. It is informational
        and is not a commercial service, a store or professional advice.
      </p>

      <h2>Repository information</h2>
      <p>
        Project data is read from GitHub’s public API when you load the page.
        Names, descriptions, languages, stars, forks, release tags and dates can
        be delayed, incomplete or wrong if GitHub changes or reports them
        differently. A cached or bundled copy may be shown when the API is
        unavailable. Check the repository itself for the current state of a
        project.
      </p>

      <h2>Links and third-party sites</h2>
      <p>
        Links to GitHub, project websites and downloads are provided for
        convenience. Those sites are not controlled by this portfolio, and their
        own terms and policies apply. Downloading and running software from a
        linked repository is your decision.
      </p>

      <h2>Content and ownership</h2>
      <p>
        The text, layout and design of this site belong to Zenou. Project names,
        logos and screenshots remain the property of their projects and are used
        here to describe them. Code in a linked repository is licensed under the
        terms stated in that repository.
      </p>

      <h2>No warranty</h2>
      <p>
        The site is provided as it is. There is no promise that it will be
        available without interruption or that every detail on it is accurate or
        current.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent the law allows, Zenou is not liable for loss or damage
        arising from your use of this site or of the software and websites it
        links to. Nothing in these terms limits rights that cannot be excluded by
        law.
      </p>

      <h2>Changes</h2>
      <p>
        The site and these terms may change. The date at the top of this page
        shows the latest revision.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can go to{" "}
        <a href="https://github.com/zenou101">Zenou on GitHub</a>.
      </p>

      <div className="legal-links">
        <a href="#/privacy">Privacy policy</a>
        <a href="/">Back to the portfolio</a>
      </div>
    </>
  );
}

export function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  return (
    <>
      <header>
        <div className="wrap nav-wrap">
          <a href="/" aria-label="Zenou home">
            <Wordmark />
          </a>
          <a className="text-link back-link" href="/">
            Back to the portfolio
          </a>
        </div>
      </header>
      <main className="wrap legal">
        {kind === "privacy" ? <Privacy /> : <Terms />}
      </main>
      <footer>
        <div className="wrap">
          <Wordmark />
          <span>Developer portfolio</span>
          <div className="footer-links">
            <a href="#/privacy">Privacy</a>
            <a href="#/terms">Terms</a>
            <a href="https://github.com/zenou101">GitHub</a>
          </div>
        </div>
      </footer>
    </>
  );
}
