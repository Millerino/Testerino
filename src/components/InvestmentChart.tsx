import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import type { Purchase, InvestmentProjection } from '../types';
import {
  generateProjections,
  generateStrategyComparison,
  formatCurrency,
  INVESTMENT_STRATEGIES,
  type StrategyKey,
} from '../utils/investment';

interface InvestmentChartProps {
  purchases: Purchase[];
  strategy: StrategyKey;
}

const TIME_HORIZONS = [
  { label: '1Y', value: 1 },
  { label: '5Y', value: 5 },
  { label: '10Y', value: 10 },
  { label: '20Y', value: 20 },
];

const COMPARISON_STRATEGIES: StrategyKey[] = [
  'conservative',
  'moderate',
  'sp500',
  'aggressive',
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
    name: string;
    payload: InvestmentProjection;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-sage-200 p-3 text-sm">
      <p className="text-sage-500 mb-2 font-medium">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sage-600">{entry.name}:</span>
          <span className="font-medium" style={{ color: entry.color }}>
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function InvestmentChart({ purchases, strategy }: InvestmentChartProps) {
  const [timeHorizon, setTimeHorizon] = useState(5);
  const [showComparison, setShowComparison] = useState(false);

  const projections = useMemo(
    () => generateProjections(purchases, strategy, timeHorizon),
    [purchases, strategy, timeHorizon]
  );

  const comparisonData = useMemo(() => {
    if (!showComparison) return null;
    return generateStrategyComparison(purchases, COMPARISON_STRATEGIES, timeHorizon);
  }, [purchases, showComparison, timeHorizon]);

  // Merge comparison data into single array for chart
  const mergedComparisonData = useMemo(() => {
    if (!comparisonData) return [];

    type ChartDataPoint = { date: string; principal: number } & Partial<Record<StrategyKey, number>>;
    const dateMap = new Map<string, ChartDataPoint>();

    COMPARISON_STRATEGIES.forEach(stratKey => {
      const data = comparisonData[stratKey];
      data?.forEach(point => {
        const existing = dateMap.get(point.date) || { date: point.date, principal: point.principal };
        existing[stratKey] = point.value;
        dateMap.set(point.date, existing);
      });
    });

    return Array.from(dateMap.values());
  }, [comparisonData]);

  const strat = INVESTMENT_STRATEGIES[strategy];

  if (purchases.length === 0 || projections.length === 0) {
    return null;
  }

  // Find today's position
  const today = new Date().toISOString().slice(0, 7);
  const todayIndex = projections.findIndex(p => p.date >= today);

  const formatXAxis = (date: string) => {
    const [year, month] = date.split('-');
    return `${month}/${year.slice(2)}`;
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-5 md:p-6 mb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-sage-700 font-medium">Investment Projection</h2>
          <p className="text-sage-400 text-sm">See how your savings could grow</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Comparison Toggle */}
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`
              text-sm px-3 py-1.5 rounded-lg transition-colors
              ${showComparison
                ? 'bg-sage-100 text-sage-700'
                : 'text-sage-500 hover:bg-cream-100'
              }
            `}
          >
            Compare
          </button>

          {/* Time Horizon Selector */}
          <div className="flex bg-cream-100 rounded-lg p-1">
            {TIME_HORIZONS.map(horizon => (
              <button
                key={horizon.value}
                onClick={() => setTimeHorizon(horizon.value)}
                className={`
                  px-3 py-1 rounded-md text-sm font-medium transition-all
                  ${timeHorizon === horizon.value
                    ? 'bg-white text-sage-700 shadow-sm'
                    : 'text-sage-500 hover:text-sage-700'
                  }
                `}
              >
                {horizon.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 md:h-80 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          {showComparison ? (
            <LineChart
              data={mergedComparisonData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                tick={{ fill: '#7a8f7a', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#e3e7e3' }}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fill: '#7a8f7a', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value: string) => (
                  <span className="text-sage-600 text-sm">{value}</span>
                )}
              />

              {/* Principal baseline */}
              <Line
                type="monotone"
                dataKey="principal"
                stroke="#a3b1a3"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Principal"
              />

              {/* Strategy lines */}
              {COMPARISON_STRATEGIES.map(strat => (
                <Line
                  key={strat}
                  type="monotone"
                  dataKey={strat}
                  stroke={INVESTMENT_STRATEGIES[strat].color}
                  strokeWidth={2}
                  dot={false}
                  name={INVESTMENT_STRATEGIES[strat].name}
                />
              ))}

              {/* Today reference line */}
              {todayIndex >= 0 && todayIndex < mergedComparisonData.length && (
                <ReferenceLine
                  x={mergedComparisonData[todayIndex]?.date}
                  stroke="#7a8f7a"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
              )}
            </LineChart>
          ) : (
            <AreaChart
              data={projections}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="principalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a3b1a3" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#a3b1a3" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strat.color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={strat.color} stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                tick={{ fill: '#7a8f7a', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#e3e7e3' }}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fill: '#7a8f7a', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Today reference line */}
              {todayIndex >= 0 && todayIndex < projections.length && (
                <ReferenceLine
                  x={projections[todayIndex].date}
                  stroke="#7a8f7a"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{
                    value: 'Today',
                    position: 'top',
                    fill: '#7a8f7a',
                    fontSize: 10,
                  }}
                />
              )}

              {/* Principal area */}
              <Area
                type="monotone"
                dataKey="principal"
                stroke="#a3b1a3"
                strokeWidth={2}
                fill="url(#principalGradient)"
                name="Principal"
              />

              {/* Investment value area */}
              <Area
                type="monotone"
                dataKey="value"
                stroke={strat.color}
                strokeWidth={2}
                fill="url(#valueGradient)"
                name="Projected Value"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      {!showComparison && (
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sage-300" />
            <span className="text-sage-500">Principal</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: strat.color }}
            />
            <span className="text-sage-500">{strat.name}</span>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-sage-400 text-xs text-center mt-4">
        {showComparison
          ? 'Compare different investment strategies. Past performance does not guarantee future results.'
          : `Projection based on ${strat.name} strategy. Historical returns are not indicative of future performance.`
        }
      </p>
    </div>
  );
}
