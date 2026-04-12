// MLI Select point scoring helpers.
import {
  ACCESSIBILITY_SCORING,
  AFFORDABILITY_BONUS_20YR,
  AFFORDABILITY_SCORING_EXISTING,
  AFFORDABILITY_SCORING_NEW,
  ENERGY_SCORING_EXISTING,
  ENERGY_SCORING_NEW,
  MLI_SELECT_DISCOUNTS,
} from "@/data/cmhc";

export type ProjectType = "new" | "existing";
export type EnergyStandard = "necb" | "nbc";
export type AccessibilityLevel = 0 | 1 | 2;

export interface PointsInput {
  projectType: ProjectType;
  affordabilityUnitPct: number; // % of units committed
  commitment20yr: boolean;
  energyStandard: EnergyStandard; // used only for new construction
  energyValue: number; // percentage - for new: reduction vs standard; for existing: reductionPct
  accessibilityLevel: AccessibilityLevel;
}

export interface PointsBreakdown {
  affordability: number;
  bonus: number;
  energy: number;
  accessibility: number;
  total: number;
  tier: 0 | 50 | 70 | 100;
  tierInfo:
    | (typeof MLI_SELECT_DISCOUNTS)["tier1"]
    | (typeof MLI_SELECT_DISCOUNTS)["tier2"]
    | (typeof MLI_SELECT_DISCOUNTS)["tier3"]
    | null;
}

// Find highest-qualifying level in a sorted-ascending scoring table.
// predicate: returns true if user input meets that level's threshold.
function highestQualifying<T>(levels: readonly T[], predicate: (l: T) => boolean): T | null {
  let match: T | null = null;
  for (const l of levels) {
    if (predicate(l)) match = l;
  }
  return match;
}

export function scoreProject(input: PointsInput): PointsBreakdown {
  // Affordability
  const affTable =
    input.projectType === "new" ? AFFORDABILITY_SCORING_NEW : AFFORDABILITY_SCORING_EXISTING;
  const affMatch = highestQualifying(affTable, (l) => input.affordabilityUnitPct >= l.unitPct);
  const affordability = affMatch?.points ?? 0;

  // 20-yr bonus only applies when some affordability points earned
  const bonus = affordability > 0 && input.commitment20yr ? AFFORDABILITY_BONUS_20YR : 0;

  // Energy
  let energy = 0;
  if (input.projectType === "new") {
    const match = highestQualifying(ENERGY_SCORING_NEW, (l) => {
      const threshold = input.energyStandard === "necb" ? l.necb : l.nbc;
      return input.energyValue >= threshold;
    });
    energy = match?.points ?? 0;
  } else {
    const match = highestQualifying(
      ENERGY_SCORING_EXISTING,
      (l) => input.energyValue >= l.reductionPct,
    );
    energy = match?.points ?? 0;
  }

  // Accessibility
  let accessibility = 0;
  if (input.accessibilityLevel === 1) accessibility = ACCESSIBILITY_SCORING[0].points;
  if (input.accessibilityLevel === 2) accessibility = ACCESSIBILITY_SCORING[1].points;

  const total = affordability + bonus + energy + accessibility;

  let tier: 0 | 50 | 70 | 100 = 0;
  let tierInfo: PointsBreakdown["tierInfo"] = null;
  if (total >= 100) {
    tier = 100;
    tierInfo = MLI_SELECT_DISCOUNTS.tier3;
  } else if (total >= 70) {
    tier = 70;
    tierInfo = MLI_SELECT_DISCOUNTS.tier2;
  } else if (total >= 50) {
    tier = 50;
    tierInfo = MLI_SELECT_DISCOUNTS.tier1;
  }

  return { affordability, bonus, energy, accessibility, total, tier, tierInfo };
}
