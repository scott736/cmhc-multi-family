import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MLI_SELECT_DISCOUNTS } from "@/data/cmhc";
import { annualDebtService, loanFromDCR, monthlyPayment } from "@/lib/loan";
import { currency, percent } from "@/lib/format";

type ProgramKind = "mli-standard" | "mli-select";
type PropertyType = "new" | "existing";
type SelectTier = 50 | 70 | 100;
type TxType = "purchase" | "refinance";

export default function LoanSizer() {
  const [propertyType, setPropertyType] = useState<PropertyType>("new");
  const [program, setProgram] = useState<ProgramKind>("mli-select");
  const [selectTier, setSelectTier] = useState<SelectTier>(100);
  const [txType, setTxType] = useState<TxType>("purchase");

  const [buildNoi, setBuildNoi] = useState(false);
  const [grossRent, setGrossRent] = useState(1_800_000);
  const [vacancyPct, setVacancyPct] = useState(3);
  const [opexPct, setOpexPct] = useState(35);

  const [propertyValue, setPropertyValue] = useState(20_000_000);
  const [directNoi, setDirectNoi] = useState(950_000);
  const [rate, setRate] = useState(5.25);
  const [amort, setAmort] = useState(40);
  const [term, setTerm] = useState(10);
  const [units, setUnits] = useState(60);

  // Derived NOI
  const noi = useMemo(() => {
    if (!buildNoi) return directNoi;
    const egi = grossRent * (1 - vacancyPct / 100);
    return egi - grossRent * (1 - vacancyPct / 100) * (opexPct / 100);
  }, [buildNoi, grossRent, vacancyPct, opexPct, directNoi]);

  // Program caps
  const { maxLtv, minDcr, maxAmort } = useMemo(() => {
    if (program === "mli-select") {
      const tierKey = selectTier === 100 ? "tier3" : selectTier === 70 ? "tier2" : "tier1";
      const t = MLI_SELECT_DISCOUNTS[tierKey];
      const maxLtvEff = propertyType === "new" ? t.maxLtvNew : t.maxLtvExisting;
      return { maxLtv: maxLtvEff, minDcr: t.dcr, maxAmort: t.maxAmort };
    }
    // MLI Standard: 85% LTV. 50yr amort for new, 40yr for existing.
    const stdAmort = propertyType === "new" ? 50 : 40;
    // Min DCR depends on unit count & tx type
    let dcr = 1.2;
    if (units <= 6) {
      dcr = txType === "purchase" ? 1.1 : 1.2;
    } else {
      dcr = term >= 10 ? 1.2 : 1.3;
    }
    return { maxLtv: 85, minDcr: dcr, maxAmort: stdAmort };
  }, [program, selectTier, propertyType, units, txType, term]);

  const effectiveAmort = Math.min(amort, maxAmort);

  // Loan caps
  const ltvCap = propertyValue * (maxLtv / 100);
  const dcrCap = loanFromDCR(noi, minDcr, rate / 100, effectiveAmort);
  // "Program cap" is effectively same as LTV cap here, but keeping separate for
  // future expansion (e.g., fixed dollar limits). Use LTV.
  const programCap = ltvCap;

  const maxLoan = Math.max(0, Math.min(ltvCap, dcrCap, programCap));
  const binding =
    maxLoan === dcrCap && dcrCap < ltvCap
      ? "DCR"
      : maxLoan === ltvCap && ltvCap <= dcrCap
        ? "LTV / LTC"
        : "Program cap";

  const ads = annualDebtService({
    principal: maxLoan,
    annualRate: rate / 100,
    amortYears: effectiveAmort,
  });
  const monthly = monthlyPayment({
    principal: maxLoan,
    annualRate: rate / 100,
    amortYears: effectiveAmort,
  });
  const dcrAchieved = ads > 0 ? noi / ads : 0;
  const effectiveLtv = propertyValue > 0 ? (maxLoan / propertyValue) * 100 : 0;
  const equity = Math.max(0, propertyValue - maxLoan);

  // Bar chart proportions (relative to highest cap)
  const maxCap = Math.max(ltvCap, dcrCap, programCap, 1);
  const ltvPct = (ltvCap / maxCap) * 100;
  const dcrPct = (dcrCap / maxCap) * 100;

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Loan Sizer · Triple-constrained
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Size the loan against all three constraints.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            CMHC lenders approve the smaller of: LTV / LTC, minimum DCR, and
            program cap. This tool computes all three and highlights which one
            binds — so you know whether your deal is leverage-capped or
            coverage-capped before you apply.
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            {/* INPUTS */}
            <div className="space-y-6">
              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Property type
                </Label>
                <Tabs
                  value={propertyType}
                  onValueChange={(v) => setPropertyType(v as PropertyType)}
                  className="mt-3"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="new">New construction (cost base)</TabsTrigger>
                    <TabsTrigger value="existing">Existing (lending value)</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="pv" className="text-xs text-muted-foreground">
                      {propertyType === "new" ? "Project cost" : "Lending value"}
                    </Label>
                    <Input
                      id="pv"
                      type="number"
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="units" className="text-xs text-muted-foreground">
                      Number of units
                    </Label>
                    <Input
                      id="units"
                      type="number"
                      value={units}
                      onChange={(e) => setUnits(Number(e.target.value))}
                    />
                  </div>
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">NOI</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Build from rent</span>
                    <Switch checked={buildNoi} onCheckedChange={setBuildNoi} />
                  </div>
                </div>

                {!buildNoi ? (
                  <div className="mt-4">
                    <Label htmlFor="noi" className="text-xs text-muted-foreground">
                      Stabilized NOI (year 1)
                    </Label>
                    <Input
                      id="noi"
                      type="number"
                      value={directNoi}
                      onChange={(e) => setDirectNoi(Number(e.target.value))}
                    />
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="gr" className="text-xs text-muted-foreground">
                        Gross rent / yr
                      </Label>
                      <Input
                        id="gr"
                        type="number"
                        value={grossRent}
                        onChange={(e) => setGrossRent(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vac" className="text-xs text-muted-foreground">
                        Vacancy %
                      </Label>
                      <Input
                        id="vac"
                        type="number"
                        step="0.1"
                        value={vacancyPct}
                        onChange={(e) => setVacancyPct(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="opex" className="text-xs text-muted-foreground">
                        Opex % of EGI
                      </Label>
                      <Input
                        id="opex"
                        type="number"
                        step="0.1"
                        value={opexPct}
                        onChange={(e) => setOpexPct(Number(e.target.value))}
                      />
                    </div>
                    <div className="sm:col-span-3 text-xs text-muted-foreground">
                      Derived NOI: <span className="text-foreground">{currency(noi)}</span>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Debt terms</Label>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
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
                    <Label htmlFor="amort" className="text-xs text-muted-foreground">
                      Amortization (yrs)
                    </Label>
                    <Input
                      id="amort"
                      type="number"
                      value={amort}
                      onChange={(e) => setAmort(Number(e.target.value))}
                    />
                    {amort > maxAmort && (
                      <p className="mt-1 text-xs text-star">
                        Capped at program max {maxAmort} yrs
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="term" className="text-xs text-muted-foreground">
                      Term (yrs)
                    </Label>
                    <Input
                      id="term"
                      type="number"
                      value={term}
                      onChange={(e) => setTerm(Number(e.target.value))}
                    />
                  </div>
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Program</Label>
                <Tabs
                  value={program}
                  onValueChange={(v) => setProgram(v as ProgramKind)}
                  className="mt-3"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="mli-standard">MLI Standard</TabsTrigger>
                    <TabsTrigger value="mli-select">MLI Select</TabsTrigger>
                  </TabsList>
                </Tabs>

                {program === "mli-select" ? (
                  <div className="mt-4">
                    <Label className="text-xs text-muted-foreground">Points tier</Label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {([50, 70, 100] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectTier(t)}
                          className={`rounded border px-3 py-2 text-sm transition-colors ${
                            selectTier === t
                              ? "border-star/60 bg-star/5 text-star"
                              : "border-dark-gray hover:border-star/40"
                          }`}
                        >
                          {t} pts
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <Label className="text-xs text-muted-foreground">Transaction</Label>
                    <Tabs
                      value={txType}
                      onValueChange={(v) => setTxType(v as TxType)}
                      className="mt-2"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="purchase">Purchase</TabsTrigger>
                        <TabsTrigger value="refinance">Refinance</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                )}
              </Card>
            </div>

            {/* OUTPUTS */}
            <div className="lg:sticky lg:top-6 self-start space-y-6">
              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Max loan
                </div>
                <div className="mt-2 text-4xl font-semibold text-star">
                  {currency(maxLoan)}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Binding constraint:{" "}
                  <span className="font-medium text-foreground">{binding}</span>
                </div>

                {/* Constraint bars */}
                <div className="mt-5 space-y-3">
                  <ConstraintBar
                    label="LTV / LTC cap"
                    value={ltvCap}
                    pct={ltvPct}
                    binding={binding === "LTV / LTC"}
                    sub={`${maxLtv}% of ${currency(propertyValue)}`}
                  />
                  <ConstraintBar
                    label="DCR cap"
                    value={dcrCap}
                    pct={dcrPct}
                    binding={binding === "DCR"}
                    sub={`NOI ${currency(noi)} ÷ ${minDcr} DCR ÷ constant`}
                  />
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  At max loan
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Equity required</dt>
                    <dd className="mt-1 text-2xl font-semibold">{currency(equity)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Effective LTV</dt>
                    <dd className="mt-1 text-2xl font-semibold text-star">
                      {percent(effectiveLtv)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Annual debt service</dt>
                    <dd className="mt-1 text-xl font-semibold">{currency(ads)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Monthly P+I</dt>
                    <dd className="mt-1 text-xl font-semibold">{currency(monthly)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">DCR achieved</dt>
                    <dd className="mt-1 text-2xl font-semibold text-star">
                      {dcrAchieved.toFixed(2)}x
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Min DCR required</dt>
                    <dd className="mt-1 text-2xl font-semibold">{minDcr}x</dd>
                  </div>
                </dl>
              </Card>

              <Card className="bg-jet border-dark-gray p-6 text-sm">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Program terms applied
                </div>
                <ul className="mt-3 space-y-1 text-muted-foreground">
                  <li>
                    Max LTV/LTC:{" "}
                    <span className="text-foreground">{maxLtv}%</span>
                  </li>
                  <li>
                    Max amortization:{" "}
                    <span className="text-foreground">{maxAmort} yrs</span>
                  </li>
                  <li>
                    Minimum DCR:{" "}
                    <span className="text-foreground">{minDcr}x</span>
                  </li>
                  <li>
                    Effective amortization used:{" "}
                    <span className="text-foreground">{effectiveAmort} yrs</span>
                  </li>
                </ul>
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
                  Debt service uses monthly-compounded amortization as an
                  approximation of Canadian semi-annual compounding. Payment
                  difference vs. the exact semi-annual formula is under 5 basis
                  points for typical CMHC-insured multi-unit loans.
                </p>
                <p>
                  The LTV cap is property value × max LTV. The DCR cap is NOI ÷
                  minimum DCR ÷ mortgage constant (annualized). Program cap is
                  modelled as equal to the LTV cap here — real program caps
                  include project-specific items (e.g., cost overrun reserves,
                  holdbacks) that a lender applies during underwriting.
                </p>
                <p>
                  For MLI Standard: 5–6 unit purchases use 1.10 DCR, refinances
                  1.20; 7+ units use 1.20 if term ≥ 10 yrs, otherwise 1.30. For
                  MLI Select, minimum DCR is 1.10 across all tiers.
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

function ConstraintBar({
  label,
  value,
  pct,
  binding,
  sub,
}: {
  label: string;
  value: number;
  pct: number;
  binding: boolean;
  sub: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className={binding ? "font-medium text-star" : "text-muted-foreground"}>
          {label}
          {binding && (
            <Badge className="ml-2 bg-star/15 text-star border border-star/40">binding</Badge>
          )}
        </span>
        <span className={binding ? "font-medium" : "text-muted-foreground"}>
          {currency(value)}
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded bg-obsidian border border-dark-gray">
        <div
          className={`h-full ${binding ? "bg-star" : "bg-muted-foreground/40"}`}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
