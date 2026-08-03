import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, TrendingUp, Building2 } from 'lucide-react';

export default function StockSearch({ onSelectSymbol, activeSymbol }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Failed to search stocks:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (symbol) => {
    onSelectSymbol(symbol);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-xl" ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search company or ticker (e.g. AAPL, MSFT, NVDA)... Current: ${activeSymbol}`}
          className="w-full bg-[#131A29] border border-slate-800 focus:border-blue-500 rounded-xl py-3.5 pl-12 pr-10 text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition shadow-lg shadow-black/20"
        />
        {loading && (
          <Loader2 className="absolute right-4 h-5 w-5 text-blue-400 animate-spin" />
        )}
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#131A29] border border-slate-700/60 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800/60">
          {results.map((item) => (
            <button
              key={item.symbol}
              onClick={() => handleSelect(item.symbol)}
              className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-blue-600/10 text-left transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-blue-500/20 text-slate-300 group-hover:text-blue-400 transition">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm group-hover:text-blue-400 transition">
                    {item.symbol}
                  </div>
                  <div className="text-xs text-slate-400 truncate max-w-xs">{item.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {item.exchange}
                </span>
                <TrendingUp className="h-4 w-4 text-slate-600 group-hover:text-blue-400 transition" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
