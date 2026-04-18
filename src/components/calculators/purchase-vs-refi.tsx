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
import { annualDebtService, loanFromDCR } from "@/lib/loan";
import { calculatePremium } from "@/lib/premium";

type RefiProgram = "std" | "select";

interface ScenarioResult {
  name: string;
  tagline: string;
  maxLtv: number;
  minDcr: number;
  amort: number;
  rawLoan: number;
  ltv: number;
  premium: number;
  premiumPct: number;
  premiumCredit: number;
  netPremium: number;
  financedLoan: number;
  ads: number;
  dcr: number;
  equityIn: number;
  cashOut: number;
  cashFlow: number;
  coc: number;
  highlight?: boolean;
}

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

export default function PurchaseVsRefi() {
  const [propertyValue, setPropertyValue] = useState(20_000_000);
  const [noi, setNoi] = useState(950_000);
  const [rate, setRate] = useState(5.25);
  const [amort, setAmort] = useState(40);

  // Refi-specific
  const [existingBalance, setExistingBalance] = useState(11_000_000);
  const [monthsSinceInsurance, setMonthsSinceInsurance] = useState(24);
  const [originalPremium, setOriginalPremium] = useState(300_000);
  const [refiProgram, setRefiProgram] = useState<RefiProgram>("select");
  const [closingCosts, setClosingCosts] = useState(50_000);

  const purchase: ScenarioResult = useMemo(() => {
    const maxLtv = 85;
    const minDcr = 1.2;
    const ltvCap = propertyValue * (maxLtv / 100);
    const dcrCapUnadjusted = loanFromDCR(noi, minDcr, rate / 100, amort);

    // Iterate so that after premium financing the achieved DCR hits minDcr
    // when DCR is the binding constraint. Premium depends on loan & LTV, so
    // we fixed-point solve over a few iterations.
    let rawLoan = Math.max(0, Math.min(ltvCap, dcrCapUnadjusted));
    let ltv = propertyValue > 0 ? (rawLoan / propertyValue) * 100 : 0;
    let prem = calculatePremium({
      program: "mli-standard",
      txType: "purchaseRefi",
      loan: rawLoan,
      ltv,
      amortYears: amort,
      nonResidentialPct: 0,
      secondMortgage: false,
      egiNotMetFirstAdvance: false,
    });
    for (let i = 0; i < 8; i++) {
      const premFactor = rawLoan > 0 ? prem.amount / rawLoan : 0;
      const dcrCapAdjusted = dcrCapUnadjusted / (1 + premFactor);
      const next = Math.max(0, Math.min(ltvCap, dcrCapAdjusted));
      if (Math.abs(next - rawLoan) < 1) {
        rawLoan = next;
        ltv = propertyValue > 0 ? (rawLoan / propertyValue) * 100 : 0;
        break;
      }
      rawLoan = next;
      ltv = propertyValue > 0 ? (rawLoan / propertyValue) * 100 : 0;
      prem = calculatePremium({
        program: "mli-standard",
        txType: "purchaseRefi",
        loan: rawLoan,
        ltv,
        amortYears: amort,
        nonResidentialPct: 0,
        secondMortgage: false,
        egiNotMetFirstAdvance: false,
      });
    }
    prem = calculatePremium({
      program: "mli-standard",
      txType: "purchaseRefi",
      loan: rawLoan,
      ltv,
      amortYears: amort,
      nonResidentialPct: 0,
      secondMortgage: false,
      egiNotMetFirstAdvance: false,
    });
    const financedLoan = rawLoan + prem.amount;
    const ads = annualDebtService({
      principal: financedLoan,
      annualRate: rate / 100,
      amortYears: amort,
    });
    const dcr = ads > 0 ? noi / ads : 0;
    const equityIn = Math.max(0, propertyValue - rawLoan);
    const cashFlow = noi - ads;
    const coc = equityIn > 0 ? (cashFlow / equityIn) * 100 : 0;

    return {
      name: "Purchase · MLI Standard",
      tagline: "New acquisition · full premium",
      maxLtv,
      minDcr,
      amort,
      rawLoan,
      ltv,
      premium: prem.amount,
      premiumPct: prem.effectivePct,
      premiumCredit: 0,
      netPremium: prem.amount,
      financedLoan,
      ads,
      dcr,
      equityIn,
      cashOut: 0,
      cashFlow,
      coc,
    };
  }, [propertyValue, noi, rate, amort]);

  const refi: ScenarioResult = useMemo(() => {
    const maxLtv = refiProgram === "select" ? 85 : 80;
    const minDcr = refiProgram === "select" ? 1.1 : 1.2;
    const ltvCap = propertyValue * (maxLtv / 100);
    const dcrCapUnadjusted = loanFromDCR(noi, minDcr, rate / 100, amort);

    const program = refiProgram === "select" ? "mli-select" : "mli-standard";
    const selectTier = refiProgram === "select" ? (100 as const) : undefined;
    const creditPct = creditForMonths(monthsSinceInsurance);
    const credit = originalPremium * (creditPct / 100);

    // Iterate: when DCR binds, shrink rawLoan so NOI / ads(rawLoan + netPremium)
    // = minDcr. netPremium = max(0, premium − credit); premium depends on loan.
    let rawLoan = Math.max(0, Math.min(ltvCap, dcrCapUnadjusted));
    let ltv = propertyValue > 0 ? (rawLoan / propertyValue) * 100 : 0;
    let prem = calculatePremium({
      program,
      txType: "purchaseRefi",
      loan: rawLoan,
      ltv,
      amortYears: amort,
      nonResidentialPct: 0,
      secondMortgage: false,
      egiNotMetFirstAdvance: false,
      selectTier,
    });
    let netPremium = Math.max(0, prem.amount - credit);
    for (let i = 0; i < 8; i++) {
      const netFactor = rawLoan > 0 ? netPremium / rawLoan : 0;
      const dcrCapAdjusted = dcrCapUnadjusted / (1 + netFactor);
      const next = Math.max(0, Math.min(ltvCap, dcrCapAdjusted));
      if (Math.abs(next - rawLoan) < 1) {
        rawLoan = next;
        ltv = propertyValue > 0 ? (rawLoan / propertyValue) * 100 : 0;
        break;
      }
      rawLoan = next;
      ltv = propertyValue > 0 ? (rawLoan / propertyValue) * 100 : 0;
      prem = calculatePremium({
        program,
        txType: "purchaseRefi",
        loan: rawLoan,
        ltv,
        amortYears: amort,
        nonResidentialPct: 0,
        secondMortgage: false,
        egiNotMetFirstAdvance: false,
        selectTier,
      });
      netPremium = Math.max(0, prem.amount - credit);
    }
    prem = calculatePremium({
      program,
      txType: "purchaseRefi",
      loan: rawLoan,
      ltv,
      amortYears: amort,
      nonResidentialPct: 0,
      secondMortgage: false,
      egiNotMetFirstAdvance: false,
      selectTier,
    });
    netPremium = Math.max(0, prem.amount - credit);
    const financedLoan = rawLoan + netPremium;

    const ads = annualDebtService({
      principal: financedLoan,
      annualRate: rate / 100,
      amortYears: amort,
    });
    const dcr = ads > 0 ? noi / ads : 0;
    const cashOut = rawLoan - existingBalance - netPremium - closingCosts;
    const equityIn = Math.max(0, -cashOut);
    const displayEquityIn = Math.max(0, propertyValue - rawLoan);
    const cashFlow = noi - ads;
    // Cash-on-cash for refi uses equity remaining in the deal (value − loan)
    const coc =
      displayEquityIn > 0 ? (cashFlow / displayEquityIn) * 100 : 0;

    return {
      name:
        refiProgram === "select"
          ? "Refinance · MLI Select (100)"
          : "Refinance · MLI Standard",
      tagline:
        refiProgram === "select"
          ? "Existing · 85% LTV · 30% premium discount"
          : "Existing · 80% LTV · full premium",
      maxLtv,
      minDcr,
      amort,
      rawLoan,
      ltv,
      premium: prem.amount,
      premiumPct: prem.effectivePct,
      premiumCredit: credit,
      netPremium,
      financedLoan,
      ads,
      dcr,
      equityIn: Math.max(0, equityIn),
      cashOut: Math.max(0, cashOut),
      cashFlow,
      coc,
      highlight: true,
    };
  }, [
    propertyValue,
    noi,
    rate,
    amort,
    refiProgram,
    existingBalance,
    monthsSinceInsurance,
    originalPremium,
    closingCosts,
  ]);

  const scenarios = [purchase, refi];

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Purchase vs. Refinance
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Acquisition vs. recapitalization — same property, different math.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            On a new purchase you pay a full premium and inject equity. On a
            refinance of an already-insured asset, the premium credit
            partially offsets the new premium and equity can be pulled out.
            This tool runs both side by side on identical inputs.
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Card className="bg-jet border-dark-gray p-6">
            <div className="grid gap-4 lg:grid-cols-4">
              <div>
                <Label htmlFor="pv" className="text-xs text-muted-foreground">
                  Property value
                </Label>
                <Input
                  id="pv"
                  type="number"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(Number(e.target.value))}
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
                <Label htmlFor="rate" className="text-xs text-muted-foreground">
                  Rate %
                </Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                />
              </div>
              <div>
                <Label
                  htmlFor="amort"
                  className="text-xs text-muted-foreground"
                >
                  Amortization (yrs)
                </Label>
                <Input
                  id="amort"
                  type="number"
                  value={amort}
                  onChange={(e) => setAmort(Number(e.target.value))}
                />
              </div>
            </div>
          </Card>

          <Card className="mt-6 bg-jet border-dark-gray p-6">
            <Label className="text-sm font-semibold">
              Refinance-specific inputs
            </Label>
            <div className="mt-4 grid gap-4 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <Label className="text-xs text-muted-foreground">
                  Refinance program
                </Label>
                <Tabs
                  value={refiProgram}
                  onValueChange={(v) => setRefiProgram(v as RefiProgram)}
                  className="mt-2"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="std">MLI Standard (80%)</TabsTrigger>
                    <TabsTrigger value="select">MLI Select (85%)</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div>
                <Label htmlFor="eb" className="text-xs text-muted-foreground">
                  Existing balance
                </Label>
                <Input
                  id="eb"
                  type="number"
                  value={existingBalance}
                  onChange={(e) => setExistingBalance(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="ms" className="text-xs text-muted-foreground">
                  Months since insurance
                </Label>
                <Input
                  id="ms"
                  type="number"
                  value={monthsSinceInsurance}
                  onChange={(e) =>
                    setMonthsSinceInsurance(Number(e.target.value))
                  }
                />
              </div>
              <div>
                <Label htmlFor="op" className="text-xs text-muted-foreground">
                  Original premium
                </Label>
                <Input
                  id="op"
                  type="number"
                  value={originalPremium}
                  onChange={(e) => setOriginalPremium(Number(e.target.value))}
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

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {scenarios.map((s) => (
              <Card
                key={s.name}
                className={`bg-jet p-6 ${
                  s.highlight ? "border-star/60" : "border-dark-gray"
                }`}
              >
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {s.tagline}
                </div>
                <div className="mt-1 text-xl font-semibold">{s.name}</div>

                <div className="mt-5 border-t border-dark-gray pt-5">
                  <div className="text-xs text-muted-foreground">
                    Max loan (pre-premium)
                  </div>
                  <div className="mt-1 text-3xl font-semibold text-star">
                    {currency(s.rawLoan)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    LTV {percent(s.ltv)} · cap {s.maxLtv}% · DCR {s.minDcr}x
                  </div>
                </div>

                <dl className="mt-5 space-y-3 text-sm">
                  <Row label="Amortization" value={`${s.amort} yrs`} />
                  <Row
                    label="Premium (gross)"
                    value={`${currency(s.premium)} (${percent(s.premiumPct)})`}
                  />
                  <Row
                    label="Premium credit"
                    value={
                      s.premiumCredit > 0
                        ? `− ${currency(s.premiumCredit)}`
                        : "—"
                    }
                  />
                  <Row label="Net premium" value={currency(s.netPremium)} />
                  <Row
                    label="Financed loan (incl. premium)"
                    value={currency(s.financedLoan)}
                    strong
                  />
                  <Row
                    label="Annual debt service"
                    value={currency(s.ads)}
                  />
                  <Row
                    label="DCR achieved"
                    value={`${s.dcr.toFixed(2)}x`}
                    accent={s.dcr >= s.minDcr}
                  />
                  <Row label="Cash flow Y1" value={currency(s.cashFlow)} />
                  <Row
                    label="Equity in"
                    value={currency(s.equityIn)}
                  />
                  <Row
                    label="Cash out to borrower"
                    value={s.cashOut > 0 ? currency(s.cashOut) : "—"}
                    accent={s.cashOut > 0}
                  />
                  <Row
                    label="Cash-on-cash"
                    value={percent(s.coc)}
                  />
                </dl>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Δ Max loan (refi vs. purchase)
              </div>
              <div className="mt-2 text-3xl font-semibold text-star">
                {currency(refi.rawLoan - purchase.rawLoan)}
              </div>
            </Card>
            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Premium savings (credit)
              </div>
              <div className="mt-2 text-3xl font-semibold text-star">
                {currency(refi.premiumCredit)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Applied to new refi premium — not refunded.
              </p>
            </Card>
            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Refi cash-out
              </div>
              <div className="mt-2 text-3xl font-semibold text-star">
                {currency(refi.cashOut)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Net of existing payoff, net premium, closing costs.
              </p>
            </Card>
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
                  Purchase scenario: MLI Standard at 85% LTV / 1.20x DCR with
                  a full premium from the July 14, 2025 grid. Refinance
                  scenario: 80% LTV (MLI Standard) or 85% LTV (MLI Select 100
                  pt, 30% discount), with the stepped CMHC premium credit
                  subtracted from the new premium. The credit schedule: 75%
                  within 12 months, 60% to 24, 50% to 36, 40% to 48, 35% to
                  60, 25% to 72, 20% to 84, 0% after.
                </p>
                <p>
                  Max loan = min(LTV cap, DCR cap). Premium is financed onto
                  the principal; ADS is computed on loan + net premium. Refi
                  cash-out = pre-premium loan − existing balance − net
                  premium − closing costs.
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
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`${strong ? "font-semibold" : "font-medium"} ${
          accent ? "text-star" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
