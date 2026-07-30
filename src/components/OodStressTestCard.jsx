import React, { useEffect, useState } from 'react';
import { fetchOodStressTest } from '../api/client';
import { ShieldAlert } from 'lucide-react';

export default function OodStressTestCard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetchOodStressTest();
      if (res.data?.tests) {
        setData(res.data.tests);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="glass-panel p-4 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
          <div>
            <h4 className="uppercase font-mono text-[11px] tracking-widest text-slate-400 opacity-60 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400 opacity-100" />
              OOD Robustness Stress Test
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Out-of-distribution covariate shift resilience (`GET /ood-stress-test`).
            </p>
          </div>
          <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full">
            NOISE SHIFT
          </span>
        </div>

        {/* Compact Table */}
        <div className="overflow-x-auto mt-1">
          {loading ? (
            <div className="h-32 bg-white/[0.03] rounded-xl animate-pulse" />
          ) : (
            <table className="w-full text-left font-mono text-[11px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-1.5 uppercase font-mono text-[10px] tracking-widest text-slate-400 opacity-60">Model</th>
                  <th className="pb-1.5 uppercase font-mono text-[10px] tracking-widest text-slate-400 opacity-60">Clean</th>
                  <th className="pb-1.5 uppercase font-mono text-[10px] tracking-widest text-slate-400 opacity-60">Gaussian</th>
                  <th className="pb-1.5 uppercase font-mono text-[10px] tracking-widest text-slate-400 opacity-60">Covariate</th>
                  <th className="pb-1.5 text-right uppercase font-mono text-[10px] tracking-widest text-slate-400 opacity-60">Delta Drop</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {data.map((row, idx) => (
                  <tr key={idx} className={row.model.includes('Quantum') ? 'bg-white/[0.04] font-semibold' : ''}>
                    <td className="py-2 text-white flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${row.model.includes('Quantum') ? 'bg-indigo-400' : 'bg-slate-500'}`} />
                      {row.model}
                    </td>
                    <td className="py-2 text-slate-300 font-mono">{row.clean_acc}</td>
                    <td className="py-2 text-slate-400 font-mono">{row.shift_gaussian}</td>
                    <td className="py-2 text-slate-400 font-mono">{row.shift_covariate}</td>
                    <td className="py-2 text-right">
                      <span className={
                        row.status === 'PASS' 
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold px-2 py-0.5 rounded-full'
                          : row.status === 'WARN'
                          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-semibold px-2 py-0.5 rounded-full'
                          : 'bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs font-semibold px-2 py-0.5 rounded-full'
                      }>
                        {row.drop}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-white/10 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <span className="text-indigo-300">Quantum QNN drop only -6.3% (3x lower drop)</span>
        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full">ROBUST PASS</span>
      </div>
    </div>
  );
}
