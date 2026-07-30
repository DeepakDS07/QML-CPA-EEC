import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap } from 'lucide-react';

export default function QuantumCircuitSvg({ isPredicting, source, latencyMs }) {
  const isFallback = source === 'classical_fallback';
  const isQuantum = source === 'quantum';

  // 4 Qubit line Y coordinates
  const qubits = [
    { id: 'q0', y: 40, label: '|q₀⟩' },
    { id: 'q1', y: 90, label: '|q₁⟩' },
    { id: 'q2', y: 140, label: '|q₂⟩' },
    { id: 'q3', y: 190, label: '|q₃⟩' },
  ];

  return (
    <div className="relative w-full glass-subcard p-4 rounded-xl">
      {/* Header bar over circuit */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-indigo-400" />
          <span className="font-mono text-white font-semibold uppercase tracking-wide text-xs">
            PennyLane 4-Qubit Variational Circuit (Ansatz Architecture)
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-slate-400">
          <span>Entanglement: <span className="text-white font-semibold">CNOT Mesh</span></span>
          <span>Parametric Gates: <span className="text-white font-semibold">16</span></span>
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 680 230" className="w-full h-auto max-h-[220px] overflow-visible">
          {/* Qubit Wire Lines */}
          {qubits.map((q) => (
            <g key={q.id}>
              <text x="12" y={q.y + 4} fill="#94A3B8" fontSize="13" fontFamily="JetBrains Mono, monospace" fontWeight="600">
                {q.label}
              </text>
              <line x1="50" y1={q.y} x2="610" y2={q.y} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            </g>
          ))}

          {/* LAYER 1: Hadamard Gates (H) */}
          {qubits.map((q) => (
            <g key={`h-${q.id}`}>
              <rect x="85" y={q.y - 15} width="28" height="30" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <text x="99" y={q.y + 5} fill="#FFFFFF" fontSize="12" fontFamily="JetBrains Mono, monospace" fontWeight="600" textAnchor="middle">H</text>
            </g>
          ))}

          {/* LAYER 2: Parametric RX/RY Gates */}
          {qubits.map((q, idx) => {
            const gateName = idx % 2 === 0 ? 'Rₓ' : 'Rᵧ';
            return (
              <g key={`r1-${q.id}`}>
                <rect x="155" y={q.y - 15} width="32" height="30" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                <text x="171" y={q.y + 5} fill="#FFFFFF" fontSize="11" fontFamily="JetBrains Mono, monospace" fontWeight="600" textAnchor="middle">{gateName}</text>
              </g>
            );
          })}

          {/* LAYER 3: CNOT Entanglement (Pairs: q0-q1, q2-q3) */}
          <g>
            <line x1="230" y1="40" x2="230" y2="90" stroke="#6366F1" strokeWidth="1.5" />
            <circle cx="230" cy="40" r="4" fill="#6366F1" />
            <circle cx="230" cy="90" r="9" fill="#0E1222" stroke="#6366F1" strokeWidth="1.5" />
            <line x1="230" y1="83" x2="230" y2="97" stroke="#6366F1" strokeWidth="1.5" />
            <line x1="223" y1="90" x2="237" y2="90" stroke="#6366F1" strokeWidth="1.5" />
          </g>
          <g>
            <line x1="230" y1="140" x2="230" y2="190" stroke="#6366F1" strokeWidth="1.5" />
            <circle cx="230" cy="140" r="4" fill="#6366F1" />
            <circle cx="230" cy="190" r="9" fill="#0E1222" stroke="#6366F1" strokeWidth="1.5" />
            <line x1="230" y1="183" x2="230" y2="197" stroke="#6366F1" strokeWidth="1.5" />
            <line x1="223" y1="190" x2="237" y2="190" stroke="#6366F1" strokeWidth="1.5" />
          </g>

          {/* LAYER 4: Parametric RZ Gates */}
          {qubits.map((q) => (
            <g key={`rz-${q.id}`}>
              <rect x="290" y={q.y - 15} width="32" height="30" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <text x="306" y={q.y + 5} fill="#FFFFFF" fontSize="11" fontFamily="JetBrains Mono, monospace" fontWeight="600" textAnchor="middle">Rᵌ</text>
            </g>
          ))}

          {/* LAYER 5: Interleaved CNOT Entanglement (q1 to q2) */}
          <g>
            <line x1="365" y1="90" x2="365" y2="140" stroke="#6366F1" strokeWidth="1.5" />
            <circle cx="365" cy="90" r="4" fill="#6366F1" />
            <circle cx="365" cy="140" r="9" fill="#0E1222" stroke="#6366F1" strokeWidth="1.5" />
            <line x1="365" y1="133" x2="365" y2="147" stroke="#6366F1" strokeWidth="1.5" />
            <line x1="358" y1="140" x2="372" y2="140" stroke="#6366F1" strokeWidth="1.5" />
          </g>

          {/* LAYER 6: Final Measurement Gauges (M) */}
          {qubits.map((q) => (
            <g key={`m-${q.id}`}>
              <rect x="430" y={q.y - 16} width="36" height="32" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <path d={`M ${430 + 10} ${q.y + 7} A 10 10 0 0 1 ${430 + 26} ${q.y + 7}`} fill="none" stroke="#94A3B8" strokeWidth="1.5" />
              <line x1={430 + 18} y1={q.y + 7} x2={430 + 24} y2={q.y - 3} stroke="#6366F1" strokeWidth="1.5" />
            </g>
          ))}

          {/* Output Wires */}
          {qubits.map((q) => (
            <line key={`out-${q.id}`} x1="466" y1={q.y} x2="570" y2={q.y} stroke="#6366F1" strokeWidth="1.5" strokeDasharray="3 3" />
          ))}

          {/* Final Qubit Readout Nodes */}
          {qubits.map((q) => (
            <circle key={`node-${q.id}`} cx="570" cy={q.y} r="5" fill="#6366F1" />
          ))}

          {/* PREDICT PULSE TRAVERSAL */}
          {isPredicting && (
            <g>
              {qubits.map((q) => (
                <motion.circle
                  key={`pulse-${q.id}`}
                  cy={q.y}
                  r="5"
                  fill={isFallback ? "#F59E0B" : "#6366F1"}
                  initial={{ cx: 50, opacity: 0 }}
                  animate={{
                    cx: isFallback ? 365 : 570,
                    opacity: [0, 1, 1, 1]
                  }}
                  transition={{
                    duration: isFallback ? 0.7 : 1.2,
                    ease: "easeInOut",
                    repeat: isFallback ? 0 : Infinity
                  }}
                />
              ))}
            </g>
          )}

          {/* FALLBACK STALL INDICATOR */}
          {isFallback && (
            <g>
              <circle cx="365" cy="115" r="20" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="365" y1="115" x2="610" y2="115" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 4" />
            </g>
          )}
        </svg>
      </div>

      {/* Architecture Status Bar */}
      <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-3">
          {/* Classical MLP Badge */}
          <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${
            isFallback
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-mono text-xs font-semibold'
              : 'bg-white/[0.03] border-white/10 text-slate-400 font-mono text-xs'
          }`}>
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>Classical MLP (PyTorch 2.2 Fallback)</span>
            {isFallback && <span className="text-[10px] uppercase bg-amber-500/20 px-1 rounded-full">ACTIVE</span>}
          </div>

          {/* Quantum Processing Unit Badge */}
          <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${
            isQuantum
              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold'
              : 'bg-white/[0.03] border-white/10 text-slate-400 font-mono text-xs'
          }`}>
            <Zap className="w-3.5 h-3.5 text-slate-400" />
            <span>Quantum Simulator (PennyLane)</span>
            {isQuantum && <span className="text-[10px] uppercase bg-indigo-500/20 px-1 rounded-full">ACTIVE</span>}
          </div>
        </div>

        {latencyMs && (
          <div className="text-slate-400">
            Inference Latency: <span className="font-mono font-extrabold text-white text-shadow-indigo">{latencyMs} ms</span>
          </div>
        )}
      </div>
    </div>
  );
}
