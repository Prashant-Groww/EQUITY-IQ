from loguru import logger
from app.schemas.portfolio import (
    HoldingInput,
    PortfolioOptimizeRequest,
    PortfolioOptimizeResponse,
    RebalanceRecommendation,
)

# Known Indian Stock Betas (vs Nifty 50 benchmark)
STOCK_BETAS = {
    "RELIANCE": 1.05,
    "TCS": 0.85,
    "INFY": 0.95,
    "HDFCBANK": 1.10,
    "ICICIBANK": 1.15,
    "SBIN": 1.25,
    "LT": 1.08,
    "BHARTIARTL": 0.80,
    "ITC": 0.65,
    "AXISBANK": 1.20,
    "ASIANPAINT": 0.75,
    "MARUTI": 1.02,
    "TATAMOTORS": 1.40,
    "SUNPHARMA": 0.70,
    "WIPRO": 0.90,
    "HCLTECH": 0.88,
    "ADANIENT": 1.65,
    "ADANIPORTS": 1.35,
    "KOTAKBANK": 1.05,
    "ULTRACEMCO": 1.00,
}

class PortfolioAnalyticsService:
    def optimize_portfolio(self, request: PortfolioOptimizeRequest) -> PortfolioOptimizeResponse:
        logger.info(f"Optimizing portfolio with {len(request.holdings)} holdings")
        
        if not request.holdings:
            raise ValueError("Portfolio must contain at least one holding")

        total_value = 0.0
        holding_values = {}
        
        # 1. Compute values per stock and total value
        for holding in request.holdings:
            price = holding.current_price if (holding.current_price and holding.current_price > 0) else holding.avg_buy_price
            val = holding.quantity * price
            holding_values[holding.symbol] = val
            total_value += val

        if total_value <= 0:
            total_value = 1.0

        # 2. Asset allocation breakdown
        asset_allocation = {}
        max_weight = 0.0
        max_symbol = ""
        
        for symbol, val in holding_values.items():
            weight = round((val / total_value) * 100.0, 2)
            asset_allocation[symbol] = weight
            if weight > max_weight:
                max_weight = weight
                max_symbol = symbol

        concentration_risk = max_weight > 30.0

        # 3. Weighted Portfolio Beta
        weighted_beta = 0.0
        for holding in request.holdings:
            weight = holding_values[holding.symbol] / total_value
            symbol_clean = holding.symbol.replace(".NS", "").upper()
            beta = STOCK_BETAS.get(symbol_clean, 1.0)
            weighted_beta += weight * beta
        
        weighted_beta = round(weighted_beta, 2)

        # 4. Diversification Score (0 to 100)
        # Using normalized Herfindahl-Hirschman Index (HHI)
        num_holdings = len(request.holdings)
        hhi = sum((w / 100.0) ** 2 for w in asset_allocation.values())
        
        # Perfect equal distribution of N stocks gives HHI = 1/N
        # Score = 100 * (1 - HHI), adjusted for count
        raw_score = 100.0 * (1.0 - hhi)
        if num_holdings == 1:
            diversification_score = 25.0
        elif num_holdings == 2:
            diversification_score = min(60.0, raw_score * 1.1)
        else:
            diversification_score = min(98.0, raw_score * 1.2)
        
        if concentration_risk and diversification_score > 65.0:
            diversification_score -= 15.0

        diversification_score = round(max(10.0, min(100.0, diversification_score)), 1)

        # 5. Recommendations
        recommendations = []
        target_weight = round(100.0 / max(1, num_holdings), 2)
        
        for symbol, weight in asset_allocation.items():
            if weight > 35.0:
                action = "REBALANCE_REDUCE"
                reason = f"High concentration risk ({weight}% of portfolio). Consider trimming position to reduce volatility."
            elif weight < 10.0 and num_holdings >= 3:
                action = "ACCUMULATE"
                reason = f"Underweight position ({weight}%). Consider gradual accumulation if investment thesis holds."
            else:
                action = "HOLD"
                reason = f"Allocation ({weight}%) is within optimal parameters."

            recommendations.append(
                RebalanceRecommendation(
                    symbol=symbol,
                    action=action,
                    current_weight_pct=weight,
                    target_weight_pct=target_weight,
                    reasoning=reason,
                )
            )

        # 6. Actionable Summary
        if concentration_risk:
            summary = (
                f"Portfolio exhibits high concentration risk with {max_symbol} accounting for {max_weight}% "
                f"of total capital. Diversification Score: {diversification_score}/100. Weighted Beta: {weighted_beta}. "
                f"Rebalancing recommended to distribute exposure across non-correlated sectors."
            )
        else:
            summary = (
                f"Portfolio shows balanced asset distribution across {num_holdings} stocks. "
                f"Diversification Score: {diversification_score}/100. Weighted Beta: {weighted_beta}. "
                f"Current positions are aligned with target allocation thresholds."
            )

        return PortfolioOptimizeResponse(
            diversification_score=diversification_score,
            portfolio_beta=weighted_beta,
            concentration_risk=concentration_risk,
            recommendations=recommendations,
            asset_allocation=asset_allocation,
            summary=summary,
        )

portfolio_analytics_service = PortfolioAnalyticsService()
