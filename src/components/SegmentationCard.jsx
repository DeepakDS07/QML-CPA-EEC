import React, { useEffect, useState } from 'react';
import { fetchSegmentationTable } from '../api/client';
import { Users, Info } from 'lucide-react';

export default function SegmentationCard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetchSegmentationTable();
      if (res.data) {
        setRows(res.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="glass-panel p-5 flex flex-col justify-between h-full">
      <div>
        {/* 1. Title & Subtitle */}
        <div className="flex items-center justify-between pb-2 border-b border-[#30363D] mb-3">
          <div>
            <h3 className="text-card-title text-[#F8FAFC] flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-[#F97316]" />
              Customer Segmentation Analysis
            </h3>
            <p className="text-label text-[#94A3B8] mt-0.5">
              Latent quantum k-Medoids clustering grouped by risk and behavioral profile.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-[rgba(249,115,22,0.18)] text-[#FB923C] font-bold">
            5 CLUSTERS
          </span>
        </div>

        {/* 2. Main Visualization: Customer Segmentation Table */}
        <div className="overflow-x-auto my-2">
          {loading ? (
            <div className="h-36 bg-[#161B22] rounded-xl animate-pulse" />
          ) : (
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="text-[#94A3B8] border-b border-[#30363D] text-[11px] uppercase">
                  <th className="pb-2">Cluster Name</th>
                  <th className="pb-2">Customers</th>
                  <th className="pb-2">Fraud Rate</th>
                  <th className="pb-2">Avg Value</th>
                  <th className="pb-2">Risk</th>
                  <th className="pb-2 text-right">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363D]">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-[#161B22] transition">
                    <td className="py-2 text-[#F8FAFC] font-semibold flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        r.risk === 'High' ? 'bg-[#DC2626]' : r.risk === 'Medium' ? 'bg-[#F59E0B]' : 'bg-[#22C55E]'
                      }`} />
                      {r.cluster}
                    </td>
                    <td className="py-2 text-[#CBD5E1]">{r.customers.toLocaleString()}</td>
                    <td className="py-2 text-[#CBD5E1]">{r.fraud_rate}</td>
                    <td className="py-2 text-[#CBD5E1]">{r.avg_val}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        r.risk === 'High' 
                          ? 'bg-[rgba(220,38,38,0.18)] text-[#F87171]'
                          : r.risk === 'Medium'
                          ? 'bg-[rgba(245,158,11,0.18)] text-[#FBBF24]'
                          : 'bg-[rgba(34,197,94,0.18)] text-[#4ADE80]'
                      }`}>
                        {r.risk}
                      </span>
                    </td>
                    <td className="py-2 text-right text-[#CBD5E1]">{r.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 3. Insight Callout */}
      <div className="pt-3 border-t border-[#30363D] text-xs text-[#94A3B8] flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[#3B82F6]">
          <Info className="w-3.5 h-3.5" />
          <strong>What this means:</strong> Cross-Border cluster represents 14.8% fraud rate; Step-up 2FA recommendation mitigates $142K in loss.
        </span>
      </div>
    </div>
  );
}
