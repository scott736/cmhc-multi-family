import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface LenderRow {
  name: string;
  mua: string;
  growth: string;
  type: string;
  approvalLevel: string;
  specialization: string;
  notes: string;
  tierBucket: "top" | "mid" | "niche";
  typeBucket: "bank" | "monoline" | "trust" | "credit-union" | "insurer" | "advisor";
  geo: string;
}

const ROWS: LenderRow[] = [
  {
    name: "Equitable Bank",
    mua: "$27.5B",
    growth: "+175% since 2021",
    type: "Schedule I bank",
    approvalLevel: "CMHC Direct + Emili",
    specialization: "Large deals, refinance, construction",
    notes: "Largest CMHC multi-unit issuer by volume.",
    tierBucket: "top",
    typeBucket: "bank",
    geo: "National",
  },
  {
    name: "First National",
    mua: "$10–15B",
    growth: "81% CMHC-insured",
    type: "Monoline",
    approvalLevel: "CMHC Direct",
    specialization: "Apartment, self-described #1",
    notes: "Heaviest CMHC-insured apartment lender by mix.",
    tierBucket: "top",
    typeBucket: "monoline",
    geo: "National",
  },
  {
    name: "National Bank",
    mua: "$10–15B",
    growth: "",
    type: "Big 6 bank",
    approvalLevel: "CMHC Direct",
    specialization: "Large cap, QC focus",
    notes: "Strong Quebec franchise.",
    tierBucket: "top",
    typeBucket: "bank",
    geo: "National (QC-heavy)",
  },
  {
    name: "TD Bank",
    mua: "$10–15B",
    growth: "",
    type: "Big 6 bank",
    approvalLevel: "CMHC Direct",
    specialization: "Large cap",
    notes: "",
    tierBucket: "top",
    typeBucket: "bank",
    geo: "National",
  },
  {
    name: "Peoples Trust",
    mua: "$10–15B",
    growth: "$18B+ servicing",
    type: "Trust company",
    approvalLevel: "CMHC Direct",
    specialization: "Construction, refi",
    notes: "Active in construction advances and servicing.",
    tierBucket: "top",
    typeBucket: "trust",
    geo: "National",
  },
  {
    name: "MCAP",
    mua: "—",
    growth: "Canada's largest independent commercial originator",
    type: "Monoline",
    approvalLevel: "CMHC Direct",
    specialization: "Commercial origination, CMHC-dedicated team",
    notes: "Team averages 30+ years CMHC experience.",
    tierBucket: "mid",
    typeBucket: "monoline",
    geo: "National",
  },
  {
    name: "Peakhill Capital",
    mua: "$13.5B+ funded",
    growth: "2,500+ loans; over half MLI Select",
    type: "Monoline",
    approvalLevel: "CMHC Direct",
    specialization: "MLI Select, construction",
    notes: "Heavy MLI Select concentration.",
    tierBucket: "mid",
    typeBucket: "monoline",
    geo: "National",
  },
  {
    name: "Canada ICI",
    mua: "—",
    growth: "",
    type: "Monoline + advisor",
    approvalLevel: "CMHC Direct + Advisor",
    specialization: "Dual lender/advisor",
    notes: "Unique dual role.",
    tierBucket: "mid",
    typeBucket: "advisor",
    geo: "National (Western-heavy)",
  },
  {
    name: "CMLS Financial",
    mua: "—",
    growth: "",
    type: "Monoline",
    approvalLevel: "CMHC Direct",
    specialization: "Commercial and multi-unit",
    notes: "",
    tierBucket: "mid",
    typeBucket: "monoline",
    geo: "National",
  },
  {
    name: "CBRE Capital",
    mua: "—",
    growth: "",
    type: "Bank / advisor hybrid",
    approvalLevel: "CMHC Direct + Brokerage",
    specialization: "Institutional multi-unit",
    notes: "Both approved lender and brokerage designations.",
    tierBucket: "mid",
    typeBucket: "advisor",
    geo: "National",
  },
  {
    name: "Sun Life",
    mua: "$13B+ commercial",
    growth: "",
    type: "Life insurer",
    approvalLevel: "CMHC Direct",
    specialization: "Long-term fixed (15–25 year)",
    notes: "Matches long-duration liabilities.",
    tierBucket: "niche",
    typeBucket: "insurer",
    geo: "National",
  },
  {
    name: "Canada Life",
    mua: "$13B+ commercial",
    growth: "",
    type: "Life insurer",
    approvalLevel: "CMHC Direct",
    specialization: "Long-term fixed (15–25 year)",
    notes: "",
    tierBucket: "niche",
    typeBucket: "insurer",
    geo: "National",
  },
  {
    name: "Manulife",
    mua: "$13B+ commercial",
    growth: "",
    type: "Life insurer",
    approvalLevel: "CMHC Direct",
    specialization: "Long-term fixed (15–25 year)",
    notes: "",
    tierBucket: "niche",
    typeBucket: "insurer",
    geo: "National",
  },
  {
    name: "Credit unions (regional)",
    mua: "—",
    growth: "",
    type: "Credit union",
    approvalLevel: "Via regional centrals (Central 1, CU Central AB)",
    specialization: "Community multi-unit",
    notes: "Access through Central 1 and CU Central of Alberta.",
    tierBucket: "niche",
    typeBucket: "credit-union",
    geo: "Regional",
  },
];

