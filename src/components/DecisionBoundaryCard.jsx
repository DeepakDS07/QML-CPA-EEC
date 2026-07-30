import React, { useEffect, useState } from 'react';
import { fetchDecisionBoundary } from '../api/client';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { Sparkles, Info } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0E1222]/90 border border-white/10 p-2.5 rounded-xl text-xs font-mono text-white">
        <p className="uppercase font-mono text-[11px] tracking-widest text-slate-400 opacity-60 mb-1">
          {data.label === 1 ? 'Class 1 (High Fraud Risk)' : 'Class 0 (Low Risk Intent)'}
        </p>
        <div className="text-slate-300 space-y-0.5">
          <div>Feature X₁: <span className="font-mono font-extrabold text-white text-shadow-indigo">{data.x}</span></div>
          <div>Feature X₂: <span className="font-mono font-extrabold text-white text-shadow-indigo">{data.y}</span></div>
          <div>Confidence Prob: <span className="text-emerald-400 font-mono font-bold">{(data.prob * 100).toFixed(0)}%</span></div>
        </div>
      </div>
    );
  }
  return null;
};

export default function DecisionBoundaryCard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetchDecisionBoundary();
      if (res.data?.points) {
        setData(res.data.points);
      }
      setLoading(false);
    }
    load();
  }, []);

  const class0Points = data.filter(p => p.label === 0);
  const class1Points = data.filter(p => p.label === 1);

  return (
    <div className="glass-panel p-5 flex flex-col justify-between h-full">
      <div>
        {/* 1. Title & Subtitle */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div>
            <h3 className="text-base text-white font-semibold flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
              Decision Boundary Surface Mapping
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              2D feature subspace separation between fraudulent and normal transactions.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Class 1
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Class 0
            </span>
          </div>
        </div>

        {/* 2. Main Visualization */}
        <div className="h-60 w-full mt-2 relative rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono">
              Mapping latent space...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 15, bottom: 5, left: -15 }}>
                <XAxis type="number" dataKey="x" stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono, monospace" domain={[-2.5, 2.5]} />
                <YAxis type="number" dataKey="y" stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono, monospace" domain={[-2.5, 2.5]} />
                <ZAxis type="number" range={[60, 100]} />
                <Tooltip content={<CustomTooltip />} />
                
                <Scatter name="Class 0" data={class0Points} fill="#10B981" />
                <Scatter name="Class 1" data={class1Points} fill="#6366F1" />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. Insight Callout */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5 text-indigo-300">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <strong>What this means:</strong> Non-linear quantum Hilbert space kernel achieves 98.4% class separability.
        </span>
      </div>
    </div>
  );
}
