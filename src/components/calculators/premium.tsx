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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MLI_STANDARD_PREMIUMS } from "@/data/cmhc";
import { currency, percent } from "@/lib/format";
import { calculatePremium, type ProgramKind, type SelectTier,type TxType } from "@/lib/premium";

export default function PremiumCalculator() {
  const [program, setProgram] = useState<ProgramKind>("mli-select");
  const [selectTier, setSelectTier] = useState<SelectTier>(100);
  const [txType, setTxType] = useState<TxType>("purchaseRefi");

  const [loan, setLoan] = useState(10_000_000);
  const [ltv, setLtv] = useState(85);
  const [amort, setAmort] = useState(50);
  const [nonResPct, setNonResPct] = useState(0);
  const [secondMortgage, setSecondMortgage] = useState(false);
  const [egiNotMet, setEgiNotMet] = useState(false);

  const result = useMemo(
    () =>
      calculatePremium({
        program,
        txType,
        loan,
        ltv,
        amortYears: amort,
        nonResidentialPct: nonResPct,
        secondMortgage,
        egiNotMetFirstAdvance: egiNotMet,
        selectTier: program === "mli-select" ? selectTier : undefined,
      }),
    [program, txType, loan, ltv, amort, nonResPct, secondMortgage, egiNotMet, selectTier],
  );

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Premium Calculator · July 14, 2025 grid
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Compute your CMHC insurance premium.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            The July 14, 2025 overhaul replaced MLI Select's flat pricing with
            LTV-tiered rates — and amortization surcharges (+0.25% per 5 yrs
            beyond 25) now apply to MLI Select for the first time. This
            calculator applies the current grid, stacks all surcharges, and
            subtracts the tier-based MLI Select discount.
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            {/* INPUTS */}
            <div className="space-y-6">
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

                {program === "mli-select" && (
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
                )}

                <div className="mt-5">
                  <Label className="text-xs text-muted-foreground">Transaction type</Label>
                  <Tabs
                    value={txType}
                    onValueChange={(v) => setTxType(v as TxType)}
                    className="mt-2"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="purchaseRefi">Purchase / refinance</TabsTrigger>
                      <TabsTrigger value="construction">Construction</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Loan & leverage</Label>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="loan" className="text-xs text-muted-foreground">
                      Loan amount
                    </Label>
                    <Input
                      id="loan"
                      type="number"
                      value={loan}
                      onChange={(e) => setLoan(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ltv" className="text-xs text-muted-foreground">
                      LTV %
                    </Label>
                    <Input
                      id="ltv"
                      type="number"
                      step="0.1"
                      value={ltv}
                      onChange={(e) => setLtv(Number(e.target.value))}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="amort" className="text-xs text-muted-foreground">
                      Amortization (yrs) — surcharge applies beyond 25
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

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-sm font-semibold">Surcharges</Label>
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="nonres" className="text-xs text-muted-foreground">
                      Non-residential portion % (adds +1.00% applied proportionally)
                    </Label>
                    <Input
                      id="nonres"
                      type="number"
                      step="0.1"
                      value={nonResPct}
                      onChange={(e) => setNonResPct(Number(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded border border-dark-gray bg-obsidian p-3">
                    <div>
                      <div className="text-sm font-medium">Second mortgage</div>
                      <div className="text-xs text-muted-foreground">Adds +0.50% flat.</div>
                    </div>
                    <Switch checked={secondMortgage} onCheckedChange={setSecondMortgage} />
                  </div>

                  <div
                    className={`flex items-center justify-between rounded border p-3 ${
                      txType === "construction"
                        ? "border-dark-gray bg-obsidian"
                        : "border-dark-gray/40 bg-obsidian/40 opacity-60"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-medium">EGI NOT met at first advance</div>
                      <div className="text-xs text-muted-foreground">
                        Construction only. Adds +0.25% if effective gross income target
                        not achieved at first advance.
                      </div>
                    </div>
                    <Switch
                      checked={egiNotMet}
                      onCheckedChange={setEgiNotMet}
                      disabled={txType !== "construction"}
                    />
                  </div>
                </div>
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  LTV band detected
                </Label>
                <div className="mt-2 text-sm">
                  {result.band} →{" "}
                  <span className="font-medium">
                    {txType === "construction" ? "construction" : "purchase/refi"}
                  </span>{" "}
                  base {percent(result.basePct)}
                </div>
                <div className="mt-3 overflow-hidden rounded border border-dark-gray">
                  <table className="w-full text-xs">
                    <thead className="bg-obsidian text-muted-foreground">
                      <tr>
                        <th className="p-2 text-left font-normal">LTV band</th>
                        <th className="p-2 text-right font-normal">Purchase / refi</th>
                        <th className="p-2 text-right font-normal">Construction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MLI_STANDARD_PREMIUMS.map((b) => (
                        <tr
                          key={b.band}
                          className={b.band === result.band ? "text-star" : ""}
                        >
                          <td className="p-2">{b.band}</td>
                          <td className="p-2 text-right">{percent(b.purchaseRefi)}</td>
                          <td className="p-2 text-right">{percent(b.construction)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* OUTPUTS */}
            <div className="lg:sticky lg:top-6 self-start space-y-6">
              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Effective premium
                </div>
                <div className="mt-2 text-4xl font-semibold text-star">
                  {percent(result.effectivePct)}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  = {currency(result.amount)} on {currency(loan)}
                </div>
                {program === "mli-select" && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Subtotal {percent(result.subtotalPct)} × (1 −{" "}
                    {percent(result.selectDiscountPct * 100, 0)} MLI Select discount)
                  </div>
                )}
              </Card>

              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Premium stack
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <Row label={`Base (${result.band} · ${txType === "construction" ? "construction" : "purchase/refi"})`} value={percent(result.basePct)} />
                  <Row
                    label={`Amortization surcharge (${amort} yrs)`}
                    value={
                      result.amortSurchargePct > 0
                        ? `+${percent(result.amortSurchargePct)}`
                        : "—"
                    }
                  />
                  <Row
                    label={`Non-residential (${nonResPct}%)`}
                    value={
                      result.nonResSurchargePct > 0
                        ? `+${percent(result.nonResSurchargePct)}`
                        : "—"
                    }
                  />
                  <Row
                    label="Second mortgage"
                    value={
                      result.secondMortgagePct > 0
                        ? `+${percent(result.secondMortgagePct)}`
                        : "—"
                    }
                  />
                  <Row
                    label="EGI not met (construction 1st advance)"
                    value={
                      result.egiSurchargePct > 0
                        ? `+${percent(result.egiSurchargePct)}`
                        : "—"
                    }
                  />
                  <div className="border-t border-dark-gray pt-2">
                    <Row label="Subtotal" value={percent(result.subtotalPct)} strong />
                  </div>
                  {program === "mli-select" && (
                    <Row
                      label={`MLI Select discount (tier ${selectTier})`}
                      value={`− ${percent(result.selectDiscountPct * 100, 0)}`}
                      accent
                    />
                  )}
                  <div className="border-t border-dark-gray pt-2">
                    <Row label="Effective premium" value={percent(result.effectivePct)} strong />
                    <Row label="Premium $" value={currency(result.amount)} />
                  </div>
                </dl>
              </Card>

              <Card className="bg-jet border-dark-gray p-6 text-xs text-muted-foreground">
                <p>
                  <span className="text-star">Important:</span> Per July 14, 2025,
                  amortization surcharges now apply to MLI Select. A 100-point
                  project at 95% LTV / 50-yr amort now pays approximately
                  <span className="text-foreground"> 4.62%</span> vs. the old
                  flat <span className="text-foreground">2.55%</span>.
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
                  Base premium is read from the July 14, 2025 LTV-tiered grid.
                  Amortization surcharge is 0.25% per full 5-year band above 25
                  years (partial bands rounded up). The non-residential
                  surcharge of +1.00% is applied proportionally to the
                  non-residential share of the loan — e.g., 10% non-residential
                  = +0.10%.
                </p>
                <p>
                  MLI Select discounts (10% / 20% / 30% for 50 / 70 / 100 point
                  tiers) are applied after surcharges are summed, per CMHC's
                  current approach. Prior to July 14, 2025, MLI Select used a
                  flat premium; that regime is no longer applicable.
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
    <div className="flex items-center justify-between">
      <span className={`${strong ? "font-medium" : ""} ${accent ? "text-star" : "text-muted-foreground"}`}>
        {label}
      </span>
      <span className={`${strong ? "font-semibold" : ""} ${accent ? "text-star" : ""}`}>
        {value}
      </span>
    </div>
  );
}
