import { type ReactElement, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type PropertyType =
  | "purpose-built-rental"
  | "condo"
  | "retirement"
  | "student"
  | "supportive"
  | "sro"
  | "co-op"
  | "mixed-use";

type UnitCount = "1-4" | "5-6" | "7+";
type ConstructionStatus =
  | "new-construction"
  | "existing"
  | "refinance"
  | "construction-to-term";
type BorrowerType = "for-profit" | "non-profit" | "government" | "indigenous" | "co-op";
type YesNo = "yes" | "no";
type Market = "urban-cma" | "rural";

interface Answers {
  propertyType: PropertyType | null;
  unitCount: UnitCount | null;
  constructionStatus: ConstructionStatus | null;
  borrowerType: BorrowerType | null;
  affordability: YesNo | null;
  energy: YesNo | null;
  accessibility: YesNo | null;
  market: Market | null;
}

const INITIAL: Answers = {
  propertyType: null,
  unitCount: null,
  constructionStatus: null,
  borrowerType: null,
  affordability: null,
  energy: null,
  accessibility: null,
  market: null,
};

const TOTAL_STEPS = 8;

interface Option<T> {
  value: T;
  label: string;
  hint?: string;
}

const PROPERTY_OPTIONS: Option<PropertyType>[] = [
  { value: "purpose-built-rental", label: "Purpose-built rental", hint: "5+ self-contained rental units, long-term tenancy." },
  { value: "condo", label: "Condominium", hint: "Individually titled units — generally not insurable." },
  { value: "retirement", label: "Retirement", hint: "50+ units/beds with meal and care packages." },
  { value: "student", label: "Student housing", hint: "Purpose-built student accommodation." },
  { value: "supportive", label: "Supportive housing", hint: "On-site social-support services." },
  { value: "sro", label: "Single-room occupancy", hint: "Rooming house / SRO." },
  { value: "co-op", label: "Housing co-operative", hint: "Owned and operated by members." },
  { value: "mixed-use", label: "Mixed-use", hint: "Residential over non-residential (retail/office)." },
];

const UNIT_OPTIONS: Option<UnitCount>[] = [
  { value: "1-4", label: "1 – 4 units", hint: "Residential, not multi-unit." },
  { value: "5-6", label: "5 – 6 units", hint: "Small multi — lower DCR floor (1.10–1.20)." },
  { value: "7+", label: "7 + units", hint: "Standard multi — DCR 1.20–1.30." },
];

const CONSTRUCTION_OPTIONS: Option<ConstructionStatus>[] = [
  { value: "new-construction", label: "New construction", hint: "Ground-up development." },
  { value: "existing", label: "Existing property", hint: "In-place income, purchase or refi." },
  { value: "refinance", label: "Refinance", hint: "Existing CMHC or conventional refi." },
  { value: "construction-to-term", label: "Construction-to-term", hint: "Single closing through stabilization." },
];

const BORROWER_OPTIONS: Option<BorrowerType>[] = [
  { value: "for-profit", label: "For-profit" },
  { value: "non-profit", label: "Non-profit" },
  { value: "government", label: "Government / municipal" },
  { value: "indigenous", label: "Indigenous borrower" },
  { value: "co-op", label: "Housing co-operative" },
];

const YES_NO: Option<YesNo>[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const MARKET_OPTIONS: Option<Market>[] = [
  { value: "urban-cma", label: "Urban (within a CMA)" },
  { value: "rural", label: "Rural / outside a CMA" },
];

interface Recommendation {
  program: string;
  slug: string;
  score: number;
  rationale: string[];
}

function computeRecommendations(a: Answers): Recommendation[] {
  const recs: Recommendation[] = [];

  // Knock-outs first
  if (a.propertyType === "condo") {
    return [];
  }
  if (a.unitCount === "1-4") {
    return [];
  }

  // CHDP — co-op only
  if (a.borrowerType === "co-op" || a.propertyType === "co-op") {
    const rationale = ["Housing co-operatives qualify for CHDP's forgivable + repayable loan up to 100% of costs."];
    if (a.affordability === "yes") rationale.push("Affordability commitment fits CHDP requirements.");
    recs.push({
      program: "CHDP",
      slug: "chdp",
      score: 95,
      rationale,
    });
  }

  // AHF — non-profit / government / Indigenous
  if (
    (a.borrowerType === "non-profit" ||
      a.borrowerType === "government" ||
      a.borrowerType === "indigenous") &&
    a.affordability === "yes"
  ) {
    recs.push({
      program: "AHF",
      slug: "ahf",
      score: 90,
      rationale: [
        "Non-profit / government / Indigenous borrowers with a deep affordability commitment unlock the $25–75K/unit forgivable component.",
        "Combined repayable + forgivable advance can reach 95%+ of eligible costs.",
      ],
    });
  }

  // ACLP — new construction with 20%+ affordability
  if (
    (a.constructionStatus === "new-construction" ||
      a.constructionStatus === "construction-to-term") &&
    a.affordability === "yes"
  ) {
    recs.push({
      program: "ACLP",
      slug: "aclp",
      score: 85,
      rationale: [
        "Purpose-built rental construction with ≥20% of units at or below 30% MFI qualifies for ACLP's CMHC-direct below-market rate.",
        "Up to 100% of residential cost, 50-year amortization.",
      ],
    });
  }

  // Specialized asset class
  if (
    a.propertyType === "retirement" ||
    a.propertyType === "student" ||
    a.propertyType === "supportive" ||
    a.propertyType === "sro"
  ) {
    recs.push({
      program: "Specialized (Other Shelter Models)",
      slug: "specialized",
      score: 80,
      rationale: [
        "Retirement / student / supportive / SRO assets underwrite on CMHC's Other Shelter Models premium schedule (materially higher than standard).",
        "Typical max 40-year amortization; premium range 6.3–8.75%.",
      ],
    });
  }

  // MLI Select — if any commitment or if for-profit with appetite
  const selectEligibleTypes: PropertyType[] = [
    "purpose-built-rental",
    "mixed-use",
    "co-op",
  ];
  if (a.propertyType && selectEligibleTypes.includes(a.propertyType)) {
    const hasCommitment =
      a.affordability === "yes" || a.energy === "yes" || a.accessibility === "yes";
    if (hasCommitment) {
      const points: string[] = [];
      if (a.affordability === "yes")
        points.push("Affordability points: 10% of units = 50 pts (+30 bonus for 20-year commitment).");
      if (a.energy === "yes")
        points.push("Energy points: up to 50 pts if exceeding NECB/NBC Tier 1 materially.");
      if (a.accessibility === "yes")
        points.push("Accessibility points: 15% CSA B651:23 or RHFAC Gold = 20–30 pts.");
      recs.push({
        program: "MLI Select",
        slug: "mli-select",
        score: 92,
        rationale: [
          "Commitments trigger MLI Select tier eligibility (50 / 70 / 100 points).",
          "Benefits scale: up to 95% LTV, 50-yr amortization, DCR 1.10, 10–30% premium discount.",
          ...points,
        ],
      });
    }
  }

  // MLI Standard — always on the table for 5+ rental if commitments are not desired
  if (
    (a.propertyType === "purpose-built-rental" ||
      a.propertyType === "mixed-use") &&
    (a.unitCount === "5-6" || a.unitCount === "7+")
  ) {
    const rationale = [
      "No affordability / energy / accessibility commitments required.",
      "Up to 85% LTV, 40-year amortization existing / 50-year new construction.",
    ];
    if (a.unitCount === "5-6") {
      rationale.push(
        "5–6 units: lower DCR floor (1.10 purchase / 1.20 refinance).",
      );
    } else {
      rationale.push(
        "7+ units: minimum DCR 1.20 (≥10-year term) or 1.30 (<10-year term).",
      );
    }
    recs.push({
      program: "MLI Standard",
      slug: "mli-standard",
      score: a.affordability === "no" && a.energy === "no" && a.accessibility === "no" ? 82 : 70,
      rationale,
    });
  }

  // Sort descending by score, dedupe by slug
  const seen = new Set<string>();
  return recs
    .sort((x, y) => y.score - x.score)
    .filter((r) => {
      if (seen.has(r.slug)) return false;
      seen.add(r.slug);
      return true;
    });
}

export default function EligibilityTree() {
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<Answers>(INITIAL);

  const recs = useMemo(() => computeRecommendations(answers), [answers]);

  const ineligibleReason = useMemo(() => {
    if (answers.propertyType === "condo")
      return "Condominium units are individually titled and generally not eligible for CMHC multi-unit insurance. CMHC multi-unit requires a single title holding ≥5 self-contained rental units.";
    if (answers.unitCount === "1-4")
      return "CMHC multi-unit programs require at least 5 self-contained rental units. Buildings with 1–4 units underwrite on CMHC's residential-side products instead.";
    return null;
  }, [answers.propertyType, answers.unitCount]);

  function setAnswer<K extends keyof Answers>(key: K, value: Answers[K]): void {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setStep((s) => Math.min(s + 1, TOTAL_STEPS + 1));
  }

  function reset(): void {
    setAnswers(INITIAL);
    setStep(1);
  }

  function back(): void {
    setStep((s) => Math.max(1, s - 1));
  }

  const progress = Math.min(((step - 1) / TOTAL_STEPS) * 100, 100);

  function renderOptions<T extends string>(
    options: Option<T>[],
    current: T | null,
    onSelect: (v: T) => void,
  ): ReactElement {
    return (
      <div className="mt-4 grid gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={`rounded border px-4 py-3 text-left text-sm transition-colors ${
              current === opt.value
                ? "border-star/60 bg-star/5 text-foreground"
                : "border-dark-gray hover:border-star/40"
            }`}
          >
            <div className="font-medium">{opt.label}</div>
            {opt.hint ? (
              <div className="mt-1 text-xs text-muted-foreground">{opt.hint}</div>
            ) : null}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-obsidian text-foreground">
      {/* HEADER */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Eligibility Pre-Qualifier
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Find the right CMHC program in 8 questions.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Step through property type, unit count, construction status,
            borrower profile and commitment appetite. The recommender
            returns a ranked short-list of programs with the rationale and
            the binding constraints to watch for.
          </p>
        </div>
      </section>

      {/* WIZARD */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <Card className="bg-jet border-dark-gray p-6">
              {/* Progress */}
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {step > TOTAL_STEPS ? "Complete" : `Step ${step} of ${TOTAL_STEPS}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(progress)}%
                </div>
              </div>
              <div className="mt-2 h-1.5 w-full rounded bg-obsidian">
                <div
                  className="h-1.5 rounded bg-star transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Steps */}
              <div className="mt-6">
                {step === 1 && (
                  <div>
                    <Label className="text-sm font-semibold">Property type</Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Which describes the asset?
                    </p>
                    {renderOptions(PROPERTY_OPTIONS, answers.propertyType, (v) =>
                      setAnswer("propertyType", v),
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <Label className="text-sm font-semibold">Unit count</Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Self-contained residential units.
                    </p>
                    {renderOptions(UNIT_OPTIONS, answers.unitCount, (v) =>
                      setAnswer("unitCount", v),
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <Label className="text-sm font-semibold">Construction status</Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Where is the project in its lifecycle?
                    </p>
                    {renderOptions(CONSTRUCTION_OPTIONS, answers.constructionStatus, (v) =>
                      setAnswer("constructionStatus", v),
                    )}
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <Label className="text-sm font-semibold">Borrower type</Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      The owner entity taking the loan.
                    </p>
                    {renderOptions(BORROWER_OPTIONS, answers.borrowerType, (v) =>
                      setAnswer("borrowerType", v),
                    )}
                  </div>
                )}

                {step === 5 && (
                  <div>
                    <Label className="text-sm font-semibold">
                      Willing to commit to affordability?
                    </Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      At least 10–25% of units at regulated affordable rents for
                      a minimum term (typically 10–20 years).
                    </p>
                    {renderOptions(YES_NO, answers.affordability, (v) =>
                      setAnswer("affordability", v),
                    )}
                  </div>
                )}

                {step === 6 && (
                  <div>
                    <Label className="text-sm font-semibold">
                      Willing to commit to energy efficiency upgrades?
                    </Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Exceed NECB/NBC Tier 1 by 20–70% (new) or achieve 15–40%
                      reduction vs. baseline (existing).
                    </p>
                    {renderOptions(YES_NO, answers.energy, (v) => setAnswer("energy", v))}
                  </div>
                )}

                {step === 7 && (
                  <div>
                    <Label className="text-sm font-semibold">
                      Accessibility commitments possible?
                    </Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      At least 15% CSA B651:23-compliant units, universal design,
                      or RHFAC rated ≥60%.
                    </p>
                    {renderOptions(YES_NO, answers.accessibility, (v) =>
                      setAnswer("accessibility", v),
                    )}
                  </div>
                )}

                {step === 8 && (
                  <div>
                    <Label className="text-sm font-semibold">Geographic market</Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      CMA-based deals typically execute faster; rural deals face
                      thinner lender pools.
                    </p>
                    {renderOptions(MARKET_OPTIONS, answers.market, (v) =>
                      setAnswer("market", v),
                    )}
                  </div>
                )}

                {step > TOTAL_STEPS && (
                  <div>
                    <Label className="text-sm font-semibold">All answered</Label>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Review the recommendations on the right. Use Back to adjust
                      any answer or Start over to clear.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between gap-2">
                <Button variant="outline" size="sm" onClick={back} disabled={step === 1}>
                  Back
                </Button>
                <Button variant="outline" size="sm" onClick={reset}>
                  Start over
                </Button>
              </div>
            </Card>

            {/* OUTPUT */}
            <div className="space-y-4">
              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Recommendations
                </div>

                {ineligibleReason ? (
                  <div className="mt-4 rounded border border-dark-gray bg-obsidian p-4 text-sm">
                    <div className="text-star font-medium">Not CMHC multi-unit eligible</div>
                    <p className="mt-2 text-muted-foreground">{ineligibleReason}</p>
                  </div>
                ) : recs.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Answer the first few questions to see ranked program options.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {recs.map((r) => (
                      <div
                        key={r.slug}
                        className="rounded border border-dark-gray bg-obsidian p-4"
                      >
                        <div className="flex items-center justify-between">
                          <a
                            href={`/programs/${r.slug}`}
                            className="text-lg font-semibold text-foreground hover:text-star"
                          >
                            {r.program}
                          </a>
                          <Badge className="bg-star/15 text-star border border-star/40">
                            Fit {r.score}
                          </Badge>
                        </div>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                          {r.rationale.map((line, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="mt-1.5 block size-1 shrink-0 rounded-full bg-star" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {(answers.unitCount === "5-6" || answers.unitCount === "7+") && (
                <Card className="bg-jet border-dark-gray p-6">
                  <div className="text-xs uppercase tracking-wide text-star">
                    Flag — DCR floors
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {answers.unitCount === "5-6"
                      ? "5–6 unit buildings underwrite to DCR 1.10 (purchase) or 1.20 (refinance) under MLI Standard — a lower floor than the 7+ segment."
                      : "7+ unit buildings carry stricter DCR floors of 1.20 (term ≥10yr) or 1.30 (term <10yr) under MLI Standard. MLI Select is flat 1.10 regardless of unit count."}
                  </p>
                </Card>
              )}

              <Card className="bg-jet border-dark-gray p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Next step
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Once you have a shortlist, score commitments in the MLI Select
                  point scorer and size the loan against DCR / LTV / program cap.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <a href="/calculators/point-scorer" className="text-star hover:underline">
                    Open point scorer →
                  </a>
                  <a href="/calculators/loan-sizer" className="text-star hover:underline">
                    Open loan sizer →
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
