import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Briefcase,
  Bookmark,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
} from 'lucide-react';

export default function PortfolioWidget({ activeSymbol, onSelectSymbol }) {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add / Edit Position Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formSymbol, setFormSymbol] = useState(activeSymbol || '');
  const [formQty, setFormQty] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // AI Optimization State
  const [aiOptimization, setAiOptimization] = useState(null);
  const [optimizing, setOptimizing] = useState(false);

  const fetchPortfolio = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/portfolio', {
        headers: { 'x-guest-id': 'equityiq_demo_guest' },
      });
      if (res.ok) {
        const json = await res.json();
        setPortfolioData(json.data);
      } else {
        setError('Failed to load portfolio data');
      }
    } catch {
      setError('Unable to connect to portfolio server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleAddHolding = async (e) => {
    e.preventDefault();
    if (!formSymbol || !formQty || !formPrice) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/portfolio/holdings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-id': 'equityiq_demo_guest',
        },
        body: JSON.stringify({
          symbol: formSymbol.toUpperCase(),
          quantity: parseFloat(formQty),
          avgBuyPrice: parseFloat(formPrice),
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setPortfolioData(json.data);
        setShowAddForm(false);
        setFormQty('');
        setFormPrice('');
        setAiOptimization(null);
      }
    } catch (err) {
      console.error('Failed to add holding', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveHolding = async (symbol) => {
    try {
      const res = await fetch(`/api/portfolio/holdings/${encodeURIComponent(symbol)}`, {
        method: 'DELETE',
        headers: { 'x-guest-id': 'equityiq_demo_guest' },
      });
      if (res.ok) {
        const json = await res.json();
        setPortfolioData(json.data);
        setAiOptimization(null);
      }
    } catch (err) {
      console.error('Failed to remove holding', err);
    }
  };

  const handleToggleWatchlist = async (symbolToToggle) => {
    const targetSymbol = symbolToToggle || activeSymbol;
    if (!targetSymbol) return;
    try {
      const res = await fetch('/api/portfolio/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-id': 'equityiq_demo_guest',
        },
        body: JSON.stringify({ symbol: targetSymbol }),
      });
      if (res.ok) {
        const json = await res.json();
        setPortfolioData((prev) => ({
          ...prev,
          watchlist: json.data.watchlist,
        }));
      }
    } catch (err) {
      console.error('Failed to toggle watchlist', err);
    }
  };

  const handleRunAiOptimization = async () => {
    setOptimizing(true);
    try {
      const res = await fetch('/api/portfolio/optimize', {
        method: 'POST',
        headers: { 'x-guest-id': 'equityiq_demo_guest' },
      });
      if (res.ok) {
        const json = await res.json();
        setAiOptimization(json.data);
      }
    } catch (err) {
      console.error('AI portfolio optimization failed', err);
    } finally {
      setOptimizing(false);
    }
  };

  const isCurrentSymbolWatchlisted = portfolioData?.watchlist?.some(
    (w) => w.symbol === activeSymbol?.toUpperCase()
  );

  return (
    <div className="bg-[#131A29]/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col gap-6">
      {/* Header & Watchlist Toggle Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">Portfolio & Watchlist Analytics</h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ₹ INR Indian Market
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live Holdings Valuation, Watchlist Strip & AI Rebalancing Advisor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleWatchlist(activeSymbol)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition border shadow-sm ${
              isCurrentSymbolWatchlisted
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isCurrentSymbolWatchlisted ? 'fill-amber-400 text-amber-400' : ''}`} />
            {isCurrentSymbolWatchlisted ? `Remove ${activeSymbol} from Watchlist` : `Watchlist ${activeSymbol}`}
          </button>

          <button
            onClick={() => {
              setFormSymbol(activeSymbol || '');
              setShowAddForm(!showAddForm);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition"
          >
            <Plus className="h-4 w-4" />
            Add Position
          </button>

          <button
            onClick={fetchPortfolio}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700"
            title="Refresh Portfolio Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Watchlist Horizontal Strip */}
      {portfolioData?.watchlist?.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-400">
              <Bookmark className="h-3.5 w-3.5 text-amber-400" /> Watchlist Tickers ({portfolioData.watchlist.length})
            </span>
            <span className="text-[11px] text-slate-500">Click symbol to switch workspace view</span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
            {portfolioData.watchlist.map((item) => {
              const isPositive = item.change >= 0;
              const isSelected = item.symbol === activeSymbol;
              return (
                <button
                  key={item.id || item.symbol}
                  onClick={() => onSelectSymbol(item.symbol)}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs border transition shrink-0 ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10 ring-1 ring-blue-500/50'
                      : 'bg-[#0E1422]/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-white font-mono flex items-center gap-1">
                      {item.symbol}
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[90px]">{item.companyName}</span>
                  </div>

                  <div className="flex flex-col items-end pl-2 border-l border-slate-800 font-mono">
                    <span className="font-bold text-slate-200">₹{item.price?.toLocaleString('en-IN')}</span>
                    <span
                      className={`text-[10px] font-semibold flex items-center ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {isPositive ? '+' : ''}
                      {item.changePct}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Position Form Modal / Collapsible */}
      {showAddForm && (
        <form
          onSubmit={handleAddHolding}
          className="bg-[#0E1422] border border-blue-500/30 rounded-xl p-4 flex flex-col md:flex-row items-end gap-4 shadow-lg shadow-blue-500/5"
        >
          <div className="flex-1 w-full flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Ticker Symbol</label>
            <input
              type="text"
              value={formSymbol}
              onChange={(e) => setFormSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. RELIANCE, TCS"
              className="w-full bg-[#131A29] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              required
            />
          </div>

          <div className="flex-1 w-full flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Shares (Quantity)</label>
            <input
              type="number"
              step="any"
              value={formQty}
              onChange={(e) => setFormQty(e.target.value)}
              placeholder="e.g. 50"
              className="w-full bg-[#131A29] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              required
            />
          </div>

          <div className="flex-1 w-full flex flex-col gap-1">
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Avg Buy Price (₹)</label>
            <input
              type="number"
              step="any"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
              placeholder="e.g. 1250.00"
              className="w-full bg-[#131A29] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              required
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
            >
              {submitting ? 'Saving...' : 'Save Holding'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Portfolio Financial Valuation Cards */}
      {loading ? (
        <div className="py-8 flex items-center justify-center gap-2 text-slate-400 text-sm">
          <Activity className="h-5 w-5 animate-spin text-blue-400" /> Calculating real-time portfolio metrics...
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      ) : portfolioData?.summary ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Value Card */}
            <div className="bg-[#0E1422] border border-slate-800/80 rounded-xl p-4 flex flex-col gap-1 relative overflow-hidden">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Portfolio Value</span>
              <div className="text-xl font-bold text-white font-mono">
                ₹{portfolioData.summary.totalCurrentValue?.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 font-medium">
                Cost Basis: ₹{portfolioData.summary.totalInvestment?.toLocaleString('en-IN')}
              </span>
              <div className="absolute top-3 right-3 text-blue-500/20">
                <Briefcase className="h-8 w-8" />
              </div>
            </div>

            {/* Total Return Card */}
            <div className="bg-[#0E1422] border border-slate-800/80 rounded-xl p-4 flex flex-col gap-1 relative overflow-hidden">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Return (Unrealized)</span>
              <div
                className={`text-xl font-bold font-mono flex items-center gap-1 ${
                  portfolioData.summary.totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {portfolioData.summary.totalProfitLoss >= 0 ? '+' : ''}
                ₹{portfolioData.summary.totalProfitLoss?.toLocaleString('en-IN')}
                <span className="text-xs">({portfolioData.summary.totalProfitLossPct}%)</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 font-medium">Lifetime Portfolio P&L</span>
              <div className="absolute top-3 right-3 opacity-20">
                {portfolioData.summary.totalProfitLoss >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-rose-400" />
                )}
              </div>
            </div>

            {/* Day's Change Card */}
            <div className="bg-[#0E1422] border border-slate-800/80 rounded-xl p-4 flex flex-col gap-1 relative overflow-hidden">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Day&apos;s Gain / Loss</span>
              <div
                className={`text-xl font-bold font-mono flex items-center gap-1 ${
                  portfolioData.summary.dayGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {portfolioData.summary.dayGainLoss >= 0 ? '+' : ''}
                ₹{portfolioData.summary.dayGainLoss?.toLocaleString('en-IN')}
                <span className="text-xs">({portfolioData.summary.dayGainLossPct}%)</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 font-medium">Session P&L vs Prev Close</span>
              <div className="absolute top-3 right-3 text-indigo-500/20">
                <Activity className="h-8 w-8" />
              </div>
            </div>

            {/* Holdings & AI Rating */}
            <div className="bg-[#0E1422] border border-slate-800/80 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Holdings & AI Advisor</span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-white font-mono">
                  {portfolioData.summary.holdingsCount} Stock Positions
                </span>
                <button
                  onClick={handleRunAiOptimization}
                  disabled={optimizing || portfolioData.summary.holdingsCount === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-md shadow-blue-500/20"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${optimizing ? 'animate-spin' : ''}`} />
                  {optimizing ? 'Analyzing...' : 'AI Health Check'}
                </button>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Click AI Health Check for rebalancing insights
              </span>
            </div>
          </div>

          {/* AI Rebalancing & Portfolio Optimization Card */}
          {aiOptimization && (
            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E1B4B]/70 border border-indigo-500/30 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
                  <h4 className="text-sm font-bold text-white tracking-tight">AI Portfolio Optimization & Rebalancing Report</h4>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-500/30">
                    <span className="text-xs text-slate-400 font-medium">Diversification:</span>
                    <span className="text-sm font-bold text-indigo-300 font-mono">
                      {aiOptimization.diversification_score}/100
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-500/30">
                    <span className="text-xs text-slate-400 font-medium">Portfolio Beta:</span>
                    <span className="text-sm font-bold text-indigo-300 font-mono">
                      {aiOptimization.portfolio_beta}
                    </span>
                  </div>
                </div>
              </div>

              {/* Concentration Risk Alert */}
              {aiOptimization.concentration_risk && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Concentration Alert:</span> Single position allocation exceeds 30% of total capital. Rebalancing recommended to mitigate single-stock drawdowns.
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {aiOptimization.summary}
              </p>

              {/* Recommendations Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {aiOptimization.recommendations?.map((rec) => (
                  <div
                    key={rec.symbol}
                    className="bg-[#0E1422]/90 border border-slate-800 rounded-lg p-3 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-mono text-xs">{rec.symbol}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          rec.action === 'REBALANCE_REDUCE'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : rec.action === 'ACCUMULATE'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        }`}
                      >
                        {rec.action.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Current: {rec.current_weight_pct}%</span>
                      <span>Target: {rec.target_weight_pct}%</span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-tight mt-1">{rec.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Holdings & Positions Table */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-blue-400" /> Current Stock Holdings & Asset Allocation
              </h4>
              <span className="text-xs text-slate-500">Live Indian Market Quotes</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0E1422]/70">
              <table className="w-full text-left text-xs text-slate-300 font-sans">
                <thead className="bg-[#131A29] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Symbol & Company</th>
                    <th className="py-3 px-4 text-right">Shares</th>
                    <th className="py-3 px-4 text-right">Avg Price</th>
                    <th className="py-3 px-4 text-right">LTP (₹)</th>
                    <th className="py-3 px-4 text-right">Cost Basis</th>
                    <th className="py-3 px-4 text-right">Current Value</th>
                    <th className="py-3 px-4 text-right">Allocation</th>
                    <th className="py-3 px-4 text-right">P&L (Unrealized)</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {portfolioData.holdings?.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-6 text-center text-slate-500 font-sans text-xs">
                        No positions added yet. Click &quot;Add Position&quot; to build your portfolio.
                      </td>
                    </tr>
                  ) : (
                    portfolioData.holdings?.map((h) => {
                      const isProfit = h.unrealizedPL >= 0;
                      return (
                        <tr key={h.id || h.symbol} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 px-4 font-bold text-white">
                            <button
                              onClick={() => onSelectSymbol(h.symbol)}
                              className="text-left hover:text-blue-400 transition"
                            >
                              <div className="font-mono text-xs">{h.symbol}</div>
                              <div className="text-[10px] font-sans text-slate-400 font-normal truncate max-w-[140px]">
                                {h.companyName}
                              </div>
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">{h.quantity}</td>
                          <td className="py-3 px-4 text-right">₹{h.avgBuyPrice?.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-right font-bold text-white">
                            ₹{h.currentPrice?.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-400">
                            ₹{h.costBasis?.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-200">
                            ₹{h.currentValue?.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-blue-400 font-sans">
                            {h.allocationPct}%
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-bold ${
                              isProfit ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isProfit ? '+' : ''}₹{h.unrealizedPL?.toLocaleString('en-IN')}
                            <div className="text-[10px] font-normal">
                              ({isProfit ? '+' : ''}
                              {h.unrealizedPLPct}%)
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleRemoveHolding(h.symbol)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                              title="Delete Holding"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

PortfolioWidget.propTypes = {
  activeSymbol: PropTypes.string.isRequired,
  onSelectSymbol: PropTypes.func.isRequired,
};
