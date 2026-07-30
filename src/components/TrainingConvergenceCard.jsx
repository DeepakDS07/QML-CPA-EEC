import React, { useEffect, useState } from 'react';
import { fetchTrainingCurves } from '../api/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Activity, Info } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0E1222]/90 border border-white/10 p-3 rounded-xl text-xs font-mono text-white">
        <p className="uppercase font-mono text-[11px] tracking-widest text-slate-400 opacity-60 mb-1 border-b border-white/10 pb-1">Epoch {label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex justify-between gap-4 py-0.5">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-mono font-extrabold text-white text-shadow-indigo">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function TrainingConvergenceCard() {
  const [data, setData] = useState([]);
  const [metric, setMetric] = useState('loss');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetchTrainingCurves();
      if (res.data?.epochs) {
        const formatted = res.data.epochs.map((ep, idx) => ({
          epoch: ep,
          qnnLoss: parseFloat(res.data.qnn_loss[idx]?.toFixed(3) || 0),
          mlpLoss: parseFloat(res.data.mlp_loss[idx]?.toFixed(3) || 0),
          qnnAcc: parseFloat(((res.data.qnn_acc[idx] || 0) * 100).toFixed(1)),
          mlpAcc: parseFloat(((res.data.mlp_acc[idx] || 0) * 100).toFixed(1)),
        }));
        setData(formatted);
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
              <Activity className="w-4.5 h-4.5 text-indigo-400" />
              Training Convergence Dynamics
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Epoch-by-epoch loss reduction and accuracy optimization trajectories.
            </p>
          </div>

          <div className="flex items-center gap-1 glass-subcard p-1 rounded-xl font-mono text-xs">
            <button
              onClick={() => setMetric('loss')}
              className={`px-2.5 py-1 rounded-lg transition ${
                metric === 'loss' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Loss Curve
            </button>
            <button
              onClick={() => setMetric('accuracy')}
              className={`px-2.5 py-1 rounded-lg transition ${
                metric === 'accuracy' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Accuracy %
            </button>
          </div>
        </div>

        {/* 2. Main Visualization */}
        <div className="h-60 w-full mt-2">
          {loading ? (
            <div className="h-full bg-white/[0.03] rounded-xl animate-pulse flex items-center justify-center text-slate-400 text-xs font-mono">
              Loading trajectories...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="epoch" stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono, monospace" />
                <YAxis stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono, monospace" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', paddingTop: '10px', color: '#94A3B8' }} />
                
                {metric === 'loss' ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="qnnLoss"
                      name="Quantum QNN Loss"
                      stroke="#6366F1"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="mlpLoss"
                      name="Classical MLP Loss"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </>
                ) : (
                  <>
                    <Line
                      type="monotone"
                      dataKey="qnnAcc"
                      name="Quantum QNN Acc %"
                      stroke="#6366F1"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="mlpAcc"
                      name="Classical MLP Acc %"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. Insight Callout */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5 text-indigo-300">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <strong>What this means:</strong> QNN loss converges by Epoch 10, achieving stable optimization faster than classical MLP.
        </span>
      </div>
    </div>
  );
}
