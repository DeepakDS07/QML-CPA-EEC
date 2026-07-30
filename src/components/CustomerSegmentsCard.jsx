import React, { useEffect, useState } from 'react';
import { fetchCustomerSegments } from '../api/client';
import { Users, Info } from 'lucide-react';

export default function CustomerSegmentsCard() {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetchCustomerSegments();
      setSegments(res);
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
              <Users className="w-4.5 h-4.5 text-indigo-400" />
              Customer Segments & Behavioral Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Behavioral archetype grouping across 24,582 analyzed customer profiles.
            </p>
          </div>
          <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full">
            5 SEGMENTS
          </span>
        </div>

        {/* Main Segment Breakdown */}
        {loading ? (
          <div className="h-44 bg-white/[0.03] rounded-xl animate-pulse" />
        ) : (
          <div className="space-y-3 my-2 font-mono text-xs">
            {segments.map((seg) => (
              <div key={seg.name} className="glass-subcard p-3 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-semibold">{seg.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{seg.count.toLocaleString()} customers</span>
                    <span className="font-mono font-extrabold text-white text-shadow-indigo">{seg.share}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${seg.share * 2.5}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] mt-2">
                  <span className="uppercase font-mono text-[11px] tracking-widest text-slate-400 opacity-60">Avg Spend: <strong className="font-mono font-extrabold text-white text-shadow-indigo opacity-100">{seg.avg_spend}</strong></span>
                  <span className="uppercase font-mono text-[11px] tracking-widest text-slate-400 opacity-60">Retention: <strong className="text-emerald-400 font-mono font-semibold opacity-100">{seg.retention}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insight Callout */}
      <div className="pt-3 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-indigo-300">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <strong>What this means:</strong> High Value & Loyal segments account for 62.7% of customers and 78% of predicted revenue.
        </span>
      </div>
    </div>
  );
}
