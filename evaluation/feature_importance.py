import torch
import numpy as np
from preprocessing.feature_engine import FEATURE_NAMES

def compute_quantum_feature_importance(hybrid_qnn_model, X_test):
    """
    Computes input gradient magnitude feature importance for the Hybrid QNN model:
    Importance = Mean[|dL / dx_i|] across test samples.
    Respects the periodic structure of AngleEmbedding (unlike SHAP).
    """
    hybrid_qnn_model.eval()
    X_tensor = torch.tensor(X_test, dtype=torch.float32, requires_grad=True)
    
    output = hybrid_qnn_model(X_tensor)
    output.sum().backward()
    
    grads = X_tensor.grad.abs().mean(dim=0).detach().numpy()
    
    # Normalize
    total = grads.sum()
    weights = (grads / total).tolist() if total > 0 else (np.ones(len(FEATURE_NAMES)) / len(FEATURE_NAMES)).tolist()
    
    importance_data = [
        {'feature': FEATURE_NAMES[i], 'importance': float(weights[i])}
        for i in range(len(FEATURE_NAMES))
    ]
    importance_data = sorted(importance_data, key=lambda x: x['importance'], reverse=True)
    return importance_data
