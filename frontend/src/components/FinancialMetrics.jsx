import { useState, useEffect, useCallback } from 'react';
import { DollarSign, PieChart, TrendingUp, BarChart3, ArrowUpRight, Percent, BookOpen, Activity, Scale, CheckCircle2 } from 'lucide-react';
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl border border-slate-200" />
        ))}
      </div>
    );
  }

  const metricsList = [
    {
      title: 'Market Cap',
      value: financials?.marketCap != null ? formatIndianNumber(financials.marketCap) : 'Data unavailable',
      subtitle: financials?.marketCapCategory || 'NSE Market Cap',
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'P/E Ratio (TTM)',
      value: financials?.peRatio != null ? `${financials.peRatio.toFixed(2)}x` : 'Data unavailable',
      subtitle: 'Price to Earnings',
      icon: PieChart,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'P/B Ratio',
      value: financials?.pbRatio != null ? `${financials.pbRatio.toFixed(2)}x` : 'Data unavailable',
      subtitle: 'Price to Book Value',
      icon: BookOpen,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Book Value',
      value: financials?.bookValue != null ? formatINR(financials.bookValue) : 'Data unavailable',
      subtitle: 'Per Share Net Asset',
      icon: Scale,
      color: 'text-slate-700',
      bg: 'bg-slate-100',
    },
    {
      title: 'ROE (Return on Equity)',
      value: financials?.roe != null ? `${financials.roe}%` : 'Data unavailable',
      subtitle: 'Return on Equity',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'ROCE',
      value: financials?.roce != null ? `${financials.roce}%` : 'Data unavailable',
      subtitle: 'Capital Employed Return',
      icon: Activity,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      title: 'Debt to Equity',
      value: financials?.debtToEquity != null ? `${financials.debtToEquity}x` : 'Data unavailable',
      subtitle: 'Solvency Ratio',
      icon: Scale,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'EPS (TTM)',
      value: financials?.eps != null ? formatINR(financials.eps) : 'Data unavailable',
      subtitle: 'Earnings Per Share',
      icon: DollarSign,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
    },
    {
      title: '52-Week High / Low',
      value: financials?.fiftyTwoWeekHigh != null && financials?.fiftyTwoWeekLow != null
        ? `${formatINR(financials.fiftyTwoWeekHigh)} / ${formatINR(financials.fiftyTwoWeekLow)}`
        : 'Data unavailable',
      subtitle: '1-Year Range',
      icon: ArrowUpRight,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      title: 'Dividend Yield',
      value: financials?.dividendYield != null ? `${financials.dividendYield.toFixed(2)}%` : 'Data unavailable',
      subtitle: 'Annualized Yield',
      icon: Percent,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      title: 'Volume',
      value: financials?.volume != null ? formatIndianNumber(financials.volume) : 'Data unavailable',
      subtitle: 'Daily Traded Shares',
      icon: BarChart3,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
    },
    {
      title: 'Delivery %',
      value: financials?.deliveryPct != null ? `${financials.deliveryPct}%` : 'Data unavailable',
      subtitle: 'Delivery Volume Ratio',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
      {metricsList.map((item, index) => {
        const IconComponent = item.icon;
        const isUnavailable = item.value === 'Data unavailable';
        return (
          <div
            key={index}
            className={`bg-white border rounded-xl p-4 flex flex-col justify-between transition group ${
              isUnavailable ? 'border-slate-100 opacity-75' : 'border-slate-200 hover:border-blue-400 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 truncate">{item.title}</span>
              <div className={`p-1.5 rounded-lg ${item.bg} ${item.color}`}>
                <IconComponent className="h-3.5 w-3.5" />
              </div>
            </div>

            <div>
              <div className={`text-sm font-extrabold tracking-tight truncate ${
                isUnavailable ? 'text-slate-400 italic font-medium text-xs' : 'text-slate-900 group-hover:text-blue-600 transition text-base'
              }`}>
                {item.value}
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">{item.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
