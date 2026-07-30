import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchExecutiveSummary, fetchInventoryRecommendations, pingBackend } from '../api/client';
import { ArrowRight, ArrowUpRight, Package, Users, TrendingUp, BarChart3, Activity, Sparkles, ShieldCheck } from 'lucide-react';

export default function LandingPage({ onEnterDashboard }) {
  const [summary, setSummary] = useState(null);
  const [recs, setRecs] = useState([]);
  const [backendUp, setBackendUp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [sum, inv, alive] = await Promise.all([
        fetchExecutiveSummary(),
        fetchInventoryRecommendations(),
        pingBackend()
      ]);
      setSummary(sum);
      setRecs(inv);
      setBackendUp(alive);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E1A] via-[#0E1222] to-[#12172B] text-slate-100 font-sans flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">

      {/* ── Top Bar ── */}
      <nav className="border-b border-white/[0.08] backdrop-blur-md bg-white/[0.02] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-[0_0_16px_rgba(99,102,241,0.4)]">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">QuantumRetail</span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
              PennyLane QNN
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            {backendUp !== null && (
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${backendUp ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${backendUp ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </span>
                <span className={backendUp ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                  {backendUp ? 'Backend Online' : 'Offline Mode'}
                </span>
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col justify-center">
        <div className="max-w-4xl mx-auto px-6 w-full py-16">

          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quantum AI Demand Forecasting & Purchase Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
              Consumer Purchase Analytics
            </h1>
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl">
              Predict customer demand and optimise inventory using quantum-enhanced machine learning with automated PyTorch fallback.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onEnterDashboard('overview')}
                className="btn-primary-quantum px-7 py-3.5 text-sm flex items-center gap-2.5"
              >
                Open Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEnterDashboard('demand')}
                className="btn-secondary-quantum px-6 py-3.5 text-sm flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                View Demand Forecast
              </button>
            </div>
          </motion.div>

          {/* ── Today's Insights ── */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-10"
          >
            <h2 className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-widest mb-4 opacity-60">
              Today's Insights
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="glass-panel h-24 animate-pulse" />)
              ) : (
                <>
                  <div className="glass-panel">
                    <div className="text-xs font-medium text-slate-400 mb-1">Revenue Forecast</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold font-mono text-white text-shadow-indigo">
                        {summary?.predicted_revenue_gbp || '—'}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        <ArrowUpRight className="w-3.5 h-3.5" />12%
                      </span>
                    </div>
                  </div>

                  <div className="glass-panel">
                    <div className="text-xs font-medium text-slate-400 mb-1">Customers Analysed</div>
                    <span className="text-2xl font-extrabold font-mono text-white text-shadow-indigo">
                      {summary?.customers_analysed?.toLocaleString() || '—'}
                    </span>
                  </div>

                  <div className="glass-panel">
                    <div className="text-xs font-medium text-slate-400 mb-1">Demand Trend</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold font-mono text-white text-shadow-indigo">Rising</span>
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {summary?.demand_forecast_delta || ''}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.section>

          {/* ── Recommended Actions ── */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-10"
          >
            <h2 className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-widest mb-4 opacity-60">
              Recommended Actions
            </h2>
            <div className="space-y-3">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="glass-panel h-14 animate-pulse" />)
              ) : (
                recs.map((r) => (
                  <div key={r.product} className="glass-panel !py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm text-slate-300">
                        <strong className="text-white font-semibold">{r.action}</strong> {r.product}
                      </span>
                    </div>
                    <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full backdrop-blur-md ${
                      r.action === 'Decrease' 
                        ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' 
                        : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    }`}>
                      {r.delta}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.section>

          {/* ── Option Navigation Cards ── */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h2 className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-widest mb-4 opacity-60">
              Navigate Modules
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "1. Customers", icon: Users, tab: "overview", color: "from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/30" },
                { label: "2. Predictions", icon: BarChart3, tab: "overview", color: "from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30" },
                { label: "3. Demand", icon: TrendingUp, tab: "demand", color: "from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30" },
                { label: "4. Inventory", icon: Package, tab: "inventory", color: "from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30" },
              ].map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.label}
                    onClick={() => onEnterDashboard(link.tab)}
                    className="glass-panel !p-4 text-left flex flex-col justify-between h-28 group"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border bg-gradient-to-br ${link.color}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors">{link.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.section>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.08] py-5 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto px-6 text-xs font-mono text-slate-400 flex items-center justify-between">
          <span>Hackathon 2026</span>
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            PennyLane + PyTorch Engine
          </span>
        </div>
      </footer>
    </div>
  );
}
