import { useState } from 'react';
import {
  INVESTMENT_STRATEGIES,
  type StrategyKey,
  formatPercent,
} from '../utils/investment';

interface StrategySelectorProps {
  selectedStrategy: StrategyKey;
  customRate: number;
  onStrategyChange: (strategy: StrategyKey) => void;
  onCustomRateChange: (rate: number) => void;
}

export function StrategySelector({
  selectedStrategy,
  customRate,
  onStrategyChange,
  onCustomRateChange,
}: StrategySelectorProps) {
  const [showCustom, setShowCustom] = useState(false);

  const strategies = Object.entries(INVESTMENT_STRATEGIES) as [StrategyKey, typeof INVESTMENT_STRATEGIES[StrategyKey]][];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-5 md:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sage-700 font-medium">Investment Strategy</h2>
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="text-sm text-sage-500 hover:text-sage-700 transition-colors"
        >
          {showCustom ? 'Show presets' : 'Custom rate'}
        </button>
      </div>

      {showCustom ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-sage-500 mb-2">
              Custom Annual Return Rate
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="30"
                value={customRate * 100}
                onChange={(e) => onCustomRateChange(parseInt(e.target.value) / 100)}
                className="flex-1 h-2 bg-sage-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
              />
              <div className="w-20 text-center">
                <span className="text-2xl font-light text-sage-700">
                  {(customRate * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-sage-400">
            Historical S&P 500 averages ~10% annually. Be realistic with your expectations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {strategies.map(([key, strategy]) => {
            const isSelected = selectedStrategy === key;
            const isHistorical = 'useHistorical' in strategy && strategy.useHistorical;

            return (
              <button
                key={key}
                onClick={() => onStrategyChange(key)}
                className={`
                  relative p-3 rounded-xl border-2 text-left transition-all duration-200
                  ${isSelected
                    ? 'border-sage-500 bg-sage-50 shadow-sm'
                    : 'border-sage-100 hover:border-sage-300 hover:bg-cream-100'
                  }
                `}
              >
                {isHistorical && (
                  <span className="absolute -top-2 -right-2 bg-gold-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Real
                  </span>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: strategy.color }}
                  />
                  <span className="font-medium text-sage-700 text-sm">
                    {strategy.name}
                  </span>
                </div>
                <p className="text-xs text-sage-400">
                  {isHistorical ? strategy.description : formatPercent(strategy.rate)}
                </p>
                {!isHistorical && (
                  <p className="text-xs text-sage-400 mt-0.5">{strategy.description}</p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
