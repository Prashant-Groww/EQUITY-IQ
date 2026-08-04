import { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Scale, BarChart2 } from 'lucide-react';

export default function RiskAnalyticsWidget({ symbol }) {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRisk = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stocks/${symbol}/risk`);
      if (res.ok) {
        const data = await res.json();
        setRiskData(data);
      }
    } catch (err) {
      console.error('Failed to fetch risk analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchRisk();
  }, [fetchRisk]);

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'Low Risk':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
            <CheckCircle className="h-4 w-4" /> Low Volatility Tier
          </span>
        );
      case 'High Risk':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4" /> High Volatility Tier
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4" /> Moderate Risk Tier
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 h-64 animate-pulse flex items-center justify-center text-xs text-slate-500">
        Calculating quantitative ML risk models for {symbol}...
      </div>
    );
  }

  const metrics = riskData?.metrics || {};

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              ML Quantitative Risk & Volatility Model
              <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                GradientBoosting Regressor
              </span>
            </h3>
            <p className="text-xs text-slate-400">Risk parameters evaluated against Nifty 50 benchmark index</p>
          </div>
        </div>

        <div>{getTierBadge(riskData?.risk_tier)}</div>
      </div>

      {/* Risk Score Gauge & Meter */}
      <div className="bg-[#0F172A]/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Quantitative Volatility Risk Score</span>
          <span className="text-xl font-extrabold text-white font-mono">
            {riskData?.risk_score?.toFixed(1)} <span className="text-xs text-slate-500">/ 100</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ${
              (riskData?.risk_score || 0) > 65
                ? 'bg-rose-500'
                : (riskData?.risk_score || 0) > 35
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, riskData?.risk_score || 0))}%` }}
          />
        </div>
      </div>

      {/* Risk Indicators Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Volatility 20D & 60D */}
        <div className="bg-[#0F172A]/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Annualized Volatility</span>
            <Activity className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {((metrics.volatility_20d || 0) * 100).toFixed(1)}% <span className="text-xs text-slate-500 font-sans">(20D)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            60D Volatility: <strong className="text-slate-200">{((metrics.volatility_60d || 0) * 100).toFixed(1)}%</strong>
          </div>
        </div>

        {/* VaR 95% & 99% */}
        <div className="bg-[#0F172A]/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Value at Risk (VaR 95%)</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-400 font-mono">
            - {((metrics.var_95 || 0) * 100).toFixed(2)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            99% Daily VaR: <strong className="text-rose-400">- {((metrics.var_99 || 0) * 100).toFixed(2)}%</strong>
          </div>
        </div>

        {/* Beta vs Nifty 50 */}
        <div className="bg-[#0F172A]/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Beta (vs Nifty 50)</span>
            <Scale className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {(metrics.beta || 1.0).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {(metrics.beta || 1.0) > 1.0 ? 'Higher sensitivity than benchmark' : 'Lower sensitivity than benchmark'}
          </div>
        </div>

        {/* Sharpe Ratio */}
        <div className="bg-[#0F172A]/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Sharpe Ratio (Rf=6.5%)</span>
            <BarChart2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            {(metrics.sharpe_ratio || 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Max Drawdown: <strong className="text-rose-400">- {((metrics.max_drawdown || 0) * 100).toFixed(1)}%</strong>
          </div>
        </div>
      </div>

      {/* Technical Signals: RSI & MACD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0F172A]/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <div>
              <div className="text-xs font-bold text-white">RSI (14-Day Momentum)</div>
              <div className="text-[11px] text-slate-400">
                {metrics.rsi > 70 ? 'Overbought Signal (>70)' : metrics.rsi < 30 ? 'Oversold Signal (<30)' : 'Neutral Momentum Zone'}
              </div>
            </div>
          </div>
          <div className="text-lg font-bold text-white font-mono">{metrics.rsi?.toFixed(1)}</div>
        </div>

        <div className="bg-[#0F172A]/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingDown className="h-5 w-5 text-indigo-400" />
            <div>
              <div className="text-xs font-bold text-white">MACD Histogram (12, 26, 9)</div>
              <div className="text-[11px] text-slate-400">
                {metrics.macd_histogram > 0 ? 'Bullish Crossover Momentum' : 'Bearish Trend Signal'}
              </div>
            </div>
          </div>
          <div
            className={`text-lg font-bold font-mono ${
              (metrics.macd_histogram || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {(metrics.macd_histogram || 0).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
