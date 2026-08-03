import { useState, useEffect, useCallback } from 'react';
import { Newspaper, ExternalLink, ChevronLeft, ChevronRight, RefreshCw, Calendar, Globe } from 'lucide-react';

export default function NewsFeed({ symbol }) {
  const [news, setNews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);

  const fetchNews = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news/${symbol}?page=${targetPage}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setNews(data.news || []);
        setPagination(data.pagination || { page: 1, limit: 5, total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to fetch news:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchNews(1);
  }, [fetchNews]);

  const handleIngestNewBatch = async () => {
    setIngesting(true);
    try {
      const res = await fetch(`/api/news/${symbol}/ingest`, { method: 'POST' });
      if (res.ok) {
        await fetchNews(1);
      }
    } catch (err) {
      console.error('Failed to trigger news ingestion:', err);
    } finally {
      setIngesting(false);
    }
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Newspaper className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Financial News & Coverage</h3>
            <p className="text-xs text-slate-400">Live sentiment-tracked news feed for {symbol}</p>
          </div>
        </div>

        <button
          onClick={handleIngestNewBatch}
          disabled={ingesting}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-medium transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${ingesting ? 'animate-spin' : ''}`} />
          {ingesting ? 'Ingesting...' : 'Fetch Latest News'}
        </button>
      </div>

      {/* Articles Feed */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-800/40 rounded-xl border border-slate-800" />
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">
          No financial news articles found for {symbol}.
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <article
              key={item._id || item.url}
              className="bg-[#0F172A]/70 border border-slate-800/90 rounded-xl p-5 hover:border-blue-500/40 transition group"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-white group-hover:text-blue-400 transition text-base leading-snug flex-1"
                >
                  {item.title}
                </a>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              {item.summary && (
                <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-2">
                  {item.summary}
                </p>
              )}

              <div className="flex items-center gap-4 text-[11px] font-medium text-slate-400">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Globe className="h-3 w-3" />
                  {item.source}
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Calendar className="h-3 w-3" />
                  {formatRelativeTime(item.publishedAt)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs">
          <span className="text-slate-400">
            Page <span className="font-bold text-white">{pagination.page}</span> of{' '}
            <span className="font-bold text-white">{pagination.totalPages}</span> ({pagination.total} total articles)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchNews(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => fetchNews(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
