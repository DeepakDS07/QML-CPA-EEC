import numpy as np
from models.quantum_kernel import compute_quantum_kernel_matrix, compute_frobenius_kernel_alignment
from sklearn.metrics.pairwise import rbf_kernel

def generate_kernel_matrix_data(X_data, n_samples=30):
    """
    Computes 30x30 Classical RBF vs Quantum Kernel matrices 
    and Frobenius kernel alignment score for dashboard heatmaps.
    """
    X_sub = X_data[:n_samples]
    
    K_quantum = compute_quantum_kernel_matrix(X_sub, X_sub, n_qubits=8)
    K_rbf = rbf_kernel(X_sub, gamma=0.1)
    
    alignment = compute_frobenius_kernel_alignment(K_quantum, X_sub)
    
    return {
        'kernel_quantum': K_quantum.tolist(),
        'kernel_rbf': K_rbf.tolist(),
        'alignment_score': float(alignment),
        'n_samples': n_samples
    }
