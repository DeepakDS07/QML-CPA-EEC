import numpy as np
from preprocessing.feature_engine import engineer_features, FEATURE_NAMES
from preprocessing.data_loader import load_dataset

def validate_data(dataset_name='uci'):
    """Validates scaled data range, missing values, and target distributions."""
    df = load_dataset(dataset_name)
    X_train, X_test, y_train, y_test, _, _ = engineer_features(df)
    
    # Assertions
    assert not np.isnan(X_train).any(), "NaN values found in X_train"
    assert not np.isnan(X_test).any(), "NaN values found in X_test"
    assert not np.isinf(X_train).any(), "Inf values found in X_train"
    assert not np.isinf(X_test).any(), "Inf values found in X_test"
    
    assert X_train.min() >= -1e-5 and X_train.max() <= np.pi + 1e-5, f"Data out of [0, pi] range: [{X_train.min()}, {X_train.max()}]"
    
    report = {
        'dataset': dataset_name,
        'train_samples': len(X_train),
        'test_samples': len(X_test),
        'n_features': X_train.shape[1],
        'class_balance_train': float(np.mean(y_train)),
        'class_balance_test': float(np.mean(y_test)),
        'valid': True
    }
    return report

if __name__ == '__main__':
    rep = validate_data('uci')
    print("Validation Report:", rep)
