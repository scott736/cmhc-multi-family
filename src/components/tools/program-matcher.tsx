import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Eight priority dimensions scored 1-5.
interface Priorities {
  leverage: number;
  lowRate: number;
  speed: number;
  forgivable: number;
  amortization: number;
  recourse: number;
  minimalCommitments: number;
  affordabilityFocus: number;
}

const INITIAL: Priorities = {
  leverage: 3,
  lowRate: 3,
  speed: 3,
  forgivable: 3,
  amortization: 3,
  recourse: 3,
  minimalCommitments: 3,
  affordabilityFocus: 3,
};

const QUESTIONS: Array<{
  key: keyof Priorities;
  title: string;
  helper: string;
}> = [
  {
    key: "leverage",
    title: "How important is maximizing leverage?",
    helper: "Minimizing equity in; pushing LTV/LTC as high as possible.",
  },
  {
    key: "lowRate",
    title: "How important is the lowest possible rate?",
    helper: "Favoring CMHC-direct below-market products over insured market rates.",
  },
  {
    key: "speed",
    title: "How important is speed to funding?",
    helper: "Approved-lender insured products close faster than CMHC-direct programs.",
  },
  {
    key: "forgivable",
    title: "How important is forgivable capital?",
    helper: "Non-repayable grants / forgivable loan components in the capital stack.",
  },
  {
    key: "amortization",
    title: "How important is the longest possible amortization?",
    helper: "50-year amortization is available in most programs, but not at every tier.",
  },
  {
    key: "recourse",
    title: "How important is reducing recourse?",
    helper: "Limited recourse is available at MLI Select tier 3 and for mission-driven sponsors.",
  },
  {
    key: "minimalCommitments",
    title: "How important is minimal affordability / energy / accessibility commitment?",
    helper: "Avoiding covenanted rent caps or capital expense for points.",
  },
  {
    key: "affordabilityFocus",
    title: "How important is a strong affordability focus?",
    helper: "Mission fit — how central is delivering affordable units?",
  },
];

interface ScoredProgram {
  slug: string;
  program: string;
  score: number;
  max: number;
  strengths: string[];
  watchOuts: string[];
}

// Each program scored against each priority on a 0..5 fit scale.
// The user's weight (1..5) multiplies the fit to give the final score.
const FIT: Record<string, Record<keyof Priorities, number>> = {
  "mli-standard": {
    leverage: 3, // 85% LTV
    lowRate: 2, // market insured rate
    speed: 5, // approved lender, well-understood product
    forgivable: 0,
    amortization: 4, // 40-yr existing / 50-yr new
    recourse: 1, // full recourse standard
    minimalCommitments: 5, // no commitments required
    affordabilityFocus: 1,
  },
  "mli-select": {
    leverage: 5, // up to 95%
    lowRate: 3, // insured market but discounted premium
    speed: 4,
    forgivable: 0,
    amortization: 5, // up to 50
    recourse: 3, // limited recourse at tier 3
    minimalCommitments: 2, // needs ≥50 pts
    affordabilityFocus: 4, // affordability is common path
  },
  aclp: {
    leverage: 5, // up to 100% residential cost
    lowRate: 5, // below-market CMHC direct
    speed: 2, // longer underwriting
    forgivable: 0,
    amortization: 5, // 50-yr
    recourse: 3,
    minimalCommitments: 2, // 20% MFI requirement
    affordabilityFocus: 4,
  },
  ahf: {
    leverage: 5, // 95%+ with forgivable
    lowRate: 5,
    speed: 2,
    forgivable: 5, // $25–75K/unit forgivable, up to 40% of costs
    amortization: 5,
    recourse: 4, // generous for non-profit/gov't/Indigenous
    minimalCommitments: 1, // deep affordability required
    affordabilityFocus: 5,
  },
  chdp: {
    leverage: 5, // up to 100%
    lowRate: 5,
    speed: 2,
    forgivable: 5, // up to 1/3 forgivable
    amortization: 5,
    recourse: 4,
    minimalCommitments: 1,
    affordabilityFocus: 5,
  },
};

const PROGRAM_META: Record<
  string,
  { name: string; strengths: string[]; watchOuts: string[] }
> = {
  "mli-standard": {
    name: "MLI Standard",
    strengths: [
      "No affordability / energy / accessibility commitments required.",
      "Fastest closing workflow — well-understood by every approved lender.",
      "50-year amortization on new construction.",
    ],
    watchOuts: [
      "Max 85% LTV — requires more equity than MLI Select.",
      "Full recourse is standard.",
      "DCR floors of 1.20–1.30 at 7+ units bind earlier than Select's flat 1.10.",
    ],
  },
  "mli-select": {
    name: "MLI Select",
    strengths: [
      "Up to 95% LTV at tiers 2 and 3 (70+ points).",
      "Flat 1.10 minimum DCR across all tiers — lower than Standard.",
      "10 / 20 / 30% premium discount depending on tier.",
      "Limited recourse available at tier 3 (100+ points).",
    ],
    watchOuts: [
      "Requires ≥50 pts from affordability, energy and/or accessibility.",
      "Commitments are long-term (20 years for the affordability bonus).",
      "July 14 2025: amortization surcharges now apply (+0.25% per 5yr beyond 25).",
    ],
  },
  aclp: {
    name: "ACLP",
    strengths: [
      "Below-market CMHC-direct fixed rates.",
      "Up to 100% of residential cost financed.",
      "50-year amortization.",
    ],
    watchOuts: [
      "Minimum 20% of units at or below 30% MFI.",
      "Longer underwriting than approved-lender insured products.",
      "New construction focus — not a refinance vehicle.",
    ],
  },
  ahf: {
    name: "AHF",
    strengths: [
      "Forgivable $25–75K/unit (up to 40% of costs).",
      "Below-market rate on repayable portion.",
      "Recourse flexibility for non-profit / government / Indigenous sponsors.",
    ],
    watchOuts: [
      "Restricted to non-profit, government, and Indigenous borrowers.",
      "Deep affordability requirement.",
      "Application and underwriting timelines are longer than insured.",
    ],
  },
  chdp: {
    name: "CHDP",
    strengths: [
      "Forgivable + repayable loans up to 100% of eligible costs.",
      "Below-market rate on the repayable component.",
      "Designed specifically for co-op member affordability.",
    ],
    watchOuts: [
      "Housing co-operatives only.",
      "Long-term affordability and co-op governance commitments.",
      "CMHC-direct underwriting timelines.",
    ],
  },
};

