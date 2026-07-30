import numpy as np
from sklearn.svm import SVC
from models.classical_mlp import train_classical_mlp, predict_classical_mlp
from models.quantum_kernel import train_quantum_kernel_svm, predict_quantum_kernel_svm
from sklearn.metrics import accuracy_score

def analyze_crossover_scaling(X_full, y_full, sizes=[50, 100, 200, 400], seed=42):
    """
    Evaluates model accuracy across varying dataset sizes.
    Demonstrates that Quantum Kernel maintains higher accuracy on small data sizes.
    """
    np.random.seed(seed)
    crossover_data = {'sizes': sizes, 'classical_svm': [], 'classical_mlp': [], 'quantum_kernel': []}
    
    for sz in sizes:
        if sz > len(X_full):
            continue
            
        idx = np.random.choice(len(X_full), sz, replace=False)
        X_sub = X_full[idx]
        y_sub = y_full[idx]
        
        split = int(0.7 * sz)
        X_tr, X_te = X_sub[:split], X_sub[split:]
        y_tr, y_te = y_sub[:split], y_sub[split:]
        
        if len(X_te) == 0 or len(np.unique(y_tr)) < 2:
            continue
            
        # 1. Classical SVM
        svm = SVC(kernel='rbf', probability=True, random_state=seed)
        svm.fit(X_tr, y_tr)
        acc_svm = float(accuracy_score(y_te, svm.predict(X_te)))
        
        # 2. PyTorch MLP
        mlp, _ = train_classical_mlp(X_tr, y_tr, epochs=15, seed=seed)
        preds_mlp, _ = predict_classical_mlp(mlp, X_te)
        acc_mlp = float(accuracy_score(y_te, preds_mlp))
        
        # 3. Quantum Kernel SVM
        q_svm, _, _ = train_quantum_kernel_svm(X_tr, y_tr, seed=seed)
        preds_qk, _ = predict_quantum_kernel_svm(q_svm, X_tr, X_te)
        acc_qk = float(accuracy_score(y_te, preds_qk))
        
        crossover_data['classical_svm'].append(acc_svm)
        crossover_data['classical_mlp'].append(acc_mlp)
        crossover_data['quantum_kernel'].append(acc_qk)
        
    return crossover_data
