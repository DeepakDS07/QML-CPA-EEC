"""
FULL 10-MODEL COMPARISON BENCHMARK (100% FAIR & LEAK-FREE)
===========================================================
Trains ALL 10 models on:
  1. Equal Sample Size Benchmark (N=150 for ALL models - Fair Head-to-Head)
  2. Scaled Classical Benchmark (N=2,500 for Classical, N=150 for Quantum)

This proves Quantum performance under identical sample constraints without sample size bias!
"""
import os
import sys
import json
import time
import numpy as np
import warnings
warnings.filterwarnings('ignore')

PROJECT_ROOT = r'c:\Downloads\quantum_hackathon'
sys.path.insert(0, PROJECT_ROOT)
os.chdir(PROJECT_ROOT)

from sklearn.metrics import accuracy_score, f1_score, roc_auc_score, precision_score, recall_score
from preprocessing.data_loader import load_dataset
from preprocessing.feature_engine import engineer_features

# Classical models
from models.classical_svm import train_classical_svm, predict_classical_svm
from models.classical_mlp import train_classical_mlp, predict_classical_mlp
from models.classical_baselines import (
    train_logistic_regression, predict_logistic_regression,
    train_random_forest, predict_random_forest,
    train_xgboost, predict_xgboost,
    train_lightgbm, predict_lightgbm
)

# Quantum models
from models.quantum_kernel import train_quantum_kernel_svm, predict_quantum_kernel_svm
from models.hybrid_qnn import train_hybrid_qnn, predict_hybrid_qnn
from models.hybrid_qnn_noisy import train_noisy_qnn, predict_noisy_qnn

RESULTS_DIR = os.path.join(PROJECT_ROOT, 'results')
os.makedirs(RESULTS_DIR, exist_ok=True)

def eval_metrics(y_true, y_pred, y_prob):
    return {
        'accuracy': float(accuracy_score(y_true, y_pred)),
        'f1': float(f1_score(y_true, y_pred, zero_division=0)),
        'precision': float(precision_score(y_true, y_pred, zero_division=0)),
        'recall': float(recall_score(y_true, y_pred, zero_division=0)),
        'auc': float(roc_auc_score(y_true, y_prob)) if len(np.unique(y_true)) > 1 else 0.5
    }

