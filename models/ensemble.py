import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

class EnsembleStackingModel:
    """
    Ensemble Meta-Learner combining PyTorch MLP, Quantum Kernel SVM, 
    and Hybrid QNN predictions via Logistic Regression.
    Framed as engineering optimization to achieve maximum operational lift.
    """
    def __init__(self, seed=42):
        self.meta_learner = LogisticRegression(random_state=seed)
        
    def fit(self, probs_mlp, probs_qkernel, probs_qnn, y_true):
        # Stack probabilities into N x 3 feature matrix
        X_stacked = np.column_stack([probs_mlp, probs_qkernel, probs_qnn])
        self.meta_learner.fit(X_stacked, y_true)
        return self
        
    def predict(self, probs_mlp, probs_qkernel, probs_qnn):
        X_stacked = np.column_stack([probs_mlp, probs_qkernel, probs_qnn])
        probs = self.meta_learner.predict_proba(X_stacked)[:, 1]
        preds = (probs > 0.5).astype(int)
        return preds, probs
