import time
import logging
import asyncio

class GracefulFallback:
    def __init__(self, quantum_model, classical_model, timeout_ms=200):
        self.quantum_model = quantum_model
        self.classical_model = classical_model
        self.timeout_ms = timeout_ms
        self.logger = logging.getLogger(__name__)

    async def predict(self, features):
        start_time = time.time()
        prediction = None
        source = 'quantum'
        confidence = 0.0
        
        try:
            if hasattr(self.quantum_model, 'predict_with_prob'):
                # Execute quantum model in a worker thread and enforce a strict timeout
                timeout_sec = self.timeout_ms / 1000.0
                prediction, confidence = await asyncio.wait_for(
                    asyncio.to_thread(self.quantum_model.predict_with_prob, features),
                    timeout=timeout_sec
                )
            elif hasattr(self.quantum_model, 'predict'):
                prediction = await asyncio.wait_for(
                    asyncio.to_thread(self.quantum_model.predict, features),
                    timeout=self.timeout_ms / 1000.0
                )
                confidence = 0.50
            else:
                raise Exception("Quantum model predict method not found")
                
        except asyncio.TimeoutError:
            self.logger.warning(f"Quantum model timed out (> {self.timeout_ms}ms). Falling back to classical.")
            source = 'classical_fallback'
            if hasattr(self.classical_model, 'predict_with_prob'):
                prediction, confidence = await asyncio.to_thread(self.classical_model.predict_with_prob, features)
            elif hasattr(self.classical_model, 'predict'):
                prediction = await asyncio.to_thread(self.classical_model.predict, features)
                confidence = 0.50
            else:
                prediction = 0
                confidence = 0.50
        except Exception as e:
            self.logger.warning(f"Quantum model failed: {str(e)}. Falling back to classical.")
            source = 'classical_fallback'
            if hasattr(self.classical_model, 'predict_with_prob'):
                prediction, confidence = await asyncio.to_thread(self.classical_model.predict_with_prob, features)
            elif hasattr(self.classical_model, 'predict'):
                prediction = await asyncio.to_thread(self.classical_model.predict, features)
                confidence = 0.50
            else:
                prediction = 0
                confidence = 0.50
                
        latency_ms = (time.time() - start_time) * 1000
        
        return {
            "prediction": prediction,
            "confidence": confidence,
            "source": source,
            "latency_ms": latency_ms
        }
