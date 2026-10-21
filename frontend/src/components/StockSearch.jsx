import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, TrendingUp, Building2, Clock, X, Sparkles, Tag, AlertCircle, Trash2 } from 'lucide-react';

const POPULAR_INDIAN_STOCKS = [
  { symbol: 'RELIANCE', companyName: 'Reliance Industries Limited', sector: 'Oil & Gas', industry: 'Refineries', price: 1296.30, exchange: 'NSE' },
  { symbol: 'TCS', companyName: 'Tata Consultancy Services Limited', sector: 'Information Technology', industry: 'IT Services & Consulting', price: 2445.90, exchange: 'NSE' },
  { symbol: 'HDFCBANK', companyName: 'HDFC Bank Limited', sector: 'Financial Services', industry: 'Private Banks', price: 740.55, exchange: 'NSE' },
  { symbol: 'INFY', companyName: 'Infosys Limited', sector: 'Information Technology', industry: 'IT Services & Consulting', price: 1160.00, exchange: 'NSE' },
  { symbol: 'ICICIBANK', companyName: 'ICICI Bank Limited', sector: 'Financial Services', industry: 'Private Banks', price: 1441.30, exchange: 'NSE' },
  { symbol: 'SBIN', companyName: 'State Bank of India', sector: 'Financial Services', industry: 'Public Banks', price: 840.00, exchange: 'NSE' },
  { symbol: 'BHARTIARTL', companyName: 'Bharti Airtel Limited', sector: 'Telecommunications', industry: 'Telecom Services', price: 1625.40, exchange: 'NSE' },
  { symbol: 'TATAMOTORS', companyName: 'Tata Motors Limited', sector: 'Automobile', industry: 'Commercial & Passenger Vehicles', price: 1015.00, exchange: 'NSE' },
  { symbol: 'LT', companyName: 'Larsen & Toubro Limited', sector: 'Construction & Engineering', industry: 'Engineering & Construction', price: 3680.00, exchange: 'NSE' },
  { symbol: 'ITC', companyName: 'ITC Limited', sector: 'Fast Moving Consumer Goods', industry: 'Cigarettes & FMCG', price: 472.10, exchange: 'NSE' },
];

