import os
import json
import re
import pandas as pd
import numpy as np
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support

# Fix seed for strict reproducibility
SEED = 42
np.random.seed(SEED)

def clean_text(text: str) -> str:
    """Preprocess text: lowercasing, removing numbers & special characters, whitespace normalization."""
    text = str(text).lower()
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def main():
    print("=" * 60)
    print("EquityIQ — Financial News Sentiment Model Training Pipeline")
    print("=" * 60)

    # Base paths setup
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "..", ".."))
    dataset_path = os.path.join(project_root, "ml", "datasets", "financial_phrasebank.csv")
    reports_dir = os.path.join(project_root, "ml", "reports")
    models_dir = os.path.join(project_root, "ai-service", "models")

    os.makedirs(reports_dir, exist_ok=True)
    os.makedirs(models_dir, exist_ok=True)

    # 1. Load dataset
    df = pd.read_csv(dataset_path)
    print(f"Loaded dataset: {len(df)} samples from {dataset_path}")

    # EDA: Class balance
    class_counts = df['sentiment'].value_counts().to_dict()
    print(f"Class distribution: {class_counts}")

    # Clean text
    df['clean_text'] = df['text'].apply(clean_text)
    df['text_len'] = df['clean_text'].apply(lambda x: len(x.split()))

    # 2. Feature Extraction with TF-IDF
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=5000,
        sublinear_tf=True
    )

    X = vectorizer.fit_transform(df['clean_text'])
    y = df['sentiment']
    classes = np.unique(y)

    print(f"TF-IDF Feature matrix shape: {X.shape}")

    # 3. Model Zoo & 5-Fold Stratified Cross-Validation
    models = {
        "LogisticRegression": LogisticRegression(C=1.0, max_iter=1000, random_state=SEED),
        "MultinomialNB": MultinomialNB(alpha=1.0),
        "LinearSVM": LinearSVC(C=1.0, random_state=SEED, dual=False),
        "RandomForest": RandomForestClassifier(n_estimators=100, random_state=SEED),
    }

    results = {}
    best_f1 = -1.0
    best_model_name = None
    best_model_obj = None

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)

    for name, model in models.items():
        # Evaluate 5-fold CV manually to avoid sklearn zero_division warnings
        accs, precs, recs, f1s = [], [], [], []
        for train_idx, val_idx in skf.split(X, y):
            X_tr, X_va = X[train_idx], X[val_idx]
            y_tr, y_va = y.iloc[train_idx], y.iloc[val_idx]

            m = model.fit(X_tr, y_tr)
            preds = m.predict(X_va)

            p, r, f, _ = precision_recall_fscore_support(y_va, preds, average='macro', zero_division=0)
            accs.append(accuracy_score(y_va, preds))
            precs.append(p)
            recs.append(r)
            f1s.append(f)

        acc = float(np.mean(accs))
        prec = float(np.mean(precs))
        rec = float(np.mean(recs))
        f1 = float(np.mean(f1s))

        # Fit model on entire dataset for confusion matrix & final artifact
        model.fit(X, y)
        y_pred = model.predict(X)
        cm = confusion_matrix(y, y_pred, labels=classes).tolist()

        results[name] = {
            "accuracy": round(acc, 4),
            "precision_macro": round(prec, 4),
            "recall_macro": round(rec, 4),
            "f1_macro": round(f1, 4),
            "confusion_matrix": cm,
            "classes": classes.tolist(),
        }

        print(f"Model: {name:<20} | Acc: {acc:.4f} | Prec: {prec:.4f} | Rec: {rec:.4f} | F1: {f1:.4f}")

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model_obj = model

    print("-" * 60)
    print(f"Best Performing Model: {best_model_name} (Macro F1 = {best_f1:.4f})")

    # 4. Save Model Evaluation Report & Dataset License Documentation
    report_data = {
        "dataset_info": {
            "source": "Financial PhraseBank (Malo et al., 2014) - Labeled Financial Headlines Corpus",
            "license": "CC BY-SA 3.0 Open Data License",
            "total_samples": len(df),
            "class_distribution": class_counts,
            "mean_text_length_words": float(np.mean(df['text_len'])),
            "seed": SEED,
        },
        "models_performance": results,
        "selected_best_model": best_model_name,
        "selected_best_f1": round(best_f1, 4),
    }

    report_json_path = os.path.join(reports_dir, "model_comparison.json")
    with open(report_json_path, "w") as f:
        json.dump(report_data, f, indent=2)
    print(f"Saved evaluation report to {report_json_path}")

    # 5. Serialize Best Model & Vectorizer with joblib
    model_output_path = os.path.join(models_dir, "sentiment_model.joblib")
    vectorizer_output_path = os.path.join(models_dir, "tfidf_vectorizer.joblib")

    joblib.dump(best_model_obj, model_output_path)
    joblib.dump(vectorizer, vectorizer_output_path)

    print(f"Serialized best model artifact: {model_output_path}")
    print(f"Serialized TF-IDF vectorizer artifact: {vectorizer_output_path}")
    print("=" * 60)
    print("Phase 5 Sentiment Model Training Completed Successfully!")

if __name__ == "__main__":
    main()
