import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface RatingHistoryChartProps {
  contestHistory: Array<{
    contestName: string;
    newRating: number;
    dateStr?: string;
  }>;
}

export default function RatingHistoryChart({ contestHistory }: RatingHistoryChartProps) {
  if (!contestHistory || contestHistory.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full text-xs italic uppercase text-slate-500">
        No rated contest records tracked for this division slice.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={contestHistory} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="contestId" hide={true} />
        <YAxis stroke="#94a3b8" domain={['dataMin - 100', 'dataMax + 100']} style={{ fontSize: '10px', fontWeight: 'bold' }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="p-3 bg-[#0f172a] border border-slate-700 rounded-lg space-y-1">
                  <p className="max-w-xs font-bold text-white">{data.contestName}</p>
                  <p className="text-slate-400 text-[10px]">📅 {data.dateStr || 'Recent'}</p>
                  <p className="mt-1 font-bold text-cyan-400">Rating: {data.newRating}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="newRating"
          name="Rating"
          stroke="#22d3ee"
          strokeWidth={3}
          activeDot={{ r: 6, stroke: '#0f172a', strokeWidth: 2 }}
          dot={{ r: 3, stroke: '#22d3ee', strokeWidth: 1, fill: '#0f172a' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}