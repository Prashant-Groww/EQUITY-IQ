import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  User,
  Send,
  Loader2,
  Sparkles,
  Key,
  Trash2,
  Copy,
  Check,
  Zap,
  Info,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

/**
 * Format markdown-like text to readable JSX elements
 */
function FormattedMessage({ text }) {
  if (!text) return null;

  // Split lines
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 text-xs leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        // Header 3 or 4
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={i} className="text-xs font-black text-slate-900 mt-2 mb-1 border-b border-slate-200 pb-0.5">
              {trimmed.replace('### ', '')}
            </h4>
          );
        }

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const content = trimmed.substring(2);
          return (
            <div key={i} className="flex items-start gap-2 pl-1">
              <span className="text-blue-600 font-bold mt-0.5">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
            </div>
          );
        }

        // Blockquote / tip
        if (trimmed.startsWith('> ')) {
          return (
            <div key={i} className="p-2 rounded-lg bg-blue-50 border-l-2 border-blue-500 text-slate-700 text-[11px] my-1 font-medium">
              <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace('> ', '')) }} />
            </div>
          );
        }

        // Empty line
        if (trimmed.length === 0) {
          return <div key={i} className="h-1" />;
        }

        // Normal paragraph
        return (
          <p key={i} dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
        );
      })}
    </div>
  );
}

/**
 * Replace **bold** and `code` with HTML tags safely
 */
function formatInline(str) {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-purple-700">$1</code>');
}

export default function AIChatCopilotWidget({ symbol }) {
  const activeSym = (symbol || 'NIFTY 50').toUpperCase().replace(/\.NS$|\.BO$/i, '').trim();

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am your **EquityIQ AI Copilot** powered by **Google Gemini 2.5 Flash**.\n\nAsk me anything about **${activeSym}** — from fundamental valuation ratios (P/E, Market Cap, ROCE) to volatility risk profiles, financial results, and technical trends.`,
      isGemini: true,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('equityiq_gemini_api_key') || '');
  const [savedKey, setSavedKey] = useState(() => localStorage.getItem('equityiq_gemini_api_key') || '');

  const [followups, setFollowups] = useState([
    `Is ${activeSym} undervalued based on current P/E?`,
    `What are the major downside risks and beta for ${activeSym}?`,
    `Analyze capital structure and operating margins for ${activeSym}`,
    `What is the technical support & resistance for ${activeSym}?`,
  ]);

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('equityiq_gemini_api_key', apiKeyInput.trim());
      setSavedKey(apiKeyInput.trim());
    } else {
      localStorage.removeItem('equityiq_gemini_api_key');
      setSavedKey('');
    }
    setShowKeyModal(false);
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Conversation reset. Ask me anything about **${activeSym}** or other Indian market equities!`,
        isGemini: true,
      },
    ]);
  };

  const handleSendMessage = async (msgText) => {
    const textToSend = msgText || inputMessage;
    if (!textToSend || !textToSend.trim()) return;

    const userMsg = { role: 'user', content: textToSend.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (savedKey) {
        headers['x-gemini-api-key'] = savedKey;
      }

      const res = await fetch('/api/ml/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          symbol: activeSym,
          message: textToSend.trim(),
          history: messages,
          apiKey: savedKey || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg = {
          role: 'assistant',
          content: data.reply,
          isGemini: data.isGemini,
          model: data.model,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        if (data.suggested_followups && data.suggested_followups.length > 0) {
          setFollowups(data.suggested_followups);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ Failed to get AI response (${res.status}). Please verify your connection or Gemini API key.`,
            isError: true,
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to send chat message:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Network communication error. Please ensure the backend server is running.',
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
      
      {/* 1. Header with Model Info & Actions */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                EquityIQ Copilot
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                <Zap className="h-2.5 w-2.5" />
                Google Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Institutional conversational intelligence for <span className="font-bold text-slate-700">{activeSym}</span>
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyModal(true)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
              savedKey
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Configure Gemini API Key"
          >
            <Key className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{savedKey ? 'Gemini Key Active' : 'Set Gemini Key'}</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
            title="Clear Chat History"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. Messages Container */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 min-h-[340px] max-h-[440px] overflow-y-auto flex flex-col gap-4 shadow-inner">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-indigo-600 border border-indigo-100 shadow-2xs'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed relative group ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-xs font-medium'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs'
                }`}
              >
                {isUser ? (
                  <p>{msg.content}</p>
                ) : (
                  <div>
                    <FormattedMessage text={msg.content} />
                    
                    {/* Copy Button */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono">
                        {msg.model || 'Gemini 2.5 Flash'}
                      </span>
                      <button
                        onClick={() => handleCopy(msg.content, index)}
                        className="inline-flex items-center gap-1 hover:text-slate-700 transition"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-xl bg-white border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-2xs shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span>Analyzing live market data and generating Gemini equity research...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 3. Followup Prompt Chips */}
      {followups.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Suggested Analysis Questions:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {followups.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition border border-slate-200 hover:border-blue-300"
              >
                <span>{prompt}</span>
                <ChevronRight className="h-3 w-3 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask Gemini Copilot about ${activeSym} valuation, risks, earnings...`}
          className="flex-1 bg-white border border-slate-200 focus:border-blue-500 rounded-2xl px-4 py-3 text-slate-900 text-xs sm:text-sm focus:outline-none transition shadow-2xs font-medium"
        />

        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-md shadow-blue-500/20 shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          <span>Send</span>
          <Send className="h-4 w-4" />
        </button>
      </form>

      {/* 5. Gemini API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Key className="h-4 w-4 text-blue-600" />
                <span>Google Gemini API Configuration</span>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your Google Gemini API key to enable live AI analysis. You can generate a free API key in seconds from{' '}
              <a
                href="https://aistudio.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline font-bold"
              >
                Google AI Studio
              </a>.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500">Gemini API Key</label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="border border-slate-300 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
