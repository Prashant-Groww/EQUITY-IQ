import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Loader2 } from 'lucide-react';

export default function AIChatCopilotWidget({ symbol }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am EquityIQ Assistant, your AI-powered research copilot for ${symbol} on the Indian Stock Market (NSE). Ask me about stock valuation, financial metrics, risk scores, annual filing summaries, or news sentiment!`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [followups, setFollowups] = useState([
    `Should I buy ${symbol} stock at current levels?`,
    `What is the quantitative risk level for ${symbol}?`,
    `Summarize latest annual report filing for ${symbol}`,
  ]);

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (msgText) => {
    const textToSend = msgText || inputMessage;
    if (!textToSend.trim()) return;

    const userMsg = { role: 'user', content: textToSend.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/ml/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          message: textToSend.trim(),
          history: messages,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg = { role: 'assistant', content: data.reply };
        setMessages((prev) => [...prev, assistantMsg]);
        if (data.suggested_followups && data.suggested_followups.length > 0) {
          setFollowups(data.suggested_followups);
        }
      }
    } catch (err) {
      console.error('Failed to send chat message:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              EquityIQ AI Chat Assistant & Copilot
              <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                NSE Copilot
              </span>
            </h3>
            <p className="text-xs text-slate-400">Context-aware conversational intelligence for Indian equities research</p>
          </div>
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="bg-[#0F172A]/80 border border-slate-800/80 rounded-2xl p-4 min-h-[320px] max-h-[420px] overflow-y-auto flex flex-col gap-3.5">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`p-2 rounded-xl border flex-shrink-0 ${msg.role === 'user'
                ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
                : 'bg-purple-600/20 border-purple-500/30 text-purple-400'
                }`}
            >
              {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed font-medium ${msg.role === 'user'
                ? 'bg-blue-600/20 text-blue-100 border border-blue-500/20 rounded-tr-none'
                : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" />
              <span>Analyzing market context and synthesizing response...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Followups Prompt Chips */}
      {followups.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 font-mono text-[11px] font-medium">Suggested Questions:</span>
          {followups.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition text-[11px] font-medium border border-slate-700/50"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-3"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask AI Assistant about ${symbol}...`}
          className="flex-1 bg-[#0F172A] border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition font-medium"
        />

        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/20 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Send <Send className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
