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
import { AFFORDABILITY_THRESHOLDS } from "@/data/cmhc";
import { currency, percent } from "@/lib/format";

type BedroomKey = "studio" | "oneBr" | "twoBr" | "threeBr";

interface UnitRow {
  key: BedroomKey;
  label: string;
  count: number;
  currentRent: number;
  marketRent: number;
}

const CMA_OPTIONS = [
  { key: "Toronto (low)", label: "Toronto (low)" },
  { key: "Toronto (high)", label: "Toronto (high)" },
  { key: "Vancouver (low)", label: "Vancouver (low)" },
  { key: "Vancouver (high)", label: "Vancouver (high)" },
  { key: "Calgary", label: "Calgary" },
  { key: "Edmonton (low)", label: "Edmonton (low)" },
  { key: "Edmonton (high)", label: "Edmonton (high)" },
  { key: "Other / manual", label: "Other / manual" },
];

const DEFAULT_UNITS: UnitRow[] = [
  {
    key: "studio",
    label: "Studio",
    count: 6,
    currentRent: 1400,
    marketRent: 1700,
  },
  {
    key: "oneBr",
    label: "1-bedroom",
    count: 24,
    currentRent: 1650,
    marketRent: 2100,
  },
  {
    key: "twoBr",
    label: "2-bedroom",
    count: 24,
    currentRent: 2000,
    marketRent: 2650,
  },
  {
    key: "threeBr",
    label: "3-bedroom",
    count: 6,
    currentRent: 2500,
    marketRent: 3200,
  },
];

