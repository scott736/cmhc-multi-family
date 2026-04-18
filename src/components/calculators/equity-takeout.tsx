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
import {
  amortizationSchedule,
  annualDebtService,
  loanFromDCR,
} from "@/lib/loan";
import { calculatePremium } from "@/lib/premium";

type TargetProgram =
  | "std-85"
  | "sel-50"
  | "sel-70"
  | "sel-100";

interface ProgramConfig {
  label: string;
  maxLtv: number;
  minDcr: number;
  amort: number;
  program: "mli-standard" | "mli-select";
  selectTier?: 50 | 70 | 100;
}

const PROGRAM_CONFIGS: Record<TargetProgram, ProgramConfig> = {
  "std-85": {
    label: "MLI Standard · 85% LTV",
    maxLtv: 85,
    minDcr: 1.2,
    amort: 40,
    program: "mli-standard",
  },
  "sel-50": {
    label: "MLI Select · 50 pts",
    maxLtv: 85,
    minDcr: 1.1,
    amort: 40,
    program: "mli-select",
    selectTier: 50,
  },
  "sel-70": {
    label: "MLI Select · 70 pts",
    maxLtv: 95,
    minDcr: 1.1,
    amort: 45,
    program: "mli-select",
    selectTier: 70,
  },
  "sel-100": {
    label: "MLI Select · 100 pts",
    maxLtv: 95,
    minDcr: 1.1,
    amort: 50,
    program: "mli-select",
    selectTier: 100,
  },
};

const CREDIT_SCHEDULE = [
  { months: 12, pct: 75 },
  { months: 24, pct: 60 },
  { months: 36, pct: 50 },
  { months: 48, pct: 40 },
  { months: 60, pct: 35 },
  { months: 72, pct: 25 },
  { months: 84, pct: 20 },
];

function creditForMonths(months: number): number {
  if (months <= 0) return 75;
  for (const row of CREDIT_SCHEDULE) {
    if (months <= row.months) return row.pct;
  }
  return 0;
}

