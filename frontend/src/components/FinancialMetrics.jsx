import { useState, useEffect, useCallback } from 'react';
import { DollarSign, PieChart, TrendingUp, BarChart3, ArrowUpRight, Percent } from 'lucide-react';
import { formatINR, formatIndianNumber } from '../utils/formatters';

export default function FinancialMetrics({ symbol }) {
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFinancials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stocks/${symbol}/financials`);
      if (res.ok) {
        const data = await res.json();
        setFinancials(data.financials);
      }
    } catch (err) {
      console.error('Failed to fetch financial metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchFinancials();
  }, [fetchFinancials]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-24 bg-slate-800/40 rounded-xl border border-slate-800" />
        ))}
      </div>
    );
  }

  const metricsList = [
    {
      title: 'Market Capitalization',
      value: formatIndianNumber(financials?.marketCap),
      subtitle: 'Total Indian Equity Value',
      icon: DollarSign,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'P/E Ratio (TTM)',
      value: financials?.peRatio ? financials.peRatio.toFixed(2) : 'N/A',
      subtitle: 'Price to Earnings',
      icon: PieChart,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'EPS (TTM)',
      value: formatINR(financials?.eps || 0),
      subtitle: 'Earnings Per Share',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Annual Revenue',
      value: formatIndianNumber(financials?.revenue),
      subtitle: 'Total Gross Revenue',
      icon: BarChart3,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    {
      title: '52-Week High / Low',
      value: `${formatINR(financials?.fiftyTwoWeekHigh || 0)} / ${formatINR(financials?.fiftyTwoWeekLow || 0)}`,
      subtitle: 'NSE 1-Year Price Bounds',
      icon: ArrowUpRight,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Dividend Yield',
      value: `${financials?.dividendYield ? financials.dividendYield.toFixed(2) : '0.00'}%`,
      subtitle: 'Annualized Yield',
      icon: Percent,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metricsList.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <div
            key={index}
            className="bg-[#0F172A]/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 truncate">{item.title}</span>
              <div className={`p-1.5 rounded-lg ${item.bg} ${item.color}`}>
                <IconComponent className="h-4 w-4" />
              </div>
            </div>

            <div>
              <div className="text-lg font-bold text-white tracking-tight group-hover:text-blue-400 transition">
                {item.value}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">{item.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
