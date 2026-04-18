import { useMemo, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currency, percent } from "@/lib/format";

type AdvanceCap = 50 | 75 | 85;

interface DrawMilestone {
  label: string;
  monthOffset: number; // fraction 0..1 of term
  cumulativePct: number; // cumulative % of construction loan drawn
}

const DEFAULT_SCHEDULE: DrawMilestone[] = [
  { label: "Closing", monthOffset: 0, cumulativePct: 10 },
  { label: "25% complete", monthOffset: 0.25, cumulativePct: 25 },
  { label: "50% complete", monthOffset: 0.5, cumulativePct: 50 },
  { label: "75% complete", monthOffset: 0.75, cumulativePct: 75 },
  { label: "Substantial completion", monthOffset: 0.9, cumulativePct: 85 },
  { label: "Rental achievement / stabilization", monthOffset: 1.0, cumulativePct: 100 },
];

interface MonthRow {
  month: number;
  phase: string;
  cumulativeDrawnPct: number;
  cumulativeDrawn: number;
  drawThisMonth: number;
  openingBalance: number;
  interest: number;
  interestCapitalized: number;
  endingBalance: number;
  cumulativeInterest: number;
}

export default function ConstructionDraws() {
  const [totalProjectCost, setTotalProjectCost] = useState(25_000_000);
  const [advanceCap, setAdvanceCap] = useState<AdvanceCap>(85);
  const [constructionLoan, setConstructionLoan] = useState(21_250_000);
  const [rate, setRate] = useState(7.25);
  const [termMonths, setTermMonths] = useState(24);
  const [interestOnly, setInterestOnly] = useState(true);
  const [capitalizeInterest, setCapitalizeInterest] = useState(true);
  const [expectedTakeout, setExpectedTakeout] = useState(21_250_000);

  // Build the per-month draw schedule by interpolating cumulative % across months.
  const schedule = useMemo(() => {
    const sched: { month: number; phase: string; cumulativePct: number }[] = [];
    for (let m = 0; m <= termMonths; m++) {
      const t = termMonths > 0 ? m / termMonths : 0;
      // Find the milestones this month falls between
      let prev = DEFAULT_SCHEDULE[0];
      let next = DEFAULT_SCHEDULE[DEFAULT_SCHEDULE.length - 1];
      for (let i = 0; i < DEFAULT_SCHEDULE.length - 1; i++) {
        if (t >= DEFAULT_SCHEDULE[i].monthOffset && t <= DEFAULT_SCHEDULE[i + 1].monthOffset) {
          prev = DEFAULT_SCHEDULE[i];
          next = DEFAULT_SCHEDULE[i + 1];
          break;
        }
      }
      const range = next.monthOffset - prev.monthOffset;
      const frac = range > 0 ? (t - prev.monthOffset) / range : 0;
      const cumulativePct = prev.cumulativePct + frac * (next.cumulativePct - prev.cumulativePct);
      // Tag the phase label using the nearest upcoming milestone
      const phase = next.label;
      sched.push({ month: m, phase, cumulativePct });
    }
    return sched;
  }, [termMonths]);

  const rows = useMemo<MonthRow[]>(() => {
    const r = rate / 100 / 12;
    let balance = 0;
    let cumulativeDrawn = 0;
    let cumulativeInterest = 0;
    const out: MonthRow[] = [];

    for (let m = 1; m <= termMonths; m++) {
      const prevCumPct = schedule[m - 1]?.cumulativePct ?? 0;
      const thisCumPct = schedule[m]?.cumulativePct ?? prevCumPct;
      const draw = ((thisCumPct - prevCumPct) / 100) * constructionLoan;

      const opening = balance;
      // Advance the draw at the start of the month
      balance += draw;
      cumulativeDrawn += draw;

      const interest = balance * r;
      cumulativeInterest += interest;
      const interestCapitalized = capitalizeInterest ? interest : 0;
      // Interest-only: no principal paydown. If IO=false we still treat as IO during construction
      // since amortization on a construction loan pre-stabilization is unusual; this toggle is
      // preserved for completeness but has no principal-reduction effect here.
      if (capitalizeInterest) {
        balance += interest;
      }

      out.push({
        month: m,
        phase: schedule[m]?.phase ?? "",
        cumulativeDrawnPct: thisCumPct,
        cumulativeDrawn,
        drawThisMonth: draw,
        openingBalance: opening,
        interest,
        interestCapitalized,
        endingBalance: balance,
        cumulativeInterest,
      });
    }
    return out;
  }, [termMonths, schedule, constructionLoan, rate, capitalizeInterest]);

  const lastRow = rows[rows.length - 1];
  const totalInterestReserve = lastRow?.cumulativeInterest ?? 0;
  const takeoutRequired = capitalizeInterest
    ? lastRow?.endingBalance ?? constructionLoan
    : (lastRow?.cumulativeDrawn ?? constructionLoan) + totalInterestReserve;
  const takeoutSurplus = expectedTakeout - takeoutRequired;

  const loanToCostPct = totalProjectCost > 0 ? (constructionLoan / totalProjectCost) * 100 : 0;
  const capExceedsAdvance = loanToCostPct > advanceCap + 0.0001;

  const downloadCsv = () => {
    const header = [
      "Month",
      "Phase",
      "Cumulative drawn %",
      "Draw this month",
      "Cumulative drawn",
      "Opening balance",
      "Interest",
      "Interest capitalized",
      "Ending balance",
      "Cumulative interest",
    ].join(",");
    const body = rows
      .map((r) =>
        [
          r.month,
          `"${r.phase}"`,
          r.cumulativeDrawnPct.toFixed(2),
          r.drawThisMonth.toFixed(0),
          r.cumulativeDrawn.toFixed(0),
          r.openingBalance.toFixed(0),
          r.interest.toFixed(0),
          r.interestCapitalized.toFixed(0),
          r.endingBalance.toFixed(0),
          r.cumulativeInterest.toFixed(0),
        ].join(","),
      )
      .join("\n");
    const csv = `${header}\n${body}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cmhc-construction-draws.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Construction · Draw schedule &amp; interest reserve
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Model your construction draws and interest reserve.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Month-by-month outstanding balance, interest accrual, and cumulative
            draws across your construction term. Sizes the interest reserve and
            checks the takeout against your expected permanent loan. Reflects
            the July 3, 2025 removal of MLI Market Rental holdbacks —
            construction can now advance to 85% without a rental-achievement
            holdback.
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
            <div className="space-y-6">
              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Project &amp; loan</Label>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="cost" className="text-xs text-muted-foreground">
                      Total project cost
                    </Label>
                    <Input
                      id="cost"
                      type="number"
                      value={totalProjectCost}
                      onChange={(e) => setTotalProjectCost(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cl" className="text-xs text-muted-foreground">
                      Construction loan
                    </Label>
                    <Input
                      id="cl"
                      type="number"
                      value={constructionLoan}
                      onChange={(e) => setConstructionLoan(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rate" className="text-xs text-muted-foreground">
                      Construction rate %
                    </Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="term" className="text-xs text-muted-foreground">
                      Term (months)
                    </Label>
                    <Input
                      id="term"
                      type="number"
                      value={termMonths}
                      onChange={(e) => setTermMonths(Math.max(1, Number(e.target.value)))}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="takeout" className="text-xs text-muted-foreground">
                      Expected takeout loan
                    </Label>
                    <Input
                      id="takeout"
                      type="number"
                      value={expectedTakeout}
                      onChange={(e) => setExpectedTakeout(Number(e.target.value))}
                    />
                  </div>
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Advance cap</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Maximum loan-to-cost the lender/insurer will advance during
                  construction. MLI Market Rental supports 85% post-July 3 2025.
                </p>
                <Tabs
                  value={String(advanceCap)}
                  onValueChange={(v) => setAdvanceCap(Number(v) as AdvanceCap)}
                  className="mt-3"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="50">50% LTC</TabsTrigger>
                    <TabsTrigger value="75">75% LTC</TabsTrigger>
                    <TabsTrigger value="85">85% LTC</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="mt-3 text-xs text-muted-foreground">
                  Loan-to-cost at inputs: {percent(loanToCostPct)}
                  {capExceedsAdvance ? (
                    <span className="ml-2 text-star">(exceeds selected cap)</span>
                  ) : null}
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Draw behaviour</Label>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between rounded border border-dark-gray bg-obsidian p-3">
                    <div>
                      <div className="text-sm font-medium">Interest-only during construction</div>
                      <div className="text-xs text-muted-foreground">
                        Typical. Principal amortization does not begin until
                        stabilization.
                      </div>
                    </div>
                    <Switch checked={interestOnly} onCheckedChange={setInterestOnly} />
                  </div>
                  <div className="flex items-center justify-between rounded border border-dark-gray bg-obsidian p-3">
                    <div>
                      <div className="text-sm font-medium">Capitalize interest (interest reserve)</div>
                      <div className="text-xs text-muted-foreground">
                        Interest adds to the outstanding balance each month
                        instead of being paid in cash.
                      </div>
                    </div>
                    <Switch checked={capitalizeInterest} onCheckedChange={setCapitalizeInterest} />
                  </div>
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Default draw curve</Label>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {DEFAULT_SCHEDULE.map((d) => (
                    <div key={d.label} className="flex items-center justify-between">
                      <span>{d.label}</span>
                      <span className="text-foreground">
                        {percent(d.monthOffset * 100, 0)} of term → {d.cumulativePct}% drawn
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Button variant="outline" onClick={downloadCsv}>
                Download CSV
              </Button>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Interest reserve required
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-star">
                    {currency(totalInterestReserve)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Total interest accrued over {termMonths}-month term
                  </div>
                </Card>
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Takeout required
                  </div>
                  <div className="mt-2 text-3xl font-semibold">{currency(takeoutRequired)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Last-month balance {capitalizeInterest ? "(incl. capitalized interest)" : "+ accrued interest"}
                  </div>
                </Card>
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Takeout surplus / shortfall
                  </div>
                  <div
                    className={`mt-2 text-3xl font-semibold ${
                      takeoutSurplus >= 0 ? "text-star" : "text-foreground"
                    }`}
                  >
                    {currency(takeoutSurplus)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Expected takeout {currency(expectedTakeout)} − required
                  </div>
                </Card>
              </div>

              <Card className="bg-jet border-dark-gray p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-obsidian text-muted-foreground">
                      <tr>
                        <th className="p-3 text-left font-normal">Mo</th>
                        <th className="p-3 text-left font-normal">Phase</th>
                        <th className="p-3 text-right font-normal">Cum %</th>
                        <th className="p-3 text-right font-normal">Draw</th>
                        <th className="p-3 text-right font-normal">Cum drawn</th>
                        <th className="p-3 text-right font-normal">Interest</th>
                        <th className="p-3 text-right font-normal">End balance</th>
                        <th className="p-3 text-right font-normal">Cum interest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.month} className="border-t border-dark-gray">
                          <td className="p-3">{r.month}</td>
                          <td className="p-3 text-muted-foreground">{r.phase}</td>
                          <td className="p-3 text-right">{percent(r.cumulativeDrawnPct, 1)}</td>
                          <td className="p-3 text-right text-muted-foreground">
                            {currency(r.drawThisMonth)}
                          </td>
                          <td className="p-3 text-right">{currency(r.cumulativeDrawn)}</td>
                          <td className="p-3 text-right text-muted-foreground">
                            {currency(r.interest)}
                          </td>
                          <td className="p-3 text-right">{currency(r.endingBalance)}</td>
                          <td className="p-3 text-right text-star">{currency(r.cumulativeInterest)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-dark-gray bg-jet">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Accordion type="single" collapsible className="max-w-3xl">
            <AccordionItem value="methodology" className="border-dark-gray">
              <AccordionTrigger>Methodology and assumptions</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  Draws are distributed across the construction term by linearly
                  interpolating the cumulative draw percentage between the
                  default milestones: 10% at closing, 25% at 25% complete, 50%
                  at 50%, 75% at 75%, 85% at substantial completion, and 100%
                  at rental achievement.
                </p>
                <p>
                  Interest accrues monthly on the outstanding balance. When
                  capitalize-interest is on (typical for an interest reserve),
                  each month's interest is added to the balance and grows the
                  takeout requirement. Principal amortization does not begin
                  until the takeout closes.
                </p>
                <p>
                  <span className="text-star">July 3, 2025:</span> CMHC removed
                  rental-achievement holdbacks for MLI Market Rental
                  construction. Projects can now advance to 85% LTC without the
                  prior holdback, materially reducing equity required at
                  substantial completion. MLI Select projects may still face
                  rental-achievement conditions depending on the program
                  refresh.
                </p>
                <p>
                  The takeout is computed as the final ending balance (if
                  interest is capitalized) or last-draw balance plus accrued
                  interest (if paid in cash from reserve). Monthly compounding
                  is used as a simplification of Canadian semi-annual
                  compounding; impact on typical construction balances is under
                  5 basis points.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="disclaimer" className="border-dark-gray">
              <AccordionTrigger>Disclaimer</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Results are estimates for educational purposes. Confirm all
                program terms with CMHC and an approved lender.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
}
