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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AFFORDABILITY_BONUS_20YR,
  AFFORDABILITY_SCORING_EXISTING,
  AFFORDABILITY_SCORING_NEW,
  AFFORDABILITY_THRESHOLDS,
} from "@/data/cmhc";
import { currency } from "@/lib/format";
import { type ProjectType } from "@/lib/points";

type TargetTier = 50 | 70 | 100;

const CUSTOM_CMA = "Custom";

export default function AffordabilitySizer() {
  const [projectType, setProjectType] = useState<ProjectType>("new");
  const [cma, setCma] = useState<string>("Calgary");
  const [customCeiling, setCustomCeiling] = useState(1600);
  const [totalUnits, setTotalUnits] = useState(80);
  const [marketRent, setMarketRent] = useState(2200);
  const [targetTier, setTargetTier] = useState<TargetTier>(70);
  const [commitment20yr, setCommitment20yr] = useState(true);

  const affTable =
    projectType === "new" ? AFFORDABILITY_SCORING_NEW : AFFORDABILITY_SCORING_EXISTING;

  const affordableCeiling = useMemo(() => {
    if (cma === CUSTOM_CMA) return customCeiling;
    const match = AFFORDABILITY_THRESHOLDS.find((t) => t.cma === cma);
    return match?.monthly ?? customCeiling;
  }, [cma, customCeiling]);

  // Given a target tier and 20-year bonus, find the minimum affordability
  // level required to reach target. Points earned must be >= tier, net of bonus.
  const required = useMemo(() => {
    const bonus = commitment20yr ? AFFORDABILITY_BONUS_20YR : 0;
    // Affordability alone; assume no energy/accessibility so we isolate the
    // affordability requirement (users stack on the Point Scorer).
    const needFromAff = targetTier - bonus;
    const match = affTable.find((l) => l.points >= needFromAff);
    if (!match) {
      // Not achievable from affordability alone
      return null;
    }
    return match;
  }, [targetTier, commitment20yr, affTable]);

  // Without 20-yr: how many units required to hit target from affordability alone?
  const requiredNoBonus = useMemo(() => {
    return affTable.find((l) => l.points >= targetTier) ?? null;
  }, [targetTier, affTable]);

  const affordableUnitCount = required ? Math.ceil((required.unitPct / 100) * totalUnits) : 0;
  const concessionPerUnit = Math.max(0, marketRent - affordableCeiling);
  const annualRevenueImpact = concessionPerUnit * affordableUnitCount * 12;
  const perAffordableUnitAnnual = concessionPerUnit * 12;

  // "What does 20-yr bonus buy you?": compare required units with vs. without bonus
  const savedUnits = useMemo(() => {
    if (!required) return 0;
    if (!requiredNoBonus) return 0;
    const withBonus = Math.ceil((required.unitPct / 100) * totalUnits);
    const withoutBonus = Math.ceil((requiredNoBonus.unitPct / 100) * totalUnits);
    return Math.max(0, withoutBonus - withBonus);
  }, [required, requiredNoBonus, totalUnits]);

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            MLI Select · Affordability Unit Sizer
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Size your affordable unit commitment.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Given your target tier, CMA, and unit count, this tool returns how
            many affordable units you need, the per-unit rent concession, and
            the total annual NOI impact — plus whether the 20-year commitment
            bonus unlocks a lower-threshold tier.
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-6">
              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Project type</Label>
                <Tabs
                  value={projectType}
                  onValueChange={(v) => setProjectType(v as ProjectType)}
                  className="mt-3"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="new">New construction</TabsTrigger>
                    <TabsTrigger value="existing">Existing property</TabsTrigger>
                  </TabsList>
                </Tabs>
                <p className="mt-3 text-xs text-muted-foreground">
                  {projectType === "new"
                    ? "New construction thresholds: 10 / 15 / 25% of units."
                    : "Existing property thresholds: 40 / 60 / 80% of units."}
                </p>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Target tier</Label>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {([50, 70, 100] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTargetTier(t)}
                      className={`rounded border px-3 py-2 text-sm transition-colors ${
                        targetTier === t
                          ? "border-star/60 bg-star/5 text-star"
                          : "border-dark-gray hover:border-star/40"
                      }`}
                    >
                      {t} pts
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between rounded border border-dark-gray bg-obsidian p-3">
                  <div>
                    <div className="text-sm font-medium">20-year commitment</div>
                    <div className="text-xs text-muted-foreground">
                      Adds +{AFFORDABILITY_BONUS_20YR} bonus points.
                    </div>
                  </div>
                  <Switch checked={commitment20yr} onCheckedChange={setCommitment20yr} />
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Property</Label>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">CMA</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {[...AFFORDABILITY_THRESHOLDS.map((t) => t.cma), CUSTOM_CMA].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCma(c)}
                          className={`rounded border px-2 py-2 text-xs transition-colors ${
                            cma === c
                              ? "border-star/60 bg-star/5 text-star"
                              : "border-dark-gray hover:border-star/40"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  {cma === CUSTOM_CMA && (
                    <div className="sm:col-span-2">
                      <Label htmlFor="custom" className="text-xs text-muted-foreground">
                        Custom affordable ceiling ($/month)
                      </Label>
                      <Input
                        id="custom"
                        type="number"
                        value={customCeiling}
                        onChange={(e) => setCustomCeiling(Number(e.target.value))}
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="units" className="text-xs text-muted-foreground">
                      Total project units
                    </Label>
                    <Input
                      id="units"
                      type="number"
                      value={totalUnits}
                      onChange={(e) => setTotalUnits(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mkt" className="text-xs text-muted-foreground">
                      Market rent ($/month)
                    </Label>
                    <Input
                      id="mkt"
                      type="number"
                      value={marketRent}
                      onChange={(e) => setMarketRent(Number(e.target.value))}
                    />
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Required affordable units
                  </div>
                  <div className="mt-2 text-4xl font-semibold text-star">
                    {required ? affordableUnitCount : "—"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {required
                      ? `${required.unitPct}% of ${totalUnits} (Level ${required.level} · ${required.points} pts affordability)`
                      : "Target not reachable from affordability alone — stack energy or accessibility via Point Scorer."}
                  </div>
                </Card>
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Annual revenue impact
                  </div>
                  <div className="mt-2 text-4xl font-semibold">
                    {currency(annualRevenueImpact)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {currency(perAffordableUnitAnnual)}/unit/yr concession ×{" "}
                    {affordableUnitCount} units
                  </div>
                </Card>
              </div>

              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Concession math
                </div>
                <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded border border-dark-gray p-3">
                    <dt className="text-xs text-muted-foreground">Market rent</dt>
                    <dd className="mt-1 text-lg font-medium">{currency(marketRent)}</dd>
                  </div>
                  <div className="rounded border border-dark-gray p-3">
                    <dt className="text-xs text-muted-foreground">Affordable ceiling</dt>
                    <dd className="mt-1 text-lg font-medium">{currency(affordableCeiling)}</dd>
                  </div>
                  <div className="rounded border border-dark-gray p-3">
                    <dt className="text-xs text-muted-foreground">Concession / unit / mo</dt>
                    <dd className="mt-1 text-lg font-medium text-star">
                      {currency(concessionPerUnit)}
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-muted-foreground">
                  NOI impact equals the revenue impact assuming no offsetting
                  opex change; use the cash-flow calculator to model the hit to
                  debt service coverage and cash-on-cash.
                </p>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  20-year bonus leverage
                </div>
                {commitment20yr && required && requiredNoBonus ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Committing 20 years saves approximately{" "}
                    <span className="text-foreground font-medium">
                      {savedUnits} units
                    </span>{" "}
                    of affordable inventory vs. a shorter commitment at the
                    same target tier (Level {required.level} with bonus vs.
                    Level {requiredNoBonus.level} without).
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Toggle the 20-year commitment on to see how many fewer
                    affordable units are needed at the same target tier.
                  </p>
                )}
              </Card>

              <Card className="bg-jet border-dark-gray p-0 overflow-hidden">
                <div className="border-b border-dark-gray bg-obsidian px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                  Affordable ceiling lookup (all CMAs)
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-obsidian text-muted-foreground">
                    <tr>
                      <th className="p-3 text-left font-normal">CMA</th>
                      <th className="p-3 text-right font-normal">Monthly ceiling</th>
                      <th className="p-3 text-right font-normal">Concession vs. your market rent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AFFORDABILITY_THRESHOLDS.map((t) => (
                      <tr
                        key={t.cma}
                        className={`border-t border-dark-gray ${
                          cma === t.cma ? "text-star" : ""
                        }`}
                      >
                        <td className="p-3">{t.cma}</td>
                        <td className="p-3 text-right">{currency(t.monthly)}</td>
                        <td className="p-3 text-right text-muted-foreground">
                          {currency(Math.max(0, marketRent - t.monthly))}/mo
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  Required affordable units is computed by subtracting the
                  20-year bonus (30 pts when enabled) from the target tier and
                  finding the smallest affordability level whose points meet
                  the remainder. Thresholds are 10 / 15 / 25% of units for new
                  construction and 40 / 60 / 80% for existing properties — the
                  scoring tables published by CMHC.
                </p>
                <p>
                  Affordable rent ceilings are the approximate 2025–2026
                  thresholds (30% of median renter household income) by CMA.
                  For authoritative rents, confirm with CMHC's current ceiling
                  table or the GreenBirch affordable unit lookup; small
                  rounding differences are common.
                </p>
                <p>
                  Annual revenue impact equals (market rent − affordable
                  ceiling) × 12 × affordable unit count. This equals NOI impact
                  only if opex is unchanged; in practice, opex on affordable
                  units is near-identical to market-rent units, so the NOI
                  approximation is tight.
                </p>
                <p>
                  The 20-year bonus applies only when at least one level of
                  affordability points is earned. It cannot be combined with a
                  0% affordability commitment.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="disclaimer" className="border-dark-gray">
              <AccordionTrigger>Disclaimer</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Results are estimates for educational purposes. Confirm all
                program terms and current ceilings with CMHC and an approved
                lender.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
}
