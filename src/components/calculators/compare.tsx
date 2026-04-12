import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  amortizationSchedule,
  annualDebtService,
  loanFromDCR,
  monthlyPayment,
} from "@/lib/loan";
import { calculatePremium } from "@/lib/premium";
import { currency, percent } from "@/lib/format";

type PropertyType = "new" | "existing";

interface ScenarioResult {
  name: string;
  tagline: string;
  maxLtv: number;
  amort: number;
  maxLoan: number;
  equity: number;
  ads: number;
  dcr: number;
  premium: number; // $
  premiumPct: number;
  cashFlowY1: number;
  coc: number;
  totalInterestOverTerm: number;
  highlight?: boolean;
}

export default function Compare() {
  const [propertyType, setPropertyType] = useState<PropertyType>("new");
  const [propertyValue, setPropertyValue] = useState(20_000_000);
  const [noi, setNoi] = useState(950_000);
  const [rate, setRate] = useState(5.25);
  const [term, setTerm] = useState(10);

  const scenarios: ScenarioResult[] = useMemo(() => {
    const defineScenario = (opts: {
      name: string;
      tagline: string;
      maxLtv: number;
      amort: number;
      minDcr: number;
      insured: boolean;
      premiumFn?: (loan: number, ltv: number) => { pct: number; amt: number };
      highlight?: boolean;
    }): ScenarioResult => {
      const ltvCap = propertyValue * (opts.maxLtv / 100);
      const dcrCap = loanFromDCR(noi, opts.minDcr, rate / 100, opts.amort);
      const rawLoan = Math.max(0, Math.min(ltvCap, dcrCap));
      const ltv = propertyValue > 0 ? (rawLoan / propertyValue) * 100 : 0;

      // If insured, premium is financed onto the loan — approximate by adding
      // the premium to the principal (common CMHC practice for insured loans).
      let loan = rawLoan;
      let premiumPct = 0;
      let premiumAmt = 0;
      if (opts.insured && opts.premiumFn) {
        const p = opts.premiumFn(rawLoan, ltv);
        premiumPct = p.pct;
        premiumAmt = p.amt;
        loan = rawLoan + premiumAmt;
      }

      const ads = annualDebtService({
        principal: loan,
        annualRate: rate / 100,
        amortYears: opts.amort,
      });
      const equity = Math.max(0, propertyValue - rawLoan);
      const dcr = ads > 0 ? noi / ads : 0;
      const cashFlowY1 = noi - ads;
      const coc = equity > 0 ? (cashFlowY1 / equity) * 100 : 0;

      const sched = amortizationSchedule(
        { principal: loan, annualRate: rate / 100, amortYears: opts.amort },
        term,
      );
      const totalInterestOverTerm = sched.reduce((a, r) => a + r.interest, 0);

      return {
        name: opts.name,
        tagline: opts.tagline,
        maxLtv: opts.maxLtv,
        amort: opts.amort,
        maxLoan: loan,
        equity,
        ads,
        dcr,
        premium: premiumAmt,
        premiumPct,
        cashFlowY1,
        coc,
        totalInterestOverTerm,
        highlight: opts.highlight,
      };
    };

    // Conventional: 75% LTV, 25yr, no insurance, 1.25 DCR
    const conv = defineScenario({
      name: "Conventional",
      tagline: "Uninsured, no affordability",
      maxLtv: 75,
      amort: 25,
      minDcr: 1.25,
      insured: false,
    });

    // MLI Standard: 85% LTV, 50yr new / 40yr existing, 1.20 DCR, construction/purchaseRefi premium
    const stdAmort = propertyType === "new" ? 50 : 40;
    const std = defineScenario({
      name: "MLI Standard",
      tagline: "Insured, no affordability",
      maxLtv: 85,
      amort: stdAmort,
      minDcr: 1.2,
      insured: true,
      premiumFn: (loan, ltv) => {
        const r = calculatePremium({
          program: "mli-standard",
          txType: propertyType === "new" ? "construction" : "purchaseRefi",
          loan,
          ltv,
          amortYears: stdAmort,
          nonResidentialPct: 0,
          secondMortgage: false,
          egiNotMetFirstAdvance: false,
        });
        return { pct: r.effectivePct, amt: r.amount };
      },
    });

    // MLI Select 100-point: 95% LTV, 50yr, 1.10 DCR, construction premium w/ 30% discount
    const sel = defineScenario({
      name: "MLI Select (100 pts)",
      tagline: "Flagship — 30% premium discount",
      maxLtv: 95,
      amort: 50,
      minDcr: 1.1,
      insured: true,
      premiumFn: (loan, ltv) => {
        const r = calculatePremium({
          program: "mli-select",
          txType: propertyType === "new" ? "construction" : "purchaseRefi",
          loan,
          ltv,
          amortYears: 50,
          nonResidentialPct: 0,
          secondMortgage: false,
          egiNotMetFirstAdvance: false,
          selectTier: 100,
        });
        return { pct: r.effectivePct, amt: r.amount };
      },
      highlight: true,
    });

    return [conv, std, sel];
  }, [propertyType, propertyValue, noi, rate, term]);

  const bestCoc = Math.max(...scenarios.map((s) => s.coc));
  const minEquity = Math.min(...scenarios.map((s) => s.equity));
  const convEquity = scenarios[0].equity;
  const selEquity = scenarios[2].equity;
  const capitalRecaptured = Math.max(0, convEquity - selEquity);

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Scenario Comparison · Conventional vs. Select vs. Standard
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            See exactly what CMHC buys you.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Same property, same NOI, same rate — three financing structures.
            The Helio Urban Development example in our guide shows the
            difference: roughly 7% cash-on-cash under conventional vs. ~32%
            under MLI Select, with ~$238K of capital recaptured at takeout.
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Card className="bg-jet border-dark-gray p-6">
            <div className="grid gap-4 md:grid-cols-5 items-end">
              <div className="md:col-span-2">
                <Label className="text-xs text-muted-foreground">Property type</Label>
                <Tabs
                  value={propertyType}
                  onValueChange={(v) => setPropertyType(v as PropertyType)}
                  className="mt-2"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="new">New construction</TabsTrigger>
                    <TabsTrigger value="existing">Existing</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div>
                <Label htmlFor="pv" className="text-xs text-muted-foreground">
                  {propertyType === "new" ? "Project cost" : "Lending value"}
                </Label>
                <Input id="pv" type="number" value={propertyValue} onChange={(e) => setPropertyValue(Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="noi" className="text-xs text-muted-foreground">NOI (year 1)</Label>
                <Input id="noi" type="number" value={noi} onChange={(e) => setNoi(Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="rate" className="text-xs text-muted-foreground">Rate %</Label>
                <Input id="rate" type="number" step="0.01" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
              </div>
              <div className="md:col-span-5">
                <Label htmlFor="term" className="text-xs text-muted-foreground">Term (yrs, for total interest)</Label>
                <Input id="term" type="number" value={term} onChange={(e) => setTerm(Number(e.target.value))} />
              </div>
            </div>
          </Card>

          {/* SCENARIO COLUMNS */}
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
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
                  <div className="text-xs text-muted-foreground">Max loan</div>
                  <div className="mt-1 text-3xl font-semibold text-star">
                    {currency(s.maxLoan)}
                  </div>
                </div>

                <dl className="mt-5 space-y-3 text-sm">
                  <Row label="Max LTV" value={`${s.maxLtv}%`} />
                  <Row label="Amortization" value={`${s.amort} yrs`} />
                  <Row
                    label="Equity required"
                    value={currency(s.equity)}
                    accent={s.equity === minEquity}
                  />
                  <Row label="Annual debt service" value={currency(s.ads)} />
                  <Row label="Cash flow Y1" value={currency(s.cashFlowY1)} />
                  <Row
                    label="Cash-on-cash"
                    value={percent(s.coc)}
                    accent={s.coc === bestCoc}
                  />
                  <Row label="DCR achieved" value={`${s.dcr.toFixed(2)}x`} />
                  <Row
                    label="Total insurance premium"
                    value={s.premium > 0 ? `${currency(s.premium)} (${percent(s.premiumPct)})` : "—"}
                  />
                  <Row
                    label={`Total interest over ${term} yrs`}
                    value={currency(s.totalInterestOverTerm)}
                  />
                </dl>
              </Card>
            ))}
          </div>

          {/* KEY DELTAS */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Capital recaptured (Select vs. Conv)
              </div>
              <div className="mt-2 text-3xl font-semibold text-star">
                {currency(capitalRecaptured)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                How much less equity MLI Select requires vs. conventional.
              </p>
            </Card>
            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Cash-on-cash lift
              </div>
              <div className="mt-2 text-3xl font-semibold text-star">
                {percent(scenarios[2].coc - scenarios[0].coc)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                MLI Select minus conventional on the same NOI.
              </p>
            </Card>
            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Insurance premium cost
              </div>
              <div className="mt-2 text-3xl font-semibold">
                {currency(scenarios[2].premium)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                MLI Select 100-pt premium — what you're paying for the leverage lift.
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
                  Conventional scenario: 75% LTV, 25-year amortization, 1.25
                  minimum DCR, uninsured. MLI Standard: 85% LTV, 50-year new /
                  40-year existing, 1.20 DCR, July 2025 insured premium grid.
                  MLI Select 100-point: 95% LTV, 50-year amortization, 1.10
                  DCR, premium net of 30% tier-3 discount.
                </p>
                <p>
                  For insured scenarios the premium is financed onto the loan
                  (a common CMHC convention), so the principal used for debt
                  service and total interest is loan + premium. Max loan is
                  the smaller of LTV cap and DCR cap within each scenario's
                  constraints. Rate and term apply identically across all
                  three scenarios.
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
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? "font-semibold text-star" : "font-medium"}>{value}</span>
    </div>
  );
}
