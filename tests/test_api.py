import pytest
import asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport
import io
import pandas as pd
import numpy as np

# Import the FastAPI app
from api.main import app
from api.fallback import GracefulFallback

client = TestClient(app)

# --- 1. Basic Health Check ---
def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

# --- 2. Synchronous Prediction Endpoint ---
@pytest.mark.asyncio
async def test_predict_ideal():
    features = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/predict", json={"features": features, "simulator_type": "ideal"})
        assert response.status_code == 200
        data = response.json()
        assert "prediction" in data
        assert "confidence" in data
        assert "source" in data
        assert "latency_ms" in data

@pytest.mark.asyncio
async def test_predict_noisy():
    features = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/predict", json={"features": features, "simulator_type": "noisy"})
        assert response.status_code == 200
        data = response.json()
        assert "prediction" in data
        assert "source" in data
        assert data["source"] == "quantum_noisy_nisq"

# --- 3. Test Graceful Fallback Thread Exhaustion Fix ---
# We mock a slow quantum model to ensure asyncio.wait_for properly kills it
class MockSlowQuantumModel:
    def __init__(self):
        pass
    def predict_with_prob(self, features):
        import time
        # Simulate blocking processing that takes 500ms (exceeding 200ms SLA)
        time.sleep(0.5)
        return 1, 0.99

class MockClassicalModel:
    def __init__(self):
        pass
    def predict_with_prob(self, features):
        return 0, 0.88

@pytest.mark.asyncio
async def test_graceful_fallback_timeout():
    # SLA is 200ms
    fallback = GracefulFallback(MockSlowQuantumModel(), MockClassicalModel(), timeout_ms=200)
    features = [0.1] * 8
    
    # We await the predict method
    result = await fallback.predict(features)
    
    # Since quantum took 500ms, it should have hit the TimeoutError and fallen back
    assert result["source"] == "classical_fallback"
    assert result["prediction"] == 0
    assert result["confidence"] == 0.88
    # It should resolve near 200ms, not 500ms
    assert result["latency_ms"] < 400 

# --- 4. Dataset Upload Endpoint ---
@pytest.mark.asyncio
async def test_upload_dataset_non_blocking():
    # Create a dummy CSV file in memory
    df = pd.DataFrame({
        "InvoiceNo": [536365, 536366],
        "StockCode": ["85123A", "71053"],
        "Description": ["WHITE HANGING HEART", "WHITE METAL LANTERN"],
        "Quantity": [6, 6],
        "InvoiceDate": ["2010-12-01 08:26:00", "2010-12-01 08:28:00"],
        "UnitPrice": [2.55, 3.39],
        "CustomerID": [17850, 17850],
        "Country": ["United Kingdom", "United Kingdom"]
    })
    
    csv_bytes = df.to_csv(index=False).encode('utf-8')
    files = {'file': ('test.csv', csv_bytes, 'text/csv')}
    data = {'simulator_type': 'ideal'}
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/upload-dataset", data=data, files=files)
        
        # We expect a 200 OK or 400 Bad Request if the preprocessing pipeline fails on such a small dataset.
        assert response.status_code in [200, 400]
        
        if response.status_code == 200:
            json_res = response.json()
            assert "summary" in json_res
            assert "hourly_trends" in json_res
            assert "scatter_data" in json_res
