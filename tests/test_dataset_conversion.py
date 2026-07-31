import pytest
import numpy as np
import pandas as pd
from preprocessing.feature_engine import engineer_features, FEATURE_NAMES
from preprocessing.data_loader import load_dataset

# --- 1. Test Feature Engine on Raw Retail Transactions ---
def test_feature_engine_raw_transactions():
    raw_df = pd.DataFrame({
        "InvoiceNo": [536365, 536365, 536366, 536367, 536368],
        "StockCode": ["85123A", "71053", "84406B", "84029G", "22752"],
        "Description": ["HEART T-LIGHT", "METAL LANTERN", "CREAM DOILY", "KNITTED UNION FLG", "SET 7 BABUSHKA"],
        "Quantity": [6, 6, 8, 6, 2],
        "InvoiceDate": ["2010-12-01 08:26:00", "2010-12-01 08:26:00", "2010-12-01 08:28:00", "2010-12-01 08:34:00", "2010-12-01 08:34:00"],
        "UnitPrice": [2.55, 3.39, 2.75, 3.39, 7.65],
        "CustomerID": [17850, 17850, 17850, 13047, 13047],
        "Country": ["United Kingdom", "United Kingdom", "United Kingdom", "United Kingdom", "United Kingdom"]
    })

    X_train, X_test, y_train, y_test, scaler, minmax, cust_data = engineer_features(raw_df, seed=42)

    # Validate 7-tuple return shape
    assert X_train is not None
    assert X_test is not None
    assert len(y_train) == len(X_train)
    assert len(y_test) == len(X_test)
    assert scaler is not None
    assert minmax is not None
    assert cust_data is not None

    # Validate 8 Feature Columns
    assert X_train.shape[1] == 8
    assert X_test.shape[1] == 8

    # Validate Quantum Feature Scaling Bound [0, pi]
    assert X_train.min() >= 0.0 - 1e-5
    assert X_train.max() <= np.pi + 1e-5
    assert X_test.min() >= 0.0 - 1e-5
    assert X_test.max() <= np.pi + 1e-5

    # Validate No NaNs or Infs
    assert not np.isnan(X_train).any()
    assert not np.isnan(X_test).any()
    assert not np.isinf(X_train).any()
    assert not np.isinf(X_test).any()

    # Validate Raw Customer Aggregation Data
    assert 'CustomerID' in cust_data.columns
    assert 'Recency' in cust_data.columns
    assert 'Monetary' in cust_data.columns
    assert 'MeanHour' in cust_data.columns
    assert len(cust_data) == 2 # 2 distinct customers (17850 and 13047)

# --- 2. Test Feature Engine on Fallback Tabular Data (No CustomerID) ---
def test_feature_engine_tabular_fallback():
    tabular_df = pd.DataFrame({
        "Recency": [10.0, 45.0, 2.0, 80.0, 15.0],
        "Frequency": [5, 1, 12, 2, 8],
        "Monetary": [250.0, 40.0, 1200.0, 85.0, 450.0]
    })

    X_train, X_test, y_train, y_test, scaler, minmax, cust_data = engineer_features(tabular_df, seed=42)

    assert X_train.shape[1] == 8
    assert X_train.min() >= 0.0 - 1e-5
    assert X_train.max() <= np.pi + 1e-5
    assert not np.isnan(X_train).any()

# --- 3. Test Synthetic Dataset Generator & Loader ---
def test_synthetic_data_loader():
    df = load_dataset('synthetic')
    assert df is not None
    assert len(df) > 0
    
    X_train, X_test, y_train, y_test, scaler, minmax, cust_data = engineer_features(df, seed=42)
    assert X_train.shape[1] == 8
    assert X_train.min() >= 0.0 - 1e-5
    assert X_train.max() <= np.pi + 1e-5
