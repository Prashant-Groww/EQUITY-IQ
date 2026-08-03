import { useEffect, useState } from 'react';
import { Activity, Server, Cpu, Database, CheckCircle2, XCircle, RefreshCw, TrendingUp } from 'lucide-react';

export default function App() {
  const [backendStatus, setBackendStatus] = useState({ loading: true, online: false, data: null });
  const [aiStatus, setAiStatus] = useState({ loading: true, online: false, data: null });

  const checkHealth = async () => {
    setBackendStatus(prev => ({ ...prev, loading: true }));
    setAiStatus(prev => ({ ...prev, loading: true }));

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
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-[#0E1422]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
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

          <button
            onClick={checkHealth}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Status
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
        <section className="bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-slate-900/40 border border-blue-500/20 rounded-2xl p-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            System Initialization & Health Baseline
          </h2>
          <p className="text-slate-300 max-w-3xl text-sm leading-relaxed">
            Welcome to EquityIQ Phase 1 setup. Microservice nodes (Express Backend, FastAPI AI Engine, and MongoDB) have been wired up. Below is the real-time status monitor of your local services.
          </p>
        </section>

        {/* Microservice Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Node Backend Card */}
          <div className="glass-card glass-card-hover rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Server className="h-6 w-6" />
                </div>
                {backendStatus.loading ? (
                  <span className="text-xs text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 flex items-center gap-1.5">
                    <Activity className="h-3 w-3 animate-spin" /> Checking
                  </span>
                ) : backendStatus.online ? (
                  <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Online
                  </span>
                ) : (
                  <span className="text-xs text-rose-400 bg-rose-400/10 px-2.5 py-1 rounded-full border border-rose-400/20 flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5" /> Offline
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-white mb-1">Backend API</h3>
              <p className="text-xs text-slate-400 mb-4">Node.js + Express (Port 5000)</p>

              {backendStatus.data && (
                <div className="bg-slate-900/60 rounded-lg p-3 text-xs font-mono text-slate-300 border border-slate-800 space-y-1">
                  <div><span className="text-slate-500">Service:</span> {backendStatus.data.service}</div>
                  <div><span className="text-slate-500">Status:</span> {backendStatus.data.status}</div>
                </div>
              )}
            </div>
            <div className="mt-6 text-xs text-slate-500">Route: GET /api/health</div>
          </div>

          {/* FastAPI AI Service Card */}
          <div className="glass-card glass-card-hover rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Cpu className="h-6 w-6" />
                </div>
                {aiStatus.loading ? (
                  <span className="text-xs text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 flex items-center gap-1.5">
                    <Activity className="h-3 w-3 animate-spin" /> Checking
                  </span>
                ) : aiStatus.online ? (
                  <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Online
                  </span>
                ) : (
                  <span className="text-xs text-rose-400 bg-rose-400/10 px-2.5 py-1 rounded-full border border-rose-400/20 flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5" /> Offline
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-white mb-1">AI Engine Service</h3>
              <p className="text-xs text-slate-400 mb-4">Python 3.11 + FastAPI (Port 8000)</p>

              {aiStatus.data && (
                <div className="bg-slate-900/60 rounded-lg p-3 text-xs font-mono text-slate-300 border border-slate-800 space-y-1">
                  <div><span className="text-slate-500">Service:</span> {aiStatus.data.service}</div>
                  <div><span className="text-slate-500">Version:</span> {aiStatus.data.version}</div>
                </div>
              )}
            </div>
            <div className="mt-6 text-xs text-slate-500">Route: GET /health</div>
          </div>

          {/* Database Node Card */}
          <div className="glass-card glass-card-hover rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Database className="h-6 w-6" />
                </div>
                <span className="text-xs text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-full border border-blue-400/20">
                  Phase 2 Ready
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">MongoDB & Vector Store</h3>
              <p className="text-xs text-slate-400 mb-4">MongoDB (27017) + ChromaDB</p>

              <p className="text-xs text-slate-300 leading-relaxed">
                Database container standard setup prepared for Phase 2 authentication and user storage.
              </p>
            </div>
            <div className="mt-6 text-xs text-slate-500">URI: mongodb://localhost:27017/equityiq</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        EquityIQ AI Assistant — Monorepo Architecture Baseline (Phase 1)
      </footer>
    </div>
  );
}
