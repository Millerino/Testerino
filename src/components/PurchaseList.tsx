import { useState } from 'react';
import type { Purchase } from '../types';
import { CATEGORIES } from '../types';
import {
  formatCurrency,
  formatDate,
  calculateFutureValue,
  INVESTMENT_STRATEGIES,
  type StrategyKey,
} from '../utils/investment';

interface PurchaseListProps {
  purchases: Purchase[];
  strategy: StrategyKey;
  onRemove: (id: string) => void;
}

export function PurchaseList({ purchases, strategy, onRemove }: PurchaseListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);

  if (purchases.length === 0) return null;

  const strat = INVESTMENT_STRATEGIES[strategy];
  const effectiveRate = 'useHistorical' in strat && strat.useHistorical
    ? 0.10
    : strat.rate;

  const handleRemove = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      onRemove(id);
      setRemovingId(null);
    }, 200);
  };

  // Sort by date, newest first
  const sortedPurchases = [...purchases].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-sage-700 font-medium">Your Wins</h2>
        <span className="text-sage-400 text-sm">
          {purchases.length} {purchases.length === 1 ? 'item' : 'items'}
        </span>
      </div>
      <div className="space-y-3">
        {sortedPurchases.map(purchase => {
          const isRemoving = removingId === purchase.id;
          const category = purchase.category ? CATEGORIES[purchase.category] : null;

          // Show 5-year projected value (more meaningful than current value for recent purchases)
          const projectedValue5yr = calculateFutureValue(purchase.price, effectiveRate, 5);
          const projectedGain = projectedValue5yr - purchase.price;
          const projectedGainPercent = ((projectedGain / purchase.price) * 100).toFixed(0);

          return (
            <div
              key={purchase.id}
              className={`
                bg-white rounded-xl shadow-sm border border-sage-100 p-4
                transition-all duration-200
                hover:shadow-md hover:border-sage-200
                ${isRemoving ? 'opacity-0 scale-95 -translate-x-4' : 'opacity-100 scale-100'}
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Category & Item */}
                  <div className="flex items-center gap-2 mb-1">
                    {category && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${category.color}20`,
                          color: category.color,
                        }}
                      >
                        {category.emoji} {category.label}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-medium text-sage-700">
                      {purchase.item}
                    </span>
                    <span className="text-sage-500 font-light">
                      {formatCurrency(purchase.price)}
                    </span>
                  </div>

                  <p className="text-sage-400 text-sm mt-1">
                    {formatDate(purchase.date)}
                  </p>

                  {purchase.note && (
                    <p className="text-sage-500 text-sm mt-2 italic bg-cream-50 rounded-lg p-2">
                      "{purchase.note}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* 5-Year Projected Value */}
                  <div className="text-right">
                    <p
                      className="font-medium text-sm"
                      style={{ color: strat.color }}
                    >
                      {formatCurrency(projectedValue5yr)}
                    </p>
                    <p className="text-green-600 text-xs">
                      +{projectedGainPercent}%
                    </p>
                    <p className="text-sage-400 text-xs">
                      in 5 years
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(purchase.id)}
                    className="
                      w-8 h-8 rounded-full bg-cream-100 hover:bg-red-50
                      flex items-center justify-center
                      text-sage-400 hover:text-red-400
                      transition-colors duration-200
                    "
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
