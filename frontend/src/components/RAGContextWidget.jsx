import { useState } from 'react';
import { Database, Sparkles, Search, CheckCircle2, Loader2 } from 'lucide-react';

export default function RAGContextWidget({ symbol }) {
  const [query, setQuery] = useState('What were the Q4 profit figures, operating margins, and retail growth?');
  const [ragResult, setRagResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const executeRAGQuery = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ml/rag-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          query: q.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRagResult(data);
      }
    } catch (err) {
      console.error('Failed to execute RAG query:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (presetQuery) => {
    setQuery(presetQuery);
    executeRAGQuery(presetQuery);
  };

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              RAG Knowledge Index & Vector Retrieval
              <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                TF-IDF + Cosine Similarity Indexer
              </span>
            </h3>
            <p className="text-xs text-slate-400">Semantic vector retrieval over news feeds, annual reports, and stock fundamentals</p>
          </div>
        </div>
      </div>

      {/* Query Search Bar & Presets */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-medium text-slate-300">Semantic Vector Query over {symbol} Knowledge Index</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Ask any research question about ${symbol}...`}
              className="w-full bg-[#0F172A] border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-slate-100 text-sm focus:outline-none transition font-medium"
            />
          </div>

          <button
            onClick={() => executeRAGQuery()}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Search RAG Index <Sparkles className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Preset Sample Queries */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 mt-1">
          <span className="text-slate-500 font-medium font-mono">Sample RAG Queries:</span>
          <button
            onClick={() => handlePresetClick(`What are ${symbol}'s Q4 profit figures and operating margins?`)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition text-[11px]"
          >
            &quot;Q4 profits & operating margins...&quot;
          </button>
          <button
            onClick={() => handlePresetClick(`What key risk factors were disclosed for ${symbol}?`)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition text-[11px]"
          >
            &quot;Disclosed risk factors...&quot;
          </button>
          <button
            onClick={() => handlePresetClick(`How do FII institutional inflows impact ${symbol} valuation?`)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition text-[11px]"
          >
            &quot;Institutional investor sentiment...&quot;
          </button>
        </div>
      </div>

      {/* RAG Synthesis & Context Output Zone */}
      {ragResult && (
        <div className="flex flex-col gap-5 pt-2">
          {/* Synthesized Answer Box */}
          <div className="bg-[#0F172A]/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-400" /> Synthesized RAG Context Answer
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Confidence: <strong className="text-emerald-400 font-bold">{(ragResult.confidence_score * 100).toFixed(0)}%</strong>
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {ragResult.synthesized_answer}
            </p>
          </div>

          {/* Retrieved Knowledge Chunks List */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Retrieved Context Chunks ({ragResult.retrieved_chunks?.length || 0})
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Searched {ragResult.total_chunks_searched} Knowledge Chunks
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ragResult.retrieved_chunks?.map((chunk, index) => (
                <div
                  key={index}
                  className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                      {chunk.source_type}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> {(chunk.relevance_score * 100).toFixed(0)}% Match
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-white mb-1 line-clamp-1">{chunk.source_title}</h5>
                    <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed">{chunk.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
