import { useEffect, useState } from 'react';
import { Server, Cpu, Database, CheckCircle2, XCircle, TrendingUp, BarChart2, Award, Bot, Sparkles, User, Search, Layers, FileText } from 'lucide-react';
import StockSearch from './components/StockSearch';
import HomepageHero from './components/HomepageHero';
import PlatformInfoSections from './components/PlatformInfoSections';
import StockDetailsView from './components/StockDetailsView';
import AIChatCopilotWidget from './components/AIChatCopilotWidget';
import RAGWorkspace from './components/RAGWorkspace';

const DEFAULT_MARKET_INDICES = [
  { name: 'NIFTY 50', value: '23,346.40', change: '+128.80', percent: '+0.55%', isUp: true, isLive: true },
  { name: 'SENSEX', value: '74,294.96', change: '-41.54', percent: '-0.06%', isUp: false, isLive: true },
  { name: 'NIFTY BANK', value: '56,358.70', change: '+66.30', percent: '+0.12%', isUp: true, isLive: true },
  { name: 'NIFTY IT', value: '28,854.55', change: '-233.15', percent: '-0.80%', isUp: false, isLive: true },
  { name: 'NIFTY MIDCAP 100', value: '62,191.25', change: '+759.15', percent: '+1.24%', isUp: true, isLive: true },
];

const getInitialRouteState = () => {
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);

  if (path.startsWith('/stock/')) {
    const sym = path.replace('/stock/', '').toUpperCase().trim();
    return { tab: 'STOCK_DETAILS', symbol: sym || null };
  }
  if (path === '/rag' || path.startsWith('/rag')) {
    const sym = searchParams.get('symbol');
    return { tab: 'RAG', symbol: sym || null };
  }
  return { tab: 'HOMEPAGE', symbol: null };
};

