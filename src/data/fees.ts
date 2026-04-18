// CMHC multi-unit fee schedule reference — typical ranges.
// All figures are current-market indicative and vary by lender, deal size,
// and province. Do not modify cmhc.ts; this is a separate data file.

export interface FeeLine {
  label: string;
  range: string;
  notes: string;
}

export interface FeeCategory {
  title: string;
  description: string;
  lines: FeeLine[];
}

export const FEE_CATEGORIES: FeeCategory[] = [
  {
    title: "CMHC fees",
    description:
      "CMHC charges an application fee and recovers most revenue through the premium itself. There is no separate review fee on standard multi-unit.",
    lines: [
      {
        label: "Application fee (per unit)",
        range: "$150 / unit (min ~$1,500)",
        notes:
          "Payable to CMHC at submission. Non-refundable once underwriting begins.",
      },
      {
        label: "Application fee cap",
        range: "Typically capped around ~$75,000 on large files",
        notes:
          "Consolidated multi-property files aggregate unit counts.",
      },
      {
        label: "CMHC premium (see premium calculator)",
        range: "2.6% – 5.35% of insured loan (MLI Standard)",
        notes:
          "LTV-banded per July 14 2025 grid; MLI Select tiers earn 10/20/30% discounts. Capitalizable to the loan.",
      },
      {
        label: "Amortization surcharge",
        range: "+0.25% per 5 years beyond 25-year amortization",
        notes:
          "Since July 14 2025, applies to MLI Select as well as MLI Standard.",
      },
    ],
  },
  {
    title: "Appraisal & professional reports",
    description:
      "Third-party reports are borrower-paid. Mandatory appraisal on all deal sizes since November 2024.",
    lines: [
      {
        label: "Appraisal — small multi (5–20 units)",
        range: "$3,500 – $7,500",
        notes:
          "Rural markets and complex properties skew higher.",
      },
      {
        label: "Appraisal — mid multi (21–100 units)",
        range: "$7,500 – $15,000",
        notes:
          "Most CMHC-insured files fall in this range.",
      },
      {
        label: "Appraisal — large multi (100+ units)",
        range: "$15,000 – $35,000+",
        notes:
          "Very large or multi-building portfolios priced by the project.",
      },
      {
        label: "Phase I Environmental Site Assessment",
        range: "$3,500 – $8,000",
        notes:
          "Phase II (intrusive testing) only if Phase I identifies concerns; $15,000+ typical.",
      },
      {
        label: "Quantity Surveyor (construction only)",
        range: "$10,000 – $30,000",
        notes:
          "Per-draw reports add $2,000–$5,000 each throughout construction.",
      },
      {
        label: "Geotechnical report (construction)",
        range: "$5,000 – $25,000",
        notes:
          "Scales with site complexity, borehole count, and soils conditions.",
      },
      {
        label: "Architect drawings & specifications",
        range: "3% – 7% of hard costs",
        notes:
          "Full architectural services for new construction.",
      },
      {
        label: "Building condition assessment (existing)",
        range: "$3,000 – $10,000",
        notes:
          "Sometimes required in lieu of full inspection on older assets.",
      },
    ],
  },
  {
    title: "Lender fees",
    description:
      "Lender fees vary significantly by lender, loan size, and borrower relationship.",
    lines: [
      {
        label: "Application / commitment fee",
        range: "0.10% – 0.35% of loan amount",
        notes:
          "Typically split between application (refundable portion) and commitment (non-refundable).",
      },
      {
        label: "Standby fee (construction)",
        range: "0.25% – 0.50% of undrawn balance p.a.",
        notes:
          "Applies to authorized but undrawn construction advances.",
      },
      {
        label: "Renewal fee",
        range: "$0 – $2,500",
        notes:
          "Most major CMHC-insured lenders waive at renewal if rate is accepted.",
      },
      {
        label: "Lender legal (borrower pays)",
        range: "$5,000 – $15,000",
        notes:
          "Higher on construction loans and on complex title.",
      },
    ],
  },
  {
    title: "Legal & closing costs",
    description:
      "Borrower-side legal and third-party costs at funding.",
    lines: [
      {
        label: "Borrower legal",
        range: "$7,500 – $20,000",
        notes:
          "Higher on construction and portfolio deals.",
      },
      {
        label: "Title insurance",
        range: "$1,500 – $5,000",
        notes:
          "Commercial title insurance; replaces survey/RPR in most jurisdictions.",
      },
      {
        label: "Survey / Real Property Report",
        range: "$2,500 – $7,500",
        notes:
          "Required where title insurance is not used or lender insists.",
      },
      {
        label: "Insurance binder at closing",
        range: "Policy premium + ~$500 binder fee",
        notes:
          "All-risk property + commercial GL + rent-loss; amounts vary by asset.",
      },
    ],
  },
  {
    title: "Construction-specific costs",
    description:
      "Applies only to new construction and major renovation projects.",
    lines: [
      {
        label: "Surety bonding",
        range: "0.5% – 2.0% of contract value",
        notes:
          "Mandatory for CMHC-insured construction since November 2024. Performance + labour & material payment bonds.",
      },
      {
        label: "Course-of-construction insurance",
        range: "0.2% – 0.5% of construction cost",
        notes:
          "Separate from permanent property insurance; required until occupancy.",
      },
      {
        label: "Wrap-up liability",
        range: "~$5,000 – $25,000",
        notes:
          "Owner-controlled liability covering all trades; required by most lenders.",
      },
    ],
  },
  {
    title: "PST on CMHC premium (provincial)",
    description:
      "Provincial sales tax on the CMHC premium amount (not the loan). Paid to the province at funding; cannot be capitalized.",
    lines: [
      { label: "Ontario (RST on insurance)", range: "8% of premium", notes: "Paid at closing." },
      { label: "Quebec (TVQ on insurance)", range: "9.975% of premium", notes: "Paid at closing." },
      { label: "Saskatchewan (PST)", range: "6% of premium", notes: "Paid at closing." },
      { label: "Manitoba (RST)", range: "7% of premium", notes: "Paid at closing." },
      {
        label: "Alberta / BC / Atlantic",
        range: "0% (no provincial tax on insurance)",
        notes: "No sales tax on CMHC premium in these provinces.",
      },
    ],
  },
];

// Indicative total closing costs for a typical $10M MLI Select purchase.
export const EXAMPLE_CLOSING_COSTS = {
  dealSize: 10_000_000,
  program: "MLI Select (Tier 2, 70 pts)",
  lines: [
    { label: "CMHC premium (estimated)", low: 320_000, high: 420_000 },
    { label: "CMHC application fee", low: 8_000, high: 15_000 },
    { label: "Appraisal", low: 8_000, high: 14_000 },
    { label: "Phase I ESA", low: 4_000, high: 7_000 },
    { label: "Lender application + commitment", low: 15_000, high: 35_000 },
    { label: "Lender legal", low: 8_000, high: 14_000 },
    { label: "Borrower legal", low: 10_000, high: 18_000 },
    { label: "Title insurance + disbursements", low: 2_500, high: 5_000 },
    { label: "Ontario PST on premium (if ON)", low: 25_000, high: 35_000 },
  ],
  totalRange: { low: 400_500, high: 563_000 },
  note:
    "Ranges assume Ontario closing with 8% PST on premium. Costs fall by roughly PST amount in Alberta/BC/Atlantic provinces. Premium is capitalizable into the loan; all other amounts are cash at closing.",
};
