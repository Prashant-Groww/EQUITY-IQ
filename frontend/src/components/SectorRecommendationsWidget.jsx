import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Cpu,
  HeartPulse,
  Car,
  ShoppingBag,
  Zap,
  Gem,
  Building2,
  FlaskConical,
  Home,
  Radio,
  Layers,
  Award,
  TrendingUp,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  RefreshCw,
  BarChart3,
  Bot,
  ExternalLink
} from 'lucide-react';

const SECTOR_ICONS = {
  banking: Landmark,
  it: Cpu,
  pharma: HeartPulse,
  auto: Car,
  fmcg: ShoppingBag,
  energy: Zap,
  metals: Gem,
  infra: Building2,
  chemicals: FlaskConical,
  realty: Home,
  telecom: Radio,
};

const DEFAULT_SECTORS = [
  { id: 'banking', name: 'Banking & Financials', icon: 'Landmark', description: 'Premier private & public banks, NBFCs, and financial credit institutions', stockCount: 66 },
  { id: 'it', name: 'IT & Software', icon: 'Cpu', description: 'Enterprise software consultancies, cloud engineering, AI & digital innovators', stockCount: 259 },
  { id: 'pharma', name: 'Pharma & Healthcare', icon: 'HeartPulse', description: 'Active pharma ingredients (API), healthcare hospital chains, and formulations', stockCount: 175 },
  { id: 'auto', name: 'Automobiles & EV', icon: 'Car', description: 'Passenger vehicle OEMs, electric mobility leaders, and precision auto ancillaries', stockCount: 83 },
  { id: 'fmcg', name: 'FMCG & Consumer Goods', icon: 'ShoppingBag', description: 'High-ROE packaged consumer goods, branded foods, personal care, and retail', stockCount: 177 },
  { id: 'energy', name: 'Energy, Oil & Power', icon: 'Zap', description: 'Power generation utilities, green renewable infrastructure, and petroleum refiners', stockCount: 129 },
  { id: 'metals', name: 'Metals & Mining', icon: 'Gem', description: 'Steel producers, aluminum manufacturers, specialized alloys, and mineral processors', stockCount: 93 },
  { id: 'infra', name: 'Infrastructure & Capital Goods', icon: 'Building2', description: 'Turnkey EPC contractors, cement producers, industrial automation, and machinery', stockCount: 226 },
  { id: 'chemicals', name: 'Chemicals & Fertilizers', icon: 'FlaskConical', description: 'Specialty chemical formulations, fluorochemicals, and fertilizer innovators', stockCount: 110 },
  { id: 'realty', name: 'Real Estate & Realty', icon: 'Home', description: 'Tier-1 commercial real estate REITs, residential developers, and urban townships', stockCount: 31 },
  { id: 'telecom', name: 'Telecommunications', icon: 'Radio', description: 'National telecom wireless operators, optical fiber networks, and cellular towers', stockCount: 17 },
];

const RANK_THEMES = [
  {
    border: 'border-amber-300 hover:border-amber-400',
    badge: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-amber-500/20',
    highlight: 'bg-amber-50 text-amber-800 border-amber-200',
    glow: 'ring-1 ring-amber-400/30'
  },
  {
    border: 'border-emerald-300 hover:border-emerald-400',
    badge: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20',
    highlight: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    glow: 'ring-1 ring-emerald-400/30'
  },
  {
    border: 'border-blue-300 hover:border-blue-400',
    badge: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20',
    highlight: 'bg-blue-50 text-blue-800 border-blue-200',
    glow: 'ring-1 ring-blue-400/30'
  },
  {
    border: 'border-purple-300 hover:border-purple-400',
    badge: 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-purple-500/20',
    highlight: 'bg-purple-50 text-purple-800 border-purple-200',
    glow: 'ring-1 ring-purple-400/30'
  },
  {
    border: 'border-cyan-300 hover:border-cyan-400',
    badge: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-500/20',
    highlight: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    glow: 'ring-1 ring-cyan-400/30'
  },
];

