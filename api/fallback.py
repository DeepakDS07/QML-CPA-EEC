import time
import logging

class GracefulFallback:
    def __init__(self, quantum_model, classical_model, timeout_ms=200):
        self.quantum_model = quantum_model
        self.classical_model = classical_model
        self.timeout_ms = timeout_ms
        self.logger = logging.getLogger(__name__)

    def predict(self, features):
        start_time = time.time()
        prediction = None
        source = 'quantum'
        confidence = 0.0
        
        try:
            if hasattr(self.quantum_model, 'predict'):
                prediction = self.quantum_model.predict(features)
                confidence = 0.85
            else:
                raise Exception("Quantum model predict method not found")
                
            elapsed_ms = (time.time() - start_time) * 1000
            if elapsed_ms > self.timeout_ms:
                raise TimeoutError("Quantum execution exceeded timeout")
                
        except Exception as e:
            self.logger.warning(f"Quantum model failed: {str(e)}. Falling back to classical.")
            source = 'classical_fallback'
            if hasattr(self.classical_model, 'predict'):
                prediction = self.classical_model.predict(features)
                confidence = 0.90
            else:
                prediction = 0
                
        latency_ms = (time.time() - start_time) * 1000
        
        return {
            "prediction": prediction,
            "confidence": confidence,
            "source": source,
            "latency_ms": latency_ms
        }
