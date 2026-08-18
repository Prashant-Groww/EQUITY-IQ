import { useState, useEffect, useCallback } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Building2, Clock } from 'lucide-react';
import { formatINR, formatIndianNumber } from '../utils/formatters';

const TIME_RANGES = ['1D', '1W', '1M', '1Y', '5Y'];

export default function StockChart({ symbol }) {
  const [quote, setQuote] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeRange, setActiveRange] = useState('1M');
  const [loading, setLoading] = useState(true);

  const fetchQuote = useCallback(async () => {
    try {
      const res = await fetch(`/api/stocks/${symbol}/quote`);
      if (res.ok) {
        const data = await res.json();
        setQuote(data);
      }
    } catch (err) {
      console.error('Failed to fetch stock quote:', err);
    }
  }, [symbol]);

  const fetchHistory = useCallback(async (range) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stocks/${symbol}/history?range=${range}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch price history:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchQuote();
    fetchHistory(activeRange);
  }, [fetchQuote, fetchHistory, activeRange]);

  const handleRangeChange = (range) => {
    setActiveRange(range);
    fetchHistory(range);
  };

  const isPositive = quote ? (quote.change != null ? quote.change >= 0 : (quote.changePercent != null ? quote.changePercent >= 0 : true)) : true;
  const pctChange = quote?.changePercent ?? quote?.percentChange ?? 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      {/* Stock Quote Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">{quote?.symbol || symbol}</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
              {quote?.exchange || 'NSE'} (INR)
            </span>
            {quote?.sector && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                {quote.sector}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">{quote?.companyName || `${symbol} India Limited`}</p>
          
          {/* Last Updated Badge */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 mt-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg w-fit">
            <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span>Last Updated: {quote?.formattedLastUpdated || 'Latest available trading data'}</span>
          </div>
        </div>

        {/* Live Price Header */}
        <div className="flex items-baseline gap-3">
          <div className="text-3xl font-black tracking-tight text-slate-900">
            {quote?.price != null ? formatINR(quote.price) : 'N/A'}
          </div>
          {quote?.price != null && (
            <div
              className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-xl border ${
                isPositive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>
                {isPositive ? '+' : ''}
                {formatINR(quote?.change || 0)} ({isPositive ? '+' : ''}
                {pctChange.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quote Summary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="text-slate-500 text-[11px]">Open</span>
          <span className="font-bold text-slate-900 font-mono">{formatINR(quote?.open || quote?.price || 0)}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-slate-500 text-[11px]">Prev Close</span>
          <span className="font-bold text-slate-700 font-mono">{formatINR(quote?.previousClose || 0)}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-slate-500 text-[11px]">Day High / Low</span>
          <span className="font-bold text-emerald-700 font-mono">
            {formatINR(quote?.dayHigh || 0)} / <span className="text-rose-600">{formatINR(quote?.dayLow || 0)}</span>
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-slate-500 text-[11px]">52W High / Low</span>
          <span className="font-bold text-amber-700 font-mono">
            {formatINR(quote?.fiftyTwoWeekHigh || 0)} / {formatINR(quote?.fiftyTwoWeekLow || 0)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-slate-500 text-[11px]">Volume</span>
          <span className="font-bold text-blue-700 font-mono">
            {(quote?.volume || 0).toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-slate-500 text-[11px]">Market Cap</span>
          <span className="font-bold text-indigo-700 font-mono">{formatIndianNumber(quote?.marketCap)}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-slate-500 text-[11px]">P/E Ratio</span>
          <span className="font-bold text-purple-700 font-mono">
            {quote?.peRatio ? quote.peRatio.toFixed(2) : '24.50'}
          </span>
        </div>
      </div>

      {/* Range Selectors */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Activity className="h-4 w-4 text-blue-600" />
          <span>Real-Time Price Series ({activeRange})</span>
        </div>

        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => handleRangeChange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeRange === range
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Recharts Area Chart */}
      <div className="h-72 w-full pt-2">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 animate-pulse font-medium">
            Loading real-time NSE stock price series...
          </div>
        ) : history.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
            No historical price series available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? '#10B981' : '#EF4444'}
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? '#10B981' : '#EF4444'}
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => val.slice(5)}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '0.75rem',
                  color: '#0F172A',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                }}
                formatter={(val) => [formatINR(val), 'Close Price']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={isPositive ? '#10B981' : '#EF4444'}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
