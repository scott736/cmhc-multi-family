import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Mode = "forecast" | "backschedule";

interface Phase {
  key: string;
  name: string;
  minDays: number;
  maxDays: number;
  description: string;
  parallelWith?: string;
}

const PHASES: Phase[] = [
  {
    key: "pre-app",
    name: "Pre-application preparation",
    minDays: 7,
    maxDays: 21,
    description:
      "Deal packaging, rent roll and financial statements assembly, initial program scan, broker engagement.",
  },
  {
    key: "lender",
    name: "Lender engagement & selection",
    minDays: 3,
    maxDays: 5,
    description:
      "Parallel approved-lender conversations and term-sheet comparison. Must select lender before CMHC submission (Sep 2024 policy).",
  },
  {
    key: "appraisal",
    name: "Appraisal ordered & delivered",
    minDays: 14,
    maxDays: 28,
    description:
      "Mandatory for all deal sizes since November 2024. Order promptly after lender selection.",
  },
  {
    key: "docs",
    name: "Financials & documentation (parallel)",
    minDays: 7,
    maxDays: 14,
    description:
      "Runs in parallel with appraisal. Phase I ESA, Quantity Surveyor (if construction), operating statements, rent roll, personal net worth, corporate financials.",
    parallelWith: "appraisal",
  },
  {
    key: "submission",
    name: "MULTI-GO submission",
    minDays: 1,
    maxDays: 3,
    description: "Approved lender files the application through CMHC's MULTI-GO portal.",
  },
  {
    key: "underwriting",
    name: "CMHC underwriting",
    minDays: 14,
    maxDays: 42,
    description:
      "CMHC review and conditional approval. 4–12+ weeks is typical post-Sept 2024.",
  },
  {
    key: "conditions",
    name: "Condition satisfaction",
    minDays: 7,
    maxDays: 14,
    description:
      "Borrower delivers any outstanding items required by CMHC conditional approval (updated appraisal, environmental, bonding).",
  },
  {
    key: "coi",
    name: "CoI issued",
    minDays: 1,
    maxDays: 3,
    description:
      "Certificate of Insurance issued to the approved lender. CoI transfer between lenders restricted since Sep 3, 2025.",
  },
  {
    key: "funding",
    name: "Funding",
    minDays: 5,
    maxDays: 14,
    description:
      "Lender legal, title, disbursements, and final advance (or first construction draw).",
  },
];

function totalDays(range: "min" | "max"): number {
  let total = 0;
  for (const p of PHASES) {
    if (p.parallelWith) continue; // parallel phases don't add to critical path
    total += range === "min" ? p.minDays : p.maxDays;
  }
  return total;
}

