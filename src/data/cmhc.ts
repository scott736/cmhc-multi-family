// Single source of truth for CMHC program data.
// Current to April 2026, incorporating July 14 2025 premium overhaul
// and November 2024 policy tightening.

export const LAST_UPDATED = "April 2026";

export type Program =
  | "mli-standard"
  | "mli-select"
  | "aclp"
  | "ahf"
  | "chdp"
  | "specialized";

export const PROGRAMS = [
  {
    slug: "mli-standard",
    name: "MLI Standard",
    tagline: "Market Rental — 5+ self-contained units",
    short:
      "The foundational CMHC multi-unit product. Covers new construction, purchases, and refinances with no affordability commitment required.",
    maxLTV: "85%",
    maxAmortization: "50yr new / 40yr existing",
    affordability: "Not required",
    eligibleBorrowers: "For-profit, non-profit",
    interestRate: "Market (insured)",
  },
  {
    slug: "mli-select",
    name: "MLI Select",
    tagline: "Points-based flagship — up to 95% LTC, 50yr amort",
    short:
      "Launched March 2022 and now dominant. Scaling benefits in exchange for affordability, energy-efficiency, or accessibility commitments. Minimum 50 points to qualify.",
    maxLTV: "95%",
    maxAmortization: "50 years (100 pts)",
    affordability: "Optional (most common path)",
    eligibleBorrowers: "For-profit, non-profit",
    interestRate: "Market (insured)",
  },
  {
    slug: "aclp",
    name: "ACLP",
    tagline: "Apartment Construction Loan Program — CMHC direct",
    short:
      "Formerly RCFI. CMHC directly lends at below-market fixed rates with integrated insurance. $55B program targeting 131,000+ homes by 2031-32.",
    maxLTV: "100% of residential cost",
    maxAmortization: "50 years",
    affordability: "Required — 20% of units ≤30% MFI",
    eligibleBorrowers: "All",
    interestRate: "Below-market",
  },
  {
    slug: "ahf",
    name: "AHF",
    tagline: "Affordable Housing Fund — $14.6B",
    short:
      "Formerly NHCIF. Low-interest/forgivable loans + contributions. Repayable up to 95% LTC, plus forgivable $25–75K/unit (up to 40% of costs).",
    maxLTV: "Up to 95%",
    maxAmortization: "50 years",
    affordability: "Required (deep)",
    eligibleBorrowers: "Non-profit, gov't, Indigenous",
    interestRate: "Below-market",
  },
  {
    slug: "chdp",
    name: "CHDP",
    tagline: "Co-operative Housing Development — $1.5B",
    short:
      "Largest federal co-op housing investment in 30+ years. Repayable + forgivable loans up to 100% of eligible costs. Target 3,200 new co-op units by 2031.",
    maxLTV: "Up to 100%",
    maxAmortization: "50 years",
    affordability: "Required",
    eligibleBorrowers: "Co-ops only",
    interestRate: "Below-market",
  },
  {
    slug: "specialized",
    name: "Specialized",
    tagline: "Retirement, student, supportive, SRO",
    short:
      "Standard insurance for retirement housing (50+ units/beds), student, supportive, and single-room occupancy — all with higher premium schedules than standard rental.",
    maxLTV: "Varies",
    maxAmortization: "40 years",
    affordability: "Varies by product",
    eligibleBorrowers: "For-profit, non-profit",
    interestRate: "Market (insured)",
  },
] as const;

// MLI Standard premium grid — effective July 14, 2025 (EGI met)
export const MLI_STANDARD_PREMIUMS = [
  { band: "≤65%", maxLtv: 65, purchaseRefi: 2.6, construction: 3.25 },
  { band: "≤70%", maxLtv: 70, purchaseRefi: 2.85, construction: 3.75 },
  { band: "≤75%", maxLtv: 75, purchaseRefi: 3.35, construction: 4.25 },
  { band: "≤80%", maxLtv: 80, purchaseRefi: 4.35, construction: 5.0 },
  { band: "≤85%", maxLtv: 85, purchaseRefi: 5.35, construction: 6.0 },
];

export const PREMIUM_SURCHARGES = {
  amortizationPer5Years: 0.25,
  nonResidential: 1.0,
  secondMortgage: 0.5,
  egiNotMet: 0.25,
};

export const MLI_SELECT_DISCOUNTS = {
  tier1: { points: 50, discount: 0.1, maxLtvNew: 95, maxLtvExisting: 85, maxAmort: 40, dcr: 1.1, recourse: "Full" },
  tier2: { points: 70, discount: 0.2, maxLtvNew: 95, maxLtvExisting: 95, maxAmort: 45, dcr: 1.1, recourse: "Full" },
  tier3: { points: 100, discount: 0.3, maxLtvNew: 95, maxLtvExisting: 95, maxAmort: 50, dcr: 1.1, recourse: "Limited" },
};

