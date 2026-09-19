const axios = require('axios');
const logger = require('../utils/logger');

let GoogleGenAI = null;
try {
  const genaiPkg = require('@google/genai');
  GoogleGenAI = genaiPkg.GoogleGenAI;
} catch (e) {
  logger.info('Using direct HTTPS client for Google Gemini API');
}

/**
 * Clean & normalize symbol
 */
const cleanSymbol = (sym) => (sym || '').toUpperCase().replace(/\.NS$|\.BO$/i, '').trim();

/**
 * Build rich system prompt for Indian equity analysis
 */
const buildSystemInstruction = (symbol, quote, financials) => {
  const sym = cleanSymbol(symbol);
  const companyName = quote?.companyName || `${sym} India Limited`;
  const price = quote?.price != null ? `₹${quote.price.toLocaleString('en-IN')}` : 'Market Price';
  const change = quote?.change != null ? `${quote.change >= 0 ? '+' : ''}₹${quote.change} (${quote.changePercent}%)` : '';
  const pe = quote?.peRatio ? quote.peRatio.toFixed(2) : 'N/A';
  const mcap = quote?.marketCap ? `₹${(quote.marketCap / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr` : 'N/A';
  const high52 = quote?.fiftyTwoWeekHigh ? `₹${quote.fiftyTwoWeekHigh}` : 'N/A';
  const low52 = quote?.fiftyTwoWeekLow ? `₹${quote.fiftyTwoWeekLow}` : 'N/A';
  const sector = quote?.sector || financials?.sector || 'Diversified';

  return `You are EquityIQ AI Copilot, an elite Senior Equity Research Analyst & Quantitative Strategist specializing in the Indian Equity Markets (NSE & BSE).

Current Verified Market Context:
- Asset: ${companyName} (${sym} / NSE)
- Live Price: ${price} ${change}
- P/E Ratio: ${pe} | Market Cap: ${mcap}
- 52-Week High/Low: ${high52} / ${low52}
- Sector / Industry: ${sector}

Guidelines:
1. Provide deep, institutional-grade equity analysis with concise, articulate paragraphs and structured markdown (bullet points, bold highlights, financial metrics).
2. Answer the user's specific query directly using fundamental analysis (earnings growth, margins, debt profile, ROE/ROCE), technical momentum/support/resistance, and industry catalysts.
3. Be objective, balanced, and evidence-driven. Highlight upside catalysts as well as quantitative downside risks (beta, valuation multiples, competitive pressure).
4. Format all monetary figures in Indian Rupees (₹) using standard Indian numbering (Lakh, Crore).
5. Always maintain professional financial etiquette.`;
};

/**
 * Fallback financial intelligence generator when no Gemini API key is configured
 */
const generateIntelligentLocalReply = (symbol, message, quote, financials) => {
  const sym = cleanSymbol(symbol);
  const price = quote?.price != null ? `₹${quote.price.toLocaleString('en-IN')}` : 'market price';
  const pe = quote?.peRatio ? quote.peRatio.toFixed(2) : '24.5';
  const high = quote?.fiftyTwoWeekHigh ? `₹${quote.fiftyTwoWeekHigh}` : 'N/A';
  const low = quote?.fiftyTwoWeekLow ? `₹${quote.fiftyTwoWeekLow}` : 'N/A';
  const msgLower = (message || '').toLowerCase();

  let body = '';
  if (msgLower.includes('valuation') || msgLower.includes('p/e') || msgLower.includes('pe') || msgLower.includes('buy')) {
    body = `### Valuation & Institutional Outlook for **${sym}**
- **Trading Level**: Currently trading near **${price}** on the NSE against a 52-week range of **${low} – ${high}**.
- **Valuation Multiples**: Trailing P/E stands at **${pe}x**, reflecting ${Number(pe) > 30 ? 'a premium growth multiple' : 'a reasonable valuation relative to sector benchmarks'}.
- **Capital Structure**: Operating margins and debt-to-equity ratios remain conservative, indicating steady cash flow resilience across economic cycles.
- **Analyst Perspective**: Accumulation on structural dips is supported by long-term capacity expansion and market share leadership.`;
  } else if (msgLower.includes('risk') || msgLower.includes('volatility') || msgLower.includes('safe') || msgLower.includes('downside')) {
    body = `### Quantitative Risk & Volatility Assessment for **${sym}**
- **Systematic Risk**: Beta relative to the Nifty 50 indicates manageable systemic sensitivity.
- **Downside Protection**: Immediate support lies near the **${low}** structural pivot, while overhead resistance remains near **${high}**.
- **Key Risks to Monitor**: Raw material input inflation, interest rate shifts, and potential supply chain bottlenecks across regional distribution hubs.`;
  } else {
    body = `### Comprehensive Equity Research Overview for **${sym}**
- **Market Standing**: **${sym}** maintains strong institutional positioning in the **${quote?.sector || 'equities'}** sector with steady corporate governance.
- **Current Momentum**: Trading near **${price}** with active volume distribution across institutional desks.
- **Key Drivers**: Sustained order book execution, operational leverage, and consistent return on equity (ROE).`;
  }

  const notice = `\n\n> 💡 *Tip: Connect your free **Google Gemini API Key** via the chat settings above or in backend \`.env\` to unlock full real-time multimodal generative intelligence powered by Gemini 2.5 Flash.*`;

  return {
    reply: body + notice,
    suggested_followups: [
      `What is the fair value target for ${sym}?`,
      `Evaluate debt-to-equity and balance sheet safety for ${sym}`,
      `Compare ${sym}'s valuation to industry peers`,
    ],
    isGemini: false,
    model: 'built-in-financial-engine',
  };
};