function parseISO(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  return isNaN(date.getTime()) ? null : date;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function today(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

export default function TimelineTracker() {
  const [mode, setMode] = useState<Mode>("forecast");
  const [startDate, setStartDate] = useState<string>(formatDate(today()));
  const [targetDate, setTargetDate] = useState<string>(formatDate(addDays(today(), 120)));

  const critTotalMin = useMemo(() => totalDays("min"), []);
  const critTotalMax = useMemo(() => totalDays("max"), []);

  const schedule = useMemo(() => {
    const anchor =
      mode === "forecast"
        ? parseISO(startDate) ?? today()
        : parseISO(targetDate) ?? addDays(today(), 120);

    if (mode === "forecast") {
      // Forward schedule using midpoint durations
      let cursor = anchor;
      return PHASES.map((p) => {
        // Parallel phases share the same start as the phase they're parallel with
        if (p.parallelWith) {
          const parent = PHASES.find((x) => x.key === p.parallelWith);
          const parentStart = cursor; // cursor hasn't advanced for parallel
          void parent;
          const mid = Math.round((p.minDays + p.maxDays) / 2);
          return {
            key: p.key,
            name: p.name,
            start: parentStart,
            end: addDays(parentStart, mid),
            minDays: p.minDays,
            maxDays: p.maxDays,
            description: p.description,
            parallel: true,
          };
        }
        const mid = Math.round((p.minDays + p.maxDays) / 2);
        const start = cursor;
        const end = addDays(start, mid);
        cursor = end;
        return {
          key: p.key,
          name: p.name,
          start,
          end,
          minDays: p.minDays,
          maxDays: p.maxDays,
          description: p.description,
          parallel: false,
        };
      });
    } else {
      // Back-schedule from anchor target date using midpoint durations
      // Walk phases in reverse along the critical path.
      const seq = [...PHASES].filter((p) => !p.parallelWith);
      const ends: Record<string, Date> = {};
      const starts: Record<string, Date> = {};
      let cursor = anchor;
      for (let i = seq.length - 1; i >= 0; i--) {
        const p = seq[i];
        const mid = Math.round((p.minDays + p.maxDays) / 2);
        const end = cursor;
        const start = addDays(end, -mid);
        ends[p.key] = end;
        starts[p.key] = start;
        cursor = start;
      }
      // Parallel phases share their parent's start
      return PHASES.map((p) => {
        if (p.parallelWith) {
          const parentStart = starts[p.parallelWith] ?? anchor;
          const mid = Math.round((p.minDays + p.maxDays) / 2);
          return {
            key: p.key,
            name: p.name,
            start: parentStart,
            end: addDays(parentStart, mid),
            minDays: p.minDays,
            maxDays: p.maxDays,
            description: p.description,
            parallel: true,
          };
        }
        return {
          key: p.key,
          name: p.name,
          start: starts[p.key],
          end: ends[p.key],
          minDays: p.minDays,
          maxDays: p.maxDays,
          description: p.description,
          parallel: false,
        };
      });
    }
  }, [mode, startDate, targetDate]);

  // Compute overall date range for the Gantt bar layout
  const overallStart = useMemo(() => {
    const dates = schedule.map((s) => s.start.getTime());
    return new Date(Math.min(...dates));
  }, [schedule]);
  const overallEnd = useMemo(() => {
    const dates = schedule.map((s) => s.end.getTime());
    return new Date(Math.max(...dates));
  }, [schedule]);
  const totalSpan = Math.max(
    1,
    (overallEnd.getTime() - overallStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="bg-obsidian text-foreground">
      {/* HEADER */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Application Timeline Tracker
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Map the CMHC application end-to-end.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Nine critical-path phases from pre-application through funding.
            Typical critical path: {critTotalMin}–{critTotalMax} days. Forecast
            a funding date from today, or back-schedule start dates from a
            target close.
          </p>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-8 lg:px-12 lg:py-12">
          <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
            <Card className="bg-jet border-dark-gray p-6">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Mode
              </Label>
              <Tabs
                value={mode}
                onValueChange={(v) => setMode(v as Mode)}
                className="mt-3"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="forecast">Forecast from today</TabsTrigger>
                  <TabsTrigger value="backschedule">Back-schedule</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="mt-4">
                {mode === "forecast" ? (
                  <div>
                    <Label htmlFor="start" className="text-xs text-muted-foreground">
                      Start date
                    </Label>
                    <Input
                      id="start"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="target" className="text-xs text-muted-foreground">
                      Target funding date
                    </Label>
                    <Input
                      id="target"
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 rounded border border-dark-gray bg-obsidian p-3 text-xs text-muted-foreground">
                Midpoint durations used for scheduling. Fast deals track the
                minimum; complex or retrofit projects can exceed the maximum.
              </div>
            </Card>

            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Summary
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded border border-dark-gray bg-obsidian p-3">
                  <div className="text-xs text-muted-foreground">
                    {mode === "forecast" ? "Projected funding" : "Must start by"}
                  </div>
                  <div className="mt-1 font-semibold text-star">
                    {mode === "forecast"
                      ? formatDate(schedule[schedule.length - 1].end)
                      : formatDate(schedule[0].start)}
                  </div>
                </div>
                <div className="rounded border border-dark-gray bg-obsidian p-3">
                  <div className="text-xs text-muted-foreground">Critical path</div>
                  <div className="mt-1 font-semibold">
                    {critTotalMin}–{critTotalMax} days
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Since September 2024, borrowers must select a lender before
                CMHC submission, and CoI transfer between lenders was further
                restricted in September 2025.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* GANTT */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-10 lg:px-12 lg:py-16">
          <div className="overflow-x-auto rounded-lg border border-dark-gray bg-jet">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-dark-gray text-muted-foreground text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left font-medium">Phase</th>
                  <th className="px-4 py-3 text-left font-medium">Duration</th>
                  <th className="px-4 py-3 text-left font-medium">Start</th>
                  <th className="px-4 py-3 text-left font-medium">End</th>
                  <th className="px-4 py-3 text-left font-medium">Timeline</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((s) => {
                  const startOffset =
                    ((s.start.getTime() - overallStart.getTime()) /
                      (1000 * 60 * 60 * 24) /
                      totalSpan) *
                    100;
                  const widthPct = Math.max(
                    2,
                    (((s.end.getTime() - s.start.getTime()) / (1000 * 60 * 60 * 24)) /
                      totalSpan) *
                      100,
                  );
                  return (
                    <tr key={s.key} className="border-b border-dark-gray/60 last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-medium">{s.name}</div>
                        {s.parallel && (
                          <div className="text-[10px] uppercase tracking-wide text-star">
                            Parallel
                          </div>
                        )}
                        <div className="mt-1 text-xs text-muted-foreground">
                          {s.description}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {s.minDays}–{s.maxDays}d
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{formatDate(s.start)}</td>
                      <td className="px-4 py-3 font-mono text-xs">{formatDate(s.end)}</td>
                      <td className="px-4 py-3">
                        <div className="relative h-3 w-full rounded bg-obsidian">
                          <div
                            className={`absolute top-0 h-3 rounded ${
                              s.parallel ? "bg-star/40" : "bg-star"
                            }`}
                            style={{
                              left: `${startOffset}%`,
                              width: `${widthPct}%`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Overall window: {formatDate(overallStart)} → {formatDate(overallEnd)} (
            {Math.round(totalSpan)} days). Parallel phases run concurrently and do not
            extend the critical path.
          </p>
        </div>
      </section>
    </div>
  );
}
