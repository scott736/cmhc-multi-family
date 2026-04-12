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

// Stepped credit schedule. CMHC publishes a premium credit table for
// refinances where existing CMHC-insured loans are replaced. The exact year
// tables vary by product; this tool uses a commonly cited schedule:
// 75% in year 1, stepping down to 20% by year 7.
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

export default function PremiumCredit() {
  const [originalPremium, setOriginalPremium] = useState(250_000);
  const [monthsSince, setMonthsSince] = useState(24);

  const creditPct = useMemo(() => creditForMonths(monthsSince), [monthsSince]);
  const creditAmount = originalPremium * (creditPct / 100);

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Premium Credit · Refinance
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Estimate your CMHC premium credit.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            When you refinance a property that already carries CMHC insurance,
            a portion of the original premium is credited against the new
            premium — the credit declines with time since the original
            insurance was placed.
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <Card className="bg-jet border-dark-gray p-6">
              <Label className="text-sm font-semibold">Original insurance</Label>
              <div className="mt-4 grid gap-4">
                <div>
                  <Label htmlFor="op" className="text-xs text-muted-foreground">
                    Original CMHC premium paid
                  </Label>
                  <Input
                    id="op"
                    type="number"
                    value={originalPremium}
                    onChange={(e) => setOriginalPremium(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="ms" className="text-xs text-muted-foreground">
                    Months since CMHC insurance placed
                  </Label>
                  <Input
                    id="ms"
                    type="number"
                    value={monthsSince}
                    onChange={(e) => setMonthsSince(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded border border-dark-gray">
                <table className="w-full text-xs">
                  <thead className="bg-obsidian text-muted-foreground">
                    <tr>
                      <th className="p-2 text-left font-normal">Within (months)</th>
                      <th className="p-2 text-right font-normal">Credit %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CREDIT_SCHEDULE.map((row) => (
                      <tr
                        key={row.months}
                        className={creditPct === row.pct ? "text-star" : ""}
                      >
                        <td className="p-2">≤ {row.months}</td>
                        <td className="p-2 text-right">{row.pct}%</td>
                      </tr>
                    ))}
                    <tr className={creditPct === 0 ? "text-muted-foreground" : "text-muted-foreground/60"}>
                      <td className="p-2">&gt; 84</td>
                      <td className="p-2 text-right">0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Premium credit
              </div>
              <div className="mt-2 text-4xl font-semibold text-star">
                {currency(creditAmount)}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {percent(creditPct, 0)} of the original {currency(originalPremium)} premium
              </div>

              <div className="mt-6 rounded border border-dark-gray p-4 text-sm">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  How this applies
                </div>
                <p className="mt-2 text-muted-foreground">
                  The credit reduces the premium payable on the refinance. If
                  the new premium would be $320,000 and your credit is{" "}
                  {currency(creditAmount)}, you pay{" "}
                  <span className="text-foreground font-medium">
                    {currency(Math.max(0, 320_000 - creditAmount))}
                  </span>{" "}
                  (for that example only).
                </p>
              </div>
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
                  The credit schedule used here is stepped: 75% within year 1,
                  60% year 2, 50% year 3, 40% year 4, 35% year 5, 25% year 6,
                  20% year 7, then 0% after 84 months. CMHC's published
                  schedule varies slightly by product and over time; this
                  reflects a conservative commonly-cited stepped decline from
                  75% to 20%.
                </p>
                <p>
                  The credit is applied against the new refinance premium,
                  not refunded in cash. Additional rules may apply if the new
                  loan increases leverage or changes product type.
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
