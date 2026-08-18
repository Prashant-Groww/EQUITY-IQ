import { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Building2, Clock, X, Sparkles } from 'lucide-react';

const POPULAR_INDIAN_STOCKS = [
  { symbol: 'RELIANCE', companyName: 'Reliance Industries Ltd', sector: 'Oil & Gas', exchange: 'NSE' },
  { symbol: 'TCS', companyName: 'Tata Consultancy Services Ltd', sector: 'IT Services', exchange: 'NSE' },
  { symbol: 'INFY', companyName: 'Infosys Ltd', sector: 'IT Services', exchange: 'NSE' },
  { symbol: 'HDFCBANK', companyName: 'HDFC Bank Ltd', sector: 'Banking', exchange: 'NSE' },
  { symbol: 'ICICIBANK', companyName: 'ICICI Bank Ltd', sector: 'Banking', exchange: 'NSE' },
  { symbol: 'SBIN', companyName: 'State Bank of India', sector: 'Banking', exchange: 'NSE' },
  { symbol: 'TATAMOTORS', companyName: 'Tata Motors Ltd', sector: 'Automobiles', exchange: 'NSE' },
  { symbol: 'LT', companyName: 'Larsen & Toubro Ltd', sector: 'Infrastructure', exchange: 'NSE' },
  { symbol: 'BHARTIARTL', companyName: 'Bharti Airtel Ltd', sector: 'Telecom', exchange: 'NSE' },
  { symbol: 'ITC', companyName: 'ITC Ltd', sector: 'FMCG', exchange: 'NSE' },
];

export default function StockSearch({ onSelectSymbol, activeSymbol, placeholder, variant = 'default' }) {
  const [query, setQuery] = useState(activeSymbol || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const isHero = variant === 'hero';

  // Load recent searches on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('equityiq_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Sync activeSymbol if changed externally
  useEffect(() => {
    if (activeSymbol && activeSymbol !== query) {
      setQuery(activeSymbol);
    }
  }, [activeSymbol]);

  // Debounced search across 500+ Indian stocks
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions(POPULAR_INDIAN_STOCKS);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSuggestions(data);
          } else {
            setSuggestions(
              POPULAR_INDIAN_STOCKS.filter(
                (s) =>
                  s.symbol.includes(query.toUpperCase()) ||
                  s.companyName.toUpperCase().includes(query.toUpperCase()) ||
                  (s.sector && s.sector.toUpperCase().includes(query.toUpperCase()))
              )
            );
          }
        }
      } catch (err) {
        console.error('Failed to search Indian stocks:', err);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (symbol) => {
    try {
      const updated = [symbol, ...recentSearches.filter((s) => s !== symbol)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('equityiq_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelect = (symbol) => {
    setQuery(symbol);
    setIsOpen(false);
    saveRecentSearch(symbol);
    if (onSelectSymbol) {
      onSelectSymbol(symbol);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelect(suggestions[selectedIndex].symbol);
      } else if (suggestions.length > 0) {
        handleSelect(suggestions[0].symbol);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search
          className={`absolute pointer-events-none text-slate-400 ${
            isHero ? 'left-4.5 h-5 w-5 text-blue-600' : 'left-3.5 h-4 w-4'
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            placeholder ||
            (isHero
              ? 'Search 500+ Indian Stocks by Name, Symbol, or Sector (e.g. RELIANCE, TCS, Banking)...'
              : 'Search NSE/BSE Stocks (e.g. RELIANCE, TCS)...')
          }
          className={`w-full bg-white border focus:outline-none transition font-medium ${
            isHero
              ? 'border-slate-300 focus:border-blue-600 focus:ring-8 focus:ring-blue-500/10 rounded-2xl pl-12 pr-16 py-4 text-base text-slate-900 placeholder-slate-400 shadow-lg'
              : 'border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl pl-10 pr-14 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-2xs'
          }`}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(true);
              inputRef.current?.focus();
            }}
            className={`absolute p-1 text-slate-400 hover:text-slate-600 transition ${
              isHero ? 'right-12' : 'right-10'
            }`}
          >
            <X className={isHero ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
          </button>
        )}
        <span
          className={`absolute font-mono uppercase font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded ${
            isHero ? 'right-4 text-xs px-2 py-1' : 'right-3 text-[10px] px-1.5 py-0.5'
          }`}
        >
          NSE
        </span>
      </div>

      {/* Autocomplete Suggestions Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto divide-y divide-slate-100 ${
            isHero ? 'top-full mt-3' : 'top-full mt-2'
          }`}
        >
          {/* Recent Searches */}
          {!query.trim() && recentSearches.length > 0 && (
            <div className="p-3 bg-slate-50/70">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-slate-400" />
                Recent Searches
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((sym) => (
                  <button
                    key={sym}
                    onClick={() => handleSelect(sym)}
                    className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 rounded-lg text-slate-700 transition shadow-2xs"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section Header */}
          <div className="px-4 py-2.5 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>500+ NSE Listed Companies</span>
            {loading ? (
              <span className="text-blue-600 animate-pulse font-semibold">Searching...</span>
            ) : (
              <span className="text-slate-400 font-normal">{suggestions.length} results</span>
            )}
          </div>

          {/* Suggestions List */}
          {suggestions.length === 0 ? (
            <div className="px-4 py-6 text-xs text-slate-500 text-center">
              No matching Indian companies found for "{query}"
            </div>
          ) : (
            <div className="py-1">
              {suggestions.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const initials = item.symbol ? item.symbol.slice(0, 2) : 'EQ';
                return (
                  <button
                    key={item.symbol}
                    onClick={() => handleSelect(item.symbol)}
                    className={`w-full text-left px-4 py-3 transition flex items-center justify-between group ${
                      isSelected ? 'bg-blue-50/80 text-blue-900' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-100/70 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {item.symbol}
                          </span>
                          {item.sector && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-full font-medium">
                              {item.sector}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-[280px]">
                          {item.companyName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      {item.price && (
                        <div className="text-xs font-bold text-slate-900">
                          ₹{item.price.toLocaleString('en-IN')}
                        </div>
                      )}
                      <div className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                        NSE
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
