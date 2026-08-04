import { useState, useEffect, useCallback } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { formatINR } from '../utils/formatters';

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

  const isPositive = quote ? quote.change >= 0 : true;

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-6">
      {/* Stock Quote Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black tracking-tight text-white">{quote?.symbol || symbol}</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-bold">
              {quote?.exchange || 'NSE'} (INR)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{quote?.companyName || `${symbol} India Ltd`}</p>
        </div>

        <div className="flex items-baseline gap-3">
          <div className="text-3xl font-extrabold tracking-tight text-white">
            {formatINR(quote?.price || 0)}
          </div>
          <div
            className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>
              {isPositive ? '+' : ''}
              {formatINR(quote?.change || 0)} ({isPositive ? '+' : ''}
              {(quote?.percentChange || 0).toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Range Selectors */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Activity className="h-4 w-4 text-blue-400" />
          <span>NSE Price History ({activeRange})</span>
        </div>

        <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-xl p-1 gap-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => handleRangeChange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeRange === range
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
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
          <div className="h-full flex items-center justify-center text-xs text-slate-500 animate-pulse">
            Loading NSE stock price series...
          </div>
        ) : history.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            No historical price series available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? '#10B981' : '#F43F5E'}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? '#10B981' : '#F43F5E'}
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => val.slice(5)}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#F8FAFC',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
                formatter={(val) => [formatINR(val), 'Close Price']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={isPositive ? '#10B981' : '#F43F5E'}
                strokeWidth={2}
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
