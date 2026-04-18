import {
  ArrowRight,
  BookOpen,
  Building2,
  Calculator,
  CheckSquare,
  ChevronRight,
  Clock,
  Database,
  FileText,
  Gauge,
  HelpCircle,
  Landmark,
  Layers,
  LineChart,
  MapPin,
  Scale,
  Scroll,
  Shuffle,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

import ThemeToggle from "../ui/theme-toggle";

interface NavbarProps {
  currentPath?: string;
}

type MegaItem = {
  title: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

type MegaSection = {
  heading: string;
  items: MegaItem[];
};

type MegaFeature = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: React.ComponentType<{ className?: string }>;
};

type TopItem = {
  label: string;
  href: string;
  sections?: MegaSection[];
  feature?: MegaFeature;
  width?: string;
};

export default function Navbar({ currentPath }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [pathname, setPathname] = useState(currentPath ?? "/");

  useEffect(() => {
    if (!currentPath) setPathname(window.location.pathname);
  }, [currentPath]);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isMenuOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [isMenuOpen]);

  const ITEMS: TopItem[] = [
    {
      label: "Programs",
      href: "/programs",
      width: "w-[920px]",
      sections: [
        {
          heading: "Insurance products",
          items: [
            {
              title: "MLI Select",
              href: "/programs/mli-select",
              description:
                "Points-based flagship — 95% LTC, 50yr amort, up to 30% premium discount.",
              icon: TrendingUp,
            },
            {
              title: "MLI Standard",
              href: "/programs/mli-standard",
              description: "Foundational 5+ unit product for market rental — 85% LTV.",
              icon: Building2,
            },
            {
              title: "Specialized",
              href: "/programs/specialized",
              description:
                "Retirement, student, SRO, supportive — Other Shelter Models grid.",
              icon: Layers,
            },
            {
              title: "MULTI-GO platform",
              href: "/programs/multi-go",
              description: "CMHC's digital portal — submission, underwriting, CoI.",
              icon: FileText,
            },
          ],
        },
        {
          heading: "MLI Select deep dive",
          items: [
            {
              title: "Affordability scoring",
              href: "/programs/mli-select/affordability",
              description:
                "10/15/25% new or 40/60/80% existing — points + 20yr bonus.",
              icon: Scale,
            },
            {
              title: "Energy scoring",
              href: "/programs/mli-select/energy",
              description: "NECB / NBC 2020 paths, L1/L2/L3 pathways.",
              icon: Gauge,
            },
            {
              title: "Accessibility scoring",
              href: "/programs/mli-select/accessibility",
              description: "CSA B651:23 vs RHFAC v4.0 — Level 1/2 mechanics.",
              icon: CheckSquare,
            },
            {
              title: "Commitment mechanics",
              href: "/programs/mli-select/commitment",
              description:
                "Legal instruments, monitoring, enforcement, transitions.",
              icon: FileText,
            },
            {
              title: "Rental achievement",
              href: "/programs/rental-achievement",
              description:
                "Holdback mechanics, July 3, 2025 changes, worked scenarios.",
              icon: Target,
            },
          ],
        },
        {
          heading: "Direct lending + process",
          items: [
            {
              title: "ACLP",
              href: "/programs/aclp",
              description: "Apartment Construction Loan Program — CMHC direct.",
              icon: Landmark,
            },
            {
              title: "AHF",
              href: "/programs/ahf",
              description: "Affordable Housing Fund — forgivable + low-interest.",
              icon: Scale,
            },
            {
              title: "CHDP",
              href: "/programs/chdp",
              description: "Co-operative Housing Development — $1.5B for co-ops.",
              icon: Layers,
            },
            {
              title: "Amortization options",
              href: "/programs/amortization-options",
              description: "25/30/40/45/50yr trade-offs, July 2025 surcharge grid.",
              icon: Clock,
            },
            {
              title: "Construction paths",
              href: "/programs/construction-paths",
              description: "ACLP direct vs MLI Select + construction insurance.",
              icon: Building2,
            },
            {
              title: "Application process",
              href: "/programs/application-process",
              description: "Submission, fees, CoI workflow, timelines.",
              icon: FileText,
            },
            {
              title: "Compare all programs",
              href: "/programs/compare",
              description: "Side-by-side across every CMHC multi-unit pathway.",
              icon: Shuffle,
            },
          ],
        },
      ],
    },
    {
      label: "Calculators",
      href: "/calculators",
      width: "w-[1120px]",
      feature: {
        eyebrow: "Most used",
        title: "MLI Select Point Scorer",
        description:
          "Score affordability, energy, and accessibility. See your tier instantly.",
        href: "/calculators/point-scorer",
        cta: "Start scoring",
        icon: Sparkles,
      },
      sections: [
        {
          heading: "Loan sizing",
          items: [
            {
              title: "Loan Sizer",
              href: "/calculators/loan-sizer",
              description: "Triple-constrained (LTV, DCR, program cap) max-loan.",
              icon: LineChart,
            },
            {
              title: "DSCR Inverse",
              href: "/calculators/dscr-inverse",
              description: "Required NOI at DCR 1.10 / 1.20 / 1.30.",
              icon: Calculator,
            },
            {
              title: "NOI / Cap Rate",
              href: "/calculators/noi-cap-rate",
              description: "Build NOI, compute cap rate, or solve implied value.",
              icon: LineChart,
            },
            {
              title: "Amort Schedule",
              href: "/calculators/amortization-schedule",
              description: "Yearly/monthly P vs I split, CSV export.",
              icon: Calculator,
            },
            {
              title: "Break-Even Occupancy",
              href: "/calculators/break-even-occupancy",
              description: "Occupancy % to cover debt service and opex.",
              icon: Target,
            },
            {
              title: "Cash-on-Cash",
              href: "/calculators/cash-on-cash",
              description: "Leveraged yield + equity multiple at 5/10/20yr.",
              icon: TrendingUp,
            },
          ],
        },
        {
          heading: "Premium",
          items: [
            {
              title: "Premium Calculator",
              href: "/calculators/premium",
              description: "July 14, 2025 LTV-tiered grid with surcharges.",
              icon: Calculator,
            },
            {
              title: "Premium Credit",
              href: "/calculators/premium-credit",
              description: "Refinance credit — 75% declining to 20% by yr 7.",
              icon: Calculator,
            },
            {
              title: "Equity Take-Out",
              href: "/calculators/equity-takeout",
              description: "Max new loan, premium credit, net cash after payoff.",
              icon: Calculator,
            },
            {
              title: "PST on Premium",
              href: "/calculators/pst-premium",
              description: "Provincial PST on CMHC premium, by province.",
              icon: MapPin,
            },
          ],
        },
        {
          heading: "MLI Select & scenarios",
          items: [
            {
              title: "Point Scorer",
              href: "/calculators/point-scorer",
              description: "Affordability + energy + accessibility scoring.",
              icon: Sparkles,
            },
            {
              title: "Point Optimizer",
              href: "/calculators/point-optimizer",
              description: "All scoring combinations ranked by ease and cost.",
              icon: Target,
            },
            {
              title: "Affordability Sizer",
              href: "/calculators/affordability-sizer",
              description: "Required units + rent concession to hit a tier.",
              icon: MapPin,
            },
            {
              title: "Rent vs Market Gap",
              href: "/calculators/rent-gap",
              description: "Unit-mix current vs market with qualification test.",
              icon: LineChart,
            },
            {
              title: "Stress Test",
              href: "/calculators/stress-test",
              description: "Rate-shock scenarios — DCR and cash-flow impact.",
              icon: TrendingUp,
            },
            {
              title: "Cash Flow",
              href: "/calculators/cash-flow",
              description: "Year-by-year NOI, debt service, DCR, CoC.",
              icon: LineChart,
            },
            {
              title: "Renewal Analyzer",
              href: "/calculators/renewal-analyzer",
              description: "Balance at maturity + debt service under scenarios.",
              icon: Clock,
            },
            {
              title: "Construction Draws",
              href: "/calculators/construction-draws",
              description: "Advance schedule, interest reserve, takeout sizing.",
              icon: Building2,
            },
            {
              title: "Conventional vs CMHC",
              href: "/calculators/conventional-vs-cmhc",
              description: "Insured vs uninsured leverage and yield.",
              icon: Shuffle,
            },
            {
              title: "Purchase vs Refi",
              href: "/calculators/purchase-vs-refi",
              description: "Max loan, premium, cash-out vs equity-in.",
              icon: Shuffle,
            },
            {
              title: "Grant Stacking",
              href: "/calculators/grant-stacking",
              description: "ACLP + AHF + municipal residual-equity math.",
              icon: Layers,
            },
            {
              title: "Compare Scenarios",
              href: "/calculators/compare",
              description: "MLI Select vs Standard vs conventional, one deal.",
              icon: FileText,
            },
          ],
        },
      ],
    },
    {
      label: "Underwriting",
      href: "/underwriting",
      width: "w-[920px]",
      sections: [
        {
          heading: "Sizing & income",
          items: [
            {
              title: "DCR & loan sizing",
              href: "/underwriting/dcr",
              description: "Property-income based; no residential stress test.",
              icon: LineChart,
            },
            {
              title: "LTV & value",
              href: "/underwriting/ltv",
              description: "LTC for new construction; lending value for existing.",
              icon: Scale,
            },
            {
              title: "NOI methodology",
              href: "/underwriting/noi-methodology",
              description: "GPR → EGI → opex → NOI, line-by-line treatment.",
              icon: LineChart,
            },
            {
              title: "Vacancy standards",
              href: "/underwriting/vacancy",
              description: "RMS source, 3% structural floor, bad-debt.",
              icon: Database,
            },
            {
              title: "Rental Market Survey",
              href: "/underwriting/rental-market-survey",
              description: "CMHC RMS for pre-app market and underwriting.",
              icon: Database,
            },
          ],
        },
        {
          heading: "Opex & reserves",
          items: [
            {
              title: "Opex benchmarks",
              href: "/underwriting/opex",
              description: "Key benchmarks used in practice.",
              icon: Database,
            },
            {
              title: "Opex categories",
              href: "/underwriting/opex-categories",
              description: "$/unit and % EGI ranges for every opex line.",
              icon: Database,
            },
            {
              title: "Cash reserves",
              href: "/underwriting/cash-reserves",
              description: "Liquidity, replacement, operating, holdback.",
              icon: Database,
            },
            {
              title: "Seasoning & lease-up",
              href: "/underwriting/seasoning",
              description: "Pro forma vs T-12, rental achievement, takeout.",
              icon: Clock,
            },
          ],
        },
        {
          heading: "Standards & docs",
          items: [
            {
              title: "Appraisal",
              href: "/underwriting/appraisal",
              description: "Income vs comparison, lending value, Nov 2024.",
              icon: FileText,
            },
            {
              title: "Environmental",
              href: "/underwriting/environmental",
              description: "Phase I/II ESA, building codes, seismic.",
              icon: Scale,
            },
            {
              title: "Affordability thresholds",
              href: "/underwriting/affordability",
              description: "30% of median renter income, by CMA.",
              icon: MapPin,
            },
            {
              title: "Affordability methodology",
              href: "/underwriting/affordability-methodology",
              description: "How CMHC derives + verifies MFI-based ceilings.",
              icon: MapPin,
            },
            {
              title: "Common conditions",
              href: "/underwriting/common-conditions",
              description: "What CMHC asks for at conditional approval.",
              icon: CheckSquare,
            },
            {
              title: "Required documentation",
              href: "/underwriting/documentation",
              description: "ESA, geotech, appraisal, QS, surety, covenant.",
              icon: FileText,
            },
          ],
        },
      ],
    },
    {
      label: "Tools",
      href: "/tools",
      width: "w-[720px]",
      sections: [
        {
          heading: "Plan the deal",
          items: [
            {
              title: "Eligibility pre-qualifier",
              href: "/tools/eligibility-tree",
              description: "8-step wizard with ranked program recommendations.",
              icon: CheckSquare,
            },
            {
              title: "Program matcher",
              href: "/tools/program-matcher",
              description: "Priority sliders → weighted fit across programs.",
              icon: Shuffle,
            },
            {
              title: "Timeline tracker",
              href: "/tools/timeline-tracker",
              description: "Forecast funding date or back-schedule from target.",
              icon: Clock,
            },
            {
              title: "Document checklist",
              href: "/tools/doc-checklist",
              description: "Filter by project × program; track progress.",
              icon: CheckSquare,
            },
            {
              title: "Fee schedule",
              href: "/tools/fee-schedule",
              description: "Appraisal, legal, lender, CMHC fees with ranges.",
              icon: FileText,
            },
          ],
        },
        {
          heading: "Execute & track",
          items: [
            {
              title: "Lender comparison matrix",
              href: "/tools/lender-matrix",
              description: "Filter + sort approved CMHC multi-unit lenders.",
              icon: Landmark,
            },
            {
              title: "MLI Select vs Standard",
              href: "/tools/mli-comparison",
              description: "16-row feature matrix + when-to-choose panels.",
              icon: Shuffle,
            },
            {
              title: "CoI / rate-lock expiry",
              href: "/tools/coi-expiry",
              description: "Countdown with Sep 3, 2025 CoI transfer callout.",
              icon: Clock,
            },
            {
              title: "Rental achievement tracker",
              href: "/tools/rental-achievement",
              description: "Lease-up projection + holdback release timing.",
              icon: TrendingUp,
            },
          ],
        },
      ],
    },
    {
      label: "Lenders",
      href: "/lenders",
    },
    {
      label: "Developers",
      href: "/developers",
      width: "w-[560px]",
      sections: [
        {
          heading: "Build economics",
          items: [
            {
              title: "Construction pathways",
              href: "/developers/construction",
              description: "Construction-to-term vs. completion takeout.",
              icon: Building2,
            },
            {
              title: "Developer economics",
              href: "/developers/economics",
              description: "How 95% LTC + 50yr amort transforms returns.",
              icon: TrendingUp,
            },
          ],
        },
        {
          heading: "Jurisdiction",
          items: [
            {
              title: "Municipal stacking",
              href: "/developers/municipal",
              description: "Toronto, Vancouver, Calgary, Edmonton, Ottawa, Montreal.",
              icon: MapPin,
            },
            {
              title: "Provincial rules",
              href: "/developers/provincial",
              description: "ON, BC, AB, QC — new-construction exemptions.",
              icon: Scale,
            },
          ],
        },
      ],
    },
    {
      label: "Resources",
      href: "/glossary",
      width: "w-[820px]",
      sections: [
        {
          heading: "Reference",
          items: [
            {
              title: "FAQ",
              href: "/faq",
              description: "43 questions across programs, underwriting, process.",
              icon: HelpCircle,
            },
            {
              title: "Glossary",
              href: "/glossary",
              description: "70 CMHC multi-unit terms, searchable.",
              icon: BookOpen,
            },
            {
              title: "Application timeline",
              href: "/timeline",
              description: "Pre-app through funding — week-by-week.",
              icon: Clock,
            },
            {
              title: "Policy timeline",
              href: "/policy",
              description: "2024–2026 major CMHC multi-unit policy changes.",
              icon: Scroll,
            },
          ],
        },
        {
          heading: "Coverage",
          items: [
            {
              title: "Provinces",
              href: "/provinces",
              description: "ON, BC, AB, QC — rent control, exemptions.",
              icon: MapPin,
            },
            {
              title: "Lifecycle",
              href: "/lifecycle",
              description: "Renewal, assumption, prepayment, porting.",
              icon: Shuffle,
            },
            {
              title: "Eligibility",
              href: "/eligibility",
              description: "Borrower, property, and lender eligibility rules.",
              icon: CheckSquare,
            },
            {
              title: "Data sources",
              href: "/data",
              description: "RMS, HMIP, StatCan, cmhc R package, open data.",
              icon: Database,
            },
          ],
        },
      ],
    },
  ];

  const bgColor = "bg-obsidian";

  return (
    <header
      className={cn(
        "relative z-50 h-20 border-b border-b-dark-gray px-2.5 lg:px-0",
        bgColor,
      )}
    >
      <div className="container flex h-20 items-center border-l border-r border-l-dark-gray border-r-dark-gray">
        <div className="flex w-full items-center justify-between py-3">
          <a href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-white/10">
                <Building2 className="size-5 text-white" />
              </div>
              <span className="font-semibold tracking-tight text-foreground">
                CMHC Multi-Family
              </span>
            </div>
          </a>

          <div className="flex items-center justify-center">
            <NavigationMenu className="mr-4 hidden items-center gap-8 lg:flex">
              <NavigationMenuList>
                {ITEMS.map((link) =>
                  link.sections ? (
                    <NavigationMenuItem key={link.label} className="text-sm">
                      <NavigationMenuTrigger
                        className={cn(
                          "text-foreground bg-transparent text-sm font-normal",
                          "hover:bg-transparent focus:bg-transparent active:bg-transparent",
                          "hover:text-muted-foreground focus:text-muted-foreground",
                          "data-[state=open]:bg-transparent data-[state=open]:text-muted-foreground",
                          "transition-none",
                        )}
                      >
                        {link.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-obsidian rounded-md">
                        <MegaPanel
                          label={link.label}
                          href={link.href}
                          sections={link.sections}
                          feature={link.feature}
                          width={link.width ?? "w-[720px]"}
                        />
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={link.label}>
                      <a
                        href={link.href}
                        className={cn(
                          "text-foreground p-2 text-sm hover:text-muted-foreground",
                          pathname === link.href && "text-muted-foreground",
                        )}
                      >
                        {link.label}
                      </a>
                    </NavigationMenuItem>
                  ),
                )}
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center gap-2.5">
              <a
                href="/calculators/point-scorer"
                className={`transition-opacity duration-300 ${isMenuOpen ? "max-lg:pointer-events-none max-lg:opacity-0" : "opacity-100"}`}
              >
                <Button size="sm">Run the scorer</Button>
              </a>

              <div
                className={`transition-opacity duration-300 ${isMenuOpen ? "max-lg:pointer-events-none max-lg:opacity-0" : "opacity-100"}`}
              >
                <ThemeToggle />
              </div>

              <button
                className="relative flex size-8 text-muted-foreground lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                <div className="absolute left-1/2 top-1/2 block w-[18px] -translate-x-1/2 -translate-y-1/2">
                  <span
                    aria-hidden="true"
                    className={`absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "rotate-45" : "-translate-y-1.5"}`}
                  />
                  <span
                    aria-hidden="true"
                    className={`absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "opacity-0" : ""}`}
                  />
                  <span
                    aria-hidden="true"
                    className={`absolute block h-0.5 w-full rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "-rotate-45" : "translate-y-1.5"}`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "container absolute inset-x-0 top-full flex h-[calc(100vh-80px)] flex-col border-t border-t-dark-gray px-2.5 lg:px-0",
          "transition duration-300 ease-in-out lg:hidden",
          isMenuOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0",
          bgColor,
        )}
      >
        <div className="h-[calc(100vh-80px)] overflow-y-auto border-x border-dark-gray px-5">
          <nav className="mt-6 flex flex-1 flex-col gap-6 pb-10">
            {ITEMS.map((link) =>
              link.sections ? (
                <div key={link.label}>
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === link.label ? null : link.label,
                      )
                    }
                    className="text-foreground flex w-full items-center justify-between text-lg tracking-[-0.36px]"
                    aria-label={`${link.label} menu`}
                    aria-expanded={openDropdown === link.label}
                  >
                    {link.label}
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openDropdown === link.label && "rotate-90",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    className={cn(
                      "ml-1 space-y-5 overflow-hidden border-b border-b-dark-gray transition-all",
                      openDropdown === link.label
                        ? "mt-3 max-h-[3000px] pb-6 opacity-100"
                        : "max-h-0 opacity-0",
                    )}
                  >
                    {link.sections.map((section) => (
                      <div key={section.heading}>
                        <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-star/80">
                          {section.heading}
                        </div>
                        <div className="mt-2 space-y-1">
                          {section.items.map((item) => (
                            <a
                              key={item.title}
                              href={item.href}
                              onClick={() => {
                                setIsMenuOpen(false);
                                setOpenDropdown(null);
                              }}
                              className="flex items-start gap-3 rounded-md p-2 hover:bg-accent"
                            >
                              <item.icon className="text-mid-gray mt-0.5 size-5 shrink-0" />
                              <div>
                                <div className="text-foreground font-medium leading-tight">
                                  {item.title}
                                </div>
                                <p className="text-sm text-muted-foreground leading-snug">
                                  {item.description}
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "text-foreground text-lg tracking-[-0.36px]",
                    pathname === link.href && "text-muted-foreground",
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ),
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

function MegaPanel({
  label,
  href,
  sections,
  feature,
  width,
}: {
  label: string;
  href: string;
  sections: MegaSection[];
  feature?: MegaFeature;
  width: string;
}) {
  const cols = sections.length;
  const gridCols =
    cols === 2
      ? "md:grid-cols-2"
      : cols === 3
        ? "md:grid-cols-3"
        : cols === 4
          ? "md:grid-cols-4"
          : "md:grid-cols-2";

  return (
    <div className={cn("flex", width)}>
      <div
        className={cn(
          "flex-1 bg-obsidian px-6 py-6",
          feature ? "rounded-l-md" : "rounded-md",
        )}
      >
        <div className={cn("grid gap-6", gridCols)}>
          {sections.map((section) => (
            <div key={section.heading}>
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-star/80">
                {section.heading}
              </div>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.title}>
                    <NavigationMenuLink asChild>
                      <a
                        href={item.href}
                        className="group relative block rounded-md p-2.5 pl-3 transition-colors hover:bg-dark-gray/60"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-2.5 bottom-2.5 w-px bg-dark-gray transition-colors group-hover:bg-star"
                        />
                        <div className="flex items-start gap-2.5">
                          <item.icon className="mt-0.5 size-4 shrink-0 text-mid-gray transition-colors group-hover:text-star" />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-foreground">
                              {item.title}
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-mid-gray">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </a>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-dark-gray pt-4">
          <span className="text-xs text-mid-gray">
            Every {label.toLowerCase()} page —
          </span>
          <NavigationMenuLink asChild>
            <a
              href={href}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-star transition-opacity hover:opacity-80"
            >
              View {label} hub
              <ArrowRight className="size-3.5" />
            </a>
          </NavigationMenuLink>
        </div>
      </div>

      {feature && (
        <div className="relative w-[280px] shrink-0 overflow-hidden rounded-r-md border-l border-dark-gray bg-gradient-to-br from-jet via-obsidian to-obsidian p-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-star/15 blur-3xl"
          />
          <div className="relative">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-star">
              {feature.eyebrow}
            </div>
            <div className="mt-3 flex size-10 items-center justify-center rounded-md bg-star/15 text-star">
              <feature.icon className="size-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold leading-tight text-foreground">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-snug text-muted-foreground">
              {feature.description}
            </p>
            <NavigationMenuLink asChild>
              <a
                href={feature.href}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-star"
              >
                {feature.cta}
                <ArrowRight className="size-4" />
              </a>
            </NavigationMenuLink>
          </div>
        </div>
      )}
    </div>
  );
}

export { Navbar };
