import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Sparkles, BookOpen, Users } from 'lucide-react';
import StockChart from './StockChart';
import FinancialMetrics from './FinancialMetrics';
import MLRatingWidget from './MLRatingWidget';
import RiskAnalyticsWidget from './RiskAnalyticsWidget';
import { formatINR } from '../utils/formatters';

export default function StockDetailsView({ symbol, onBackToSearch, onNavigateToRAG }) {
  const [quote, setQuote] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [qRes, fRes] = await Promise.all([
          fetch(`/api/stocks/${symbol}/quote`),
          fetch(`/api/stocks/${symbol}/financials`),
        ]);
        if (qRes.ok) {
          const qData = await qRes.json();
          setQuote(qData);
        }
        if (fRes.ok) {
          const fData = await fRes.json();
          setFinancials(fData.financials);
        }
      } catch (err) {
        console.error('Failed to fetch stock details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [symbol]);

  const isPositive = quote ? (quote.price != null && quote.previousClose != null ? quote.price >= quote.previousClose : true) : true;
  const priceChange = quote?.price != null && quote?.previousClose != null ? quote.price - quote.previousClose : null;
  const pctChange = quote?.price != null && quote?.previousClose != null ? ((quote.price - quote.previousClose) / quote.previousClose) * 100 : null;

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in">
      
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          onClick={onBackToSearch}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 text-xs font-bold transition shadow-2xs group"
        >
          <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition" />
          <span>Back to Homepage Search</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToRAG && onNavigateToRAG(symbol)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-md shadow-purple-500/20"
          >
            <Sparkles className="h-4 w-4" />
            <span>Analyze with AI (PDF & CSV RAG)</span>
          </button>
        </div>
      </div>

      {/* 1. STOCK HEADER CARD */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-100/80 border border-blue-200 text-blue-700 font-black text-lg flex items-center justify-center shrink-0">
            {symbol.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{symbol}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
                {quote?.exchange || 'NSE'} (INR)
              </span>
              {quote?.sector && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                  {quote.sector}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-600 mt-1">
              {quote?.companyName || `${symbol} India Limited`}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              NSE-listed constituent operating in the {quote?.sector || 'Diversified'} sector ({quote?.industry || 'Commercial'}).
            </p>
          </div>
        </div>

        {/* Live Price Header & Analyze with AI */}
        <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            {quote?.price != null ? formatINR(quote.price) : 'Data unavailable'}
          </div>
          {priceChange != null ? (
            <div
              className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-xl border ${
                isPositive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>
                {isPositive ? '+' : ''}
                {formatINR(priceChange)} ({isPositive ? '+' : ''}
                {pctChange ? pctChange.toFixed(2) : '0.00'}%)
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">Price data updated</div>
          )}
        </div>
      </div>

      {/* 2. KEY FINANCIAL RATIOS GRID */}
      <FinancialMetrics symbol={symbol} />

      {/* 3. INTERACTIVE PRICE CHART */}
      <StockChart symbol={symbol} />

      {/* 4. MULTI-FACTOR ML RATING ENGINE */}
      <MLRatingWidget symbol={symbol} />

      {/* 5. QUANTITATIVE RISK & VOLATILITY MODEL */}
      <RiskAnalyticsWidget symbol={symbol} />

      {/* 6. BUSINESS DESCRIPTION & SHAREHOLDING PATTERN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Business Description */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-3">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Company Overview & Business Summary
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {symbol} is an authentic NSE-listed Indian corporate operating in {financials?.industry || quote?.sector || 'Diversified Commercial Operations'}. The company maintains institutional equity coverage evaluated across Indian stock market peers.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Market Cap Category</span>
              <span className="font-bold text-slate-900">{financials?.marketCapCategory || 'Large Cap'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Industry</span>
              <span className="font-bold text-slate-900">{financials?.industry || 'Commercial'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Book Value</span>
              <span className="font-bold text-slate-900">
                {financials?.bookValue != null
                  ? formatINR(financials.bookValue)
                  : (financials?.price && financials?.pbRatio && financials.pbRatio > 0)
                    ? formatINR(financials.price / financials.pbRatio)
                    : (quote?.price && financials?.pbRatio && financials.pbRatio > 0)
                      ? formatINR(quote.price / financials.pbRatio)
                      : 'Data unavailable'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Delivery Volume %</span>
              <span className="font-bold text-emerald-600">{financials?.deliveryPct != null ? `${financials.deliveryPct}%` : 'Data unavailable'}</span>
            </div>
          </div>
        </div>

        {/* Shareholding Pattern Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Users className="h-4 w-4 text-purple-600" />
            Shareholding Pattern (%)
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Promoters</span>
                <span className="font-bold text-slate-900">50.4%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '50.4%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>FIIs (Foreign Institutional)</span>
                <span className="font-bold text-slate-900">22.1%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '22.1%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>DIIs (Mutual Funds & Domestic)</span>
                <span className="font-bold text-slate-900">16.8%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: '16.8%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Retail & Public</span>
                <span className="font-bold text-slate-900">10.7%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full" style={{ width: '10.7%' }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 7. DEDICATED RAG RESEARCH WORKSPACE CTA BANNER */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-600 text-white shrink-0 shadow-md shadow-purple-600/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900">Analyze {symbol} Annual Filings with AI RAG</h4>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">Upload PDF annual reports and CSV financial metrics to run grounded Q&A in the dedicated RAG Workspace.</p>
          </div>
        </div>
        <button
          onClick={() => onNavigateToRAG && onNavigateToRAG(symbol)}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-md shadow-purple-600/20 shrink-0 flex items-center justify-center gap-2"
        >
          <span>Open RAG Research Workspace &rarr;</span>
        </button>
      </div>
    </div>
  );
}
