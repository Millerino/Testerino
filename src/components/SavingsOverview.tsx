import { useMemo } from 'react';
import type { Purchase } from '../types';
import { calculateTotals, formatCurrency, ANNUAL_RETURN_RATE } from '../utils/investment';

interface SavingsOverviewProps {
  purchases: Purchase[];
}

export function SavingsOverview({ purchases }: SavingsOverviewProps) {
  const { totalSaved, currentInvestmentValue } = useMemo(
    () => calculateTotals(purchases),
    [purchases]
  );

  const gains = currentInvestmentValue - totalSaved;

  if (purchases.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6 md:p-8 mb-6 text-center">
        <div className="text-sage-400 mb-2">
          <svg
            className="w-12 h-12 mx-auto opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-sage-500 font-light">
          Your savings journey starts here
        </p>
        <p className="text-sage-400 text-sm mt-1">
          Log your first resisted impulse purchase
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-5 md:p-8 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Saved */}
        <div className="text-center md:text-left">
          <p className="text-sage-500 text-sm mb-1">Total Saved</p>
          <p className="text-3xl md:text-4xl font-light text-sage-700">
            {formatCurrency(totalSaved)}
          </p>
          <p className="text-sage-400 text-xs mt-1">
            {purchases.length} {purchases.length === 1 ? 'purchase' : 'purchases'} avoided
          </p>
        </div>

        {/* Investment Value */}
        <div className="text-center md:text-left">
          <p className="text-sage-500 text-sm mb-1">If Invested</p>
          <p className="text-3xl md:text-4xl font-light text-gold-600">
            {formatCurrency(currentInvestmentValue)}
          </p>
          <p className="text-sage-400 text-xs mt-1">
            at {(ANNUAL_RETURN_RATE * 100).toFixed(0)}% annual return
          </p>
        </div>

        {/* Investment Gains */}
        <div className="text-center md:text-left">
          <p className="text-sage-500 text-sm mb-1">Investment Gains</p>
          <p className={`text-3xl md:text-4xl font-light ${gains > 0 ? 'text-green-600' : 'text-sage-600'}`}>
            {gains > 0 ? '+' : ''}{formatCurrency(gains)}
          </p>
          <p className="text-sage-400 text-xs mt-1">
            compound growth to date
          </p>
        </div>
      </div>
    </div>
  );
}
