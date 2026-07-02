import React, { useState, useMemo } from 'react';

interface SolveItem {
  rating: number;
  tag: string;
}

interface ActivityBreakdownChartsProps {
  monthlySolves: SolveItem[];
}

export default function ActivityBreakdownCharts({ monthlySolves = [] }: ActivityBreakdownChartsProps) {
  const [metricMode, setMetricMode] = useState<'RATINGS' | 'TAGS'>('RATINGS');

  const { ratingData, tagData } = useMemo(() => {
    const ratings: Record<number, number> = {};
    const tags: Record<string, number> = {};

    monthlySolves.forEach((item) => {
      if (item.rating > 0) ratings[item.rating] = (ratings[item.rating] || 0) + 1;
      if (item.tag) tags[item.tag] = (tags[item.tag] || 0) + 1;
    });

    const formattedRatings = Object.keys(ratings)
      .map((r) => ({ key: r, count: ratings[Number(r)] }))
      .sort((a, b) => Number(a.key) - Number(b.key));

    const formattedTags = Object.keys(tags)
      .map((t) => ({ key: t.toUpperCase(), count: tags[t] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return { ratingData: formattedRatings, tagData: formattedTags };
  }, [monthlySolves]);

  const activeMetricsList = metricMode === 'RATINGS' ? ratingData : tagData;
  const peakVolumeMax = Math.max(...activeMetricsList.map((d) => d.count), 1);

  return (
    <div className="p-4 border border-slate-800 rounded-xl bg-[#111622]/40 space-y-4">
      <div className="flex gap-4 pb-2 border-b border-slate-800">
        <button
          onClick={() => setMetricMode('RATINGS')}
          className={`text-xs font-black uppercase tracking-wider pb-1 transition-all cursor-pointer ${
            metricMode === 'RATINGS' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'
          }`}
        >
          📊 Rating Distribution
        </button>
        <button
          onClick={() => setMetricMode('TAGS')}
          className={`text-xs font-black uppercase tracking-wider pb-1 transition-all cursor-pointer ${
            metricMode === 'TAGS' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'
          }`}
        >
          🏷️ Tag Profile Analysis
        </button>
      </div>

      {activeMetricsList.length > 0 ? (
        <div className="space-y-3">
          {activeMetricsList.map((row) => {
            const fillWidthPercent = Math.round((row.count / peakVolumeMax) * 100);
            return (
              <div key={row.key} className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  <span>{metricMode === 'RATINGS' ? `Rating ${row.key}` : row.key}</span>
                  <span className="text-white">{row.count} Solved</span>
                </div>
                <div className="w-full h-2 overflow-hidden border rounded-full bg-slate-900 border-slate-800/40">
                  <div
                    style={{ width: `${fillWidthPercent}%` }}
                    className="h-full transition-all duration-500 bg-gradient-to-r from-purple-600 to-cyan-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="py-4 text-xs text-center text-slate-500">No data matches available for this month.</p>
      )}
    </div>
  );
}