// Affordability scoring (new construction)
export const AFFORDABILITY_SCORING_NEW = [
  { level: 1, points: 50, unitPct: 10 },
  { level: 2, points: 70, unitPct: 15 },
  { level: 3, points: 100, unitPct: 25 },
];

export const AFFORDABILITY_SCORING_EXISTING = [
  { level: 1, points: 50, unitPct: 40 },
  { level: 2, points: 70, unitPct: 60 },
  { level: 3, points: 100, unitPct: 80 },
];

export const AFFORDABILITY_BONUS_20YR = 30;

// Energy efficiency scoring (new construction, vs 2020 NECB/NBC Tier 1)
export const ENERGY_SCORING_NEW = [
  { level: 1, points: 20, necb: 25, nbc: 20 },
  { level: 2, points: 35, necb: 50, nbc: 40 },
  { level: 3, points: 50, necb: 60, nbc: 70 },
];

export const ENERGY_SCORING_EXISTING = [
  { level: 1, points: 20, reductionPct: 15 },
  { level: 2, points: 35, reductionPct: 25 },
  { level: 3, points: 50, reductionPct: 40 },
];

// Accessibility scoring
export const ACCESSIBILITY_SCORING = [
  {
    level: 1,
    points: 20,
    requirement:
      "≥15% accessible units (CSA B651:23) or RHFAC v4.0 rating 60–79%",
  },
  {
    level: 2,
    points: 30,
    requirement:
      "100% accessible or universal design, or RHFAC Gold (≥80%)",
  },
];

// Min DCR (MLI Standard)
export const MIN_DCR_STANDARD = [
  { segment: "7+ units, term ≥10yr", dcr: 1.2 },
  { segment: "7+ units, term <10yr", dcr: 1.3 },
  { segment: "5–6 units, purchase", dcr: 1.1 },
  { segment: "5–6 units, refinance", dcr: 1.2 },
];

// Approximate 2025-2026 affordability thresholds (30% of median renter household income)
export const AFFORDABILITY_THRESHOLDS = [
  { cma: "Calgary", monthly: 1738 },
  { cma: "Toronto (low)", monthly: 1450 },
  { cma: "Toronto (high)", monthly: 1625 },
  { cma: "Vancouver (low)", monthly: 1375 },
  { cma: "Vancouver (high)", monthly: 1500 },
  { cma: "Edmonton (low)", monthly: 1375 },
  { cma: "Edmonton (high)", monthly: 1500 },
];

export const POLICY_TIMELINE = [
  {
    date: "June 2024",
    change:
      "MLI Standard amortization extended to 50yr for new construction; environmental contamination policy relaxed.",
  },
  {
    date: "September 2024",
    change:
      "Only approved lenders can submit to CMHC. Lenders must fund at least 80% of approved loans. Borrowers must now select a lender before obtaining CMHC approval.",
  },
  {
    date: "November 2024",
    change:
      "Mandatory appraisals for all sizes (regardless of size), bonding required for construction, rental achievement holdbacks for MLI Select, accessibility standards updated.",
  },
  {
    date: "July 3, 2025",
    change:
      "Holdbacks removed for MLI Market Rental construction — advance to 85% without holdback.",
  },
  {
    date: "July 14, 2025",
    change:
      "Risk-based premium overhaul. Amortization surcharges (+0.25% per 5yr beyond 25) now apply to MLI Select. LTV-tiered pricing replaces flat rates.",
  },
  {
    date: "November 2025",
    change:
      "Energy-efficiency transition to 2020 NECB/NBC (grace period to Sept 30, 2026).",
  },
];

export const TOP_LENDERS = [
  {
    name: "Equitable Bank",
    mua: "$27.5B",
    growth: "+175% since 2021",
    type: "Schedule I bank",
    notes:
      "Largest CMHC multi-unit issuer by volume. Minimal public educational content.",
  },
  {
    name: "First National",
    mua: "$10–15B",
    growth: "81% CMHC-insured",
    type: "Monoline",
    notes: "Self-described #1 CMHC apartment lender.",
  },
  { name: "National Bank", mua: "$10–15B", growth: "", type: "Big 6 bank", notes: "" },
  { name: "TD Bank", mua: "$10–15B", growth: "", type: "Big 6 bank", notes: "" },
  {
    name: "Peoples Trust",
    mua: "$10–15B",
    growth: "$18B+ servicing",
    type: "Trust company",
    notes: "",
  },
];

export const OTHER_LENDERS = [
  "MCAP — Canada's largest independent commercial originator; team averages 30+ years CMHC experience",
  "Peakhill Capital — $13.5B+ funded across 2,500+ loans, over half MLI Select",
  "Canada ICI — dual lender/advisor",
  "CMLS Financial",
  "CBRE Capital — uniquely both approved lender and brokerage",
  "Sun Life, Canada Life, Manulife — $13B+ commercial mortgage portfolios each; compete on 20+ year fixed-rate terms",
  "Credit unions — via regional centrals (Central 1, CU Central of Alberta)",
];

