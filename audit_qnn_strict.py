"""
STRICT HYBRID QNN AUDIT: Is the score fabricated?
==================================================
This script checks EVERY possible way the QNN could be cheating:

1. HARDCODED FALLBACK CHECK: Does the except block inject fake scores?
2. TRAIN/TEST LEAKAGE: Is the model ever evaluated on training data?
3. OVERFITTING CHECK: Compare train accuracy vs test accuracy
4. RANDOM BASELINE: Is the QNN beating a random coin flip meaningfully?
5. PERMUTATION TEST: If labels are shuffled, does accuracy drop to ~50%?
6. QUANTUM CIRCUIT REALITY: Are quantum weights actually being used?
7. FEATURE-TARGET CORRELATION: Is any single feature too predictive?
8. PREDICTION DIVERSITY: Is the model just predicting one class?
"""
import sys, os
import numpy as np
import torch

PROJECT_ROOT = r'c:\Downloads\quantum_hackathon'
sys.path.insert(0, PROJECT_ROOT)
os.chdir(PROJECT_ROOT)

from sklearn.metrics import accuracy_score
from preprocessing.data_loader import load_dataset
from preprocessing.feature_engine import engineer_features
from models.hybrid_qnn import train_hybrid_qnn, predict_hybrid_qnn, create_hybrid_qnn_model

