export const owner = "zenou101";
export const profileUrl = "https://github.com/" + owner;
export const api = "https://api.github.com";
export const categories = [
  "All",
  "Websites",
  "Applications",
  "Tools",
  "Other",
] as const;
export type Category = (typeof categories)[number];
export type Sort = "updated" | "stars" | "name" | "created";
export type Repo = {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  homepage: string | null;
  html_url: string;
  updated_at: string;
  created_at: string;
  pushed_at: string | null;
  visibility: "public";
};
export type Release = { tag: string; url: string; published: string };
export type Details = {
  website?: string;
  candidate?: string;
  release?: Release | null;
  languages?: string[];
};
export type Snapshot = {
  version: 1;
  fetched: string;
  followers: number;
  repos: Repo[];
};
export type Catalog = { snapshot: Snapshot; details: Record<string, Details> };
export type Pin = {
  names: string[];
  title: string;
  category?: Category;
  summary?: string;
  website?: string;
  art?: "math" | "frame";
};
export const pins: Pin[] = [
  {
    names: ["zenoumath"],
    title: "ZenouMath",
    category: "Websites",
    summary:
      "A browser hub for games, media and everyday web tools, all in one place.",
    website: "https://zenoumath.space/",
    art: "math",
  },
  {
    names: ["framelab"],
    title: "FrameLab",
    category: "Applications",
    summary:
      "A Windows app that records frame times and shows how your PC performs while you play.",
    website: "https://zenou101.github.io/framelab/",
    art: "frame",
  },
  { names: ["zenou-unblocked", "zenouunblocked"], title: "Zenou Unblocked" },
  { names: ["veyra"], title: "Veyra" },
];
export const pinFor = (r: Repo) =>
  pins.find((p) => p.names.includes(r.name.toLowerCase()));
export function categoryOf(r: Repo): Category {
  const curated = pinFor(r)?.category;
  if (curated) return curated;
  const has = (re: RegExp) => r.topics.some((t) => re.test(t));
  if (
    has(
      /^(cli|cli-tool|command-line|tool|tools|utility|utilities|sdk|library)$/,
    )
  )
    return "Tools";
  if (
    has(/^(app|application|desktop-app|mobile-app|android|ios|tauri|electron)$/)
  )
    return "Applications";
  if (
    r.name.toLowerCase().endsWith(".github.io") ||
    has(/^(website|webapp|web-app|portfolio|github-pages|static-site)$/) ||
    r.language === "HTML"
  )
    return "Websites";
  return "Other";
}
export function selectRepos(
  repos: Repo[],
  query: string,
  cat: Category,
  sort: Sort,
) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return repos
    .filter((r) => {
      const fields = [r.name, r.description, r.language, ...r.topics]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (cat === "All" || categoryOf(r) === cat) &&
        words.every((w) => fields.includes(w))
      );
    })
    .sort((a, b) => {
      let delta = 0;
      if (sort === "updated") delta = b.updated_at.localeCompare(a.updated_at);
      if (sort === "created") delta = b.created_at.localeCompare(a.created_at);
      if (sort === "stars") delta = b.stargazers_count - a.stargazers_count;
      return (
        delta || a.name.localeCompare(b.name, "en", { sensitivity: "base" })
      );
    });
}
export function totals(s: Snapshot) {
  return [
    s.repos.length,
    s.repos.reduce((n, r) => n + r.stargazers_count, 0),
    s.repos.reduce((n, r) => n + r.forks_count, 0),
    s.followers,
  ];
}
export function webUrl(value: unknown) {
  if (typeof value !== "string") return undefined;
  try {
    const u = new URL(value);
    if (!["https:", "http:"].includes(u.protocol) || u.username || u.password)
      return undefined;
    return u.href;
  } catch {
    return undefined;
  }
}
export const candidateFor = (r: Repo) =>
  webUrl(pinFor(r)?.website ?? r.homepage);
export function verifiedSite(r: Repo, d?: Details) {
  const current = candidateFor(r);
  return current && current === d?.candidate ? webUrl(d.website) : undefined;
}
export type RequestJSON = (url: string) => Promise<unknown>;
type Raw = Repo & { private: boolean; owner: { login: string } };
export async function fetchSnapshot(request: RequestJSON): Promise<Snapshot> {
  async function listAll() {
    const byId = new Map<number, Repo>();
    for (let page = 1; ; page++) {
      const rows = await request(
        api +
          "/users/" +
          owner +
          "/repos?type=owner&sort=full_name&direction=asc&per_page=100&page=" +
          page,
      );
      if (!Array.isArray(rows)) throw Error("Invalid repository response");
      for (const r of rows as Raw[]) {
        if (r.private !== false || r.owner?.login?.toLowerCase() !== owner)
          continue;
        const {
          id,
          name,
          description,
          language,
          topics,
          stargazers_count,
          forks_count,
          homepage,
          html_url,
          updated_at,
          created_at,
          pushed_at,
        } = r;
        if (
          !Number.isSafeInteger(id) ||
          !name ||
          !webUrl(html_url) ||
          typeof stargazers_count !== "number" ||
          typeof forks_count !== "number" ||
          !updated_at ||
          !created_at
        )
          throw Error("Incomplete repository response");
        byId.set(id, {
          id,
          name,
          description,
          language,
          topics: topics ?? [],
          stargazers_count,
          forks_count,
          homepage,
          html_url,
          updated_at,
          created_at,
          pushed_at,
          visibility: "public",
        });
      }
      if (rows.length < 100) break;
    }
    return [...byId.values()];
  }
  const [repos, profile] = (await Promise.all([
    listAll(),
    request(api + "/users/" + owner),
  ])) as [Repo[], { followers: number }];
  if (!Number.isSafeInteger(profile.followers) || profile.followers < 0)
    throw Error("Invalid profile response");
  return {
    version: 1,
    fetched: new Date().toISOString(),
    followers: profile.followers,
    repos,
  };
}
export function validSnapshot(x: unknown): x is Snapshot {
  if (!x || typeof x !== "object") return false;
  const s = x as Snapshot;
  return (
    s.version === 1 &&
    Number.isFinite(Date.parse(s.fetched)) &&
    Number.isSafeInteger(s.followers) &&
    Array.isArray(s.repos) &&
    s.repos.every(
      (r) =>
        r &&
        r.visibility === "public" &&
        Number.isSafeInteger(r.id) &&
        typeof r.name === "string" &&
        r.html_url === profileUrl + "/" + r.name &&
        Number.isInteger(r.stargazers_count) &&
        Number.isInteger(r.forks_count) &&
        Array.isArray(r.topics) &&
        typeof r.updated_at === "string" &&
        typeof r.created_at === "string",
    )
  );
}
