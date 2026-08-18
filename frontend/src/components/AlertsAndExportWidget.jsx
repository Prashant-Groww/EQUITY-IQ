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
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Failed to fetch price alerts:', err);
    } finally {
      setAlertsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!alertSymbol.trim() || !targetValue) return;

    setCreatingAlert(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-id': 'equityiq_demo_guest',
        },
        body: JSON.stringify({
          symbol: alertSymbol.trim().toUpperCase(),
          conditionType: alertType,
          targetValue: parseFloat(targetValue),
        }),
      });

      if (res.ok) {
        setShowAlertForm(false);
        setTargetValue('');
        await fetchAlerts();
      }
    } catch (err) {
      console.error('Failed to create alert rule:', err);
    } finally {
      setCreatingAlert(false);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
        headers: { 'x-guest-id': 'equityiq_demo_guest' },
      });
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a._id !== alertId));
      }
    } catch (err) {
      console.error('Failed to delete alert rule:', err);
    }
  };

  const handleGenerateBrief = async () => {
    const sym = activeSymbol || 'RELIANCE';
    setExportLoading(true);
    try {
      const res = await fetch(`/api/export/research-brief/${sym}`);
      if (res.ok) {
        const data = await res.json();
        setExportData(data.brief);
      }
    } catch (err) {
      console.error('Failed to generate research brief:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!exportData?.markdownReport) return;
    navigator.clipboard.writeText(exportData.markdownReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggeredAlerts = alerts.filter((a) => a.triggered);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      {/* Widget Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Price Alerts & Research Export</h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                Phase 11 Engine
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Custom threshold rule monitoring & automated Institutional Research Brief PDF exporter
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAlertForm(!showAlertForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            New Alert
          </button>
          <button
            onClick={fetchAlerts}
            disabled={alertsLoading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Refresh Alerts"
          >
            <RefreshCw className={`h-4 w-4 ${alertsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid: Alerts Manager on Left, Research Exporter on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Alerts Rules List */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>Active Threshold Monitoring Rules</span>
              {triggeredAlerts.length > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                  {triggeredAlerts.length} Triggered
                </span>
              )}
            </h4>
          </div>

          {/* New Alert Form Modal / Drawer */}
          {showAlertForm && (
            <form onSubmit={handleCreateAlert} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
              <div className="text-xs font-bold text-slate-900">Configure Threshold Rule</div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={alertSymbol}
                  onChange={(e) => setAlertSymbol(e.target.value.toUpperCase())}
                  placeholder="SYMBOL"
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
                />
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none"
                >
                  <option value="PRICE_ABOVE">Price Above</option>
                  <option value="PRICE_BELOW">Price Below</option>
                  <option value="PERCENT_CHANGE_ABOVE">% Change Above</option>
                </select>
                <input
                  type="number"
                  step="any"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="Target (e.g. 1350)"
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAlertForm(false)}
                  className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAlert}
                  className="px-3 py-1 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700"
                >
                  {creatingAlert ? 'Saving...' : 'Save Rule'}
                </button>
              </div>
            </form>
          )}

          {/* Active Rules Feed */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {alertsLoading ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading active alerts...</div>
            ) : alerts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No active price alert rules set.</div>
            ) : (
              alerts.map((a) => (
                <div key={a._id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xs text-slate-900">{a.symbol}</span>
                    <span className="text-[11px] text-slate-500">
                      {a.conditionType} → <span className="font-mono font-bold text-slate-900">₹{a.targetValue}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.triggered ? (
                      <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-bold">
                        TRIGGERED
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                        ACTIVE
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteAlert(a._id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Automated AI Research Brief Exporter */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span>Institutional Research Brief Exporter</span>
            </h4>

            <button
              onClick={handleGenerateBrief}
              disabled={exportLoading}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
            >
              <Sparkles className={`h-3.5 w-3.5 ${exportLoading ? 'animate-spin' : ''}`} />
              {exportLoading ? 'Generating...' : `Export ${activeSymbol || 'RELIANCE'} Brief`}
            </button>
          </div>

          {exportData ? (
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-900">{exportData.title}</span>
                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-bold"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy Markdown'}
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                {exportData.markdownReport}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-xl">
              Click 'Export {activeSymbol || 'RELIANCE'} Brief' to synthesize an institutional research document.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

AlertsAndExportWidget.propTypes = {
  activeSymbol: PropTypes.string,
};