export const KEY_BROKERS = [
  "CBRE Capital",
  "JLL Capital Markets",
  "Citifund Capital (BC-focused)",
  "KV Capital",
  "Canada ICI (dual lender/advisor)",
  "Ashdown Capital",
  "GreenBirch Capital",
];

export const MUNICIPAL_INCENTIVES = [
  {
    city: "Toronto",
    program: "Rental Housing Supply Program",
    benefit:
      "Full exemption of development charges, community benefit charges, parkland fees, and building permits for affordable units (40-year commitment). 15% property tax reduction for 35 years via New Multi-Residential Tax Subclass. Estimated ~$97,264 per affordable unit.",
  },
  {
    city: "Vancouver",
    program: "Secured Rental Policy + Rental Development Relief",
    benefit:
      "DCL waivers: Class A 100% waiver (rental ≥20% below-market), Class B 86.24% waiver. Feb 2026–Dec 2027 Rental Development Relief: full DCL waiver + 20% DCL discount for all projects. CHIP capital grants stack with CMHC AHF/CHDP.",
  },
  {
    city: "Calgary",
    program: "Non-Market Property Tax Exemption + Housing Incentive",
    benefit:
      "Property tax exemption for non-market housing (Jan 2025). Housing Incentive Program with pre-development grants.",
  },
  {
    city: "Edmonton",
    program: "Affordable Housing Investment Program",
    benefit:
      "Grants aligned with median market rents, open to non-profit and for-profit. $192M secured through the federal Housing Accelerator Fund targeting 36,000 homes.",
  },
  {
    city: "Ottawa",
    program: "Affordable Housing CIP",
    benefit:
      "Tax Increment Equivalent Grants of $6,000–$8,000 per affordable unit per year for 20 years.",
  },
  {
    city: "Montreal",
    program: "SHQ Match + Loger+ Strategy",
    benefit:
      "40% match of SHQ grants for social/affordable housing; land-transfer prioritization.",
  },
];

export const PROVINCIAL_RENT_RULES = [
  {
    province: "Ontario",
    rule: "Buildings first occupied after Nov 15, 2018 are exempt from rent control — critical for new CMHC-financed developments. 2026 guideline for controlled units is 2.1% (capped at 2.5%). Vacancy decontrol: any rent allowed between tenancies. Bill 60 (Nov 2025) shortened arrears timelines and introduced fast-track LTB processes.",
  },
  {
    province: "British Columbia",
    rule: "Rent control applies to all existing tenancies with no new-construction exemption. 2026 cap: 2.3% (CPI-based). Creates stability but less attractive for investors seeking unrestricted rent growth.",
  },
  {
    province: "Alberta",
    rule: "No rent control — landlords can increase rents by any amount with 3 months' notice. Most investor-friendly but introduces revenue uncertainty for tenants.",
  },
  {
    province: "Quebec",
    rule: "Tribunal administratif du logement publishes recommended increases annually; tenants can contest. New-construction rents exempt from TAL review for first 5 years.",
  },
];

export const CONSTRUCTION_COMPARISON = [
  {
    metric: "Project cost",
    conventional: "$1,190,000",
    mliSelect: "$1,190,000",
  },
  {
    metric: "Permanent equity required",
    conventional: "$297,500",
    mliSelect: "$59,500",
  },
  {
    metric: "Cash-on-cash return",
    conventional: "~7%",
    mliSelect: "~32%",
  },
  {
    metric: "Capital recaptured at takeout",
    conventional: "$0",
    mliSelect: "~$238,000",
  },
];

export const DATA_SOURCES = [
  {
    name: "CMHC Rental Market Survey",
    url: "https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market/rental-market-report-data-tables",
    description:
      "Annual survey (October) covering all urban areas ≥10,000 population. Reports vacancy, avg rent, turnover, rental universe counts by bedroom type, structure size, year, geography down to census-tract.",
  },
  {
    name: "Housing Market Information Portal (HMIP)",
    url: "https://www03.cmhc-schl.gc.ca/hmip-pimh/en",
    description:
      "Interactive access to Starts & Completions, Rental Market Survey, Secondary Rental Market Survey, Seniors Housing Survey. Data from national to neighbourhood level.",
  },
  {
    name: "StatCan Table 34-10-0133-01",
    url: "https://www150.statcan.gc.ca/",
    description:
      "Mirrors CMHC average rents for 247 geographies. Accessible via StatCan Web Data Service API.",
  },
  {
    name: "cmhc R package (unofficial HMIP API)",
    url: "https://mountainmath.github.io/cmhc/",
    description:
      "CRAN package wrapping the HMIP portal — the closest thing to a CMHC REST API.",
  },
  {
    name: "Canada Open Government Portal",
    url: "https://open.canada.ca/data/organization/cmhc-schl",
    description: "Bulk CSV downloads of CMHC historical data.",
  },
  {
    name: "GreenBirch Affordable Rent Lookup",
    url: "https://greenbirchcapital.com/affordable-unit-monthly-rents/",
    description:
      "Public lookup for MLI Select affordable unit rent thresholds by CMA.",
  },
];
