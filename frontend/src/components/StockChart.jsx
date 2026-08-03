import { useState, useEffect, useCallback } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export default function StockChart({ symbol }) {
  const [quote, setQuote] = useState(null);
  const [history, setHistory] = useState([]);
  const [range, setRange] = useState('1M');
  const [loading, setLoading] = useState(true);

  const fetchQuoteAndHistory = useCallback(async () => {
    setLoading(true);
    try {
      const [quoteRes, historyRes] = await Promise.all([
        fetch(`/api/stocks/${symbol}/quote`),
        fetch(`/api/stocks/${symbol}/history?range=${range}`),
      ]);

      if (quoteRes.ok) {
        const qData = await quoteRes.json();
        setQuote(qData.quote);
      }

      if (historyRes.ok) {
        const hData = await historyRes.json();
        setHistory(hData.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch stock chart data:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol, range]);

  useEffect(() => {
    fetchQuoteAndHistory();
  }, [fetchQuoteAndHistory]);

  const isPositive = quote ? quote.change >= 0 : true;

  const ranges = ['1D', '1W', '1M', '1Y', '5Y'];

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-6">
      {/* Header section with quote summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">{quote ? quote.name : symbol}</h2>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {symbol}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Exchange: {quote ? quote.exchange : 'NASDAQ'}</p>
        </div>

        {quote && (
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white font-mono">
              ${quote.price.toFixed(2)}
            </span>
            <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-lg border ${
              isPositive 
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            }`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{isPositive ? '+' : ''}{quote.change.toFixed(2)} ({isPositive ? '+' : ''}{quote.percentChange.toFixed(2)}%)</span>
            </div>
          </div>
        )}
      </div>

      {/* Control bar: Range selectors */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                range === r
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {quote && (
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div><span className="text-slate-500">Day High:</span> ${quote.dayHigh.toFixed(2)}</div>
            <div><span className="text-slate-500">Day Low:</span> ${quote.dayLow.toFixed(2)}</div>
            <div><span className="text-slate-500">Volume:</span> {(quote.volume / 1000000).toFixed(2)}M</div>
          </div>
        )}
      </div>

      {/* Chart visualization */}
      <div className="h-72 w-full relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 rounded-xl backdrop-blur-sm">
            <Activity className="h-8 w-8 text-blue-400 animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            No historical price data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                stroke="#475569" 
                tick={{ fill: '#64748B', fontSize: 11 }} 
                tickLine={false} 
              />
              <YAxis 
                domain={['auto', 'auto']} 
                stroke="#475569" 
                tick={{ fill: '#64748B', fontSize: 11 }} 
                tickLine={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0F172A', 
                  borderColor: '#334155', 
                  borderRadius: '0.75rem',
                  color: '#F8FAFC',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="close" 
                stroke={isPositive ? '#10B981' : '#EF4444'} 
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
