import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from models.quantum_kernel import compute_quantum_kernel_matrix
from preprocessing.feature_engine import FEATURE_NAMES

def compute_quantum_customer_segmentation(X_data, n_clusters=4, seed=42):
    """
    Executes customer segmentation using Quantum Kernel matrix similarity 
    vs Classical k-means, returning cluster centroids and silhouette scores.
    """
    X_sub = X_data[:200] # 200 samples for fast segmentation
    
    # 1. Classical k-means
    kmeans_class = KMeans(n_clusters=n_clusters, random_state=seed, n_init=10)
    labels_class = kmeans_class.fit_predict(X_sub)
    sil_class = float(silhouette_score(X_sub, labels_class))
    
    # 2. Quantum Kernel k-means
    K_matrix = compute_quantum_kernel_matrix(X_sub, X_sub, n_qubits=8)
    kmeans_quant = KMeans(n_clusters=n_clusters, random_state=seed, n_init=10)
    labels_quant = kmeans_quant.fit_predict(K_matrix)
    sil_quant = float(silhouette_score(K_matrix, labels_quant))
    
    # Compute cluster centroid feature profiles
    cluster_profiles = []
    for c in range(n_clusters):
        c_mask = (labels_quant == c)
        c_mean = X_sub[c_mask].mean(axis=0) if np.sum(c_mask) > 0 else np.zeros(8)
        
        cluster_profiles.append({
            'cluster_id': c,
            'count': int(np.sum(c_mask)),
            'features': {FEATURE_NAMES[i]: float(c_mean[i]) for i in range(8)}
        })
        
    return {
        'silhouette_classical': sil_class,
        'silhouette_quantum': sil_quant,
        'clusters': cluster_profiles
    }
