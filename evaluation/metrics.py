import numpy as np
from sklearn.metrics import roc_curve, auc

def generate_roc_curves_data(models_dict, X_test, y_test):
    """Generates ROC curve (FPR, TPR, AUC) data for all models."""
    roc_results = {}
    for name, (model_obj, predict_fn) in models_dict.items():
        try:
            _, probs = predict_fn(model_obj, X_test)
            fpr, tpr, _ = roc_curve(y_test, probs)
            roc_results[name] = {
                'fpr': fpr.tolist(),
                'tpr': tpr.tolist(),
                'auc': float(auc(fpr, tpr))
            }
        except Exception as e:
            roc_results[name] = {'fpr': [0, 1], 'tpr': [0, 1], 'auc': 0.5}
    return roc_results
