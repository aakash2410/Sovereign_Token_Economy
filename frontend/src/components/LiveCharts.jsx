import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function LiveCharts({ data }) {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (!data) return;

        setHistory(prev => {
            const newHistory = [...prev, {
                time: prev.length,
                "Net-Contributors": data.net_contributor_tokens,
                "Balanced": data.balanced_tokens,
                "Net-Consumers": data.net_consumer_tokens / 10, // Scaled down for charting
            }];
            if (newHistory.length > 50) return newHistory.slice(newHistory.length - 50);
            return newHistory;
        });
    }, [data]);

    return (
        <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis stroke="#525252" tick={{ fill: '#737373' }} tickFormatter={(val) => `${(val / 1000).toFixed(1)}k`} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#262626', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ fontWeight: 'bold' }}
                        formatter={(value, name) => [value.toFixed(0), name === "Net-Consumers" ? "Net-Consumers (x10)" : name]}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />

                    <Line type="monotone" dataKey="Net-Contributors" stroke="#10b981" strokeWidth={3} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="Balanced" stroke="#eab308" strokeWidth={3} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="Net-Consumers" stroke="#f43f5e" strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
