import { useState } from 'react';
import { Brain, Sparkles, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';

export default function SentimentWidget() {
  const [inputText, setInputText] = useState(
    'Reliance Industries Q4 net profit rises 18% YoY driven by robust retail and O2C growth.'
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeSentiment = async (textToAnalyze) => {
    const text = textToAnalyze || inputText;
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ml/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error('Failed to analyze sentiment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sampleText) => {
    setInputText(sampleText);
    analyzeSentiment(sampleText);
  };

  const getLabelBadge = (label) => {
    switch (label) {
      case 'positive':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="h-4 w-4" /> Positive Signal
          </span>
        );
      case 'negative':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-wider">
            <TrendingDown className="h-4 w-4" /> Negative Signal
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 text-slate-300 border border-slate-500/20 text-xs font-bold uppercase tracking-wider">
            <Minus className="h-4 w-4" /> Neutral Signal
          </span>
        );
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-6">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              ML Indian Equity Sentiment Classifier
              <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                TF-IDF + LogisticRegression
              </span>
            </h3>
            <p className="text-xs text-slate-400">Classifies Indian corporate & news headlines into market signals</p>
          </div>
        </div>
      </div>

      {/* Analyzer Input Box */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-medium text-slate-300">Test Financial News Sentence (Indian Equities)</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type any Indian financial headline to test ML classification..."
            className="flex-1 bg-[#0F172A] border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition font-medium"
          />
          <button
            onClick={() => analyzeSentiment()}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Analyze ML Signal <Sparkles className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Preset Sample Headlines */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 mt-1">
          <span className="text-slate-500 font-medium font-mono">Presets:</span>
          <button
            onClick={() => handleSampleClick('Reliance Industries Q4 net profit rises 18% on robust retail growth')}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition text-[11px]"
          >
            &quot;Reliance Q4 net profit rises 18%...&quot;
          </button>
          <button
            onClick={() => handleSampleClick('Infosys lowers annual revenue guidance due to delayed US tech spending')}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition text-[11px]"
          >
            &quot;Infosys lowers revenue guidance...&quot;
          </button>
          <button
            onClick={() => handleSampleClick('State Bank of India operates over 22000 branches across all Indian states')}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition text-[11px]"
          >
            &quot;State Bank of India operates 22k branches...&quot;
          </button>
        </div>
      </div>

      {/* Prediction Output Card */}
      {result && (
        <div className="bg-[#0F172A]/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getLabelBadge(result.label)}
              <span className="text-xs text-slate-400 font-mono">
                Confidence: <strong className="text-white font-bold">{(result.confidence * 100).toFixed(1)}%</strong>
              </span>
            </div>
          </div>

          {/* Confidence Meter Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                result.label === 'positive'
                  ? 'bg-emerald-500'
                  : result.label === 'negative'
                  ? 'bg-rose-500'
                  : 'bg-slate-400'
              }`}
              style={{ width: `${(result.confidence * 100).toFixed(1)}%` }}
            />
          </div>

          {/* Probabilities Distribution Bars */}
          {result.probabilities && (
            <div className="grid grid-cols-3 gap-3 pt-2 text-xs font-mono">
              <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800 flex flex-col gap-1">
                <span className="text-slate-500 text-[10px]">Positive</span>
                <span className="text-emerald-400 font-bold">
                  {((result.probabilities.positive || 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800 flex flex-col gap-1">
                <span className="text-slate-500 text-[10px]">Neutral</span>
                <span className="text-slate-300 font-bold">
                  {((result.probabilities.neutral || 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800 flex flex-col gap-1">
                <span className="text-slate-500 text-[10px]">Negative</span>
                <span className="text-rose-400 font-bold">
                  {((result.probabilities.negative || 0) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
