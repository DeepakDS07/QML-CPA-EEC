"""
Additional Classical Baseline Models for Fair Comparison:
  - Logistic Regression (simplest linear baseline)
  - XGBoost Classifier (state-of-the-art gradient boosting)
  - LightGBM Classifier (fast gradient boosting)
  - Random Forest Classifier (ensemble of decision trees)

These baselines let judges see exactly where quantum models stand
relative to the best classical alternatives.
"""
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

def train_logistic_regression(X_train, y_train, seed=42):
    model = LogisticRegression(max_iter=1000, random_state=seed)
    model.fit(X_train, y_train)
    return model

def predict_logistic_regression(model, X):
    probs = model.predict_proba(X)[:, 1]
    preds = (probs > 0.5).astype(int)
    return preds, probs

def train_random_forest(X_train, y_train, seed=42):
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=seed)
    model.fit(X_train, y_train)
    return model

def predict_random_forest(model, X):
    probs = model.predict_proba(X)[:, 1]
    preds = (probs > 0.5).astype(int)
    return preds, probs

def train_xgboost(X_train, y_train, seed=42):
    try:
        from xgboost import XGBClassifier
        model = XGBClassifier(
            n_estimators=100, max_depth=6, learning_rate=0.1,
            use_label_encoder=False, eval_metric='logloss',
            random_state=seed, verbosity=0
        )
        model.fit(X_train, y_train)
        return model
    except ImportError:
        print("    [WARNING] XGBoost not installed, using RandomForest fallback")
        return train_random_forest(X_train, y_train, seed)

def predict_xgboost(model, X):
    probs = model.predict_proba(X)[:, 1]
    preds = (probs > 0.5).astype(int)
    return preds, probs

def train_lightgbm(X_train, y_train, seed=42):
    try:
        from lightgbm import LGBMClassifier
        model = LGBMClassifier(
            n_estimators=100, max_depth=6, learning_rate=0.1,
            random_state=seed, verbose=-1
        )
        model.fit(X_train, y_train)
        return model
    except ImportError:
        print("    [WARNING] LightGBM not installed, using RandomForest fallback")
        return train_random_forest(X_train, y_train, seed)

def predict_lightgbm(model, X):
    probs = model.predict_proba(X)[:, 1]
    preds = (probs > 0.5).astype(int)
    return preds, probs
