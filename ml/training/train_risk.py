import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import KFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib

# Fix explicit random seed for full reproducibility
SEED = 42
np.random.seed(SEED)

def calculate_rsi(prices, window=14):
    deltas = np.diff(prices)
    seed = deltas[:window+1]
    up = seed[seed >= 0].sum() / window
    down = -seed[seed < 0].sum() / window
    rs = up / down if down != 0 else 0
    rsi = np.zeros_like(prices)
    rsi[:window] = 100. - 100. / (1. + rs)

    for i in range(window, len(prices)):
        delta = deltas[i - 1]
        if delta > 0:
            upval = delta
            downval = 0.
        else:
            upval = 0.
            downval = -delta
        up = (up * (window - 1) + upval) / window
        down = (down * (window - 1) + downval) / window
        rs = up / down if down != 0 else 0
        rsi[i] = 100. - 100. / (1. + rs)
    return rsi[-1]

def calculate_macd(prices):
    exp1 = pd.Series(prices).ewm(span=12, adjust=False).mean()
    exp2 = pd.Series(prices).ewm(span=26, adjust=False).mean()
    macd = exp1 - exp2
    signal = macd.ewm(span=9, adjust=False).mean()
    hist = macd - signal
    return macd.iloc[-1], signal.iloc[-1], hist.iloc[-1]

def generate_risk_dataset(n_samples=200):
    """
    Generates synthetic historical return series and extracts quantitative risk features
    tailored for Indian stock market equities (NSE/BSE).
    """
    records = []
    
    # Simulate historical price trajectories
    for i in range(n_samples):
        base_price = np.random.uniform(500, 3500)
        daily_vol = np.random.uniform(0.008, 0.035)
        trend = np.random.uniform(-0.0005, 0.001)
        
        # 120 days of simulated prices
        returns = np.random.normal(loc=trend, scale=daily_vol, size=120)
        price_series = base_price * np.cumprod(1 + returns)
        
        # Nifty 50 benchmark returns for beta calculation
        nifty_returns = np.random.normal(loc=0.0003, scale=0.012, size=120)
        
        # Quantitative Features
        returns_20 = returns[-20:]
        returns_60 = returns[-60:]
        
        vol_20d = np.std(returns_20, ddof=1) * np.sqrt(252) # Annualized 20D Volatility
        vol_60d = np.std(returns_60, ddof=1) * np.sqrt(252) # Annualized 60D Volatility
        
        var_95 = np.percentile(returns_60, 5) # Historical 95% 1-day VaR
        var_99 = np.percentile(returns_60, 1) # Historical 99% 1-day VaR
        
        # Maximum Drawdown
        cum_prices = pd.Series(price_series)
        running_max = cum_prices.cummax()
        drawdown = (cum_prices - running_max) / running_max
        max_drawdown = drawdown.min()
        
        # Beta relative to Nifty 50 benchmark
        cov = np.cov(returns_60, nifty_returns[-60:])[0][1]
        var_nifty = np.var(nifty_returns[-60:], ddof=1)
        beta = cov / var_nifty if var_nifty != 0 else 1.0
        
        # Sharpe Ratio (Indian Risk-free Rate Rf = 6.5%)
        rf_daily = 0.065 / 252
        mean_ret = np.mean(returns_60)
        sharpe_ratio = (mean_ret - rf_daily) / np.std(returns_60, ddof=1) * np.sqrt(252) if np.std(returns_60) != 0 else 0
        
        # Technical Momentum Indicators
        rsi = calculate_rsi(price_series)
        macd_val, macd_sig, macd_hist = calculate_macd(price_series)
        
        # Composite Target Volatility Score (0 - 100 scale)
        risk_score = min(100.0, max(0.0, (vol_60d * 180.0) + (abs(max_drawdown) * 120.0) + (max(0, beta - 1.0) * 20.0)))
        
        records.append({
          'vol_20d': vol_20d,
          'vol_60d': vol_60d,
          'var_95': abs(var_95),
          'var_99': abs(var_99),
          'max_drawdown': abs(max_drawdown),
          'beta': beta,
          'sharpe_ratio': sharpe_ratio,
          'rsi': rsi,
          'macd_hist': macd_hist,
          'target_risk_score': risk_score
        })
        
    return pd.DataFrame(records)

def main():
    print("=" * 60)
    print("EquityIQ — ML Quantitative Risk Model Training Pipeline")
    print("=" * 60)
    
    df = generate_risk_dataset(n_samples=250)
    print(f"Generated dataset shape: {df.shape}")
    
    feature_cols = ['vol_20d', 'vol_60d', 'var_95', 'var_99', 'max_drawdown', 'beta', 'sharpe_ratio', 'rsi', 'macd_hist']
    X = df[feature_cols]
    y = df['target_risk_score']
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    models = {
      'RandomForest': RandomForestRegressor(n_estimators=100, random_state=SEED),
      'GradientBoosting': GradientBoostingRegressor(n_estimators=100, random_state=SEED)
    }
    
    kf = KFold(n_splits=5, shuffle=True, random_state=SEED)
    best_model_name = None
    best_r2 = -float('inf')
    best_model = None
    results_summary = {}
    
    for name, model in models.items():
        scores = cross_val_score(model, X_scaled, y, cv=kf, scoring='r2')
        r2_mean = np.mean(scores)
        print(f"Model: {name:<20} | 5-Fold Cross-Val R2 Score: {r2_mean:.4f}")
        results_summary[name] = {'r2_score': r2_mean}
        
        if r2_mean > best_r2:
            best_r2 = r2_mean
            best_model_name = name
            best_model = model

    print("-" * 60)
    print(f"Best Performing Risk Model: {best_model_name} (R2 = {best_r2:.4f})")
    
    # Train best model on full dataset
    best_model.fit(X_scaled, y)
    
    # Save comparison report
    base_dir = os.path.dirname(os.path.abspath(__file__))
    reports_dir = os.path.join(base_dir, '..', 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    report_path = os.path.join(reports_dir, 'risk_model_comparison.json')
    
    with open(report_path, 'w') as f:
        json.dump({
          'best_model': best_model_name,
          'r2_score': best_r2,
          'models': results_summary,
          'features': feature_cols
        }, f, indent=2)
    print(f"Saved evaluation report to {report_path}")
    
    # Serialize model artifacts to ai-service/models/
    models_dir = os.path.join(base_dir, '..', '..', 'ai-service', 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, 'risk_model.joblib')
    scaler_path = os.path.join(models_dir, 'risk_scaler.joblib')
    
    joblib.dump(best_model, model_path)
    joblib.dump(scaler, scaler_path)
    
    print(f"Serialized best model artifact: {model_path}")
    print(f"Serialized scaler artifact: {scaler_path}")
    print("=" * 60)
    print("Phase 6 Risk Model Training Completed Successfully!")

if __name__ == '__main__':
    main()
