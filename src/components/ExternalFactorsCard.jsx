import React, { useEffect, useState } from 'react';
import { fetchExternalFactors } from '../api/client';
import { Globe, Info, Sun, Zap, Calendar, TrendingUp } from 'lucide-react';

export default function ExternalFactorsCard() {
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetchExternalFactors();
      setFactors(res);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="glass-panel p-5 flex flex-col justify-between h-full">
      <div>
        {/* Title & Subtitle */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
          <div>
            <h3 className="text-base text-white font-semibold flex items-center gap-2">
              <Globe className="w-4.5 h-4.5 text-indigo-400" />
              External Factors Influencing Market Demand
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Macroeconomic, weather, and calendar drivers incorporated into the forecast model.
            </p>
          </div>
          <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full">
            MACRO DRIVERS
          </span>
        </div>

        {/* Factors List */}
        {loading ? (
          <div className="h-44 bg-white/[0.03] rounded-xl animate-pulse" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-2 font-mono text-xs">
            {factors.map((f) => (
              <div key={f.name} className="glass-subcard p-3 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">{f.name}</span>
                  <span className="font-mono font-extrabold text-white text-shadow-indigo">{f.index}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  {f.impact}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insight Callout */}
      <div className="pt-3 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-indigo-300">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <strong>What this means:</strong> Weather indices & local tech expos are currently driving a +14% to +22% lift in portable electronics.
        </span>
      </div>
    </div>
  );
}
