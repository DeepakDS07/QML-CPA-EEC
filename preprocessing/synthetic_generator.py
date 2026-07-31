import pandas as pd
import numpy as np
import os

def generate_synthetic_uci(n_samples=1000, seed=42):
    """Generates synthetic UCI Online Retail dataset with RFM and purchase targets."""
    np.random.seed(seed)
    customer_ids = np.arange(10000, 10000 + n_samples)
    recency = np.random.exponential(scale=30, size=n_samples).astype(int) + 1
    frequency = np.random.poisson(lam=5, size=n_samples) + 1
    monetary = np.round(frequency * np.random.uniform(15, 120, size=n_samples), 2)
    avg_order_val = np.round(monetary / frequency, 2)
    item_diversity = np.round(np.clip(np.random.beta(2, 5, size=n_samples), 0.05, 0.95), 2)
    hour = np.random.choice(np.arange(8, 22), size=n_samples)
    
    # Target: Will customer repeat purchase within 30 days?
    # Logic: High frequency, low recency, high spend -> higher probability
    prob = 1 / (1 + np.exp(-(0.05 * frequency - 0.02 * recency + 0.001 * monetary + np.random.normal(0, 0.5, n_samples))))
    target = (prob > 0.5).astype(int)
    
    df = pd.DataFrame({
        'CustomerID': customer_ids,
        'Recency': recency,
        'Frequency': frequency,
        'Monetary': monetary,
        'AvgOrderValue': avg_order_val,
        'ItemDiversity': item_diversity,
        'PurchaseHour': hour,
        'RepeatPurchase': target
    })
    return df

def generate_synthetic_olist(n_samples=1000, seed=123):
    """Generates synthetic Olist E-Commerce dataset with relational features."""
    np.random.seed(seed)
    df = generate_synthetic_uci(n_samples=n_samples, seed=seed)
    df.rename(columns={'CustomerID': 'order_id', 'RepeatPurchase': 'reorder_status'}, inplace=True)
    df['review_score'] = np.random.choice([1, 2, 3, 4, 5], size=n_samples, p=[0.05, 0.05, 0.1, 0.3, 0.5])
    df['freight_value'] = np.round(np.random.uniform(5, 45, size=n_samples), 2)
    return df

def generate_synthetic_customer(n_samples=500, seed=456):
    """Generates synthetic Customer Purchase Data (Small-data crossover)."""
    np.random.seed(seed)
    df = generate_synthetic_uci(n_samples=n_samples, seed=seed)
    df['Age'] = np.random.randint(18, 70, size=n_samples)
    df['Income'] = np.random.randint(25000, 150000, size=n_samples)
    return df

def generate_synthetic_instacart(n_samples=1200, seed=789):
    """Generates synthetic Instacart Market Basket dataset with sequential order stats."""
    np.random.seed(seed)
    df = generate_synthetic_uci(n_samples=n_samples, seed=seed)
    df['add_to_cart_order'] = np.random.randint(1, 15, size=n_samples)
    df['days_since_prior_order'] = np.random.randint(0, 30, size=n_samples)
    return df

def generate_synthetic_store_sales(n_samples=1000, seed=1024):
    """Generates synthetic Store Sales demand forecasting dataset (regression target)."""
    np.random.seed(seed)
    df = generate_synthetic_uci(n_samples=n_samples, seed=seed)
    # Regression target: Unit sales prediction
    df['UnitSales'] = np.round(df['Frequency'] * 12.5 + df['Monetary'] * 0.1 + np.random.normal(0, 5, n_samples), 2)
    df['OnPromotion'] = np.random.choice([0, 1], size=n_samples, p=[0.7, 0.3])
    return df

def save_all_synthetic_datasets(base_path=None):
    """Generates and saves synthetic CSV files if datasets do not exist."""
    if base_path is None:
        base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
    targets = {
        'uci/online_retail.csv': generate_synthetic_uci,
        'olist/olist_orders.csv': generate_synthetic_olist,
        'customer/customer_purchase.csv': generate_synthetic_customer,
        'instacart/instacart_orders.csv': generate_synthetic_instacart,
        'store_sales/store_sales.csv': generate_synthetic_store_sales,
    }
    
    for rel_path, gen_func in targets.items():
        full_path = os.path.join(base_path, rel_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        if not os.path.exists(full_path):
            df = gen_func()
            df.to_csv(full_path, index=False)
            print(f"Generated synthetic fallback dataset: {full_path}")

if __name__ == '__main__':
    save_all_synthetic_datasets()
