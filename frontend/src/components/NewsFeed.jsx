import { useState, useEffect, useCallback } from 'react';
import { Newspaper, ExternalLink, ChevronLeft, ChevronRight, RefreshCw, Calendar, Globe, Filter } from 'lucide-react';

export default function NewsFeed({ symbol }) {
  const [news, setNews] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [pagination, setPagination] = useState({ page: 1, limit: 6, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);

  const fetchNews = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news/${symbol}?page=${targetPage}&limit=8`);
      if (res.ok) {
        const data = await res.json();
        setNews(data.news || []);
        setPagination(data.pagination || { page: 1, limit: 8, total: 0, totalPages: 1 });
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
    if (diffHours === 1) return '1h ago';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1d ago';
    return `${diffDays}d ago`;
  };

  // Filter news items by sentiment tab
  const filteredNews = news.filter((item) => {
    if (activeTab === 'ALL') return true;
    const sent = item.sentiment || 'NEUTRAL';
    return sent.toUpperCase() === activeTab;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Newspaper className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Financial News & Coverage</h3>
            <p className="text-xs text-slate-500">Live Indian financial news feed for {symbol}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleIngestNewBatch}
            disabled={ingesting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${ingesting ? 'animate-spin' : ''}`} />
            {ingesting ? 'Fetching...' : 'Fetch Latest News'}
          </button>
        </div>
      </div>

      {/* Sentiment Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Filter className="h-3.5 w-3.5 text-slate-400 mr-1" />
        {['ALL', 'POSITIVE', 'NEUTRAL', 'NEGATIVE'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab === 'ALL' ? 'All Coverage' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          );
        })}
      </div>

      {/* Articles Feed */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-xl border border-slate-200/60" />
          ))}
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          No financial news articles found under {activeTab.toLowerCase()} category.
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredNews.map((item) => {
            const sentiment = item.sentiment || 'NEUTRAL';
            const badgeColor =
              sentiment === 'POSITIVE'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : sentiment === 'NEGATIVE'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-100 text-slate-700 border-slate-200';

            return (
              <article
                key={item._id || item.url}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-slate-900 group-hover:text-blue-600 transition text-base leading-snug flex-1"
                  >
                    {item.title}
                  </a>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                {item.summary && (
                  <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-2">
                    {item.summary}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] font-medium pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                      <Globe className="h-3 w-3 text-slate-400" />
                      {item.source || 'Financial Express'}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {formatRelativeTime(item.publishedAt)}
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${badgeColor}`}>
                    {sentiment}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
          <span className="text-slate-500">
            Page <span className="font-bold text-slate-900">{pagination.page}</span> of{' '}
            <span className="font-bold text-slate-900">{pagination.totalPages}</span> ({pagination.total} total articles)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchNews(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => fetchNews(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
