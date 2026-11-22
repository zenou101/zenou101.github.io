import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import {
  api,
  candidateFor,
  fetchSnapshot,
  owner,
  webUrl,
} from "../src/model.ts";
const output = new URL("../public/data/catalog.json", import.meta.url);
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "zenou-portfolio-sync",
};
if (process.env.GITHUB_TOKEN)
  headers.Authorization = "Bearer " + process.env.GITHUB_TOKEN;
async function json(url, optional = false) {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(25000) });
  if (optional && res.status === 404) return null;
  if (!res.ok) throw Error("GitHub returned " + res.status + " for " + url);
  return res.json();
}
async function checkWebsite(url) {
  if (!url) return false;
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      method: "GET",
      headers: { "User-Agent": "zenou-portfolio-link-check" },
    });
    await response.body?.cancel();
    return (
      response.ok &&
      /text\/html|application\/xhtml\+xml/i.test(
        response.headers.get("content-type") || "",
      )
    );
  } catch {
    return false;
  }
}
const snapshot = await fetchSnapshot(json);
let previous = {};
try {
  previous = JSON.parse(await readFile(output, "utf8")).details;
} catch {}
const details = {};
for (const repo of snapshot.repos) {
  const path = api + "/repos/" + owner + "/" + encodeURIComponent(repo.name);
  const candidate = candidateFor(repo);
  const [release, languages, valid] = await Promise.allSettled([
    json(path + "/releases/latest", true),
    json(path + "/languages"),
    checkWebsite(candidate),
  ]);
  const d = {};
  const old = previous[repo.name] || {};
  if (valid.status === "fulfilled" && valid.value) {
    d.website = candidate;
    d.candidate = candidate;
  }
  if (release.status === "fulfilled") {
    const r = release.value;
    d.release =
      r && webUrl(r.html_url)
        ? { tag: r.tag_name, url: r.html_url, published: r.published_at }
        : null;
  } else if ("release" in old) d.release = old.release;
  if (languages.status === "fulfilled")
    d.languages = Object.keys(languages.value);
  else if (old.languages) d.languages = old.languages;
  details[repo.name] = d;
}
await mkdir(new URL(".", output), { recursive: true });
const temporary = new URL("catalog.part", output);
await writeFile(temporary, JSON.stringify({ snapshot, details }) + "\n");
await rename(temporary, output);
console.log(
  "Synced " +
    snapshot.repos.length +
    " public repositories at " +
    snapshot.fetched,
);
