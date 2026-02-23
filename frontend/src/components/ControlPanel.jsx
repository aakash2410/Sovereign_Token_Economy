import React, { useState } from 'react';
import { AlertOctagon, Settings2 } from 'lucide-react';

export default function ControlPanel({ sendCommand, isManual, currentPrice }) {
    const [sliderVal, setSliderVal] = useState(currentPrice);

    const handleShock = () => {
        sendCommand({ type: 'shock' });
    };

    const handleSliderChange = (e) => {
        const val = parseFloat(e.target.value);
        setSliderVal(val);
        sendCommand({ type: 'override', value: val });
    };

    const engageAuto = () => {
        sendCommand({ type: 'auto' });
    };

    return (
        <div className="bg-[#111113] rounded-2xl border border-white/5 p-6 flex flex-col gap-6">

            {/* Shock Injector */}
            <div>
                <h3 className="text-neutral-400 font-semibold tracking-wider uppercase text-sm mb-3">Chaos Engineering</h3>
                <button
                    onClick={handleShock}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-colors shadow-[0_4px_14px_0_rgba(220,38,38,0.39)]"
                >
                    <AlertOctagon className="mr-2" size={20} />
                    Inject Enterprise Shock
                </button>
                <p className="text-xs text-neutral-500 mt-2">Simulates a massive, sudden surge in API consumption by an enterprise actor.</p>
            </div>

            <div className="h-px w-full bg-neutral-800"></div>

            {/* Manual Override */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-neutral-400 font-semibold tracking-wider uppercase text-sm flex items-center">
                        <Settings2 className="mr-2" size={16} />
                        Market Control
                    </h3>
                    {isManual && (
                        <button
                            onClick={engageAuto}
                            className="text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white px-2 py-1 rounded-md transition-colors font-bold border border-emerald-500/50"
                        >
                            Re-engage RL Agent
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs text-neutral-400 font-mono">
                        <span>0.1x (Cheap)</span>
                        <span className={isManual ? 'text-orange-400 font-bold' : 'text-neutral-500'}>
                            {isManual ? `${sliderVal.toFixed(2)}x` : 'AI Managed'}
                        </span>
                        <span>5.0x (Expensive)</span>
                    </div>

                    <input
                        type="range"
                        min="0.1"
                        max="5.0"
                        step="0.1"
                        value={isManual ? sliderVal : currentPrice}
                        onChange={handleSliderChange}
                        className={`w-full accent-orange-500 ${!isManual && 'opacity-50 grayscale cursor-pointer'}`}
                    />
                    <p className="text-xs text-neutral-500 mt-2">
                        Drag to manually set the API price. The RL Agent will be temporarily paused, letting you try to balance the economy yourself.
                    </p>
                </div>
            </div>

        </div>
    );
}
