// CMHC premium calculation logic — July 14, 2025 LTV-tiered grid.
import {
  MLI_STANDARD_PREMIUMS,
  PREMIUM_SURCHARGES,
  MLI_SELECT_DISCOUNTS,
} from "@/data/cmhc";

export type TxType = "purchaseRefi" | "construction";
export type ProgramKind = "mli-standard" | "mli-select";
export type SelectTier = 50 | 70 | 100;

export interface PremiumInput {
  program: ProgramKind;
  txType: TxType;
  loan: number;
  ltv: number; // e.g. 75 meaning 75%
  amortYears: number;
  nonResidentialPct: number; // e.g. 10 meaning 10% non-residential
  secondMortgage: boolean;
  egiNotMetFirstAdvance: boolean; // only applies to construction first advance
  selectTier?: SelectTier;
}

export interface PremiumResult {
  basePct: number;
  amortSurchargePct: number;
  nonResSurchargePct: number;
  secondMortgagePct: number;
  egiSurchargePct: number;
  subtotalPct: number; // before Select discount
  selectDiscountPct: number; // e.g. 0.3 for 30%
  effectivePct: number; // after Select discount
  amount: number; // effective premium $
  band: string;
}

export function getPremiumBand(ltv: number) {
  // Find the smallest band whose maxLtv >= ltv. If above 85%, clamp to top.
  const sorted = [...MLI_STANDARD_PREMIUMS].sort((a, b) => a.maxLtv - b.maxLtv);
  for (const b of sorted) {
    if (ltv <= b.maxLtv) return b;
  }
  return sorted[sorted.length - 1];
}

export function calculatePremium(input: PremiumInput): PremiumResult {
  const band = getPremiumBand(input.ltv);
  const basePct = input.txType === "construction" ? band.construction : band.purchaseRefi;

  // Amortization surcharge: +0.25% per 5 yrs beyond 25 (rounded up on partial bands).
  // Per July 14 2025 this now also applies to MLI Select.
  const amortSurchargePct =
    input.amortYears > 25
      ? Math.ceil((input.amortYears - 25) / 5) * PREMIUM_SURCHARGES.amortizationPer5Years
      : 0;

  // Non-residential surcharge: +1% applied proportionally to non-residential share
  const nonResSurchargePct =
    (PREMIUM_SURCHARGES.nonResidential * (input.nonResidentialPct / 100));

  const secondMortgagePct = input.secondMortgage ? PREMIUM_SURCHARGES.secondMortgage : 0;

  const egiSurchargePct =
    input.txType === "construction" && input.egiNotMetFirstAdvance
      ? PREMIUM_SURCHARGES.egiNotMet
      : 0;

  const subtotalPct =
    basePct +
    amortSurchargePct +
    nonResSurchargePct +
    secondMortgagePct +
    egiSurchargePct;

  let selectDiscountPct = 0;
  if (input.program === "mli-select" && input.selectTier) {
    const tierKey =
      input.selectTier === 100 ? "tier3" : input.selectTier === 70 ? "tier2" : "tier1";
    selectDiscountPct = MLI_SELECT_DISCOUNTS[tierKey].discount;
  }

  const effectivePct = subtotalPct * (1 - selectDiscountPct);
  const amount = input.loan * (effectivePct / 100);

  return {
    basePct,
    amortSurchargePct,
    nonResSurchargePct,
    secondMortgagePct,
    egiSurchargePct,
    subtotalPct,
    selectDiscountPct,
    effectivePct,
    amount,
    band: band.band,
  };
}
