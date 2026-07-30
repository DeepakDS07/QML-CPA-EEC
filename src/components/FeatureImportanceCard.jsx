import React, { useEffect, useState } from 'react';
import { fetchShapFeatureImportance } from '../api/client';
import { BarChart2, Info } from 'lucide-react';

export default function FeatureImportanceCard() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetchShapFeatureImportance();
      if (res.data) {
        setFeatures(res.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="glass-panel p-5 flex flex-col justify-between h-full">
      <div>
        {/* 1. Title & Subtitle */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
          <div>
            <h3 className="text-base text-white font-semibold flex items-center gap-2">
              <BarChart2 className="w-4.5 h-4.5 text-indigo-400" />
              Horizontal SHAP Feature Importance
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Shapley Additive Explanations ranking feature contributions to prediction.
            </p>
          </div>
          <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full">
            SHAP VALUES
          </span>
        </div>

        {/* 2. Main Visualization: Horizontal SHAP Bars */}
        {loading ? (
          <div className="h-44 bg-white/[0.03] rounded-xl animate-pulse" />
        ) : (
          <div className="space-y-3 my-2">
            {features.slice(0, 6).map((f) => (
              <div key={f.name} className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-white font-semibold">{f.name}</span>
                  <span className="font-mono font-extrabold text-white text-shadow-indigo">{f.weight}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${f.weight * 3}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Insight Callout */}
      <div className="pt-3 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-indigo-300">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <strong>What this means:</strong> Transaction Volume contributes 28% to prediction, making it the strongest fraud driver.
        </span>
      </div>
    </div>
  );
}
