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
import { Switch } from "@/components/ui/switch";
import { MUNICIPAL_INCENTIVES } from "@/data/cmhc";
import { currency, percent } from "@/lib/format";

type FederalProgram = "aclp" | "mli-select" | "ahf" | "chdp";

interface ProgramConfig {
  label: string;
  maxLtc: number; // maximum LTC advance %
  hasForgivable: boolean;
  forgivablePerUnitMin: number;
  forgivablePerUnitMax: number;
  forgivableCostCapPct: number; // max % of project cost from forgivable
  interestRate: number; // annual % for repayable portion (editorial approx)
  requiresNonProfit: boolean;
  requiresIncomeQualified: boolean;
  notes: string;
}

const PROGRAM_CONFIGS: Record<FederalProgram, ProgramConfig> = {
  aclp: {
    label: "ACLP (Apartment Construction Loan Program)",
    maxLtc: 100,
    hasForgivable: false,
    forgivablePerUnitMin: 0,
    forgivablePerUnitMax: 0,
    forgivableCostCapPct: 0,
    interestRate: 4.5,
    requiresNonProfit: false,
    requiresIncomeQualified: false,
    notes:
      "Direct CMHC below-market fixed-rate construction loan with integrated insurance. Up to 100% of residential cost; 50-year amortization. Affordability: 20% of units ≤ 30% MFI.",
  },
  "mli-select": {
    label: "MLI Select",
    maxLtc: 95,
    hasForgivable: false,
    forgivablePerUnitMin: 0,
    forgivablePerUnitMax: 0,
    forgivableCostCapPct: 0,
    interestRate: 5.25,
    requiresNonProfit: false,
    requiresIncomeQualified: false,
    notes:
      "Points-based CMHC insurance to a 95% LTC at Tier 3 (100 pts). Market rate insured financing via approved lender. No forgivable component.",
  },
  ahf: {
    label: "AHF (Affordable Housing Fund)",
    maxLtc: 95,
    hasForgivable: true,
    forgivablePerUnitMin: 25_000,
    forgivablePerUnitMax: 75_000,
    forgivableCostCapPct: 40,
    interestRate: 2.0,
    requiresNonProfit: false,
    requiresIncomeQualified: true,
    notes:
      "Repayable low-interest loan up to 95% LTC PLUS forgivable contribution of $25–75K/unit (up to 40% of eligible project costs). Non-profit / Indigenous / government sponsors get deeper forgivable.",
  },
  chdp: {
    label: "CHDP (Co-operative Housing Development)",
    maxLtc: 100,
    hasForgivable: true,
    forgivablePerUnitMin: 30_000,
    forgivablePerUnitMax: 90_000,
    forgivableCostCapPct: 50,
    interestRate: 2.0,
    requiresNonProfit: true,
    requiresIncomeQualified: true,
    notes:
      "Co-op housing only. Up to 100% of eligible costs combining repayable and forgivable contributions.",
  },
};

// Per-unit municipal incentive estimates (NPV-ish, order of magnitude).
// These are editorial approximations for the stacking model only — exact
// figures come from the municipal program term sheets.
function estimateMunicipalPerAffordableUnit(city: string): number {
  switch (city) {
    case "Toronto":
      return 97_264; // waived DCs + tax reduction NPV
    case "Ottawa":
      return 7_000 * 20; // $6-8K/unit/yr × 20 years
    case "Vancouver":
      return 75_000; // DCL waivers approx NPV
    case "Calgary":
      return 35_000; // property tax exemption NPV for non-market
    case "Edmonton":
      return 50_000; // grant alignment estimate
    case "Montreal":
      return 40_000; // SHQ 40% match estimate
    default:
      return 0;
  }
}

