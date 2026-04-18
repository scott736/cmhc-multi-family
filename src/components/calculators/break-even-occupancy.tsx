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

type OpexMode = "dollars" | "percent";

export default function BreakEvenOccupancy() {
  const [gpr, setGpr] = useState(1_800_000);
  const [opexMode, setOpexMode] = useState<OpexMode>("percent");
  const [opexDollars, setOpexDollars] = useState(630_000);
  const [opexPctEgi, setOpexPctEgi] = useState(35);
  const [loan, setLoan] = useState(10_000_000);
  const [rate, setRate] = useState(5.25);
  const [amort, setAmort] = useState(40);
  const [currentOccupancy, setCurrentOccupancy] = useState(96);
  const [marketVacancy, setMarketVacancy] = useState(2.0);

  const ads = useMemo(
    () => annualDebtService({ principal: loan, annualRate: rate / 100, amortYears: amort }),
    [loan, rate, amort],
  );

  // At break-even: egi * (1 - opexPct) = ads  OR  egi - opexDollars = ads
  // egi = gpr * occupancy
  const breakEven = useMemo(() => {
    if (gpr <= 0) return 0;
    if (opexMode === "percent") {
      const opexShare = opexPctEgi / 100;
      if (opexShare >= 1) return 1;
      // gpr * occ * (1 - opexShare) = ads -> occ = ads / (gpr * (1 - opexShare))
      return ads / (gpr * (1 - opexShare));
    }
    // Fixed opex $
    // gpr * occ - opexDollars = ads -> occ = (ads + opexDollars) / gpr
    return (ads + opexDollars) / gpr;
  }, [gpr, ads, opexMode, opexPctEgi, opexDollars]);

  const breakEvenPct = breakEven * 100;

  // Levels 70%-100% in 2.5% steps
  const levels = useMemo(() => {
    const out: Array<{
      occupancy: number;
      egi: number;
      opex: number;
      noi: number;
      cashFlow: number;
      dcr: number;
    }> = [];
    for (let occ = 70; occ <= 100; occ += 2.5) {
      const egi = gpr * (occ / 100);
      const opex = opexMode === "percent" ? egi * (opexPctEgi / 100) : opexDollars;
      const noi = egi - opex;
      const cashFlow = noi - ads;
      const dcr = ads > 0 ? noi / ads : 0;
      out.push({ occupancy: occ, egi, opex, noi, cashFlow, dcr });
    }
    return out;
  }, [gpr, ads, opexMode, opexPctEgi, opexDollars]);

  // Current occupancy metrics
  const currentMetrics = useMemo(() => {
    const egi = gpr * (currentOccupancy / 100);
    const opex = opexMode === "percent" ? egi * (opexPctEgi / 100) : opexDollars;
    const noi = egi - opex;
    const dcr = ads > 0 ? noi / ads : 0;
    const cf = noi - ads;
    return { egi, opex, noi, dcr, cf };
  }, [gpr, currentOccupancy, ads, opexMode, opexPctEgi, opexDollars]);

  const marketOccupancy = 100 - marketVacancy;
  const marginVsMarket = marketOccupancy - breakEvenPct;
  const marginVsCurrent = currentOccupancy - breakEvenPct;

  const maxAbsCf = useMemo(() => {
    return Math.max(...levels.map((l) => Math.abs(l.cashFlow)), 1);
  }, [levels]);

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Break-Even Occupancy
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            How vacant can the building get before you bleed?
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Break-even occupancy is the percentage of rent-paying units needed
            to cover opex plus debt service. Compare it to market vacancy in
            your CMA to see how much cushion the deal has.
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
            <div className="space-y-6">
              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Revenue</Label>
                <div className="mt-4 grid gap-4">
                  <div>
                    <Label htmlFor="gpr" className="text-xs text-muted-foreground">
                      Gross potential rent (100% occupancy, annual)
                    </Label>
                    <Input id="gpr" type="number" value={gpr} onChange={(e) => setGpr(Number(e.target.value))} />
                  </div>
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Operating expenses</Label>
                <Tabs
                  value={opexMode}
                  onValueChange={(v) => setOpexMode(v as OpexMode)}
                  className="mt-3"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="percent">% of EGI</TabsTrigger>
                    <TabsTrigger value="dollars">Fixed $</TabsTrigger>
                  </TabsList>
                </Tabs>

                {opexMode === "percent" ? (
                  <div className="mt-4">
                    <Label htmlFor="op" className="text-xs text-muted-foreground">Opex % of EGI</Label>
                    <Input id="op" type="number" step="0.1" value={opexPctEgi} onChange={(e) => setOpexPctEgi(Number(e.target.value))} />
                  </div>
                ) : (
                  <div className="mt-4">
                    <Label htmlFor="opd" className="text-xs text-muted-foreground">Opex (annual $)</Label>
                    <Input id="opd" type="number" value={opexDollars} onChange={(e) => setOpexDollars(Number(e.target.value))} />
                  </div>
                )}
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Debt</Label>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="loan" className="text-xs text-muted-foreground">Loan</Label>
                    <Input id="loan" type="number" value={loan} onChange={(e) => setLoan(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="rate" className="text-xs text-muted-foreground">Rate %</Label>
                    <Input id="rate" type="number" step="0.01" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="amort" className="text-xs text-muted-foreground">Amort (yrs)</Label>
                    <Input id="amort" type="number" value={amort} onChange={(e) => setAmort(Number(e.target.value))} />
                  </div>
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Benchmarks</Label>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="occ" className="text-xs text-muted-foreground">Current / target occupancy %</Label>
                    <Input id="occ" type="number" step="0.1" value={currentOccupancy} onChange={(e) => setCurrentOccupancy(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="mv" className="text-xs text-muted-foreground">Market vacancy % (RMS)</Label>
                    <Input id="mv" type="number" step="0.1" value={marketVacancy} onChange={(e) => setMarketVacancy(Number(e.target.value))} />
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Break-even occupancy
                  </div>
                  <div className="mt-2 text-4xl font-semibold text-star">
                    {percent(breakEvenPct, 1)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {opexMode === "percent"
                      ? "ADS ÷ (GPR × (1 − opex%))"
                      : "(Opex + ADS) ÷ GPR"}
                  </div>
                </Card>
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Margin vs. market ({percent(marketOccupancy, 1)})
                  </div>
                  <div className={`mt-2 text-3xl font-semibold ${marginVsMarket >= 0 ? "text-star" : "text-foreground"}`}>
                    {marginVsMarket >= 0 ? "+" : ""}{percent(marginVsMarket, 1)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Market vacancy: {percent(marketVacancy, 1)}
                  </div>
                </Card>
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Margin vs. current ({percent(currentOccupancy, 1)})
                  </div>
                  <div className={`mt-2 text-3xl font-semibold ${marginVsCurrent >= 0 ? "text-star" : "text-foreground"}`}>
                    {marginVsCurrent >= 0 ? "+" : ""}{percent(marginVsCurrent, 1)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    DCR today: {currentMetrics.dcr.toFixed(2)}x
                  </div>
                </Card>
              </div>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Cash flow by occupancy level</Label>
                <div className="mt-4 space-y-1.5">
                  {levels.map((l) => {
                    const isBreakEven = Math.abs(l.occupancy - breakEvenPct) < 1.25;
                    const isBelowBreakEven = l.occupancy < breakEvenPct;
                    const widthPct = (Math.abs(l.cashFlow) / maxAbsCf) * 50;
                    return (
                      <div key={l.occupancy} className="flex items-center gap-3 text-xs">
                        <div className={`w-12 text-right ${isBreakEven ? "text-star font-medium" : "text-muted-foreground"}`}>
                          {percent(l.occupancy, 1)}
                        </div>
                        <div className="relative flex-1 h-5 bg-obsidian border border-dark-gray rounded overflow-hidden">
                          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-dark-gray" />
                          {l.cashFlow < 0 ? (
                            <div
                              className="absolute right-1/2 top-0 bottom-0 bg-muted-foreground/40"
                              style={{ width: `${widthPct}%` }}
                            />
                          ) : (
                            <div
                              className="absolute left-1/2 top-0 bottom-0 bg-star"
                              style={{ width: `${widthPct}%` }}
                            />
                          )}
                        </div>
                        <div className={`w-28 text-right tabular-nums ${isBelowBreakEven ? "text-muted-foreground" : ""}`}>
                          {currency(l.cashFlow)}
                        </div>
                        <div className="w-14 text-right text-muted-foreground tabular-nums">
                          {l.dcr.toFixed(2)}x
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  Break-even line marked at {percent(breakEvenPct, 1)}. Rows at or below this occupancy are cash-flow-negative.
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  At current occupancy of {percent(currentOccupancy, 1)}
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-xs text-muted-foreground">EGI</dt>
                    <dd className="mt-1 text-lg font-semibold">{currency(currentMetrics.egi)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Opex</dt>
                    <dd className="mt-1 text-lg font-semibold">{currency(currentMetrics.opex)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">NOI</dt>
                    <dd className="mt-1 text-lg font-semibold text-star">{currency(currentMetrics.noi)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Cash flow</dt>
                    <dd className={`mt-1 text-lg font-semibold ${currentMetrics.cf >= 0 ? "text-star" : ""}`}>
                      {currency(currentMetrics.cf)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 text-xs text-muted-foreground">
                  Annual debt service: {currency(ads)}
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
                  Break-even occupancy = (operating expenses + annual debt
                  service) ÷ gross potential rent. When opex is entered as a
                  percentage of EGI, the formula becomes ADS ÷ (GPR × (1 −
                  opex%)), because opex itself scales with income.
                </p>
                <p>
                  The market vacancy input is intended to be paired with the
                  CMHC Rental Market Survey vacancy rate for the target CMA.
                  CMHC's RMS publishes vacancy by zone, bedroom count and
                  structure size each October.
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
