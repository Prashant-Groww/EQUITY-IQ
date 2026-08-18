import { useState, useEffect } from 'react';
import { Award, ShieldCheck, CheckCircle2, AlertTriangle, BarChart3 } from 'lucide-react';

export default function MLRatingWidget({ symbol }) {
  const [ratingData, setRatingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;
    const fetchRating = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/stocks/${symbol}/rating`);
        if (res.ok) {
          const data = await res.json();
          setRatingData(data);
        }
      } catch (err) {
        console.error('Failed to fetch ML rating:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRating();
  }, [symbol]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-slate-100 rounded w-1/3" />
        <div className="h-20 bg-slate-100 rounded-xl" />
        <div className="h-32 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (!ratingData) return null;

  const {
    recommendation,
    confidence_pct,
    overall_score,
    positive_factors = [],
    negative_factors = [],
    rationale,
    factors = [],
    feature_importances = {},
  } = ratingData;

  const getBadgeStyle = (rec) => {
    switch (rec) {
      case 'STRONG_BUY':
        return 'bg-emerald-600 text-white border-emerald-700 shadow-md';
      case 'BUY':
        return 'bg-emerald-500 text-white border-emerald-600 shadow-sm';
      case 'HOLD':
        return 'bg-amber-500 text-white border-amber-600 shadow-sm';
      case 'SELL':
        return 'bg-rose-500 text-white border-rose-600 shadow-sm';
      case 'STRONG_SELL':
        return 'bg-rose-700 text-white border-rose-800 shadow-md';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">AI ML Stock Rating & Explainability</h3>
            <p className="text-xs text-slate-500">Multi-factor quantitative rating model for {symbol}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Confidence:</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
            {confidence_pct}%
          </span>
        </div>
      </div>

      {/* Main Score & Recommendation Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ML Rating</span>
          <span className={`px-4 py-1.5 rounded-xl font-extrabold text-sm border tracking-wide uppercase ${getBadgeStyle(recommendation)}`}>
            {recommendation ? recommendation.replace('_', ' ') : 'HOLD'}
          </span>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">{overall_score}</span>
            <span className="text-xs text-slate-400 font-medium">/ 100 Score</span>
          </div>
        </div>

        <div className="md:col-span-2 bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Why this rating? (Model Rationale)
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {rationale}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-blue-100/60 flex items-center justify-between text-[11px] text-blue-800 font-medium">
            <span>Evaluated across Valuation, Profitability & Solvency</span>
            <span className="font-bold text-blue-600">Explainable Model</span>
          </div>
        </div>
      </div>

      {/* Positive & Negative Factors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Positive Factors */}
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex flex-col gap-2.5">
          <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Key Positive Factors
          </h4>
          <ul className="space-y-1.5 text-xs text-emerald-950 font-medium">
            {positive_factors.length > 0 ? (
              positive_factors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{factor}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">No significant positive drivers identified.</li>
            )}
          </ul>
        </div>

        {/* Negative Factors */}
        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex flex-col gap-2.5">
          <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Key Negative Factors
          </h4>
          <ul className="space-y-1.5 text-xs text-amber-950 font-medium">
            {negative_factors.length > 0 ? (
              negative_factors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">⚠</span>
                  <span>{factor}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">No major risks identified.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Factor Breakdown List */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
          Factor Weight Contribution Breakdown
        </h4>
        <div className="space-y-2.5">
          {factors.map((f) => (
            <div key={f.name} className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">{f.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">Weight: {f.weight_pct}%</span>
                  <span className="font-bold text-slate-900">{f.score_contribution} pts</span>
                </div>
              </div>
              <p className="text-xs text-slate-600">{f.details}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Importance / SHAP Visualizer */}
      {feature_importances && Object.keys(feature_importances).length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            SHAP / Feature Importance Contribution Matrix
          </h4>
          <div className="space-y-2">
            {Object.entries(feature_importances).map(([feat, weight]) => {
              const pct = Math.round(weight * 100);
              return (
                <div key={feat} className="flex items-center gap-3 text-xs">
                  <span className="w-48 font-medium text-slate-700 truncate">{feat}</span>
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${pct * 3}%` }} />
                  </div>
                  <span className="w-10 text-right font-bold text-slate-800">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
