import pandas as pd
import numpy as np
import os
from preprocessing.synthetic_generator import save_all_synthetic_datasets

def load_dataset(dataset_name='uci'):
    """
    Loads a specified dataset. If the CSV file does not exist,
    it automatically generates synthetic realistic data as a fallback.
    """
    dataset_name = dataset_name.lower()
    
    if dataset_name == 'uci':
        file_09 = r'c:\Downloads\quantum_hackathon\data\online_retail_09_10.csv'
        file_10 = r'c:\Downloads\quantum_hackathon\data\online_retail_10_11.csv'
        
        if os.path.exists(file_09) and os.path.exists(file_10):
            print("[DataLoader] SUCCESS: Found real UCI data (2 Years)!")
            print("[DataLoader] Merging 2009-2010 and 2010-2011 datasets...")
            # UCI data often requires ISO-8859-1 encoding due to UK text characters
            df1 = pd.read_csv(file_09, encoding='ISO-8859-1')
            df2 = pd.read_csv(file_10, encoding='ISO-8859-1')
            df_combined = pd.concat([df1, df2], ignore_index=True)
            print(f"[DataLoader] Successfully loaded {len(df_combined):,} rows of real UCI data.")
            return df_combined
            
        else:
            print("[DataLoader] Real UCI data not found. Falling back to synthetic.")
            save_all_synthetic_datasets()
            return pd.read_csv(r'c:\Downloads\quantum_hackathon\data\uci\online_retail.csv')
            
    # Paths for the other uploaded datasets
    paths = {
        'olist': r'c:\Downloads\quantum_hackathon\data\olist_customers_dataset.csv',
        'customer': r'c:\Downloads\quantum_hackathon\data\customerData_500k.csv',
        'instacart': r'c:\Downloads\quantum_hackathon\data\aisles.csv',
        'store_sales': r'c:\Downloads\quantum_hackathon\data\holidays_events (1).csv'
    }
    
    if dataset_name in paths:
        file_path = paths[dataset_name]
        if os.path.exists(file_path):
            print(f"[DataLoader] SUCCESS: Found real {dataset_name.upper()} data!")
            return pd.read_csv(file_path, encoding='ISO-8859-1', on_bad_lines='skip')
        else:
            print(f"[DataLoader] Real {dataset_name} data not found. Falling back to synthetic.")
            save_all_synthetic_datasets()
            fallback_paths = {
                'olist': r'c:\Downloads\quantum_hackathon\data\olist\olist_orders.csv',
                'customer': r'c:\Downloads\quantum_hackathon\data\customer\customer_purchase.csv',
                'instacart': r'c:\Downloads\quantum_hackathon\data\instacart\instacart_orders.csv',
                'store_sales': r'c:\Downloads\quantum_hackathon\data\store_sales\store_sales.csv'
            }
            return pd.read_csv(fallback_paths[dataset_name])

    # Fallback for 'synthetic' or unknown dataset names
    print(f"[DataLoader] Loading synthetic fallback dataset for '{dataset_name}'...")
    save_all_synthetic_datasets()
    synthetic_path = r'c:\Downloads\quantum_hackathon\data\uci\online_retail.csv'
    return pd.read_csv(synthetic_path)

if __name__ == '__main__':
    for d_name in ['uci', 'customer', 'olist']:
        df_test = load_dataset(d_name)
        print(f"-> {d_name.upper()} Shape: {df_test.shape}\n")
