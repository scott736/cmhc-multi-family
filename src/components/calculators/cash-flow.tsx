import { useMemo, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currency, percent } from "@/lib/format";
import { amortizationSchedule, annualDebtService } from "@/lib/loan";

export default function CashFlow() {
  const [loan, setLoan] = useState(10_000_000);
  const [rate, setRate] = useState(5.25);
  const [amort, setAmort] = useState(40);

  const [noi1, setNoi1] = useState(950_000);
  const [equity, setEquity] = useState(1_000_000);
  const [rentGrowth, setRentGrowth] = useState(2.5);
  const [opexGrowth, setOpexGrowth] = useState(3.0);
  const [opexShare, setOpexShare] = useState(35); // % of EGI (for growth split)
  const [years, setYears] = useState(10);

  const [purchasePrice, setPurchasePrice] = useState(20_000_000);
  const [exitCap, setExitCap] = useState(5.0);

  const schedule = useMemo(
    () =>
      amortizationSchedule(
        { principal: loan, annualRate: rate / 100, amortYears: amort },
        years,
      ),
    [loan, rate, amort, years],
  );

  const ads = useMemo(
    () => annualDebtService({ principal: loan, annualRate: rate / 100, amortYears: amort }),
    [loan, rate, amort],
  );

  // Project NOI growth with split rent/opex growth
  const rows = useMemo(() => {
    const out: Array<{
      year: number;
      noi: number;
      interest: number;
      principal: number;
      debtService: number;
      cashFlow: number;
      cashOnCash: number;
      dcr: number;
      endingBalance: number;
      cumulativeCashFlow: number;
    }> = [];
    let cumulative = 0;
    // Decompose year-1 NOI into rent & opex using opexShare of revenue
    // Assume revenue = NOI / (1 - opexShare%)  ... when NOI = rev - opex = rev*(1-opexShare)
    // Clamp opexShare to [0, 99] to avoid divide-by-zero / negative revenue at >= 100%.
    const opexShareClamped = Math.min(99, Math.max(0, opexShare));
    const revenue1 = noi1 / (1 - opexShareClamped / 100);
    const opex1 = revenue1 - noi1;

    for (let y = 1; y <= years; y++) {
      const rev = revenue1 * Math.pow(1 + rentGrowth / 100, y - 1);
      const opex = opex1 * Math.pow(1 + opexGrowth / 100, y - 1);
      const noi = rev - opex;
      const sched = schedule[y - 1];
      const interest = sched?.interest ?? 0;
      const principal = sched?.principal ?? 0;
      const debtService = interest + principal;
      const cf = noi - debtService;
      cumulative += cf;
      const coc = equity > 0 ? (cf / equity) * 100 : 0;
      const dcr = debtService > 0 ? noi / debtService : 0;
      out.push({
        year: y,
        noi,
        interest,
        principal,
        debtService,
        cashFlow: cf,
        cashOnCash: coc,
        dcr,
        endingBalance: sched?.endingBalance ?? 0,
        cumulativeCashFlow: cumulative,
      });
    }
    return out;
  }, [noi1, opexShare, rentGrowth, opexGrowth, years, schedule, equity]);

  const avgCoc = rows.length > 0 ? rows.reduce((a, r) => a + r.cashOnCash, 0) / rows.length : 0;
  const capRateEntry = purchasePrice > 0 ? (noi1 / purchasePrice) * 100 : 0;
  const exitNoi = rows.length > 0 ? rows[rows.length - 1].noi : noi1;
  const exitValue = exitCap > 0 ? exitNoi / (exitCap / 100) : 0;
  const exitLoanBalance = rows.length > 0 ? rows[rows.length - 1].endingBalance : loan;

  const downloadCsv = () => {
    const header = [
      "Year",
      "NOI",
      "Interest",
      "Principal",
      "Debt Service",
      "Cash Flow",
      "Cash-on-Cash %",
      "DCR",
      "Ending Balance",
      "Cumulative Cash Flow",
    ].join(",");
    const body = rows
      .map((r) =>
        [
          r.year,
          r.noi.toFixed(0),
          r.interest.toFixed(0),
          r.principal.toFixed(0),
          r.debtService.toFixed(0),
          r.cashFlow.toFixed(0),
          r.cashOnCash.toFixed(2),
          r.dcr.toFixed(2),
          r.endingBalance.toFixed(0),
          r.cumulativeCashFlow.toFixed(0),
        ].join(","),
      )
      .join("\n");
    const csv = `${header}\n${body}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cmhc-cash-flow-projection.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Cash Flow · Year-by-year
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Project cash flow over your hold.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Year-by-year NOI, principal and interest split, cash flow,
            cash-on-cash, DCR and ending loan balance. Export as CSV for your
            pro forma.
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
            {/* INPUTS */}
            <div className="space-y-6">
              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Debt</Label>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="loan" className="text-xs text-muted-foreground">Loan</Label>
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
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Operations</Label>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="noi1" className="text-xs text-muted-foreground">NOI (year 1)</Label>
                    <Input id="noi1" type="number" value={noi1} onChange={(e) => setNoi1(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="equity" className="text-xs text-muted-foreground">Equity invested</Label>
                    <Input id="equity" type="number" value={equity} onChange={(e) => setEquity(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="rg" className="text-xs text-muted-foreground">Rent growth %/yr</Label>
                    <Input id="rg" type="number" step="0.1" value={rentGrowth} onChange={(e) => setRentGrowth(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="og" className="text-xs text-muted-foreground">Opex growth %/yr</Label>
                    <Input id="og" type="number" step="0.1" value={opexGrowth} onChange={(e) => setOpexGrowth(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="opexshare" className="text-xs text-muted-foreground">Opex % of revenue</Label>
                    <Input id="opexshare" type="number" step="0.1" max="99" value={opexShare} onChange={(e) => setOpexShare(Number(e.target.value))} />
                    {opexShare >= 99 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Opex % clamped to 99% — values at or above 100% imply non-positive revenue.
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="years" className="text-xs text-muted-foreground">Years to project</Label>
                    <Input id="years" type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} />
                  </div>
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Entry / Exit</Label>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="pp" className="text-xs text-muted-foreground">Purchase price / cost</Label>
                    <Input id="pp" type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="ec" className="text-xs text-muted-foreground">Exit cap rate %</Label>
                    <Input id="ec" type="number" step="0.05" value={exitCap} onChange={(e) => setExitCap(Number(e.target.value))} />
                  </div>
                </div>
              </Card>

              <Button variant="outline" onClick={downloadCsv}>Download CSV</Button>
            </div>

            {/* OUTPUTS */}
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Avg cash-on-cash</div>
                  <div className="mt-2 text-4xl font-semibold text-star">{percent(avgCoc)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Simple average across projection</div>
                </Card>
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Entry cap rate</div>
                  <div className="mt-2 text-4xl font-semibold">{percent(capRateEntry)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">NOI Y1 ÷ purchase price</div>
                </Card>
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Exit value (Y{years})</div>
                  <div className="mt-2 text-3xl font-semibold text-star">{currency(exitValue)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Loan balance: {currency(exitLoanBalance)} · Equity at exit:{" "}
                    {currency(Math.max(0, exitValue - exitLoanBalance))}
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
                        <th className="p-3 text-right font-normal">Interest</th>
                        <th className="p-3 text-right font-normal">Principal</th>
                        <th className="p-3 text-right font-normal">Debt service</th>
                        <th className="p-3 text-right font-normal">Cash flow</th>
                        <th className="p-3 text-right font-normal">CoC %</th>
                        <th className="p-3 text-right font-normal">DCR</th>
                        <th className="p-3 text-right font-normal">Balance</th>
                        <th className="p-3 text-right font-normal">Cumulative</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.year} className="border-t border-dark-gray">
                          <td className="p-3">{r.year}</td>
                          <td className="p-3 text-right">{currency(r.noi)}</td>
                          <td className="p-3 text-right text-muted-foreground">{currency(r.interest)}</td>
                          <td className="p-3 text-right text-muted-foreground">{currency(r.principal)}</td>
                          <td className="p-3 text-right">{currency(r.debtService)}</td>
                          <td className="p-3 text-right text-star">{currency(r.cashFlow)}</td>
                          <td className="p-3 text-right">{percent(r.cashOnCash)}</td>
                          <td className="p-3 text-right">{r.dcr.toFixed(2)}x</td>
                          <td className="p-3 text-right text-muted-foreground">{currency(r.endingBalance)}</td>
                          <td className="p-3 text-right">{currency(r.cumulativeCashFlow)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="text-xs text-muted-foreground">
                Annual debt service (year 1): {currency(ads)}
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
                  NOI is projected forward by growing revenue and opex
                  separately. Year-1 revenue is implied from NOI and the opex %
                  input: revenue = NOI / (1 − opex%). Debt service is monthly
                  compounded as an approximation of Canadian semi-annual
                  compounding.
                </p>
                <p>
                  The "Avg cash-on-cash" figure is a simple arithmetic mean of
                  annual cash-on-cash yields — not a true IRR. A full IRR
                  requires explicit entry equity outflow, exit proceeds and
                  time-weighting. For that, use the exit value plus cumulative
                  cash flow figures in a spreadsheet.
                </p>
                <p>
                  Exit value is terminal NOI capitalized at the user-supplied
                  exit cap rate; equity at exit is exit value minus ending loan
                  balance. No transaction costs are deducted.
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
