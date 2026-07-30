import React, { useEffect, useState } from 'react';
import { fetchCrossover } from '../api/client';
import { AreaChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot } from 'recharts';
import { GitCommit, Info } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0E1222]/90 border border-white/10 p-3 rounded-xl text-xs font-mono text-white">
        <p className="uppercase font-mono text-[11px] tracking-widest text-slate-400 opacity-60 mb-1">N = {data.samples} Samples</p>
        <div className="space-y-1 text-slate-300">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Quantum Accuracy:</span>
            <span className="font-mono font-extrabold text-indigo-400 text-shadow-indigo">{data.qnn}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">95% Conf Interval:</span>
            <span className="font-mono font-extrabold text-white text-shadow-indigo">[{data.qnn_ci_low}% – {data.qnn_ci_high}%]</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Classical MLP Acc:</span>
            <span className="font-mono font-extrabold text-amber-400 text-shadow-indigo">{data.mlp}%</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-white/10 pt-1 mt-1 text-[10px]">
            <span className="text-slate-400">Train Time:</span>
            <span className="text-white font-semibold">{data.train_time_s}s</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function CrossoverCard() {
  const [data, setData] = useState([]);
  const [crossoverPoint, setCrossoverPoint] = useState(220);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetchCrossover();
      if (res.data?.points) {
        setData(res.data.points);
        if (res.data.crossover_sample_count) setCrossoverPoint(res.data.crossover_sample_count);
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
              <GitCommit className="w-4.5 h-4.5 text-indigo-400" />
              Dataset Scaling & Confidence Interval
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Measured empirical accuracy scaling across dataset size with 95% confidence intervals.
            </p>
          </div>
          <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full">
            CROSSOVER @ N={crossoverPoint}
          </span>
        </div>

        {/* 2. Main Visualization: Accuracy vs Dataset Size Chart */}
        <div className="h-52 w-full mt-2">
          {loading ? (
            <div className="h-full bg-white/[0.03] rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="samples" stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono, monospace" />
                <YAxis domain={[60, 100]} stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono, monospace" />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Confidence Interval Shaded Area */}
                <Area type="monotone" dataKey="qnn_ci_high" stroke="none" fill="rgba(99,102,241,0.15)" />
                <Area type="monotone" dataKey="qnn_ci_low" stroke="none" fill="transparent" />

                {/* Main Lines */}
                <Line type="monotone" dataKey="qnn" name="Quantum QNN" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366F1' }} />
                <Line type="monotone" dataKey="mlp" name="Classical MLP" stroke="#F59E0B" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3, fill: '#F59E0B' }} />
                
                <ReferenceDot x={250} y={81} r={6} fill="#6366F1" stroke="#FFFFFF" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. Insight Callout */}
      <div className="pt-3 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-indigo-300">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <strong>What this means:</strong> Quantum QNN surpasses classical MLP at N &gt; 220 samples, demonstrating higher sample efficiency.
        </span>
      </div>
    </div>
  );
}
