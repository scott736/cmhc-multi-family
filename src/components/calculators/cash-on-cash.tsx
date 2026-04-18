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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currency, percent } from "@/lib/format";
import { annualDebtService } from "@/lib/loan";

type DownMode = "percent" | "dollars";

export default function CashOnCash() {
  const [value, setValue] = useState(20_000_000);
  const [downMode, setDownMode] = useState<DownMode>("percent");
  const [downPct, setDownPct] = useState(15);
  const [downDollars, setDownDollars] = useState(3_000_000);
  const [noi1, setNoi1] = useState(950_000);
  const [rate, setRate] = useState(5.25);
  const [amort, setAmort] = useState(40);
  const [reserves, setReserves] = useState(30_000);

  const equity = downMode === "percent" ? value * (downPct / 100) : downDollars;
  const loan = Math.max(0, value - equity);

  const ads = useMemo(
    () => annualDebtService({ principal: loan, annualRate: rate / 100, amortYears: amort }),
    [loan, rate, amort],
  );

  const cashFlow = noi1 - ads;
  const cashFlowAfterReserves = cashFlow - reserves;

  const cocGross = equity > 0 ? (cashFlow / equity) * 100 : 0;
  const cocNet = equity > 0 ? (cashFlowAfterReserves / equity) * 100 : 0;

  const impliedCap = value > 0 ? (noi1 / value) * 100 : 0;
  const leveragedYield = cocGross;
  const unleveragedYield = impliedCap;

  const equityMultiple = (years: number): number => {
    if (equity <= 0) return 0;
    return (equity + cashFlow * years) / equity;
  };

  const holdPeriods = [5, 10, 20];

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Cash-on-Cash · Quick yield
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            How hard is your equity working?
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            A fast Year-1 cash-on-cash calculation for quick deal screens.
            See the leveraged vs. unleveraged yield spread and how long the
            cash flows take to return your equity at a few hold periods.
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-6">
              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Property</Label>
                <div className="mt-4 grid gap-4">
                  <div>
                    <Label htmlFor="val" className="text-xs text-muted-foreground">Property value / purchase price</Label>
                    <Input id="val" type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="noi1" className="text-xs text-muted-foreground">Year-1 NOI</Label>
                    <Input id="noi1" type="number" value={noi1} onChange={(e) => setNoi1(Number(e.target.value))} />
                  </div>
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Down payment</Label>
                <Tabs
                  value={downMode}
                  onValueChange={(v) => setDownMode(v as DownMode)}
                  className="mt-3"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="percent">% of value</TabsTrigger>
                    <TabsTrigger value="dollars">Dollars</TabsTrigger>
                  </TabsList>
                </Tabs>
                {downMode === "percent" ? (
                  <div className="mt-4">
                    <Label htmlFor="dp" className="text-xs text-muted-foreground">Down payment %</Label>
                    <Input id="dp" type="number" step="0.1" value={downPct} onChange={(e) => setDownPct(Number(e.target.value))} />
                  </div>
                ) : (
                  <div className="mt-4">
                    <Label htmlFor="dpd" className="text-xs text-muted-foreground">Down payment $</Label>
                    <Input id="dpd" type="number" value={downDollars} onChange={(e) => setDownDollars(Number(e.target.value))} />
                  </div>
                )}
                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-dark-gray pt-4 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Equity invested</dt>
                    <dd className="mt-1 text-lg font-semibold">{currency(equity)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Loan</dt>
                    <dd className="mt-1 text-lg font-semibold">{currency(loan)}</dd>
                  </div>
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Debt & reserves</Label>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="rate" className="text-xs text-muted-foreground">Rate %</Label>
                    <Input id="rate" type="number" step="0.01" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="amort" className="text-xs text-muted-foreground">Amortization (yrs)</Label>
                    <Input id="amort" type="number" value={amort} onChange={(e) => setAmort(Number(e.target.value))} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="res" className="text-xs text-muted-foreground">Annual capex reserves (optional)</Label>
                    <Input id="res" type="number" value={reserves} onChange={(e) => setReserves(Number(e.target.value))} />
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Cash-on-cash (before reserves)
                  </div>
                  <div className="mt-2 text-4xl font-semibold text-star">{percent(cocGross, 2)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Year-1 cash flow {currency(cashFlow)} ÷ equity {currency(equity)}
                  </div>
                </Card>
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Cash-on-cash (after reserves)
                  </div>
                  <div className="mt-2 text-4xl font-semibold">{percent(cocNet, 2)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    After {currency(reserves)} reserves
                  </div>
                </Card>
              </div>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Yield decomposition</Label>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted-foreground">Unleveraged yield (cap rate)</dt>
                    <dd className="mt-1 text-xl font-semibold">{percent(unleveragedYield, 2)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Leveraged yield (CoC)</dt>
                    <dd className="mt-1 text-xl font-semibold text-star">{percent(leveragedYield, 2)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Leverage spread</dt>
                    <dd className={`mt-1 text-xl font-semibold ${leveragedYield - unleveragedYield >= 0 ? "text-star" : ""}`}>
                      {percent(leveragedYield - unleveragedYield, 2)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-3 text-xs text-muted-foreground">
                  A positive spread means leverage is accretive — debt is
                  cheaper than the property's unlevered yield.
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Equity multiple (constant NOI)</Label>
                <div className="mt-4 overflow-hidden rounded border border-dark-gray">
                  <table className="w-full text-sm">
                    <thead className="bg-obsidian text-muted-foreground">
                      <tr>
                        <th className="p-3 text-left font-normal">Hold</th>
                        <th className="p-3 text-right font-normal">Cumulative cash flow</th>
                        <th className="p-3 text-right font-normal">Equity multiple</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdPeriods.map((y) => {
                        const em = equityMultiple(y);
                        return (
                          <tr key={y} className="border-t border-dark-gray">
                            <td className="p-3">{y} years</td>
                            <td className="p-3 text-right">{currency(cashFlow * y)}</td>
                            <td className="p-3 text-right font-semibold text-star">{em.toFixed(2)}x</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Assumes constant NOI (no rent growth), no exit sale
                  proceeds, no amortization gain. For a full return analysis,
                  use the cash flow projection calculator.
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6 text-sm">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Year-1 snapshot
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs text-muted-foreground">NOI</dt>
                    <dd className="mt-1 text-lg font-semibold">{currency(noi1)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Annual debt service</dt>
                    <dd className="mt-1 text-lg font-semibold">{currency(ads)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Cash flow (pre-reserves)</dt>
                    <dd className="mt-1 text-lg font-semibold text-star">{currency(cashFlow)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">DCR</dt>
                    <dd className="mt-1 text-lg font-semibold">
                      {ads > 0 ? (noi1 / ads).toFixed(2) : "0.00"}x
                    </dd>
                  </div>
                </dl>
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
                  Cash-on-cash = Year-1 cash flow ÷ equity invested. Cash
                  flow is NOI − annual debt service; the "after reserves"
                  figure additionally subtracts the annual capex reserve.
                </p>
                <p>
                  Unleveraged yield is the entry cap rate (NOI ÷ value).
                  Leveraged yield equals CoC before reserves. The spread
                  between the two is a quick test for whether debt is
                  accretive at the chosen loan terms.
                </p>
                <p>
                  Equity multiple is shown assuming constant NOI and no sale
                  proceeds — a floor estimate. A full multi-year return
                  analysis would include rent growth, principal paydown and
                  exit value.
                </p>
                <p>
                  Debt service uses monthly-compounded amortization as an
                  approximation of Canadian semi-annual compounding.
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
