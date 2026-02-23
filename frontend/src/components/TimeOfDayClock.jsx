import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Moon, Sun } from 'lucide-react';

export default function TimeOfDayClock({ time }) {
    // time is 0.0 to 24.0
    const hours = Math.floor(time);
    const minutes = Math.floor((time - hours) * 60);

    const formatTime = (h, m) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
    };

    // Calculate position of sun/moon on a semi-circle (0 to 180 degrees)
    // 6 AM = 0 deg (sunrise), 12 PM = 90 deg (noon), 6 PM = 180 deg (sunset)
    // Map 24h to 360 deg: -90 deg at midnight, 90 deg at noon
    const rotation = ((time / 24) * 360) - 90;

    const isDay = time >= 6 && time <= 18;
    const isPeak = time >= 10 && time <= 15;

    return (
        <div className="bg-[#111113] rounded-2xl border border-white/5 p-6 flex flex-col relative overflow-hidden shadow-xl h-full">
            <h2 className="text-neutral-400 font-semibold tracking-wider uppercase text-sm mb-4 flex justify-between w-full">
                <span className="flex items-center"><Clock size={16} className="mr-2 text-indigo-400" /> SYSTEM TIME</span>
                {isPeak && <span className="text-amber-500 text-xs px-2 py-0.5 bg-amber-500/10 rounded font-black">PEAK HOURS</span>}
            </h2>

            <div className="flex-1 flex flex-col justify-center items-center">
                {/* Minimalist Clock Arch */}
                <div className="relative w-32 h-16 overflow-hidden mt-4">
                    <div className="w-32 h-32 border-2 border-neutral-800 rounded-full flex justify-center items-center absolute bottom-0">
                        {/* The rotating celestial body */}
                        <motion.div
                            className="absolute w-full h-full"
                            style={{ rotate: rotation }}
                            animate={{ rotate: rotation }}
                            transition={{ ease: "linear", duration: 0.2 }}
                        >
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-4 shadow-lg rounded-full">
                                {isDay ? (
                                    <Sun size={24} className="text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                                ) : (
                                    <Moon size={22} className="text-indigo-300 drop-shadow-[0_0_10px_rgba(165,180,252,0.8)]" />
                                )}
                            </div>
                        </motion.div>
                    </div>
                    {/* Horizon Line */}
                    <div className="absolute bottom-0 w-full h-px bg-neutral-700"></div>
                </div>

                <div className="mt-8 text-3xl font-black tracking-tighter text-white">
                    {formatTime(hours, minutes)}
                </div>
                <div className="text-neutral-500 text-xs uppercase tracking-[0.2em] mt-1 font-bold">
                    Indian Standard Time
                </div>
            </div>

            {/* Ambient background glow based on time */}
            <div
                className={`absolute inset-0 opacity-10 blur-3xl pointer-events-none transition-colors duration-1000 ${isDay ? 'bg-amber-500' : 'bg-indigo-900'}`}
            ></div>
        </div>
    );
}
