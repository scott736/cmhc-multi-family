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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currency, percent } from "@/lib/format";

type Mode = "noi" | "cap" | "value";

export default function NoiCapRate() {
  const [mode, setMode] = useState<Mode>("noi");

  // NOI mode inputs
  const [grossRent, setGrossRent] = useState(1_800_000);
  const [vacancyPct, setVacancyPct] = useState(3);
  const [otherIncome, setOtherIncome] = useState(60_000);
  const [taxes, setTaxes] = useState(140_000);
  const [insurance, setInsurance] = useState(35_000);
  const [utilities, setUtilities] = useState(90_000);
  const [rm, setRm] = useState(75_000);
  const [mgmtPct, setMgmtPct] = useState(4);
  const [reserves, setReserves] = useState(50_000);

  // Cap mode inputs
  const [capNoi, setCapNoi] = useState(950_000);
  const [capValue, setCapValue] = useState(20_000_000);

  // Value mode inputs
  const [valNoi, setValNoi] = useState(950_000);
  const [targetCap, setTargetCap] = useState(5.0);

  // NOI mode derivations
  const noiCalc = useMemo(() => {
    const vacancyLoss = grossRent * (vacancyPct / 100);
    const egi = grossRent - vacancyLoss + otherIncome;
    const mgmtDollars = egi * (mgmtPct / 100);
    const totalOpex = taxes + insurance + utilities + rm + mgmtDollars + reserves;
    const noi = egi - totalOpex;
    const expenseRatio = egi > 0 ? (totalOpex / egi) * 100 : 0;
    return { vacancyLoss, egi, mgmtDollars, totalOpex, noi, expenseRatio };
  }, [grossRent, vacancyPct, otherIncome, taxes, insurance, utilities, rm, mgmtPct, reserves]);

  // Cap rate derivation
  const capRate = useMemo(() => (capValue > 0 ? (capNoi / capValue) * 100 : 0), [capNoi, capValue]);

  // Value derivation with sensitivity
  const impliedValue = useMemo(
    () => (targetCap > 0 ? valNoi / (targetCap / 100) : 0),
    [valNoi, targetCap],
  );
  const sensitivity = useMemo(() => {
    const offsets = [-75, -50, -25, 0, 25, 50, 75];
    return offsets.map((bps) => {
      const rate = targetCap + bps / 100;
      const value = rate > 0 ? valNoi / (rate / 100) : 0;
      return { bps, rate, value };
    });
  }, [valNoi, targetCap]);

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            NOI / Cap Rate · Three modes
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Build NOI, back out cap rate, or imply value.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Switch between building stabilized NOI from line-item operating
            costs, computing cap rate from a known value, or imputing value
            from a target cap rate — with a sensitivity band across ±75 basis
            points.
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList className="grid w-full max-w-xl grid-cols-3">
              <TabsTrigger value="noi">Calculate NOI</TabsTrigger>
              <TabsTrigger value="cap">Calculate cap rate</TabsTrigger>
              <TabsTrigger value="value">Implied value</TabsTrigger>
            </TabsList>

            <TabsContent value="noi" className="mt-8">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
                <div className="space-y-6">
                  <Card className="bg-jet border-dark-gray p-6">
                    <Label className="text-sm font-semibold">Revenue</Label>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="gr" className="text-xs text-muted-foreground">Gross potential rent (annual)</Label>
                        <Input id="gr" type="number" value={grossRent} onChange={(e) => setGrossRent(Number(e.target.value))} />
                      </div>
                      <div>
                        <Label htmlFor="vac" className="text-xs text-muted-foreground">Vacancy %</Label>
                        <Input id="vac" type="number" step="0.1" value={vacancyPct} onChange={(e) => setVacancyPct(Number(e.target.value))} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="oi" className="text-xs text-muted-foreground">Other income (parking, laundry, storage)</Label>
                        <Input id="oi" type="number" value={otherIncome} onChange={(e) => setOtherIncome(Number(e.target.value))} />
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-jet border-dark-gray p-6">
                    <Label className="text-sm font-semibold">Operating expenses</Label>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="tax" className="text-xs text-muted-foreground">Property taxes</Label>
                        <Input id="tax" type="number" value={taxes} onChange={(e) => setTaxes(Number(e.target.value))} />
                      </div>
                      <div>
                        <Label htmlFor="ins" className="text-xs text-muted-foreground">Insurance</Label>
                        <Input id="ins" type="number" value={insurance} onChange={(e) => setInsurance(Number(e.target.value))} />
                      </div>
                      <div>
                        <Label htmlFor="util" className="text-xs text-muted-foreground">Utilities</Label>
                        <Input id="util" type="number" value={utilities} onChange={(e) => setUtilities(Number(e.target.value))} />
                      </div>
                      <div>
                        <Label htmlFor="rm" className="text-xs text-muted-foreground">Repairs & maintenance</Label>
                        <Input id="rm" type="number" value={rm} onChange={(e) => setRm(Number(e.target.value))} />
                      </div>
                      <div>
                        <Label htmlFor="mgmt" className="text-xs text-muted-foreground">Management % of EGI</Label>
                        <Input id="mgmt" type="number" step="0.1" value={mgmtPct} onChange={(e) => setMgmtPct(Number(e.target.value))} />
                      </div>
                      <div>
                        <Label htmlFor="res" className="text-xs text-muted-foreground">Replacement reserves</Label>
                        <Input id="res" type="number" value={reserves} onChange={(e) => setReserves(Number(e.target.value))} />
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="bg-jet border-dark-gray p-6">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Stabilized NOI</div>
                    <div className="mt-2 text-4xl font-semibold text-star">{currency(noiCalc.noi)}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Expense ratio: {percent(noiCalc.expenseRatio, 1)}
                    </div>
                  </Card>

                  <Card className="bg-jet border-dark-gray p-6">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Income build-up</div>
                    <dl className="mt-4 space-y-2 text-sm">
                      <Row label="Gross potential rent" value={currency(grossRent)} />
                      <Row label={`Less vacancy (${percent(vacancyPct, 1)})`} value={`(${currency(noiCalc.vacancyLoss)})`} muted />
                      <Row label="Plus other income" value={currency(otherIncome)} />
                      <div className="border-t border-dark-gray pt-2">
                        <Row label="Effective gross income (EGI)" value={currency(noiCalc.egi)} bold />
                      </div>
                      <Row label="Less property taxes" value={`(${currency(taxes)})`} muted />
                      <Row label="Less insurance" value={`(${currency(insurance)})`} muted />
                      <Row label="Less utilities" value={`(${currency(utilities)})`} muted />
                      <Row label="Less R&M" value={`(${currency(rm)})`} muted />
                      <Row label={`Less management (${percent(mgmtPct, 1)} of EGI)`} value={`(${currency(noiCalc.mgmtDollars)})`} muted />
                      <Row label="Less reserves" value={`(${currency(reserves)})`} muted />
                      <div className="border-t border-dark-gray pt-2">
                        <Row label="Total operating expenses" value={currency(noiCalc.totalOpex)} bold />
                      </div>
                      <div className="border-t border-dark-gray pt-2">
                        <Row label="Net operating income" value={currency(noiCalc.noi)} bold highlight />
                      </div>
                    </dl>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cap" className="mt-8">
              <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
                <Card className="bg-jet border-dark-gray p-6">
                  <Label className="text-sm font-semibold">Inputs</Label>
                  <div className="mt-4 grid gap-4">
                    <div>
                      <Label htmlFor="cnoi" className="text-xs text-muted-foreground">Net operating income (annual)</Label>
                      <Input id="cnoi" type="number" value={capNoi} onChange={(e) => setCapNoi(Number(e.target.value))} />
                    </div>
                    <div>
                      <Label htmlFor="cval" className="text-xs text-muted-foreground">Property value / purchase price</Label>
                      <Input id="cval" type="number" value={capValue} onChange={(e) => setCapValue(Number(e.target.value))} />
                    </div>
                  </div>
                </Card>

                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Cap rate</div>
                  <div className="mt-2 text-5xl font-semibold text-star">{percent(capRate, 2)}</div>
                  <div className="mt-3 text-sm text-muted-foreground">
                    NOI {currency(capNoi)} ÷ value {currency(capValue)}
                  </div>
                  <div className="mt-6 rounded border border-dark-gray p-4 text-xs text-muted-foreground">
                    <div className="uppercase tracking-wide mb-2">Quick interpretation</div>
                    <p>
                      A lower cap rate means a higher price per dollar of NOI — typical
                      of lower-risk, higher-demand markets. A higher cap rate implies
                      higher yield but often higher perceived risk or slower rent
                      growth.
                    </p>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="value" className="mt-8">
              <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
                <Card className="bg-jet border-dark-gray p-6">
                  <Label className="text-sm font-semibold">Inputs</Label>
                  <div className="mt-4 grid gap-4">
                    <div>
                      <Label htmlFor="vnoi" className="text-xs text-muted-foreground">Net operating income (annual)</Label>
                      <Input id="vnoi" type="number" value={valNoi} onChange={(e) => setValNoi(Number(e.target.value))} />
                    </div>
                    <div>
                      <Label htmlFor="tcap" className="text-xs text-muted-foreground">Target cap rate %</Label>
                      <Input id="tcap" type="number" step="0.05" value={targetCap} onChange={(e) => setTargetCap(Number(e.target.value))} />
                    </div>
                  </div>
                </Card>

                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Implied value</div>
                  <div className="mt-2 text-4xl font-semibold text-star">{currency(impliedValue)}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    NOI {currency(valNoi)} ÷ cap rate {percent(targetCap, 2)}
                  </div>
                </Card>
              </div>

              <Card className="mt-6 bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Sensitivity (±75 bps)</Label>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-muted-foreground">
                      <tr>
                        <th className="p-3 text-left font-normal">Delta</th>
                        <th className="p-3 text-right font-normal">Cap rate</th>
                        <th className="p-3 text-right font-normal">Implied value</th>
                        <th className="p-3 text-right font-normal">Δ vs. target</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sensitivity.map((s) => {
                        const isTarget = s.bps === 0;
                        const delta = s.value - impliedValue;
                        return (
                          <tr
                            key={s.bps}
                            className={`border-t border-dark-gray ${isTarget ? "bg-star/5 text-star" : ""}`}
                          >
                            <td className="p-3">
                              {s.bps > 0 ? "+" : ""}
                              {s.bps} bps{isTarget ? " (target)" : ""}
                            </td>
                            <td className="p-3 text-right">{percent(s.rate, 2)}</td>
                            <td className="p-3 text-right">{currency(s.value)}</td>
                            <td className={`p-3 text-right ${delta === 0 ? "text-muted-foreground" : delta > 0 ? "" : "text-muted-foreground"}`}>
                              {delta === 0 ? "—" : `${delta > 0 ? "+" : ""}${currency(delta)}`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="border-b border-dark-gray bg-jet">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Accordion type="single" collapsible className="max-w-3xl">
            <AccordionItem value="methodology" className="border-dark-gray">
              <AccordionTrigger>Methodology and assumptions</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  NOI = EGI − total operating expenses, where EGI = gross
                  potential rent − vacancy + other income. Management fees are
                  computed as a percentage of EGI (common convention); some
                  lenders use a percentage of effective gross revenue or cap
                  the management expense at a floor dollar amount.
                </p>
                <p>
                  Cap rate = NOI ÷ value. Implied value = NOI ÷ target cap
                  rate. Sensitivity table holds NOI constant and shifts the cap
                  rate by fixed basis-point increments to show value impact.
                </p>
                <p>
                  Reserves (replacement reserves / capex reserves) are
                  generally included as an operating expense for CMHC
                  underwriting purposes, in line with standard multi-family
                  practice.
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

function Row({
  label,
  value,
  bold,
  muted,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className={`${muted ? "text-muted-foreground" : ""}`}>{label}</dt>
      <dd
        className={`tabular-nums ${bold ? "font-semibold" : ""} ${muted ? "text-muted-foreground" : ""} ${highlight ? "text-star text-lg" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
