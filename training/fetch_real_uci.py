import os
import pandas as pd
import urllib.request
import zipfile

def download_and_prepare_uci_data():
    """
    Downloads the real UCI Online Retail II dataset, unzips it, 
    and prepares it for ML training to replace the synthetic Gaussian distributions.
    
    This resolves the 'Academic Dishonesty' flaw by training the model on 
    genuine, sparse, non-stationary retail data.
    """
    url = "https://archive.ics.uci.edu/ml/machine-learning-databases/00502/online_retail_II.xlsx"
    data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(data_dir, exist_ok=True)
    
    file_path = os.path.join(data_dir, "online_retail_II.xlsx")
    csv_path = os.path.join(data_dir, "real_uci_retail.csv")
    
    if not os.path.exists(csv_path):
        print(f"Downloading Real UCI Retail dataset from {url}...")
        try:
            urllib.request.urlretrieve(url, file_path)
            print("Download complete. Converting to CSV (this may take a minute)...")
            
            # The dataset has two sheets (2009-2010 and 2010-2011)
            df1 = pd.read_excel(file_path, sheet_name="Year 2009-2010")
            df2 = pd.read_excel(file_path, sheet_name="Year 2010-2011")
            
            df = pd.concat([df1, df2], ignore_index=True)
            df.to_csv(csv_path, index=False)
            print(f"Successfully saved to {csv_path}")
            
        except Exception as e:
            print(f"Failed to download dataset: {e}")
            return None
    else:
        print(f"Dataset already exists at {csv_path}")
        df = pd.read_csv(csv_path)
        
    print(f"Dataset shape: {df.shape}")
    print("Next steps: Run feature_engine.py on this real dataset to extract authentic R, F, M features.")
    return df

if __name__ == "__main__":
    download_and_prepare_uci_data()
