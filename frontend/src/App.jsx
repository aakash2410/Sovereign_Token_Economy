import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, Coins } from 'lucide-react';
import Ticker from './components/Ticker';
import LiveCharts from './components/LiveCharts';
import ServerHealthGauge from './components/ServerHealthGauge';
import VramHealthGauge from './components/VramHealthGauge';
import ControlPanel from './components/ControlPanel';
import TimeOfDayClock from './components/TimeOfDayClock';
import DataQualityRing from './components/DataQualityRing';

const WS_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/economy`;

function App() {
  const [gameState, setGameState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    let reconnectTimeout;

    const connectWebSocket = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => setIsConnected(true);

      ws.onclose = () => {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connectWebSocket, 1000);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setGameState(data);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  const sendCommand = (cmd) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify(cmd));
    }
  };

  if (!gameState) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white font-sans">
      <div className="animate-pulse flex flex-col items-center">
        <Activity size={48} className="text-emerald-500 mb-4" />
        <h1 className="text-2xl font-bold tracking-tight">Initializing Sovereign Credit Engine...</h1>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans overflow-hidden py-8 px-6 lg:px-12 selection:bg-emerald-500/30">
      <header className="mb-8 flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
            BHASHINI SOVEREIGN CREDIT
          </h1>
          <p className="text-neutral-400 mt-2 uppercase text-xs tracking-[0.2em] font-bold flex items-center">
            {isConnected ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
            )}
            Live Market Maker Simulation
          </p>
        </div>
      </header>

      <main className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column: Core Pricing & Health (V1/V2) */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <Ticker
            priceMultiplier={gameState.price_multiplier}
            isManual={gameState.is_manual}
          />

          <div className="bg-[#111113] rounded-2xl border border-rose-500/20 p-6 flex flex-col items-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-bl-full flex items-start justify-end p-3">
              <Coins size={16} className="text-rose-400" />
            </div>
            <div className="text-neutral-400 font-semibold tracking-wider uppercase text-sm mb-2">Fiat DEX Rate</div>
            <div className="text-3xl font-black text-rose-400">₹{gameState.fiat_rate ? gameState.fiat_rate.toFixed(2) : "5.00"}</div>
            <div className="text-xs text-neutral-500 mt-2 text-center">Cost per 1k Emergency Tokens</div>
          </div>

          <div>
            <ServerHealthGauge load={gameState.server_load} />
            <VramHealthGauge load={gameState.vram_load} />
          </div>

          <ControlPanel
            sendCommand={sendCommand}
            isManual={gameState.is_manual}
            currentPrice={gameState.price_multiplier}
          />
        </div>

        {/* Right Column: Charts & New V3 Constraints */}
        <div className="xl:col-span-3 flex flex-col gap-6">

          {/* Top row of specific constraint visualizations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-48">
            <div className="col-span-1 border border-white/5 rounded-2xl shadow-xl overflow-hidden">
              <TimeOfDayClock time={gameState.time_of_day} />
            </div>
            <div className="col-span-1 border border-white/5 rounded-2xl shadow-xl overflow-hidden relative bg-[#111113]">
              <div className="p-6 flex flex-col items-center justify-center h-full">
                <div className="text-neutral-400 font-semibold tracking-wider uppercase text-sm mb-2">Global System CCR</div>
                <div className="text-5xl font-black text-cyan-400 mt-2">{gameState.system_ccr ? gameState.system_ccr.toFixed(2) : "0.00"}</div>
                <div className="text-xs text-neutral-500 mt-4 text-center">Average System Contribution-to-Consumption Ratio</div>
              </div>
            </div>
            <div className="col-span-1 border border-white/5 rounded-2xl shadow-xl overflow-hidden">
              <DataQualityRing quality={gameState.data_quality} />
            </div>
          </div>

          {/* Massive Charting Space below */}
          <div className="bg-[#111113] rounded-2xl border border-white/5 p-6 shadow-2xl relative overflow-hidden flex-1">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
            <h2 className="text-lg font-semibold text-neutral-300 mb-6 flex items-center">
              <Zap size={18} className="mr-2 text-cyan-500" /> Dynamic CCR Cohort Reserves
            </h2>
            <LiveCharts data={gameState} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
