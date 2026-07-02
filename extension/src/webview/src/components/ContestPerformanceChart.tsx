import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ContestPerformanceChartProps {
  contestHistory: Array<{
    contestName: string;
    solvedCount: number;
    dateStr?: string;
  }>;
}

export default function ContestPerformanceChart({ contestHistory }: ContestPerformanceChartProps) {
  const sliceData = (contestHistory || []).slice(-10);

  if (sliceData.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full text-xs italic uppercase text-slate-500">
        No active analytics parameters cached for this scope configuration.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={sliceData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="contestId" hide={true} />
        <YAxis stroke="#94a3b8" allowDecimals={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="p-3 bg-[#0f172a] border border-slate-700 rounded-lg space-y-1">
                  <p className="max-w-xs font-bold text-white">{data.contestName}</p>
                  <p className="text-slate-400 text-[10px]">📅 {data.dateStr || 'Recent'}</p>
                  <p className="mt-1 font-bold text-purple-400">Problems Solved: {data.solvedCount}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="solvedCount" name="Problems Solved" fill="#a78bfa" radius={[4, 4, 0, 0]} maxBarSize={45} />
      </BarChart>
    </ResponsiveContainer>
  );
}