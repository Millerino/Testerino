import { useState } from 'react';
import type { Purchase } from '../types';
import { formatCurrency, formatDate, yearsBetween, calculateFutureValue, ANNUAL_RETURN_RATE } from '../utils/investment';

interface PurchaseListProps {
  purchases: Purchase[];
  onRemove: (id: string) => void;
}

export function PurchaseList({ purchases, onRemove }: PurchaseListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);

  if (purchases.length === 0) return null;

  const handleRemove = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      onRemove(id);
      setRemovingId(null);
    }, 200);
  };

  return (
    <div className="mb-6">
      <h2 className="text-sage-600 text-sm font-medium mb-3 px-1">
        Your Wins
      </h2>
      <div className="space-y-3">
        {purchases.map(purchase => {
          const years = yearsBetween(purchase.date);
          const investedValue = calculateFutureValue(purchase.price, ANNUAL_RETURN_RATE, years);
          const isRemoving = removingId === purchase.id;

          return (
            <div
              key={purchase.id}
              className={`
                bg-white rounded-xl shadow-sm border border-sage-100 p-4
                transition-all duration-200
                ${isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-medium text-sage-700 truncate">
                      {purchase.item}
                    </span>
                    <span className="text-sage-500 font-light">
                      {formatCurrency(purchase.price)}
                    </span>
                  </div>
                  <p className="text-sage-400 text-sm mt-0.5">
                    {formatDate(purchase.date)}
                  </p>
                  {purchase.note && (
                    <p className="text-sage-500 text-sm mt-2 italic">
                      "{purchase.note}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-gold-600 font-medium text-sm">
                      {formatCurrency(investedValue)}
                    </p>
                    <p className="text-sage-400 text-xs">
                      if invested
                    </p>
                  </div>

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
