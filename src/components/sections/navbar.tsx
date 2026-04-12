import {
  Building2,
  Calculator,
  ChevronRight,
  Database,
  FileText,
  Landmark,
  Layers,
  LineChart,
  MapPin,
  Scale,
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
          title: "Application process",
          href: "/programs/application-process",
          description:
            "MULTI-GO submission, fees, COI workflow, processing timelines.",
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
          title: "Premium Calculator",
          href: "/calculators/premium",
          description:
            "July 14, 2025 LTV-tiered premiums with every surcharge.",
          icon: Calculator,
        },
        {
          title: "Cash Flow Projection",
          href: "/calculators/cash-flow",
          description:
            "NOI, debt service, cash-on-cash, amortization schedule.",
          icon: LineChart,
        },
        {
          title: "Scenario Comparison",
          href: "/calculators/compare",
          description:
            "MLI Select vs. MLI Standard vs. conventional — side by side.",
          icon: FileText,
        },
        {
          title: "Premium Credit",
          href: "/calculators/premium-credit",
          description:
            "Refinance credit — 75% declining to 20% by year 7.",
          icon: Calculator,
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
          title: "Affordability thresholds",
          href: "/underwriting/affordability",
          description:
            "30% of median renter income — by CMA.",
          icon: MapPin,
        },
        {
          title: "Opex, vacancy, reserves",
          href: "/underwriting/opex",
          description: "Key underwriting benchmarks used in practice.",
          icon: Database,
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
    { label: "Policy", href: "/policy" },
    { label: "Data", href: "/data" },
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
