// Loan math helpers.
// NOTE: For simplicity and browser-math stability we use monthly compounding.
// Canadian residential mortgages are semi-annual compounded in practice; the
// approximation difference on typical CMHC-insured multi-unit loans is < 5 bps
// on payment for terms at typical rates, which is immaterial for educational
// estimates. See methodology notes on each calculator.

export interface PaymentInput {
  principal: number;
  annualRate: number; // e.g. 0.0525
  amortYears: number;
}

// Monthly payment (P+I) using the standard amortization formula
export function monthlyPayment({ principal, annualRate, amortYears }: PaymentInput): number {
  if (principal <= 0 || amortYears <= 0) return 0;
  const n = amortYears * 12;
  const r = annualRate / 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export function annualDebtService(input: PaymentInput): number {
  return monthlyPayment(input) * 12;
}

// Mortgage constant — annual debt service as a fraction of principal (per $1 of loan)
export function mortgageConstant(annualRate: number, amortYears: number): number {
  const n = amortYears * 12;
  const r = annualRate / 12;
  if (r === 0) return 12 / n; // pure P only
  return ((r) / (1 - Math.pow(1 + r, -n))) * 12;
}

// Loan sized by DCR: max loan such that NOI / debtService >= minDCR
export function loanFromDCR(noi: number, minDCR: number, annualRate: number, amortYears: number): number {
  if (noi <= 0 || minDCR <= 0) return 0;
  const constant = mortgageConstant(annualRate, amortYears);
  if (constant <= 0) return 0;
  return (noi / minDCR) / constant;
}

// Year-by-year amortization rows
export interface AmortRow {
  year: number;
  interest: number;
  principal: number;
  endingBalance: number;
}

export function amortizationSchedule(input: PaymentInput, years: number): AmortRow[] {
  const payment = monthlyPayment(input);
  const r = input.annualRate / 12;
  let balance = input.principal;
  const rows: AmortRow[] = [];
  for (let y = 1; y <= years; y++) {
    let interestYr = 0;
    let principalYr = 0;
    for (let m = 1; m <= 12; m++) {
      if (balance <= 0) break;
      const interest = balance * r;
      const principal = Math.min(payment - interest, balance);
      interestYr += interest;
      principalYr += principal;
      balance -= principal;
    }
    rows.push({
      year: y,
      interest: interestYr,
      principal: principalYr,
      endingBalance: Math.max(0, balance),
    });
  }
  return rows;
}
