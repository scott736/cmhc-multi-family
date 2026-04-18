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
import { annualDebtService } from "@/lib/loan";

type DcrPreset = "select" | "standard-long" | "standard-short" | "custom";

const PRESETS: Record<Exclude<DcrPreset, "custom">, { value: number; label: string; note: string }> = {
  select: { value: 1.1, label: "MLI Select", note: "1.10 across all tiers" },
  "standard-long": { value: 1.2, label: "MLI Standard (term ≥10 yr)", note: "7+ units, 1.20" },
  "standard-short": { value: 1.3, label: "MLI Standard (term <10 yr)", note: "7+ units, 1.30" },
};

export default function DscrInverse() {
  const [loan, setLoan] = useState(10_000_000);
  const [rate, setRate] = useState(5.25);
  const [amort, setAmort] = useState(40);
  const [preset, setPreset] = useState<DcrPreset>("standard-long");
  const [customDcr, setCustomDcr] = useState(1.2);
  const [opexPct, setOpexPct] = useState(35);
  const [units, setUnits] = useState(60);

  const activeDcr = preset === "custom" ? customDcr : PRESETS[preset].value;

  const ads = useMemo(
    () => annualDebtService({ principal: loan, annualRate: rate / 100, amortYears: amort }),
    [loan, rate, amort],
  );

  const opexPctClamped = Math.min(95, Math.max(0, opexPct));
  const opexCapped = opexPct >= 95;

  const requiredNoi = activeDcr * ads;
  const requiredEgi = requiredNoi / (1 - opexPctClamped / 100);
  const requiredMonthlyPerUnit = units > 0 ? requiredEgi / 12 / units : 0;

  const tierCompare = useMemo(() => {
    const tiers = [
      { key: "select", label: "MLI Select", dcr: 1.1 },
      { key: "standard-long", label: "MLI Standard (≥10 yr term)", dcr: 1.2 },
      { key: "standard-short", label: "MLI Standard (<10 yr term)", dcr: 1.3 },
    ] as const;
    return tiers.map((t) => ({
      ...t,
      noi: t.dcr * ads,
      egi: (t.dcr * ads) / (1 - opexPctClamped / 100),
    }));
  }, [ads, opexPctClamped]);

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Required NOI · DSCR Inverse
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            What NOI do I need to hit the DCR?
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Instead of sizing the loan from NOI, work backward: for a target
            loan amount, rate and amortization, what stabilized NOI (and
            rent roll) does the deal need to clear the DCR bar?
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-6">
              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Target loan</Label>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="loan" className="text-xs text-muted-foreground">Loan amount</Label>
                    <Input id="loan" type="number" value={loan} onChange={(e) => setLoan(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="rate" className="text-xs text-muted-foreground">Rate %</Label>
                    <Input id="rate" type="number" step="0.01" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="amort" className="text-xs text-muted-foreground">Amortization (yrs)</Label>
                    <Input id="amort" type="number" value={amort} onChange={(e) => setAmort(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="units" className="text-xs text-muted-foreground">Number of units</Label>
                    <Input id="units" type="number" value={units} onChange={(e) => setUnits(Number(e.target.value))} />
                  </div>
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Minimum DCR</Label>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setPreset(k)}
                      className={`rounded border px-3 py-2 text-left text-sm transition-colors ${
                        preset === k
                          ? "border-star/60 bg-star/5 text-star"
                          : "border-dark-gray hover:border-star/40"
                      }`}
                    >
                      <div className="font-medium">{PRESETS[k].value.toFixed(2)}x</div>
                      <div className="text-xs text-muted-foreground">{PRESETS[k].label}</div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPreset("custom")}
                    className={`col-span-2 rounded border px-3 py-2 text-left text-sm transition-colors ${
                      preset === "custom"
                        ? "border-star/60 bg-star/5 text-star"
                        : "border-dark-gray hover:border-star/40"
                    }`}
                  >
                    <div className="font-medium">Custom</div>
                    <div className="text-xs text-muted-foreground">Set any DCR threshold</div>
                  </button>
                </div>
                {preset === "custom" && (
                  <div className="mt-4">
                    <Label htmlFor="cdcr" className="text-xs text-muted-foreground">Custom DCR</Label>
                    <Input id="cdcr" type="number" step="0.01" value={customDcr} onChange={(e) => setCustomDcr(Number(e.target.value))} />
                  </div>
                )}
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Opex assumption</Label>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="opex" className="text-xs text-muted-foreground">Opex % of EGI</Label>
                    <span className="text-sm text-foreground tabular-nums">{percent(opexPct, 1)}</span>
                  </div>
                  <input
                    id="opex"
                    type="range"
                    min={20}
                    max={60}
                    step={0.5}
                    value={opexPct}
                    onChange={(e) => setOpexPct(Number(e.target.value))}
                    className="mt-3 w-full accent-[oklch(0.78_0.18_295)]"
                  />
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>20%</span>
                    <span>60%</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="opexn" className="text-xs text-muted-foreground">Or type exact %</Label>
                  <Input id="opexn" type="number" step="0.1" max="95" value={opexPct} onChange={(e) => setOpexPct(Number(e.target.value))} />
                  {opexCapped && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Opex capped at 95% for sizing.
                    </p>
                  )}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Required NOI at {activeDcr.toFixed(2)}x DCR
                </div>
                <div className="mt-2 text-4xl font-semibold text-star">{currency(requiredNoi)}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Annual debt service: {currency(ads)} · {activeDcr.toFixed(2)}x × ADS
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Required EGI (revenue floor)
                </div>
                <div className="mt-2 text-3xl font-semibold">{currency(requiredEgi)}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  With opex at {percent(opexPct, 1)} of EGI
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-dark-gray pt-4 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Required monthly EGI</dt>
                    <dd className="mt-1 text-lg font-semibold">{currency(requiredEgi / 12)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Required per-unit rent (avg)</dt>
                    <dd className="mt-1 text-lg font-semibold text-star">
                      {currency(requiredMonthlyPerUnit)}
                    </dd>
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Assumes {units} units with uniform rent and no vacancy loss
                  in the simple per-unit calc.
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Required NOI by DCR tier</Label>
                <div className="mt-4 overflow-hidden rounded border border-dark-gray">
                  <table className="w-full text-sm">
                    <thead className="bg-obsidian text-muted-foreground">
                      <tr>
                        <th className="p-3 text-left font-normal">Tier</th>
                        <th className="p-3 text-right font-normal">DCR</th>
                        <th className="p-3 text-right font-normal">Required NOI</th>
                        <th className="p-3 text-right font-normal">Required EGI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tierCompare.map((t) => {
                        const active =
                          preset !== "custom" &&
                          ((preset === "select" && t.key === "select") ||
                            (preset === "standard-long" && t.key === "standard-long") ||
                            (preset === "standard-short" && t.key === "standard-short"));
                        return (
                          <tr
                            key={t.key}
                            className={`border-t border-dark-gray ${active ? "bg-star/5 text-star" : ""}`}
                          >
                            <td className="p-3">{t.label}</td>
                            <td className="p-3 text-right">{t.dcr.toFixed(2)}x</td>
                            <td className="p-3 text-right font-medium">{currency(t.noi)}</td>
                            <td className="p-3 text-right text-muted-foreground">{currency(t.egi)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Using {percent(opexPct, 1)} opex ratio to back EGI out of
                  NOI. Higher opex ratios push the required rent roll higher.
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
                  Required NOI = target DCR × annual debt service. Required EGI
                  = required NOI ÷ (1 − opex%), i.e. the revenue floor that,
                  after operating expenses, leaves enough NOI to clear DCR.
                </p>
                <p>
                  DCR tiers reflect CMHC's published minimums: 1.10 for MLI
                  Select across all tiers, 1.20 for MLI Standard 7+ units with
                  term ≥10 years, and 1.30 for MLI Standard 7+ units with term
                  &lt;10 years. 5–6 unit MLI Standard uses 1.10 for purchases
                  and 1.20 for refinances (not shown in the comparison table).
                </p>
                <p>
                  The per-unit rent figure is required EGI ÷ 12 ÷ units — a
                  simple average that ignores unit-mix, parking income,
                  premium suites, and vacancy. Use it as a directional floor,
                  not a rent schedule.
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
