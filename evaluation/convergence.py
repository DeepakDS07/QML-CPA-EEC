def extract_convergence_data(history_mlp, history_qnn):
    """
    Extract convergence metrics from training histories.
    """
    epochs_to_85_mlp = next((i for i, acc in enumerate(history_mlp) if acc >= 0.85), -1)
    epochs_to_85_qnn = next((i for i, acc in enumerate(history_qnn) if acc >= 0.85), -1)
    
    speed_advantage_pct = 0.0
    if epochs_to_85_mlp > 0 and epochs_to_85_qnn > 0:
        speed_advantage_pct = ((epochs_to_85_mlp - epochs_to_85_qnn) / epochs_to_85_mlp) * 100
        
    return {
        "epochs_to_85_mlp": epochs_to_85_mlp,
        "epochs_to_85_qnn": epochs_to_85_qnn,
        "speed_advantage_pct": speed_advantage_pct
    }
