import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { predictInference } from '../api/client';
import { Play, RotateCcw, Activity, Info, Clock } from 'lucide-react';

const DEFAULT_FEATURES = [0.5, 1.2, 0.8, 3.1, 0.2, 1.5, 2.0, 0.9];
const FEATURE_LABELS = [
  { name: 'Transaction Vol', min: 0.0, max: 5.0, step: 0.1 },
  { name: 'Recency Score', min: 0.0, max: 5.0, step: 0.1 },
  { name: 'Session Duration', min: 0.0, max: 5.0, step: 0.1 },
  { name: 'Device Velocity', min: 0.0, max: 5.0, step: 0.1 },
  { name: 'Account Age', min: 0.0, max: 5.0, step: 0.1 },
  { name: 'Risk Index', min: 0.0, max: 5.0, step: 0.1 },
  { name: 'Cross-border', min: 0.0, max: 5.0, step: 0.1 },
  { name: 'Auth Failures', min: 0.0, max: 5.0, step: 0.1 },
];

export default function HeroPredictionSandbox() {
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [isPredicting, setIsPredicting] = useState(false);
  const [forceFallback, setForceFallback] = useState(false);
  const [result, setResult] = useState(null);

  const handleSliderChange = (idx, value) => {
    const next = [...features];
    next[idx] = parseFloat(value);
    setFeatures(next);
  };

  const handlePredict = async () => {
    setIsPredicting(true);
    try {
      const response = await predictInference(features, forceFallback);
      setResult(response);
    } catch (err) {
      console.error("Prediction failed:", err);
    } finally {
      setIsPredicting(false);
    }
  };

  const isFallback = result?.source === 'classical_fallback';
  const confidencePct = result ? Math.round((result.confidence || 0) * 100) : null;

  return (
    <div className="glass-panel flex flex-col justify-between h-full p-5">
      {/* Title */}
      <div className="pb-3 border-b border-white/10 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              Purchase Prediction
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust customer features and run a live prediction through the quantum model.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 glass-subcard px-2.5 py-1.5 rounded-xl">
            <input
              type="checkbox"
              checked={forceFallback}
              onChange={(e) => setForceFallback(e.target.checked)}
              className="accent-indigo-500 cursor-pointer"
            />
            <span className={forceFallback ? 'text-amber-400 font-medium' : ''}>
              Force fallback
            </span>
          </label>
        </div>
      </div>

      {/* Feature Sliders */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="uppercase font-mono text-[11px] tracking-widest text-slate-400 opacity-60">
            Customer Feature Vector
          </span>
          <button
            onClick={() => setFeatures(DEFAULT_FEATURES)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 glass-subcard p-3 rounded-xl">
          {FEATURE_LABELS.map((item, idx) => (
            <div key={item.name} className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 truncate">{item.name}</span>
                <span className="font-mono text-white font-bold text-[11px]">
                  {features[idx]}
                </span>
              </div>
              <input
                type="range"
                min={item.min}
                max={item.max}
                step={item.step}
                value={features[idx]}
                onChange={(e) => handleSliderChange(idx, e.target.value)}
                className="w-full accent-indigo-500 bg-white/10 h-1 rounded appearance-none cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Action Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-4 sm:col-span-3">
          <button
            onClick={handlePredict}
            disabled={isPredicting}
            className={
              isPredicting
                ? 'w-full px-4 py-2.5 text-xs flex items-center justify-center gap-2 bg-white/10 text-slate-400 rounded-xl cursor-not-allowed border border-white/10'
                : 'btn-primary-quantum px-4 py-2.5 text-xs flex items-center justify-center gap-2 w-full'
            }
          >
            {isPredicting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Run Prediction
              </>
            )}
          </button>
        </div>

        {/* Result */}
        <div className="md:col-span-8 sm:col-span-9">
          {result ? (
            <div className="glass-subcard p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={
                  result.prediction === 1
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-sm font-bold w-9 h-9 rounded-xl flex items-center justify-center'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-sm font-bold w-9 h-9 rounded-xl flex items-center justify-center'
                }>
                  {result.prediction}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {result.likely_product} — <span className="font-mono font-extrabold text-white text-shadow-indigo">{result.expected_spend}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-0.5">
                    <span>
                      Source: <strong className={isFallback ? 'text-amber-400' : 'text-indigo-300'}>{result.source}</strong>
                    </span>
                    <span>
                      QNN: <strong className="text-slate-200">{result.latency_quantum_ms}ms</strong>
                    </span>
                    <span>
                      Classical: <strong className="text-slate-200">{result.latency_classical_ms}ms</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Confidence */}
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle cx="20" cy="20" r="15" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" />
                    <motion.circle
                      cx="20" cy="20" r="15"
                      stroke={isFallback ? "#F59E0B" : "#6366F1"}
                      strokeWidth="3" fill="none" strokeDasharray={94}
                      initial={{ strokeDashoffset: 94 }}
                      animate={{ strokeDashoffset: 94 - (confidencePct * 0.94) }}
                      transition={{ duration: 0.5 }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute font-mono text-[10px] font-extrabold text-white text-shadow-indigo">
                    {confidencePct}%
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 leading-tight">
                  Conf.
                </span>
              </div>
            </div>
          ) : (
            <div className="glass-subcard p-3 rounded-xl text-xs text-slate-400 font-mono text-center">
              Run a prediction to see results
            </div>
          )}
        </div>
      </div>

      {/* Insight */}
      {result && (
        <div className="mt-3 pt-2 border-t border-white/10 text-xs text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          Recommendation: <strong className="text-slate-200">{result.recommended_offer}</strong>
        </div>
      )}
    </div>
  );
}
