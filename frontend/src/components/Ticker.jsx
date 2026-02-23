import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus, Bot, User } from 'lucide-react';

export default function Ticker({ priceMultiplier, rewardMultiplier, fiatTaxMultiplier, isManual }) {
    const [prevPrice, setPrevPrice] = useState(priceMultiplier);
    const [trend, setTrend] = useState('flat');

    useEffect(() => {
        if (priceMultiplier > prevPrice) setTrend('up');
        else if (priceMultiplier < prevPrice) setTrend('down');
        else setTrend('flat');
        setPrevPrice(priceMultiplier);
    }, [priceMultiplier]);

    return (
        <div className="bg-[#111113] rounded-2xl border border-white/5 p-6 relative overflow-hidden shadow-xl">
            {/* Ambient Background Glow */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 
                ${trend === 'up' ? 'bg-red-500' : trend === 'down' ? 'bg-emerald-500' : 'bg-transparent'}`}
            />

            <div className="flex justify-between items-start mb-4">
                <h2 className="text-neutral-400 font-semibold tracking-wider uppercase text-sm">
                    API Impact Price
                </h2>
                <div className="flex items-center gap-2">
                    {isManual ? (
                        <span className="flex items-center text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                            <User size={14} className="mr-1" /> Override
                        </span>
                    ) : (
                        <span className="flex items-center text-xs font-bold text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded-md">
                            <Bot size={14} className="mr-1" /> AI Agent
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-baseline gap-3">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={priceMultiplier}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="text-6xl font-black tracking-tighter text-white"
                    >
                        {priceMultiplier.toFixed(2)}x
                    </motion.div>
                </AnimatePresence>

                {trend === 'up' && <ArrowUpRight className="text-red-500" size={32} />}
                {trend === 'down' && <ArrowDownRight className="text-emerald-500" size={32} />}
                {trend === 'flat' && <Minus className="text-neutral-600" size={32} />}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between text-xs font-mono">
                <div className="flex flex-col">
                    <span className="text-neutral-500 mb-1">DATA REWARD</span>
                    <span className="text-emerald-400 font-bold">{(rewardMultiplier || 1.0).toFixed(2)}x</span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-neutral-500 mb-1">FIAT TAX</span>
                    <span className="text-rose-400 font-bold">{(fiatTaxMultiplier || 1.0).toFixed(2)}x</span>
                </div>
            </div>
        </div>
    );
}
