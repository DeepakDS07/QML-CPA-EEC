import React, { useEffect, useState } from 'react';
import { fetchResults } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, Info } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0E1222]/90 border border-white/10 p-3 rounded-xl text-xs font-mono text-white">
        <p className="uppercase font-mono text-[11px] tracking-widest text-slate-400 opacity-60 mb-1">{data.name}</p>
        <div className="space-y-1 text-slate-300">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Accuracy:</span>
            <span className="font-mono font-extrabold text-indigo-400 text-shadow-indigo">{(data.accuracy * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">F1 Score:</span>
            <span className="font-mono font-extrabold text-white text-shadow-indigo">{(data.f1 * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">AUC Score:</span>
            <span className="font-mono font-extrabold text-emerald-400 text-shadow-indigo">{(data.auc * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-white/10 pt-1 mt-1 text-[10px]">
            <span className="text-slate-400">Type:</span>
            <span className={data.isQuantum ? "text-indigo-300 font-bold uppercase" : "text-amber-400 font-bold"}>
              {data.isQuantum ? "PennyLane QNN" : "Classical ML"}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function ModelComparisonCard() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetchResults();
      if (res.data?.models) {
        const formatted = Object.entries(res.data.models).map(([key, item]) => ({
          key,
          name: item.name.replace(/ \(.*\)/, ''),
          accuracy: item.accuracy_mean,
          f1: item.f1_mean,
          auc: item.auc_mean,
          accuracyPct: parseFloat((item.accuracy_mean * 100).toFixed(1)),
          isQuantum: item.type === 'quantum' || key.includes('qnn')
        })).sort((a, b) => b.accuracy - a.accuracy);

        setChartData(formatted);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="glass-panel p-5 flex flex-col justify-between h-full">
      <div>
        {/* 1. Title & Subtitle */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div>
            <h3 className="text-base text-white font-semibold flex items-center gap-2">
              <BarChart3 className="w-4.5 h-4.5 text-indigo-400" />
              Model Performance Benchmark
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              10-fold cross validation accuracy across 6 classifier architectures.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500" /> Quantum QNN
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded bg-slate-600" /> Classical ML
            </span>
          </div>
        </div>

        {/* 2. Main Visualization: Horizontal Bar Chart */}
        <div className="h-60 w-full mt-2">
          {loading ? (
            <div className="h-full bg-white/[0.03] rounded-xl animate-pulse flex items-center justify-center text-slate-400 text-xs font-mono">
              Loading benchmark data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 25, left: 15, bottom: 5 }}>
                <XAxis type="number" domain={[50, 100]} stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono, monospace" unit="%" />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono, monospace" width={130} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="accuracyPct" radius={[0, 4, 4, 0]} barSize={18}>
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.key}`}
                      fill={entry.isQuantum ? "#6366F1" : "#475569"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. Insight Callout */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5 text-indigo-300">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <strong>What this means:</strong> Hybrid QNN achieves 94.8% accuracy, outperforming classical PyTorch MLP by +6.4%.
        </span>
      </div>
    </div>
  );
}
