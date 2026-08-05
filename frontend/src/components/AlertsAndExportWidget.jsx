import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Bell,
  FileText,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Download,
  Printer,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';

export default function AlertsAndExportWidget({ activeSymbol }) {
  // Alert State
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertSymbol, setAlertSymbol] = useState(activeSymbol || '');
  const [alertType, setAlertType] = useState('PRICE_ABOVE');
  const [targetValue, setTargetValue] = useState('');
  const [creatingAlert, setCreatingAlert] = useState(false);

  // Brief Export State
  const [exportData, setExportData] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchAlerts = async () => {
    setAlertsLoading(true);
    try {
      const res = await fetch('/api/alerts', {
        headers: { 'x-guest-id': 'equityiq_demo_guest' },
      });
      if (res.ok) {
        const json = await res.json();
        setAlerts(json.data.alerts || []);
      }
    } catch (err) {
      console.error('Failed to fetch alerts', err);
    } finally {
      setAlertsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    setAlertSymbol(activeSymbol || '');
  }, [activeSymbol]);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!alertSymbol || !targetValue) return;
    setCreatingAlert(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-id': 'equityiq_demo_guest',
        },
        body: JSON.stringify({
          symbol: alertSymbol.toUpperCase(),
          alertType,
          targetValue: parseFloat(targetValue),
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setAlerts(json.data.alerts || []);
        setShowAlertForm(false);
        setTargetValue('');
      }
    } catch (err) {
      console.error('Failed to create alert', err);
    } finally {
      setCreatingAlert(false);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      const res = await fetch(`/api/alerts/${id}`, {
        method: 'DELETE',
        headers: { 'x-guest-id': 'equityiq_demo_guest' },
      });
      if (res.ok) {
        const json = await res.json();
        setAlerts(json.data.alerts || []);
      }
    } catch (err) {
      console.error('Failed to delete alert', err);
    }
  };

  const handleGenerateBrief = async () => {
    if (!activeSymbol) return;
    setExportLoading(true);
    try {
      const res = await fetch(`/api/export/brief/${encodeURIComponent(activeSymbol)}`);
      if (res.ok) {
        const json = await res.json();
        setExportData(json.data);
      }
    } catch (err) {
      console.error('Failed to generate brief', err);
    } finally {
      setExportLoading(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!exportData?.markdown) return;
    navigator.clipboard.writeText(exportData.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const triggeredAlerts = alerts.filter((a) => a.triggered);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Price & Volatility Alert Manager */}
      <div className="bg-[#131A29]/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Price & Volatility Alert Engine</h3>
                {triggeredAlerts.length > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                    {triggeredAlerts.length} Triggered
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Set price threshold & volatility monitoring rules</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAlertForm(!showAlertForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-md shadow-amber-600/20"
            >
              <Plus className="h-3.5 w-3.5" />
              New Alert
            </button>
            <button
              onClick={fetchAlerts}
              disabled={alertsLoading}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition border border-slate-700"
              title="Evaluate Rules Now"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${alertsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Triggered Notifications Banner */}
        {triggeredAlerts.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Live Rule Triggers
            </span>
            {triggeredAlerts.map((a) => (
              <div
                key={a._id}
                className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300 flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                  <span className="font-mono font-medium">{a.notificationMessage || `${a.symbol} target met`}</span>
                </div>
                <button
                  onClick={() => handleDeleteAlert(a._id)}
                  className="text-rose-400 hover:text-rose-200 transition text-[11px] font-bold"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Create Alert Form */}
        {showAlertForm && (
          <form
            onSubmit={handleCreateAlert}
            className="bg-[#0E1422] border border-amber-500/30 rounded-xl p-4 flex flex-col gap-3 shadow-lg"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-slate-400 uppercase">Symbol</label>
                <input
                  type="text"
                  value={alertSymbol}
                  onChange={(e) => setAlertSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g. RELIANCE"
                  className="bg-[#131A29] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-slate-400 uppercase">Trigger Rule</label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="bg-[#131A29] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="PRICE_ABOVE">Price Above (₹)</option>
                  <option value="PRICE_BELOW">Price Below (₹)</option>
                  <option value="VOLATILITY_SPIKE">Day Shift %</option>
                  <option value="SENTIMENT_SHIFT">Sentiment Shift</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-slate-400 uppercase">Target Value</label>
                <input
                  type="number"
                  step="any"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="e.g. 1350"
                  className="bg-[#131A29] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAlertForm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingAlert}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-md shadow-amber-600/20"
              >
                {creatingAlert ? 'Saving...' : 'Set Alert Rule'}
              </button>
            </div>
          </form>
        )}

        {/* Active Alert Rules List */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Active Rule Monitoring ({alerts.length})
          </span>

          <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
            {alerts.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                No alerts configured. Click &quot;New Alert&quot; to set price rules.
              </div>
            ) : (
              alerts.map((a) => (
                <div
                  key={a._id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                    a.triggered
                      ? 'bg-rose-500/5 border-rose-500/20 text-slate-300'
                      : 'bg-[#0E1422]/80 border-slate-800/80 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white font-mono">{a.symbol}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {a.alertType === 'PRICE_ABOVE'
                        ? `Above ₹${a.targetValue}`
                        : a.alertType === 'PRICE_BELOW'
                        ? `Below ₹${a.targetValue}`
                        : `Volatility ${a.targetValue}%`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {a.triggered ? (
                      <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Triggered
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteAlert(a._id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                      title="Delete Rule"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 2. Automated AI Research Brief Exporter */}
      <div className="bg-[#131A29]/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">AI Equity Research Report Exporter</h3>
              <p className="text-xs text-slate-400">Generate formal institutional research briefs for {activeSymbol}</p>
            </div>
          </div>

          <button
            onClick={handleGenerateBrief}
            disabled={exportLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/20"
          >
            <Sparkles className={`h-3.5 w-3.5 ${exportLoading ? 'animate-spin' : ''}`} />
            {exportLoading ? 'Generating...' : `Export ${activeSymbol} Brief`}
          </button>
        </div>

        {/* Report Preview Container */}
        {exportData ? (
          <div className="bg-[#0E1422] border border-slate-800 rounded-xl p-4 flex flex-col gap-4 max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 text-xs">
            {/* Header Actions */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white font-mono">{exportData.symbol}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {exportData.brief?.recommendation || 'ACCUMULATE'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy Markdown'}
                </button>
                <button
                  onClick={handlePrintPdf}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition"
                >
                  <Printer className="h-3 w-3" />
                  Print / PDF
                </button>
              </div>
            </div>

            {/* Brief Content Preview */}
            <div className="flex flex-col gap-3 font-sans text-slate-200">
              <h4 className="text-sm font-bold text-white tracking-tight">{exportData.brief?.title}</h4>
              <p className="text-slate-300 leading-relaxed bg-[#131A29] p-3 rounded-lg border border-slate-800/80">
                {exportData.brief?.executive_summary}
              </p>

              {exportData.brief?.sections?.map((sec, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <h5 className="font-bold text-blue-400 text-xs">{sec.title}</h5>
                  <p className="text-slate-300 leading-relaxed">{sec.content}</p>
                </div>
              ))}

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 italic">
                {exportData.brief?.disclaimer}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3 border border-dashed border-slate-800 rounded-xl">
            <Download className="h-8 w-8 text-slate-600" />
            <div>
              <p className="text-xs font-semibold text-slate-300">No Research Brief Generated Yet</p>
              <p className="text-[11px] text-slate-500">
                Click &quot;Export {activeSymbol} Brief&quot; to synthesize multi-source institutional reports
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

AlertsAndExportWidget.propTypes = {
  activeSymbol: PropTypes.string.isRequired,
};
