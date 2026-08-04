# EquityIQ — ML Financial Sentiment Reports

This directory contains evaluation reports, model comparison metrics, confusion matrices, and dataset license documentation for Phase 5.

## Dataset Documentation & License

- **Corpus**: Financial PhraseBank Corpus (Malo et al., 2014, *Journal of the Association for Information Science and Technology*)
- **Domain**: Labeled Financial News Headlines (Positive, Neutral, Negative)
- **License**: Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)
- **Random Seed**: `42` set across all statistical steps for strict reproducibility.

## Trained Models Zoo

1. **Logistic Regression** (`C=1.0`)
2. **Multinomial Naive Bayes** (`alpha=1.0`)
3. **Linear Support Vector Machine** (`LinearSVC`, `C=1.0`)
4. **Random Forest** (`n_estimators=100`)

Cross-validation metrics and confusion matrices are logged in `model_comparison.json`.
The top-performing model and TF-IDF vectorizer are serialized to `ai-service/models/`.
