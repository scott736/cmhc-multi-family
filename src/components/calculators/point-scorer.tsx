import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AFFORDABILITY_SCORING_NEW,
  AFFORDABILITY_SCORING_EXISTING,
  ENERGY_SCORING_NEW,
  ENERGY_SCORING_EXISTING,
  ACCESSIBILITY_SCORING,
  AFFORDABILITY_BONUS_20YR,
} from "@/data/cmhc";
import {
  scoreProject,
  type ProjectType,
  type EnergyStandard,
  type AccessibilityLevel,
} from "@/lib/points";
import { percent } from "@/lib/format";

export default function PointScorer() {
  const [projectType, setProjectType] = useState<ProjectType>("new");
  const [affPct, setAffPct] = useState(25);
  const [commitment20yr, setCommitment20yr] = useState(true);
  const [energyStandard, setEnergyStandard] = useState<EnergyStandard>("necb");
  const [energyValue, setEnergyValue] = useState(60);
  const [accessibilityLevel, setAccessibilityLevel] = useState<AccessibilityLevel>(1);

  const result = useMemo(
    () =>
      scoreProject({
        projectType,
        affordabilityUnitPct: affPct,
        commitment20yr,
        energyStandard,
        energyValue,
        accessibilityLevel,
      }),
    [projectType, affPct, commitment20yr, energyStandard, energyValue, accessibilityLevel],
  );

  const affTable =
    projectType === "new" ? AFFORDABILITY_SCORING_NEW : AFFORDABILITY_SCORING_EXISTING;

  const tierColor =
    result.tier === 100
      ? "text-star"
      : result.tier === 70
        ? "text-star"
        : result.tier === 50
          ? "text-foreground"
          : "text-muted-foreground";

  return (
    <div className="bg-obsidian text-foreground">
      {/* HEADER */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            MLI Select · Point Scorer
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Score your MLI Select project.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Combine affordability, energy efficiency and accessibility to see
            which tier (50 / 70 / 100) you qualify for — and the LTV,
            amortization, minimum DCR and premium discount that come with it.
            Minimum 50 points to qualify.
          </p>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            {/* INPUTS */}
            <div className="space-y-6">
              {/* Project type */}
              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Project type
                </Label>
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
                    ? "Affordability thresholds: 10% / 15% / 25% of units at or below 30% of median renter household income."
                    : "Affordability thresholds for existing properties are higher: 40% / 60% / 80% of units."}
                </p>
              </Card>

              {/* Affordability */}
              <Card className="bg-jet border-dark-gray p-6">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Affordability</Label>
                  <Badge variant="secondary">Up to 100 pts</Badge>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="aff-pct" className="text-xs text-muted-foreground">
                      % of units committed affordable
                    </Label>
                    <span className="text-sm font-medium">{affPct}%</span>
                  </div>
                  <input
                    id="aff-pct"
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={affPct}
                    onChange={(e) => setAffPct(Number(e.target.value))}
                    className="w-full accent-star"
                  />
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    {affTable.map((l) => (
                      <div
                        key={l.level}
                        className={`rounded border px-2 py-1 ${
                          affPct >= l.unitPct
                            ? "border-star/50 text-star"
                            : "border-dark-gray"
                        }`}
                      >
                        Level {l.level}: ≥{l.unitPct}% → {l.points} pts
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between rounded border border-dark-gray bg-obsidian p-3">
                  <div>
                    <div className="text-sm font-medium">20-year commitment</div>
                    <div className="text-xs text-muted-foreground">
                      Adds +{AFFORDABILITY_BONUS_20YR} bonus points when affordability points are earned.
                    </div>
                  </div>
                  <Switch checked={commitment20yr} onCheckedChange={setCommitment20yr} />
                </div>
              </Card>

              {/* Energy efficiency */}
              <Card className="bg-jet border-dark-gray p-6">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Energy efficiency</Label>
                  <Badge variant="secondary">Up to 50 pts</Badge>
                </div>

                {projectType === "new" ? (
                  <>
                    <div className="mt-4">
                      <Label className="text-xs text-muted-foreground">Standard tracked</Label>
                      <Tabs
                        value={energyStandard}
                        onValueChange={(v) => setEnergyStandard(v as EnergyStandard)}
                        className="mt-2"
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="necb">NECB (commercial)</TabsTrigger>
                          <TabsTrigger value="nbc">NBC (residential)</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="energy-new" className="text-xs text-muted-foreground">
                          % better than {energyStandard.toUpperCase()} Tier 1
                        </Label>
                        <span className="text-sm font-medium">{energyValue}%</span>
                      </div>
                      <input
                        id="energy-new"
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={energyValue}
                        onChange={(e) => setEnergyValue(Number(e.target.value))}
                        className="w-full accent-star"
                      />
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        {ENERGY_SCORING_NEW.map((l) => {
                          const thr = energyStandard === "necb" ? l.necb : l.nbc;
                          return (
                            <div
                              key={l.level}
                              className={`rounded border px-2 py-1 ${
                                energyValue >= thr
                                  ? "border-star/50 text-star"
                                  : "border-dark-gray"
                              }`}
                            >
                              L{l.level}: ≥{thr}% → {l.points} pts
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="energy-existing" className="text-xs text-muted-foreground">
                        GHG / energy reduction vs. baseline
                      </Label>
                      <span className="text-sm font-medium">{energyValue}%</span>
                    </div>
                    <input
                      id="energy-existing"
                      type="range"
                      min={0}
                      max={60}
                      step={1}
                      value={energyValue}
                      onChange={(e) => setEnergyValue(Number(e.target.value))}
                      className="w-full accent-star"
                    />
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      {ENERGY_SCORING_EXISTING.map((l) => (
                        <div
                          key={l.level}
                          className={`rounded border px-2 py-1 ${
                            energyValue >= l.reductionPct
                              ? "border-star/50 text-star"
                              : "border-dark-gray"
                          }`}
                        >
                          L{l.level}: ≥{l.reductionPct}% → {l.points} pts
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Accessibility */}
              <Card className="bg-jet border-dark-gray p-6">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Accessibility</Label>
                  <Badge variant="secondary">Up to 30 pts</Badge>
                </div>
                <div className="mt-4 grid gap-2">
                  {[
                    { level: 0 as AccessibilityLevel, label: "None", pts: 0, req: "No accessibility commitment" },
                    {
                      level: 1 as AccessibilityLevel,
                      label: "Level 1",
                      pts: ACCESSIBILITY_SCORING[0].points,
                      req: ACCESSIBILITY_SCORING[0].requirement,
                    },
                    {
                      level: 2 as AccessibilityLevel,
                      label: "Level 2",
                      pts: ACCESSIBILITY_SCORING[1].points,
                      req: ACCESSIBILITY_SCORING[1].requirement,
                    },
                  ].map((opt) => (
                    <button
                      key={opt.level}
                      type="button"
                      onClick={() => setAccessibilityLevel(opt.level)}
                      className={`rounded border px-3 py-2 text-left text-sm transition-colors ${
                        accessibilityLevel === opt.level
                          ? "border-star/60 bg-star/5"
                          : "border-dark-gray hover:border-star/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{opt.label}</span>
                        <span className="text-xs text-muted-foreground">{opt.pts} pts</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{opt.req}</p>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* OUTPUTS */}
            <div className="lg:sticky lg:top-6 self-start space-y-6">
              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Total score
                </div>
                <div className="mt-2 flex items-baseline gap-3">
                  <div className={`text-5xl font-semibold ${tierColor}`}>{result.total}</div>
                  <div className="text-sm text-muted-foreground">points</div>
                </div>
                {result.tier > 0 ? (
                  <Badge className="mt-3 bg-star/15 text-star border border-star/40">
                    Tier qualified: {result.tier} points
                  </Badge>
                ) : (
                  <Badge variant="outline" className="mt-3 border-dark-gray text-muted-foreground">
                    Below 50 — not eligible for MLI Select
                  </Badge>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded border border-dark-gray p-3">
                    <div className="text-xs text-muted-foreground">Affordability</div>
                    <div className="mt-1 font-medium">{result.affordability} pts</div>
                  </div>
                  <div className="rounded border border-dark-gray p-3">
                    <div className="text-xs text-muted-foreground">20-yr bonus</div>
                    <div className="mt-1 font-medium">{result.bonus} pts</div>
                  </div>
                  <div className="rounded border border-dark-gray p-3">
                    <div className="text-xs text-muted-foreground">Energy</div>
                    <div className="mt-1 font-medium">{result.energy} pts</div>
                  </div>
                  <div className="rounded border border-dark-gray p-3">
                    <div className="text-xs text-muted-foreground">Accessibility</div>
                    <div className="mt-1 font-medium">{result.accessibility} pts</div>
                  </div>
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Tier benefits
                </div>
                {result.tierInfo ? (
                  <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Max LTV (new)</dt>
                      <dd className="mt-1 text-2xl font-semibold text-star">
                        {result.tierInfo.maxLtvNew}%
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Max LTV (existing)</dt>
                      <dd className="mt-1 text-2xl font-semibold text-star">
                        {result.tierInfo.maxLtvExisting}%
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Max amortization</dt>
                      <dd className="mt-1 text-2xl font-semibold">
                        {result.tierInfo.maxAmort} yrs
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Premium discount</dt>
                      <dd className="mt-1 text-2xl font-semibold text-star">
                        {percent(result.tierInfo.discount * 100, 0)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Minimum DCR</dt>
                      <dd className="mt-1 text-2xl font-semibold">{result.tierInfo.dcr}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Recourse</dt>
                      <dd className="mt-1 text-2xl font-semibold">{result.tierInfo.recourse}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Reach 50 points to unlock tier 1 benefits. Options: commit
                    10% of units at affordability (new construction, 50 pts
                    base + 30 bonus for 20-year = 80 pts) or stack energy and
                    accessibility.
                  </p>
                )}
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Next steps
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Once you've hit a tier, size the loan against LTV and DCR:
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <a href="/calculators/loan-sizer" className="text-star hover:underline">
                    Open loan sizer →
                  </a>
                  <a href="/calculators/premium" className="text-star hover:underline">
                    Compute premium →
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* METHODOLOGY + DISCLAIMER */}
      <section className="border-b border-dark-gray bg-jet">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Accordion type="single" collapsible className="max-w-3xl">
            <AccordionItem value="methodology" className="border-dark-gray">
              <AccordionTrigger>Methodology and assumptions</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  Point scoring reflects CMHC's published MLI Select framework.
                  For affordability, the calculator finds the highest level
                  whose unit-commitment threshold is met. For new construction:
                  10% → 50 pts, 15% → 70 pts, 25% → 100 pts. For existing
                  properties: 40% / 60% / 80%. A 20-year (or longer)
                  affordability commitment adds {AFFORDABILITY_BONUS_20YR} bonus
                  points, but only when at least one level of affordability
                  points is earned.
                </p>
                <p>
                  Energy efficiency is scored against 2020 NECB/NBC Tier 1 for
                  new construction (with a grace period to Sept 30 2026 for the
                  transition announced in November 2025), or vs. baseline
                  performance for existing properties. Accessibility points
                  require either CSA B651:23 / RHFAC certification or a
                  universal-design commitment.
                </p>
                <p>
                  Tier-based terms (Max LTV, amortization, DCR, recourse,
                  premium discount) come from the MLI Select grid in effect as
                  of April 2026.
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
