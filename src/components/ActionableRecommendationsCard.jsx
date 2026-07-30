import React, { useEffect, useState } from 'react';
import { fetchInventoryRecommendations } from '../api/client';
import { Package, Info, ArrowRight } from 'lucide-react';

export default function ActionableRecommendationsCard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetchInventoryRecommendations();
      setItems(res);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="glass-panel p-5 flex flex-col justify-between h-full">
      <div>
        <div className="pb-3 border-b border-white/10 mb-4">
          <h3 className="text-base font-bold text-white">
            Recommended Actions
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            What to do next based on predicted demand and customer behaviour.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-3 h-16 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((it) => (
              <div key={it.product} className="glass-subcard p-3 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-semibold text-white">{it.product}</span>
                  </div>
                  <span className={
                    it.action === 'Decrease'
                      ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full'
                      : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full'
                  }>
                    {it.action} <span className="font-mono font-extrabold text-white text-shadow-indigo">{it.delta}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 pl-6 mt-1">{it.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-white/10 text-xs text-slate-400 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-indigo-400" />
        Actions are generated from the demand forecast model and inventory data.
      </div>
    </div>
  );
}
