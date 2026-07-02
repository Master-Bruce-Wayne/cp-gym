import React, { useMemo } from 'react';

interface SolveItem {
  solvedDate: string;
}

interface ActivityHeatmapProps {
  selectedMonth: string;
  monthlySolves: SolveItem[];
}

export default function ActivityHeatmap({ selectedMonth, monthlySolves = [] }: ActivityHeatmapProps) {
  const solvesMap = useMemo(() => {
    const map: Record<string, number> = {};
    monthlySolves.forEach((item) => {
      if (item.solvedDate) {
        map[item.solvedDate] = (map[item.solvedDate] || 0) + 1;
      }
    });
    return map;
  }, [monthlySolves]);

  const { gridDays, monthLabel } = useMemo(() => {
    if (!selectedMonth) return { gridDays: [], monthLabel: '' };
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    const daysArr = [];
    const label = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' });

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dayStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      daysArr.push({
        dateStr: dayStr,
        dayNum: d,
        count: solvesMap[dayStr] || 0,
      });
    }

    return { gridDays: daysArr, monthLabel: label };
  }, [selectedMonth, solvesMap]);

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-slate-900 border-slate-800/40 text-slate-600';
    if (count <= 2) return 'bg-purple-900/40 border-purple-800/50 text-purple-300';
    if (count <= 4) return 'bg-purple-800/70 border-purple-700 text-purple-200';
    return 'bg-purple-600 border-purple-500 text-white font-black';
  };

  return (
    <div className="p-4 border border-slate-800 rounded-xl bg-[#111622]/40 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
        <h3 className="text-[11px] font-black tracking-wider uppercase text-slate-400">
          📆 {monthLabel} Activity Grid Matrix
        </h3>
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded bg-slate-900 border border-slate-800/60" />
          <div className="w-2.5 h-2.5 rounded bg-purple-900/40 border border-purple-800/50" />
          <div className="w-2.5 h-2.5 rounded bg-purple-800/70 border border-purple-700" />
          <div className="w-2.5 h-2.5 rounded bg-purple-600 border border-purple-500" />
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => (
          <span key={w} className="text-center text-[9px] font-black text-slate-600 uppercase tracking-wider">
            {w}
          </span>
        ))}

        {gridDays.map((day) => (
          <div
            key={day.dateStr}
            title={`${day.dateStr}: ${day.count} Solved`}
            className={`aspect-square rounded-lg border flex flex-col items-center justify-center relative p-1 transition-all hover:scale-105 cursor-help ${getIntensityClass(
              day.count
            )}`}
          >
            <span className="text-[10px] font-bold">{day.dayNum}</span>
            {day.count > 0 && (
              <span className="absolute bottom-0.5 text-[8px] opacity-80 scale-90 font-black">+{day.count}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}