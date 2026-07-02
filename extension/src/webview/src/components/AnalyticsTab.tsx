import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TopicBlueprint {
  tag: string;
  count: number;
  required: number;
}

interface AnalyticsTabProps {
  cpData: {
    strongTopics?: TopicBlueprint[];
    weakTopics?: TopicBlueprint[];
    ratingDistribution?: { rating: number; count: number }[];
  };
}

interface PieItem {
  name: string;
  value: number;
}

export default function AnalyticsTab({ cpData }: AnalyticsTabProps) {
  const topicsPieData: PieItem[] = [
    ...(cpData?.strongTopics || []),
    ...(cpData?.weakTopics || [])
  ].map(t => ({ 
    name: t.tag.charAt(0).toUpperCase() + t.tag.slice(1), 
    value: t.count 
  })).filter(t => t.value > 0);

  const PIE_COLORS = ["#22d3ee", "#06b6d4", "#0ea5e9", "#38bdf8", "#0284c7", "#3b82f6", "#1d4ed8", "#a78bfa", "#f43f5e", "#fb7185"];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-fade-in">
      {/* PIE CHART */}
      <div className="p-5 border bg-[#111622]/60 border-slate-800/80 rounded-xl space-y-4 flex flex-col justify-between">
        <h3 className="text-sm font-black tracking-wider uppercase text-cyan-400">🍕 Topic Focus Ratio Breakdown</h3>
        <div className="flex items-center justify-center w-full font-sans text-xs h-80">
          {topicsPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={topicsPieData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={95} 
                  paddingAngle={3} 
                  dataKey="value" 
                  label={(props: any) => {
                    const labelName = props.name || "General";
                    const percentageValue = ((props.percent ?? 0) * 100).toFixed(0);
                    return `${labelName} (${percentageValue}%)`;
                  }}
                >
                  {topicsPieData.map((_entry: PieItem, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} 
                  formatter={(value: unknown) => [`${String(value)} Problems`, 'Volume'] as [string, string]} 
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-xs italic tracking-wider uppercase text-slate-500">No active problem logs tracked yet.</div>
          )}
        </div>
      </div>

      {/* HISTOGRAM BAR CHART */}
      <div className="p-5 border bg-[#111622]/60 border-slate-800/80 rounded-xl space-y-4">
        <h3 className="text-sm font-black tracking-wider text-purple-400 uppercase">📊 Difficulty Standing Distribution</h3>
        <div className="flex items-center justify-center w-full font-sans text-xs h-80">
          {cpData?.ratingDistribution && cpData.ratingDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cpData.ratingDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="rating" stroke="#94a3b8" style={{ fontWeight: 'bold' }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} itemStyle={{ color: '#a78bfa' }} />
                <Bar dataKey="count" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-xs italic tracking-wider uppercase text-slate-500">No distribution logs cached yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}