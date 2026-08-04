import { useEffect, useState } from 'react';
import { Activity, Server, Cpu, Database, CheckCircle2, XCircle, RefreshCw, TrendingUp } from 'lucide-react';
import StockSearch from './components/StockSearch';
import StockChart from './components/StockChart';
import FinancialMetrics from './components/FinancialMetrics';
import NewsFeed from './components/NewsFeed';
import SentimentWidget from './components/SentimentWidget';

export default function App() {
  const [backendStatus, setBackendStatus] = useState({ loading: true, online: false, data: null });
  const [aiStatus, setAiStatus] = useState({ loading: true, online: false, data: null });
  const [activeSymbol, setActiveSymbol] = useState('AAPL');

  const checkHealth = async () => {
    setBackendStatus((prev) => ({ ...prev, loading: true }));
    setAiStatus((prev) => ({ ...prev, loading: true }));

    // Check Backend API
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setBackendStatus({ loading: false, online: true, data });
      } else {
        setBackendStatus({ loading: false, online: false, data: null });
      }
    } catch {
      setBackendStatus({ loading: false, online: false, data: null });
    }

    // Check AI Service via direct or backend proxy
    try {
      const res = await fetch('http://localhost:8000/health');
      if (res.ok) {
        const data = await res.json();
        setAiStatus({ loading: false, online: true, data });
      } else {
        setAiStatus({ loading: false, online: false, data: null });
      }
    } catch {
      setAiStatus({ loading: false, online: false, data: null });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-[#0E1422]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                EquityIQ
              </h1>
              <p className="text-xs text-slate-400 font-medium">AI-Powered Equity Research Assistant</p>
            </div>
          </div>

          <div className="flex-1 flex justify-center max-w-lg">
            <StockSearch onSelectSymbol={setActiveSymbol} activeSymbol={activeSymbol} />
          </div>

          <button
            onClick={checkHealth}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Nodes
          </button>
        </div>
      </header>

      {/* Main Research Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Stock Data & ML Sentiment Section */}
        <section className="flex flex-col gap-8">
          <StockChart symbol={activeSymbol} />
          <FinancialMetrics symbol={activeSymbol} />
          <SentimentWidget />
          <NewsFeed symbol={activeSymbol} />
        </section>

        {/* Microservice System Nodes Status Bar */}
        <section className="border-t border-slate-800/80 pt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            System Infrastructure Nodes Status
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Backend Node */}
            <div className="bg-[#131A29]/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="text-xs font-bold text-white">Backend API Service</div>
                  <div className="text-[11px] text-slate-400 font-mono">Node.js Express (:5000)</div>
                </div>
              </div>
              {backendStatus.loading ? (
                <span className="text-[11px] text-amber-400 flex items-center gap-1">
                  <Activity className="h-3 w-3 animate-spin" /> Checking
                </span>
              ) : backendStatus.online ? (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Online
                </span>
              ) : (
                <span className="text-[11px] text-rose-400 flex items-center gap-1 font-bold">
                  <XCircle className="h-3.5 w-3.5" /> Offline
                </span>
              )}
            </div>

            {/* FastAPI AI Service */}
            <div className="bg-[#131A29]/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cpu className="h-5 w-5 text-indigo-400" />
                <div>
                  <div className="text-xs font-bold text-white">AI Engine Service</div>
                  <div className="text-[11px] text-slate-400 font-mono">FastAPI ML Sentiment (:8000)</div>
                </div>
              </div>
              {aiStatus.loading ? (
                <span className="text-[11px] text-amber-400 flex items-center gap-1">
                  <Activity className="h-3 w-3 animate-spin" /> Checking
                </span>
              ) : aiStatus.online ? (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Online
                </span>
              ) : (
                <span className="text-[11px] text-rose-400 flex items-center gap-1 font-bold">
                  <XCircle className="h-3.5 w-3.5" /> Offline
                </span>
              )}
            </div>

            {/* Mongo & Vector Store */}
            <div className="bg-[#131A29]/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-white">Database & Vector Store</div>
                  <div className="text-[11px] text-slate-400 font-mono">MongoDB + Models Store</div>
                </div>
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Active
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        EquityIQ AI Assistant — Phase 5 ML Sentiment Classifier Workspace
      </footer>
    </div>
  );
}