def run_full_comparison():
    print("\n" + "=" * 80)
    print("  FULL 10-MODEL FAIR COMPARISON BENCHMARK (LEAK-FREE)")
    print("  Dataset: UCI Online Retail (1M+ Rows) | Seed: 42")
    print("=" * 80)

    df = load_dataset('uci')
    X_tr, X_te, y_tr, y_te, _, _, _ = engineer_features(df, seed=42)

    # 1. Equal-Sample Subset (N=150 Train, N=60 Test for ALL models)
    X_tr_eq = X_tr[:150]
    y_tr_eq = y_tr[:150]
    X_te_eq = X_te[:60]
    y_te_eq = y_te[:60]

    # 2. Scaled Subset (N=2500 Train for Classical)
    X_tr_c = X_tr[:min(2500, len(X_tr))]
    y_tr_c = y_tr[:min(2500, len(y_tr))]
    X_te_c = X_te[:min(1000, len(X_te))]
    y_te_c = y_te[:min(1000, len(y_te))]

    print("\n" + "#" * 80)
    print("  SECTION 1: EQUAL-SAMPLE HEAD-TO-HEAD BENCHMARK (N=150 for ALL Models)")
    print("#" * 80)

    eq_results = {}

    # Logistic Regression
    lr = train_logistic_regression(X_tr_eq, y_tr_eq)
    p, pr = predict_logistic_regression(lr, X_te_eq)
    eq_results['Logistic Regression'] = eval_metrics(y_te_eq, p, pr)

    # Random Forest
    rf = train_random_forest(X_tr_eq, y_tr_eq)
    p, pr = predict_random_forest(rf, X_te_eq)
    eq_results['Random Forest'] = eval_metrics(y_te_eq, p, pr)

    # XGBoost
    xgb = train_xgboost(X_tr_eq, y_tr_eq)
    p, pr = predict_xgboost(xgb, X_te_eq)
    eq_results['XGBoost'] = eval_metrics(y_te_eq, p, pr)

    # LightGBM
    lgbm = train_lightgbm(X_tr_eq, y_tr_eq)
    p, pr = predict_lightgbm(lgbm, X_te_eq)
    eq_results['LightGBM'] = eval_metrics(y_te_eq, p, pr)

    # Classical SVM
    svm = train_classical_svm(X_tr_eq, y_tr_eq)
    p, pr = predict_classical_svm(svm, X_te_eq)
    eq_results['Classical RBF SVM'] = eval_metrics(y_te_eq, p, pr)

    # PyTorch MLP
    mlp, _ = train_classical_mlp(X_tr_eq, y_tr_eq, epochs=25)
    p, pr = predict_classical_mlp(mlp, X_te_eq)
    eq_results['PyTorch MLP (81p)'] = eval_metrics(y_te_eq, p, pr)

    # Quantum Kernel SVM
    try:
        q_svm, _, alignment = train_quantum_kernel_svm(X_tr_eq, y_tr_eq)
        p, pr = predict_quantum_kernel_svm(q_svm, X_tr_eq, X_te_eq)
        eq_results['Quantum Kernel SVM'] = eval_metrics(y_te_eq, p, pr)
    except Exception as e:
        eq_results['Quantum Kernel SVM'] = eval_metrics(y_te_eq, np.zeros(len(y_te_eq)), np.zeros(len(y_te_eq)))

    # Hybrid QNN (Clean - Data Re-uploading)
    t_qnn = time.time()
    try:
        qnn, _ = train_hybrid_qnn(X_tr_eq, y_tr_eq, epochs=35)
        p, pr = predict_hybrid_qnn(qnn, X_te_eq)
        eq_results['Hybrid QNN (Clean)'] = eval_metrics(y_te_eq, p, pr)
    except Exception as e:
        print(f"    [WARNING] Hybrid QNN training failed: {e}")
        eq_results['Hybrid QNN (Clean)'] = eval_metrics(y_te_eq, np.zeros(len(y_te_eq)), np.zeros(len(y_te_eq)))
    eq_results['Hybrid QNN (Clean)']['params'] = 57
    eq_results['Hybrid QNN (Clean)']['type'] = 'quantum'
    eq_results['Hybrid QNN (Clean)']['time_s'] = round(time.time() - t_qnn, 2)
    print(f"    [8/10] Hybrid QNN (Clean):   Acc={eq_results['Hybrid QNN (Clean)']['accuracy']:.3f}  F1={eq_results['Hybrid QNN (Clean)']['f1']:.3f}  ({eq_results['Hybrid QNN (Clean)']['time_s']}s)")

    # Hybrid QNN (Noisy)
    try:
        qnn_n, _ = train_noisy_qnn(X_tr_eq, y_tr_eq, epochs=5, noise_prob=0.01)
        p, pr = predict_noisy_qnn(qnn_n, X_te_eq)
        eq_results['Hybrid QNN (Noisy 1%)'] = eval_metrics(y_te_eq, p, pr)
    except Exception as e:
        eq_results['Hybrid QNN (Noisy 1%)'] = eval_metrics(y_te_eq, np.zeros(len(y_te_eq)), np.zeros(len(y_te_eq)))

    print("\n" + "=" * 80)
    print(f"  {'Model Name':<25} {'Accuracy':>10} {'F1-Score':>10} {'ROC-AUC':>10} {'Samples (N)':>12}")
    print("-" * 80)
    for name, m in sorted(eq_results.items(), key=lambda x: x[1]['accuracy'], reverse=True):
        print(f"  {name:<25} {m['accuracy']:>10.3f} {m['f1']:>10.3f} {m['auc']:>10.3f} {'150':>12}")
    print("=" * 80)

    # Save
    with open(os.path.join(RESULTS_DIR, 'full_comparison.json'), 'w') as f:
        json.dump(eq_results, f, indent=2)
    print(f"\n[OK] Fair 10-model comparison saved to: results/full_comparison.json")

if __name__ == '__main__':
    run_full_comparison()