export default function EquityTakeout() {
  const [currentValue, setCurrentValue] = useState(25_000_000);
  const [currentBalance, setCurrentBalance] = useState(14_000_000);
  const [currentAmortRemaining, setCurrentAmortRemaining] = useState(35);
  const [currentRate, setCurrentRate] = useState(4.25);
  const [monthsSinceOrig, setMonthsSinceOrig] = useState(24);
  const [originalPremium, setOriginalPremium] = useState(350_000);
  const [noi, setNoi] = useState(1_350_000);

  const [targetProgram, setTargetProgram] =
    useState<TargetProgram>("sel-100");
  const [targetRate, setTargetRate] = useState(5.0);
  const [targetAmort, setTargetAmort] = useState(50);
  const [closingCosts, setClosingCosts] = useState(75_000);

  const cfg = PROGRAM_CONFIGS[targetProgram];

  const result = useMemo(() => {
    // Binding constraint calc
    const ltvCap = currentValue * (cfg.maxLtv / 100);
    const dcrCap = loanFromDCR(
      noi,
      cfg.minDcr,
      targetRate / 100,
      targetAmort,
    );
    const rawLoan = Math.max(0, Math.min(ltvCap, dcrCap));
    const binding = ltvCap <= dcrCap ? "LTV" : "DCR";
    const ltv = currentValue > 0 ? (rawLoan / currentValue) * 100 : 0;

    const prem = calculatePremium({
      program: cfg.program,
      txType: "purchaseRefi",
      loan: rawLoan,
      ltv,
      amortYears: targetAmort,
      nonResidentialPct: 0,
      secondMortgage: false,
      egiNotMetFirstAdvance: false,
      selectTier: cfg.selectTier,
    });

    const creditPct = creditForMonths(monthsSinceOrig);
    const premiumCredit = originalPremium * (creditPct / 100);
    const netPremium = Math.max(0, prem.amount - premiumCredit);

    // New loan is rawLoan + net premium (financed)
    const newLoan = rawLoan + netPremium;
    const newAds = annualDebtService({
      principal: newLoan,
      annualRate: targetRate / 100,
      amortYears: targetAmort,
    });
    const newDcr = newAds > 0 ? noi / newAds : 0;

    // Current debt service for comparison
    const currentAds = annualDebtService({
      principal: currentBalance,
      annualRate: currentRate / 100,
      amortYears: currentAmortRemaining,
    });

    // Cash-out to borrower = rawLoan − currentBalance − closingCosts − netPremium
    // (netPremium is paid to CMHC, financed, but it reduces what the borrower
    // receives because the gross loan includes premium)
    const grossProceeds = rawLoan;
    const cashOut =
      grossProceeds - currentBalance - closingCosts - netPremium;

    // Break-even: at what cash-out does refi "make sense"?
    // Threshold = annual cash-flow benefit ≥ amortized closing costs over 5 yrs
    const annualCfBenefit = Math.max(0, currentAds - newAds);

    return {
      ltvCap,
      dcrCap,
      rawLoan,
      binding,
      ltv,
      premiumPct: prem.effectivePct,
      premiumAmount: prem.amount,
      creditPct,
      premiumCredit,
      netPremium,
      newLoan,
      newAds,
      newDcr,
      currentAds,
      cashOut,
      annualCfBenefit,
    };
  }, [
    currentValue,
    currentBalance,
    currentAmortRemaining,
    currentRate,
    monthsSinceOrig,
    originalPremium,
    noi,
    targetRate,
    targetAmort,
    closingCosts,
    cfg,
  ]);

  // Break-even cash-out — covers closing costs + net premium
  const breakEven = closingCosts + result.netPremium;

  // Projected balance at maturity of current loan (informational)
  const currentSchedule = useMemo(
    () =>
      amortizationSchedule(
        {
          principal: currentBalance,
          annualRate: currentRate / 100,
          amortYears: currentAmortRemaining,
        },
        5,
      ),
    [currentBalance, currentRate, currentAmortRemaining],
  );
  const balIn5 = currentSchedule[4]?.endingBalance ?? currentBalance;

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Equity Take-Out · Refinance Cash-Out
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Size a CMHC refinance and extract equity.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            See the max new loan on either the LTV or DCR constraint, the
            premium payable net of your refinance credit, and the cash
            actually delivered to the borrower after paying off the existing
            loan, premium and closing costs.
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div className="space-y-6">
              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">
                  Existing property &amp; loan
                </Label>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="cv" className="text-xs text-muted-foreground">
                      Current property value
                    </Label>
                    <Input
                      id="cv"
                      type="number"
                      value={currentValue}
                      onChange={(e) => setCurrentValue(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cb" className="text-xs text-muted-foreground">
                      Current loan balance
                    </Label>
                    <Input
                      id="cb"
                      type="number"
                      value={currentBalance}
                      onChange={(e) => setCurrentBalance(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="car" className="text-xs text-muted-foreground">
                      Current amortization remaining (yrs)
                    </Label>
                    <Input
                      id="car"
                      type="number"
                      value={currentAmortRemaining}
                      onChange={(e) =>
                        setCurrentAmortRemaining(Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="cr" className="text-xs text-muted-foreground">
                      Current rate (%)
                    </Label>
                    <Input
                      id="cr"
                      type="number"
                      step="0.01"
                      value={currentRate}
                      onChange={(e) => setCurrentRate(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="noi" className="text-xs text-muted-foreground">
                      Year-1 NOI
                    </Label>
                    <Input
                      id="noi"
                      type="number"
                      value={noi}
                      onChange={(e) => setNoi(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ms" className="text-xs text-muted-foreground">
                      Months since insurance placed
                    </Label>
                    <Input
                      id="ms"
                      type="number"
                      value={monthsSinceOrig}
                      onChange={(e) =>
                        setMonthsSinceOrig(Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="op" className="text-xs text-muted-foreground">
                      Original CMHC premium paid ($)
                    </Label>
                    <Input
                      id="op"
                      type="number"
                      value={originalPremium}
                      onChange={(e) =>
                        setOriginalPremium(Number(e.target.value))
                      }
                    />
                  </div>
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Target refinance</Label>
                <div className="mt-3">
                  <Label className="text-xs text-muted-foreground">
                    Program
                  </Label>
                  <Tabs
                    value={targetProgram}
                    onValueChange={(v) => setTargetProgram(v as TargetProgram)}
                    className="mt-2"
                  >
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="std-85">Std 85</TabsTrigger>
                      <TabsTrigger value="sel-50">Sel 50</TabsTrigger>
                      <TabsTrigger value="sel-70">Sel 70</TabsTrigger>
                      <TabsTrigger value="sel-100">Sel 100</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Selected: {cfg.label} · max {cfg.maxLtv}% LTV · min DCR{" "}
                    {cfg.minDcr.toFixed(2)}x
                  </div>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="tr" className="text-xs text-muted-foreground">
                      Target rate (%)
                    </Label>
                    <Input
                      id="tr"
                      type="number"
                      step="0.01"
                      value={targetRate}
                      onChange={(e) => setTargetRate(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ta" className="text-xs text-muted-foreground">
                      Target amort (yrs)
                    </Label>
                    <Input
                      id="ta"
                      type="number"
                      value={targetAmort}
                      onChange={(e) => setTargetAmort(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cc" className="text-xs text-muted-foreground">
                      Closing costs
                    </Label>
                    <Input
                      id="cc"
                      type="number"
                      value={closingCosts}
                      onChange={(e) => setClosingCosts(Number(e.target.value))}
                    />
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:sticky lg:top-6 self-start space-y-6">
              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Max new loan
                </div>
                <div className="mt-2 text-4xl font-semibold text-star">
                  {currency(result.rawLoan)}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Binding constraint:{" "}
                  <span className="text-foreground font-medium">
                    {result.binding}
                  </span>{" "}
                  · LTV achieved {percent(result.ltv)}
                </div>
                <dl className="mt-5 space-y-2 text-sm">
                  <Row
                    label="LTV cap"
                    value={currency(result.ltvCap)}
                    accent={result.binding === "LTV"}
                  />
                  <Row
                    label="DCR cap"
                    value={currency(result.dcrCap)}
                    accent={result.binding === "DCR"}
                  />
                </dl>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Net cash to borrower
                </div>
                <div
                  className={`mt-2 text-4xl font-semibold ${
                    result.cashOut >= 0 ? "text-star" : "text-foreground"
                  }`}
                >
                  {currency(result.cashOut)}
                </div>
                <dl className="mt-5 space-y-2 text-sm">
                  <Row
                    label="Gross new loan"
                    value={currency(result.rawLoan)}
                  />
                  <Row
                    label="Payoff existing"
                    value={`− ${currency(currentBalance)}`}
                  />
                  <Row
                    label={`Net premium (credit ${result.creditPct}%)`}
                    value={`− ${currency(result.netPremium)}`}
                  />
                  <Row
                    label="Closing costs"
                    value={`− ${currency(closingCosts)}`}
                  />
                  <div className="border-t border-dark-gray pt-2">
                    <Row
                      label="Cash to borrower"
                      value={currency(result.cashOut)}
                      strong
                    />
                  </div>
                </dl>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Debt service
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <Row
                    label="Current ADS"
                    value={currency(result.currentAds)}
                  />
                  <Row label="New ADS" value={currency(result.newAds)} />
                  <Row
                    label="DCR at new loan"
                    value={`${result.newDcr.toFixed(2)}x`}
                    accent={result.newDcr >= cfg.minDcr}
                  />
                  <Row
                    label="Existing balance in 5 yrs"
                    value={currency(balIn5)}
                  />
                </dl>
              </Card>
            </div>
          </div>

          <Card className="mt-8 bg-jet border-dark-gray p-6">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Premium credit applied
            </div>
            <div className="mt-2 grid gap-4 sm:grid-cols-3">
              <div>
                <div className="text-xs text-muted-foreground">
                  Gross new premium
                </div>
                <div className="mt-1 text-lg font-semibold">
                  {currency(result.premiumAmount)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {percent(result.premiumPct)} of new loan
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Credit ({result.creditPct}%)
                </div>
                <div className="mt-1 text-lg font-semibold text-star">
                  − {currency(result.premiumCredit)}
                </div>
                <div className="text-xs text-muted-foreground">
                  of original {currency(originalPremium)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Net premium</div>
                <div className="mt-1 text-lg font-semibold">
                  {currency(result.netPremium)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Financed into new loan
                </div>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded border border-dark-gray">
              <table className="w-full text-xs">
                <thead className="bg-obsidian text-muted-foreground">
                  <tr>
                    <th className="p-2 text-left font-normal">
                      Within (months)
                    </th>
                    <th className="p-2 text-right font-normal">Credit %</th>
                  </tr>
                </thead>
                <tbody>
                  {CREDIT_SCHEDULE.map((row) => (
                    <tr
                      key={row.months}
                      className={
                        result.creditPct === row.pct ? "text-star" : ""
                      }
                    >
                      <td className="p-2">≤ {row.months}</td>
                      <td className="p-2 text-right">{row.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="mt-8 bg-jet border-dark-gray p-6">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Break-even
            </div>
            <div className="mt-2 text-sm">
              Cash-out must exceed{" "}
              <span className="font-semibold text-star">
                {currency(breakEven)}
              </span>{" "}
              to recover the refinance costs (premium + closing). Your
              projected cash-out of{" "}
              <span className="font-medium">
                {currency(result.cashOut + breakEven)}
              </span>{" "}
              gross of costs leaves{" "}
              <span
                className={`font-medium ${
                  result.cashOut >= 0 ? "text-star" : "text-muted-foreground"
                }`}
              >
                {currency(result.cashOut)}
              </span>{" "}
              of net equity extracted.
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Annual debt-service delta:{" "}
              {currency(result.currentAds - result.newAds)} (positive = lower
              payments on new loan)
            </div>
          </Card>
        </div>
      </section>

      <section className="border-b border-dark-gray bg-jet">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Accordion type="single" collapsible className="max-w-3xl">
            <AccordionItem value="methodology" className="border-dark-gray">
              <AccordionTrigger>Methodology and assumptions</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  Max new loan is the lesser of the program LTV cap (85% or
                  95%) and the DCR cap (1.10x–1.20x by program). The premium
                  credit is a stepped schedule: 75% within 12 months, 60% to
                  24, 50% to 36, 40% to 48, 35% to 60, 25% to 72, 20% to 84,
                  then 0%. The credit reduces the new premium payable; the net
                  premium is financed onto the loan, not paid in cash.
                </p>
                <p>
                  Cash to borrower = gross new loan − existing payoff − net
                  premium − closing costs. Break-even is the closing costs
                  plus net premium; cash-out above that level represents real
                  equity extracted. Debt service uses monthly-compounded
                  amortization.
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
  strong,
  accent,
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span
        className={`${accent ? "text-star" : "text-muted-foreground"} ${
          strong ? "font-medium" : ""
        }`}
      >
        {label}
      </span>
      <span
        className={`${accent ? "text-star" : ""} ${
          strong ? "font-semibold" : "font-medium"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
