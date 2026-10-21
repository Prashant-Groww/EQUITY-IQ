import { useState, useEffect } from 'react';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Activity,
  Layers,
  Scale,
  Clock,
  Info,
  Database
} from 'lucide-react';

export default function MLRatingWidget({ symbol }) {
  const [ratingData, setRatingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    const fetchRating = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/stocks/${symbol}/rating`);
        if (!res.ok) {
          throw new Error(`Rating API responded with status ${res.status}`);
        }
        const data = await res.json();
        setRatingData(data);
      } catch (err) {
        console.error('Failed to fetch ML rating:', err);
        setError('ML Rating currently unavailable for this symbol.');
      } finally {
        setLoading(false);
      }
    };
    fetchRating();
  }, [symbol]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs animate-pulse space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-slate-200 rounded-lg w-1/3" />
          <div className="h-6 bg-slate-200 rounded-lg w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-slate-100 rounded-2xl" />
          <div className="h-32 md:col-span-2 bg-slate-100 rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !ratingData) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-xs">
        <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm font-bold text-slate-700">{error || 'Rating data unavailable'}</p>
        <p className="text-xs text-slate-400 mt-1">Please try refreshing or select another stock.</p>
      </div>
    );
  }

  const {
    symbol: stockSymbol,
    company_name,
    recommendation,
    confidence_pct,
    overall_score,
    data_completeness_pct = 100.0,
    data_freshness,
    model_version = 'EquityIQ-v2.1-CalibratedEnsemble',
    positive_factors = [],
    negative_factors = [],
    risk_indicators = [],
    category_probabilities = {},
    rationale,
    factors = [],
    pillars = {},
    feature_importances = {},
  } = ratingData;

  const isInsufficient = recommendation === 'INSUFFICIENT_DATA';

  const getBadgeStyle = (rec) => {
    switch (rec) {
      case 'STRONG_BUY':
        return 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-600/20';
      case 'BUY':
        return 'bg-teal-600 text-white border-teal-700 shadow-xs';
      case 'HOLD':
        return 'bg-amber-500 text-white border-amber-600 shadow-xs';
      case 'SELL':
        return 'bg-orange-600 text-white border-orange-700 shadow-xs';
      case 'STRONG_SELL':
        return 'bg-rose-700 text-white border-rose-800 shadow-md shadow-rose-700/20';
      case 'INSUFFICIENT_DATA':
        return 'bg-slate-500 text-white border-slate-600';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  const getPillarColor = (score) => {
    if (score >= 75) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 55) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const formattedDate = data_freshness
    ? new Date(data_freshness).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent';

  return (
    <section
      aria-label="ML Stock Rating & Explainability"
      className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-6"
    >
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 border border-blue-200 shadow-2xs">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                ML Stock Rating & Explainability
              </h2>
              <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                {stockSymbol || symbol}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-factor calibrated rating engine for {company_name || stockSymbol || symbol}
            </p>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-medium">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Updated: {formattedDate}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-medium">
            <Database className="h-3.5 w-3.5 text-slate-400" />
            <span>Data Completeness: {data_completeness_pct}%</span>
          </div>

          <div className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-200 font-bold">
            {model_version}
          </div>
        </div>
      </div>

      {/* 2. Primary Recommendation & Rationale Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recommendation Score Box */}
        <div className="lg:col-span-4 bg-gradient-to-b from-slate-50 to-slate-100/60 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Predicted Recommendation
          </span>
          <span
            className={`px-5 py-2 rounded-xl font-extrabold text-sm sm:text-base border tracking-wide uppercase ${getBadgeStyle(
              recommendation
            )}`}
          >
            {recommendation ? recommendation.replace('_', ' ') : 'HOLD'}
          </span>

          {!isInsufficient && (
            <div className="mt-4 flex flex-col items-center">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {overall_score}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ 100 Score</span>
              </div>

              {confidence_pct != null && confidence_pct > 0 && (
                <div className="mt-2 text-[11px] bg-white border border-slate-200 px-2.5 py-1 rounded-lg font-medium text-slate-700 shadow-2xs">
                  Calibrated Confidence: <strong className="text-blue-700">{confidence_pct}%</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Explainable Rationale Box */}
        <div className="lg:col-span-8 bg-blue-50/40 border border-blue-200/60 rounded-2xl p-6 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Explainable Model Rationale
            </div>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {rationale}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-blue-200/50 flex flex-wrap items-center justify-between text-[11px] text-blue-900 font-medium gap-2">
            <span>Evaluated against Sector Median Baselines & Multi-Factor Ratios</span>
            <span className="font-bold text-blue-700 flex items-center gap-1">
              <Scale className="h-3.5 w-3.5" /> Statistically Calibrated
            </span>
          </div>
        </div>
      </div>

      {/* 3. Five Core Analytical Pillars */}
      {pillars && Object.keys(pillars).length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-blue-600" />
            Core Factor Pillars Evaluation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {Object.entries(pillars).map(([key, p]) => (
              <div
                key={key}
                className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between shadow-2xs transition hover:border-blue-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700">{p.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPillarColor(
                        p.score
                      )}`}
                    >
                      {Math.round(p.score)}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${
                        p.score >= 70
                          ? 'bg-emerald-600'
                          : p.score >= 50
                          ? 'bg-blue-600'
                          : p.score >= 35
                          ? 'bg-amber-500'
                          : 'bg-rose-600'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, p.score))}%` }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-3 leading-snug font-medium">
                  {p.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Positive Factors vs Negative Factors / Risk Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Positive Factors */}
        <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-5 flex flex-col gap-3 shadow-2xs">
          <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Key Positive Factors
          </h4>
          <ul className="space-y-2 text-xs text-emerald-950 font-medium">
            {positive_factors.length > 0 ? (
              positive_factors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                  <span className="leading-relaxed">{factor}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">No significant positive drivers identified.</li>
            )}
          </ul>
        </div>

        {/* Negative Factors & Risk Indicators */}
        <div className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-5 flex flex-col gap-3 shadow-2xs">
          <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Key Negative Factors & Risks
          </h4>
          <ul className="space-y-2 text-xs text-amber-950 font-medium">
            {negative_factors.length > 0 ? (
              negative_factors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold shrink-0 mt-0.5">⚠</span>
                  <span className="leading-relaxed">{factor}</span>
                </li>
              ))
            ) : null}

            {risk_indicators.map((risk, idx) => (
              <li key={`risk-${idx}`} className="flex items-start gap-2">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">▪</span>
                <span className="leading-relaxed text-slate-800">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 5. Calibrated Class Probabilities Bar */}
      {category_probabilities && Object.keys(category_probabilities).length > 0 && !isInsufficient && (
        <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-blue-600" />
              Calibrated Category Probabilities
            </h4>
            <span className="text-[11px] text-slate-400">Sum = 100%</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL'].map((cls) => {
              const prob = category_probabilities[cls] || 0;
              const isBest = cls === recommendation;
              return (
                <div
                  key={cls}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    isBest
                      ? 'bg-blue-50/90 border-blue-400 shadow-2xs'
                      : 'bg-white border-slate-200/80'
                  }`}
                >
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                    {cls.replace('_', ' ')}
                  </div>
                  <div
                    className={`text-sm font-black font-mono mt-0.5 ${
                      isBest ? 'text-blue-700' : 'text-slate-800'
                    }`}
                  >
                    {prob}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Feature Importance Matrix */}
      {feature_importances && Object.keys(feature_importances).length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-slate-500" />
            Model Feature Importance Matrix
          </h4>
          <div className="space-y-2">
            {Object.entries(feature_importances).map(([feat, weight]) => {
              const pct = typeof weight === 'number' ? Math.round(weight * 100) : 0;
              return (
                <div key={feat} className="flex items-center gap-3 text-xs">
                  <span className="w-48 font-medium text-slate-700 truncate">{feat}</span>
                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, pct * 3.5)}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-bold text-slate-800 font-mono">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Regulatory Informational Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2.5 leading-relaxed">
        <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <strong>Informational & Research Disclosure:</strong> EquityIQ ML ratings and factor scores
          are computed algorithmically using historical fundamental, valuation, and technical data.
          Model confidence reflects calibrated statistical probability, not guaranteed future price
          performance. This analysis is strictly for educational research and does not constitute
          SEBI-registered financial advisory services.
        </span>
      </div>
    </section>
  );
}
