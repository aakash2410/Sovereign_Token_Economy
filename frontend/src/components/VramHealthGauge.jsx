import React from 'react';
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';

export default function VramHealthGauge({ load }) {
    // Load is 0.0 to 1.0 (or slightly higher if overloaded)
    const loadPercentage = Math.min(100, Math.max(0, load * 100));

    let color = '#a855f7'; // purple
    let bgColor = 'bg-purple-500/20';
    let textColor = 'text-purple-500';
    let statusText = 'HEALTHY';

    if (loadPercentage > 90) {
        color = '#ef4444'; // red
        bgColor = 'bg-red-500/20';
        textColor = 'text-red-500';
        statusText = 'CRITICAL OOM';
    } else if (loadPercentage > 75) {
        color = '#f59e0b'; // amber
        bgColor = 'bg-amber-500/20';
        textColor = 'text-amber-500';
        statusText = 'HIGH LOAD';
    }

    return (
        <div className="bg-[#111113] rounded-2xl border border-white/5 p-6 relative overflow-hidden mt-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-neutral-400 font-semibold tracking-wider uppercase text-sm flex items-center">
                    <Cpu size={16} className={`mr-2 ${textColor}`} />
                    GPU VRAM Load
                </h2>
                <span className={`text-xs font-black px-2 py-1 rounded-md ${bgColor} ${textColor}`}>
                    {statusText}
                </span>
            </div>

            <div className="relative h-6 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                <motion.div
                    className="absolute top-0 left-0 h-full rounded-full flex items-center justify-end px-2"
                    initial={{ width: 0 }}
                    animate={{ width: `${loadPercentage}%`, backgroundColor: color }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                >
                    {/* Shine effect */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-full"></div>
                </motion.div>
            </div>

            <div className="mt-3 flex justify-between text-xs font-mono text-neutral-500">
                <span>0%</span>
                <span className="text-white font-bold">{loadPercentage.toFixed(1)}%</span>
                <span>100%</span>
            </div>
            <div className="text-[10px] text-neutral-600 mt-2 text-center uppercase tracking-widest">
                Heavy TTS/ASR Compute Tension
            </div>
        </div>
    );
}