export default function ProgramMatcher() {
  const [p, setP] = useState<Priorities>(INITIAL);

  const results = useMemo<ScoredProgram[]>(() => {
    const keys = Object.keys(FIT);
    const scored: ScoredProgram[] = keys.map((slug) => {
      const fits = FIT[slug];
      let score = 0;
      let max = 0;
      (Object.keys(p) as (keyof Priorities)[]).forEach((k) => {
        const weight = p[k];
        const fit = fits[k];
        score += weight * fit;
        max += weight * 5;
      });
      const meta = PROGRAM_META[slug];
      return {
        slug,
        program: meta.name,
        score,
        max,
        strengths: meta.strengths,
        watchOuts: meta.watchOuts,
      };
    });
    return scored.sort((a, b) => b.score - a.score);
  }, [p]);

  const top = results.slice(0, 3);
  const maxScore = Math.max(...results.map((r) => r.score), 1);

  function reset(): void {
    setP(INITIAL);
  }

  return (
    <div className="bg-obsidian text-foreground">
      {/* HEADER */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Program Suitability Matcher
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Rank the five CMHC programs against your priorities.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Rate eight factors on a 1–5 scale (1 = not important, 5 = critical).
            The matcher scores each program's fit on those factors and returns a
            ranked list with strengths and watch-outs.
          </p>
        </div>
      </section>

      {/* QUIZ */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <Card className="bg-jet border-dark-gray p-6">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Priorities
                </div>
                <Button variant="outline" size="sm" onClick={reset}>
                  Reset
                </Button>
              </div>

              <div className="mt-4 space-y-5">
                {QUESTIONS.map((q) => (
                  <div key={q.key}>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">{q.title}</Label>
                      <span className="text-sm text-star">{p[q.key]}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{q.helper}</p>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={p[q.key]}
                      onChange={(e) =>
                        setP((prev) => ({ ...prev, [q.key]: Number(e.target.value) }))
                      }
                      className="mt-2 w-full accent-star"
                    />
                    <div className="grid grid-cols-5 text-[10px] text-muted-foreground">
                      <span>1</span>
                      <span className="text-center">2</span>
                      <span className="text-center">3</span>
                      <span className="text-center">4</span>
                      <span className="text-right">5</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* RESULTS */}
            <div className="space-y-4">
              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Ranked fit
                </div>
                <div className="mt-3 space-y-3">
                  {results.map((r, i) => {
                    const pct = (r.score / maxScore) * 100;
                    const topThree = i < 3;
                    return (
                      <div key={r.slug}>
                        <div className="flex items-center justify-between text-sm">
                          <a
                            href={`/programs/${r.slug}`}
                            className={`font-medium ${topThree ? "text-star" : "text-foreground"} hover:underline`}
                          >
                            {i + 1}. {r.program}
                          </a>
                          <span className="text-xs text-muted-foreground">
                            {r.score} / {r.max}
                          </span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded bg-obsidian">
                          <div
                            className={`h-2 rounded ${topThree ? "bg-star" : "bg-star/40"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-star">
                  Top 3 recommendations
                </div>
                <div className="mt-4 space-y-4">
                  {top.map((r) => (
                    <div
                      key={r.slug}
                      className="rounded border border-dark-gray bg-obsidian p-4"
                    >
                      <div className="flex items-center justify-between">
                        <a
                          href={`/programs/${r.slug}`}
                          className="text-lg font-semibold hover:text-star"
                        >
                          {r.program}
                        </a>
                        <Badge className="bg-star/15 text-star border border-star/40">
                          {r.score} pts
                        </Badge>
                      </div>
                      <div className="mt-3 space-y-3 text-sm">
                        <div>
                          <div className="text-xs uppercase tracking-wide text-muted-foreground">
                            Strengths
                          </div>
                          <ul className="mt-1 space-y-1 text-muted-foreground">
                            {r.strengths.map((s, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="mt-1.5 block size-1 shrink-0 rounded-full bg-star" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wide text-muted-foreground">
                            Watch-outs
                          </div>
                          <ul className="mt-1 space-y-1 text-muted-foreground">
                            {r.watchOuts.map((s, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="mt-1.5 block size-1 shrink-0 rounded-full bg-mid-gray" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
