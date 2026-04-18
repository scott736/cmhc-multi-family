import {
  BookOpen,
  Building2,
  Calculator,
  CheckSquare,
  ChevronRight,
  Clock,
  Database,
  FileText,
  HelpCircle,
  Landmark,
  Layers,
  LineChart,
  MapPin,
  Scale,
  Scroll,
  Shuffle,
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

  const ITEMS = [
    {
      label: "Programs",
      href: "/programs",
      dropdownItems: [
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
          description:
            "Foundational 5+ unit product for market rental — 85% LTV.",
          icon: Building2,
        },
        {
          title: "ACLP",
          href: "/programs/aclp",
          description:
            "Apartment Construction Loan Program — CMHC direct lending, below-market.",
          icon: Landmark,
        },
        {
          title: "AHF",
          href: "/programs/ahf",
          description:
            "Affordable Housing Fund — forgivable + low-interest $14.6B program.",
          icon: Scale,
        },
        {
          title: "CHDP",
          href: "/programs/chdp",
          description:
            "Co-operative Housing Development Program — $1.5B for co-ops.",
          icon: Layers,
        },
        {
          title: "Specialized",
          href: "/programs/specialized",
          description:
            "Retirement, student, SRO, supportive — Other Shelter Models premium grid.",
          icon: Building2,
        },
        {
          title: "Select · Affordability scoring",
          href: "/programs/mli-select/affordability",
          description:
            "How 10/15/25% new or 40/60/80% existing maps to points + 20yr bonus.",
          icon: Scale,
        },
        {
          title: "Select · Energy scoring",
          href: "/programs/mli-select/energy",
          description:
            "NECB / NBC 2020 paths, construction premiums, L1/L2/L3 pathways.",
          icon: TrendingUp,
        },
        {
          title: "Select · Accessibility scoring",
          href: "/programs/mli-select/accessibility",
          description:
            "CSA B651:23 vs RHFAC v4.0 — Level 1/2 scoring mechanics.",
          icon: CheckSquare,
        },
        {
          title: "Select · Commitment mechanics",
          href: "/programs/mli-select/commitment",
          description:
            "Legal instruments, monitoring, enforcement, transition periods.",
          icon: FileText,
        },
        {
          title: "Amortization options",
          href: "/programs/amortization-options",
          description:
            "25/30/40/45/50yr trade-offs and surcharge grid since July 2025.",
          icon: Clock,
        },
        {
          title: "Construction paths",
          href: "/programs/construction-paths",
          description:
            "ACLP direct vs MLI Select + construction insurance decision framework.",
          icon: Building2,
        },
        {
          title: "Rental achievement",
          href: "/programs/rental-achievement",
          description:
            "Holdback mechanics, July 3 2025 Market Rental removal, worked scenarios.",
          icon: CheckSquare,
        },
        {
          title: "MULTI-GO platform",
          href: "/programs/multi-go",
          description:
            "CMHC's digital portal — submission, underwriting, CoI issuance.",
          icon: FileText,
        },
        {
          title: "Application process",
          href: "/programs/application-process",
          description:
            "Submission, fees, COI workflow, processing timelines.",
          icon: FileText,
        },
        {
          title: "Compare all programs",
          href: "/programs/compare",
          description: "Side-by-side across all CMHC multi-unit pathways.",
          icon: FileText,
        },
      ],
    },
    {
      label: "Calculators",
      href: "/calculators",
      dropdownItems: [
        {
          title: "MLI Select Point Scorer",
          href: "/calculators/point-scorer",
          description:
            "Score affordability, energy and accessibility — see your tier instantly.",
          icon: Calculator,
        },
        {
          title: "Loan Sizer",
          href: "/calculators/loan-sizer",
          description:
            "Triple-constrained (LTV, DCR, program cap) max-loan calculator.",
          icon: LineChart,
        },
        {
          title: "DSCR Inverse (required NOI)",
          href: "/calculators/dscr-inverse",
          description:
            "Given a target loan, what NOI is needed at DCR 1.10/1.20/1.30?",
          icon: Calculator,
        },
        {
          title: "NOI / Cap Rate",
          href: "/calculators/noi-cap-rate",
          description:
            "Build NOI, compute cap rate, or solve for implied value.",
          icon: LineChart,
        },
        {
          title: "Amortization Schedule",
          href: "/calculators/amortization-schedule",
          description:
            "Yearly/monthly P vs I split with CSV download.",
          icon: Calculator,
        },
        {
          title: "Stress Test",
          href: "/calculators/stress-test",
          description:
            "Rate-shock scenarios — DCR and cash flow impact at renewal.",
          icon: TrendingUp,
        },
        {
          title: "Break-Even Occupancy",
          href: "/calculators/break-even-occupancy",
          description:
            "What occupancy % covers debt service and opex?",
          icon: Calculator,
        },
        {
          title: "Cash Flow Projection",
          href: "/calculators/cash-flow",
          description:
            "Year-by-year NOI, debt service, DCR, cash-on-cash.",
          icon: LineChart,
        },
        {
          title: "Premium Calculator",
          href: "/calculators/premium",
          description:
            "July 14, 2025 LTV-tiered premiums with every surcharge.",
          icon: Calculator,
        },
        {
          title: "Premium Credit (refinance)",
          href: "/calculators/premium-credit",
          description:
            "Refinance credit — 75% declining to 20% by year 7.",
          icon: Calculator,
        },
        {
          title: "Equity Take-Out",
          href: "/calculators/equity-takeout",
          description:
            "Refinance cash-out — max new loan, premium credit, net cash.",
          icon: Calculator,
        },
        {
          title: "PST on Premium",
          href: "/calculators/pst-premium",
          description:
            "Upfront provincial sales tax on CMHC premium by province.",
          icon: Calculator,
        },
        {
          title: "Renewal Analyzer",
          href: "/calculators/renewal-analyzer",
          description:
            "Balance at maturity + debt service under rate scenarios.",
          icon: Clock,
        },
        {
          title: "Construction Draws",
          href: "/calculators/construction-draws",
          description:
            "Advance schedule, interest reserve, takeout loan sizing.",
          icon: Building2,
        },
        {
          title: "Conventional vs CMHC",
          href: "/calculators/conventional-vs-cmhc",
          description:
            "Side-by-side: insured vs uninsured on leverage and yield.",
          icon: Shuffle,
        },
        {
          title: "Purchase vs Refinance",
          href: "/calculators/purchase-vs-refi",
          description:
            "Max loan, premium, cash-out vs equity-in for each path.",
          icon: Shuffle,
        },
        {
          title: "Point Optimizer (MLI Select)",
          href: "/calculators/point-optimizer",
          description:
            "All scoring combinations ranked by ease and cost.",
          icon: Calculator,
        },
        {
          title: "Affordability Unit Sizer",
          href: "/calculators/affordability-sizer",
          description:
            "Required units, rent concession, NOI impact to hit a tier.",
          icon: MapPin,
        },
        {
          title: "Rent vs Market Gap",
          href: "/calculators/rent-gap",
          description:
            "Unit-mix current vs market rents with MLI Select qualification test.",
          icon: LineChart,
        },
        {
          title: "Grant / Program Stacking",
          href: "/calculators/grant-stacking",
          description:
            "ACLP + AHF + municipal incentive residual-equity math.",
          icon: Layers,
        },
        {
          title: "Cash-on-Cash Return",
          href: "/calculators/cash-on-cash",
          description:
            "Leveraged yield and equity multiple at 5/10/20yr hold.",
          icon: LineChart,
        },
        {
          title: "Scenario Comparison",
          href: "/calculators/compare",
          description:
            "MLI Select vs MLI Standard vs conventional on one deal.",
          icon: FileText,
        },
      ],
    },
    {
      label: "Underwriting",
      href: "/underwriting",
      dropdownItems: [
        {
          title: "DCR & loan sizing",
          href: "/underwriting/dcr",
          description:
            "Property-income based; no residential stress test.",
          icon: LineChart,
        },
        {
          title: "LTV & value",
          href: "/underwriting/ltv",
          description:
            "Loan-to-cost for new construction; lending value for existing.",
          icon: Scale,
        },
        {
          title: "Appraisal standards",
          href: "/underwriting/appraisal",
          description:
            "Income vs comparison approach; lending value; Nov 2024 mandatory.",
          icon: FileText,
        },
        {
          title: "NOI methodology",
          href: "/underwriting/noi-methodology",
          description:
            "GPR → EGI → opex → NOI, line-by-line CMHC treatment.",
          icon: LineChart,
        },
        {
          title: "Vacancy standards",
          href: "/underwriting/vacancy",
          description:
            "RMS source, 3% structural floor, bad-debt allowance.",
          icon: Database,
        },
        {
          title: "Opex benchmarks",
          href: "/underwriting/opex",
          description:
            "Vacancy, reserves, management — key benchmarks used in practice.",
          icon: Database,
        },
        {
          title: "Opex categories",
          href: "/underwriting/opex-categories",
          description:
            "$/unit and % EGI ranges for every opex line.",
          icon: Database,
        },
        {
          title: "Affordability thresholds",
          href: "/underwriting/affordability",
          description:
            "30% of median renter income — by CMA.",
          icon: MapPin,
        },
        {
          title: "Affordability methodology",
          href: "/underwriting/affordability-methodology",
          description:
            "How CMHC derives and verifies the MFI-based rent ceilings.",
          icon: MapPin,
        },
        {
          title: "Cash reserves",
          href: "/underwriting/cash-reserves",
          description:
            "Liquidity, replacement, operating, interest, holdback reserves.",
          icon: Database,
        },
        {
          title: "Environmental standards",
          href: "/underwriting/environmental",
          description:
            "Phase I/II ESA, building codes, seismic, accessibility overlay.",
          icon: Scale,
        },
        {
          title: "Seasoning & lease-up",
          href: "/underwriting/seasoning",
          description:
            "Pro forma vs trailing 12, rental achievement, takeout sizing.",
          icon: Clock,
        },
        {
          title: "Rental Market Survey",
          href: "/underwriting/rental-market-survey",
          description:
            "CMHC RMS for pre-app market analysis and underwriting.",
          icon: Database,
        },
        {
          title: "Common conditions",
          href: "/underwriting/common-conditions",
          description:
            "What CMHC typically asks for in conditional approval.",
          icon: CheckSquare,
        },
        {
          title: "Required documentation",
          href: "/underwriting/documentation",
          description:
            "Phase I ESA, geotech, appraisal, QS, surety bonding, covenant.",
          icon: FileText,
        },
      ],
    },
    {
      label: "Tools",
      href: "/tools",
      dropdownItems: [
        {
          title: "Eligibility pre-qualifier",
          href: "/tools/eligibility-tree",
          description:
            "8-step decision wizard with ranked program recommendations.",
          icon: CheckSquare,
        },
        {
          title: "Program suitability matcher",
          href: "/tools/program-matcher",
          description:
            "Priority sliders → weighted fit across all five programs.",
          icon: Shuffle,
        },
        {
          title: "Application timeline tracker",
          href: "/tools/timeline-tracker",
          description:
            "Forecast funding date or back-schedule from a target.",
          icon: Clock,
        },
        {
          title: "Document checklist",
          href: "/tools/doc-checklist",
          description:
            "Filter by project type × program; track progress.",
          icon: CheckSquare,
        },
        {
          title: "CoI / rate-lock expiry",
          href: "/tools/coi-expiry",
          description:
            "Countdown with Sep 3 2025 CoI transfer callout.",
          icon: Clock,
        },
        {
          title: "Rental achievement tracker",
          href: "/tools/rental-achievement",
          description:
            "Lease-up projection and holdback-release timing.",
          icon: TrendingUp,
        },
        {
          title: "Lender comparison matrix",
          href: "/tools/lender-matrix",
          description:
            "Filter + sort approved CMHC multi-unit lenders.",
          icon: Landmark,
        },
        {
          title: "MLI Select vs Standard",
          href: "/tools/mli-comparison",
          description:
            "16-row feature matrix + when-to-choose panels.",
          icon: Shuffle,
        },
        {
          title: "Fee schedule reference",
          href: "/tools/fee-schedule",
          description:
            "Appraisal, legal, lender, CMHC fees with typical ranges.",
          icon: FileText,
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
      dropdownItems: [
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
        {
          title: "Municipal stacking",
          href: "/developers/municipal",
          description:
            "Toronto, Vancouver, Calgary, Edmonton, Ottawa, Montreal.",
          icon: MapPin,
        },
        {
          title: "Provincial rent rules",
          href: "/developers/provincial",
          description: "ON, BC, AB, QC — new-construction exemptions.",
          icon: Scale,
        },
      ],
    },
    {
      label: "Resources",
      href: "/glossary",
      dropdownItems: [
        {
          title: "FAQ",
          href: "/faq",
          description:
            "43 common questions across programs, underwriting, and process.",
          icon: HelpCircle,
        },
        {
          title: "Glossary",
          href: "/glossary",
          description:
            "70 CMHC multi-unit terms — searchable and categorized.",
          icon: BookOpen,
        },
        {
          title: "Application timeline",
          href: "/timeline",
          description:
            "Pre-app through funding — week-by-week process map.",
          icon: Clock,
        },
        {
          title: "Provinces",
          href: "/provinces",
          description:
            "ON, BC, AB, QC — rent control, exemptions, provincial overlays.",
          icon: MapPin,
        },
        {
          title: "Lifecycle",
          href: "/lifecycle",
          description:
            "Renewal, assumption, prepayment, porting.",
          icon: Shuffle,
        },
        {
          title: "Eligibility",
          href: "/eligibility",
          description:
            "Borrower, property, and lender eligibility rules.",
          icon: CheckSquare,
        },
        {
          title: "Policy timeline",
          href: "/policy",
          description:
            "2024-2026 major CMHC multi-unit policy changes.",
          icon: Scroll,
        },
        {
          title: "Data sources",
          href: "/data",
          description:
            "RMS, HMIP, StatCan, cmhc R package, open data.",
          icon: Database,
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
                  link.dropdownItems ? (
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
                      <NavigationMenuContent className="rounded-md bg-obsidian">
                        <ul className="w-[460px] bg-obsidian p-3">
                          {link.dropdownItems.map((item) => (
                            <li key={item.title}>
                              <NavigationMenuLink asChild>
                                <a
                                  href={item.href}
                                  className="outline-hidden flex items-start rounded-md p-3 leading-none no-underline transition-colors hover:bg-dark-gray hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  <item.icon className="text-mid-gray size-4" />

                                  <div className="ml-2 space-y-1.5">
                                    <div className="text-foreground text-sm font-medium leading-none">
                                      {item.title}
                                    </div>
                                    <p className="text-mid-gray line-clamp-2 text-sm leading-tight">
                                      {item.description}
                                    </p>
                                  </div>
                                </a>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
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
              link.dropdownItems ? (
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
                      "ml-1 space-y-3 overflow-hidden border-b border-b-dark-gray transition-all",
                      openDropdown === link.label
                        ? "mt-3 max-h-[1000px] pb-6 opacity-100"
                        : "max-h-0 opacity-0",
                    )}
                  >
                    {link.dropdownItems.map((item) => (
                      <a
                        key={item.title}
                        href={item.href}
                        onClick={() => {
                          setIsMenuOpen(false);
                          setOpenDropdown(null);
                        }}
                        className="flex items-start gap-3 rounded-md p-2 hover:bg-accent"
                      >
                        <item.icon className="text-mid-gray size-6 shrink-0" />
                        <div>
                          <div className="text-foreground font-medium">
                            {item.title}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </a>
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

export { Navbar };
