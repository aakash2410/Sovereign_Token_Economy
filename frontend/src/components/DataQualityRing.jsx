import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export default function DataQualityRing({ quality }) {
    // Quality is 0.0 to 1.0
    const percentage = Math.min(100, Math.max(0, quality * 100));
    const circumference = 2 * Math.PI * 40; // r=40
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    let color = '#3b82f6'; // blue
    let statusText = 'PRISTINE';

    if (percentage < 30) {
        color = '#ef4444'; // red
        statusText = 'SEVERE SPAM';
    } else if (percentage < 60) {
        color = '#f59e0b'; // amber
        statusText = 'DECAYING';
    }

    return (
        <div className="bg-[#111113] rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-xl h-full">
            <h2 className="text-neutral-400 font-semibold tracking-wider uppercase text-sm mb-4 absolute top-6 left-6 flex items-center">
                {percentage > 50 ? <ShieldCheck size={16} className={`mr-2 text-blue-500`} /> : <AlertTriangle size={16} className={`mr-2 text-red-500`} />}
                Data Quality
            </h2>

            <div className="relative flex items-center justify-center mt-8">
                {/* Background Ring */}
                <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r="40"
                        stroke="#1f2937"
                        strokeWidth="8"
                        fill="transparent"
                    />
                    {/* Foreground Animated Ring */}
                    <motion.circle
                        cx="64"
                        cy="64"
                        r="40"
                        stroke={color}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Center Text */}
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-black" style={{ color }}>{percentage.toFixed(0)}%</span>
                </div>
            </div>

            <div className="mt-4 text-xs font-bold tracking-widest text-[#737373] uppercase">
                {statusText}
            </div>
        </div>
    );
}