const TYPE_CHIPS: Array<{ value: LenderRow["typeBucket"]; label: string }> = [
  { value: "bank", label: "Bank" },
  { value: "monoline", label: "Monoline" },
  { value: "trust", label: "Trust" },
  { value: "credit-union", label: "Credit union" },
  { value: "insurer", label: "Life insurer" },
  { value: "advisor", label: "Advisor / hybrid" },
];

const TIER_CHIPS: Array<{ value: LenderRow["tierBucket"]; label: string }> = [
  { value: "top", label: "Top 5" },
  { value: "mid", label: "Mid-tier" },
  { value: "niche", label: "Niche / specialty" },
];

type SortKey = "name" | "mua" | "type";

export default function LenderTable() {
  const [query, setQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<Set<LenderRow["typeBucket"]>>(new Set());
  const [tierFilter, setTierFilter] = useState<Set<LenderRow["tierBucket"]>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const filtered = useMemo<LenderRow[]>(() => {
    const q = query.trim().toLowerCase();
    const filteredRows = ROWS.filter((r) => {
      if (typeFilter.size > 0 && !typeFilter.has(r.typeBucket)) return false;
      if (tierFilter.size > 0 && !tierFilter.has(r.tierBucket)) return false;
      if (!q) return true;
      const haystack = `${r.name} ${r.type} ${r.specialization} ${r.notes} ${r.geo}`.toLowerCase();
      return haystack.includes(q);
    });
    const sorted = [...filteredRows].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "type") return a.type.localeCompare(b.type);
      return a.mua.localeCompare(b.mua);
    });
    return sortAsc ? sorted : sorted.reverse();
  }, [query, typeFilter, tierFilter, sortKey, sortAsc]);

  function toggle<T>(set: Set<T>, v: T, setter: (s: Set<T>) => void): void {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setter(next);
  }

  function clickSort(k: SortKey): void {
    if (k === sortKey) setSortAsc(!sortAsc);
    else {
      setSortKey(k);
      setSortAsc(true);
    }
  }

  return (
    <div className="bg-obsidian text-foreground">
      {/* CONTROLS */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-8 lg:px-12 lg:py-10">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Input
              type="search"
              placeholder="Search lender, type, specialization..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-jet"
            />
          </div>

          <div className="mt-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Type
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {TYPE_CHIPS.map((chip) => {
                const on = typeFilter.has(chip.value);
                return (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => toggle(typeFilter, chip.value, setTypeFilter)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      on
                        ? "border-star/60 bg-star/10 text-star"
                        : "border-dark-gray text-muted-foreground hover:border-star/40"
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Volume tier
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {TIER_CHIPS.map((chip) => {
                const on = tierFilter.has(chip.value);
                return (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => toggle(tierFilter, chip.value, setTierFilter)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      on
                        ? "border-star/60 bg-star/10 text-star"
                        : "border-dark-gray text-muted-foreground hover:border-star/40"
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {(typeFilter.size > 0 || tierFilter.size > 0 || query) && (
            <button
              type="button"
              onClick={() => {
                setTypeFilter(new Set());
                setTierFilter(new Set());
                setQuery("");
              }}
              className="mt-4 text-xs text-star hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </section>

      {/* TABLE */}
      <section className="border-b border-dark-gray">
        <div className="container border-l border-r border-dark-gray px-6 py-10 lg:px-12 lg:py-16">
          <div className="overflow-x-auto rounded-lg border border-dark-gray bg-jet">
            <table className="w-full min-w-[1000px] text-sm">
              <thead>
                <tr className="border-b border-dark-gray text-muted-foreground text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left font-medium">
                    <button
                      type="button"
                      onClick={() => clickSort("name")}
                      className={`hover:text-star ${sortKey === "name" ? "text-star" : ""}`}
                    >
                      Lender {sortKey === "name" ? (sortAsc ? "↑" : "↓") : ""}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    <button
                      type="button"
                      onClick={() => clickSort("mua")}
                      className={`hover:text-star ${sortKey === "mua" ? "text-star" : ""}`}
                    >
                      MUA {sortKey === "mua" ? (sortAsc ? "↑" : "↓") : ""}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Growth / scale</th>
                  <th className="px-4 py-3 text-left font-medium">
                    <button
                      type="button"
                      onClick={() => clickSort("type")}
                      className={`hover:text-star ${sortKey === "type" ? "text-star" : ""}`}
                    >
                      Type {sortKey === "type" ? (sortAsc ? "↑" : "↓") : ""}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium">CMHC approval</th>
                  <th className="px-4 py-3 text-left font-medium">Specialization</th>
                  <th className="px-4 py-3 text-left font-medium">Geography</th>
                  <th className="px-4 py-3 text-left font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      No lenders match the current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr
                      key={row.name}
                      className="border-b border-dark-gray/60 last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3">{row.mua}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.growth || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{row.type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.approvalLevel}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.specialization}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{row.geo}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.notes || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Showing {filtered.length} of {ROWS.length} lenders. MUA = Mortgages
            Under Administration. Volume figures are the most recent publicly
            disclosed numbers; growth figures are vs. 2021 baseline where
            available.
          </p>

          <Card className="mt-10 bg-jet border-dark-gray p-6">
            <div className="text-xs uppercase tracking-wide text-star">
              Contact CMHC multi-unit team
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              For questions about specific applications or program fit, the
              approved lender is the first point of contact. CMHC's
              multi-unit team is reachable via{" "}
              <a
                href="https://www.cmhc-schl.gc.ca/"
                className="text-star hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                cmhc-schl.gc.ca
              </a>{" "}
              and through the MULTI-GO submission process managed by the
              lender. Borrower direct submissions are no longer accepted
              (September 2024 policy).
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
