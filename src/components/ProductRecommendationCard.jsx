import React, { useEffect, useState } from 'react';
import { fetchProductRecommendations } from '../api/client';
import { ShoppingBag, Info, ArrowRight, Tag } from 'lucide-react';

export default function ProductRecommendationCard() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetchProductRecommendations();
      setRecs(res);
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
              <ShoppingBag className="w-4.5 h-4.5 text-indigo-400" />
              Product Recommendations & Basket Affinity
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Personalized next likely purchase and market basket bundle recommendations.
            </p>
          </div>
          <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full">
            AFFINITY MODEL
          </span>
        </div>

        {/* Customer Recommendations */}
        {loading ? (
          <div className="h-44 bg-white/[0.03] rounded-xl animate-pulse" />
        ) : (
          <div className="space-y-3 my-2 font-mono text-xs">
            {recs.map((item) => (
              <div key={item.customer_id} className="glass-subcard p-3 rounded-xl">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="text-white font-bold">{item.customer_id}</span>
                  <div className="flex items-center gap-2">
                    <span className="uppercase font-mono text-[11px] tracking-widest text-slate-400 opacity-60">Prob: <strong className="font-mono font-extrabold text-white text-shadow-indigo opacity-100">{item.probability}</strong></span>
                    <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {item.recommended_offer}
                    </span>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-2">
                    <span className="uppercase font-mono text-[11px] tracking-widest text-slate-400 opacity-60">Likely Purchase:</span>
                    <strong className="text-white font-semibold">{item.likely_product} (<span className="font-mono font-extrabold text-white text-shadow-indigo">{item.expected_spend}</span>)</strong>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.affinity_products.map((p) => (
                      <span key={p.product} className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {p.product}: <strong className="font-mono font-extrabold text-white text-shadow-indigo">{p.probability}</strong>
                      </span>
                    ))}
                  </div>
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
          <strong>What this means:</strong> High basket affinity between Gaming Laptops and Mechanical Keyboards yields +28% cross-sell conversion.
        </span>
      </div>
    </div>
  );
}
