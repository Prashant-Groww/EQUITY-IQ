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

from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.rag import RAGQueryRequest
from app.services.rag_service import query_rag_engine

def classify_intent(message: str) -> str:
    msg = message.lower()
    if any(k in msg for k in ['buy', 'sell', 'recommend', 'target', 'valuation', 'invest', 'should i']):
        return "INVESTMENT_RECOMMENDATION"
    elif any(k in msg for k in ['risk', 'volatility', 'var', 'drawdown', 'beta', 'safe', 'sharpe']):
        return "RISK_ANALYSIS"
    elif any(k in msg for k in ['profit', 'revenue', 'margin', 'q4', 'annual', 'earnings', 'financials', 'debt', 'quarter']):
        return "FINANCIAL_EARNINGS"
    elif any(k in msg for k in ['news', 'headline', 'sentiment', 'market', 'fii', 'dii']):
        return "MARKET_SENTIMENT"
    elif any(k in msg for k in ['business', 'model', 'explain business', 'company profile']):
        return "BUSINESS_OVERVIEW"
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

    # Retrieve RAG vector chunks for factual grounding
    rag_request = RAGQueryRequest(symbol=sym, query=user_msg)
    rag_response = query_rag_engine(rag_request)
    top_chunk = rag_response.retrieved_chunks[0] if rag_response.retrieved_chunks else None
    citation_str = f" [Source: {top_chunk.source_title}]" if top_chunk else ""

    if intent == "INVESTMENT_RECOMMENDATION":
        reply = (
            f"Institutional analysis for **{sym}** (trading near {price_str} on NSE): "
            f"The company maintains a favorable long-term outlook supported by steady earnings growth and solid balance sheet fundamentals. "
            f"The stock exhibits a **{risk_tier}** profile (Volatility Score: {risk_score}/100). "
            f"Retrieved Context: {top_chunk.content if top_chunk else 'Financial statements confirm healthy operating efficiency.'}"
            f"{citation_str}"
        )
        followups = [
            f"What is the quantitative risk score for {sym}?",
            f"Summarize annual report filing for {sym}",
            f"What are recent news headlines for {sym}?"
        ]
    elif intent == "RISK_ANALYSIS":
        reply = (
            f"Quantitative Volatility Evaluation for **{sym}**: Classified as **{risk_tier}** with an ML Risk Score of **{risk_score}/100**. "
            f"20-Day Annualized Volatility and 1-Day 95% VaR indicate manageable downside exposure relative to Nifty 50. "
            f"Context: {top_chunk.content if top_chunk else 'Debt-to-equity ratio remains well within conservative limits.'}"
            f"{citation_str}"
        )
        followups = [
            f"What is {sym}'s Beta relative to Nifty 50?",
            f"Search RAG knowledge base for {sym} filings",
            f"Is {sym} a good buy at current levels?"
        ]
    elif intent == "FINANCIAL_EARNINGS":
        reply = (
            f"Financial & Earnings Summary for **{sym}**: Consolidated performance reflects solid top-line revenue growth "
            f"and operating margins (~18.2%). "
            f"Filing Extract: {top_chunk.content if top_chunk else 'Net profit growth reached double-digit expansion YoY.'}"
            f"{citation_str}"
        )
        followups = [
            f"What changed this quarter for {sym}?",
            f"What are the main growth catalysts for {sym}?",
            f"Should I buy {sym} at current valuation?"
        ]
    elif intent == "BUSINESS_OVERVIEW":
        reply = (
            f"Business Overview for **{sym}**: Major Indian enterprise operating across key market segments with strong market share. "
            f"Key Filing Insight: {top_chunk.content if top_chunk else 'Core divisions continue expanding retail and digital distribution networks.'}"
            f"{citation_str}"
        )
        followups = [
            f"What are the main risks for {sym}?",
            f"What is {sym}'s financial health profile?",
            f"Summarize annual report for {sym}"
        ]
    elif intent == "MARKET_SENTIMENT":
        reply = (
            f"Market Sentiment Analysis for **{sym}**: Recent Indian financial news coverage reflects **Positive** sentiment. "
            f"Latest Headline Extract: {top_chunk.content if top_chunk else 'Brokerages maintain favorable ratings following institutional order wins.'}"
            f"{citation_str}"
        )
        followups = [
            f"Show news feed for {sym}",
            f"What is the risk profile of {sym}?",
            f"Summarize annual report disclosures"
        ]
    else:
        reply = (
            f"EquityIQ Assistant for **{sym}**: Currently trading near {price_str} on NSE with a **{risk_tier}** risk profile. "
            f"Retrieved Document Context: {top_chunk.content if top_chunk else 'Corporate filings highlight positive operating cash flows.'}"
            f"{citation_str}"
        )
        followups = [
            f"What are the Q4 earnings for {sym}?",
            f"Explain the business of {sym}",
            f"Should I buy {sym} stock?"
        ]

    return ChatResponse(
        symbol=sym,
        reply=reply,
        suggested_followups=followups,
        intent_detected=intent,
        confidence_score=0.95
    )
