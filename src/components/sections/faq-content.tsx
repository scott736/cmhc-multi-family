import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type QA = { q: string; a: React.ReactNode };
type Section = {
  id: string;
  name: string;
  intro: string;
  items: QA[];
};

const sections: Section[] = [
  {
    id: "program-selection",
    name: "Program selection",
    intro:
      "Which CMHC multi-unit product fits the deal — MLI Standard, MLI Select, ACLP, AHF, CHDP, or a specialized product.",
    items: [
      {
        q: "What's the difference between MLI Select and MLI Standard?",
        a: (
          <>
            MLI Standard is the foundational CMHC multi-unit product —
            up to 85% LTV, market-rate, no affordability commitment
            required. MLI Select is the points-based flagship that scales
            benefits (up to 95% LTC, 50-year amortization, premium
            discounts up to 30%) in exchange for committed affordability,
            energy efficiency, or accessibility. See the{" "}
            <a href="/programs/compare" className="text-star">
              programs compare page
            </a>
            .
          </>
        ),
      },
      {
        q: "Do I need to commit to affordability to use MLI Select?",
        a: (
          <>
            No — affordability is one of three point categories. A project
            can score 50+ points through energy efficiency and
            accessibility without any affordability commitment. In
            practice, affordability is the most common path because the
            points-per-commitment ratio is the most attractive.
          </>
        ),
      },
      {
        q: "Can non-profits use MLI Standard?",
        a: (
          <>
            Yes. MLI Standard is available to for-profit and non-profit
            borrowers alike. Non-profits often layer AHF forgivable loans
            on top; see the{" "}
            <a href="/programs/ahf" className="text-star">
              AHF page
            </a>
            .
          </>
        ),
      },
      {
        q: "Which program has the lowest rate?",
        a: (
          <>
            ACLP (Apartment Construction Loan Program) — CMHC lends
            directly at below-market fixed rates with integrated
            insurance. AHF and CHDP also lend at below-market rates but
            are restricted to non-profit, government, Indigenous, or
            co-op borrowers. For for-profits, MLI Select with Tier 3
            premium discount produces the lowest all-in cost of
            CMHC-insured financing.
          </>
        ),
      },
      {
        q: "What's the fastest CMHC multi-unit product to close?",
        a: (
          <>
            MLI Standard for an existing, occupied property is typically
            the fastest — no affordability or energy scoring review, no
            construction underwriting. MULTI-GO (where eligible) can
            compress underwriting to 10 business days. See the{" "}
            <a href="/programs/application-process" className="text-star">
              application process page
            </a>
            .
          </>
        ),
      },
      {
        q: "Can I use ACLP and AHF together?",
        a: (
          <>
            They can coexist on the same project but are typically
            structured sequentially — ACLP provides construction-phase
            financing, AHF layers forgivable capital that reduces
            long-term debt. The affordability commitment is the deeper
            of the two programs' requirements.
          </>
        ),
      },
      {
        q: "When does MLI Select beat conventional financing?",
        a: (
          <>
            Almost always on purpose-built rental new construction.
            MLI Select Tier 3 pushes permanent equity requirement to
            ~5% of cost (vs ~25% conventional), amortizes 50 years (vs
            25), and produces cash-on-cash returns around 32% in the
            worked example vs ~7% conventional. See the{" "}
            <a href="/developers/economics" className="text-star">
              economics page
            </a>
            .
          </>
        ),
      },
      {
        q: "What's the minimum unit count for CMHC multi-unit?",
        a: (
          <>
            Five self-contained units. Below that the property falls
            under CMHC's small-rental (1–4 unit) products or
            residential insurance rules — different underwriting, different
            premiums.
          </>
        ),
      },
      {
        q: "Is retirement housing eligible for MLI Select?",
        a: (
          <>
            Retirement housing (50+ units/beds) falls under CMHC's
            specialized segment with its own premium schedule (Other
            Shelter Models). MLI Select is available for market rental;
            retirement/supportive/student housing uses different
            scoring and premium grids. See the{" "}
            <a href="/programs/specialized" className="text-star">
              specialized page
            </a>
            .
          </>
        ),
      },
      {
        q: "Can mixed-use (commercial + residential) qualify?",
        a: (
          <>
            Yes, but commercial NOI and area trigger the non-residential
            surcharge (+1.0% on premium) and may require a higher
            minimum DCR. CMHC caps the commercial component; if more
            than ~30% of NOI or area is non-residential, the property
            may not qualify as multi-unit. Confirm with CMHC before
            submission.
          </>
        ),
      },
    ],
  },
  {
    id: "underwriting",
    name: "Underwriting",
    intro:
      "How CMHC sizes loans — DCR, NOI, vacancy assumptions, and the absence of a residential-style stress test.",
    items: [
      {
        q: "What's the minimum DCR?",
        a: (
          <>
            MLI Select uses 1.10 across all tiers. MLI Standard ranges
            from 1.10 (5–6 units purchase) to 1.30 (7+ units with
            terms under 10 years). See the{" "}
            <a href="/underwriting/dcr" className="text-star">
              DCR page
            </a>
            .
          </>
        ),
      },
      {
        q: "Does CMHC stress-test like residential?",
        a: (
          <>
            No. There is no 4.79%/qualifying-rate stress test on
            multi-unit. Fixed-rate loans are DCR'd at the contract
            rate. Floating-rate loans use a lender-specified ceiling
            rate.
          </>
        ),
      },
      {
        q: "Can I use pro forma rent or must I use in-place?",
        a: (
          <>
            For existing buildings, CMHC uses in-place rents adjusted to
            market where achievable. For new construction, market rents
            from the CMA-level Rental Market Survey are the baseline.
            Achievable-rent adjustments require comparable evidence.
          </>
        ),
      },
      {
        q: "How does CMHC treat property management — do I need to hire a third party?",
        a: (
          <>
            CMHC underwrites a property management expense (typically
            3–5% of EGI) even if the owner self-manages. The line is
            deducted in NOI regardless of the actual operating
            structure. See the{" "}
            <a href="/underwriting/opex" className="text-star">
              opex page
            </a>
            .
          </>
        ),
      },
      {
        q: "What vacancy assumption does CMHC use?",
        a: (
          <>
            The CMA-level Rental Market Survey vacancy rate, with a
            floor applied even in tight markets (typically 3–5%). A
            market reporting 0.8% RMS vacancy does not let CMHC
            underwrite 0.8% on the pro forma.
          </>
        ),
      },
      {
        q: "Can I improve my DCR with longer amortization?",
        a: (
          <>
            Yes — longer amortization lowers annual debt service,
            raising DCR at a given loan size. MLI Select Tier 3 supports
            50 years; MLI Standard new construction also supports 50
            years (since June 2024). Remember the amortization
            surcharge (+0.25% per 5yr beyond 25) applies to both
            programs since July 14 2025.
          </>
        ),
      },
      {
        q: "What's my liquidity requirement?",
        a: (
          <>
            CMHC expects the sponsor to maintain working-capital
            liquidity sized to the project's lease-up risk and debt
            service — typically 3–12 months' operating expenses and
            debt service for construction files. Non-construction
            files require documented liquid net worth during
            underwriting.
          </>
        ),
      },
      {
        q: "Will CMHC count foreign income for covenant strength?",
        a: (
          <>
            Foreign income can be considered but is subject to greater
            scrutiny — typically requires audited financials, currency
            of demonstrable convertibility, and demonstrated Canadian
            operating history. Structure reviews for foreign-capital
            deals add underwriting time.
          </>
        ),
      },
      {
        q: "How are construction costs verified?",
        a: (
          <>
            Cost Consultant reports at each draw, QS sign-off where
            applicable, and CMHC's own construction reviewer. Bonding
            is now required (November 2024 policy tightening). See the{" "}
            <a href="/developers/construction" className="text-star">
              construction page
            </a>
            .
          </>
        ),
      },
      {
        q: "What if my NOI comes in below projection post-stabilization?",
        a: (
          <>
            For MLI Select construction, rental achievement holdbacks
            (introduced November 2024) apply — portions of the loan
            release tied to achieving stabilized NOI. If stabilized NOI
            falls short, the holdback is reduced or released against a
            sponsor-funded cash flow reserve.
          </>
        ),
      },
    ],
  },
  {
    id: "premium-costs",
    name: "Premium and costs",
    intro:
      "The CMHC premium structure effective July 14 2025, surcharges, PST treatment, and refund mechanics.",
    items: [
      {
        q: "How is the CMHC premium calculated?",
        a: (
          <>
            Premium is a percentage of the insured loan amount, tiered
            by LTV and transaction type (purchase/refi vs
            construction). Since July 14 2025, pricing is risk-based
            and LTV-tiered; earlier flat-rate grids no longer apply.
            Use the{" "}
            <a href="/calculators/premium" className="text-star">
              premium calculator
            </a>
            .
          </>
        ),
      },
      {
        q: "Is PST on premium capitalizable?",
        a: (
          <>
            No. The premium itself is added to the insured loan
            amount, but PST/QST is a provincial sales tax paid out of
            pocket at closing. Ontario 8%, BC 7%, Saskatchewan 6%,
            Manitoba 7%, Quebec 9.975%, Alberta zero.
          </>
        ),
      },
      {
        q: "What surcharges apply beyond base premium?",
        a: (
          <>
            +0.25% per 5 years of amortization beyond 25 years,
            +1.0% for non-residential income components, +0.5% for
            second-mortgage financing, +0.25% when EGI is not met
            on the target property.
          </>
        ),
      },
      {
        q: "Do I get a premium credit on refinance?",
        a: (
          <>
            Yes — a premium credit can apply when refinancing an
            already-insured property, reducing the additional premium
            owed on the new insured amount. The credit is a function
            of elapsed time and original premium. See the{" "}
            <a href="/calculators/premium-credit" className="text-star">
              premium credit calculator
            </a>
            .
          </>
        ),
      },
      {
        q: "Does the amortization surcharge apply to MLI Select?",
        a: (
          <>
            Yes, since July 14 2025. Prior to that date, MLI Select
            was exempt from the amortization surcharge. The July 14
            2025 premium overhaul brought MLI Select onto the same
            surcharge grid as MLI Standard. See the{" "}
            <a href="/policy" className="text-star">
              policy page
            </a>
            .
          </>
        ),
      },
      {
        q: "What happens if I take second-mortgage financing?",
        a: (
          <>
            A 0.5% surcharge applies to the first-mortgage premium
            when a second mortgage exists on the property. CMHC also
            underwrites the second against the same DCR/LTV
            constraints as the insured loan.
          </>
        ),
      },
      {
        q: "Is CMHC premium refundable if I sell?",
        a: (
          <>
            No. The premium is earned and non-refundable on funding.
            However, a new buyer may be able to assume the
            CMHC-insured mortgage subject to CMHC approval — see the
            assumption question in Lifecycle below.
          </>
        ),
      },
    ],
  },
  {
    id: "process-timing",
    name: "Process and timing",
    intro:
      "From pre-qualification to funding — timelines, lender selection, CoI mechanics, and MULTI-GO.",
    items: [
      {
        q: "How long does CMHC underwriting take?",
        a: (
          <>
            Typical timelines: 60–120 days for standard files, 10–20
            business days via MULTI-GO where eligible, 120+ days for
            complex construction files with scoring review. Lender
            turnaround sits on top of CMHC's review window.
          </>
        ),
      },
      {
        q: "Must I select a lender before applying?",
        a: (
          <>
            Yes — since September 2024, CMHC no longer accepts
            borrower-direct applications. Only approved lenders can
            submit, and the borrower must have a lender commitment
            before CMHC underwriting begins. See the{" "}
            <a href="/lenders" className="text-star">
              lenders page
            </a>
            .
          </>
        ),
      },
      {
        q: "Can I transfer my CoI to a different lender?",
        a: (
          <>
            No — since September 3, 2025, Certificate of Insurance
            transfer between lenders is restricted. Lenders must also
            fund at least 80% of their approved loans. This
            effectively ended the practice of "shopping a CoI" for
            better rates post-approval.
          </>
        ),
      },
      {
        q: "What is MULTI-GO?",
        a: (
          <>
            MULTI-GO is CMHC's expedited underwriting track for
            lower-complexity files meeting defined eligibility
            criteria — condensing the review window to roughly 10
            business days. Not all files qualify; complex
            construction, scoring, or non-standard structures follow
            the full-review track.
          </>
        ),
      },
      {
        q: "Do I need a mortgage broker?",
        a: (
          <>
            Not required, but typical. Commercial mortgage brokers
            (CBRE Capital, JLL, Citifund, KV Capital, Canada ICI) run
            lender tenders, structure scoring optimization, and
            manage the CMHC submission. For large or complex files
            the time saved is material.
          </>
        ),
      },
      {
        q: "What happens if rates change between CoI and funding?",
        a: (
          <>
            The rate on the CoI is typically locked at issuance
            subject to a funding deadline — post-Sep 3 2025, CoI
            transfer restrictions mean repricing to a different
            lender isn't available. If market rates move, the
            lender and borrower negotiate within the CoI framework
            or allow it to expire.
          </>
        ),
      },
    ],
  },
  {
    id: "policy-changes",
    name: "Policy and recent changes",
    intro:
      "The 2024–2026 policy changes that reshape CMHC multi-unit financing.",
    items: [
      {
        q: "What changed in the July 14 2025 premium overhaul?",
        a: (
          <>
            CMHC moved to risk-based, LTV-tiered pricing on both MLI
            Standard and Other Shelter Models, and extended the
            amortization surcharge (+0.25% per 5yr beyond 25) to MLI
            Select. Construction premiums were rationalized against
            purchase/refi. See the{" "}
            <a href="/policy" className="text-star">
              policy timeline
            </a>
            .
          </>
        ),
      },
      {
        q: "What was the November 2024 policy tightening about?",
        a: (
          <>
            Mandatory appraisals for all file sizes, bonding required
            for construction, rental achievement holdbacks introduced
            for MLI Select, accessibility standards updated to CSA
            B651:23 / RHFAC v4.0.
          </>
        ),
      },
      {
        q: "Has the 50-year amortization been affected?",
        a: (
          <>
            No. 50-year amortization remains available for MLI Select
            Tier 3 (100 points) and MLI Standard new construction
            (extended June 2024). The July 14 2025 surcharge changes
            do not remove access — they adjust pricing.
          </>
        ),
      },
      {
        q: "What's the Nov 28 2025 MLI Select refresh?",
        a: (
          <>
            CMHC issued an MLI Select policy refresh effective
            November 28, 2025 with a transition period running to
            September 30, 2026 for projects qualified under prior
            criteria. Projects already in underwriting can complete
            under the prior rules through the transition window.
          </>
        ),
      },
      {
        q: "When does the Nov 2025 energy transition expire?",
        a: (
          <>
            The 2020 NECB/NBC energy-efficiency transition for MLI
            Select scoring has a grace period ending September 30,
            2026. After that date, new files must score against
            2020 NECB/NBC Tier 1 baseline rather than earlier
            references. See the{" "}
            <a href="/policy" className="text-star">
              policy timeline
            </a>
            .
          </>
        ),
      },
    ],
  },
  {
    id: "lifecycle",
    name: "Lifecycle",
    intro:
      "Assumption, portability, prepayment, renewal, and the transferability of affordability commitments.",
    items: [
      {
        q: "Can my buyer assume the mortgage?",
        a: (
          <>
            Yes — CMHC-insured mortgages are generally assumable subject
            to CMHC approval of the assuming party (covenant, experience,
            financial capacity). Assumption avoids a new premium event
            and can materially affect resale value.
          </>
        ),
      },
      {
        q: "Can I port the insurance to another property?",
        a: (
          <>
            No — CMHC multi-unit insurance attaches to the specific
            property. Porting between properties is not available; a
            new property requires new insurance (and a new premium).
          </>
        ),
      },
      {
        q: "What penalty applies if I prepay?",
        a: (
          <>
            Determined by the lender — typically IRD (interest rate
            differential) for fixed-rate loans. CMHC-insured loans
            follow standard commercial prepayment conventions; review
            the commitment carefully.
          </>
        ),
      },
      {
        q: "What happens at renewal?",
        a: (
          <>
            At term maturity, the lender offers renewal terms without
            a new CMHC underwriting cycle (CMHC insurance is for the
            full amortization). A different lender taking the file
            would typically require a new assessment.
          </>
        ),
      },
      {
        q: "Do MLI Select affordability commitments transfer on sale?",
        a: (
          <>
            Yes — affordability commitments attach to the property
            and survive sale. A buyer takes the property subject to
            the remaining commitment term. This affects resale pricing
            and buyer pool.
          </>
        ),
      },
    ],
  },
];

export default function FaqContent() {
  return (
    <div className="space-y-16">
      {sections.map((s) => (
        <div key={s.id} id={s.id} className="scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">
              {s.name}
            </h2>
            <p className="mt-3 max-w-3xl text-muted-foreground">{s.intro}</p>
          </div>
          <Accordion
            type="multiple"
            className="border border-dark-gray bg-jet rounded-lg"
          >
            {s.items.map((item, i) => (
              <AccordionItem
                key={i}
                value={`${s.id}-${i}`}
                className="border-b border-dark-gray last:border-b-0 px-6"
              >
                <AccordionTrigger className="text-left text-base lg:text-lg py-5">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm lg:text-base pb-5">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}
