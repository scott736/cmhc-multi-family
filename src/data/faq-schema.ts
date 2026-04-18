// Plain-text FAQ data, used exclusively for FAQPage JSON-LD emission on /faq.
// Intentionally limited to the highest-value, most evergreen Q&A pairs — keeping
// the structured data scannable for AI/answer engines. The rich on-page FAQ
// (faq-content.tsx) carries the complete list with in-text links.

export type FaqPair = { question: string; answer: string };

export const FAQ_SCHEMA_PAIRS: FaqPair[] = [
  {
    question: "What is the difference between MLI Select and MLI Standard?",
    answer:
      "MLI Standard is CMHC's foundational multi-unit product — up to 85% LTV, market-rate insured, no affordability commitment required. MLI Select is a points-based flagship introduced in 2022 that scales benefits (up to 95% LTC, 50-year amortization, premium discounts up to 30%) in exchange for committed affordability, energy efficiency, or accessibility outcomes. Minimum 50 points is required to qualify for MLI Select.",
  },
  {
    question: "Do I need to commit to affordability to use MLI Select?",
    answer:
      "No. Affordability is one of three point categories in MLI Select — alongside energy efficiency and accessibility. A project can score 50 or more points through energy and accessibility alone. In practice, affordability is the most common path because it offers the strongest points-per-commitment ratio.",
  },
  {
    question: "What is the minimum unit count for CMHC multi-unit financing?",
    answer:
      "Five self-contained residential units. Properties with fewer than five units fall under CMHC's small-rental (1–4 unit) products or residential insurance rules, which have different underwriting standards and premium schedules.",
  },
  {
    question: "What is the maximum loan-to-value on MLI Select?",
    answer:
      "Up to 95% loan-to-cost for construction and up to 95% loan-to-value for purchase/refinance at the top tier (100 points). Lower point tiers scale to 90% and 85%.",
  },
  {
    question: "What is the maximum amortization on CMHC multi-unit loans?",
    answer:
      "Up to 50 years on MLI Select at 100 points, on MLI Standard new construction (since June 2024), and on ACLP, AHF, and CHDP. MLI Standard for existing buildings caps at 40 years. Amortizations beyond 25 years carry a premium surcharge of +0.25% per additional five years since July 14 2025.",
  },
  {
    question: "What is the minimum debt coverage ratio (DCR)?",
    answer:
      "MLI Select uses 1.10 across all tiers. MLI Standard ranges from 1.10 for 5–6 unit purchases up to 1.30 for 7+ units with terms under 10 years. There is no residential-style 4.79% stress-test on CMHC multi-unit loans — fixed-rate loans are DCR-tested at contract rate, and floating-rate loans use a lender-specified ceiling rate.",
  },
  {
    question: "How does CMHC calculate net operating income (NOI) for sizing?",
    answer:
      "CMHC uses effective gross income less underwritten operating expenses. For existing buildings, rents are in-place adjusted to achievable market. For new construction, rents come from the CMA-level Rental Market Survey. Vacancy is floored at 3–5% even in tight markets. A property management expense of 3–5% of EGI is always deducted, even for self-managed owners.",
  },
  {
    question: "Which CMHC program has the lowest interest rate?",
    answer:
      "ACLP (Apartment Construction Loan Program) offers the lowest rate — CMHC lends directly at below-market fixed rates. AHF and CHDP also offer below-market rates but are restricted to non-profit, government, Indigenous, or cooperative borrowers. For for-profit borrowers, MLI Select with Tier 3 premium discount produces the lowest all-in cost of CMHC-insured financing.",
  },
  {
    question: "What is the fastest CMHC multi-unit product to close?",
    answer:
      "MLI Standard on an existing, occupied property is typically the fastest — no affordability or energy scoring review, no construction underwriting. MULTI-GO can compress underwriting to approximately 10 business days for eligible acquisitions of 5–19 units.",
  },
  {
    question: "How is the CMHC insurance premium calculated?",
    answer:
      "Premium is a percentage of the insured loan amount, tiered by LTV and transaction type (purchase/refinance vs construction). Since July 14 2025, pricing is risk-based and LTV-tiered, replacing earlier flat-rate grids. Surcharges apply for extended amortization (+0.25% per 5 years beyond 25), non-residential income (+1.0%), second-mortgage financing (+0.5%), and unmet EGI (+0.25%).",
  },
  {
    question: "Can the CMHC premium be added to the loan amount?",
    answer:
      "Yes. The insurance premium itself is capitalized into the insured loan amount. However, provincial PST/QST on the premium is paid out of pocket at closing — Ontario 8%, BC 7%, Saskatchewan 6%, Manitoba 7%, Quebec 9.975%. Alberta has no PST on insurance premium.",
  },
  {
    question: "Is there a premium credit when refinancing an insured property?",
    answer:
      "Yes. A premium credit reduces the additional premium owed on the new insured amount when refinancing an already-insured property. The credit is a function of elapsed time since original insurance and the original premium paid.",
  },
  {
    question: "Who can borrow under MLI Select and MLI Standard?",
    answer:
      "Both programs are available to for-profit and non-profit borrowers. ACLP is open to all borrower types. AHF is restricted to non-profit, government, and Indigenous borrowers. CHDP is restricted to housing cooperatives.",
  },
  {
    question: "What happens to MLI Select benefits at renewal or on sale?",
    answer:
      "Affordability commitments under MLI Select run with the insurance and transfer to a purchaser on assumption. At renewal, the amortization benefit continues. Premium is re-assessed only if the insured amount increases (top-up). See the lifecycle hub for assumption, porting, and prepayment mechanics.",
  },
  {
    question: "Does CMHC require environmental or appraisal reports?",
    answer:
      "Yes. A current AACI appraisal is required for all files. A Phase I Environmental Site Assessment is standard; Phase II may be triggered by Phase I findings. Cost Consultant reports are required for construction files, and bonding is mandatory since November 2024.",
  },
  {
    question: "How long does a CMHC multi-unit file take to approve?",
    answer:
      "MULTI-GO: approximately 10 business days. MLI Standard acquisition: 6–10 weeks. MLI Select acquisition: 8–12 weeks. MLI Select construction: 12–20 weeks. ACLP, AHF, and CHDP files typically run 4–9 months given program-specific review layers.",
  },
  {
    question: "Can ACLP and AHF be combined on the same project?",
    answer:
      "Yes. ACLP and AHF typically coexist sequentially — ACLP provides construction-phase financing at below-market rates, and AHF layers forgivable capital that reduces long-term debt. The affordability commitment defaults to the deeper of the two programs' requirements.",
  },
  {
    question: "What was the November 2025 MLI Select refresh?",
    answer:
      "CMHC refreshed the MLI Select framework in November 2025 to tighten affordability measurement, clarify energy-efficiency evidence, and introduce rental achievement holdbacks on construction files. The point structure and tier benefits were retained, but scoring methodology and documentation expectations were updated.",
  },
  {
    question: "What was the July 14 2025 CMHC premium overhaul?",
    answer:
      "CMHC replaced the flat-rate premium grids with LTV-tiered, risk-based pricing on July 14 2025. Amortization surcharges (+0.25% per 5 years beyond 25) were made explicit, and premium refunds on rental-achievement milestones were restructured.",
  },
  {
    question: "Is retirement housing eligible for MLI Select?",
    answer:
      "Retirement housing with 50+ units or beds falls under CMHC's specialized segment, with its own premium schedule under Other Shelter Models. MLI Select is reserved for market rental. Retirement, supportive, and student housing use different scoring and premium grids.",
  },
];

export function buildFaqPageSchema(pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    url: pageUrl,
    mainEntity: FAQ_SCHEMA_PAIRS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}
