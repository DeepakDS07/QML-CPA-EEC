from sklearn.svm import SVC
import numpy as np
import warnings

warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=UserWarning)

def train_classical_svm(X_train, y_train, C=1.0, seed=42):
    """Trains a Classical SVM with RBF kernel."""
    np.random.seed(seed)
    model = SVC(kernel='rbf', C=C, gamma='scale', probability=True, random_state=seed)
    model.fit(X_train, y_train)
    return model

def predict_classical_svm(model, X):
    """Returns class predictions and probabilities."""
    probs = model.predict_proba(X)[:, 1]
    preds = (probs > 0.5).astype(int)
    return preds, probs
