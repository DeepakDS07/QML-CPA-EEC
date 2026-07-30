import numpy as np

def run_ood_stress_test(X_data, y_data, model_mlp, model_qnn, predict_mlp_fn, predict_qnn_fn, seed=42):
    """
    Simulates an Out-Of-Distribution (OOD) stress test by splitting data into
    normal and holiday rush splits, adjusting features to simulate OOD.
    """
    np.random.seed(seed)
    
    n_samples = len(X_data)
    split_idx = int(n_samples * 0.7)
    
    # 70% normal, 30% holiday
    X_normal = X_data[:split_idx].copy()
    y_normal = y_data[:split_idx]
    
    X_holiday = X_data[split_idx:].copy()
    y_holiday = y_data[split_idx:]
    
    # Simulate OOD: scale monetary (assume col 2) by 1.5, recency (col 3) by 0.5
    if X_holiday.shape[1] > 2:
        X_holiday[:, 2] = X_holiday[:, 2] * 1.5
    if X_holiday.shape[1] > 3:
        X_holiday[:, 3] = X_holiday[:, 3] * 0.5
        
    # Evaluate MLP
    preds_normal_mlp = predict_mlp_fn(model_mlp, X_normal)
    preds_holiday_mlp = predict_mlp_fn(model_mlp, X_holiday)
    
    normal_acc_mlp = np.mean(preds_normal_mlp == y_normal)
    ood_acc_mlp = np.mean(preds_holiday_mlp == y_holiday)
    
    # Evaluate QNN
    preds_normal_qnn = predict_qnn_fn(model_qnn, X_normal)
    preds_holiday_qnn = predict_qnn_fn(model_qnn, X_holiday)
    
    normal_acc_qnn = np.mean(preds_normal_qnn == y_normal)
    ood_acc_qnn = np.mean(preds_holiday_qnn == y_holiday)
    
    return {
        "normal_acc_mlp": float(normal_acc_mlp),
        "normal_acc_qnn": float(normal_acc_qnn),
        "ood_acc_mlp": float(ood_acc_mlp),
        "ood_acc_qnn": float(ood_acc_qnn),
        "mlp_drop": float(normal_acc_mlp - ood_acc_mlp),
        "qnn_drop": float(normal_acc_qnn - ood_acc_qnn)
    }
