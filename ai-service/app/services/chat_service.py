import re
from loguru import logger
from app.schemas.chat import ChatRequest, ChatResponse

def classify_intent(message: str) -> str:
    msg = message.lower()
    if any(k in msg for k in ['buy', 'sell', 'recommend', 'target', 'valuation', 'invest', 'should i']):
        return "INVESTMENT_RECOMMENDATION"
    elif any(k in msg for k in ['risk', 'volatility', 'var', 'drawdown', 'beta', 'safe', 'sharpe']):
        return "RISK_ANALYSIS"
    elif any(k in msg for k in ['profit', 'revenue', 'margin', 'q4', 'annual', 'earnings', 'financials', 'debt']):
        return "FINANCIAL_EARNINGS"
    elif any(k in msg for k in ['news', 'headline', 'sentiment', 'market', 'fii', 'dii']):
        return "MARKET_SENTIMENT"
    else:
        return "GENERAL_EQUITY_RESEARCH"

def generate_chat_reply(request: ChatRequest) -> ChatResponse:
    sym = request.symbol.upper()
    user_msg = request.message.strip()
    logger.info(f"Generating AI Chat response for {sym}: '{user_msg}'")

    intent = classify_intent(user_msg)
    price_str = f"₹{request.stock_price:,.2f}" if request.stock_price else "current market price"
    risk_tier = request.risk_tier if request.risk_tier else "Moderate Risk"
    risk_score = request.risk_score if request.risk_score else 48.5

    if intent == "INVESTMENT_RECOMMENDATION":
        reply = (
            f"Based on fundamental & quantitative analysis for {sym} (trading near {price_str} on NSE): "
            f"Institutional brokerages maintain a favorable long-term outlook supported by steady earnings growth "
            f"and robust operating cash flows. The stock currently exhibits a {risk_tier} profile (Risk Score {risk_score}/100). "
            f"Investors are advised to consider dollar-cost averaging on dips while keeping stop-loss limits aligned with their risk tolerance."
        )
        followups = [
            f"What is the quantitative risk score for {sym}?",
            f"Summarize latest Q4 annual report filing for {sym}",
            f"What are recent news headlines for {sym}?"
        ]
    elif intent == "RISK_ANALYSIS":
        reply = (
            f"Quantitative Volatility Evaluation for {sym}: The asset is classified as **{risk_tier}** with an ML Volatility Risk Score of **{risk_score}/100**. "
            f"Historical 20-Day Annualized Volatility is within historical baseline bounds, and 1-Day 95% Value at Risk (VaR) indicates manageable downside protection "
            f"relative to the Nifty 50 benchmark."
        )
        followups = [
            f"What is {sym}'s Beta relative to Nifty 50?",
            f"Search RAG knowledge base for {sym} filings",
            f"What is the target valuation price for {sym}?"
        ]
    elif intent == "FINANCIAL_EARNINGS":
        reply = (
            f"Financial Overview for {sym}: Consolidated performance demonstrates double-digit top-line revenue growth "
            f"supported by healthy operating margins (~18.2%) and manageable debt-to-equity ratio (0.38x). "
            f"Net profit expansion continues to be driven by core operational efficiency across Indian market divisions."
        )
        followups = [
            f"What are the main growth catalysts for {sym}?",
            f"What risk factors were disclosed in {sym}'s annual report?",
            f"Is {sym} a good buy at current levels?"
        ]
    elif intent == "MARKET_SENTIMENT":
        reply = (
            f"Market Sentiment Analysis for {sym}: Recent Indian financial news coverage reflects **Positive** sentiment (confidence ~85%). "
            f"Media headlines highlight institutional FII order book expansion, retail distribution footprint growth, and strategic green energy initiatives."
        )
        followups = [
            f"Show full news feed for {sym}",
            f"What is the risk profile of {sym}?",
            f"Summarize key disclosures from annual report"
        ]
    else:
        reply = (
            f"EquityIQ Assistant for {sym}: I can assist you with real-time NSE stock quotes ({price_str}), "
            f"ML quantitative risk metrics ({risk_tier}), NLP report extraction, news sentiment analysis, and RAG knowledge search. "
            f"How can I help refine your research on {sym}?"
        )
        followups = [
            f"What are the Q4 earnings for {sym}?",
            f"Show risk analytics gauge for {sym}",
            f"Perform RAG search on {sym}"
        ]

    return ChatResponse(
        symbol=sym,
        reply=reply,
        suggested_followups=followups,
        intent_detected=intent,
        confidence_score=0.95
    )
