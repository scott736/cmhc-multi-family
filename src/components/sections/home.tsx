import {
  ArrowRight,
  Building2,
  Calculator,
  CheckCircle2,
  Database,
  FileText,
  Landmark,
  Layers,
  LineChart,
  MapPin,
  Scale,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const programs = [
  {
    name: "MLI Select",
    href: "/programs/mli-select",
    tagline: "Points-based flagship",
    body: "95% LTC, 50-year amortization, and up to 30% premium discount for 100-point projects. Now the dominant CMHC multi-unit product.",
    icon: TrendingUp,
  },
  {
    name: "MLI Standard",
    href: "/programs/mli-standard",
    tagline: "Market rental, 5+ units",
    body: "Foundational product for purchase, refinance and new construction — up to 85% LTV, 40–50yr amortization, no affordability commitment required.",
    icon: Building2,
  },
  {
    name: "ACLP",
    href: "/programs/aclp",
    tagline: "CMHC direct construction lending",
    body: "Below-market fixed rates with integrated insurance. $55B program targeting 131,000+ new homes by 2031–32.",
    icon: Landmark,
  },
  {
    name: "AHF",
    href: "/programs/ahf",
    tagline: "Affordable Housing Fund ($14.6B)",
    body: "Repayable loans up to 95% LTC plus forgivable loans of $25–75K per unit (up to 40% of costs).",
    icon: Scale,
  },
  {
    name: "CHDP",
    href: "/programs/chdp",
    tagline: "Co-operative Housing Development",
    body: "$1.5B — largest federal co-op housing investment in 30+ years. Repayable + forgivable up to 100% of eligible costs.",
    icon: Layers,
  },
  {
    name: "Specialized",
    href: "/programs/specialized",
    tagline: "Retirement, student, supportive, SRO",
    body: "Standard CMHC insurance for 50+ unit retirement, student, supportive, and SRO projects — higher premium schedules than market rental.",
    icon: Building2,
  },
];

const calculators = [
  {
    name: "MLI Select Point Scorer",
    href: "/calculators/point-scorer",
    body: "Score affordability, energy and accessibility. See exactly which tier (50 / 70 / 100) you qualify for.",
    icon: Calculator,
  },
  {
    name: "Loan Sizer",
    href: "/calculators/loan-sizer",
    body: "Triple-constrained: LTV/LTC, minimum DCR, and program cap. Outputs max loan, required equity, annual debt service.",
    icon: LineChart,
  },
  {
    name: "Premium Calculator",
    href: "/calculators/premium",
    body: "July 14, 2025 LTV-tiered grid. Handles amortization, non-residential, second-mortgage, and EGI surcharges plus MLI Select discount.",
    icon: Calculator,
  },
  {
    name: "Scenario Comparison",
    href: "/calculators/compare",
    body: "MLI Select vs. MLI Standard vs. conventional — equity required, debt service, cash flow, and total financing cost side by side.",
    icon: FileText,
  },
];

const gaps = [
  "Integrated MLI Select point scorer + loan sizer + premium calculator in one tool",
  "All CMHC programs covered (not just MLI Select)",
  "Accurate July 14, 2025 LTV-tiered premium grid",
  "Cash-flow projection tool with year-by-year amortization",
  "Affordability rent threshold lookup by CMA",
  "Maintained policy change tracker with analysis",
  "Provincial and municipal stacking guide",
];

const stats = [
  { value: "75%", label: "Growth in CMHC-insured multi-unit volume, 2021–2024" },
  { value: "$55B", label: "Apartment Construction Loan Program budget" },
  { value: "95%", label: "Maximum loan-to-cost under MLI Select (100 points)" },
  { value: "50yr", label: "Maximum amortization (MLI Select tier 3)" },
];

export default function Home() {
  return (
    <div className="bg-obsidian text-foreground">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-dark-gray">
        <div className="container grid border-l border-r border-dark-gray lg:grid-cols-[1.2fr_1fr]">
          <div className="border-b border-dark-gray px-6 py-16 lg:border-b-0 lg:border-r lg:px-12 lg:py-24">
            <Badge variant="outline" className="mb-6 border-star/40 text-star">
              Current to April 2026 · Incorporating July 14, 2025 premium overhaul
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight lg:text-6xl">
              The definitive guide to CMHC multi-family financing.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              CMHC is Canada's sole provider of mortgage loan insurance for
              multi-unit residential properties (5+ units). Its programs now
              underpin the majority of purpose-built rental financing in the
              country — and the July 14, 2025 premium overhaul fundamentally
              changed MLI Select economics. This site synthesizes every
              program, every underwriting rule, and every policy change into
              the calculators and content the market is missing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/calculators/point-scorer">
                <Button size="lg">
                  Score your MLI Select project
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </a>
              <a href="/programs/compare">
                <Button variant="outline" size="lg">
                  Compare all programs
                </Button>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-dark-gray">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={[
                  "border-dark-gray px-6 py-10 lg:px-8 lg:py-12",
                  i < 2 ? "border-b" : "",
                  i % 2 === 0 ? "border-r" : "",
                ].join(" ")}
              >
                <div className="text-3xl font-semibold text-star lg:text-4xl">
                  {s.value}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-16 lg:px-12 lg:py-24">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              All 6 pathways
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
              Every CMHC multi-unit program — in depth.
            </h2>
            <p className="mt-4 text-muted-foreground">
              90% of existing resources cover only MLI Select. This one
              documents every pathway — from the foundational MLI Standard
              insurance product to CMHC's direct lending under ACLP, AHF and
              CHDP — so you can choose the right structure for your project.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => (
              <a key={p.name} href={p.href} className="group">
                <Card className="h-full bg-jet border-dark-gray p-6 transition-colors hover:border-star/50">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-md bg-star/10">
                    <p.icon className="size-5 text-star" />
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {p.tagline}
                  </div>
                  <div className="mt-1 text-xl font-semibold">{p.name}</div>
                  <p className="mt-3 text-sm text-muted-foreground">{p.body}</p>
                  <div className="mt-5 flex items-center text-sm text-star group-hover:translate-x-0.5 transition-transform">
                    Explore {p.name}
                    <ArrowRight className="ml-1 size-4" />
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULATORS */}
      <section className="border-b border-dark-gray bg-jet">
        <div className="container border-l border-r border-dark-gray px-6 py-16 lg:px-12 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <Badge variant="secondary" className="mb-4">
                The market gap
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
                The integrated calculator suite CMHC doesn't publish.
              </h2>
              <p className="mt-4 text-muted-foreground">
                CMHC's own tools compute premiums in isolation and skip MLI
                Select entirely. No existing resource combines point scoring,
                triple-constrained loan sizing, accurate LTV-tiered premium
                calculation, and year-by-year cash-flow projection in one
                tool. Ours does.
              </p>
              <a href="/calculators" className="mt-6 inline-flex">
                <Button variant="outline">
                  See all calculators
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </a>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {calculators.map((c) => (
                <a key={c.name} href={c.href} className="group">
                  <Card className="h-full border-dark-gray bg-obsidian p-6 transition-colors hover:border-star/50">
                    <div className="mb-4 flex size-10 items-center justify-center rounded-md bg-star/10">
                      <c.icon className="size-5 text-star" />
                    </div>
                    <div className="text-lg font-semibold">{c.name}</div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {c.body}
                    </p>
                    <div className="mt-4 inline-flex items-center text-sm text-star">
                      Open tool
                      <ArrowRight className="ml-1 size-4" />
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CRITICAL POLICY ALERT */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-16 lg:px-12 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <Badge variant="outline" className="mb-4 border-star/40 text-star">
                Critical — July 14, 2025
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
                MLI Select premiums no longer flat.
              </h2>
              <p className="mt-4 text-muted-foreground">
                MLI Select now uses the same LTV-based premium grid as MLI
                Standard, with percentage discounts applied (10% / 20% / 30%
                by tier). Amortization surcharges (+0.25% per 5 years beyond
                25) now apply to MLI Select for the first time.
              </p>
              <p className="mt-4 text-muted-foreground">
                A 100-point project at 95% LTV with 50-year amortization now
                pays approximately <span className="text-foreground font-semibold">5.18%</span>{" "}
                versus the previous flat <span className="text-foreground font-semibold">2.55%</span>.
                Every pro forma written before July 2025 needs to be rerun.
              </p>
              <a href="/policy" className="mt-6 inline-flex">
                <Button>
                  See full policy timeline
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </a>
            </div>

            <Card className="border-dark-gray bg-jet p-8">
              <div className="mb-6 text-sm uppercase tracking-wide text-muted-foreground">
                What this resource covers
              </div>
              <ul className="space-y-3">
                {gaps.map((g) => (
                  <li key={g} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-star" />
                    <span className="text-sm">{g}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CONTEXT GRID */}
      <section className="border-b border-dark-gray bg-jet">
        <div className="container grid border-l border-r border-dark-gray lg:grid-cols-3">
          <div className="border-b border-dark-gray px-6 py-10 lg:border-b-0 lg:border-r lg:px-8 lg:py-12">
            <Database className="mb-4 size-6 text-star" />
            <div className="text-lg font-semibold">Underwriting that's actually written down</div>
            <p className="mt-3 text-sm text-muted-foreground">
              CMHC uses property-income DCR, not residential-style stress
              tests. Learn how NOI, vacancy, reserves and management fees
              flow into loan sizing — and why min DCR often caps the loan
              before LTV does.
            </p>
            <a href="/underwriting" className="mt-4 inline-flex text-sm text-star">
              Read the underwriting guide →
            </a>
          </div>

          <div className="border-b border-dark-gray px-6 py-10 lg:border-b-0 lg:border-r lg:px-8 lg:py-12">
            <MapPin className="mb-4 size-6 text-star" />
            <div className="text-lg font-semibold">Provincial + municipal stacking</div>
            <p className="mt-3 text-sm text-muted-foreground">
              Toronto's $97K/unit affordability incentive, Vancouver's DCL
              waivers, Calgary's new non-market tax exemption, Ottawa's
              $6–8K/unit TIEGs — how to stack them with MLI Select, AHF and
              CHDP.
            </p>
            <a href="/developers/municipal" className="mt-4 inline-flex text-sm text-star">
              See municipal playbook →
            </a>
          </div>

          <div className="px-6 py-10 lg:px-8 lg:py-12">
            <TrendingUp className="mb-4 size-6 text-star" />
            <div className="text-lg font-semibold">Lender landscape — who actually lends</div>
            <p className="mt-3 text-sm text-muted-foreground">
              Equitable Bank ($27.5B, +175% since 2021) leads — not the Big
              Six. MCAP, Peakhill, First National, Peoples Trust, CMLS and
              the life cos all compete on speed, term, and prepayment — not
              rate.
            </p>
            <a href="/lenders" className="mt-4 inline-flex text-sm text-star">
              Explore the lender map →
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-20 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight lg:text-5xl">
              Model your project in minutes.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
              Score your MLI Select points, size the loan against all three
              constraints, and compute the post-July 2025 premium — then
              compare the structure against conventional financing to see
              exactly what CMHC buys you.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="/calculators/point-scorer">
                <Button size="lg">
                  Start with the point scorer
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </a>
              <a href="/calculators/loan-sizer">
                <Button variant="outline" size="lg">
                  Jump to the loan sizer
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
