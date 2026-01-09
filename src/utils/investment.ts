import type { Purchase, InvestmentProjection } from '../types';

// Conservative annual return rate for S&P 500 index fund (after inflation)
// Historical average is ~7% real return
export const ANNUAL_RETURN_RATE = 0.07;

/**
 * Calculate the future value of a single investment using compound interest
 * Formula: FV = PV * (1 + r)^t
 */
export function calculateFutureValue(
  principal: number,
  annualRate: number,
  years: number
): number {
  return principal * Math.pow(1 + annualRate, years);
}

/**
 * Calculate years between two dates
 */
export function yearsBetween(startDate: string, endDate: Date = new Date()): number {
  const start = new Date(startDate);
  const diffMs = endDate.getTime() - start.getTime();
  return diffMs / (1000 * 60 * 60 * 24 * 365.25);
}

/**
 * Calculate total savings and investment value from purchases
 */
export function calculateTotals(purchases: Purchase[]): {
  totalSaved: number;
  currentInvestmentValue: number;
} {
  const now = new Date();

  let totalSaved = 0;
  let currentInvestmentValue = 0;

  purchases.forEach(purchase => {
    totalSaved += purchase.price;
    const years = yearsBetween(purchase.date, now);
    if (years >= 0) {
      currentInvestmentValue += calculateFutureValue(
        purchase.price,
        ANNUAL_RETURN_RATE,
        years
      );
    }
  });

  return { totalSaved, currentInvestmentValue };
}

/**
 * Generate investment projection data for chart visualization
 * Shows monthly projections from first purchase to 10 years in the future
 */
export function generateProjections(
  purchases: Purchase[],
  yearsIntoFuture: number = 10
): InvestmentProjection[] {
  if (purchases.length === 0) return [];

  // Sort purchases by date
  const sortedPurchases = [...purchases].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const firstPurchaseDate = new Date(sortedPurchases[0].date);
  const now = new Date();
  const endDate = new Date(now);
  endDate.setFullYear(endDate.getFullYear() + yearsIntoFuture);

  const projections: InvestmentProjection[] = [];
  const monthlyRate = Math.pow(1 + ANNUAL_RETURN_RATE, 1/12) - 1;

  // Start from the first purchase date
  let currentDate = new Date(firstPurchaseDate);
  currentDate.setDate(1); // Normalize to first of month

  while (currentDate <= endDate) {
    let principal = 0;
    let value = 0;

    // For each purchase, calculate its contribution
    sortedPurchases.forEach(purchase => {
      const purchaseDate = new Date(purchase.date);
      if (purchaseDate <= currentDate) {
        principal += purchase.price;

        // Calculate months since purchase
        const monthsDiff =
          (currentDate.getFullYear() - purchaseDate.getFullYear()) * 12 +
          (currentDate.getMonth() - purchaseDate.getMonth());

        if (monthsDiff >= 0) {
          value += purchase.price * Math.pow(1 + monthlyRate, monthsDiff);
        }
      }
    });

    if (principal > 0) {
      projections.push({
        date: currentDate.toISOString().slice(0, 7), // YYYY-MM format
        principal,
        value: Math.round(value * 100) / 100,
      });
    }

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return projections;
}

/**
 * Format currency with proper formatting
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
