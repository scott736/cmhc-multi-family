import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ProjectType = "new-construction" | "existing" | "refinance";
type Program = "mli-standard" | "mli-select" | "aclp" | "ahf" | "chdp";

interface DocItem {
  key: string;
  name: string;
  description: string;
  projectTypes: ProjectType[];
  programs: Program[];
  category: "Universal" | "Construction" | "Existing" | "Borrower" | "Property" | "Program-specific";
}

const DOCS: DocItem[] = [
  {
    key: "appraisal",
    name: "Appraisal report",
    description: "Required for all deal sizes since November 2024; third-party AACI-designated appraiser.",
    projectTypes: ["new-construction", "existing", "refinance"],
    programs: ["mli-standard", "mli-select", "aclp", "ahf", "chdp"],
    category: "Universal",
  },
  {
    key: "phase-i",
    name: "Phase I Environmental Site Assessment",
    description: "Mandatory; Phase II only if triggered by Phase I findings.",
    projectTypes: ["new-construction", "existing", "refinance"],
    programs: ["mli-standard", "mli-select", "aclp", "ahf", "chdp"],
    category: "Universal",
  },
  {
    key: "title",
    name: "Title commitment / search",
    description: "Current title, encumbrances, easements, and liens.",
    projectTypes: ["new-construction", "existing", "refinance"],
    programs: ["mli-standard", "mli-select", "aclp", "ahf", "chdp"],
    category: "Property",
  },
  {
    key: "insurance",
    name: "Insurance binder",
    description: "All-risk property + commercial GL + rent-loss; course-of-construction for new builds.",
    projectTypes: ["new-construction", "existing", "refinance"],
    programs: ["mli-standard", "mli-select", "aclp", "ahf", "chdp"],
    category: "Universal",
  },
  {
    key: "survey",
    name: "Survey / Real Property Report",
    description: "Required where title insurance is not used; may be waived with current RPR.",
    projectTypes: ["new-construction", "existing", "refinance"],
    programs: ["mli-standard", "mli-select", "aclp", "ahf", "chdp"],
    category: "Property",
  },
  // Borrower financials
  {
    key: "pnw",
    name: "Personal net worth statements",
    description: "For all individuals on covenant (and guarantors).",
    projectTypes: ["new-construction", "existing", "refinance"],
    programs: ["mli-standard", "mli-select", "aclp", "ahf", "chdp"],
    category: "Borrower",
  },
  {
    key: "liquidity",
    name: "Liquidity verification",
    description: "Bank statements / investment statements demonstrating closing funds + reserves.",
    projectTypes: ["new-construction", "existing", "refinance"],
    programs: ["mli-standard", "mli-select", "aclp", "ahf", "chdp"],
    category: "Borrower",
  },
  {
    key: "corp-financials",
    name: "Corporate financials (if corp borrower)",
    description: "3 years of unaudited or review-engagement statements and year-to-date internals.",
    projectTypes: ["new-construction", "existing", "refinance"],
    programs: ["mli-standard", "mli-select", "aclp", "ahf", "chdp"],
    category: "Borrower",
  },
  // Existing property operations
  {
    key: "op-statements",
    name: "3-year operating statements",
    description: "Historical income and expense detail; ties to T776 / tax returns where available.",
    projectTypes: ["existing", "refinance"],
    programs: ["mli-standard", "mli-select", "aclp", "ahf", "chdp"],
    category: "Existing",
  },
  {
    key: "rent-roll",
    name: "Current rent roll + trailing 12",
    description: "Unit-by-unit rent roll with lease term, rent, and concessions; plus monthly T-12.",
    projectTypes: ["existing", "refinance"],
    programs: ["mli-standard", "mli-select", "aclp", "ahf", "chdp"],
    category: "Existing",
  },
  {
    key: "pm-agreement",
    name: "Property management agreement",
    description: "Executed PM contract with scope, fee and term. Required even where self-managed (arms-length equivalent).",
    projectTypes: ["existing", "refinance"],
    programs: ["mli-standard", "mli-select", "aclp", "ahf", "chdp"],
    category: "Property",
  },
  // Construction
  {
    key: "geotech",
    name: "Geotechnical report",
    description: "Soils and foundation bearing conditions; sized to building type.",
    projectTypes: ["new-construction"],
    programs: ["mli-standard", "mli-select", "aclp", "ahf", "chdp"],
    category: "Construction",
  },
  {
    key: "qs",
    name: "Quantity Surveyor report",
    description: "Budget validation and draw certification. Required on all CMHC-insured construction.",
    projectTypes: ["new-construction"],
    programs: ["mli-standard", "mli-select", "aclp", "ahf", "chdp"],
    category: "Construction",
  },
  {
    key: "surety",
    name: "Surety bonding (November 2024)",
    description: "Performance + labour & material payment bonds covering contract value.",
    projectTypes: ["new-construction"],
    programs: ["mli-standard", "mli-select", "aclp", "ahf", "chdp"],
    category: "Construction",
  },
  {
    key: "drawings",
    name: "Architect drawings & specifications",
    description: "Stamped drawings, specs, and schedule supporting cost estimate.",
    projectTypes: ["new-construction"],
    programs: ["mli-standard", "mli-select", "aclp", "ahf", "chdp"],
    category: "Construction",
  },
  {
    key: "env-covenants",
    name: "Environmental covenants",
    description: "Lender covenants requiring compliance with environmental laws and remediation schedules.",
    projectTypes: ["new-construction", "existing", "refinance"],
    programs: ["mli-standard", "mli-select", "aclp", "ahf", "chdp"],
    category: "Property",
  },
  // Program-specific
  {
    key: "affordability-covenant",
    name: "Affordability covenant schedule",
    description: "Rent caps per unit, commitment term (10/20yr), reporting schedule.",
    projectTypes: ["new-construction", "existing", "refinance"],
    programs: ["mli-select", "aclp", "ahf", "chdp"],
    category: "Program-specific",
  },
  {
    key: "energy-report",
    name: "Energy modelling report",
    description: "NECB / NBC modelled performance vs. Tier 1 baseline or, for existing, reduction vs. baseline.",
    projectTypes: ["new-construction", "existing", "refinance"],
    programs: ["mli-select"],
    category: "Program-specific",
  },
  {
    key: "accessibility-report",
    name: "Accessibility design report",
    description: "CSA B651:23 confirmation or RHFAC v4.0 rating.",
    projectTypes: ["new-construction", "existing", "refinance"],
    programs: ["mli-select"],
    category: "Program-specific",
  },
  {
    key: "co-op-governance",
    name: "Co-op governance documentation",
    description: "Incorporation documents, member list, housing charge schedule.",
    projectTypes: ["new-construction", "existing", "refinance"],
    programs: ["chdp"],
    category: "Program-specific",
  },
];