// Deterministic pastel color generator for company monogram avatars
const AVATAR_COLORS = [
  { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
];

function getAvatarStyle(symbol = '') {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = (hash << 5) - hash + symbol.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Text Highlighter Component for highlighting matched search queries
 */
function HighlightMatch({ text, query }) {
  if (!text) return null;
  const trimmed = (query || '').trim();
  if (!trimmed) return <span>{text}</span>;

  try {
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === trimmed.toLowerCase() ? (
            <mark key={i} className="bg-blue-100 text-blue-900 font-bold px-0.5 rounded not-italic">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  } catch {
    return <span>{text}</span>;
  }
}

/**
 * Company Logo / Monogram Component
 */
function CompanyAvatar({ symbol, logoUrl }) {
  const [imgFailed, setImgFailed] = useState(false);
  const colorStyle = getAvatarStyle(symbol);
  const initials = symbol ? symbol.slice(0, 2).toUpperCase() : 'EQ';

  if (logoUrl && !imgFailed) {
    return (
      <img
        src={logoUrl}
        alt={`${symbol} logo`}
        onError={() => setImgFailed(true)}
        className="h-10 w-10 rounded-xl object-contain p-1 border border-slate-200 bg-white shrink-0 shadow-2xs"
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`h-10 w-10 rounded-xl ${colorStyle.bg} ${colorStyle.border} ${colorStyle.text} border font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs font-mono tracking-tight`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

export default function StockSearch({
  onSelectSymbol,
  activeSymbol,
  placeholder,
  variant = 'default',
}) {
  const isHero = variant === 'hero';
  const [query, setQuery] = useState(isHero ? '' : (activeSymbol || ''));
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const itemRefs = useRef([]);
  const abortControllerRef = useRef(null);

  // Load recent searches from localStorage safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem('equityiq_recent_searches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 8));
        }
      }
    } catch (e) {
      console.warn('Could not read recent searches from localStorage:', e);
    }
  }, []);

  // Sync external activeSymbol (navbar only, not hero)
  useEffect(() => {
    if (!isHero && activeSymbol && activeSymbol !== query) {
      setQuery(activeSymbol);
    }
  }, [activeSymbol, isHero]);

  // Debounced search using AbortController for stale-request prevention
  useEffect(() => {
    const trimmedQuery = query.trim();

    // When query is empty: show popular stocks, clear suggestions/errors
    if (!trimmedQuery) {
      setSuggestions([]);
      setSearchError(null);
      setLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setSearchError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: abortController.signal,
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) {
          throw new Error(`Search request returned status ${res.status}`);
        }

        const data = await res.json();
        if (Array.isArray(data)) {
          setSuggestions(data);
          setSelectedIndex(-1);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          return; // Ignore aborted requests
        }
        console.error('Failed to search Indian stocks:', err);
        setSearchError('Search service temporarily unavailable. Please try again.');
        setSuggestions([]);
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }, 220); // 220ms debounce

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll active item into view during keyboard navigation
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  const saveRecentSearch = useCallback((symbol) => {
    if (!symbol) return;
    setRecentSearches((prev) => {
      const updated = [symbol, ...prev.filter((s) => s.toUpperCase() !== symbol.toUpperCase())].slice(0, 8);
      try {
        localStorage.setItem('equityiq_recent_searches', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save recent search:', e);
      }
      return updated;
    });
  }, []);

  const removeRecentSearch = (e, symbolToRemove) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== symbolToRemove);
      try {
        localStorage.setItem('equityiq_recent_searches', JSON.stringify(updated));
      } catch (err) {
        console.warn(err);
      }
      return updated;
    });
  };

  const clearAllRecentSearches = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem('equityiq_recent_searches');
    } catch (err) {
      console.warn(err);
    }
  };

  const handleSelect = (symbol) => {
    if (!symbol) return;
    const cleanSymbol = symbol.trim().toUpperCase();
    setQuery(cleanSymbol);
    setIsOpen(false);
    saveRecentSearch(cleanSymbol);
    if (onSelectSymbol) {
      onSelectSymbol(cleanSymbol);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setSearchError(null);
    setIsOpen(true);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    // Open on down arrow if closed
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    const activeList = query.trim() ? suggestions : POPULAR_INDIAN_STOCKS;
    const listLength = activeList.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (listLength === 0) return;
      setSelectedIndex((prev) => (prev < listLength - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (listLength === 0) return;
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : listLength - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < listLength) {
        handleSelect(activeList[selectedIndex].symbol);
      } else if (listLength > 0) {
        handleSelect(activeList[0].symbol);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const isQueryEmpty = !query.trim();

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Input Field Container */}
      <div className="relative flex items-center">
        <label htmlFor={`stock-search-input-${variant}`} className="sr-only">
          Search Indian Stocks
        </label>
        <Search
          aria-hidden="true"
          className={`absolute pointer-events-none transition text-slate-400 ${
            isHero ? 'left-4.5 h-5 w-5 text-blue-600' : 'left-3.5 h-4 w-4'
          }`}
        />
        <input
          id={`stock-search-input-${variant}`}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={`stock-search-list-${variant}`}
          aria-activedescendant={
            selectedIndex >= 0 ? `suggestion-item-${variant}-${selectedIndex}` : undefined
          }
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            placeholder ||
            (isHero
              ? 'Search 500+ Indian Stocks by Name, Symbol, Sector (e.g. TCS, HDFC Bank, Banking)...'
              : 'Search NSE Stocks (e.g. RELIANCE, TCS, INFY)...')
          }
          autoComplete="off"
          spellCheck="false"
          className={`w-full bg-white border transition font-medium focus:outline-none ${
            isHero
              ? 'border-slate-300 focus:border-blue-600 focus:ring-8 focus:ring-blue-500/10 rounded-2xl pl-12 pr-24 py-4 text-base text-slate-900 placeholder-slate-400 shadow-lg'
              : 'border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl pl-10 pr-20 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-2xs'
          }`}
        />

        {/* Action Controls (Clear button & Spinner & Badge) */}
        <div className={`absolute right-3 flex items-center gap-1.5 ${isHero ? 'right-4' : 'right-3'}`}>
          {loading && (
            <div
              role="status"
              aria-label="Searching stocks"
              className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0"
            />
          )}

          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search input"
              className="p-1 text-slate-400 hover:text-slate-600 transition rounded-full hover:bg-slate-100"
            >
              <X className={isHero ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
            </button>
          )}

          <span
            className={`font-mono uppercase font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded select-none ${
              isHero ? 'text-xs px-2 py-0.5' : 'text-[10px] px-1.5 py-0.5'
            }`}
          >
            NSE
          </span>
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div
          id={`stock-search-list-${variant}`}
          role="listbox"
          className={`absolute bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[460px] overflow-y-auto divide-y divide-slate-100 animate-in fade-in-50 duration-150 ${
            isHero
              ? 'left-0 right-0 top-full mt-3'
              : 'left-0 sm:left-auto sm:right-0 md:left-0 top-full mt-2 w-[440px] sm:w-[490px] md:w-[540px] max-w-[92vw]'
          }`}
        >
          {/* Recent Searches Section (Shown ONLY when input query is empty) */}
          {isQueryEmpty && recentSearches.length > 0 && (
            <div className="p-3 bg-slate-50/80 border-b border-slate-100">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-slate-400" />
                  Recent Searches
                </span>
                <button
                  type="button"
                  onClick={clearAllRecentSearches}
                  className="text-[10px] text-slate-400 hover:text-rose-600 font-semibold flex items-center gap-1 transition"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((sym) => (
                  <span
                    key={sym}
                    className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-blue-400 hover:text-blue-600 transition shadow-2xs group"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(sym)}
                      className="focus:outline-none"
                    >
                      {sym}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => removeRecentSearch(e, sym)}
                      aria-label={`Remove ${sym} from recent searches`}
                      className="p-0.5 text-slate-300 hover:text-rose-500 rounded transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section Header */}
          <div className="px-4 py-2.5 bg-slate-50/95 backdrop-blur-xs text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between select-none">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-blue-600" />
              {isQueryEmpty ? 'Popular Indian Equities' : 'Search Results'}
            </span>
            {loading ? (
              <span className="text-blue-600 font-semibold flex items-center gap-1 text-[11px]">
                <Sparkles className="h-3 w-3 animate-spin" /> Searching 700+ stocks...
              </span>
            ) : (
              <span className="text-slate-400 font-normal">
                {isQueryEmpty ? `${POPULAR_INDIAN_STOCKS.length} popular` : `${suggestions.length} found`}
              </span>
            )}
          </div>

          {/* Error Message */}
          {searchError && (
            <div className="p-4 bg-amber-50/80 text-amber-900 border-b border-amber-200 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Suggestions List OR Empty State */}
          {!isQueryEmpty && suggestions.length === 0 && !loading ? (
            <div className="px-6 py-10 text-center select-none">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Search className="h-6 w-6" />
              </div>
              <p className="font-bold text-slate-800 text-sm mb-1">
                No matching stocks found for &quot;<span className="text-blue-600">{query.trim()}</span>&quot;
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Check for typos or try searching by standard NSE symbol (e.g., <span className="font-mono font-semibold text-slate-700">TCS</span>, <span className="font-mono font-semibold text-slate-700">SBIN</span>), company name (<span className="font-semibold text-slate-700">Tata Motors</span>), or sector (<span className="font-semibold text-slate-700">Banking, IT</span>).
              </p>
            </div>
          ) : (
            <div className="py-1">
              {(isQueryEmpty ? POPULAR_INDIAN_STOCKS : suggestions).map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const isSectorMatch = item.matchType === 'sector_match' || item.matchType === 'industry_match';
                const isAliasMatch = item.matchType === 'exact_alias' || item.matchType === 'alias_prefix';

                return (
                  <button
                    key={item.symbol}
                    id={`suggestion-item-${variant}-${idx}`}
                    ref={(el) => (itemRefs.current[idx] = el)}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(item.symbol)}
                    className={`w-full text-left px-4 py-3 transition flex items-center justify-between gap-3 group border-l-2 focus:outline-none ${
                      isSelected
                        ? 'bg-blue-50/90 text-blue-950 border-blue-600'
                        : 'hover:bg-slate-50/90 text-slate-800 border-transparent'
                    }`}
                  >
                    {/* Left: Avatar, Symbol, Name & Badges */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <CompanyAvatar symbol={item.symbol} logoUrl={item.logoUrl} />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition tracking-tight font-mono">
                            <HighlightMatch text={item.symbol} query={query} />
                          </span>

                          {item.sector && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-medium shrink-0">
                              <HighlightMatch text={item.sector} query={query} />
                            </span>
                          )}

                          {isSectorMatch && (
                            <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-semibold shrink-0 flex items-center gap-1">
                              <Tag className="h-2.5 w-2.5" /> Sector Match
                            </span>
                          )}

                          {isAliasMatch && (
                            <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded font-semibold shrink-0">
                              Alias Match
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 truncate max-w-[240px] sm:max-w-[320px] mt-0.5">
                          <HighlightMatch text={item.companyName} query={query} />
                        </div>
                      </div>
                    </div>

                    {/* Right: Formatted Price, Market Cap Category & NSE Badge */}
                    <div className="flex items-center gap-2.5 text-right shrink-0">
                      {item.price != null && item.price > 0 && (
                        <div>
                          <div className="text-xs font-bold text-slate-900 font-mono tracking-tight">
                            ₹{Number(item.price).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                          </div>
                          {item.marketCapCategory && (
                            <div className="text-[9px] text-slate-400 uppercase font-semibold">
                              {item.marketCapCategory}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold shrink-0 shadow-2xs">
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
