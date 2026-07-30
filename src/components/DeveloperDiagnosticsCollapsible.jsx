import React, { useState, useEffect } from 'react';
import { fetchQuantumModelDetails } from '../api/client';
import { ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import QuantumCircuitSvg from './QuantumCircuitSvg';
import BarrenPlateauCard from './BarrenPlateauCard';
import CrossoverCard from './CrossoverCard';
import OodStressTestCard from './OodStressTestCard';

export default function DeveloperDiagnosticsCollapsible() {
  const [isOpen, setIsOpen] = useState(false);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetchQuantumModelDetails();
      setDetails(res);
    }
    load();
  }, []);

  return (
    <div className="glass-panel overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.05] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">
              Model Details & Quantum Diagnostics
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Circuit architecture, gradient health, and stress test results.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="hidden sm:inline font-mono">
            {isOpen ? 'Collapse' : 'Expand'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 space-y-5 border-t border-white/10 bg-transparent">
          {/* Model Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="glass-subcard p-3 rounded-xl">
              <div className="uppercase font-mono text-[11px] tracking-widest text-slate-400 opacity-60">Simulator</div>
              <div className="font-mono font-extrabold text-white text-shadow-indigo mt-0.5">{details?.simulator || 'PennyLane'}</div>
            </div>
            <div className="glass-subcard p-3 rounded-xl">
              <div className="uppercase font-mono text-[11px] tracking-widest text-slate-400 opacity-60">Architecture</div>
              <div className="font-mono font-extrabold text-white text-shadow-indigo mt-0.5">{details?.ansatz || '4-Qubit Variational'}</div>
            </div>
            <div className="glass-subcard p-3 rounded-xl">
              <div className="uppercase font-mono text-[11px] tracking-widest text-slate-400 opacity-60">Inference Time</div>
              <div className="font-mono font-extrabold text-white text-shadow-indigo mt-0.5">{details?.inference_time_ms || 184} ms</div>
            </div>
            <div className="glass-subcard p-3 rounded-xl">
              <div className="uppercase font-mono text-[11px] tracking-widest text-slate-400 opacity-60">Hybrid Status</div>
              <div className="text-emerald-400 font-mono font-bold mt-0.5">Active</div>
            </div>
          </div>

          {/* Circuit Diagram */}
          <QuantumCircuitSvg isPredicting={false} source="quantum" latencyMs={184} />

          {/* Technical Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BarrenPlateauCard />
            <CrossoverCard />
            <OodStressTestCard />
          </div>
        </div>
      )}
    </div>
  );
}
