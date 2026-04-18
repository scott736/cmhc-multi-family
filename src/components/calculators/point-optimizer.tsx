import { useMemo, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ACCESSIBILITY_SCORING,
  AFFORDABILITY_BONUS_20YR,
  AFFORDABILITY_SCORING_EXISTING,
  AFFORDABILITY_SCORING_NEW,
  ENERGY_SCORING_EXISTING,
  ENERGY_SCORING_NEW,
} from "@/data/cmhc";
import { currency } from "@/lib/format";
import {
  type AccessibilityLevel,
  type ProjectType,
  scoreProject,
} from "@/lib/points";

type TargetTier = 50 | 70 | 100;
type RankStrategy = "minAffordability" | "minEnergy" | "noAccessibility" | "balanced";

interface Path {
  affUnitPct: number; // 0 if no affordability contribution
  affPoints: number;
  energyValue: number; // % improvement (NECB for new, reduction for existing)
  energyPoints: number;
  accessibilityLevel: AccessibilityLevel;
  accessibilityPoints: number;
  commitment20yr: boolean;
  bonus: number;
  total: number;
  estAnnualRentConcessionPerUnit: number; // $/unit/yr (affordable units)
  estEnergyCostPremiumPct: number; // % premium on hard costs
  estAccessibilityCostPremiumPct: number;
}

// Order-of-magnitude cost implication estimates (see methodology accordion).
function energyPremiumPct(energyPct: number): number {
  if (energyPct <= 0) return 0;
  if (energyPct < 25) return 1.0;
  if (energyPct < 50) return 3.0;
  if (energyPct < 60) return 5.0;
  return 8.0;
}

function accessibilityPremiumPct(level: AccessibilityLevel): number {
  if (level === 1) return 1.0;
  if (level === 2) return 3.5;
  return 0;
}

