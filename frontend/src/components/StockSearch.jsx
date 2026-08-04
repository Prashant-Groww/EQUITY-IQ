import { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Building2 } from 'lucide-react';

const POPULAR_INDIAN_STOCKS = [
  { symbol: 'RELIANCE', companyName: 'Reliance Industries Ltd', exchange: 'NSE' },
  { symbol: 'TCS', companyName: 'Tata Consultancy Services Ltd', exchange: 'NSE' },
  { symbol: 'INFY', companyName: 'Infosys Ltd', exchange: 'NSE' },
  { symbol: 'HDFCBANK', companyName: 'HDFC Bank Ltd', exchange: 'NSE' },
  { symbol: 'ICICIBANK', companyName: 'ICICI Bank Ltd', exchange: 'NSE' },
  { symbol: 'SBIN', companyName: 'State Bank of India', exchange: 'NSE' },
  { symbol: 'TATAMOTORS', companyName: 'Tata Motors Ltd', exchange: 'NSE' },
  { symbol: 'LT', companyName: 'Larsen & Toubro Ltd', exchange: 'NSE' },
  { symbol: 'BHARTIARTL', companyName: 'Bharti Airtel Ltd', exchange: 'NSE' },
  { symbol: 'ITC', companyName: 'ITC Ltd', exchange: 'NSE' },
];

export default function StockSearch({ onSelectSymbol, activeSymbol }) {
  const [query, setQuery] = useState(activeSymbol || 'RELIANCE');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced live ticker search handler
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
                  s.companyName.toUpperCase().includes(query.toUpperCase())
              )
            );
          }
        }
      } catch (err) {
        console.error('Failed to search Indian stocks:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol) => {
    setQuery(symbol);
    setIsOpen(false);
    if (onSelectSymbol) {
      onSelectSymbol(symbol);
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search NSE/BSE Stocks (e.g. RELIANCE, TCS, INFY)..."
          className="w-full bg-[#0F172A] border border-slate-700/80 focus:border-blue-500/80 rounded-xl pl-10 pr-12 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition shadow-inner font-medium"
        />
        <span className="absolute right-3 text-[10px] font-mono uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded font-bold">
          NSE
        </span>
      </div>

      {/* Autocomplete Suggestions Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0F172A] border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto divide-y divide-slate-800/60">
          <div className="px-3 py-2 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>NSE/BSE Listed Companies</span>
            {loading && <span className="text-blue-400 animate-pulse">Searching...</span>}
          </div>

          {suggestions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-500 text-center">No matching Indian stocks found</div>
          ) : (
            suggestions.map((item) => (
              <button
                key={item.symbol}
                onClick={() => handleSelect(item.symbol)}
                className="w-full text-left px-4 py-3 hover:bg-blue-600/10 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-blue-400 transition">
                      {item.symbol}
                    </div>
                    <div className="text-xs text-slate-400 truncate max-w-[220px]">
                      {item.companyName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 font-bold">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  {item.exchange || 'NSE'}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