export default function RentGap() {
  const [cmaKey, setCmaKey] = useState("Toronto (low)");
  const [manualAffordableCeiling, setManualAffordableCeiling] =
    useState(1500);
  const [vacancyPct, setVacancyPct] = useState(3);
  const [units, setUnits] = useState<UnitRow[]>(DEFAULT_UNITS);
  const [turnoverPct, setTurnoverPct] = useState(15);

  const affordableCeiling = useMemo(() => {
    if (cmaKey === "Other / manual") return manualAffordableCeiling;
    const row = AFFORDABILITY_THRESHOLDS.find((r) => r.cma === cmaKey);
    return row?.monthly ?? manualAffordableCeiling;
  }, [cmaKey, manualAffordableCeiling]);

  const totals = useMemo(() => {
    let totalUnits = 0;
    let currentAnnualRent = 0;
    let marketAnnualRent = 0;
    let qualifyingUnits = 0;
    let qualifyingUnitsAtMarket = 0;

    for (const u of units) {
      totalUnits += u.count;
      currentAnnualRent += u.currentRent * 12 * u.count;
      marketAnnualRent += u.marketRent * 12 * u.count;
      // Qualifies-for-Select if current rent is at or below affordable ceiling
      if (u.currentRent > 0 && u.currentRent <= affordableCeiling) {
        qualifyingUnits += u.count;
      }
      // Also test at market rent — a mark-to-market deal may erode affordability
      if (u.marketRent > 0 && u.marketRent <= affordableCeiling) {
        qualifyingUnitsAtMarket += u.count;
      }
    }

    const currentEgi = currentAnnualRent * (1 - vacancyPct / 100);
    const marketEgi = marketAnnualRent * (1 - vacancyPct / 100);
    const gapDollar = marketAnnualRent - currentAnnualRent;
    const gapPct =
      currentAnnualRent > 0
        ? (gapDollar / currentAnnualRent) * 100
        : 0;

    const qualifyingPct =
      totalUnits > 0 ? (qualifyingUnits / totalUnits) * 100 : 0;
    const qualifyingPctAtMarket =
      totalUnits > 0 ? (qualifyingUnitsAtMarket / totalUnits) * 100 : 0;

    return {
      totalUnits,
      currentAnnualRent,
      marketAnnualRent,
      currentEgi,
      marketEgi,
      gapDollar,
      gapPct,
      qualifyingUnits,
      qualifyingPct,
      qualifyingUnitsAtMarket,
      qualifyingPctAtMarket,
    };
  }, [units, vacancyPct, affordableCeiling]);

  // Projected NOI gain from closing gap over various horizons
  // Assume opex-to-EGI ratio holds; NOI lift ≈ EGI lift (simplification).
  // Annual fraction of units turned over at typical turnover rates.
  const noiProjection = useMemo(() => {
    const fullGapEgi = totals.marketEgi - totals.currentEgi;
    const fractionClosed = (yrs: number) =>
      Math.min(1, (turnoverPct / 100) * yrs);
    return {
      y2: fullGapEgi * fractionClosed(2),
      y5: fullGapEgi * fractionClosed(5),
      y10: fullGapEgi * fractionClosed(10),
      full: fullGapEgi,
    };
  }, [totals, turnoverPct]);

  // MLI Select affordability tests
  const selectTests = [
    { pct: 10, label: "10% of units (50 pts)" },
    { pct: 15, label: "15% of units (70 pts)" },
    { pct: 25, label: "25% of units (100 pts)" },
  ].map((t) => {
    const required = Math.ceil((t.pct / 100) * totals.totalUnits);
    return {
      ...t,
      required,
      meets: totals.qualifyingUnits >= required,
    };
  });

  const updateUnit = (
    idx: number,
    field: "count" | "currentRent" | "marketRent",
    value: number,
  ) => {
    setUnits((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Rent Gap &amp; Affordability Analyzer
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Quantify mark-to-market upside and MLI Select qualification.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Estimate the gap between in-place rents and market, project NOI
            lift as leases turn over, and test which units qualify under MLI
            Select's affordability criterion (rent at or below the 30%
            median-family-income ceiling for the CMA).
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Card className="bg-jet border-dark-gray p-6">
            <Label className="text-sm font-semibold">
              Location &amp; affordable ceiling
            </Label>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CMA_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setCmaKey(o.key)}
                  className={`rounded border px-3 py-2 text-xs transition-colors ${
                    cmaKey === o.key
                      ? "border-star/60 bg-star/5 text-star"
                      : "border-dark-gray hover:border-star/40"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {cmaKey === "Other / manual" && (
                <div>
                  <Label
                    htmlFor="mc"
                    className="text-xs text-muted-foreground"
                  >
                    Manual affordable ceiling ($/mo)
                  </Label>
                  <Input
                    id="mc"
                    type="number"
                    value={manualAffordableCeiling}
                    onChange={(e) =>
                      setManualAffordableCeiling(Number(e.target.value))
                    }
                  />
                </div>
              )}
              <div>
                <Label htmlFor="vac" className="text-xs text-muted-foreground">
                  Vacancy %
                </Label>
                <Input
                  id="vac"
                  type="number"
                  step="0.5"
                  value={vacancyPct}
                  onChange={(e) => setVacancyPct(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="to" className="text-xs text-muted-foreground">
                  Annual turnover %
                </Label>
                <Input
                  id="to"
                  type="number"
                  step="1"
                  value={turnoverPct}
                  onChange={(e) => setTurnoverPct(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="mt-4 rounded border border-star/40 bg-star/5 p-3 text-xs text-muted-foreground">
              <span className="text-star font-medium">
                Affordable ceiling:
              </span>{" "}
              {currency(affordableCeiling)}/mo. Units at or below this rent
              count toward MLI Select affordability commitments. See{" "}
              <a
                href="/underwriting/affordability"
                className="text-star underline underline-offset-2"
              >
                /underwriting/affordability
              </a>{" "}
              for the methodology.
            </div>
          </Card>

          <Card className="mt-6 bg-jet border-dark-gray p-6">
            <Label className="text-sm font-semibold">
              Unit mix · current &amp; market rents
            </Label>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr>
                    <th className="p-2 text-left font-normal">Type</th>
                    <th className="p-2 text-right font-normal">Count</th>
                    <th className="p-2 text-right font-normal">
                      Current rent
                    </th>
                    <th className="p-2 text-right font-normal">
                      Market rent
                    </th>
                    <th className="p-2 text-right font-normal">Gap $/mo</th>
                    <th className="p-2 text-right font-normal">
                      Affordable?
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((u, idx) => {
                    const gap = u.marketRent - u.currentRent;
                    const qualifies =
                      u.currentRent > 0 && u.currentRent <= affordableCeiling;
                    return (
                      <tr key={u.key} className="border-t border-dark-gray">
                        <td className="p-2">{u.label}</td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={u.count}
                            onChange={(e) =>
                              updateUnit(
                                idx,
                                "count",
                                Number(e.target.value),
                              )
                            }
                            className="h-8 w-20 text-right"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={u.currentRent}
                            onChange={(e) =>
                              updateUnit(
                                idx,
                                "currentRent",
                                Number(e.target.value),
                              )
                            }
                            className="h-8 w-24 text-right"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={u.marketRent}
                            onChange={(e) =>
                              updateUnit(
                                idx,
                                "marketRent",
                                Number(e.target.value),
                              )
                            }
                            className="h-8 w-24 text-right"
                          />
                        </td>
                        <td className="p-2 text-right">{currency(gap)}</td>
                        <td
                          className={`p-2 text-right ${
                            qualifies ? "text-star" : "text-muted-foreground"
                          }`}
                        >
                          {qualifies ? "Yes" : "No"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Current EGI
              </div>
              <div className="mt-2 text-3xl font-semibold">
                {currency(totals.currentEgi)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {currency(totals.currentAnnualRent)} gross · {vacancyPct}%
                vacancy
              </div>
            </Card>
            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Market EGI
              </div>
              <div className="mt-2 text-3xl font-semibold">
                {currency(totals.marketEgi)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {currency(totals.marketAnnualRent)} gross
              </div>
            </Card>
            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Rent gap
              </div>
              <div className="mt-2 text-3xl font-semibold text-star">
                {currency(totals.gapDollar)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {percent(totals.gapPct)} uplift potential
              </div>
            </Card>
          </div>

          <Card className="mt-8 bg-jet border-dark-gray p-6">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Projected NOI lift from closing the gap · {turnoverPct}% annual
              turnover
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-4">
              <Stat
                label="Year 2"
                value={currency(noiProjection.y2)}
                sub={`${percent(Math.min(100, turnoverPct * 2))} closed`}
              />
              <Stat
                label="Year 5"
                value={currency(noiProjection.y5)}
                sub={`${percent(Math.min(100, turnoverPct * 5))} closed`}
              />
              <Stat
                label="Year 10"
                value={currency(noiProjection.y10)}
                sub={`${percent(Math.min(100, turnoverPct * 10))} closed`}
              />
              <Stat
                label="Full gap"
                value={currency(noiProjection.full)}
                sub="100% achieved"
                accent
              />
            </div>
          </Card>

          <Card className="mt-8 bg-jet border-dark-gray p-6">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              MLI Select affordability test (existing building)
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {totals.qualifyingUnits} of {totals.totalUnits} units (
              {percent(totals.qualifyingPct)}) are at or below the{" "}
              {currency(affordableCeiling)}/mo ceiling.
            </div>
            <div className="mt-2 rounded border border-dark-gray bg-obsidian p-3 text-xs text-muted-foreground">
              At market rent: {totals.qualifyingUnitsAtMarket} of{" "}
              {totals.totalUnits} units ({percent(totals.qualifyingPctAtMarket)}) would meet the affordability cap.
            </div>
            <div className="mt-4 overflow-hidden rounded border border-dark-gray">
              <table className="w-full text-sm">
                <thead className="bg-obsidian text-muted-foreground">
                  <tr>
                    <th className="p-2 text-left font-normal">Tier</th>
                    <th className="p-2 text-right font-normal">
                      Required units
                    </th>
                    <th className="p-2 text-right font-normal">Qualifying</th>
                    <th className="p-2 text-right font-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectTests.map((t) => (
                    <tr
                      key={t.pct}
                      className={
                        t.meets ? "text-star" : "border-t border-dark-gray"
                      }
                    >
                      <td className="p-2">{t.label}</td>
                      <td className="p-2 text-right">{t.required}</td>
                      <td className="p-2 text-right">
                        {totals.qualifyingUnits}
                      </td>
                      <td className="p-2 text-right">
                        {t.meets ? "Qualifies" : "Shortfall"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Existing-building thresholds are 40% / 60% / 80% of units for
              the 50 / 70 / 100-point tiers. New-construction thresholds are
              10% / 15% / 25% — shown above. For refinances of existing
              buildings, refer to the higher existing thresholds and the
              full point-scoring framework.
            </p>
          </Card>

          <Card className="mt-6 bg-jet border-dark-gray p-6 text-sm">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Learn more
            </div>
            <p className="mt-2 text-muted-foreground">
              The affordability ceiling is roughly the 30% median family
              income threshold for renter households in each CMA. See{" "}
              <a
                href="/underwriting/affordability"
                className="text-star underline underline-offset-2"
              >
                underwriting affordability
              </a>{" "}
              for the full rules, current thresholds, and the 20-year
              commitment bonus.
            </p>
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
                  EGI is gross annual rent × (1 − vacancy). Rent gap is
                  annual market rent minus annual current rent. NOI lift
                  projections use a simplifying assumption that NOI uplift
                  tracks EGI uplift (opex ratio constant) and that units
                  turn over at the chosen annual rate up to 100%.
                </p>
                <p>
                  MLI Select affordability thresholds use the approximate
                  2025-2026 30%-MFI rent ceilings by CMA published by CMHC.
                  New-construction tiers require 10% / 15% / 25% of units
                  affordable for 50 / 70 / 100 points; existing buildings
                  require 40% / 60% / 80%. The 20-year commitment bonus
                  (+30 points) is not scored here — see the point scorer.
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
