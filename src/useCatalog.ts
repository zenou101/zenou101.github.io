import { useEffect, useState } from "react";
import {
  fetchSnapshot,
  validSnapshot,
  type Catalog,
  type Snapshot,
  type Details,
} from "./model";
const key = "zenou.public-repos.v1";
const ttl = 15 * 60 * 1000;
function cached(): Snapshot | undefined {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || "null");
    if (validSnapshot(value)) return value;
  } catch {}
}
export function useCatalog() {
  const [snapshot, setSnapshot] = useState<Snapshot | undefined>(cached);
  const [details, setDetails] = useState<Record<string, Details>>({});
  const [status, setStatus] = useState<
    "loading" | "live" | "cached" | "failed"
  >("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const signal = AbortSignal.any([
      controller.signal,
      AbortSignal.timeout(18000),
    ]);
    const previous = cached();
    let fallback = previous;
    async function run() {
      async function read(url: string) {
        const res = await fetch(url, { signal });
        if (!res.ok) throw Error(String(res.status));
        return res.json();
      }
      const bundled = read("/data/catalog.json")
        .then((c: Catalog) => {
          if (!active || !validSnapshot(c?.snapshot)) return;
          setDetails(c.details ?? {});
          if (
            !fallback ||
            Date.parse(c.snapshot.fetched) > Date.parse(fallback.fetched)
          )
            fallback = c.snapshot;
          setSnapshot((current) =>
            current &&
            Date.parse(current.fetched) >= Date.parse(c.snapshot.fetched)
              ? current
              : c.snapshot,
          );
        })
        .catch(() => {});
      try {
        if (
          previous &&
          attempt === 0 &&
          Date.now() - Date.parse(previous.fetched) < ttl &&
          Date.now() >= Date.parse(previous.fetched)
        ) {
          await bundled;
          if (active) setStatus("cached");
          return;
        }
        const fresh = await fetchSnapshot(read);
        if (!active) return;
        setSnapshot(fresh);
        setStatus("live");
        try {
          localStorage.setItem(key, JSON.stringify(fresh));
        } catch {}
      } catch {
        await bundled;
        if (active) setStatus(fallback ? "cached" : "failed");
      }
    }
    setStatus("loading");
    void run();
    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt]);
  return { snapshot, details, status, retry: () => setAttempt((n) => n + 1) };
}
