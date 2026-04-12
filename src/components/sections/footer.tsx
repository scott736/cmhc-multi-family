import { Building2, Linkedin, Twitter } from "lucide-react";

const navigation = [
  {
    title: "Programs",
    links: [
      { name: "MLI Select", href: "/programs/mli-select" },
      { name: "MLI Standard", href: "/programs/mli-standard" },
      { name: "ACLP", href: "/programs/aclp" },
      { name: "AHF", href: "/programs/ahf" },
      { name: "CHDP", href: "/programs/chdp" },
      { name: "Compare all", href: "/programs/compare" },
    ],
  },
  {
    title: "Calculators",
    links: [
      { name: "MLI Select Point Scorer", href: "/calculators/point-scorer" },
      { name: "Loan Sizer", href: "/calculators/loan-sizer" },
      { name: "Premium Calculator", href: "/calculators/premium" },
      { name: "Cash Flow Projection", href: "/calculators/cash-flow" },
      { name: "Scenario Comparison", href: "/calculators/compare" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Underwriting logic", href: "/underwriting" },
      { name: "Policy change tracker", href: "/policy" },
      { name: "Data sources", href: "/data" },
      { name: "Lender landscape", href: "/lenders" },
      { name: "Developer pathways", href: "/developers" },
    ],
  },
];

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com" },
  { icon: Linkedin, href: "https://linkedin.com" },
];

const legal = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
  { name: "Cookie Policy", href: "/cookie-policy" },
];

export function Footer() {
  return (
    <footer className="text-foreground bg-obsidian px-2.5 lg:px-0">
      <div className="container p-0">
        <div className="bg-jet grid border-l border-r border-dark-gray p-0 lg:grid-cols-4">
          {navigation.map((section) => (
            <div
              key={section.title}
              className="border-b border-b-dark-gray px-6 py-10 lg:border-r lg:border-r-dark-gray lg:px-8 lg:py-12"
            >
              <h3 className="mb-4 text-2xl font-bold">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="transition-colors hover:text-muted-foreground lg:text-lg"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="border-b border-b-dark-gray px-6 py-10 lg:px-8 lg:py-12">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex size-8 items-center justify-center rounded-md bg-white/10">
                <Building2 className="size-5 text-white" />
              </div>
              <span className="font-semibold tracking-tight">
                CMHC Multi-Family
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              The definitive guide to Canadian multifamily financing — current
              to April 2026.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map(({ icon: Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  aria-label={href}
                  className="transition-colors hover:text-muted-foreground"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-jet grid border-b border-l border-r border-dark-gray">
          <div className="flex flex-col justify-center px-6 py-10 lg:px-8 lg:py-12">
            <div className="max-w-3xl">
              <p className="text-foreground text-sm mb-2">
                Informational disclaimer
              </p>
              <p className="font-inter-tight text-mid-gray text-xs leading-relaxed">
                This site is an independent educational resource. It is not
                affiliated with Canada Mortgage and Housing Corporation
                (CMHC). Program details, premiums, and policy changes are
                synthesized from publicly available CMHC publications and
                industry analysis current to April 2026. This content is not
                financial, mortgage, or legal advice — confirm all program
                parameters with CMHC and an approved lender before acting.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-jet grid gap-2 border-l border-r border-dark-gray px-6 py-4 sm:grid-cols-2 lg:px-8">
          <p className="text-foreground text-xs">
            © {new Date().getFullYear()} CMHC Multi-Family Guide.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            {legal.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs underline hover:text-muted-foreground"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
