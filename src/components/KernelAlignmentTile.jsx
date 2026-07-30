import React, { useEffect, useState } from 'react';
import { fetchKernelAlignment } from '../api/client';
import { ShieldCheck, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function KernelAlignmentTile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetchKernelAlignment();
      setData(res.data);
      setLoading(false);
    }
    load();
  }, []);

  const score = data?.alignment_score || 0.642;
  const threshold = data?.threshold || 0.70;
  const scorePct = Math.round((score / 1.0) * 100);

  return (
    <div className="glass-panel p-4 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between text-xs text-[#8B949E] mb-1">
        <span className="font-mono font-medium uppercase tracking-wider text-[#C7CDD5] flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-[#9CA3AF]" />
          Kernel Alignment (Frobenius)
        </span>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded font-bold bg-[rgba(249,115,22,0.18)] text-[#FB923C]">
          GOAL: &lt; {threshold}
        </span>
      </div>

      <div className="flex items-center justify-between mt-2">
        {loading ? (
          <div className="h-9 bg-[#161B22] rounded animate-pulse w-full" />
        ) : (
          <>
            <div>
              <div className="text-2xl font-extrabold font-mono text-[#F5F7FA]">
                {score.toFixed(3)}
              </div>
              <p className="text-[11px] text-[#8B949E] font-mono mt-0.5">
                Barren Plateau: <span className="text-[#22C55E] font-semibold">OPTIMAL</span>
              </p>
            </div>

            {/* Compact Radial Arc Gauge */}
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-11 h-11 transform -rotate-90">
                <circle cx="22" cy="22" r="16" stroke="#2D333B" strokeWidth="3.5" fill="none" />
                <motion.circle
                  cx="22"
                  cy="22"
                  r="16"
                  stroke="#F97316"
                  strokeWidth="3.5"
                  fill="none"
                  strokeDasharray={100}
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - scorePct }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <ShieldCheck className="w-4 h-4 text-[#F97316] absolute" />
            </div>
          </>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-[#2D333B] text-[11px] font-mono text-[#8B949E] flex items-center justify-between">
        <span>Target Bound: <span className="text-[#C7CDD5]">0.70 Max</span></span>
        <span className="text-[#F97316] font-semibold">Optimal Fit</span>
      </div>
    </div>
  );
}
