import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { Purchase, InvestmentProjection } from '../types';
import { generateProjections, formatCurrency, ANNUAL_RETURN_RATE } from '../utils/investment';

interface InvestmentChartProps {
  purchases: Purchase[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: InvestmentProjection;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const gains = data.value - data.principal;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-sage-200 p-3 text-sm">
      <p className="text-sage-500 mb-1">{label}</p>
      <p className="text-sage-700">
        Principal: <span className="font-medium">{formatCurrency(data.principal)}</span>
      </p>
      <p className="text-gold-600">
        Value: <span className="font-medium">{formatCurrency(data.value)}</span>
      </p>
      {gains > 0 && (
        <p className="text-green-600 text-xs mt-1">
          +{formatCurrency(gains)} growth
        </p>
      )}
    </div>
  );
}

export function InvestmentChart({ purchases }: InvestmentChartProps) {
  const projections = useMemo(
    () => generateProjections(purchases, 5),
    [purchases]
  );

  if (purchases.length === 0 || projections.length === 0) {
    return null;
  }

  // Find today's position for reference line
  const today = new Date().toISOString().slice(0, 7);
  const todayIndex = projections.findIndex(p => p.date >= today);

  // Format axis labels
  const formatXAxis = (date: string) => {
    const [year, month] = date.split('-');
    return `${month}/${year.slice(2)}`;
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-5 md:p-6 mb-6">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-sage-600 font-medium">Investment Projection</h2>
        <span className="text-sage-400 text-xs">5-year outlook</span>
      </div>

      <div className="h-64 md:h-80 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
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
                <stop offset="0%" stopColor="#c4956a" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#c4956a" stopOpacity={0.05} />
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
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Reference line for today */}
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

            {/* Principal area (what you saved) */}
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
              stroke="#c4956a"
              strokeWidth={2}
              fill="url(#valueGradient)"
              name="Value"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-sage-300" />
          <span className="text-sage-500">Principal</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gold-500" />
          <span className="text-sage-500">Projected Value</span>
        </div>
      </div>

      <p className="text-sage-400 text-xs text-center mt-4">
        Assumes {(ANNUAL_RETURN_RATE * 100).toFixed(0)}% annual return (historical S&P 500 average, inflation-adjusted)
      </p>
    </div>
  );
}
