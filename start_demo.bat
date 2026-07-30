@echo off
echo === Quantum ML Consumer Analytics - 1-Click Demo Launcher ===
echo Installing dependencies...
pip install -r requirements.txt
echo Running master training & evaluation pipeline...
python run_pipeline.py
echo Starting FastAPI server on http://localhost:8000 ...
start http://localhost:8000
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
pause
