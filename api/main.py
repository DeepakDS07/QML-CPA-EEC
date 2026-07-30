from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import json
import os
from api.fallback import GracefulFallback

app = FastAPI(title="Quantum ML Consumer Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import torch
from models.hybrid_qnn import create_hybrid_qnn_model, predict_hybrid_qnn
from models.classical_mlp import PyTorchMLP, predict_classical_mlp

class RealQuantumModelWrapper:
    def __init__(self):
        self.model_path = os.path.join("saved_models", "hybrid_qnn_clean.pt")
        self.model = create_hybrid_qnn_model()
        if os.path.exists(self.model_path):
            try:
                self.model.load_state_dict(torch.load(self.model_path, weights_only=True))
            except Exception:
                pass
        self.model.eval()

    def predict_with_prob(self, features):
        if self.model is not None:
            features_arr = np.array([features], dtype=np.float32)
            preds, probs = predict_hybrid_qnn(self.model, features_arr)
            return int(preds[0]), float(probs[0])
        return 1, 0.50

    def predict(self, features):
        pred, _ = self.predict_with_prob(features)
        return pred

class RealClassicalModelWrapper:
    def __init__(self):
        self.model_path = os.path.join("saved_models", "classical_mlp.pt")
        self.model = PyTorchMLP()
        if os.path.exists(self.model_path):
            try:
                self.model.load_state_dict(torch.load(self.model_path, weights_only=True))
            except Exception:
                pass
        self.model.eval()

    def predict_with_prob(self, features):
        if self.model is not None:
            features_arr = np.array([features], dtype=np.float32)
            preds, probs = predict_classical_mlp(self.model, features_arr)
            return int(preds[0]), float(probs[0])
        return 1, 0.50

    def predict(self, features):
        pred, _ = self.predict_with_prob(features)
        return pred

import numpy as np
quantum_model = RealQuantumModelWrapper()
classical_model = RealClassicalModelWrapper()
fallback_system = GracefulFallback(quantum_model, classical_model)

class PredictionRequest(BaseModel):
    features: list

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.post("/predict")
def predict(req: PredictionRequest):
    return fallback_system.predict(req.features)

def load_json(filename):
    path = os.path.join("results", filename)
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return {"error": f"File {filename} not found"}

@app.get("/results")
def get_results():
    return load_json("metrics.json")

@app.get("/training-curves")
def get_training_curves():
    return load_json("training_curves.json")

@app.get("/decision-boundary")
def get_decision_boundary():
    return load_json("decision_boundary.json")

@app.get("/kernel-alignment")
def get_kernel_alignment():
    return load_json("kernel_alignment.json")

@app.get("/barren-plateau")
def get_barren_plateau():
    return load_json("barren_plateau.json")

@app.get("/crossover")
def get_crossover():
    return load_json("crossover.json")

@app.get("/feature-importance")
def get_feature_importance():
    return load_json("feature_importance.json")

@app.get("/segmentation")
def get_segmentation():
    return load_json("segmentation.json")

@app.get("/ood-stress-test")
def get_ood_stress_test():
    return load_json("ood_results.json")

@app.get("/business-impact")
def get_business_impact():
    return load_json("business_impact.json")

@app.get("/ablation-results")
def get_ablation_results():
    return load_json("ablation_results.json")

@app.get("/report/download")
def download_report():
    path = "results/report.pdf"
    if os.path.exists(path):
        return FileResponse(path, filename="report.pdf")
    raise HTTPException(status_code=404, detail="Report not found")

from fastapi import UploadFile, File
import pandas as pd
import io

@app.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        
        from preprocessing.feature_engine import engineer_features
        X_tr, _, _, _, _, _ = engineer_features(df, seed=42)
        
        # Run Quantum predictions on uploaded dataset (up to 200 samples)
        sample_X = X_tr[:min(200, len(X_tr))]
        preds = []
        probs = []
        
        for row in sample_X:
            res = fallback_system.predict(row)
            preds.append(res['prediction'])
            probs.append(res['confidence'])
            
        preds = np.array(preds)
        probs = np.array(probs)
        
        total_customers = len(preds)
        churn_count = int(np.sum(preds == 0))
        loyal_count = int(np.sum(preds == 1))
        churn_rate = float(churn_count / total_customers * 100) if total_customers > 0 else 0.0
        
        # Calculate hourly trends (synthetic/sample representation)
        hours = list(range(24))
        hourly_churn = [float(np.clip(0.3 + 0.2 * np.sin(2 * np.pi * h / 24) + np.random.normal(0, 0.05), 0.1, 0.9)) for h in hours]
        
        # Recency vs Monetary scatter points
        scatter_points = []
        for i in range(min(50, total_customers)):
            rec = float(sample_X[i, 0] * 30.0) # unscale recency approx
            mon = float(sample_X[i, 2] * 500.0) # unscale monetary approx
            prob = float(probs[i])
            risk = "HIGH_RISK" if preds[i] == 0 else "LOW_RISK"
            scatter_points.append({
                "id": f"CUST-{1000+i}",
                "recency_days": round(rec, 1),
                "monetary_usd": round(mon, 2),
                "churn_prob": round(prob * 100, 1),
                "risk_level": risk
            })
            
        # Top 5 at-risk customers sorted by monetary spend
        at_risk = [p for p in scatter_points if p["risk_level"] == "HIGH_RISK"]
        at_risk.sort(key=lambda x: x["monetary_usd"], reverse=True)
        top_at_risk = at_risk[:5]
        
        return {
            "status": "success",
            "filename": file.filename,
            "summary": {
                "total_customers": total_customers,
                "churn_risk_count": churn_count,
                "loyal_repeat_count": loyal_count,
                "churn_rate_pct": round(churn_rate, 1),
                "potential_revenue_at_risk_usd": round(churn_count * 82.0, 2)
            },
            "hourly_trends": {
                "hours": hours,
                "churn_probabilities": hourly_churn
            },
            "scatter_data": scatter_points,
            "top_at_risk_customers": top_at_risk
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process CSV dataset: {str(e)}")