export default function GrantStacking() {
  const [totalProjectCost, setTotalProjectCost] = useState(30_000_000);
  const [unitCount, setUnitCount] = useState(100);
  const [affordableUnitPct, setAffordableUnitPct] = useState(25);
  const [city, setCity] = useState("Toronto");
  const [federalProgram, setFederalProgram] = useState<FederalProgram>("mli-select");
  const [incomeQualified, setIncomeQualified] = useState(true);
  const [nonProfit, setNonProfit] = useState(false);
  const [forgivablePerUnit, setForgivablePerUnit] = useState(50_000);

  const config = PROGRAM_CONFIGS[federalProgram];
  const affordableUnits = Math.round((affordableUnitPct / 100) * unitCount);

  // Eligibility warnings
  const warnings = useMemo(() => {
    const w: string[] = [];
    if (config.requiresNonProfit && !nonProfit) {
      w.push(`${config.label} requires a non-profit / co-op sponsor.`);
    }
    if (config.requiresIncomeQualified && !incomeQualified) {
      w.push(`${config.label} requires income-qualified affordable units.`);
    }
    return w;
  }, [config, nonProfit, incomeQualified]);

  // Federal loan sizing
  const federalLoan = (config.maxLtc / 100) * totalProjectCost;

  // Forgivable grant sizing: capped at both per-unit-max × affordable units
  // and forgivableCostCapPct × project cost.
  const forgivableFromPerUnit = config.hasForgivable
    ? Math.min(
        Math.max(forgivablePerUnit, config.forgivablePerUnitMin),
        config.forgivablePerUnitMax,
      ) * affordableUnits
    : 0;
  const forgivableFromCap = config.hasForgivable
    ? (config.forgivableCostCapPct / 100) * totalProjectCost
    : 0;
  const forgivableGrant = config.hasForgivable
    ? Math.min(forgivableFromPerUnit, forgivableFromCap)
    : 0;

  // Municipal incentive — applied only to affordable units
  const municipalPerUnit = estimateMunicipalPerAffordableUnit(city);
  const municipalTotal = municipalPerUnit * affordableUnits;

  // Stacking: federal loan goes toward cost basis; forgivable + municipal
  // reduce the equity requirement directly.
  const rawEquityConventional = totalProjectCost * 0.25; // 25% equity baseline
  const stackingTotal = federalLoan + forgivableGrant + municipalTotal;
  const equityAfterStacking = Math.max(0, totalProjectCost - stackingTotal);

  // Effective blended cost of capital (weighted by source size)
  const forgivableRate = 0; // grants = zero interest
  const municipalRate = 0; // municipal incentives treated as zero-cost equity substitute
  const equityRate = 12; // assumed investor equity target return
  const totalCapital =
    federalLoan + forgivableGrant + municipalTotal + equityAfterStacking;
  const blendedCost = totalCapital > 0
    ? (federalLoan * config.interestRate +
        forgivableGrant * forgivableRate +
        municipalTotal * municipalRate +
        equityAfterStacking * equityRate) /
      totalCapital
    : 0;

  const municipalNote =
    MUNICIPAL_INCENTIVES.find((m) => m.city === city)?.benefit ?? "";

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Federal + Municipal · Grant Stacking
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Stack federal loans, forgivable grants and municipal incentives.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Combines ACLP / MLI Select / AHF / CHDP with the major municipal
            affordable-housing incentive programs in Toronto, Vancouver,
            Calgary, Edmonton, Ottawa and Montreal. Shows how much equity you
            actually need after the stack vs. the conventional 25%.
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-6">
              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Project</Label>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="cost" className="text-xs text-muted-foreground">
                      Total project cost
                    </Label>
                    <Input
                      id="cost"
                      type="number"
                      value={totalProjectCost}
                      onChange={(e) => setTotalProjectCost(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="units" className="text-xs text-muted-foreground">
                      Units
                    </Label>
                    <Input
                      id="units"
                      type="number"
                      value={unitCount}
                      onChange={(e) => setUnitCount(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="affp" className="text-xs text-muted-foreground">
                      Affordable %
                    </Label>
                    <Input
                      id="affp"
                      type="number"
                      value={affordableUnitPct}
                      onChange={(e) => setAffordableUnitPct(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Affordable units
                    </Label>
                    <div className="mt-2 text-sm">{affordableUnits}</div>
                  </div>
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Federal program</Label>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(Object.keys(PROGRAM_CONFIGS) as FederalProgram[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFederalProgram(key)}
                      className={`rounded border px-3 py-2 text-left text-xs transition-colors ${
                        federalProgram === key
                          ? "border-star/60 bg-star/5 text-star"
                          : "border-dark-gray hover:border-star/40"
                      }`}
                    >
                      <div className="font-medium">
                        {PROGRAM_CONFIGS[key].label.split(" (")[0]}
                      </div>
                      <div className="mt-1 text-[10px] text-muted-foreground">
                        Up to {PROGRAM_CONFIGS[key].maxLtc}% LTC
                      </div>
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{config.notes}</p>

                {config.hasForgivable && (
                  <div className="mt-4">
                    <Label htmlFor="fgp" className="text-xs text-muted-foreground">
                      Forgivable $/affordable unit (range ${config.forgivablePerUnitMin.toLocaleString()} – ${config.forgivablePerUnitMax.toLocaleString()})
                    </Label>
                    <Input
                      id="fgp"
                      type="number"
                      value={forgivablePerUnit}
                      onChange={(e) => setForgivablePerUnit(Number(e.target.value))}
                    />
                  </div>
                )}
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Borrower</Label>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded border border-dark-gray bg-obsidian p-3">
                    <div>
                      <div className="text-sm font-medium">Non-profit / co-op</div>
                      <div className="text-xs text-muted-foreground">
                        Required for CHDP and deep AHF contributions.
                      </div>
                    </div>
                    <Switch checked={nonProfit} onCheckedChange={setNonProfit} />
                  </div>
                  <div className="flex items-center justify-between rounded border border-dark-gray bg-obsidian p-3">
                    <div>
                      <div className="text-sm font-medium">Income-qualified units</div>
                      <div className="text-xs text-muted-foreground">
                        Affordable units rented to income-tested households.
                      </div>
                    </div>
                    <Switch checked={incomeQualified} onCheckedChange={setIncomeQualified} />
                  </div>
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Municipality</Label>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {MUNICIPAL_INCENTIVES.map((m) => (
                    <button
                      key={m.city}
                      type="button"
                      onClick={() => setCity(m.city)}
                      className={`rounded border px-3 py-2 text-left text-xs transition-colors ${
                        city === m.city
                          ? "border-star/60 bg-star/5 text-star"
                          : "border-dark-gray hover:border-star/40"
                      }`}
                    >
                      <div className="font-medium">{m.city}</div>
                      <div className="mt-1 text-[10px] text-muted-foreground">
                        {m.program}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{municipalNote}</p>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Equity after stacking
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-star">
                    {currency(equityAfterStacking)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    vs. {currency(rawEquityConventional)} conventional (25%)
                  </div>
                </Card>
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Blended cost of capital
                  </div>
                  <div className="mt-2 text-3xl font-semibold">
                    {percent(blendedCost)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Weighted by federal loan, forgivable, municipal, equity
                  </div>
                </Card>
              </div>

              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Capital stack
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <StackRow
                    label={`Federal loan · ${config.label.split(" (")[0]} (${config.maxLtc}% LTC @ ${percent(config.interestRate)})`}
                    value={currency(federalLoan)}
                  />
                  {config.hasForgivable && (
                    <StackRow
                      label="Forgivable grant"
                      value={currency(forgivableGrant)}
                      accent
                    />
                  )}
                  <StackRow
                    label={`Municipal incentive (${city}) · ${currency(municipalPerUnit)}/affordable unit`}
                    value={currency(municipalTotal)}
                    accent
                  />
                  <StackRow
                    label="Sponsor equity required"
                    value={currency(equityAfterStacking)}
                    strong
                  />
                  <div className="border-t border-dark-gray pt-2">
                    <StackRow
                      label="Total project cost"
                      value={currency(totalProjectCost)}
                      strong
                    />
                  </div>
                </dl>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Equity requirement: before vs. after
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <BarRow
                    label="Conventional (25% equity)"
                    value={rawEquityConventional}
                    max={Math.max(rawEquityConventional, equityAfterStacking)}
                  />
                  <BarRow
                    label="After stacking"
                    value={equityAfterStacking}
                    max={Math.max(rawEquityConventional, equityAfterStacking)}
                    accent
                  />
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Equity reduction:{" "}
                  <span className="text-star">
                    {currency(Math.max(0, rawEquityConventional - equityAfterStacking))}
                  </span>
                  {rawEquityConventional > 0 && (
                    <span>
                      {" "}
                      ({percent(
                        ((rawEquityConventional - equityAfterStacking) / rawEquityConventional) *
                          100,
                        0,
                      )}
                      )
                    </span>
                  )}
                </p>
              </Card>

              {warnings.length > 0 && (
                <Card className="bg-jet border-star/40 p-6 text-sm text-star">
                  <div className="text-xs uppercase tracking-wide">Eligibility warnings</div>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    {warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </Card>
              )}

              <Card className="bg-jet border-dark-gray p-6 text-xs text-muted-foreground space-y-2">
                <p>
                  <span className="text-star">For-profit borrowers:</span> MLI
                  Select and ACLP are open to for-profits. AHF has a for-profit
                  track with thinner forgivable. CHDP is co-op only.
                </p>
                <p>
                  <span className="text-star">Stacking rules:</span> CMHC
                  generally allows municipal incentives to stack on top of
                  federal loans. Some AHF / CHDP contributions may limit total
                  public contribution to a percentage of project cost — confirm
                  with CMHC program contacts.
                </p>
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
                  Federal loan sizing uses the maximum loan-to-cost for each
                  program: ACLP 100% (residential), MLI Select 95% at Tier 3,
                  AHF 95% repayable, CHDP 100% combined. The actual advance
                  will depend on DCR, program constraints and underwriting
                  discretion; use the loan sizer for a binding-constraint view.
                </p>
                <p>
                  Forgivable grant sizing uses the per-unit range × affordable
                  unit count, capped at a percentage of project cost (40% for
                  AHF, 50% for CHDP). Per-unit figures are editable within the
                  published range.
                </p>
                <p>
                  Municipal incentives are order-of-magnitude per-affordable-unit
                  estimates: Toronto ~$97,264 (waived DCs + tax reduction NPV),
                  Ottawa ~$7,000/unit/yr × 20yr (CIP TIEGs), Vancouver ~$75,000
                  (DCL waivers), Calgary ~$35,000 (non-market tax exemption
                  NPV), Edmonton ~$50,000 (AHIP alignment), Montreal ~$40,000
                  (SHQ 40% match). Refine with your municipal contact — exact
                  figures vary by project.
                </p>
                <p>
                  Blended cost of capital is a weighted average of federal loan
                  interest, zero-cost forgivable and municipal contributions,
                  and a 12% assumed return on residual equity. It is a
                  decision-support metric, not an IRR.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="disclaimer" className="border-dark-gray">
              <AccordionTrigger>Disclaimer</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Results are estimates for educational purposes. Confirm all
                program terms, eligibility and dollar figures with CMHC, the
                relevant municipality, and an approved lender.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
}

function StackRow({
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
    <div className="flex items-center justify-between gap-4">
      <span
        className={`${strong ? "font-medium" : ""} ${
          accent ? "text-star" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
      <span className={`${strong ? "font-semibold" : ""} ${accent ? "text-star" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function BarRow({
  label,
  value,
  max,
  accent,
}: {
  label: string;
  value: number;
  max: number;
  accent?: boolean;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={accent ? "text-star" : ""}>{currency(value)}</span>
      </div>
      <div className="mt-1 h-2 w-full rounded bg-obsidian">
        <div
          className={`h-2 rounded ${accent ? "bg-star" : "bg-mid-gray"}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}
