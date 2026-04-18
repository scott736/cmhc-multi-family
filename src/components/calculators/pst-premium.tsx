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
  calculatePremium,
  type ProgramKind,
  type SelectTier,
} from "@/lib/premium";

interface Province {
  code: string;
  name: string;
  rate: number; // % on insurance premium
}

const PROVINCES: Province[] = [
  { code: "ON", name: "Ontario", rate: 8 },
  { code: "QC", name: "Quebec", rate: 9.975 },
  { code: "SK", name: "Saskatchewan", rate: 6 },
  { code: "MB", name: "Manitoba", rate: 7 },
  { code: "BC", name: "British Columbia", rate: 0 },
  { code: "AB", name: "Alberta", rate: 0 },
  { code: "NS", name: "Nova Scotia", rate: 0 },
  { code: "NB", name: "New Brunswick", rate: 0 },
  { code: "NL", name: "Newfoundland & Labrador", rate: 0 },
  { code: "PE", name: "Prince Edward Island", rate: 0 },
  { code: "Other", name: "Other / no PST", rate: 0 },
];

type MiniProgram = "std" | "sel-50" | "sel-70" | "sel-100";

export default function PstPremium() {
  // Direct mode
  const [premiumAmount, setPremiumAmount] = useState(300_000);
  const [loanForPctContext, setLoanForPctContext] = useState(10_000_000);
  const [provinceCode, setProvinceCode] = useState("ON");

  // Mini calc from loan + program
  const [miniLoan, setMiniLoan] = useState(10_000_000);
  const [miniLtv, setMiniLtv] = useState(85);
  const [miniAmort, setMiniAmort] = useState(50);
  const [miniProgram, setMiniProgram] = useState<MiniProgram>("sel-100");
  const [miniProvinceCode, setMiniProvinceCode] = useState("ON");

  const province =
    PROVINCES.find((p) => p.code === provinceCode) ?? PROVINCES[0];
  const miniProvince =
    PROVINCES.find((p) => p.code === miniProvinceCode) ?? PROVINCES[0];

  const pstAmount = premiumAmount * (province.rate / 100);
  const totalCost = premiumAmount + pstAmount;
  const pstPctOfLoan =
    loanForPctContext > 0 ? (pstAmount / loanForPctContext) * 100 : 0;

  // Mini calc
  const miniResult = useMemo(() => {
    const program: ProgramKind =
      miniProgram === "std" ? "mli-standard" : "mli-select";
    const selectTier: SelectTier | undefined =
      miniProgram === "sel-50"
        ? 50
        : miniProgram === "sel-70"
          ? 70
          : miniProgram === "sel-100"
            ? 100
            : undefined;
    const prem = calculatePremium({
      program,
      txType: "purchaseRefi",
      loan: miniLoan,
      ltv: miniLtv,
      amortYears: miniAmort,
      nonResidentialPct: 0,
      secondMortgage: false,
      egiNotMetFirstAdvance: false,
      selectTier,
    });
    const pst = prem.amount * (miniProvince.rate / 100);
    return {
      premium: prem.amount,
      premiumPct: prem.effectivePct,
      pst,
      total: prem.amount + pst,
    };
  }, [miniLoan, miniLtv, miniAmort, miniProgram, miniProvince.rate]);

  return (
    <div className="bg-obsidian text-foreground">
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            PST on CMHC Insurance Premium
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Budget for PST at closing — not in the mortgage.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            CMHC premiums are subject to provincial sales tax in ON, QC, SK
            and MB.{" "}
            <span className="text-star">
              PST on insurance premium is NOT capitalizable in the mortgage
            </span>
            — it is paid upfront, out-of-pocket, at closing as a cash line
            item. This trips up first-time CMHC deals.
          </p>
        </div>
      </section>

      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <Card className="bg-jet border-dark-gray p-6">
              <Label className="text-sm font-semibold">
                Direct premium &amp; province
              </Label>
              <div className="mt-4 grid gap-4">
                <div>
                  <Label htmlFor="pp" className="text-xs text-muted-foreground">
                    CMHC premium ($)
                  </Label>
                  <Input
                    id="pp"
                    type="number"
                    value={premiumAmount}
                    onChange={(e) => setPremiumAmount(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="ln" className="text-xs text-muted-foreground">
                    Loan amount (for PST as % of loan)
                  </Label>
                  <Input
                    id="ln"
                    type="number"
                    value={loanForPctContext}
                    onChange={(e) =>
                      setLoanForPctContext(Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Province
                  </Label>
                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {PROVINCES.map((p) => (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => setProvinceCode(p.code)}
                        className={`rounded border px-2 py-2 text-xs transition-colors ${
                          provinceCode === p.code
                            ? "border-star/60 bg-star/5 text-star"
                            : "border-dark-gray hover:border-star/40"
                        }`}
                      >
                        {p.code}
                        {p.rate > 0 ? ` (${p.rate}%)` : ""}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-jet border-dark-gray p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                PST on premium · {province.name}
              </div>
              <div className="mt-2 text-4xl font-semibold text-star">
                {currency(pstAmount)}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                At {province.rate}% of {currency(premiumAmount)} premium
              </div>

              <dl className="mt-6 space-y-2 text-sm">
                <Row label="Premium" value={currency(premiumAmount)} />
                <Row
                  label={`PST (${province.rate}%)`}
                  value={currency(pstAmount)}
                />
                <div className="border-t border-dark-gray pt-2">
                  <Row
                    label="Total premium + PST"
                    value={currency(totalCost)}
                    strong
                  />
                </div>
                <Row label="PST as % of loan" value={percent(pstPctOfLoan)} />
              </dl>

              <div className="mt-5 rounded border border-star/40 bg-star/5 p-3 text-xs text-muted-foreground">
                <span className="text-star font-medium">
                  Upfront cash at closing.
                </span>{" "}
                The premium itself capitalizes onto the loan. The PST does
                not — include it in your closing cash reconciliation alongside
                legal, appraisal, and lender fees.
              </div>
            </Card>
          </div>

          <Card className="mt-8 bg-jet border-dark-gray p-6">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Reference · $100,000 CMHC premium
            </div>
            <div className="mt-4 overflow-hidden rounded border border-dark-gray">
              <table className="w-full text-sm">
                <thead className="bg-obsidian text-muted-foreground">
                  <tr>
                    <th className="p-3 text-left font-normal">Province</th>
                    <th className="p-3 text-right font-normal">PST rate</th>
                    <th className="p-3 text-right font-normal">PST on $100K</th>
                    <th className="p-3 text-right font-normal">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {PROVINCES.map((p) => {
                    const pst = 100_000 * (p.rate / 100);
                    return (
                      <tr
                        key={p.code}
                        className={
                          provinceCode === p.code
                            ? "text-star"
                            : "border-t border-dark-gray"
                        }
                      >
                        <td className="p-3">{p.name}</td>
                        <td className="p-3 text-right">
                          {p.rate > 0 ? `${p.rate}%` : "—"}
                        </td>
                        <td className="p-3 text-right">{currency(pst)}</td>
                        <td className="p-3 text-right">
                          {currency(100_000 + pst)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="mt-8 bg-jet border-dark-gray p-6">
            <Label className="text-sm font-semibold">
              Or compute from loan size + program
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Enter loan details to compute the premium first, then PST.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="ml" className="text-xs text-muted-foreground">
                  Loan amount
                </Label>
                <Input
                  id="ml"
                  type="number"
                  value={miniLoan}
                  onChange={(e) => setMiniLoan(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="mltv" className="text-xs text-muted-foreground">
                  LTV %
                </Label>
                <Input
                  id="mltv"
                  type="number"
                  step="0.1"
                  value={miniLtv}
                  onChange={(e) => setMiniLtv(Number(e.target.value))}
                />
              </div>
              <div>
                <Label
                  htmlFor="mamort"
                  className="text-xs text-muted-foreground"
                >
                  Amort (yrs)
                </Label>
                <Input
                  id="mamort"
                  type="number"
                  value={miniAmort}
                  onChange={(e) => setMiniAmort(Number(e.target.value))}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Program</Label>
                <Tabs
                  value={miniProgram}
                  onValueChange={(v) => setMiniProgram(v as MiniProgram)}
                  className="mt-2"
                >
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="std">Std</TabsTrigger>
                    <TabsTrigger value="sel-50">50</TabsTrigger>
                    <TabsTrigger value="sel-70">70</TabsTrigger>
                    <TabsTrigger value="sel-100">100</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            <div className="mt-4">
              <Label className="text-xs text-muted-foreground">Province</Label>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {PROVINCES.map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => setMiniProvinceCode(p.code)}
                    className={`rounded border px-2 py-2 text-xs transition-colors ${
                      miniProvinceCode === p.code
                        ? "border-star/60 bg-star/5 text-star"
                        : "border-dark-gray hover:border-star/40"
                    }`}
                  >
                    {p.code}
                    {p.rate > 0 ? ` (${p.rate}%)` : ""}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded border border-dark-gray bg-obsidian p-4">
                <div className="text-xs text-muted-foreground">
                  Computed premium
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {currency(miniResult.premium)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {percent(miniResult.premiumPct)}
                </div>
              </div>
              <div className="rounded border border-dark-gray bg-obsidian p-4">
                <div className="text-xs text-muted-foreground">
                  PST ({miniProvince.rate}%)
                </div>
                <div className="mt-1 text-xl font-semibold text-star">
                  {currency(miniResult.pst)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Upfront at closing
                </div>
              </div>
              <div className="rounded border border-dark-gray bg-obsidian p-4">
                <div className="text-xs text-muted-foreground">
                  Total premium + PST
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {currency(miniResult.total)}
                </div>
              </div>
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
                  PST rates on insurance premiums: Ontario 8%, Quebec 9.975%,
                  Saskatchewan 6%, Manitoba 7%. Other provinces do not levy PST
                  on insurance. Rates are applied to the CMHC premium amount,
                  not to the loan.
                </p>
                <p>
                  The CMHC premium is capitalized onto the mortgage principal
                  (paid over the loan term through debt service). The PST on
                  that premium, however, is a cash closing cost and cannot be
                  financed. Budget it alongside legal, appraisal, and lender
                  setup fees.
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
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-semibold" : "font-medium"}>{value}</span>
    </div>
  );
}
