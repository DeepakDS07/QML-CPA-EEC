import os
import json
import torch
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

from preprocessing.data_loader import load_dataset
from preprocessing.feature_engine import engineer_features
from models.classical_svm import train_classical_svm, predict_classical_svm
from models.classical_mlp import train_classical_mlp, predict_classical_mlp
from models.quantum_kernel import train_quantum_kernel_svm, predict_quantum_kernel_svm
from models.hybrid_qnn import train_hybrid_qnn, predict_hybrid_qnn
from models.hybrid_qnn_noisy import train_noisy_qnn, predict_noisy_qnn
from models.ensemble import EnsembleStackingModel

SEEDS = [42, 123, 456, 789, 1024]
RESULTS_DIR = r'c:\Downloads\quantum_hackathon\results'
MODELS_DIR = r'c:\Downloads\quantum_hackathon\saved_models'

os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

def evaluate_metrics(y_true, y_pred, y_prob):
    return {
        'accuracy': float(accuracy_score(y_true, y_pred)),
        'precision': float(precision_score(y_true, y_pred, zero_division=0)),
        'recall': float(recall_score(y_true, y_pred, zero_division=0)),
        'f1': float(f1_score(y_true, y_pred, zero_division=0)),
        'auc': float(roc_auc_score(y_true, y_prob)) if len(np.unique(y_true)) > 1 else 0.5,
        'confusion_matrix': confusion_matrix(y_true, y_pred).tolist()
    }

def run_5_seed_training(dataset_name='uci', epochs=20):
    """
    Trains all 6 models across 5 random seeds to compute mean +/- std.
    Persists metrics to results/metrics.json and weights to saved_models/.
    """
    print(f"\n=======================================================")
    print(f"🚀 Starting 5-Seed Statistical Training Benchmark [{dataset_name.upper()}]")
    print(f"=======================================================\n")
    
    df = load_dataset(dataset_name)
    
    seed_results = {
        'classical_svm': [], 'classical_mlp': [], 'quantum_kernel': [],
        'hybrid_qnn_clean': [], 'hybrid_qnn_noisy': [], 'ensemble': []
    }
    
    last_histories = {}
    last_alignment = 0.632
    
    for seed_idx, seed in enumerate(SEEDS):
        print(f"--- Seed {seed_idx+1}/5 (Seed={seed}) ---")
        X_tr, X_te, y_tr, y_te, scaler, minmax = engineer_features(df, seed=seed)
        
        # 1. Classical SVM
        svm = train_classical_svm(X_tr, y_tr, seed=seed)
        preds_svm, probs_svm = predict_classical_svm(svm, X_te)
        seed_results['classical_svm'].append(evaluate_metrics(y_te, preds_svm, probs_svm))
        
        # 2. PyTorch MLP
        mlp, hist_mlp = train_classical_mlp(X_tr, y_tr, epochs=epochs, seed=seed)
        preds_mlp, probs_mlp = predict_classical_mlp(mlp, X_te)
        seed_results['classical_mlp'].append(evaluate_metrics(y_te, preds_mlp, probs_mlp))
        
        # 3. Quantum Kernel SVM
        q_svm, K_tr, alignment = train_quantum_kernel_svm(X_tr, y_tr, seed=seed)
        preds_qk, probs_qk = predict_quantum_kernel_svm(q_svm, X_tr, X_te)
        seed_results['quantum_kernel'].append(evaluate_metrics(y_te, preds_qk, probs_qk))
        last_alignment = alignment
        
        # 4. Hybrid QNN (Clean)
        qnn_clean, hist_qnn = train_hybrid_qnn(X_tr, y_tr, epochs=epochs, seed=seed)
        preds_qnn, probs_qnn = predict_hybrid_qnn(qnn_clean, X_te)
        seed_results['hybrid_qnn_clean'].append(evaluate_metrics(y_te, preds_qnn, probs_qnn))
        
        # 5. Hybrid QNN (Noisy 1%)
        qnn_noisy, hist_noisy = train_noisy_qnn(X_tr, y_tr, epochs=epochs, noise_prob=0.01, seed=seed)
        preds_noisy, probs_noisy = predict_noisy_qnn(qnn_noisy, X_te)
        seed_results['hybrid_qnn_noisy'].append(evaluate_metrics(y_te, preds_noisy, probs_noisy))
        
        # 6. Ensemble Stacking
        # Predict train probs for meta learner
        _, tr_probs_mlp = predict_classical_mlp(mlp, X_tr)
        _, tr_probs_qk = predict_quantum_kernel_svm(q_svm, X_tr, X_tr)
        _, tr_probs_qnn = predict_hybrid_qnn(qnn_clean, X_tr)
        
        ens = EnsembleStackingModel(seed=seed)
        ens.fit(tr_probs_mlp, tr_probs_qk, tr_probs_qnn, y_tr)
        preds_ens, probs_ens = ens.predict(probs_mlp, probs_qk, probs_qnn)
        seed_results['ensemble'].append(evaluate_metrics(y_te, preds_ens, probs_ens))
        
        if seed_idx == 0:
            last_histories = {'mlp': hist_mlp, 'hybrid_qnn': hist_qnn, 'noisy_qnn': hist_noisy}
            # Save first seed models for API persistence
            torch.save(mlp.state_dict(), os.path.join(MODELS_DIR, 'classical_mlp.pt'))
            torch.save(qnn_clean.state_dict(), os.path.join(MODELS_DIR, 'hybrid_qnn_clean.pt'))
            torch.save(qnn_noisy.state_dict(), os.path.join(MODELS_DIR, 'hybrid_qnn_noisy.pt'))

    # Compute mean +/- std summary across 5 seeds
    final_summary = {'dataset': dataset_name, 'kernel_alignment': float(last_alignment), 'models': {}}
    
    for m_name, list_metrics in seed_results.items():
        accs = [m['accuracy'] for m in list_metrics]
        aucs = [m['auc'] for m in list_metrics]
        f1s = [m['f1'] for m in list_metrics]
        
        final_summary['models'][m_name] = {
            'accuracy_mean': float(np.mean(accs)),
            'accuracy_std': float(np.std(accs)),
            'auc_mean': float(np.mean(aucs)),
            'auc_std': float(np.std(aucs)),
            'f1_mean': float(np.mean(f1s)),
            'f1_std': float(np.std(f1s)),
            'confusion_matrix_last': list_metrics[0]['confusion_matrix']
        }
        
    # Save to metrics.json
    out_metrics = os.path.join(RESULTS_DIR, 'metrics.json')
    with open(out_metrics, 'w') as f:
        json.dump(final_summary, f, indent=2)
        
    out_curves = os.path.join(RESULTS_DIR, 'training_curves.json')
    with open(out_curves, 'w') as f:
        json.dump(last_histories, f, indent=2)
        
    print(f"\n✅ 5-Seed Training Complete! Metrics saved to {out_metrics}")
    return final_summary

if __name__ == '__main__':
    res = run_5_seed_training(epochs=15)
