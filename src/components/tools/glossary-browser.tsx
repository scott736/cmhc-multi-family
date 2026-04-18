import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GLOSSARY, type GlossaryCategory, type GlossaryEntry } from "@/data/glossary";

const CATEGORIES: GlossaryCategory[] = [
  "Programs",
  "Underwriting",
  "Insurance & Premium",
  "Construction",
  "Affordability",
  "Process",
  "Lenders",
  "Legal",
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function firstLetter(term: string): string {
  const c = term.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : "#";
}

export default function GlossaryBrowser() {
  const [query, setQuery] = useState<string>("");
  const [active, setActive] = useState<Set<GlossaryCategory>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const presentLetters = useMemo(() => {
    const s = new Set<string>();
    for (const entry of GLOSSARY) s.add(firstLetter(entry.term));
    return s;
  }, []);

  const filtered = useMemo<GlossaryEntry[]>(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY.filter((entry) => {
      if (active.size > 0 && !active.has(entry.category)) return false;
      if (!q) return true;
      return (
        entry.term.toLowerCase().includes(q) ||
        entry.definition.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q)
      );
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [query, active]);

  const grouped = useMemo<Record<string, GlossaryEntry[]>>(() => {
    const out: Record<string, GlossaryEntry[]> = {};
    for (const entry of filtered) {
      const l = firstLetter(entry.term);
      if (!out[l]) out[l] = [];
      out[l].push(entry);
    }
    return out;
  }, [filtered]);

  function toggleCategory(c: GlossaryCategory): void {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  function toggleExpanded(term: string): void {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(term)) next.delete(term);
      else next.add(term);
      return next;
    });
  }

  function expandAll(): void {
    setExpanded(new Set(filtered.map((e) => e.term)));
  }

  function collapseAll(): void {
    setExpanded(new Set());
  }

  return (
    <div className="bg-obsidian text-foreground">
      {/* HERO */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Glossary
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            CMHC multi-unit glossary.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            {GLOSSARY.length} terms across programs, underwriting, insurance and
            premium, construction, affordability, process, lenders and legal.
            Search, filter, or jump by letter.
          </p>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-8 lg:px-12 lg:py-10">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <Input
              type="search"
              placeholder="Search terms and definitions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-jet"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={expandAll}>
                Expand all
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                Collapse all
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const on = active.has(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    on
                      ? "border-star/60 bg-star/10 text-star"
                      : "border-dark-gray text-muted-foreground hover:border-star/40"
                  }`}
                >
                  {c}
                </button>
              );
            })}
            {active.size > 0 && (
              <button
                type="button"
                onClick={() => setActive(new Set())}
                className="rounded-full border border-dark-gray px-3 py-1 text-xs text-muted-foreground hover:border-star/40"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* A-Z Index */}
          <div className="mt-6 flex flex-wrap gap-1">
            {ALPHABET.map((l) => {
              const present = presentLetters.has(l) && grouped[l];
              return (
                <a
                  key={l}
                  href={present ? `#letter-${l}` : undefined}
                  className={`rounded border px-2 py-1 text-xs ${
                    present
                      ? "border-dark-gray hover:border-star/40 text-foreground"
                      : "border-dark-gray/40 text-muted-foreground/40 cursor-default"
                  }`}
                >
                  {l}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-10 lg:px-12 lg:py-16">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No terms match that search. Try clearing filters or using a shorter query.
            </p>
          ) : (
            <div className="space-y-8">
              {ALPHABET.filter((l) => grouped[l]).map((l) => (
                <div key={l} id={`letter-${l}`}>
                  <div className="mb-3 text-xs uppercase tracking-wider text-star">
                    {l}
                  </div>
                  <div className="grid gap-2">
                    {grouped[l].map((entry) => {
                      const open = expanded.has(entry.term);
                      return (
                        <Card
                          key={entry.term}
                          className="bg-jet border-dark-gray p-4"
                        >
                          <button
                            type="button"
                            onClick={() => toggleExpanded(entry.term)}
                            className="flex w-full items-center justify-between text-left"
                          >
                            <div className="flex flex-wrap items-baseline gap-3">
                              <span className="text-base font-semibold">
                                {entry.term}
                              </span>
                              <Badge variant="secondary" className="text-[10px]">
                                {entry.category}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {open ? "Hide" : "Show"}
                            </span>
                          </button>
                          {open && (
                            <div className="mt-3 space-y-2 text-sm">
                              <p className="text-muted-foreground">
                                {entry.definition}
                              </p>
                              {entry.related && entry.related.length > 0 && (
                                <div className="pt-2 text-xs">
                                  <span className="uppercase tracking-wide text-muted-foreground">
                                    Related:{" "}
                                  </span>
                                  {entry.related.map((r, i) => (
                                    <span key={r} className="text-star">
                                      {r}
                                      {i < (entry.related?.length ?? 0) - 1 ? ", " : ""}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