const PROGRAM_LABEL: Record<Program, string> = {
  "mli-standard": "MLI Standard",
  "mli-select": "MLI Select",
  aclp: "ACLP",
  ahf: "AHF",
  chdp: "CHDP",
};

export default function DocChecklist() {
  const [projectType, setProjectType] = useState<ProjectType>("new-construction");
  const [program, setProgram] = useState<Program>("mli-select");
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const filtered = useMemo<DocItem[]>(() => {
    return DOCS.filter(
      (d) => d.projectTypes.includes(projectType) && d.programs.includes(program),
    );
  }, [projectType, program]);

  const grouped = useMemo(() => {
    const out: Record<string, DocItem[]> = {};
    for (const d of filtered) {
      if (!out[d.category]) out[d.category] = [];
      out[d.category].push(d);
    }
    return out;
  }, [filtered]);

  function toggle(key: string): void {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function resetChecks(): void {
    setChecked(new Set());
  }

  function handlePrint(): void {
    if (typeof window !== "undefined") window.print();
  }

  const completedCount = filtered.filter((d) => checked.has(d.key)).length;
  const progressPct = filtered.length === 0 ? 0 : (completedCount / filtered.length) * 100;

  return (
    <div className="bg-obsidian text-foreground">
      {/* HEADER */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-12 lg:px-12 lg:py-16">
          <Badge variant="outline" className="mb-4 border-star/40 text-star">
            Document Checklist
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-5xl">
            Everything CMHC, a lender, and a QS will ask for.
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Filter by project type and program to see the required document set.
            Tick items as they're delivered to track readiness — use the print
            view to export a clean one-pager.
          </p>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-8 lg:px-12 lg:py-12">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-jet border-dark-gray p-6">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Project type
              </Label>
              <Tabs
                value={projectType}
                onValueChange={(v) => setProjectType(v as ProjectType)}
                className="mt-3"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="new-construction">New construction</TabsTrigger>
                  <TabsTrigger value="existing">Existing</TabsTrigger>
                  <TabsTrigger value="refinance">Refinance</TabsTrigger>
                </TabsList>
              </Tabs>
            </Card>

            <Card className="bg-jet border-dark-gray p-6">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Program
              </Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {(Object.keys(PROGRAM_LABEL) as Program[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProgram(p)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      program === p
                        ? "border-star/60 bg-star/10 text-star"
                        : "border-dark-gray text-muted-foreground hover:border-star/40"
                    }`}
                  >
                    {PROGRAM_LABEL[p]}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          <Card className="mt-6 bg-jet border-dark-gray p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Progress
                </div>
                <div className="mt-1 text-lg font-semibold">
                  {completedCount} of {filtered.length} complete
                </div>
              </div>
              <div className="flex gap-2 print:hidden">
                <Button variant="outline" size="sm" onClick={resetChecks}>
                  Reset
                </Button>
                <Button size="sm" onClick={handlePrint}>
                  Print view
                </Button>
              </div>
            </div>
            <div className="mt-3 h-2 w-full rounded bg-obsidian">
              <div
                className="h-2 rounded bg-star transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </Card>
        </div>
      </section>

      {/* CHECKLIST */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-10 lg:px-12 lg:py-16">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No documents match the current filter combination.
            </p>
          ) : (
            <div className="space-y-8">
              {Object.keys(grouped).map((cat) => (
                <div key={cat}>
                  <div className="mb-3 text-xs uppercase tracking-wider text-star">
                    {cat}
                  </div>
                  <div className="grid gap-2">
                    {grouped[cat].map((d) => {
                      const isChecked = checked.has(d.key);
                      return (
                        <Card
                          key={d.key}
                          className="bg-jet border-dark-gray p-4"
                        >
                          <label className="flex cursor-pointer items-start gap-3">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => toggle(d.key)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div
                                className={`text-sm font-medium ${
                                  isChecked ? "text-muted-foreground line-through" : ""
                                }`}
                              >
                                {d.name}
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {d.description}
                              </p>
                            </div>
                          </label>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
