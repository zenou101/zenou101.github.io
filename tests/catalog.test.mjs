import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  categories,
  categoryOf,
  fetchSnapshot,
  owner,
  selectRepos,
  totals,
  validSnapshot,
  verifiedSite,
  webUrl,
} from "../src/model.ts";
const { snapshot, details } = JSON.parse(
  await readFile(new URL("../public/data/catalog.json", import.meta.url)),
);
const sample = snapshot.repos[0];
const fixture = (id, overrides = {}) => ({
  ...sample,
  name: "repo-" + id,
  html_url: "https://github.com/" + owner + "/repo-" + id,
  id,
  private: false,
  owner: { login: owner },
  topics: [],
  language: null,
  ...overrides,
});

test("pagination requests subsequent pages and totals count all public owned repositories", async () => {
  const pages = [];
  const data = await fetchSnapshot(async (url) => {
    if (!url.includes("/repos?")) return { followers: 12 };
    const page = Number(new URL(url).searchParams.get("page"));
    pages.push(page);
    if (page === 1)
      return Array.from({ length: 100 }, (_, i) =>
        fixture(i, { stargazers_count: 2, forks_count: 1 }),
      );
    return [
      fixture(100, { stargazers_count: 3, forks_count: 2 }),
      fixture(101, { private: true }),
      fixture(102, { owner: { login: "elsewhere" } }),
    ];
  });
  assert.deepEqual(pages, [1, 2]);
  assert.deepEqual(totals(data), [101, 203, 102, 12]);
});
test("a failed later page cannot become a partial result", async () => {
  await assert.rejects(
    () =>
      fetchSnapshot(async (url) => {
        if (!url.includes("/repos?")) return { followers: 0 };
        if (url.endsWith("page=1"))
          return Array.from({ length: 100 }, (_, i) => fixture(i));
        throw Error("Rate limited");
      }),
    /Rate limited/,
  );
});
test("all search fields, multi-word searches and empty matches", () => {
  const r = fixture(1, {
    name: "river",
    language: "Rust",
    description: "Audio editing",
    topics: ["waveform"],
  });
  for (const q of ["RIV", "rust", "editing", "waveform", "RUST waveform"])
    assert.equal(selectRepos([r], q, "All", "updated").length, 1);
  assert.equal(selectRepos([r], "missing", "All", "updated").length, 0);
});
test("five filters have explicit reproducible rules", () => {
  const list = [
    fixture(1, { name: "zenoumath" }),
    fixture(2, { name: "framelab" }),
    fixture(3, { topics: ["cli"] }),
    fixture(4),
  ];
  assert.deepEqual(
    categories.map((c) => selectRepos(list, "", c, "name").length),
    [4, 1, 1, 1, 1],
  );
  assert.equal(categoryOf(fixture(5, { language: "HTML" })), "Websites");
  assert.equal(
    categoryOf(fixture(6, { topics: ["desktop-app"] })),
    "Applications",
  );
});
test("all sorts have deterministic ties and preserve the source array", () => {
  const a = fixture(1, {
    name: "alpha",
    created_at: "2024",
    updated_at: "2026",
    stargazers_count: 1,
  });
  const b = fixture(2, {
    name: "beta",
    created_at: "2025",
    updated_at: "2023",
    stargazers_count: 9,
  });
  const r = [b, a];
  for (const [s, expected] of [
    ["name", "alpha"],
    ["updated", "alpha"],
    ["created", "beta"],
    ["stars", "beta"],
  ])
    assert.equal(selectRepos(r, "", "All", s)[0].name, expected);
  assert.equal(r[0], b);
});
test("only verified current websites are shown", () => {
  const r = fixture(1, { homepage: "https://example.org/" });
  assert.equal(
    verifiedSite(r, { candidate: r.homepage, website: r.homepage }),
    r.homepage,
  );
  assert.equal(
    verifiedSite(r, { candidate: "https://old.example/", website: r.homepage }),
    undefined,
  );
  assert.equal(verifiedSite(r), undefined);
  for (const u of [
    "javascript:foo",
    "data:test",
    "https://user:pass@example.org",
  ])
    assert.equal(webUrl(u), undefined);
});
test("bundled snapshot is usable and comes from the owned public namespace", () => {
  assert.ok(validSnapshot(snapshot));
  assert.equal(validSnapshot({ ...snapshot, repos: [{}] }), false);
  for (const r of snapshot.repos) {
    assert.equal(r.html_url, "https://github.com/" + owner + "/" + r.name);
    assert.ok(details[r.name]);
  }
});
