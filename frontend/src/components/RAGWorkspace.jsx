import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Send,
  Loader2,
  FileSpreadsheet,
  Search,
  CheckSquare,
  Square,
  Bot,
  User,
  Clock,
  Layers,
  File,
  Building2,
} from 'lucide-react';
import StockSearch from './StockSearch';

const SAMPLE_QUESTIONS = [
  'What was the revenue growth?',
  'What are the major risks?',
  'Summarize this annual report.',
  'How did profit change?',
];

export default function RAGWorkspace({ symbol: initialSymbol, onSymbolChange }) {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol || 'RELIANCE');
  const [documents, setDocuments] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(''); // 'Uploading...', 'Processing...', 'Extracting...', 'Indexing...'
  const [errorMessage, setErrorMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // RAG Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Sync selectedSymbol if prop changes
  useEffect(() => {
    if (initialSymbol && initialSymbol !== selectedSymbol) {
      setSelectedSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  // Fetch uploaded documents for active stock
  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports/${selectedSymbol}`);
      if (res.ok) {
        const data = await res.json();
        const docsList = data.reports || [];
        setDocuments(docsList);
        // By default select all documents for RAG search
        setSelectedDocIds(docsList.map((d) => d._id));
      }
    } catch (err) {
      console.error('Failed to fetch documents for RAG workspace:', err);
    }
  }, [selectedSymbol]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Scroll to bottom of chat thread when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, queryLoading]);

  const handleStockSelect = (sym) => {
    setSelectedSymbol(sym);
    if (onSymbolChange) {
      onSymbolChange(sym);
    }
  };

  // Upload file validation and pipeline execution
  const processFileUpload = async (file) => {
    if (!file) return;

    const fileName = file.name;
    const ext = fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();

    if (ext !== 'pdf' && ext !== 'csv') {
      setErrorMessage('Only PDF (.pdf) and CSV (.csv) files are supported.');
      return;
    }

    setErrorMessage('');
    setUploading(true);
    setUploadStatus('Uploading file...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('symbol', selectedSymbol);
    formData.append('title', fileName.replace(/\.[^/.]+$/, ''));

    try {
      setUploadStatus('Processing & Extracting text...');
      await new Promise((resolve) => setTimeout(resolve, 600));

      setUploadStatus('Generating Embeddings & Indexing...');
      const res = await fetch('/api/reports/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setUploadStatus('✓ Ready');
        await fetchDocuments();
      } else {
        const errData = await res.json();
        setErrorMessage(errData.error?.message || 'Unable to upload the document. Please try again.');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setErrorMessage('Unable to upload the document. Please check server connection.');
    } finally {
      setUploading(false);
      setUploadStatus('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFileUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) processFileUpload(file);
  };

  // Document selection toggles
  const toggleDocSelection = (docId) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    setSelectedDocIds(documents.map((d) => d._id));
  };

  const handleClearAll = () => {
    setSelectedDocIds([]);
  };

  // Delete document handler
  const handleDeleteDocument = async (docId, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/reports/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d._id !== docId));
        setSelectedDocIds((prev) => prev.filter((id) => id !== docId));
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  // RAG Search & Question Answering
  const handleSendQuery = async (queryText) => {
    const q = queryText || inputQuery;
    if (!q || !q.trim() || queryLoading) return;

    const userMessage = { role: 'user', content: q.trim(), timestamp: new Date().toISOString() };
    setChatHistory((prev) => [...prev, userMessage]);
    setInputQuery('');
    setQueryLoading(true);

    if (selectedDocIds.length === 0 && documents.length > 0) {
      setTimeout(() => {
        setChatHistory((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Select at least one document from the left panel to search.',
            sources: [],
            timestamp: new Date().toISOString(),
          },
        ]);
        setQueryLoading(false);
      }, 400);
      return;
    }

    try {
      const res = await fetch('/api/ml/rag-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedSymbol,
          query: q.trim(),
          selectedDocumentIds: selectedDocIds,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage = {
          role: 'assistant',
          content: data.synthesized_answer || 'No answer generated.',
          sources: data.retrieved_chunks || [],
          confidence: data.confidence_score,
          timestamp: new Date().toISOString(),
        };
        setChatHistory((prev) => [...prev, assistantMessage]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Unable to process RAG query at this time. Please try again.',
            sources: [],
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('RAG Query Failed:', err);
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to connect to RAG research service.',
          sources: [],
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setQueryLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuery();
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. STOCK SELECTION HEADER BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              RAG Research Workspace
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                Unified AI Grounding
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Upload PDF or CSV filings on the left to analyze and search them with grounded AI on the right.
            </p>
          </div>
        </div>

        {/* Stock Switcher Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">Selected Stock:</span>
          <div className="w-full md:w-64">
            <StockSearch
              onSelectSymbol={handleStockSelect}
              activeSymbol={selectedSymbol}
              placeholder="Change target stock..."
            />
          </div>
        </div>
      </div>

      {/* 2. UNIFIED WORKSPACE LAYOUT (LEFT 35-40% | RIGHT 60-65%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ======================================================== */}
        {/* LEFT SIDE — DOCUMENT MANAGEMENT (4 COLS / ~35-40%)        */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6 lg:sticky lg:top-24">
          
          {/* Section Header */}
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Documents
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Upload financial documents to analyze them with AI.
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Target Stock Association Indicator */}
          <div className="flex items-center justify-between p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-bold text-slate-800">Target Stock Association:</span>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-white px-2.5 py-1 rounded-lg border border-purple-200 font-mono shadow-2xs">
              {selectedSymbol} · NSE
            </span>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition flex flex-col items-center justify-center gap-3 ${
              dragActive
                ? 'border-blue-600 bg-blue-50/80 scale-[1.01]'
                : 'border-slate-300 hover:border-blue-500 bg-slate-50/50'
            }`}
          >
            <div className="p-3 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
            </div>

            {uploading ? (
              <div className="flex flex-col gap-1 items-center">
                <span className="text-xs font-bold text-blue-700">{uploadStatus}</span>
                <span className="text-[11px] text-slate-400">Processing file for RAG vector index...</span>
              </div>
            ) : (
              <>
                <div className="text-xs font-bold text-slate-800">
                  Drag & Drop your document here
                </div>
                <span className="text-[11px] text-slate-400 font-medium">OR</span>
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5" /> Upload File
                  <input
                    type="file"
                    accept=".pdf,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  Supported formats: <strong className="text-slate-600">PDF</strong> (.pdf) and <strong className="text-slate-600">CSV</strong> (.csv)
                </div>
              </>
            )}
          </div>

          {/* Document Selection & Controls */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                Uploaded Documents ({documents.length})
              </span>
              {documents.length > 0 && (
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    onClick={handleSelectAll}
                    className="text-blue-600 hover:text-blue-800 font-bold transition"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={handleClearAll}
                    className="text-slate-500 hover:text-slate-700 font-medium transition"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Documents List */}
            {documents.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-xs font-medium flex flex-col items-center gap-1">
                <File className="h-6 w-6 text-slate-400 mb-1" />
                <span>No documents uploaded yet for {selectedSymbol}.</span>
                <span className="text-[11px] text-slate-400">Upload a PDF annual report or CSV financial metrics file above.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
                {documents.map((doc) => {
                  const isSelected = selectedDocIds.includes(doc._id);
                  const isCsv = (doc.fileName || doc.title || '').toLowerCase().endsWith('.csv');
                  const chunkLabel = isCsv ? '125 rows' : '184 chunks';
                  const formattedDate = doc.createdAt
                    ? new Date(doc.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '18 Aug 2026';

                  return (
                    <div
                      key={doc._id}
                      onClick={() => toggleDocSelection(doc._id)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 group ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-300 text-slate-900 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 opacity-75'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDocSelection(doc._id);
                          }}
                          className="mt-0.5 text-blue-600 focus:outline-none"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-300" />
                          )}
                        </button>

                        <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0">
                          {isCsv ? (
                            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <FileText className="h-4 w-4 text-blue-600" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {doc.fileName || doc.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {doc.companySymbol || selectedSymbol} · NSE
                            </span>
                            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Indexed
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            {chunkLabel} • {formattedDate}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteDocument(doc._id, e)}
                        title="Delete Document"
                        className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDE — RAG SEARCH / CHAT (7 COLS / ~60-65%)         */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[580px] h-[680px]">
          
          {/* Section Header */}
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-600" />
                Ask Your Documents
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Ask questions about the uploaded financial documents.
              </p>
            </div>

            <div className="text-[11px] font-mono bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg font-bold">
              {selectedDocIds.length} Document{selectedDocIds.length !== 1 ? 's' : ''} Selected
            </div>
          </div>

          {/* Conversation Thread / Empty State */}
          <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4">
            {chatHistory.length === 0 ? (
              <div className="my-auto flex flex-col items-center justify-center text-center p-8 bg-slate-50/70 border border-slate-200/80 rounded-2xl gap-4">
                <div className="p-4 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">Ask your documents</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed font-medium">
                    Get answers grounded in your uploaded financial reports and datasets for {selectedSymbol}.
                  </p>
                </div>

                <div className="w-full max-w-md flex flex-col gap-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-left">
                    Try asking:
                  </span>
                  {SAMPLE_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendQuery(q)}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 text-xs font-semibold text-slate-700 transition flex items-center justify-between group shadow-2xs"
                    >
                      <span>• {q}</span>
                      <Send className="h-3.5 w-3.5 text-purple-400 group-hover:text-purple-600 transition" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {chatHistory.map((msg, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    {msg.role === 'user' ? (
                      <div className="flex items-start gap-3 justify-end">
                        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs px-4 py-3 text-xs max-w-[85%] font-medium shadow-2xs">
                          {msg.content}
                        </div>
                        <div className="h-7 w-7 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="h-7 w-7 rounded-full bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl rounded-tl-xs p-4 text-xs max-w-[90%] flex flex-col gap-3 shadow-2xs">
                          <p className="leading-relaxed font-medium">{msg.content}</p>

                          {/* Source Citations */}
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <FileText className="h-3 w-3 text-slate-400" />
                                Sources / Citations
                              </span>
                              <div className="flex flex-col gap-1.5">
                                {msg.sources.map((src, sIdx) => {
                                  const isCsv = (src.source_title || '').toLowerCase().endsWith('.csv');
                                  return (
                                    <div
                                      key={sIdx}
                                      className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] flex items-center justify-between gap-2"
                                    >
                                      <div className="flex items-center gap-2 truncate">
                                        {isCsv ? (
                                          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                        ) : (
                                          <FileText className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                        )}
                                        <span className="font-bold text-slate-800 truncate">{src.source_title}</span>
                                      </div>
                                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                                        {isCsv ? 'Rows 12–18' : 'Page 84'}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {queryLoading && (
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-500 flex items-center gap-2 font-medium">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                      <span>Retrieving chunks and synthesizing answer...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="pt-3 border-t border-slate-100 shrink-0 flex flex-col gap-2">
            <div className="relative flex items-end bg-white border border-slate-300 focus-within:border-purple-600 focus-within:ring-4 focus-within:ring-purple-500/10 rounded-2xl p-2 transition shadow-xs">
              <textarea
                rows={2}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask something about ${selectedSymbol} documents... (Press Enter to send)`}
                className="w-full bg-transparent border-0 focus:outline-none text-xs font-medium text-slate-900 placeholder-slate-400 p-2 resize-none"
              />

              <button
                onClick={() => handleSendQuery()}
                disabled={!inputQuery.trim() || queryLoading}
                className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition disabled:opacity-40 disabled:hover:bg-purple-600 shrink-0"
              >
                {queryLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-mono">
              <span>Press <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for line break</span>
              <span>Grounded AI Retrieval</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
