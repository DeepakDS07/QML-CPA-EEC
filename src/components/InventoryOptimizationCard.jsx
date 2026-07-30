import React, { useEffect, useState } from 'react';
import { fetchInventoryRecommendations } from '../api/client';
import { Package, ArrowUpRight, ArrowDownRight, RefreshCw, Info } from 'lucide-react';

export default function InventoryOptimizationCard() {
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
        {/* Title & Subtitle */}
        <div className="flex items-center justify-between pb-2 border-b border-[#2D333B] mb-3">
          <div>
            <h3 className="text-card-title text-[#F8FAFC] flex items-center gap-2">
              <Package className="w-4.5 h-4.5 text-[#F97316]" />
              Inventory Optimization & Stock Recommendations
            </h3>
            <p className="text-label text-[#94A3B8] mt-0.5">
              Automated stock adjustments aligned with predictive category demand curves.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-[rgba(34,197,94,0.18)] text-[#4ADE80] font-bold">
            STOCK OPTIMISED
          </span>
        </div>

        {/* Inventory Action Items */}
        {loading ? (
          <div className="h-44 bg-[#161B22] rounded-xl animate-pulse" />
        ) : (
          <div className="space-y-2.5 my-2 font-mono text-xs">
            {items.map((it) => (
              <div key={it.product} className="bg-[#161B22] p-2.5 rounded-lg border border-[#2D333B] flex items-center justify-between">
                <div>
                  <div className="text-[#F8FAFC] font-semibold flex items-center gap-2">
                    <span>{it.product}</span>
                  </div>
                  <p className="text-[11px] text-[#8B949E] mt-0.5 font-sans">
                    {it.reason}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <span className={`px-2.5 py-1 rounded font-bold text-xs ${
                    it.action === 'Increase' || it.action === 'Restock'
                      ? 'bg-[rgba(34,197,94,0.18)] text-[#4ADE80]'
                      : 'bg-[rgba(220,38,38,0.18)] text-[#F87171]'
                  }`}>
                    {it.action} {it.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insight Callout */}
      <div className="pt-3 border-t border-[#2D333B] text-xs text-[#94A3B8] flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[#3B82F6]">
          <Info className="w-3.5 h-3.5" />
          <strong>What this means:</strong> Restocking Power Banks (+32%) prevents stockouts during forecasted high mobile phone sales.
        </span>
      </div>
    </div>
  );
}