def main():
    print("=" * 80)
    print("  STRICT HYBRID QNN FABRICATION AUDIT")
    print("  (Independent Verification - No Trust Assumed)")
    print("=" * 80)

    issues_found = []
    checks_passed = 0
    total_checks = 8

    # Load data
    df = load_dataset('uci')
    X_tr, X_te, y_tr, y_te, _, _ = engineer_features(df, seed=42)

    # Use the SAME small sample size the benchmark uses
    N_TRAIN = 150
    N_TEST = 60
    X_train = X_tr[:N_TRAIN]
    y_train = y_tr[:N_TRAIN]
    X_test = X_te[:N_TEST]
    y_test = y_te[:N_TEST]

    # =========================================================================
    # CHECK 1: HARDCODED FALLBACK IN full_comparison.py
    # =========================================================================
    print("\n[CHECK 1/8] Hardcoded Fallback Score Injection...")
    # Read the source code and look for hardcoded fallback values
    with open(os.path.join(PROJECT_ROOT, 'evaluation', 'full_comparison.py'), 'r') as f:
        source = f.read()

    if "'accuracy': 0.85" in source or "accuracy': 0.88" in source or "accuracy': 0.9" in source:
        print("  ** CRITICAL ISSUE FOUND **")
        print("  full_comparison.py has a hardcoded fallback score in the except block!")
        print("  If training fails, a FAKE score of ~0.85 is injected silently.")
        issues_found.append("CRITICAL: Hardcoded fallback score in except block of full_comparison.py")
    else:
        print("  -> CLEAN: No hardcoded fallback scores found.")
        checks_passed += 1

    # =========================================================================
    # CHECK 2: TRAIN vs TEST DATA IDENTITY CHECK
    # =========================================================================
    print("\n[CHECK 2/8] Train/Test Data Overlap (Leakage)...")
    # Check if any test sample is identical to a training sample
    overlap_count = 0
    for i in range(len(X_test)):
        for j in range(len(X_train)):
            if np.allclose(X_test[i], X_train[j], atol=1e-6):
                overlap_count += 1
                break
    if overlap_count > 0:
        print(f"  ** CRITICAL ISSUE: {overlap_count} test samples are IDENTICAL to training samples!")
        issues_found.append(f"CRITICAL: {overlap_count} test samples overlap with training data")
    else:
        print(f"  -> CLEAN: 0 overlapping samples between train ({N_TRAIN}) and test ({N_TEST}).")
        checks_passed += 1

    # =========================================================================
    # CHECK 3: TRAIN THE QNN FRESH AND COMPARE TRAIN vs TEST ACCURACY
    # =========================================================================
    print("\n[CHECK 3/8] Overfitting Check (Train vs Test Accuracy)...")
    model, history = train_hybrid_qnn(X_train, y_train, epochs=35, seed=42)
    preds_train, probs_train = predict_hybrid_qnn(model, X_train)
    preds_test, probs_test = predict_hybrid_qnn(model, X_test)
    
    train_acc = accuracy_score(y_train, preds_train)
    test_acc = accuracy_score(y_test, preds_test)
    gap = train_acc - test_acc
    
    print(f"  Train Accuracy: {train_acc:.4f}")
    print(f"  Test Accuracy:  {test_acc:.4f}")
    print(f"  Generalization Gap: {gap:.4f}")
    
    if gap > 0.20:
        print(f"  ** WARNING: Gap of {gap:.4f} suggests severe overfitting.")
        issues_found.append(f"WARNING: Overfitting gap = {gap:.4f} (train {train_acc:.4f} vs test {test_acc:.4f})")
    elif test_acc > train_acc + 0.05:
        print(f"  ** SUSPICIOUS: Test accuracy HIGHER than train by {test_acc - train_acc:.4f}. Possible data issue.")
        issues_found.append(f"SUSPICIOUS: Test > Train by {test_acc - train_acc:.4f}")
    else:
        print(f"  -> CLEAN: Gap is reasonable ({gap:.4f}).")
        checks_passed += 1

    # =========================================================================
    # CHECK 4: RANDOM BASELINE COMPARISON
    # =========================================================================
    print("\n[CHECK 4/8] Random Baseline Comparison...")
    random_preds = np.random.choice([0, 1], size=len(y_test), p=[0.5, 0.5])
    random_acc = accuracy_score(y_test, random_preds)
    majority_class = np.bincount(y_test).argmax()
    majority_acc = np.sum(y_test == majority_class) / len(y_test)
    
    print(f"  Random Coin Flip Accuracy: {random_acc:.4f}")
    print(f"  Majority Class Baseline:   {majority_acc:.4f}")
    print(f"  QNN Test Accuracy:         {test_acc:.4f}")
    
    if test_acc <= majority_acc:
        print(f"  ** ISSUE: QNN does NOT beat majority class baseline!")
        issues_found.append(f"ISSUE: QNN ({test_acc:.4f}) <= majority baseline ({majority_acc:.4f})")
    else:
        lift = test_acc - majority_acc
        print(f"  -> QNN lifts {lift:.4f} above majority baseline.")
        checks_passed += 1

    # =========================================================================
    # CHECK 5: PERMUTATION TEST (Shuffle labels, accuracy should drop to ~50%)
    # =========================================================================
    print("\n[CHECK 5/8] Permutation Test (Shuffled Labels)...")
    y_train_shuffled = y_train.copy()
    np.random.seed(99)
    np.random.shuffle(y_train_shuffled)
    
    model_perm, _ = train_hybrid_qnn(X_train, y_train_shuffled, epochs=35, seed=42)
    preds_perm, _ = predict_hybrid_qnn(model_perm, X_test)
    perm_acc = accuracy_score(y_test, preds_perm)
    
    print(f"  QNN on real labels:     {test_acc:.4f}")
    print(f"  QNN on shuffled labels: {perm_acc:.4f}")
    
    if perm_acc > 0.65:
        print(f"  ** SUSPICIOUS: Model gets {perm_acc:.4f} on RANDOM labels! Should be ~0.50.")
        issues_found.append(f"SUSPICIOUS: Permutation test accuracy = {perm_acc:.4f} (should be ~0.50)")
    elif test_acc - perm_acc < 0.10:
        print(f"  ** WARNING: Real labels only {test_acc - perm_acc:.4f} better than random. Weak signal.")
        issues_found.append(f"WARNING: Weak signal. Real - Shuffled = {test_acc - perm_acc:.4f}")
    else:
        print(f"  -> CLEAN: Accuracy drops by {test_acc - perm_acc:.4f} on shuffled labels (expected).")
        checks_passed += 1

    # =========================================================================
    # CHECK 6: QUANTUM WEIGHTS REALITY CHECK
    # =========================================================================
    print("\n[CHECK 6/8] Quantum Circuit Weight Reality Check...")
    q_params = list(model.qlayer.parameters())
    c_params = list(model.post.parameters())
    
    all_zero_q = all(torch.allclose(p, torch.zeros_like(p), atol=1e-6) for p in q_params)
    all_zero_c = all(torch.allclose(p, torch.zeros_like(p), atol=1e-6) for p in c_params)
    
    total_q_params = sum(p.numel() for p in q_params)
    total_c_params = sum(p.numel() for p in c_params)
    
    print(f"  Quantum layer parameters: {total_q_params}")
    print(f"  Classical layer parameters: {total_c_params}")
    print(f"  Total parameters: {total_q_params + total_c_params}")
    
    if all_zero_q:
        print(f"  ** CRITICAL: All quantum weights are ZERO! Circuit is not learning.")
        issues_found.append("CRITICAL: Quantum weights are all zero - circuit is decorative")
    else:
        # Check weight magnitudes
        q_weight_vals = torch.cat([p.flatten() for p in q_params]).detach().numpy()
        print(f"  Quantum weight stats: mean={np.mean(q_weight_vals):.4f}, std={np.std(q_weight_vals):.4f}, "
              f"min={np.min(q_weight_vals):.4f}, max={np.max(q_weight_vals):.4f}")
        if np.std(q_weight_vals) < 0.01:
            print(f"  ** WARNING: Quantum weights have very low variance. May not be learning.")
            issues_found.append(f"WARNING: Quantum weight std = {np.std(q_weight_vals):.6f}")
        else:
            print(f"  -> CLEAN: Quantum weights are diverse and non-trivial.")
            checks_passed += 1

    # =========================================================================
    # CHECK 7: FEATURE-TARGET CORRELATION AUDIT
    # =========================================================================
    print("\n[CHECK 7/8] Feature-Target Correlation (Data Leakage Risk)...")
    max_corr = 0.0
    max_feat = ""
    FEATURE_NAMES = ['Recency','Frequency','Monetary','AvgOrderValue','ItemDiversity','SpendingFocus','TimeSin','TimeCos']
    
    # Use UNSCALED features from the full dataset to check raw correlations
    X_full = np.vstack([X_tr, X_te])
    y_full = np.concatenate([y_tr, y_te])
    
    for i, name in enumerate(FEATURE_NAMES):
        corr = abs(np.corrcoef(X_full[:, i], y_full)[0, 1])
        if corr > max_corr:
            max_corr = corr
            max_feat = name
        print(f"    |corr({name}, y)| = {corr:.4f}")
    
    print(f"\n  Max correlation: |corr({max_feat}, y)| = {max_corr:.4f}")
    
    if max_corr > 0.80:
        print(f"  ** CRITICAL: Feature '{max_feat}' has {max_corr:.4f} correlation! DATA LEAKAGE.")
        issues_found.append(f"CRITICAL: Feature '{max_feat}' correlation = {max_corr:.4f}")
    elif max_corr > 0.60:
        print(f"  ** WARNING: Feature '{max_feat}' has high correlation ({max_corr:.4f}).")
        issues_found.append(f"WARNING: Feature '{max_feat}' correlation = {max_corr:.4f}")
    else:
        print(f"  -> CLEAN: No single feature dominates (max = {max_corr:.4f} < 0.60).")
        checks_passed += 1

    # =========================================================================
    # CHECK 8: PREDICTION CLASS DISTRIBUTION (Not just predicting one class)
    # =========================================================================
    print("\n[CHECK 8/8] Prediction Diversity Check...")
    unique_preds, counts = np.unique(preds_test, return_counts=True)
    pred_balance = counts.min() / counts.max() if len(counts) > 1 else 0.0
    
    print(f"  Test set class distribution: {dict(zip(unique_preds, counts))}")
    print(f"  Prediction balance ratio: {pred_balance:.4f}")
    
    if len(unique_preds) == 1:
        print(f"  ** CRITICAL: Model predicts ONLY class {unique_preds[0]}! It's not learning.")
        issues_found.append(f"CRITICAL: Model predicts only class {unique_preds[0]}")
    elif pred_balance < 0.10:
        print(f"  ** WARNING: Predictions heavily skewed ({pred_balance:.4f} balance ratio).")
        issues_found.append(f"WARNING: Prediction balance ratio = {pred_balance:.4f}")
    else:
        print(f"  -> CLEAN: Model predicts both classes with reasonable balance ({pred_balance:.4f}).")
        checks_passed += 1

    # =========================================================================
    # FINAL VERDICT
    # =========================================================================
    print("\n" + "=" * 80)
    print(f"  AUDIT COMPLETE: {checks_passed}/{total_checks} CHECKS PASSED")
    print("=" * 80)
    
    if issues_found:
        print("\n  ISSUES FOUND:")
        for i, issue in enumerate(issues_found, 1):
            print(f"    {i}. {issue}")
    else:
        print("\n  VERDICT: NO FABRICATION DETECTED. QNN scores are legitimate.")
    
    print("\n" + "=" * 80)

if __name__ == '__main__':
    main()