export default function SectorRecommendationsWidget({ onSelectSymbol, onNavigateToRAG }) {
  const [sectors, setSectors] = useState(DEFAULT_SECTORS);
  const [selectedSector, setSelectedSector] = useState('banking');
  const [loading, setLoading] = useState(false);
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch sector list on mount
  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const res = await fetch('/api/stocks/recommendations/sectors');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSectors(data);
          }
        }
      } catch (err) {
        console.warn('Using fallback sector taxonomy:', err);
      }
    };
    fetchSectors();
  }, []);

  // Fetch recommendations whenever selectedSector changes
  useEffect(() => {
    let isCancelled = false;

    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/stocks/recommendations/sector?sector=${selectedSector}`);
        if (!res.ok) {
          throw new Error(`Failed to load sector recommendations (${res.status})`);
        }
        const data = await res.json();
        if (!isCancelled) {
          setRecommendationsData(data);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Sector recommendation error:', err);
          setError(err.message || 'Unable to retrieve ML recommendations');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchRecommendations();

    return () => {
      isCancelled = true;
    };
  }, [selectedSector]);

  const activeSectorObj = sectors.find((s) => s.id === selectedSector) || sectors[0];
  const ActiveIcon = SECTOR_ICONS[selectedSector] || Layers;

  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col gap-8 transition">
      
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  AI Sector Recommendations
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ML Powered
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Select an industry sector to discover the <strong className="text-slate-800 font-semibold">Top 5 Best Stocks</strong> to invest in based on multi-factor ML ratings.
              </p>
            </div>
          </div>
        </div>

        {/* Evaluation Weights Pill */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 self-start lg:self-center">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            Evaluation Weights:
          </span>
          <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium">Valuation 22%</span>
          <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium text-emerald-700">ROE/ROCE 26%</span>
          <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium">Solvency 22%</span>
          <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium">Quality 16%</span>
          <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium">Momentum 14%</span>
        </div>
      </div>

      {/* 2. INTERACTIVE SECTOR SELECTOR TABS */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-blue-600" />
            Select Industry Sector ({sectors.length} Available)
          </label>
          <span className="text-[11px] text-slate-400">Real-time NSE Factor Ranking</span>
        </div>

        {/* Scrollable / Wrapped Sector Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
          {sectors.map((sec) => {
            const Icon = SECTOR_ICONS[sec.id] || Layers;
            const isSelected = selectedSector === sec.id;

            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSector(sec.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition shadow-sm ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-600/30'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                <span>{sec.name}</span>
                {sec.stockCount ? (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isSelected
                        ? 'bg-blue-700/80 text-blue-100'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {sec.stockCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE SECTOR CONTEXT BANNER */}
      {activeSectorObj && (
        <div className="bg-gradient-to-r from-blue-50/70 via-slate-50/70 to-indigo-50/70 border border-blue-100/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <ActiveIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900">{activeSectorObj.name}</h3>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full border border-blue-200">
                  {recommendationsData?.totalAnalyzed || activeSectorObj.stockCount || 50}+ Equities Analyzed
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {activeSectorObj.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={() => {
                const prev = selectedSector;
                setSelectedSector('');
                setTimeout(() => setSelectedSector(prev), 50);
              }}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              Re-evaluate
            </button>
          </div>
        </div>
      )}

      {/* 4. ERROR STATE */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>Failed to load recommendations: {error}</span>
          <button
            onClick={() => setSelectedSector((prev) => prev)}
            className="font-bold underline ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* 5. LOADING SKELETON */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex flex-col gap-4 animate-pulse"
            >
              <div className="h-6 w-28 bg-slate-200 rounded-full" />
              <div className="h-8 w-20 bg-slate-200 rounded-lg" />
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-14 bg-slate-200 rounded-xl" />
              <div className="h-20 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* 6. TOP 5 STOCKS GRID */}
      {!loading && recommendationsData?.recommendations && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {recommendationsData.recommendations.map((stock, idx) => {
            const theme = RANK_THEMES[idx] || RANK_THEMES[0];
            const isTop1 = idx === 0;

            return (
              <div
                key={stock.symbol}
                className={`bg-white rounded-3xl border ${theme.border} ${theme.glow} p-5 flex flex-col justify-between gap-5 shadow-xs hover:shadow-lg transition group relative overflow-hidden`}
              >
                {/* Subtle Background Glow for #1 Pick */}
                {isTop1 && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
                )}

                {/* Top Header: Rank Badge & ML Recommendation Pill */}
                <div className="flex flex-col gap-2.5 relative">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-xs ${theme.badge}`}
                    >
                      {stock.rankBadge}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Rank #{stock.rank}
                    </span>
                  </div>

                  {/* Stock Symbol & Company Name */}
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition tracking-tight">
                        {stock.symbol}
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {stock.marketCapCategory || 'Large Cap'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5" title={stock.companyName}>
                      {stock.companyName}
                    </p>
                  </div>
                </div>

                {/* Live Price & Target Upside */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-base font-black text-slate-900">
                      ₹{typeof stock.price === 'number' ? stock.price.toLocaleString('en-IN') : stock.price}
                    </div>
                    <div
                      className={`text-[11px] font-bold flex items-center gap-0.5 ${
                        (stock.changePercent || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {(stock.changePercent || 0) >= 0 ? '+' : ''}
                      {stock.changePercent || 0}%
                    </div>
                  </div>

                  {/* Target 12M Upside */}
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Est. 12M Target
                    </div>
                    <div className="text-xs font-black text-emerald-600 flex items-center justify-end gap-0.5">
                      <TrendingUp className="h-3 w-3" />
                      {stock.targetUpside}
                    </div>
                  </div>
                </div>

                {/* ML Rating & Composite Score Pill */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">ML Rating</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      {stock.recommendation.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Composite Score Meter */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-700">Multi-Factor Score</span>
                      <span className="font-black text-blue-700">
                        {stock.compositeScore} <span className="text-slate-400 text-[10px]">/ 100</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          stock.compositeScore >= 90
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            : stock.compositeScore >= 80
                            ? 'bg-gradient-to-r from-blue-500 to-emerald-500'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, stock.compositeScore)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-semibold mt-1">
                      <span>Confidence: {stock.confidence}%</span>
                      <span>Ranked #{stock.rank}</span>
                    </div>
                  </div>
                </div>

                {/* Key AI Drivers / Rationale */}
                <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Key Investment Drivers
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {stock.keyDrivers?.slice(0, 2).map((driver, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-1.5 text-[11px] text-slate-600 leading-snug">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{driver}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Ratios Table */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50/70 border border-slate-100 rounded-xl p-2.5 text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">P/E Ratio</span>
                    <span className="font-bold text-slate-800">{stock.peRatio ? `${stock.peRatio}x` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">ROE</span>
                    <span className="font-bold text-emerald-700">{stock.roe ? `${stock.roe}%` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">ROCE</span>
                    <span className="font-bold text-slate-800">{stock.roce ? `${stock.roce}%` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Debt / Equity</span>
                    <span className="font-bold text-slate-800">{stock.debtToEquity ? `${stock.debtToEquity}x` : 'N/A'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => onSelectSymbol && onSelectSymbol(stock.symbol)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm group-hover:bg-blue-600"
                  >
                    <span>View Fundamentals</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => onNavigateToRAG && onNavigateToRAG(stock.symbol)}
                    className="w-full py-1.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold transition flex items-center justify-center gap-1 border border-purple-200"
                  >
                    <Bot className="h-3.5 w-3.5 text-purple-600" />
                    <span>Analyze in AI RAG</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 7. METHODOLOGY EXPLAINER FOOTER */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Deterministic Factor Rigor:</strong> All sector rankings update continuously using live corporate balance sheets, ROCE/ROE margins, leverage safety bounds, and 10-second price polling.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-slate-500 font-medium">
          <span>Universe: 2,696 NSE Listed Equities</span>
        </div>
      </div>

    </section>
  );
}
