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
import {
  amortizationSchedule,
  annualDebtService,
  loanFromDCR,
} from "@/lib/loan";
import { calculatePremium } from "@/lib/premium";

interface Scenario {
  name: string;
  tagline: string;
  rawLoan: number;
  financedLoan: number;
  premium: number;
  premiumPct: number;
  maxLtv: number;
  ltv: number;
  amort: number;
  rate: number;
  minDcr: number;
  ads: number;
  dcr: number;
  equity: number;
  cashFlow: number;
  coc: number;
  totalInterest10yr: number;
  highlight?: boolean;
}

export default function ConventionalVsCmhc() {
  const [propertyValue, setPropertyValue] = useState(20_000_000);
  const [noi, setNoi] = useState(950_000);

  const [convRate, setConvRate] = useState(6.25);
  const [convAmort, setConvAmort] = useState(25);
  const [convDcr, setConvDcr] = useState(1.25);
  const [convLtv, setConvLtv] = useState(75);

  const [cmhcRate, setCmhcRate] = useState(5.25);
  const [stdAmort, setStdAmort] = useState(40);
  const [selAmort, setSelAmort] = useState(50);

  const scenarios: Scenario[] = useMemo(() => {
    // Conventional
    const conv = buildScenario({
      name: "Conventional",
      tagline: "Uninsured · 1.25x DCR · 25yr",
      maxLtv: convLtv,
      minDcr: convDcr,
      amort: convAmort,
      rate: convRate,
      insured: false,
      propertyValue,
      noi,
    });

    // MLI Standard
    const std = buildScenario({
      name: "MLI Standard",
      tagline: "Insured · 85% LTV · 1.20x DCR",
      maxLtv: 85,
      minDcr: 1.2,
      amort: stdAmort,
      rate: cmhcRate,
      insured: true,
      program: "mli-standard",
      propertyValue,
      noi,
    });

    // MLI Select 100
    const sel = buildScenario({
      name: "MLI Select (100)",
      tagline: "Insured · 95% LTV · 1.10x DCR · 30% discount",
      maxLtv: 95,
      minDcr: 1.1,
      amort: selAmort,
      rate: cmhcRate,
      insured: true,
      program: "mli-select",
      selectTier: 100,
      propertyValue,
      noi,
      highlight: true,
    });

    return [conv, std, sel];
  }, [
    propertyValue,
    noi,
    convRate,
    convAmort,
    convDcr,
    convLtv,
    cmhcRate,
    stdAmort,
    selAmort,
  ]);

  const conv = scenarios[0];
  const sel = scenarios[2];
  const capitalRecaptured = Math.max(0, conv.equity - sel.equity);
  const premiumCost = sel.premium;
  // Break-even: premium / annual cash-flow lift
  const annualCfLift = sel.cashFlow - conv.cashFlow;
  const breakEvenYears =
    annualCfLift > 0 ? premiumCost / annualCfLift : Infinity;

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Conventional vs. CMHC
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            When does CMHC's premium pay for itself?
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Conventional offers no premium and a shorter amortization.
            CMHC-insured loans charge a premium (capitalized into the loan)
            in exchange for dramatically longer amortization, lower DCR, and
            higher LTV. This tool sizes all three side-by-side on identical
            NOI and shows when the premium is recovered through cash-flow
            uplift.
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Card className="bg-jet border-dark-gray p-6">
            <Label className="text-sm font-semibold">Shared inputs</Label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
            </div>
          </Card>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="bg-jet border-dark-gray p-6">
              <Label className="text-sm font-semibold">
                Conventional parameters
              </Label>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label
                    htmlFor="cr"
                    className="text-xs text-muted-foreground"
                  >
                    Conv rate (%)
                  </Label>
                  <Input
                    id="cr"
                    type="number"
                    step="0.01"
                    value={convRate}
                    onChange={(e) => setConvRate(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="ca"
                    className="text-xs text-muted-foreground"
                  >
                    Conv amort (yrs)
                  </Label>
                  <Input
                    id="ca"
                    type="number"
                    value={convAmort}
                    onChange={(e) => setConvAmort(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="cd"
                    className="text-xs text-muted-foreground"
                  >
                    Conv min DCR
                  </Label>
                  <Input
                    id="cd"
                    type="number"
                    step="0.05"
                    value={convDcr}
                    onChange={(e) => setConvDcr(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="cl"
                    className="text-xs text-muted-foreground"
                  >
                    Conv max LTV %
                  </Label>
                  <Input
                    id="cl"
                    type="number"
                    value={convLtv}
                    onChange={(e) => setConvLtv(Number(e.target.value))}
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-jet border-dark-gray p-6">
              <Label className="text-sm font-semibold">CMHC parameters</Label>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label
                    htmlFor="hr"
                    className="text-xs text-muted-foreground"
                  >
                    CMHC rate (%)
                  </Label>
                  <Input
                    id="hr"
                    type="number"
                    step="0.01"
                    value={cmhcRate}
                    onChange={(e) => setCmhcRate(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="sa"
                    className="text-xs text-muted-foreground"
                  >
                    Standard amort (yrs)
                  </Label>
                  <Input
                    id="sa"
                    type="number"
                    value={stdAmort}
                    onChange={(e) => setStdAmort(Number(e.target.value))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label
                    htmlFor="ela"
                    className="text-xs text-muted-foreground"
                  >
                    Select amort (yrs)
                  </Label>
                  <Input
                    id="ela"
                    type="number"
                    value={selAmort}
                    onChange={(e) => setSelAmort(Number(e.target.value))}
                  />
                </div>
              </div>
            </Card>
          </div>

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
                    {currency(s.financedLoan)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    LTV {percent(s.ltv)} · cap {s.maxLtv}%
                  </div>
                </div>

                <dl className="mt-5 space-y-3 text-sm">
                  <Row label="Rate" value={`${s.rate.toFixed(2)}%`} />
                  <Row label="Amortization" value={`${s.amort} yrs`} />
                  <Row label="Min DCR" value={`${s.minDcr.toFixed(2)}x`} />
                  <Row
                    label="Premium"
                    value={
                      s.premium > 0
                        ? `${currency(s.premium)} (${percent(s.premiumPct)})`
                        : "—"
                    }
                  />
                  <Row label="Equity required" value={currency(s.equity)} />
                  <Row label="Annual debt service" value={currency(s.ads)} />
                  <Row
                    label="DCR achieved"
                    value={`${s.dcr.toFixed(2)}x`}
                    accent={s.dcr >= s.minDcr}
                  />
                  <Row label="Cash flow Y1" value={currency(s.cashFlow)} />
                  <Row label="Cash-on-cash" value={percent(s.coc)} />
                  <Row
                    label="Total interest 10yr"
                    value={currency(s.totalInterest10yr)}
                  />
                </dl>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Capital recaptured
              </div>
              <div className="mt-2 text-3xl font-semibold text-star">
                {currency(capitalRecaptured)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Select vs. conventional equity requirement.
              </p>
            </Card>
            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Premium paid (Select)
              </div>
              <div className="mt-2 text-3xl font-semibold">
                {currency(premiumCost)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Capitalized into the loan.
              </p>
            </Card>
            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Premium break-even
              </div>
              <div className="mt-2 text-3xl font-semibold text-star">
                {isFinite(breakEvenYears)
                  ? `${breakEvenYears.toFixed(1)} yrs`
                  : "n/a"}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Years for cash-flow uplift to recover Select premium.
              </p>
            </Card>
          </div>

          <Card className="mt-8 bg-jet border-dark-gray p-6 text-sm">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Callout · Premium mechanics
            </div>
            <p className="mt-2 text-muted-foreground">
              <span className="text-star font-medium">
                Premium is capitalized
              </span>{" "}
              into the CMHC loan — it's not paid in cash. You pay it through
              debt service over the amortization.
            </p>
            <p className="mt-2 text-muted-foreground">
              <span className="text-star font-medium">
                PST on the premium
              </span>{" "}
              (ON 8%, QC 9.975%, SK 6%, MB 7%) is cash at closing and NOT
              financeable. Budget alongside legal &amp; appraisal.
            </p>
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
                  Conventional is uninsured, typically 65–75% LTV with 1.25x
                  DCR and 25-year amortization; default assumptions reflect
                  those levels. CMHC pricing uses the July 14, 2025 grid with
                  amortization surcharges; MLI Select receives a 30% discount
                  at 100 points. Max loan is min(LTV cap, DCR cap) in each
                  case. For insured scenarios the premium is financed onto
                  principal and ADS reflects loan + premium.
                </p>
                <p>
                  10-year total interest uses monthly-compounded amortization.
                  Break-even is the Select premium divided by the annual
                  cash-flow uplift vs. conventional — simplified, excluding
                  time-value effects and assuming stable NOI.
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

interface ScenarioOpts {
  name: string;
  tagline: string;
  maxLtv: number;
  minDcr: number;
  amort: number;
  rate: number;
  insured: boolean;
  program?: "mli-standard" | "mli-select";
  selectTier?: 50 | 70 | 100;
  propertyValue: number;
  noi: number;
  highlight?: boolean;
}

function buildScenario(opts: ScenarioOpts): Scenario {
  const ltvCap = opts.propertyValue * (opts.maxLtv / 100);
  const dcrCap = loanFromDCR(
    opts.noi,
    opts.minDcr,
    opts.rate / 100,
    opts.amort,
  );
  const rawLoan = Math.max(0, Math.min(ltvCap, dcrCap));
  const ltv =
    opts.propertyValue > 0 ? (rawLoan / opts.propertyValue) * 100 : 0;

  let premium = 0;
  let premiumPct = 0;
  let financedLoan = rawLoan;
  if (opts.insured && opts.program) {
    const r = calculatePremium({
      program: opts.program,
      txType: "purchaseRefi",
      loan: rawLoan,
      ltv,
      amortYears: opts.amort,
      nonResidentialPct: 0,
      secondMortgage: false,
      egiNotMetFirstAdvance: false,
      selectTier: opts.selectTier,
    });
    premium = r.amount;
    premiumPct = r.effectivePct;
    financedLoan = rawLoan + premium;
  }

  const ads = annualDebtService({
    principal: financedLoan,
    annualRate: opts.rate / 100,
    amortYears: opts.amort,
  });
  const equity = Math.max(0, opts.propertyValue - rawLoan);
  const dcr = ads > 0 ? opts.noi / ads : 0;
  const cashFlow = opts.noi - ads;
  const coc = equity > 0 ? (cashFlow / equity) * 100 : 0;

  const sched = amortizationSchedule(
    {
      principal: financedLoan,
      annualRate: opts.rate / 100,
      amortYears: opts.amort,
    },
    10,
  );
  const totalInterest10yr = sched.reduce((a, r) => a + r.interest, 0);

  return {
    name: opts.name,
    tagline: opts.tagline,
    rawLoan,
    financedLoan,
    premium,
    premiumPct,
    maxLtv: opts.maxLtv,
    ltv,
    amort: opts.amort,
    rate: opts.rate,
    minDcr: opts.minDcr,
    ads,
    dcr,
    equity,
    cashFlow,
    coc,
    totalInterest10yr,
    highlight: opts.highlight,
  };
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
      <span className={accent ? "font-semibold text-star" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}
