import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

// Absorption = units leased per month at target rent.
// Required months = unitCount / absorption, then sustained occupancy period.
export default function AchievementTimeline() {
  const [completeDate, setCompleteDate] = useState<string>(formatDate(today()));
  const [unitCount, setUnitCount] = useState<number>(60);
  const [absorptionPerMonth, setAbsorptionPerMonth] = useState<number>(10);
  const [sustainedMonths, setSustainedMonths] = useState<number>(3);
  const [targetOccupancy, setTargetOccupancy] = useState<number>(90);

  const schedule = useMemo(() => {
    const start = parseISO(completeDate) ?? today();
    const unitsToReach = Math.ceil((unitCount * targetOccupancy) / 100);
    const leaseUpMonths = Math.max(1, Math.ceil(unitsToReach / Math.max(1, absorptionPerMonth)));
    const leaseUpComplete = addDays(start, leaseUpMonths * 30);
    const sustainedEnd = addDays(leaseUpComplete, sustainedMonths * 30);
    const holdbackRelease = addDays(sustainedEnd, 30); // ~30 days processing
    return {
      start,
      unitsToReach,
      leaseUpMonths,
      leaseUpComplete,
      sustainedEnd,
      holdbackRelease,
    };
  }, [completeDate, unitCount, absorptionPerMonth, sustainedMonths, targetOccupancy]);

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-10 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Rental achievement & holdback
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">
            Project the holdback-release date.
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Enter the construction-complete date, unit count, absorption rate,
            target occupancy, and the sustained-occupancy period required by
            the lender. The tool projects lease-up completion and
            holdback-release.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <Card className="bg-jet border-dark-gray p-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="complete" className="text-xs text-muted-foreground">
                    Construction complete
                  </Label>
                  <Input
                    id="complete"
                    type="date"
                    value={completeDate}
                    onChange={(e) => setCompleteDate(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="units" className="text-xs text-muted-foreground">
                      Total units
                    </Label>
                    <Input
                      id="units"
                      type="number"
                      min={5}
                      value={unitCount}
                      onChange={(e) => setUnitCount(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="abs" className="text-xs text-muted-foreground">
                      Absorption (units/mo)
                    </Label>
                    <Input
                      id="abs"
                      type="number"
                      min={1}
                      value={absorptionPerMonth}
                      onChange={(e) => setAbsorptionPerMonth(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="occ" className="text-xs text-muted-foreground">
                      Target occupancy %
                    </Label>
                    <Input
                      id="occ"
                      type="number"
                      min={50}
                      max={100}
                      value={targetOccupancy}
                      onChange={(e) => setTargetOccupancy(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sust" className="text-xs text-muted-foreground">
                      Sustained (months)
                    </Label>
                    <Input
                      id="sust"
                      type="number"
                      min={1}
                      max={12}
                      value={sustainedMonths}
                      onChange={(e) => setSustainedMonths(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Projected milestones
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="mt-1 block size-2 shrink-0 rounded-full bg-star" />
                  <div>
                    <div className="font-medium">Construction complete</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {formatDate(schedule.start)}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 block size-2 shrink-0 rounded-full bg-star" />
                  <div>
                    <div className="font-medium">
                      Lease-up to {targetOccupancy}% occupancy (
                      {schedule.unitsToReach} units)
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {formatDate(schedule.leaseUpComplete)} · ~{schedule.leaseUpMonths}{" "}
                      months from complete
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 block size-2 shrink-0 rounded-full bg-star" />
                  <div>
                    <div className="font-medium">
                      Sustained {sustainedMonths} months at occupancy
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {formatDate(schedule.sustainedEnd)}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 block size-2 shrink-0 rounded-full bg-star" />
                  <div>
                    <div className="font-medium text-star">Holdback released</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {formatDate(schedule.holdbackRelease)} · includes ~30 days
                      for lender/CMHC processing
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
