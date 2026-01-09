import type { Purchase, InvestmentProjection } from '../types';

// Historical annual returns data (total returns including dividends)
export const HISTORICAL_RETURNS: Record<string, Record<number, number>> = {
  'sp500': {
    2020: 0.1840,
    2021: 0.2854,
    2022: -0.1825,
    2023: 0.2630,
    2024: 0.2500,
    2025: 0.1639,
  },
  'nasdaq': {
    2020: 0.4392,
    2021: 0.2139,
    2022: -0.3310,
    2023: 0.4342,
    2024: 0.2864,
    2025: 0.2036,
  },
  'nasdaq100': {
    2020: 0.4863,
    2021: 0.2751,
    2022: -0.3238,
    2023: 0.5513,
    2024: 0.2588,
    2025: 0.2102,
  },
};

// Investment strategy presets
export const INVESTMENT_STRATEGIES = {
  conservative: {
    name: 'Conservative',
    description: 'Bonds & stable assets',
    rate: 0.04,
    color: '#7a8f7a',
  },
  moderate: {
    name: 'Moderate',
    description: 'Balanced portfolio',
    rate: 0.07,
    color: '#5f9ea0',
  },
  sp500: {
    name: 'S&P 500',
    description: 'Historical avg ~10%',
    rate: 0.10,
    color: '#c4956a',
  },
  aggressive: {
    name: 'Aggressive',
    description: 'Growth-focused',
    rate: 0.12,
    color: '#d4746a',
  },
  historical_sp500: {
    name: 'S&P 500 (Actual)',
    description: 'Real historical returns',
    rate: 0, // Uses actual data
    color: '#4a90d9',
    useHistorical: true,
    index: 'sp500',
  },
  historical_nasdaq: {
    name: 'NASDAQ (Actual)',
    description: 'Real historical returns',
    rate: 0,
    color: '#9b59b6',
    useHistorical: true,
    index: 'nasdaq',
  },
} as const;

export type StrategyKey = keyof typeof INVESTMENT_STRATEGIES;

/**
 * Calculate future value with fixed annual rate
 */
export function calculateFutureValue(
  principal: number,
  annualRate: number,
  years: number
): number {
  return principal * Math.pow(1 + annualRate, years);
}

/**
 * Calculate value using actual historical returns year by year
 */
export function calculateHistoricalValue(
  principal: number,
  startDate: string,
  endDate: Date,
  indexKey: string
): number {
  const returns = HISTORICAL_RETURNS[indexKey];
  if (!returns) return principal;

  const start = new Date(startDate);
  const startYear = start.getFullYear();
  const endYear = endDate.getFullYear();

  let value = principal;

  // Apply returns year by year
  for (let year = startYear; year <= endYear; year++) {
    const yearReturn = returns[year];
    if (yearReturn !== undefined) {
      // For partial years, prorate the return
      let fraction = 1;

      if (year === startYear) {
        const daysInYear = (year % 4 === 0) ? 366 : 365;
        const dayOfYear = Math.floor((start.getTime() - new Date(year, 0, 1).getTime()) / (1000 * 60 * 60 * 24));
        fraction = (daysInYear - dayOfYear) / daysInYear;
      }

      if (year === endYear) {
        const daysInYear = (year % 4 === 0) ? 366 : 365;
        const dayOfYear = Math.floor((endDate.getTime() - new Date(year, 0, 1).getTime()) / (1000 * 60 * 60 * 24));
        fraction = Math.min(fraction, dayOfYear / daysInYear);
      }

      value *= (1 + yearReturn * fraction);
    }
  }

  return value;
}

/**
 * Years between two dates
 */
export function yearsBetween(startDate: string, endDate: Date = new Date()): number {
  const start = new Date(startDate);
  const diffMs = endDate.getTime() - start.getTime();
  return diffMs / (1000 * 60 * 60 * 24 * 365.25);
}

/**
 * Calculate totals with strategy support
 */
