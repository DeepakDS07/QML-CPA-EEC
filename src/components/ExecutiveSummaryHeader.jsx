import React from 'react';
import { Users, TrendingUp, ShoppingBag, ShieldCheck, ArrowUpRight, Package } from 'lucide-react';

export default function ExecutiveSummaryHeader() {
  const kpis = [
    { label: "Customers", value: "24,582", icon: Users },
    { label: "Revenue Forecast", value: "£1.24M", icon: TrendingUp },
    { label: "Purchase Prob.", value: "82%", icon: ShoppingBag },
    { label: "Demand Trend", value: "↑ 18%", icon: ArrowUpRight },
    { label: "Retention", value: "91%", icon: ShieldCheck },
    { label: "Inventory Adj.", value: "+12%", icon: Package },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
      {kpis.map((k) => {
        const Icon = k.icon;
        return (
          <div key={k.label} className="glass-subcard p-3 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="uppercase font-mono text-[11px] tracking-widest text-slate-400 opacity-60">{k.label}</span>
              <Icon className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="font-mono font-extrabold text-white text-shadow-indigo text-lg">
              {k.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
