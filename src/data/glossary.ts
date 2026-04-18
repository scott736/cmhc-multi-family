// CMHC multi-family glossary — ~70 terms across eight categories.
// Standalone data file; do not modify cmhc.ts.

export type GlossaryCategory =
  | "Programs"
  | "Underwriting"
  | "Insurance & Premium"
  | "Construction"
  | "Affordability"
  | "Process"
  | "Lenders"
  | "Legal";

export interface GlossaryEntry {
  term: string;
  definition: string;
  category: GlossaryCategory;
  related?: string[];
}

export const GLOSSARY: GlossaryEntry[] = [
  // PROGRAMS
  {
    term: "MLI Standard",
    category: "Programs",
    definition:
      "CMHC Multi-Unit Loan Insurance — the foundational insured multi-unit product. Covers market-rental new construction, purchases, and refinances of 5+ unit buildings with no affordability commitment required. Max 85% LTV, 50-year amortization for new construction, 40-year for existing.",
    related: ["MLI Select", "ACLP"],
  },
  {
    term: "MLI Select",
    category: "Programs",
    definition:
      "Points-based CMHC insurance product launched March 2022. Borrowers earn points for affordability, energy efficiency and accessibility commitments to unlock higher LTV (up to 95%), longer amortization (up to 50 years), lower minimum DCR (1.10), and premium discounts (10/20/30%). Minimum 50 points to qualify.",
    related: ["MLI Standard", "Affordable Unit", "NECB"],
  },
  {
    term: "ACLP",
    category: "Programs",
    definition:
      "Apartment Construction Loan Program — formerly RCFI. $55B CMHC direct-lending program for new purpose-built rental construction at below-market fixed rates with integrated insurance. Requires at least 20% of units at or below 30% of Median Family Income (MFI).",
    related: ["AHF", "MFI", "Affordable Unit"],
  },
  {
    term: "AHF",
    category: "Programs",
    definition:
      "Affordable Housing Fund — formerly NHCIF. $14.6B CMHC program providing low-interest or forgivable loans plus contributions for affordable and deeply affordable housing. Forgivable component of $25–75K/unit (up to 40% of costs) available to non-profit, government, and Indigenous borrowers.",
    related: ["ACLP", "CHDP"],
  },
  {
    term: "CHDP",
    category: "Programs",
    definition:
      "Co-operative Housing Development Program. $1.5B CMHC direct-lending program targeting 3,200 new co-op units by 2031. Repayable + forgivable loans up to 100% of eligible costs; housing co-ops only.",
    related: ["Co-operative Housing", "AHF"],
  },
  {
    term: "MULTI-GO",
    category: "Programs",
    definition:
      "CMHC's online submission platform for approved lenders to file multi-unit insurance applications. Since September 2024, all submissions go through MULTI-GO — borrowers cannot submit directly.",
    related: ["Approved Lender", "CoI"],
  },

  // UNDERWRITING
  {
    term: "EGI",
    category: "Underwriting",
    definition:
      "Effective Gross Income. Gross potential rent less vacancy and bad debt, plus ancillary income (parking, laundry, storage, commercial NRI). The top line that property-level opex is subtracted from to arrive at NOI.",
    related: ["NOI", "Vacancy Rate", "EGI Not Met"],
  },
  {
    term: "NOI",
    category: "Underwriting",
    definition:
      "Net Operating Income. EGI minus all operating expenses (property taxes, insurance, landlord-paid utilities, repairs and maintenance, property management, replacement reserves). The numerator in the DCR calculation.",
    related: ["EGI", "DCR", "Replacement Reserves"],
  },
  {
    term: "DCR",
    category: "Underwriting",
    definition:
      "Debt Coverage Ratio (also DSCR — Debt Service Coverage Ratio). NOI divided by annual debt service on the insured loan amount. CMHC enforces a minimum that varies by program, unit count, and term length. Usually the binding loan-size constraint at high leverage.",
    related: ["NOI", "LTV", "MIN_DCR"],
  },
  {
    term: "DSCR",
    category: "Underwriting",
    definition:
      "Debt Service Coverage Ratio — synonymous with DCR in CMHC multi-unit context. NOI divided by annual principal + interest on the insured loan.",
    related: ["DCR"],
  },
  {
    term: "LTV",
    category: "Underwriting",
    definition:
      "Loan-to-Value ratio. Insured loan amount divided by Lending Value (usually the lower of appraised value and cost). MLI Standard caps at 85%; MLI Select up to 95% at tier 2+.",
    related: ["LTC", "Lending Value", "Appraised Value"],
  },
  {
    term: "LTC",
    category: "Underwriting",
    definition:
      "Loan-to-Cost ratio. Insured loan divided by total project cost (acquisition + hard + soft costs). Used for construction financing where appraised value differs materially from cost.",
    related: ["LTV", "Lending Value"],
  },
  {
    term: "Stabilized NOI",
    category: "Underwriting",
    definition:
      "Projected NOI at full lease-up and normalized operating expenses, typically used for new construction and value-add underwriting. CMHC applies market-comparable rents and industry-norm opex to derive the stabilized number.",
    related: ["NOI", "Rental Achievement"],
  },
  {
    term: "Going-in Cap Rate",
    category: "Underwriting",
    definition:
      "Year-1 NOI divided by purchase price or total development cost. Used to benchmark entry yield against market comparables and exit expectations.",
    related: ["Exit Cap Rate", "Stabilized NOI"],
  },
  {
    term: "Exit Cap Rate",
    category: "Underwriting",
    definition:
      "Terminal cap rate assumed at sale/refinance. CMHC typically underwrites exit cap 25–75 bps above going-in cap to stress-test residual loan value.",
    related: ["Going-in Cap Rate"],
  },
  {
    term: "Vacancy Rate",
    category: "Underwriting",
    definition:
      "Percentage of units unoccupied. CMHC uses the CMA-level Rental Market Survey figure with a floor applied even in tight markets.",
    related: ["Rental Market Survey", "Turnover", "CMA"],
  },
  {
    term: "Turnover",
    category: "Underwriting",
    definition:
      "Rate at which tenants leave and units are re-leased within a year. Higher turnover means more frequent re-leasing costs and greater exposure to vacancy.",
    related: ["Vacancy Rate"],
  },
  {
    term: "Lending Value",
    category: "Underwriting",
    definition:
      "The lower of appraised value and cost (for purchases/construction). The denominator in the LTV calculation as applied by CMHC.",
    related: ["Appraised Value", "LTV"],
  },
  {
    term: "Appraised Value",
    category: "Underwriting",
    definition:
      "Third-party appraiser's as-is or as-stabilized value. Mandatory for all CMHC multi-unit applications regardless of deal size (November 2024 policy).",
    related: ["Lending Value", "Phase I ESA"],
  },
  {
    term: "Replacement Reserves",
    category: "Underwriting",
    definition:
      "Annual allowance for capital replacement of major building components (roof, HVAC, elevators, plumbing). CMHC dictates at submission; industry practice is $250–500/unit/year or 2–4% of EGI.",
    related: ["NOI", "EGI"],
  },
  {
    term: "EGI Not Met",
    category: "Underwriting",
    definition:
      "A +0.25% premium surcharge applied when the underwritten EGI does not meet CMHC's market-rent benchmark for the asset. Triggered most commonly on below-market existing rents.",
    related: ["EGI", "Premium Surcharge"],
  },
  {
    term: "Rental Market Survey",
    category: "Underwriting",
    definition:
      "CMHC's annual October survey of vacancy, average rent, turnover, and rental universe across all urban areas with population over 10,000. The authoritative data source for CMHC underwriting.",
    related: ["HMIP", "CMA", "Vacancy Rate"],
  },
  {
    term: "CMA",
    category: "Underwriting",
    definition:
      "Census Metropolitan Area. Statistics Canada's urban-region classification used by CMHC for rent and vacancy benchmarks. Affordability thresholds under MLI Select are set at the CMA level.",
    related: ["Rental Market Survey", "MFI"],
  },
  {
    term: "HMIP",
    category: "Underwriting",
    definition:
      "Housing Market Information Portal. CMHC's interactive data platform with Rental Market Survey, Starts & Completions, Secondary Rental Market Survey, and Seniors Housing Survey at national to neighbourhood level.",
    related: ["Rental Market Survey", "RMS"],
  },
  {
    term: "RMS",
    category: "Underwriting",
    definition:
      "Rental Market Survey. CMHC's flagship annual dataset; see Rental Market Survey.",
    related: ["Rental Market Survey", "HMIP"],
  },

  // INSURANCE & PREMIUM
  {
    term: "CoI",
    category: "Insurance & Premium",
    definition:
      "Certificate of Insurance. The document CMHC issues confirming insurance approval for a multi-unit loan. Since September 2025, CoI transfer between lenders is restricted and lenders must fund at least 80% of approved loans — effectively ending the practice of 'shopping a CoI'.",
    related: ["MULTI-GO", "Approved Lender"],
  },
  {
    term: "Certificate of Insurance",
    category: "Insurance & Premium",
    definition:
      "See CoI — the document issued by CMHC evidencing insurance approval on a multi-unit loan.",
    related: ["CoI"],
  },
  {
    term: "Premium Surcharge",
    category: "Insurance & Premium",
    definition:
      "Additional premium charges layered on top of the base LTV-banded rate. Includes +0.25% per 5 years of amortization beyond 25 (applies to MLI Select since July 14 2025), +1.00% for non-residential components, +0.50% for second mortgages, and +0.25% for EGI Not Met.",
    related: ["Second Mortgage Surcharge", "EGI Not Met"],
  },
  {
    term: "Second Mortgage Surcharge",
    category: "Insurance & Premium",
    definition:
      "A +0.50% premium surcharge when an insured first mortgage carries a second-position loan behind it. Designed to compensate for the added leverage on the property.",
    related: ["Premium Surcharge"],
  },
  {
    term: "MICAT",
    category: "Insurance & Premium",
    definition:
      "Mortgage Insurer Capital Adequacy Test. OSFI's capital rule for mortgage insurers; the January 2026 MICAT revision was the direct rationale for CMHC's July 14, 2025 premium overhaul.",
    related: ["OSFI", "Premium Surcharge"],
  },
  {
    term: "HMIP",
    category: "Insurance & Premium",
    definition:
      "See Underwriting — Housing Market Information Portal.",
    related: ["Rental Market Survey"],
  },

  // CONSTRUCTION
  {
    term: "QS",
    category: "Construction",
    definition:
      "Quantity Surveyor. Independent cost consultant who validates hard and soft cost budgets and certifies construction draws against physical progress. Required on all CMHC-insured construction financings.",
    related: ["Holdback", "Surety Bond"],
  },
  {
    term: "Quantity Surveyor",
    category: "Construction",
    definition:
      "See QS — independent cost consultant who validates construction budgets and draws.",
    related: ["QS"],
  },
  {
    term: "Surety Bond",
    category: "Construction",
    definition:
      "Third-party guarantee covering contractor performance and payment obligations. Mandatory for CMHC-insured construction loans since November 2024; typical cost is 0.5–2.0% of contract value.",
    related: ["QS", "Holdback"],
  },
  {
    term: "Holdback",
    category: "Construction",
    definition:
      "A portion of loan proceeds withheld by the lender until a condition (often rental achievement) is satisfied. For MLI Market Rental construction, CMHC removed the holdback requirement on July 3, 2025 — lenders now advance to 85% without holdback. MLI Select still requires rental achievement holdback under November 2024 policy.",
    related: ["Rental Achievement", "CoI"],
  },
  {
    term: "Rental Achievement",
    category: "Construction",
    definition:
      "The requirement to reach and sustain a specified occupancy at market (or committed) rents for a minimum period before full loan advance or holdback release. Demonstrates the property's ability to carry debt at underwritten NOI.",
    related: ["Holdback", "Stabilized NOI"],
  },
  {
    term: "Phase I ESA",
    category: "Construction",
    definition:
      "Phase I Environmental Site Assessment. Desktop review of historical land use and adjacent-property risks, followed by a site visit. Mandatory for CMHC multi-unit. Triggers a Phase II (intrusive testing) only if red flags are identified.",
    related: ["Appraised Value"],
  },
  {
    term: "NECB",
    category: "Construction",
    definition:
      "National Energy Code for Buildings. Commercial-building energy standard used by CMHC for MLI Select energy scoring on new construction. 2020 edition is the current reference tier (grace period for prior Tier 1 runs to September 30, 2026).",
    related: ["NBC", "MLI Select"],
  },
  {
    term: "NBC",
    category: "Construction",
    definition:
      "National Building Code. Residential-building code; used alongside NECB for MLI Select energy scoring on Part 9 residential buildings. 2020 Tier 1 is the current reference standard.",
    related: ["NECB", "MLI Select"],
  },
  {
    term: "CSA B651",
    category: "Construction",
    definition:
      "Canadian Standards Association standard for accessible design in the built environment. CSA B651:23 is the current reference for MLI Select Level 1 accessibility — 15% of units meeting the standard earns 20 points.",
    related: ["RHFAC", "Accessibility"],
  },
  {
    term: "RHFAC",
    category: "Construction",
    definition:
      "Rick Hansen Foundation Accessibility Certification. Third-party rating of built-environment accessibility used as an alternative accessibility pathway in MLI Select. v4.0 rating 60–79% earns Level 1; Gold (80%+) earns Level 2.",
    related: ["CSA B651"],
  },
  {
    term: "Concrete & Timber",
    category: "Construction",
    definition:
      "The two dominant structural systems in Canadian multi-family new construction. Concrete (cast-in-place, post-tension) for taller buildings; wood-frame and mass timber increasingly common below 12 storeys. Construction type affects premium surcharges, amortization, and Phase I scope.",
  },

  // AFFORDABILITY
  {
    term: "Affordable Unit",
    category: "Affordability",
    definition:
      "A unit rented at or below a CMHC-defined threshold — typically 30% of Median Renter Household Income or a specified percentage of Median Market Rent — and covenanted at that rent for a minimum period. Counts toward MLI Select affordability points.",
    related: ["MFI", "Median Market Rent", "MLI Select"],
  },
  {
    term: "MFI",
    category: "Affordability",
    definition:
      "Median Family Income. Statistics Canada's CMA-level income measure. ACLP requires ≥20% of units at rents affordable to households earning ≤30% of MFI.",
    related: ["Affordable Unit", "ACLP"],
  },
  {
    term: "Median Market Rent",
    category: "Affordability",
    definition:
      "The median rent for comparable units in the CMA per CMHC's Rental Market Survey. Used as the affordability benchmark in some programs.",
    related: ["Rental Market Survey", "Affordable Unit"],
  },
  {
    term: "Non-Residential Component",
    category: "Affordability",
    definition:
      "Any retail, office, or other non-residential space in an otherwise residential building. CMHC applies a +1.00% premium surcharge when non-residential floor area exceeds a threshold.",
    related: ["Premium Surcharge"],
  },

  // PROCESS
  {
    term: "Approved Lender",
    category: "Process",
    definition:
      "A lender formally designated by CMHC to submit and administer insured multi-unit loans. Since September 2024, only approved lenders can submit applications to CMHC; borrowers must select a lender before applying.",
    related: ["MULTI-GO", "CoI"],
  },
  {
    term: "Commitment Letter",
    category: "Process",
    definition:
      "The lender document that sets out the terms of the loan offer subject to conditions. In multi-unit context, typically issued after CMHC's conditional approval and before final funding.",
    related: ["Conditional Approval", "Final Approval"],
  },
  {
    term: "Conditional Approval",
    category: "Process",
    definition:
      "CMHC's interim approval granted subject to satisfaction of listed conditions (appraisal, Phase I, QS, etc.). Precedes final approval and CoI issuance.",
    related: ["Final Approval", "CoI"],
  },
  {
    term: "Final Approval",
    category: "Process",
    definition:
      "CMHC's unconditional approval after all conditions have been satisfied; triggers CoI issuance to the approved lender.",
    related: ["Conditional Approval", "CoI"],
  },
  {
    term: "Funding Date",
    category: "Process",
    definition:
      "The date the lender advances loan proceeds. For construction loans, multiple funding draws occur against QS-certified progress.",
    related: ["Commitment Letter", "QS"],
  },
  {
    term: "Assumption",
    category: "Process",
    definition:
      "Transfer of an existing CMHC-insured loan from seller to qualified buyer, subject to CMHC and lender approval. Preserves the original coupon and insurance terms — a meaningful advantage when in-place rate is below market.",
    related: ["Porting"],
  },
  {
    term: "Porting",
    category: "Process",
    definition:
      "Moving an existing insured loan (and its CoI) between lenders or properties. At renewal the CoI stays with the loan, preserving insurance coverage and premium paid at origination.",
    related: ["Assumption", "CoI"],
  },
  {
    term: "Prepayment",
    category: "Process",
    definition:
      "Paying down principal ahead of schedule. CMHC-insured commercial fixed-rate loans typically carry 'IRD or 3 months interest, whichever is greater'; life-co long-term loans often use yield maintenance.",
    related: ["Takeout"],
  },
  {
    term: "Seasoning",
    category: "Process",
    definition:
      "The period an existing loan has been in place. Relevant for premium-credit calculations on refinances (the credit declines from ~75% in year 1 to 0% after 7 years).",
    related: ["Takeout"],
  },
  {
    term: "Takeout",
    category: "Process",
    definition:
      "The permanent loan that replaces construction financing at completion/stabilization. CMHC insurance on the takeout is typically arranged during construction so that the CoI is ready at stabilization.",
    related: ["Rental Achievement", "Holdback"],
  },
  {
    term: "Interest Reserve",
    category: "Process",
    definition:
      "Funds set aside during construction to cover interest payments before the project generates NOI. Sized to the construction timeline and projected rate path.",
    related: ["Takeout"],
  },
  {
    term: "Stress Test",
    category: "Process",
    definition:
      "A rate-uplift applied to qualifying income in residential underwriting. Does not apply to CMHC multi-family — DCR is computed at the contract rate (or a lender-specified ceiling rate for floating-rate loans).",
    related: ["DCR"],
  },

  // LENDERS
  {
    term: "OSFI",
    category: "Lenders",
    definition:
      "Office of the Superintendent of Financial Institutions. Federal regulator of banks, trust companies, and insurers. Sets MICAT capital rules for mortgage insurers (revised January 2026).",
    related: ["MICAT"],
  },
  {
    term: "Recourse",
    category: "Lenders",
    definition:
      "The lender's ability to pursue borrower personal or corporate assets beyond the pledged collateral. Most CMHC multi-unit loans are full recourse; MLI Select tier 3 (100+ points) grants limited recourse, and non-profit/co-op sponsors more readily obtain recourse reductions.",
    related: ["Full Recourse", "Limited Recourse", "Covenant"],
  },
  {
    term: "Full Recourse",
    category: "Lenders",
    definition:
      "Loan structure where the lender can pursue all borrower assets (guarantors' personal net worth) in default. Standard for MLI Standard and MLI Select tiers 1–2.",
    related: ["Recourse", "Limited Recourse"],
  },
  {
    term: "Limited Recourse",
    category: "Lenders",
    definition:
      "Loan structure where lender recourse is capped — typically to the pledged property plus a specified guarantee percentage. Available under MLI Select tier 3 (100+ points).",
    related: ["Recourse", "Full Recourse"],
  },
  {
    term: "Covenant",
    category: "Lenders",
    definition:
      "A contractual commitment in the loan agreement (e.g., to maintain insurance, deliver operating statements, preserve a property management agreement, or hold minimum liquidity). Breach can trigger default.",
    related: ["Environmental Covenants"],
  },

  // LEGAL
  {
    term: "Rent Control Exemption (Nov 15 2018 ON)",
    category: "Legal",
    definition:
      "Ontario's Residential Tenancies Act rent-increase guideline does not apply to units first occupied after November 15, 2018 — a critical driver of new-construction economics for CMHC-financed Ontario rentals. Guideline-controlled units face a 2.1% cap in 2026 (max 2.5%).",
    related: ["Vacancy Decontrol"],
  },
  {
    term: "TAL",
    category: "Legal",
    definition:
      "Tribunal administratif du logement — Quebec's rental tribunal. Publishes annual recommended rent increases; tenants can contest. New-construction rents are exempt from TAL review for the first 5 years.",
  },
  {
    term: "Vacancy Decontrol",
    category: "Legal",
    definition:
      "The rule (in Ontario, BC post-reset, and several other provinces) that allows landlords to set market rent between tenancies. Existing-tenant increases are guideline-capped; turnover resets to market.",
    related: ["Rent Control Exemption (Nov 15 2018 ON)"],
  },
  {
    term: "LTB",
    category: "Legal",
    definition:
      "Landlord and Tenant Board — Ontario's residential tenancy tribunal. Ontario's Bill 60 (November 2025) shortened arrears timelines and introduced fast-track LTB processes.",
    related: ["Bill 60"],
  },
  {
    term: "Bill 60",
    category: "Legal",
    definition:
      "Ontario's November 2025 amendments to the Residential Tenancies Act and related laws. Shortened arrears notice periods and created fast-track LTB processes — materially improving landlord collection timelines.",
    related: ["LTB"],
  },
  {
    term: "Co-operative Housing",
    category: "Legal",
    definition:
      "Housing owned and operated collectively by residents (members) under a co-op act. Sole eligible borrower type under CHDP. Members pay housing charges rather than rent.",
    related: ["CHDP"],
  },
  {
    term: "Environmental Covenants",
    category: "Legal",
    definition:
      "Loan-agreement clauses requiring borrower compliance with environmental laws, delivery of Phase I/II reports, and remediation of identified contamination. CMHC's environmental-contamination policy was relaxed in June 2024.",
    related: ["Phase I ESA", "Covenant"],
  },
];
