import { useState, useEffect, useCallback } from 'react';
import { FileText, Upload, Sparkles, CheckCircle2, TrendingUp, AlertTriangle, Layers, Loader2 } from 'lucide-react';

const MOCK_RELIANCE_REPORT_TEXT = `RELIANCE INDUSTRIES LIMITED — CONSOLIDATED FINANCIAL REPORT (Q4 FY24)
Net profit for the year rose by 18% to Rs 18,951 crore driven by expansion in consumer business and robust O2C segment operational efficiency. Consolidated revenue reached Rs 100,000 crore, reflecting double-digit revenue growth. Operating margin stood at 18.2% supported by favorable product cracks and retail footprint expansion. Debt to equity ratio improved to 0.38x. The Board recommended a dividend declaration and approved capital expenditure for renewable energy initiatives.`;

export default function ReportProcessingWidget({ symbol }) {
  const [reportsHistory, setReportsHistory] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [inputText, setInputText] = useState(MOCK_RELIANCE_REPORT_TEXT);
  const [reportTitle, setReportTitle] = useState(`${symbol} Annual Financial Report`);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/reports/${symbol}`);
      if (res.ok) {
        const data = await res.json();
        if (data.reports && data.reports.length > 0) {
          setReportsHistory(data.reports);
          setActiveReport(data.reports[0]);
        } else {
          setReportsHistory([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch reports history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    setReportTitle(`${symbol} Annual Financial Report`);
    fetchReports();
  }, [symbol, fetchReports]);

  const processReport = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/reports/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          title: reportTitle,
          textContent: inputText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.report) {
          setActiveReport(data.report);
          setReportsHistory((prev) => [data.report, ...prev]);
        }
      }
    } catch (err) {
      console.error('Failed to process report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReportTitle(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setInputText(event.target.result.toString());
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Corporate Report Processing & NLP Extraction
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                PDF / Text NLP Parser
              </span>
            </h3>
            <p className="text-xs text-slate-500">Extracts financial metrics, growth catalysts & risk disclosures from filing reports</p>
          </div>
        </div>
      </div>

      {/* Report Input & Upload Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Text / File Upload Form */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300">Corporate Report Text Content</label>
            <label className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 cursor-pointer font-bold transition">
              <Upload className="h-3.5 w-3.5" /> Upload RAG Document (.pdf, .csv)
              <input type="file" accept=".pdf,.csv" onChange={handleFileUpload} className="hidden" />
            </label>

          </div>

          <input
            type="text"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder="Report Document Title..."
            className="w-full bg-[#0F172A] border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-slate-100 text-xs font-medium focus:outline-none transition"
          />

          <textarea
            rows={6}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste raw financial statement or annual report text here..."
            className="w-full bg-[#0F172A] border border-slate-800 focus:border-blue-500 rounded-xl p-3.5 text-slate-200 text-xs focus:outline-none transition resize-none font-mono"
          />

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setInputText(MOCK_RELIANCE_REPORT_TEXT)}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline font-mono"
            >
              Load Sample filing text
            </button>

            <button
              onClick={processReport}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Analyze Document <Sparkles className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: History & Extracted Metrics Summary */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Processed Reports ({reportsHistory.length})</span>
            {historyLoading && <span className="text-[10px] text-blue-400 animate-pulse">Loading history...</span>}
          </div>

          {activeReport ? (
            <div className="bg-[#0F172A]/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white truncate max-w-[240px]">{activeReport.title}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">Company: {activeReport.companySymbol}</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" /> Extracted
                </span>
              </div>

              {/* Extracted Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800 flex flex-col gap-0.5">
                  <span className="text-slate-500 text-[10px]">Net Profit (PAT)</span>
                  <span className="text-emerald-400 font-bold">{activeReport.extractedMetrics?.net_profit || 'N/A'}</span>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800 flex flex-col gap-0.5">
                  <span className="text-slate-500 text-[10px]">Operating Margin</span>
                  <span className="text-blue-400 font-bold">{activeReport.extractedMetrics?.operating_margin || 'N/A'}</span>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800 flex flex-col gap-0.5">
                  <span className="text-slate-500 text-[10px]">Revenue Growth</span>
                  <span className="text-indigo-400 font-bold">{activeReport.extractedMetrics?.revenue_growth || 'N/A'}</span>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800 flex flex-col gap-0.5">
                  <span className="text-slate-500 text-[10px]">Debt to Equity</span>
                  <span className="text-purple-400 font-bold">{activeReport.extractedMetrics?.debt_to_equity || 'N/A'}</span>
                </div>
              </div>

              {/* Executive Summary Paragraph */}
              <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                <strong className="text-white block mb-1 text-[11px] uppercase tracking-wider">Executive Summary</strong>
                {activeReport.executiveSummary}
              </div>

              {/* Growth Drivers & Risks Pills */}
              <div className="flex flex-col gap-2 pt-1 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                    <TrendingUp className="h-3 w-3 text-emerald-400" /> Key Growth Drivers
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeReport.growthDrivers?.map((driver, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 truncate max-w-full">
                        • {driver}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                    <AlertTriangle className="h-3 w-3 text-amber-400" /> Disclosed Risk Factors
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeReport.keyRisks?.map((risk, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 truncate max-w-full">
                        • {risk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0F172A]/50 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 text-center gap-2">
              <Layers className="h-8 w-8 text-slate-600" />
              <p className="text-xs">No reports analyzed for {symbol} yet.</p>
              <p className="text-[11px] text-slate-600">Click &quot;Analyze Document&quot; to extract key metrics and generate an executive summary.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
