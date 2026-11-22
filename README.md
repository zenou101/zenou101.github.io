# Zenou

A personal developer portfolio and searchable index of [Zenou’s public repositories](https://github.com/zenou101). Its production address is [zenou101.github.io](https://zenou101.github.io/).

## Explore

- Featured projects pair public GitHub metadata with a short editorial introduction. ZenouMath uses its official logo. FrameLab shows the real performance overview from its project repository.
- The repository hub searches names, descriptions, languages and topics. Visitors can filter by project type or sort by update date, stars, name and creation date.
- A project panel shows languages, last push, latest published stable release when available, and links to the README, source and verified website.
- Public repository, star and fork totals include every fetched page. The follower count comes from the public GitHub user record.
- The site includes keyboard navigation, native modal focus management, responsive navigation, locally hosted fonts, reduced-motion support and a Discord sharing image.

## Run locally

Use Node.js 24 and npm.

```sh
npm ci
npm run dev
```

```sh
npm run typecheck
npm test
npm run sync
npm run build
npm run preview
```

React, TypeScript and Vite power the site. Tailwind CSS, custom CSS and Lucide icons provide its visual elements. All production assets are static.

## How data stays current

The browser requests `/users/zenou101/repos` from GitHub’s REST API, 100 records per page, sorted by repository name. It continues until the last page and deduplicates by repository ID. Only public records owned by this account are retained. Repository updates and code pushes use their separate GitHub timestamps.

A successful complete response is cached locally for 15 minutes. The refresh control bypasses this cache. If GitHub rate-limits visitors, the most recent available local or bundled snapshot remains visible with a cache date. Failed fetches never replace complete data with partial results. The application reads no private profile fields and ships no API credentials.

On pushes, manual dispatches and a six-hour schedule, the Pages workflow runs the same paginated fetch, checks project homepages and collects release and language metadata. The action writes this data to the deployment artifact. If a GitHub sync fails, a checked-in public snapshot is available for the build. Newly changed homepages appear after a successful website check. Opening a detail panel requests current release and language data without downloading the README.

## Project selection

Edit `pins` in `src/model.ts` to curate the featured order, summaries and known official sites. A pin appears only while a matching public repository exists. The category for ZenouMath and FrameLab follows their own READMEs. For other repositories the classifier checks tool topics, application topics, then website topics, a Pages repository name or an HTML primary language. Unmatched repositories appear under Other. A documentation homepage alone does not classify an application as a website.

## Deploy

The target repository is **zenou101/zenou101.github.io**. In **Settings → Pages → Build and deployment**, select **GitHub Actions**. Push the source to `main` or run **Publish portfolio** manually. The workflow installs the lockfile, type-checks, runs tests, refreshes public metadata, builds `dist/` and deploys that artifact with GitHub’s official Pages actions. The deployment job alone receives Pages write and OIDC permissions. Vite serves the site from `/`.

## Project imagery

[ZenouMath logo](https://github.com/zenou101/zenoumath/blob/main/assets/logo-192.png) · [FrameLab screenshot](https://github.com/zenou101/framelab/blob/main/site/public/screenshots/overview-dark.webp). The purple Z illustration and sharing artwork were made for this portfolio.
