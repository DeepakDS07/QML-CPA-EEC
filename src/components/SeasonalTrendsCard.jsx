import React, { useEffect, useState } from 'react';
import { fetchSeasonalTrends } from '../api/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceArea } from 'recharts';
import { Calendar, Info } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0E1222]/90 border border-white/10 p-3 rounded-xl text-xs font-mono text-white">
        <p className="uppercase font-mono text-[11px] tracking-widest text-slate-400 opacity-60 mb-1">{label} Telemetry</p>
        <div className="space-y-1 text-slate-300">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Historical Sales:</span>
            <span className="font-mono font-extrabold text-white text-shadow-indigo">£{data.sales.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Quantum Forecast:</span>
            <span className="font-mono font-extrabold text-indigo-400 text-shadow-indigo">£{data.forecast.toLocaleString()}</span>
          </div>
          {data.season && (
            <div className="flex justify-between gap-4 border-t border-white/10 pt-1 mt-1 text-[10px]">
              <span className="text-slate-400">Season Highlight:</span>
              <span className="text-indigo-300 font-bold">{data.season}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function SeasonalTrendsCard() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetchSeasonalTrends();
      setTrends(res);
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
              <Calendar className="w-4.5 h-4.5 text-indigo-400" />
              Seasonal Demand Trends & Monthly Sales
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical monthly volume overlaid with predictive shopping event peaks.
            </p>
          </div>
          <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full">
            12-MONTH HORIZON
          </span>
        </div>

        {/* Season Badges */}
        <div className="flex flex-wrap gap-2 mb-3 text-[11px] font-mono">
          <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full">
            🌞 Summer Sale (Jun-Jul)
          </span>
          <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full">
            🎒 Back-to-School (Aug-Sep)
          </span>
          <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full">
            🪔 Festival Season (Nov)
          </span>
          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full">
            🎄 Holiday Peaks (Dec)
          </span>
        </div>

        {/* Line Chart */}
        <div className="h-52 w-full">
          {loading ? (
            <div className="h-full bg-white/[0.03] rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono, monospace" />
                <YAxis stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono, monospace" />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Highlighted Festival / Holiday Season Range */}
                <ReferenceArea x1="Nov" x2="Dec" fill="rgba(99,102,241,0.08)" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                
                <Line type="monotone" dataKey="sales" name="Historical Sales" stroke="#94A3B8" strokeWidth={1.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="forecast" name="Predicted Demand" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366F1' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Insight Callout */}
      <div className="pt-3 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-indigo-300">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <strong>What this means:</strong> November & December holiday peaks generate 34% of annual commercial revenue.
        </span>
      </div>
    </div>
  );
}
