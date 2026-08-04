import os
import re
import joblib
import numpy as np
from loguru import logger

# Path to serialized model artifacts
script_dir = os.path.dirname(os.path.abspath(__file__))
models_dir = os.path.abspath(os.path.join(script_dir, "..", "..", "models"))

model_path = os.path.join(models_dir, "sentiment_model.joblib")
vectorizer_path = os.path.join(models_dir, "tfidf_vectorizer.joblib")

_model = None
_vectorizer = None

def load_artifacts():
    global _model, _vectorizer
    if _model is not None and _vectorizer is not None:
        return _model, _vectorizer

    if os.path.exists(model_path) and os.path.exists(vectorizer_path):
        try:
            _model = joblib.load(model_path)
            _vectorizer = joblib.load(vectorizer_path)
            logger.info("Loaded ML sentiment model and TF-IDF vectorizer artifacts")
            return _model, _vectorizer
        except Exception as e:
            logger.error(f"Error loading model artifacts: {e}")
    
    logger.warn("ML model artifacts not found. Heuristic fallback classifier active.")
    return None, None

def clean_text(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def predict_sentiment(text: str) -> dict:
    cleaned = clean_text(text)
    if not cleaned:
        return {
            "label": "neutral",
            "confidence": 0.5,
            "probabilities": {"positive": 0.33, "negative": 0.33, "neutral": 0.34}
        }

    model, vectorizer = load_artifacts()

    if model is not None and vectorizer is not None:
        try:
            vec = vectorizer.transform([cleaned])
            pred_class = model.predict(vec)[0]
            
            if hasattr(model, "predict_proba"):
                probs = model.predict_proba(vec)[0]
                classes = model.classes_
                prob_dict = {str(c): float(round(p, 4)) for c, p in zip(classes, probs)}
                confidence = float(round(max(probs), 4))
            elif hasattr(model, "decision_function"):
                # Handle LinearSVC using softmax over decision scores
                scores = model.decision_function(vec)[0]
                exp_scores = np.exp(scores - np.max(scores))
                probs = exp_scores / exp_scores.sum()
                classes = model.classes_
                prob_dict = {str(c): float(round(p, 4)) for c, p in zip(classes, probs)}
                confidence = float(round(max(probs), 4))
            else:
                prob_dict = {str(pred_class): 1.0}
                confidence = 1.0

            return {
                "label": str(pred_class),
                "confidence": confidence,
                "probabilities": prob_dict
            }
        except Exception as e:
            logger.error(f"Error during ML sentiment inference: {e}")

    # Rule-based fallback classifier if artifacts uninitialized
    pos_words = {"profit", "growth", "increased", "gain", "up", "record", "surged", "strong", "improved", "expansion", "bullish"}
    neg_words = {"loss", "fell", "decline", "dropped", "down", "shrank", "downward", "weak", "bankruptcy", "cut", "impairment", "bearish"}
    
    words = set(cleaned.split())
    pos_count = len(words.intersection(pos_words))
    neg_count = len(words.intersection(neg_words))

    if pos_count > neg_count:
        label = "positive"
        conf = 0.85
        probs = {"positive": 0.85, "neutral": 0.10, "negative": 0.05}
    elif neg_count > pos_count:
        label = "negative"
        conf = 0.85
        probs = {"positive": 0.05, "neutral": 0.10, "negative": 0.85}
    else:
        label = "neutral"
        conf = 0.70
        probs = {"positive": 0.15, "neutral": 0.70, "negative": 0.15}

    return {
        "label": label,
        "confidence": conf,
        "probabilities": probs
    }
