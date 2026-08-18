import { TrendingUp, Sparkles, Building2, ShieldCheck, Layers, ArrowUpRight } from 'lucide-react';
import StockSearch from './StockSearch';

const POPULAR_SEARCH_CHIPS = [
  { label: 'Reliance Industries', symbol: 'RELIANCE', sector: 'Oil & Gas' },
  { label: 'TCS', symbol: 'TCS', sector: 'IT Services' },
  { label: 'Infosys', symbol: 'INFY', sector: 'IT Services' },
  { label: 'HDFC Bank', symbol: 'HDFCBANK', sector: 'Banking' },
  { label: 'ICICI Bank', symbol: 'ICICIBANK', sector: 'Banking' },
  { label: 'Tata Motors', symbol: 'TATAMOTORS', sector: 'Automobiles' },
  { label: 'State Bank of India', symbol: 'SBIN', sector: 'Banking' },
  { label: 'Larsen & Toubro', symbol: 'LT', sector: 'Infrastructure' },
];

const SECTOR_SHORTCUTS = [
  { name: 'Banking & Financials', symbol: 'HDFCBANK' },
  { name: 'IT Services & Software', symbol: 'TCS' },
  { name: 'Automobiles & Auto', symbol: 'TATAMOTORS' },
  { name: 'Pharmaceuticals & Health', symbol: 'SUNPHARMA' },
  { name: 'Energy, Oil & Power', symbol: 'RELIANCE' },
  { name: 'FMCG & Consumer Goods', symbol: 'ITC' },
];

export default function HomepageHero({ onSelectSymbol }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-slate-50 to-slate-50 py-16 px-6 rounded-3xl border border-slate-200/80 shadow-xs mb-10">
      
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-gradient-to-r from-blue-400/10 via-indigo-400/10 to-purple-400/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
        
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 shadow-2xs text-xs font-bold text-blue-700 mb-6 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
          <span>500+ NSE/BSE Listed Companies Grounded with AI RAG</span>
        </div>

        {/* Primary Hero Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-5">
          Search Any Indian Stock with <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">AI Precision</span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed mb-8">
          Instant Quantitative Ratios, Multi-Factor ML Buy/Sell Recommendations, FinBERT News Sentiment, and RAG Annual Filing Retrieval.
        </p>

        {/* Hero Search Box Container */}
        <div className="w-full max-w-2xl mb-6 shadow-xl rounded-2xl">
          <StockSearch onSelectSymbol={onSelectSymbol} variant="hero" />
        </div>

        {/* Popular Searches Quick Chips */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Popular Equities:
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl">
            {POPULAR_SEARCH_CHIPS.map((chip) => (
              <button
                key={chip.symbol}
                onClick={() => onSelectSymbol(chip.symbol)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 text-slate-700 text-xs font-semibold transition shadow-2xs group"
              >
                <span>{chip.label}</span>
                <span className="text-[10px] font-mono text-slate-400 font-bold group-hover:text-blue-500">
                  ({chip.symbol})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sector Shortcuts Strip */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 w-full flex flex-col items-center gap-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Explore by Sector:
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {SECTOR_SHORTCUTS.map((sec) => (
              <button
                key={sec.name}
                onClick={() => onSelectSymbol(sec.symbol)}
                className="text-xs px-3 py-1 rounded-lg bg-slate-100/80 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-medium transition"
              >
                {sec.name}
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
