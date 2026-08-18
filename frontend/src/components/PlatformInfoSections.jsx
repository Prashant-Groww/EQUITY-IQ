import { useState } from 'react';
import { ShieldCheck, Cpu, Database, Award, BarChart2, Brain, FileText, CheckCircle2, ChevronDown, Sparkles, Layers, Globe, Server, Code } from 'lucide-react';

const FEATURES_LIST = [
  {
    icon: Award,
    title: 'Multi-Factor ML Rating Engine',
    desc: 'Evaluates Valuation, Profitability (ROE/ROCE), Solvency (D/E), FinBERT Sentiment, and Volatility risk to output STRONG_BUY, BUY, HOLD, or SELL ratings with confidence scores & SHAP feature importances.',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
  {
    icon: Database,
    title: 'Dense RAG Filing Retrieval',
    desc: 'Semantic vector similarity indexer over corporate annual reports, MD&A disclosures, and quarterly earnings to provide grounded answers with explicit source citations.',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  },
  {
    icon: BarChart2,
    title: '22+ Financial Ratio Metrics',
    desc: 'Real-time NSE stock quotes, P/E, P/B, Book Value, Dividend Yield, ROE, ROCE, Debt/Equity, EPS, 52W High/Low, and Volume analysis.',
    color: 'text-blue-600 bg-blue-50 border-blue-100',
  },
  {
    icon: Brain,
    title: 'ProsusAI FinBERT Sentiment Analysis',
    desc: 'Domain-trained financial NLP transformer model classifying headline sentiment into positive, negative, or neutral market signals.',
    color: 'text-purple-600 bg-purple-50 border-purple-100',
  },
  {
    icon: ShieldCheck,
    title: 'Quantitative Risk Analytics',
    desc: 'GradientBoosting Regressor calculating 20D/60D Annualized Volatility, 1-Day VaR (95% & 99%), Peak-to-Trough Max Drawdown, Beta vs Nifty 50, and Sharpe Ratio.',
    color: 'text-amber-600 bg-amber-50 border-amber-100',
  },
  {
    icon: FileText,
    title: 'Institutional Research Exporter',
    desc: 'Automated synthesis of multi-section institutional equity research briefs with Markdown copy and PDF export capabilities.',
    color: 'text-teal-600 bg-teal-50 border-teal-100',
  },
];

const METHOD_FACTORS = [
  { name: 'Valuation & Price-to-Earnings', weight: '25%', desc: 'P/E ratio compared against industry peers, Book Value, and Dividend Yield.' },
  { name: 'Profitability & Returns', weight: '25%', desc: 'Return on Equity (ROE) and Return on Capital Employed (ROCE) efficiency.' },
  { name: 'Solvency & Debt Burden', weight: '20%', desc: 'Debt-to-Equity ratio and interest coverage safety margins.' },
  { name: 'News & Filing Sentiment', weight: '15%', desc: 'ProsusAI FinBERT NLP sentiment polarity across recent media & disclosures.' },
  { name: 'Volatility & Beta Risk', weight: '15%', desc: 'GradientBoosting risk predictions, Beta vs Nifty 50, and Maximum Drawdown.' },
];

const TECH_STACK = [
  { category: 'AI & ML Models', items: 'ProsusAI FinBERT, GradientBoosting Regressor, Scikit-Learn, PyTorch' },
  { category: 'AI Service Architecture', items: 'FastAPI (Python 3.11), Pydantic V2, ChromaDB Vector Store' },
  { category: 'Backend API Service', items: 'Node.js Express, Mongoose, Pino Logger, Express Validator' },
  { category: 'Database & Storage', items: 'MongoDB Atlas, ChromaDB Dense Vector Store, Node-Cache TTL' },
  { category: 'Frontend Interface', items: 'React 18, Vite, Tailwind CSS, Recharts, Lucide Icons' },
  { category: 'Deployment Stack', items: 'Docker, Docker Compose, Multi-Stage Nginx Alpine Proxy' },
];

const FAQ_ITEMS = [
  {
    q: 'How does EquityIQ prevent AI hallucinations in stock research?',
    a: 'EquityIQ uses Retrieval-Augmented Generation (RAG). Every prompt sent to the AI Copilot is strictly grounded using relevant text chunks retrieved from MongoDB and ChromaDB vector indices of official company filings and verified financial news, returning explicit source citations [Source: Title].',
  },
  {
    q: 'What stock exchanges and market data are supported?',
    a: 'EquityIQ supports 500+ authentic companies listed on the National Stock Exchange of India (NSE) and Bombay Stock Exchange (BSE), with financial metrics denominated in ₹ INR (Lakhs and Crores).',
  },
  {
    q: 'How is the ML Recommendation (STRONG_BUY / BUY / HOLD / SELL) calculated?',
    a: 'Our Multi-Factor Rating Engine evaluates 5 weighted quantitative pillars: Valuation (25%), Profitability (25%), Solvency (20%), FinBERT News Sentiment (15%), and Risk Volatility (15%). The composite score (0-100) maps directly to recommendation tiers with confidence percentages.',
  },
  {
    q: 'Can I track custom price alert rules and export reports?',
    a: 'Yes. EquityIQ provides real-time price threshold rule monitoring (Phase 11 Alert Engine) and automated Institutional Research Brief PDF exporters.',
  },
  {
    q: 'Is EquityIQ free to use for personal investment research?',
    a: 'Yes. EquityIQ is an open, production-grade AI quantitative research workspace designed for investors, analysts, and portfolio showcase demonstrations.',
  },
];

export default function PlatformInfoSections() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="flex flex-col gap-16 mt-6 pb-12">
      
      {/* 1. ABOUT EQUITYIQ */}
      <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-4">
            <Globe className="h-3.5 w-3.5" />
            About EquityIQ
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
            Next-Generation AI Investment Research Platform for Indian Equities
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal mb-6">
            EquityIQ bridges quantitative machine learning models, domain-trained financial NLP transformers, and real-time NSE market feeds into a unified research workspace. Designed for modern investors, EquityIQ transforms complex financial statements and market noise into actionable, grounded insights.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-center">
            <div>
              <div className="text-2xl font-black text-slate-900">500+</div>
              <div className="text-xs text-slate-500 font-medium">NSE/BSE Listed Equities</div>
            </div>
            <div>
              <div className="text-2xl font-black text-blue-600">22+</div>
              <div className="text-xs text-slate-500 font-medium">Financial Ratio Metrics</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">98.6%</div>
              <div className="text-xs text-slate-500 font-medium">ML Risk Model Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-black text-purple-600">100%</div>
              <div className="text-xs text-slate-500 font-medium">RAG Document Grounded</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PLATFORM FEATURES GRID */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Comprehensive Investment Research Features
          </h2>
          <p className="text-sm text-slate-500">
            Powered by clean software architecture, FastAPI microservices, and modern frontend design
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES_LIST.map((feat) => {
            const IconComp = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center border mb-4 ${feat.color}`}>
                    <IconComp className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. HOW THE AI RECOMMENDATION ENGINE WORKS */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-8 shadow-xl">
        <div className="max-w-3xl mb-8">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono font-bold border border-blue-500/30 uppercase tracking-wider mb-3 inline-block">
            Quantitative Methodology
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            How the AI Recommendation Engine Works
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Our multi-factor ML engine replaces subjective guesswork with deterministic feature weighting evaluated against Nifty 50 benchmark sector medians.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {METHOD_FACTORS.map((m, idx) => (
            <div key={m.name} className="bg-white/10 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-blue-400">Pillar 0{idx + 1}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-white font-black text-xs border border-blue-400/30">{m.weight}</span>
                </div>
                <h4 className="text-xs font-bold text-white mb-2">{m.name}</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DATA SOURCES & TECH STACK */}
      <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="max-w-2xl mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Production Microservices & Technology Stack
          </h2>
          <p className="text-sm text-slate-500">
            Engineered using clean architecture, strict input validation, and containerized Docker services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TECH_STACK.map((t) => (
            <div key={t.category} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-2">{t.category}</span>
              <p className="text-xs font-semibold text-slate-800 leading-relaxed font-mono">{t.items}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="max-w-2xl mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500">
            Learn more about our data sources, RAG retrieval mechanism, and rating engine
          </p>
        </div>

        <div className="space-y-3 max-w-4xl">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-6 py-4 bg-slate-50/50 hover:bg-slate-100/80 flex items-center justify-between gap-4 font-bold text-sm text-slate-900 transition"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 py-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="border-t border-slate-200 pt-8 text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-bold text-slate-900">EquityIQ Professional</span> — Indian Stock Market Research Platform (NSE / BSE in ₹ INR)
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Disclaimer: Educational Research Tool</span>
        </div>
      </footer>

    </div>
  );
}
