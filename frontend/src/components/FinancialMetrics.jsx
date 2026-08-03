import { useState, useEffect, useCallback } from 'react';
import { DollarSign, BarChart3, PieChart, Layers, ArrowUpRight, ArrowDownRight, Award } from 'lucide-react';

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

  const formatCurrencyNumber = (val) => {
    if (!val || isNaN(val)) return 'N/A';
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-24 bg-slate-800/40 rounded-xl border border-slate-800" />
        ))}
      </div>
    );
  }

  if (!financials) {
    return null;
  }

  const metrics = [
    {
      title: 'Market Capitalization',
      value: formatCurrencyNumber(financials.marketCap),
      icon: DollarSign,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'P/E Ratio (TTM)',
      value: financials.peRatio ? financials.peRatio.toFixed(2) : 'N/A',
      icon: BarChart3,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Earnings Per Share (EPS)',
      value: financials.eps ? `$${financials.eps.toFixed(2)}` : 'N/A',
      icon: PieChart,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Total Revenue (TTM)',
      value: formatCurrencyNumber(financials.revenue),
      icon: Layers,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      title: '52-Week High',
      value: financials.fiftyTwoWeekHigh ? `$${financials.fiftyTwoWeekHigh.toFixed(2)}` : 'N/A',
      icon: ArrowUpRight,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/20',
    },
    {
      title: '52-Week Low',
      value: financials.fiftyTwoWeekLow ? `$${financials.fiftyTwoWeekLow.toFixed(2)}` : 'N/A',
      icon: ArrowDownRight,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Dividend Yield',
      value: financials.dividendYield ? `${financials.dividendYield.toFixed(2)}%` : 'N/A',
      icon: Award,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-blue-400" />
        Key Valuation & Financial Metrics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const IconComponent = m.icon;
          return (
            <div
              key={idx}
              className="glass-card glass-card-hover rounded-xl p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">{m.title}</span>
                <div className={`p-2 rounded-lg border ${m.bg} ${m.color}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
              </div>
              <div className="text-xl font-bold font-mono text-white">{m.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
