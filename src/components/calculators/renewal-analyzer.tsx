import { useMemo, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currency, percent } from "@/lib/format";
import {
  amortizationSchedule,
  annualDebtService,
} from "@/lib/loan";

type RateScenario = "hold" | "m100" | "p100" | "p200" | "p300";

const SCENARIOS: { key: RateScenario; label: string; delta: number }[] = [
  { key: "m100", label: "−100 bps", delta: -1 },
  { key: "hold", label: "Rates hold", delta: 0 },
  { key: "p100", label: "+100 bps", delta: 1 },
  { key: "p200", label: "+200 bps", delta: 2 },
  { key: "p300", label: "+300 bps", delta: 3 },
];

type RenewalAmort = "remaining" | "reset25" | "reset30" | "reset40" | "reset50";

const RENEWAL_AMORT_OPTIONS: { key: RenewalAmort; label: string }[] = [
  { key: "remaining", label: "Keep remaining" },
  { key: "reset25", label: "Reset 25yr" },
  { key: "reset30", label: "Reset 30yr" },
  { key: "reset40", label: "Reset 40yr" },
  { key: "reset50", label: "Reset 50yr" },
];

export default function RenewalAnalyzer() {
  const [origLoan, setOrigLoan] = useState(15_000_000);
  const [origRate, setOrigRate] = useState(3.5);
  const [origAmort, setOrigAmort] = useState(40);
  const [yearsIntoTerm, setYearsIntoTerm] = useState(10);
  const [noi, setNoi] = useState(950_000);
  const [noiGrowthPct, setNoiGrowthPct] = useState(2.5);

  const [scenario, setScenario] = useState<RateScenario>("p200");
  const [renewalAmortMode, setRenewalAmortMode] =
    useState<RenewalAmort>("remaining");

  // Projected balance at years-into-term (use original loan amort sched)
  const scheduleAll = useMemo(
    () =>
      amortizationSchedule(
        {
          principal: origLoan,
          annualRate: origRate / 100,
          amortYears: origAmort,
        },
        Math.max(1, yearsIntoTerm),
      ),
    [origLoan, origRate, origAmort, yearsIntoTerm],
  );

  const balanceAtMaturity =
    scheduleAll[yearsIntoTerm - 1]?.endingBalance ?? origLoan;

  // NOI at maturity
  const noiAtMaturity =
    noi * Math.pow(1 + noiGrowthPct / 100, yearsIntoTerm);

  const remainingAmort = Math.max(1, origAmort - yearsIntoTerm);

  const newAmortYears = useMemo(() => {
    switch (renewalAmortMode) {
      case "remaining":
        return remainingAmort;
      case "reset25":
        return 25;
      case "reset30":
        return 30;
      case "reset40":
        return 40;
      case "reset50":
        return 50;
    }
  }, [renewalAmortMode, remainingAmort]);

  // Original debt service (for comparison)
  const origAds = useMemo(
    () =>
      annualDebtService({
        principal: origLoan,
        annualRate: origRate / 100,
        amortYears: origAmort,
      }),
    [origLoan, origRate, origAmort],
  );

  const scenarioResults = useMemo(() => {
    return SCENARIOS.map((s) => {
      const newRate = origRate + s.delta;
      const ads = annualDebtService({
        principal: balanceAtMaturity,
        annualRate: newRate / 100,
        amortYears: newAmortYears,
      });
      const dcr = ads > 0 ? noiAtMaturity / ads : 0;
      const paymentShockDollar = ads - origAds;
      const paymentShockPct = origAds > 0 ? (ads / origAds - 1) * 100 : 0;
      const cashFlowDelta = noiAtMaturity - ads - (noi - origAds);
      return {
        ...s,
        newRate,
        ads,
        dcr,
        paymentShockDollar,
        paymentShockPct,
        cashFlowDelta,
      };
    });
  }, [balanceAtMaturity, newAmortYears, noiAtMaturity, origAds, origRate, noi]);

  const selected =
    scenarioResults.find((r) => r.key === scenario) ?? scenarioResults[2];

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Renewal / Maturity Analyzer
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Stress-test your next renewal.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Project your loan balance at maturity, model the renewal at
            several rate scenarios, and see payment shock in dollars and
            percent. The post-September 3, 2025 Certificate of Insurance
            transfer restrictions make this renewal planning more
            consequential — lenders can no longer rescue a CoI shopped to
            them mid-stream.
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Card className="bg-jet border-dark-gray p-6">
            <Label className="text-sm font-semibold">Original loan</Label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="ol" className="text-xs text-muted-foreground">
                  Original loan
                </Label>
                <Input
                  id="ol"
                  type="number"
                  value={origLoan}
                  onChange={(e) => setOrigLoan(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="or" className="text-xs text-muted-foreground">
                  Original rate (%)
                </Label>
                <Input
                  id="or"
                  type="number"
                  step="0.01"
                  value={origRate}
                  onChange={(e) => setOrigRate(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="oa" className="text-xs text-muted-foreground">
                  Original amort (yrs)
                </Label>
                <Input
                  id="oa"
                  type="number"
                  value={origAmort}
                  onChange={(e) => setOrigAmort(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="yi" className="text-xs text-muted-foreground">
                  Years until maturity
                </Label>
                <Input
                  id="yi"
                  type="number"
                  value={yearsIntoTerm}
                  onChange={(e) => setYearsIntoTerm(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="noi" className="text-xs text-muted-foreground">
                  Current NOI
                </Label>
                <Input
                  id="noi"
                  type="number"
                  value={noi}
                  onChange={(e) => setNoi(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="ng" className="text-xs text-muted-foreground">
                  NOI growth % / yr
                </Label>
                <Input
                  id="ng"
                  type="number"
                  step="0.1"
                  value={noiGrowthPct}
                  onChange={(e) => setNoiGrowthPct(Number(e.target.value))}
                />
              </div>
            </div>
          </Card>

          <Card className="mt-6 bg-jet border-dark-gray p-6">
            <Label className="text-sm font-semibold">
              Rate scenario at renewal
            </Label>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {SCENARIOS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setScenario(s.key)}
                  className={`rounded border px-3 py-2 text-sm transition-colors ${
                    scenario === s.key
                      ? "border-star/60 bg-star/5 text-star"
                      : "border-dark-gray hover:border-star/40"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <Label className="mt-5 block text-sm font-semibold">
              Amortization at renewal
            </Label>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {RENEWAL_AMORT_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setRenewalAmortMode(o.key)}
                  className={`rounded border px-3 py-2 text-sm transition-colors ${
                    renewalAmortMode === o.key
                      ? "border-star/60 bg-star/5 text-star"
                      : "border-dark-gray hover:border-star/40"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Re-extending amortization on a renewal is only straightforward
              if MLI Select re-qualification is still available.
              Post-September 3, 2025, Certificate of Insurance transfer
              between lenders is restricted — plan your renewal with your
              current lender early.
            </p>
          </Card>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Balance at maturity
              </div>
              <div className="mt-2 text-3xl font-semibold text-star">
                {currency(balanceAtMaturity)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {percent(
                  origLoan > 0
                    ? ((origLoan - balanceAtMaturity) / origLoan) * 100
                    : 0,
                )}{" "}
                principal paid down
              </div>
            </Card>
            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                NOI at maturity
              </div>
              <div className="mt-2 text-3xl font-semibold text-star">
                {currency(noiAtMaturity)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Compounded {noiGrowthPct}% over {yearsIntoTerm} yrs
              </div>
            </Card>
            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Remaining amortization
              </div>
              <div className="mt-2 text-3xl font-semibold">
                {newAmortYears} yrs
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {renewalAmortMode === "remaining"
                  ? "Keep remaining schedule"
                  : `Reset to ${newAmortYears}-yr schedule`}
              </div>
            </Card>
          </div>

          <Card className="mt-8 bg-jet border-dark-gray p-6">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Selected scenario · {selected.label} · renewal rate{" "}
              {selected.newRate.toFixed(2)}%
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat
                label="New ADS"
                value={currency(selected.ads)}
                sub={`was ${currency(origAds)}`}
              />
              <Stat
                label="DCR at maturity"
                value={`${selected.dcr.toFixed(2)}x`}
                sub={selected.dcr < 1.1 ? "Below 1.10x floor" : "OK"}
                accent={selected.dcr >= 1.1}
              />
              <Stat
                label="Payment shock ($)"
                value={currency(selected.paymentShockDollar)}
                sub={percent(selected.paymentShockPct)}
                accent={selected.paymentShockDollar <= 0}
              />
              <Stat
                label="Cash flow Δ"
                value={currency(selected.cashFlowDelta)}
                sub={
                  selected.cashFlowDelta >= 0
                    ? "Improved"
                    : "Compressed"
                }
                accent={selected.cashFlowDelta >= 0}
              />
            </div>
          </Card>

          <Card className="mt-8 bg-jet border-dark-gray p-6">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              All scenarios at chosen amortization ({newAmortYears}-yr)
            </div>
            <div className="mt-4 overflow-hidden rounded border border-dark-gray">
              <table className="w-full text-sm">
                <thead className="bg-obsidian text-muted-foreground">
                  <tr>
                    <th className="p-2 text-left font-normal">Scenario</th>
                    <th className="p-2 text-right font-normal">Rate</th>
                    <th className="p-2 text-right font-normal">ADS</th>
                    <th className="p-2 text-right font-normal">DCR</th>
                    <th className="p-2 text-right font-normal">Shock $</th>
                    <th className="p-2 text-right font-normal">Shock %</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarioResults.map((r) => (
                    <tr
                      key={r.key}
                      className={
                        scenario === r.key
                          ? "text-star"
                          : "border-t border-dark-gray"
                      }
                    >
                      <td className="p-2">{r.label}</td>
                      <td className="p-2 text-right">
                        {r.newRate.toFixed(2)}%
                      </td>
                      <td className="p-2 text-right">{currency(r.ads)}</td>
                      <td className="p-2 text-right">{r.dcr.toFixed(2)}x</td>
                      <td className="p-2 text-right">
                        {currency(r.paymentShockDollar)}
                      </td>
                      <td className="p-2 text-right">
                        {percent(r.paymentShockPct)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      <section className="border-b border-dark-gray bg-jet">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Accordion type="single" collapsible className="max-w-3xl">
            <AccordionItem value="methodology" className="border-dark-gray">
              <AccordionTrigger>Methodology and assumptions</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  Balance at maturity is computed from a month-by-month
                  amortization schedule at the original rate and amortization.
                  NOI at maturity applies compounded annual growth.
                  Renewal debt service is computed on the projected balance,
                  new rate, and chosen amortization path (keep remaining or
                  reset to 25/30/40/50 yrs).
                </p>
                <p>
                  Effective September 3, 2025, CMHC tightened Certificate of
                  Insurance transfer rules — approved lenders must fund ≥80%
                  of their approved loans, and transferring a CoI between
                  lenders is restricted. Start renewal conversations with the
                  incumbent lender well before maturity. A 50-yr reset at
                  renewal requires ongoing MLI Select qualification.
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

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded border border-dark-gray bg-obsidian p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={`mt-1 text-xl font-semibold ${accent ? "text-star" : ""}`}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
