import numpy as np
import json
import os
from sklearn.manifold import TSNE
from sklearn.svm import SVC
from models.quantum_kernel import compute_quantum_kernel_matrix

def generate_tsne_decision_boundary(X_data, y_data, seed=42):
    """
    Reduces 8D features to 2D using t-SNE and computes 2D decision boundary 
    contour grids for Classical SVM vs Quantum Kernel SVM.
    """
    np.random.seed(seed)
    
    # Subsample 150 points for fast D3 rendering
    idx = np.random.choice(len(X_data), min(150, len(X_data)), replace=False)
    X_sub = X_data[idx]
    y_sub = y_data[idx]
    
    # 2D t-SNE
    tsne = TSNE(n_components=2, perplexity=15, random_state=seed)
    X_2d = tsne.fit_transform(X_sub)
    
    # Grid for contour mapping
    x_min, x_max = X_2d[:, 0].min() - 1, X_2d[:, 0].max() + 1
    y_min, y_max = X_2d[:, 1].min() - 1, X_2d[:, 1].max() + 1
    
    xx, yy = np.meshgrid(np.linspace(x_min, x_max, 25), np.linspace(y_min, y_max, 25))
    grid_points = np.c_[xx.ravel(), yy.ravel()]
    
    # Fit Classical SVM on 2D space
    svm_class = SVC(kernel='rbf', C=1.0, probability=True, random_state=seed)
    svm_class.fit(X_2d, y_sub)
    Z_classical = svm_class.predict_proba(grid_points)[:, 1].reshape(xx.shape)
    
    # Fit Quantum Kernel SVM on 2D space
    K_train_2d = compute_quantum_kernel_matrix(X_2d, X_2d, n_qubits=2)
    K_grid_2d = compute_quantum_kernel_matrix(grid_points, X_2d, n_qubits=2)
    
    svm_quant = SVC(kernel='precomputed', probability=True, random_state=seed)
    svm_quant.fit(K_train_2d, y_sub)
    Z_quantum = svm_quant.predict_proba(K_grid_2d)[:, 1].reshape(xx.shape)
    
    result = {
        'scatter_points': [
            {'x': float(X_2d[i, 0]), 'y': float(X_2d[i, 1]), 'label': int(y_sub[i])}
            for i in range(len(y_sub))
        ],
        'grid_x': np.linspace(x_min, x_max, 25).tolist(),
        'grid_y': np.linspace(y_min, y_max, 25).tolist(),
        'z_classical': Z_classical.tolist(),
        'z_quantum': Z_quantum.tolist()
    }
    return result

if __name__ == '__main__':
    X_dummy = np.random.uniform(0, np.pi, (100, 8))
    y_dummy = np.random.randint(0, 2, 100)
    res = generate_tsne_decision_boundary(X_dummy, y_dummy)
    print("t-SNE Decision Boundary Generated -- Points:", len(res['scatter_points']))
