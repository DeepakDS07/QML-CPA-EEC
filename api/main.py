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

    def predict(self, features):
        if self.model is not None:
            features_arr = np.array([features], dtype=np.float32)
            preds, probs = predict_hybrid_qnn(self.model, features_arr)
            return int(preds[0])
        return 1

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

    def predict(self, features):
        if self.model is not None:
            features_arr = np.array([features], dtype=np.float32)
            preds, probs = predict_classical_mlp(self.model, features_arr)
            return int(preds[0])
        return 1

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