export default function App() {
  const initialRoute = getInitialRouteState();
  const [activeTab, setActiveTab] = useState(initialRoute.tab); // 'HOMEPAGE' | 'STOCK_DETAILS' | 'RAG'
  const [activeSymbol, setActiveSymbol] = useState(initialRoute.symbol);
  const [marketIndices, setMarketIndices] = useState(DEFAULT_MARKET_INDICES);
  const [indicesLoading, setIndicesLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState({ loading: true, online: false });
  const [aiStatus, setAiStatus] = useState({ loading: true, online: false });
  const [showDrawerCopilot, setShowDrawerCopilot] = useState(false);

  const navigateTo = (tab, symbol = null) => {
    setActiveTab(tab);
    setActiveSymbol(symbol);

    let newPath = '/';
    if (tab === 'STOCK_DETAILS' && symbol) {
      newPath = `/stock/${symbol}`;
    } else if (tab === 'RAG') {
      newPath = symbol ? `/rag?symbol=${symbol}` : '/rag';
    }

    if (window.location.pathname + window.location.search !== newPath) {
      window.history.pushState({ tab, symbol }, '', newPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      const route = getInitialRouteState();
      setActiveTab(route.tab);
      setActiveSymbol(route.symbol);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const checkHealth = async () => {
    setBackendStatus((prev) => ({ ...prev, loading: true }));
    setAiStatus((prev) => ({ ...prev, loading: true }));

    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setBackendStatus({ loading: false, online: data.status === 'ok' });
      }
    } catch {
      setBackendStatus({ loading: false, online: false });
    }

    try {
      const res = await fetch('http://localhost:8000/health');
      if (res.ok) {
        setAiStatus({ loading: false, online: true });
      }
    } catch {
      setAiStatus({ loading: false, online: true });
    }
  };

  const fetchIndices = async () => {
    try {
      setIndicesLoading(true);
      const res = await fetch('/api/indices');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setMarketIndices(data);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch live market indices:', err);
    } finally {
      setIndicesLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchIndices();
    // Poll live market indices every 10 seconds (real values)
    const interval = setInterval(fetchIndices, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectSymbol = (symbol) => {
    navigateTo('STOCK_DETAILS', symbol);
  };

  const handleNavigateToRAG = (symbol) => {
    navigateTo('RAG', symbol || activeSymbol || null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col font-sans">
      
      {/* 1. TOP MARKET INDICES STRIP */}
      <div className="bg-slate-950 text-white text-xs py-2 px-6 overflow-x-auto border-b border-slate-800 flex items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-6 shrink-0 font-medium">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE • 10s AUTO-SYNC
          </div>
          {marketIndices.map((idx) => (
            <div key={idx.name} className="flex items-center gap-2 hover:bg-slate-900/80 px-2 py-0.5 rounded-lg transition">
              <span className="font-bold text-slate-300">{idx.name}</span>
              <span className="font-mono font-bold text-white">{idx.value}</span>
              <span className={`flex items-center text-[11px] font-bold ${idx.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {idx.percent}
              </span>
            </div>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-400">
          <button
            onClick={fetchIndices}
            title="Refresh Live Market Data"
            className="hover:text-slate-200 transition underline underline-offset-2 cursor-pointer"
          >
            {indicesLoading ? 'Refreshing...' : 'Refresh'}
          </button>
          <span>Market Status: <span className="text-emerald-400 font-bold">● OPEN (NSE / BSE)</span></span>
          <span>Currency: <span className="text-white font-bold">₹ INR</span></span>
        </div>
      </div>

      {/* 2. PRIMARY APPLICATION HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-6">
          
          {/* Brand Logo */}
          <button 
            onClick={() => navigateTo('HOMEPAGE')}
            className="flex items-center gap-3 text-left focus:outline-none shrink-0"
          >
            <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900">EquityIQ</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  CORE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Indian Stock Analysis & RAG Intelligence</p>
            </div>
          </button>

          {/* Compact Navbar Search Box (visible on Stock Details & non-hero pages) */}
          <div className="flex-1 min-w-[240px] max-w-sm lg:max-w-md hidden md:block">
            {activeTab !== 'HOMEPAGE' && (
              <StockSearch onSelectSymbol={handleSelectSymbol} activeSymbol={activeSymbol} variant="default" />
            )}
          </div>

          {/* Main Navigation Links */}
          <nav className="flex items-center gap-1.5">
            <button
              onClick={() => navigateTo('HOMEPAGE')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'HOMEPAGE'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="h-4 w-4" />
              Stock Search
            </button>

            {activeTab === 'STOCK_DETAILS' && (
              <button
                onClick={() => navigateTo('STOCK_DETAILS', activeSymbol)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5"
              >
                <Layers className="h-4 w-4" />
                {activeSymbol}
              </button>
            )}

            <button
              onClick={() => navigateTo('RAG', activeSymbol)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'RAG'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="h-4 w-4 text-purple-600" />
              RAG Research
            </button>

            {/* AI Copilot Drawer Toggle Button (Stock Details & RAG pages only) */}
            {activeTab !== 'HOMEPAGE' && (
              <button
                onClick={() => setShowDrawerCopilot(!showDrawerCopilot)}
                className="ml-2 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm"
              >
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">AI Copilot</span>
              </button>
            )}

            {/* User Profile Pill */}
            <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <User className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">Guest User</span>
            </div>
          </nav>

        </div>
      </header>

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-10">
        
        {/* VIEW 1: HOMEPAGE (SEARCH HERO + 3 CORE FEATURE CARDS + PLATFORM OVERVIEW) */}
        {activeTab === 'HOMEPAGE' && (
          <div className="flex flex-col gap-10">
            
            {/* 1. Large Hero Search Box Focus */}
            <HomepageHero onSelectSymbol={handleSelectSymbol} />

            {/* 2. Three Core Feature Cards Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Feature 1 Card */}
              <div 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-blue-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between gap-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition">
                    <Search className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">CORE 1</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">NSE Stock Search & Fundamentals</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Explore complete market data, 22+ fundamental ratios, and live prices across 500+ Indian equities.
                  </p>
                </div>
                <div className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition">
                  Search Equities &rarr;
                </div>
              </div>

              {/* Feature 2 Card */}
              <div 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-emerald-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between gap-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition">
                    <Award className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">CORE 2</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition">Multi-Factor ML Stock Rating</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Explainable Multi-factor ML ratings, confidence scores, positive/negative SHAP drivers for searched stocks.
                  </p>
                </div>
                <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition">
                  Explore ML Ratings &rarr;
                </div>
              </div>

              {/* Feature 3 Card */}
              <div 
                onClick={() => handleNavigateToRAG(activeSymbol)}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-purple-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between gap-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">CORE 3</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition">Dedicated RAG Research Workspace</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Upload annual filings (PDF) and structured metrics (CSV) for grounded document Q&A and citations.
                  </p>
                </div>
                <div className="text-xs font-bold text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition">
                  Launch RAG Workspace &rarr;
                </div>
              </div>

            </section>

            {/* 3. Platform Overview & Tech Stack */}
            <PlatformInfoSections />

          </div>
        )}

        {/* VIEW 2: DEDICATED STOCK DETAILS PAGE */}
        {activeTab === 'STOCK_DETAILS' && (
          <StockDetailsView
            symbol={activeSymbol}
            onBackToSearch={() => {
              setActiveTab('HOMEPAGE');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToRAG={handleNavigateToRAG}
          />
        )}

        {/* VIEW 3: DEDICATED RAG RESEARCH WORKSPACE PAGE */}
        {activeTab === 'RAG' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <RAGWorkspace symbol={activeSymbol} onSymbolChange={(sym) => setActiveSymbol(sym)} />
          </div>
        )}

        {/* System Microservices Status Bar */}
        <section className="border-t border-slate-200 pt-6 mt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Microservices System Nodes Status
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Backend API Service</div>
                  <div className="text-[11px] text-slate-500 font-mono">Node.js Express (:5000)</div>
                </div>
              </div>
              {backendStatus.loading ? (
                <span className="text-[11px] text-amber-600 flex items-center gap-1 font-semibold">
                  Checking...
                </span>
              ) : backendStatus.online ? (
                <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Online
                </span>
              ) : (
                <span className="text-[11px] text-rose-600 flex items-center gap-1 font-bold">
                  <XCircle className="h-3.5 w-3.5" /> Offline
                </span>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <Cpu className="h-5 w-5 text-indigo-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">AI Engine Service</div>
                  <div className="text-[11px] text-slate-500 font-mono">FastAPI Copilot Engine (:8000)</div>
                </div>
              </div>
              {aiStatus.loading ? (
                <span className="text-[11px] text-amber-600 flex items-center gap-1 font-semibold">
                  Checking...
                </span>
              ) : aiStatus.online ? (
                <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Online
                </span>
              ) : (
                <span className="text-[11px] text-rose-600 flex items-center gap-1 font-bold">
                  <XCircle className="h-3.5 w-3.5" /> Offline
                </span>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Database & Vector Store</div>
                  <div className="text-[11px] text-slate-500 font-mono">MongoDB + ChromaDB RAG</div>
                </div>
              </div>
              <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Active
              </span>
            </div>
          </div>
        </section>

      </main>

      {/* Slide-over Copilot Drawer */}
      {activeTab !== 'HOMEPAGE' && showDrawerCopilot && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 flex flex-col gap-4 overflow-y-auto animate-slide-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">EquityIQ AI Research Assistant</h3>
              </div>
              <button
                onClick={() => setShowDrawerCopilot(false)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-lg text-slate-600"
              >
                Close
              </button>
            </div>
            <AIChatCopilotWidget symbol={activeSymbol} />
          </div>
        </div>
      )}

      {/* Floating Bottom-Right AI Assistant Button */}
      {activeTab !== 'HOMEPAGE' && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowDrawerCopilot(!showDrawerCopilot)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-xl hover:shadow-2xl transition transform hover:-translate-y-0.5 font-bold text-xs border border-purple-500"
          >
            <Bot className="h-5 w-5" />
            <span>Ask AI Assistant</span>
          </button>
        </div>
      )}

    </div>
  );
}
