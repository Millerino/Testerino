import { useMemo, useEffect, useState, useRef } from 'react';
import type { Purchase } from '../types';
import {
  calculateTotals,
  formatCurrency,
  INVESTMENT_STRATEGIES,
  type StrategyKey,
} from '../utils/investment';

interface SavingsOverviewProps {
  purchases: Purchase[];
  strategy: StrategyKey;
}

function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const start = previousValue.current;
    const end = value;
    const duration = 800;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeOut;

      setDisplayValue(Math.round(current));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    previousValue.current = value;
  }, [value]);

  return (
    <span>
      {prefix}{formatCurrency(displayValue)}{suffix}
    </span>
  );
}

export function SavingsOverview({ purchases, strategy }: SavingsOverviewProps) {
  const totals = useMemo(
    () => calculateTotals(purchases, strategy),
    [purchases, strategy]
  );

  const strat = INVESTMENT_STRATEGIES[strategy];
  const gains = totals.currentInvestmentValue - totals.totalSaved;
  const gainsPercent = totals.totalSaved > 0
    ? ((gains / totals.totalSaved) * 100).toFixed(1)
    : '0';

  if (purchases.length === 0) {
    return (
      <div className="bg-gradient-to-br from-sage-50 to-cream-100 rounded-2xl shadow-sm border border-sage-100 p-8 md:p-10 mb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sage-100 mb-4">
          <svg
            className="w-8 h-8 text-sage-400"
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
        <h3 className="text-xl font-light text-sage-700 mb-2">
          Start Your Journey
        </h3>
        <p className="text-sage-500 max-w-sm mx-auto">
          Every purchase you resist is a step toward financial freedom. Log your first win below.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-cream-50 rounded-2xl shadow-sm border border-sage-100 p-5 md:p-8 mb-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Total Saved */}
        <div className="bg-white rounded-xl p-5 border border-sage-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-sage-400" />
            <p className="text-sage-500 text-sm">Total Saved</p>
          </div>
          <p className="text-4xl md:text-5xl font-light text-sage-700">
            <AnimatedCounter value={totals.totalSaved} />
          </p>
          <p className="text-sage-400 text-sm mt-2">
            {purchases.length} {purchases.length === 1 ? 'impulse' : 'impulses'} resisted
          </p>
        </div>

        {/* Investment Value */}
        <div
          className="rounded-xl p-5 border"
          style={{
            backgroundColor: `${strat.color}10`,
            borderColor: `${strat.color}30`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: strat.color }}
            />
            <p className="text-sage-500 text-sm">If Invested ({strat.name})</p>
          </div>
          <p
            className="text-4xl md:text-5xl font-light"
            style={{ color: strat.color }}
          >
            <AnimatedCounter value={totals.currentInvestmentValue} />
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                gains >= 0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {gains >= 0 ? '+' : ''}{gainsPercent}%
            </span>
            <span className="text-sage-400 text-sm">
              {gains >= 0 ? '+' : ''}{formatCurrency(gains)} gains
            </span>
          </div>
        </div>
      </div>

      {/* Future Projections */}
      <div className="bg-sage-50 rounded-xl p-4">
        <p className="text-sage-600 text-sm font-medium mb-3">Future Growth Potential</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sage-400 text-xs mb-1">1 Year</p>
            <p className="text-sage-700 font-medium">
              {formatCurrency(totals.projectedValue1yr)}
            </p>
          </div>
          <div className="text-center border-x border-sage-200">
            <p className="text-sage-400 text-xs mb-1">5 Years</p>
            <p className="text-sage-700 font-medium">
              {formatCurrency(totals.projectedValue5yr)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sage-400 text-xs mb-1">10 Years</p>
            <p className="text-gold-600 font-semibold">
              {formatCurrency(totals.projectedValue10yr)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
