import React, { useEffect, useState } from 'react';
import { pingBackend } from '../api/client';
import { Server, RefreshCw } from 'lucide-react';

export default function ApiStatusTile() {
  const [isLive, setIsLive] = useState(null);
  const [lastCheck, setLastCheck] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const checkStatus = async () => {
    setRefreshing(true);
    const alive = await pingBackend();
    setIsLive(alive);
    setLastCheck(new Date());
    setRefreshing(false);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel p-4 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between text-xs text-[#8B949E] mb-1">
        <span className="font-mono font-medium uppercase tracking-wider text-[#C7CDD5] flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-[#9CA3AF]" />
          FastAPI Backend Status
        </span>
        <button
          onClick={checkStatus}
          disabled={refreshing}
          className="text-[#9CA3AF] hover:text-[#D1D5DB] transition"
          title="Manual ping refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#F97316]' : ''}`} />
        </button>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              isLive ? 'bg-[#22C55E]' : 'bg-[#F59E0B]'
            }`} />
            <span className={`text-lg font-bold font-mono uppercase tracking-wide ${
              isLive ? 'text-[#22C55E]' : 'text-[#F59E0B]'
            }`}>
              {isLive ? 'ONLINE (8000)' : 'STANDALONE'}
            </span>
          </div>
          <p className="text-[11px] text-[#8B949E] font-mono mt-1">
            {isLive ? 'FastAPI Uvicorn server connected' : 'Pre-computed telemetry active'}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-[#2D333B] text-[11px] font-mono text-[#8B949E] flex items-center justify-between">
        <span>Poll: <span className="text-[#C7CDD5]">30s Interval</span></span>
        <span>Checked: <span className="text-[#C7CDD5]">{lastCheck.toLocaleTimeString()}</span></span>
      </div>
    </div>
  );
}