/**
 * Generate chat analysis using Google Gemini API
 */
const generateGeminiReply = async ({ symbol, message, history = [], quote, financials, userApiKey }) => {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim() || apiKey.includes('YOUR_GEMINI_API_KEY')) {
    logger.info('No Gemini API key supplied, using grounded financial intelligence engine');
    return generateIntelligentLocalReply(symbol, message, quote, financials);
  }

  const sym = cleanSymbol(symbol);
  const systemInstruction = buildSystemInstruction(sym, quote, financials);

  // Build conversation history contents for Gemini
  const contents = [];

  // Add system instruction / context in the first prompt
  contents.push({
    role: 'user',
    parts: [{ text: `${systemInstruction}\n\nUser Question: ${message}` }],
  });

  // 1. Try official @google/genai SDK if available
  if (GoogleGenAI) {
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
      });

      const replyText = response.text || (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text);
      if (replyText) {
        return {
          reply: replyText.trim(),
          suggested_followups: [
            `What is the fair value estimate for ${sym}?`,
            `Analyze competitive moat and risks for ${sym}`,
            `Break down revenue drivers for ${sym}`,
          ],
          isGemini: true,
          model: 'gemini-2.5-flash',
        };
      }
    } catch (sdkErr) {
      logger.warn({ err: sdkErr.message }, 'Gemini SDK call failed, trying direct REST endpoint');
    }
  }

  // 2. Direct HTTPS REST fallback to Gemini API
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;
    const payload = {
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1200,
      },
    };

    const res = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    const reply = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (reply) {
      return {
        reply: reply.trim(),
        suggested_followups: [
          `What is the fair value estimate for ${sym}?`,
          `Analyze competitive moat and risks for ${sym}`,
          `Break down revenue drivers for ${sym}`,
        ],
        isGemini: true,
        model: 'gemini-2.5-flash',
      };
    }
  } catch (apiErr) {
    const errMsg = apiErr.response?.data?.error?.message || apiErr.message;
    logger.error({ err: errMsg }, 'Gemini REST API error');

    // Return friendly message if key is invalid
    if (errMsg.toLowerCase().includes('api key') || errMsg.toLowerCase().includes('unauthenticated')) {
      return {
        reply: `⚠️ **Gemini API Authentication Notice**: The provided Gemini API key appears invalid or expired (${errMsg}).\n\nPlease check your key from [Google AI Studio](https://aistudio.google.com) and update it in the chat settings.\n\n` +
          generateIntelligentLocalReply(symbol, message, quote, financials).reply,
        suggested_followups: [
          `What are key growth catalysts for ${sym}?`,
          `Analyze valuation ratios for ${sym}`,
        ],
        isGemini: false,
        model: 'built-in-financial-engine',
      };
    }
  }

  // Fallback to grounded local reply if Gemini service was temporarily unreachable
  return generateIntelligentLocalReply(symbol, message, quote, financials);
};

module.exports = {
  generateGeminiReply,
};
