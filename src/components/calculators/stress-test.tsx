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
import { amortizationSchedule, annualDebtService, monthlyPayment } from "@/lib/loan";

const SHOCK_PRESETS = [50, 100, 150, 200, 300] as const;

export default function StressTest() {
  const [balance, setBalance] = useState(10_000_000);
  const [currentRate, setCurrentRate] = useState(5.25);
  const [amortRemaining, setAmortRemaining] = useState(35);
  const [termYears, setTermYears] = useState(5);
  const [noi1, setNoi1] = useState(950_000);
  const [noiGrowth, setNoiGrowth] = useState(2.5);
  const [shockBps, setShockBps] = useState(200);

  const stressedRate = currentRate + shockBps / 100;

  // Amortization at the current rate to get balance at renewal
  const currentSchedule = useMemo(
    () =>
      amortizationSchedule(
        { principal: balance, annualRate: currentRate / 100, amortYears: amortRemaining },
        Math.max(termYears, 1),
      ),
    [balance, currentRate, amortRemaining, termYears],
  );

  const balanceAtRenewal = useMemo(() => {
    const row = currentSchedule[termYears - 1];
    return row?.endingBalance ?? balance;
  }, [currentSchedule, termYears, balance]);

  const adsCurrent = useMemo(
    () => annualDebtService({ principal: balance, annualRate: currentRate / 100, amortYears: amortRemaining }),
    [balance, currentRate, amortRemaining],
  );

  // Post-renewal amortization: remaining amort minus term years, at stressed rate, on balance at renewal
  const adsStressed = useMemo(() => {
    const newAmort = Math.max(1, amortRemaining - termYears);
    return annualDebtService({
      principal: balanceAtRenewal,
      annualRate: stressedRate / 100,
      amortYears: newAmort,
    });
  }, [balanceAtRenewal, stressedRate, amortRemaining, termYears]);

  const rows = useMemo(() => {
    const out: Array<{
      year: number;
      noi: number;
      dsCurrent: number;
      dsStressed: number;
      dcrCurrent: number;
      dcrStressed: number;
      cfCurrent: number;
      cfStressed: number;
      atRenewal: boolean;
    }> = [];
    // Show term + 5 years post-renewal to illustrate the jump
    const totalYears = termYears + 5;
    for (let y = 1; y <= totalYears; y++) {
      const noi = noi1 * Math.pow(1 + noiGrowth / 100, y - 1);
      const atRenewal = y > termYears;
      const dsCurrent = adsCurrent;
      const dsStressed = atRenewal ? adsStressed : adsCurrent;
      const dcrCurrent = dsCurrent > 0 ? noi / dsCurrent : 0;
      const dcrStressed = dsStressed > 0 ? noi / dsStressed : 0;
      out.push({
        year: y,
        noi,
        dsCurrent,
        dsStressed,
        dcrCurrent,
        dcrStressed,
        cfCurrent: noi - dsCurrent,
        cfStressed: noi - dsStressed,
        atRenewal,
      });
    }
    return out;
  }, [noi1, noiGrowth, adsCurrent, adsStressed, termYears]);

  const firstBreachSelect = rows.find((r) => r.atRenewal && r.dcrStressed < 1.1)?.year;
  const firstBreachStandard = rows.find((r) => r.atRenewal && r.dcrStressed < 1.2)?.year;

  const monthlyCurrent = monthlyPayment({
    principal: balance,
    annualRate: currentRate / 100,
    amortYears: amortRemaining,
  });
  const monthlyStressed = monthlyPayment({
    principal: balanceAtRenewal,
    annualRate: stressedRate / 100,
    amortYears: Math.max(1, amortRemaining - termYears),
  });

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Stress Test · Rate shock at renewal
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Test DCR through a rate shock.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Model what happens to debt service and DCR when rates jump at
            renewal. Highlights the first year DCR breaches the 1.20 (MLI
            Standard) and 1.10 (MLI Select) minimums — so you know if a
            refinance becomes a coverage problem.
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
            <div className="space-y-6">
              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Current loan</Label>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="bal" className="text-xs text-muted-foreground">Current balance</Label>
                    <Input id="bal" type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="cr" className="text-xs text-muted-foreground">Current rate %</Label>
                    <Input id="cr" type="number" step="0.01" value={currentRate} onChange={(e) => setCurrentRate(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="ar" className="text-xs text-muted-foreground">Amortization remaining (yrs)</Label>
                    <Input id="ar" type="number" value={amortRemaining} onChange={(e) => setAmortRemaining(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="ty" className="text-xs text-muted-foreground">Term years until renewal</Label>
                    <Input id="ty" type="number" value={termYears} onChange={(e) => setTermYears(Number(e.target.value))} />
                  </div>
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">NOI projection</Label>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="noi1" className="text-xs text-muted-foreground">Year-1 NOI</Label>
                    <Input id="noi1" type="number" value={noi1} onChange={(e) => setNoi1(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="ng" className="text-xs text-muted-foreground">NOI growth %/yr</Label>
                    <Input id="ng" type="number" step="0.1" value={noiGrowth} onChange={(e) => setNoiGrowth(Number(e.target.value))} />
                  </div>
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Rate shock</Label>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {SHOCK_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setShockBps(p)}
                      className={`rounded border px-2 py-2 text-xs transition-colors ${
                        shockBps === p
                          ? "border-star/60 bg-star/5 text-star"
                          : "border-dark-gray hover:border-star/40"
                      }`}
                    >
                      +{p}
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <Label htmlFor="bps" className="text-xs text-muted-foreground">Custom shock (bps)</Label>
                  <Input id="bps" type="number" value={shockBps} onChange={(e) => setShockBps(Number(e.target.value))} />
                </div>
                <div className="mt-4 rounded border border-dark-gray p-3 text-xs text-muted-foreground">
                  Stressed rate at renewal:{" "}
                  <span className="text-foreground font-medium">{percent(stressedRate, 2)}</span>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Monthly P+I today
                  </div>
                  <div className="mt-2 text-2xl font-semibold">{currency(monthlyCurrent)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">at {percent(currentRate, 2)}</div>
                </Card>
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Monthly P+I post-renewal
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-star">{currency(monthlyStressed)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    at {percent(stressedRate, 2)} on {currency(balanceAtRenewal)}
                  </div>
                </Card>
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Payment jump
                  </div>
                  <div className="mt-2 text-2xl font-semibold">
                    {currency(monthlyStressed - monthlyCurrent)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    +{percent(monthlyCurrent > 0 ? ((monthlyStressed - monthlyCurrent) / monthlyCurrent) * 100 : 0, 1)} per month
                  </div>
                </Card>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    First year DCR &lt; 1.20 (MLI Standard)
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-star">
                    {firstBreachStandard ? `Year ${firstBreachStandard}` : "No breach"}
                  </div>
                </Card>
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    First year DCR &lt; 1.10 (MLI Select)
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-star">
                    {firstBreachSelect ? `Year ${firstBreachSelect}` : "No breach"}
                  </div>
                </Card>
              </div>

              <Card className="bg-jet border-dark-gray p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-obsidian text-muted-foreground">
                      <tr>
                        <th className="p-3 text-left font-normal">Yr</th>
                        <th className="p-3 text-right font-normal">NOI</th>
                        <th className="p-3 text-right font-normal">DS current</th>
                        <th className="p-3 text-right font-normal">DS stressed</th>
                        <th className="p-3 text-right font-normal">DCR current</th>
                        <th className="p-3 text-right font-normal">DCR stressed</th>
                        <th className="p-3 text-right font-normal">CF stressed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => {
                        const breach = r.atRenewal && r.dcrStressed < 1.2;
                        const severeBreach = r.atRenewal && r.dcrStressed < 1.1;
                        return (
                          <tr
                            key={r.year}
                            className={`border-t border-dark-gray ${r.atRenewal ? "bg-star/5" : ""} ${severeBreach ? "text-star" : ""}`}
                          >
                            <td className="p-3">
                              {r.year}
                              {r.year === termYears + 1 && (
                                <span className="ml-1 text-muted-foreground">(renewal)</span>
                              )}
                            </td>
                            <td className="p-3 text-right">{currency(r.noi)}</td>
                            <td className="p-3 text-right text-muted-foreground">{currency(r.dsCurrent)}</td>
                            <td className="p-3 text-right">{currency(r.dsStressed)}</td>
                            <td className="p-3 text-right text-muted-foreground">{r.dcrCurrent.toFixed(2)}x</td>
                            <td className={`p-3 text-right ${breach ? "font-semibold" : ""}`}>
                              {r.dcrStressed.toFixed(2)}x
                              {severeBreach ? " ⚠" : breach ? " !" : ""}
                            </td>
                            <td className="p-3 text-right">{currency(r.cfStressed)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="text-xs text-muted-foreground">
                Balance at renewal (end of Y{termYears}): {currency(balanceAtRenewal)} · ADS at current rate:{" "}
                {currency(adsCurrent)} · ADS at stressed rate: {currency(adsStressed)}
              </div>
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
                  The schedule amortizes the current balance at the current
                  rate for the term years to find the balance at renewal. From
                  renewal onward, debt service is recomputed on the remaining
                  balance at the stressed rate using the original remaining
                  amortization minus the term years already elapsed.
                </p>
                <p>
                  NOI is grown at a constant annual rate. The thresholds
                  highlighted (1.20 for MLI Standard 7+ units with term ≥10 yr,
                  1.10 for MLI Select) reflect CMHC's minimum DCR rules as of
                  the latest program grid.
                </p>
                <p>
                  Debt service uses monthly-compounded amortization as an
                  approximation of Canadian semi-annual compounding. Impact on
                  typical CMHC-insured payments is under 5 basis points.
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
