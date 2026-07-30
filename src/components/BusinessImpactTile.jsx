import React, { useEffect, useState } from 'react';
import { fetchBusinessImpact } from '../api/client';
import { DollarSign, TrendingUp, Info, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BusinessImpactTile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [displayAmount, setDisplayAmount] = useState(0);

  useEffect(() => {
    async function load() {
      const res = await fetchBusinessImpact();
      setData(res.data);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!data?.estimated_savings_usd) return;
    const target = data.estimated_savings_usd;
    const duration = 1000;
    const steps = 25;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayAmount(target);
        clearInterval(timer);
      } else {
        setDisplayAmount(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [data]);

  return (
    <div className="glass-panel flex flex-col justify-between h-full">
      <div>
        {/* Title & Subtitle */}
        <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
          <span className="font-mono font-medium uppercase tracking-wider text-[#CBD5E1] flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#94A3B8]" />
            Business Impact & Fraud Prevention
          </span>
          <span className="bg-[rgba(34,197,94,0.18)] text-[#4ADE80] font-mono text-[11px] px-2 py-0.5 rounded font-bold">
            +3.8x ROI
          </span>
        </div>
        <p className="text-[12px] text-[#94A3B8] mb-2">
          Financial value metrics calculated across customer transaction pipeline.
        </p>

        {/* Large Monospace Figure */}
        <div className="mt-1">
          {loading ? (
            <div className="h-9 bg-[#161B22] rounded animate-pulse w-3/4" />
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-metric text-[#F8FAFC] tracking-tight"
            >
              ${displayAmount.toLocaleString()}
            </motion.div>
          )}
        </div>
      </div>

      {/* Insight & Action */}
      <div className="mt-3 pt-2 border-t border-[#30363D] flex items-center justify-between text-[12px] font-mono text-[#94A3B8]">
        <span className="flex items-center gap-1 text-[#22C55E]">
          <TrendingUp className="w-3.5 h-3.5" />
          Annual Projected: <strong className="text-[#F8FAFC]">$1.93M</strong>
        </span>
        <span className="text-[#CBD5E1]">Reviews Saved: <strong className="text-[#F8FAFC]">4,120 hrs</strong></span>
      </div>
    </div>
  );
}