export default function PointOptimizer() {
  const [projectType, setProjectType] = useState<ProjectType>("new");
  const [targetTier, setTargetTier] = useState<TargetTier>(70);
  const [startingAffPct, setStartingAffPct] = useState(0);
  const [startingEnergyPct, setStartingEnergyPct] = useState(0);
  const [startingAccessibility, setStartingAccessibility] =
    useState<AccessibilityLevel>(0);
  const [strategy, setStrategy] = useState<RankStrategy>("balanced");
  // Assumed per-unit market rent for $-estimate (affordability concession)
  const [marketRentPerUnit, setMarketRentPerUnit] = useState(2200);
  const [affordableCeilingPerUnit, setAffordableCeilingPerUnit] = useState(1500);

  const paths = useMemo<Path[]>(() => {
    const out: Path[] = [];
    const affTable =
      projectType === "new" ? AFFORDABILITY_SCORING_NEW : AFFORDABILITY_SCORING_EXISTING;
    const energyTable = projectType === "new" ? ENERGY_SCORING_NEW : ENERGY_SCORING_EXISTING;

    // Affordability candidates: only seed 0 when there's no starting
    // commitment; otherwise enforce the user-stated floor.
    const affCandidates: { unitPct: number }[] =
      startingAffPct === 0 ? [{ unitPct: 0 }] : [];
    for (const l of affTable) {
      if (l.unitPct >= startingAffPct) affCandidates.push({ unitPct: l.unitPct });
    }
    if (startingAffPct > 0) {
      // Allow the starting value too
      const inserted = affCandidates.some((a) => a.unitPct === startingAffPct);
      if (!inserted) affCandidates.push({ unitPct: startingAffPct });
    }

    // Energy candidates: same floor logic as affordability.
    const energyCandidates: { value: number }[] =
      startingEnergyPct === 0 ? [{ value: 0 }] : [];
    for (const l of energyTable) {
      // For new: use NECB column as the canonical threshold
      const v = projectType === "new"
        ? (l as (typeof ENERGY_SCORING_NEW)[number]).necb
        : (l as (typeof ENERGY_SCORING_EXISTING)[number]).reductionPct;
      if (v >= startingEnergyPct) energyCandidates.push({ value: v });
    }
    if (startingEnergyPct > 0) {
      const inserted = energyCandidates.some((e) => e.value === startingEnergyPct);
      if (!inserted) energyCandidates.push({ value: startingEnergyPct });
    }

    // Accessibility candidates: from starting level up
    const accLevels: AccessibilityLevel[] = [0, 1, 2].filter(
      (l) => l >= startingAccessibility,
    ) as AccessibilityLevel[];

    for (const aff of affCandidates) {
      for (const energy of energyCandidates) {
        for (const acc of accLevels) {
          for (const twenty of [false, true]) {
            const res = scoreProject({
              projectType,
              affordabilityUnitPct: aff.unitPct,
              commitment20yr: twenty,
              energyStandard: "necb",
              energyValue: energy.value,
              accessibilityLevel: acc,
            });
            if (res.total < targetTier) continue;
            // Keep only combinations that actually reach the target tier
            const path: Path = {
              affUnitPct: aff.unitPct,
              affPoints: res.affordability,
              energyValue: energy.value,
              energyPoints: res.energy,
              accessibilityLevel: acc,
              accessibilityPoints: res.accessibility,
              commitment20yr: twenty,
              bonus: res.bonus,
              total: res.total,
              estAnnualRentConcessionPerUnit:
                Math.max(0, marketRentPerUnit - affordableCeilingPerUnit) * 12,
              estEnergyCostPremiumPct: energyPremiumPct(energy.value),
              estAccessibilityCostPremiumPct: accessibilityPremiumPct(acc),
            };
            out.push(path);
          }
        }
      }
    }

    // Deduplicate: same combination without 20-yr bonus if identical outcome
    const key = (p: Path) =>
      `${p.affUnitPct}|${p.energyValue}|${p.accessibilityLevel}|${p.commitment20yr}`;
    const seen = new Set<string>();
    const unique = out.filter((p) => {
      const k = key(p);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    return unique;
  }, [
    projectType,
    targetTier,
    startingAffPct,
    startingEnergyPct,
    startingAccessibility,
    marketRentPerUnit,
    affordableCeilingPerUnit,
  ]);

  const ranked = useMemo<Path[]>(() => {
    const copy = [...paths];
    switch (strategy) {
      case "minAffordability":
        copy.sort(
          (a, b) =>
            a.affUnitPct - b.affUnitPct ||
            a.estEnergyCostPremiumPct - b.estEnergyCostPremiumPct ||
            b.total - a.total,
        );
        break;
      case "minEnergy":
        copy.sort(
          (a, b) =>
            a.energyValue - b.energyValue ||
            a.affUnitPct - b.affUnitPct ||
            b.total - a.total,
        );
        break;
      case "noAccessibility":
        copy.sort(
          (a, b) =>
            a.accessibilityLevel - b.accessibilityLevel ||
            a.affUnitPct - b.affUnitPct ||
            a.energyValue - b.energyValue,
        );
        break;
      case "balanced":
      default: {
        // Minimise a weighted "effort" score
        const score = (p: Path) =>
          p.affUnitPct * 1.2 +
          p.estEnergyCostPremiumPct * 5 +
          p.estAccessibilityCostPremiumPct * 6 -
          (p.total - targetTier) * 0.1;
        copy.sort((a, b) => score(a) - score(b));
        break;
      }
    }
    return copy.slice(0, 10);
  }, [paths, strategy, targetTier]);

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            MLI Select · Point Optimizer
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Find the cheapest path to your target tier.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Enumerates every combination of affordability, energy and
            accessibility that reaches your target (50 / 70 / 100 pts), then
            ranks them by the dimension you care about — least rent concession,
            least construction upgrade, or no accessibility commitment.
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
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
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Starting position</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Commitments you already plan to make. Paths below will equal
                  or exceed these.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="saf" className="text-xs text-muted-foreground">
                      Affordability %
                    </Label>
                    <input
                      id="saf"
                      type="number"
                      value={startingAffPct}
                      min={0}
                      max={100}
                      onChange={(e) => setStartingAffPct(Number(e.target.value))}
                      className="mt-1 w-full rounded border border-dark-gray bg-obsidian px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sen" className="text-xs text-muted-foreground">
                      Energy %
                    </Label>
                    <input
                      id="sen"
                      type="number"
                      value={startingEnergyPct}
                      min={0}
                      max={100}
                      onChange={(e) => setStartingEnergyPct(Number(e.target.value))}
                      className="mt-1 w-full rounded border border-dark-gray bg-obsidian px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Accessibility</Label>
                    <div className="mt-1 grid grid-cols-3 gap-1">
                      {([0, 1, 2] as AccessibilityLevel[]).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setStartingAccessibility(l)}
                          className={`rounded border px-2 py-1 text-xs ${
                            startingAccessibility === l
                              ? "border-star/60 bg-star/5 text-star"
                              : "border-dark-gray hover:border-star/40"
                          }`}
                        >
                          L{l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Ranking strategy</Label>
                <div className="mt-3 grid gap-2">
                  {([
                    { v: "minAffordability", l: "Lowest affordability required" },
                    { v: "minEnergy", l: "Lowest energy % required" },
                    { v: "noAccessibility", l: "No accessibility required" },
                    { v: "balanced", l: "Best all-around balance" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setStrategy(opt.v)}
                      className={`rounded border px-3 py-2 text-left text-sm transition-colors ${
                        strategy === opt.v
                          ? "border-star/60 bg-star/5 text-star"
                          : "border-dark-gray hover:border-star/40"
                      }`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Rent inputs (for $ estimates)</Label>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="mkr" className="text-xs text-muted-foreground">
                      Market rent / unit
                    </Label>
                    <input
                      id="mkr"
                      type="number"
                      value={marketRentPerUnit}
                      onChange={(e) => setMarketRentPerUnit(Number(e.target.value))}
                      className="mt-1 w-full rounded border border-dark-gray bg-obsidian px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="afr" className="text-xs text-muted-foreground">
                      Affordable ceiling / unit
                    </Label>
                    <input
                      id="afr"
                      type="number"
                      value={affordableCeilingPerUnit}
                      onChange={(e) => setAffordableCeilingPerUnit(Number(e.target.value))}
                      className="mt-1 w-full rounded border border-dark-gray bg-obsidian px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Concession/unit/yr: {currency(
                    Math.max(0, (marketRentPerUnit - affordableCeilingPerUnit) * 12),
                  )}
                </p>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {ranked.length} of {paths.length} qualifying paths shown · ranked by strategy
              </div>
              {ranked.length === 0 && (
                <Card className="bg-jet border-dark-gray p-6 text-sm text-muted-foreground">
                  No combinations reach {targetTier} points from your starting
                  position. Lower the target tier or relax the starting
                  commitments.
                </Card>
              )}
              {ranked.map((p, idx) => (
                <Card key={idx} className="bg-jet border-dark-gray p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Path {idx + 1}
                      </div>
                      <div className="mt-1 text-2xl font-semibold text-star">
                        {p.total} pts
                      </div>
                    </div>
                    {p.commitment20yr && (
                      <Badge className="bg-star/15 text-star border border-star/40">
                        +{AFFORDABILITY_BONUS_20YR} bonus · 20-yr
                      </Badge>
                    )}
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded border border-dark-gray p-3">
                      <div className="text-xs text-muted-foreground">Affordability</div>
                      <div className="mt-1 text-lg font-medium">
                        {p.affUnitPct}% units
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.affPoints} pts
                        {p.affPoints > 0 && (
                          <span>
                            {" · "}~{currency(p.estAnnualRentConcessionPerUnit)}/unit/yr
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="rounded border border-dark-gray p-3">
                      <div className="text-xs text-muted-foreground">Energy</div>
                      <div className="mt-1 text-lg font-medium">
                        {p.energyValue}% {projectType === "new" ? "better" : "reduction"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.energyPoints} pts
                        {p.energyPoints > 0 && (
                          <span> · ~+{p.estEnergyCostPremiumPct}% hard cost</span>
                        )}
                      </div>
                    </div>
                    <div className="rounded border border-dark-gray p-3">
                      <div className="text-xs text-muted-foreground">Accessibility</div>
                      <div className="mt-1 text-lg font-medium">
                        {p.accessibilityLevel === 0
                          ? "None"
                          : p.accessibilityLevel === 1
                            ? `Level 1 (${ACCESSIBILITY_SCORING[0].points} pts)`
                            : `Level 2 (${ACCESSIBILITY_SCORING[1].points} pts)`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.accessibilityPoints} pts
                        {p.accessibilityPoints > 0 && (
                          <span> · ~+{p.estAccessibilityCostPremiumPct}% hard cost</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
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
                  The optimizer enumerates every combination of affordability
                  threshold (10 / 15 / 25% for new; 40 / 60 / 80% for
                  existing), energy tier threshold (20 / 35 / 50 pts
                  thresholds), accessibility level (0 / 1 / 2), and the 20-year
                  commitment switch, then filters to combinations that score at
                  least the target tier using the same {`\`scoreProject\``}
                  function that powers the Point Scorer. Duplicates (same
                  inputs) are removed.
                </p>
                <p>
                  Cost implication estimates are order-of-magnitude only and
                  disclosed here so you can override them with your own data:
                  affordability concession is computed as (market rent −
                  affordable ceiling) × 12 per affordable unit; energy hard-cost
                  premium is assumed at 1% (up to 25% better), 3% (25–50%), 5%
                  (50–60%) and 8% (60%+); accessibility premium is 1% at Level
                  1 and 3.5% at Level 2. These approximate published studies on
                  Canadian multi-unit construction uplifts and should be
                  refined with your cost consultant.
                </p>
                <p>
                  The 20-year commitment adds {AFFORDABILITY_BONUS_20YR} bonus
                  points but only when at least one level of affordability
                  points is earned. The ranking strategies minimise the named
                  dimension and use the other dimensions as tiebreakers;
                  "balanced" minimises a weighted effort score with a small
                  bonus for points above the target.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="disclaimer" className="border-dark-gray">
              <AccordionTrigger>Disclaimer</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Results are estimates for educational purposes. Confirm all
                program terms with CMHC and an approved lender. Construction
                premium estimates are generic and will differ materially by
                market, building typology and design approach.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
}
