import React, { useEffect, useState } from 'react';
import { fetchDemandForecast } from '../api/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

export default function DemandForecastCard() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetchDemandForecast();
      setForecast(res);
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
              <TrendingUp className="w-4.5 h-4.5 text-indigo-400" />
              Next 30 Days Category Demand Forecast
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Predictive category order volume trends and expected unit demand.
            </p>
          </div>
          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full">
            ↑ 18% OVERALL
          </span>
        </div>

        {/* Category Pills Breakdown */}
        {loading ? (
          <div className="h-44 bg-white/[0.03] rounded-xl animate-pulse" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3 font-mono">
            {forecast?.categories.map((cat) => (
              <div key={cat.category} className="glass-subcard p-3 rounded-xl">
                <div className="uppercase font-mono text-[11px] tracking-widest text-slate-400 opacity-60">{cat.category}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-lg font-mono font-extrabold ${
                    cat.direction === 'up' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {cat.delta}
                  </span>
                  {cat.direction === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-rose-400" />
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Units: <strong className="font-mono font-extrabold text-white text-shadow-indigo">{cat.expected_units.toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 30-Day Demand Trend Line Chart */}
        <div className="h-40 w-full">
          {!loading && forecast?.next_30_days_trend && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast.next_30_days_trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} fontFamily="JetBrains Mono, monospace" />
                <YAxis stroke="#94A3B8" fontSize={10} fontFamily="JetBrains Mono, monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(14, 18, 34, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#fff' }}
                />
                <Line type="monotone" dataKey="demand" name="Predicted Demand" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366F1' }} />
                <Line type="monotone" dataKey="baseline" name="30-Day Baseline" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Insight Callout */}
      <div className="pt-3 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-indigo-300">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <strong>What this means:</strong> High laptop demand (+23%) driven by upcoming Q3 Back-to-School season.
        </span>
      </div>
    </div>
  );
}
