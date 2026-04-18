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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currency, percent } from "@/lib/format";
import { amortizationSchedule, monthlyPayment } from "@/lib/loan";

type Frequency = "monthly" | "semi-monthly" | "bi-weekly" | "weekly";
type View = "yearly" | "monthly";

const FREQ_PER_YEAR: Record<Frequency, number> = {
  monthly: 12,
  "semi-monthly": 24,
  "bi-weekly": 26,
  weekly: 52,
};

export default function AmortizationSchedule() {
  const [loan, setLoan] = useState(10_000_000);
  const [rate, setRate] = useState(5.25);
  const [amort, setAmort] = useState(40);
  const [term, setTerm] = useState(10);
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [view, setView] = useState<View>("yearly");

  const monthly = useMemo(
    () => monthlyPayment({ principal: loan, annualRate: rate / 100, amortYears: amort }),
    [loan, rate, amort],
  );

  // Convert monthly payment to the selected frequency (approximation).
  const periodPayment = useMemo(() => {
    const annual = monthly * 12;
    return annual / FREQ_PER_YEAR[frequency];
  }, [monthly, frequency]);

  const yearlyRows = useMemo(
    () =>
      amortizationSchedule(
        { principal: loan, annualRate: rate / 100, amortYears: amort },
        amort,
      ),
    [loan, rate, amort],
  );

  // Build a monthly-level schedule for the "monthly" view.
  const monthlyRows = useMemo(() => {
    const r = rate / 100 / 12;
    const pay = monthly;
    let balance = loan;
    const rows: Array<{
      month: number;
      year: number;
      interest: number;
      principal: number;
      endingBalance: number;
    }> = [];
    const totalMonths = amort * 12;
    for (let m = 1; m <= totalMonths; m++) {
      if (balance <= 0) break;
      const interest = balance * r;
      const principal = Math.min(pay - interest, balance);
      balance = Math.max(0, balance - principal);
      rows.push({
        month: m,
        year: Math.ceil(m / 12),
        interest,
        principal,
        endingBalance: balance,
      });
    }
    return rows;
  }, [loan, rate, amort, monthly]);

  const cumulativeInterest = useMemo(
    () => yearlyRows.reduce((sum, r) => sum + r.interest, 0),
    [yearlyRows],
  );
  const cumulativePrincipal = useMemo(
    () => yearlyRows.reduce((sum, r) => sum + r.principal, 0),
    [yearlyRows],
  );
  const balanceAtEndOfTerm = useMemo(() => {
    const row = yearlyRows[term - 1];
    return row?.endingBalance ?? 0;
  }, [yearlyRows, term]);
  const interestAtEndOfTerm = useMemo(
    () => yearlyRows.slice(0, term).reduce((sum, r) => sum + r.interest, 0),
    [yearlyRows, term],
  );
  const principalAtEndOfTerm = useMemo(
    () => yearlyRows.slice(0, term).reduce((sum, r) => sum + r.principal, 0),
    [yearlyRows, term],
  );

  const maxYearDs = useMemo(() => {
    let max = 0;
    for (const r of yearlyRows) {
      const ds = r.interest + r.principal;
      if (ds > max) max = ds;
    }
    return max || 1;
  }, [yearlyRows]);

  const downloadCsv = () => {
    const header = ["Year", "Interest", "Principal", "Debt Service", "Ending Balance"].join(",");
    const body = yearlyRows
      .map((r) =>
        [
          r.year,
          r.interest.toFixed(2),
          r.principal.toFixed(2),
          (r.interest + r.principal).toFixed(2),
          r.endingBalance.toFixed(2),
        ].join(","),
      )
      .join("\n");
    const csv = `${header}\n${body}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cmhc-amortization-schedule.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Amortization Schedule
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Walk the loan year by year.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Generate a full amortization schedule for any CMHC-insured loan.
            See the interest-to-principal split, cumulative totals, balance at
            renewal, and visualize how each year's payment is allocated.
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
            {/* INPUTS */}
            <div className="space-y-6">
              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Loan terms</Label>
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
                    <Label htmlFor="term" className="text-xs text-muted-foreground">Term (yrs)</Label>
                    <Input id="term" type="number" value={term} onChange={(e) => setTerm(Number(e.target.value))} />
                  </div>
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Payment frequency</Label>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(Object.keys(FREQ_PER_YEAR) as Frequency[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFrequency(f)}
                      className={`rounded border px-3 py-2 text-sm capitalize transition-colors ${
                        frequency === f
                          ? "border-star/60 bg-star/5 text-star"
                          : "border-dark-gray hover:border-star/40"
                      }`}
                    >
                      {f.replace("-", " ")}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Non-monthly frequencies are approximated by dividing the
                  annual payment evenly across periods.
                </p>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Period payment ({frequency.replace("-", " ")})
                </div>
                <div className="mt-2 text-3xl font-semibold text-star">
                  {currency(periodPayment)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Monthly P+I: {currency(monthly)} · Annual debt service: {currency(monthly * 12)}
                </div>
              </Card>

              <Button variant="outline" onClick={downloadCsv}>Download CSV</Button>
            </div>

            {/* OUTPUTS */}
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Balance at end of term (Y{term})
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-star">
                    {currency(balanceAtEndOfTerm)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Principal paid through term: {currency(principalAtEndOfTerm)} · Interest paid: {currency(interestAtEndOfTerm)}
                  </div>
                  {term > amort ? (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Loan fully amortizes in {amort} years (before term end).
                    </div>
                  ) : null}
                </Card>
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Total over full amortization
                  </div>
                  <div className="mt-2 text-3xl font-semibold">
                    {currency(cumulativeInterest)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Interest paid · Principal: {currency(cumulativePrincipal)}
                  </div>
                </Card>
              </div>

              <Card className="bg-jet border-dark-gray p-6">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">P vs I by year</Label>
                  <div className="text-xs text-muted-foreground">
                    Principal <span className="text-star">■</span> · Interest <span className="text-muted-foreground/60">■</span>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5">
                  {yearlyRows.map((r) => {
                    const ds = r.interest + r.principal;
                    const rowWidthPct = (ds / maxYearDs) * 100;
                    const principalPct = ds > 0 ? (r.principal / ds) * 100 : 0;
                    const interestPct = 100 - principalPct;
                    const isTerm = r.year === term;
                    return (
                      <div key={r.year} className="flex items-center gap-3 text-xs">
                        <div className={`w-8 text-right ${isTerm ? "text-star font-medium" : "text-muted-foreground"}`}>
                          Y{r.year}
                        </div>
                        <div className="flex-1 h-4 overflow-hidden rounded bg-obsidian border border-dark-gray">
                          <div className="flex h-full" style={{ width: `${rowWidthPct}%` }}>
                            <div
                              className="bg-star"
                              style={{ width: `${principalPct}%` }}
                              title={`Principal ${currency(r.principal)}`}
                            />
                            <div
                              className="bg-muted-foreground/40"
                              style={{ width: `${interestPct}%` }}
                              title={`Interest ${currency(r.interest)}`}
                            />
                          </div>
                        </div>
                        <div className="w-24 text-right text-muted-foreground tabular-nums">
                          {currency(ds)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-0 overflow-hidden">
                <div className="flex items-center justify-between border-b border-dark-gray p-4">
                  <Label className="text-sm font-semibold">Schedule</Label>
                  <Tabs value={view} onValueChange={(v) => setView(v as View)}>
                    <TabsList className="grid w-[220px] grid-cols-2">
                      <TabsTrigger value="yearly">Yearly</TabsTrigger>
                      <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="max-h-[480px] overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-obsidian text-muted-foreground sticky top-0">
                      <tr>
                        <th className="p-3 text-left font-normal">{view === "yearly" ? "Year" : "Month"}</th>
                        <th className="p-3 text-right font-normal">Interest</th>
                        <th className="p-3 text-right font-normal">Principal</th>
                        <th className="p-3 text-right font-normal">Debt service</th>
                        <th className="p-3 text-right font-normal">Ending balance</th>
                        <th className="p-3 text-right font-normal">% paid down</th>
                      </tr>
                    </thead>
                    <tbody>
                      {view === "yearly"
                        ? yearlyRows.map((r) => {
                            const paidDown = loan > 0 ? ((loan - r.endingBalance) / loan) * 100 : 0;
                            const isTerm = r.year === term;
                            return (
                              <tr
                                key={r.year}
                                className={`border-t border-dark-gray ${isTerm ? "bg-star/5 text-star" : ""}`}
                              >
                                <td className="p-3">{r.year}{isTerm ? " (term end)" : ""}</td>
                                <td className="p-3 text-right text-muted-foreground">{currency(r.interest)}</td>
                                <td className="p-3 text-right">{currency(r.principal)}</td>
                                <td className="p-3 text-right">{currency(r.interest + r.principal)}</td>
                                <td className="p-3 text-right">{currency(r.endingBalance)}</td>
                                <td className="p-3 text-right">{percent(paidDown, 1)}</td>
                              </tr>
                            );
                          })
                        : monthlyRows.map((r) => {
                            const paidDown = loan > 0 ? ((loan - r.endingBalance) / loan) * 100 : 0;
                            const isTermEnd = r.month === term * 12;
                            return (
                              <tr
                                key={r.month}
                                className={`border-t border-dark-gray ${isTermEnd ? "bg-star/5 text-star" : ""}`}
                              >
                                <td className="p-3">
                                  {r.month} <span className="text-muted-foreground">(Y{r.year})</span>
                                </td>
                                <td className="p-3 text-right text-muted-foreground">{currency(r.interest)}</td>
                                <td className="p-3 text-right">{currency(r.principal)}</td>
                                <td className="p-3 text-right">{currency(r.interest + r.principal)}</td>
                                <td className="p-3 text-right">{currency(r.endingBalance)}</td>
                                <td className="p-3 text-right">{percent(paidDown, 1)}</td>
                              </tr>
                            );
                          })}
                    </tbody>
                  </table>
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
                  The schedule is computed on a monthly compounding basis as an
                  approximation of Canadian semi-annual compounding. Payment
                  difference vs. the exact semi-annual formula is under 5 basis
                  points for typical CMHC-insured multi-unit loans.
                </p>
                <p>
                  Non-monthly payment frequencies (semi-monthly, bi-weekly,
                  weekly) are approximated by dividing the annual payment
                  evenly across periods. A lender's actual schedule may differ
                  by a few dollars per period based on the exact accrual
                  convention used.
                </p>
                <p>
                  Balance at end of term is the outstanding principal at the
                  renewal date — the amount you would refinance or roll into a
                  new term.
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