export function calculateTotals(
  purchases: Purchase[],
  strategy: StrategyKey = 'moderate'
): {
  totalSaved: number;
  currentInvestmentValue: number;
  projectedValue1yr: number;
  projectedValue5yr: number;
  projectedValue10yr: number;
} {
  const now = new Date();
  const strat = INVESTMENT_STRATEGIES[strategy];

  let totalSaved = 0;
  let currentInvestmentValue = 0;

  purchases.forEach(purchase => {
    totalSaved += purchase.price;
    const years = yearsBetween(purchase.date, now);

    if (years >= 0) {
      if ('useHistorical' in strat && strat.useHistorical && strat.index) {
        currentInvestmentValue += calculateHistoricalValue(
          purchase.price,
          purchase.date,
          now,
          strat.index
        );
      } else {
        currentInvestmentValue += calculateFutureValue(
          purchase.price,
          strat.rate,
          years
        );
      }
    }
  });

  // Calculate projections using the strategy rate (or average for historical)
  const effectiveRate = 'useHistorical' in strat && strat.useHistorical
    ? 0.10 // Use 10% for future projections of historical strategies
    : strat.rate;

  const projectedValue1yr = currentInvestmentValue * Math.pow(1 + effectiveRate, 1);
  const projectedValue5yr = currentInvestmentValue * Math.pow(1 + effectiveRate, 5);
  const projectedValue10yr = currentInvestmentValue * Math.pow(1 + effectiveRate, 10);

  return {
    totalSaved,
    currentInvestmentValue,
    projectedValue1yr,
    projectedValue5yr,
    projectedValue10yr,
  };
}

/**
 * Generate projections with strategy and time horizon support
 */
export function generateProjections(
  purchases: Purchase[],
  strategy: StrategyKey = 'moderate',
  yearsIntoFuture: number = 10
): InvestmentProjection[] {
  if (purchases.length === 0) return [];

  const strat = INVESTMENT_STRATEGIES[strategy];
  const sortedPurchases = [...purchases].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const firstPurchaseDate = new Date(sortedPurchases[0].date);
  const now = new Date();
  const endDate = new Date(now);
  endDate.setFullYear(endDate.getFullYear() + yearsIntoFuture);

  const projections: InvestmentProjection[] = [];

  // Use effective rate for calculations
  const effectiveRate = 'useHistorical' in strat && strat.useHistorical
    ? 0.10
    : strat.rate;

  const monthlyRate = Math.pow(1 + effectiveRate, 1/12) - 1;

  let currentDate = new Date(firstPurchaseDate);
  currentDate.setDate(1);

  while (currentDate <= endDate) {
    let principal = 0;
    let value = 0;

    sortedPurchases.forEach(purchase => {
      const purchaseDate = new Date(purchase.date);
      if (purchaseDate <= currentDate) {
        principal += purchase.price;

        // For historical strategy and past dates, use historical returns
        if ('useHistorical' in strat && strat.useHistorical && strat.index && currentDate <= now) {
          value += calculateHistoricalValue(
            purchase.price,
            purchase.date,
            currentDate,
            strat.index
          );
        } else {
          const monthsDiff =
            (currentDate.getFullYear() - purchaseDate.getFullYear()) * 12 +
            (currentDate.getMonth() - purchaseDate.getMonth());

          if (monthsDiff >= 0) {
            value += purchase.price * Math.pow(1 + monthlyRate, monthsDiff);
          }
        }
      }
    });

    if (principal > 0) {
      projections.push({
        date: currentDate.toISOString().slice(0, 7),
        principal,
        value: Math.round(value * 100) / 100,
      });
    }

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return projections;
}

/**
 * Generate comparison data for multiple strategies
 */
export function generateStrategyComparison(
  purchases: Purchase[],
  strategies: StrategyKey[],
  yearsIntoFuture: number = 10
): Record<StrategyKey, InvestmentProjection[]> {
  const result: Partial<Record<StrategyKey, InvestmentProjection[]>> = {};

  strategies.forEach(strategy => {
    result[strategy] = generateProjections(purchases, strategy, yearsIntoFuture);
  });

  return result as Record<StrategyKey, InvestmentProjection[]>;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(0)}%`;
}
