import React, { useState, useMemo } from 'react';
import StreakMetricsCard from './StreakMetricsCard';
import MonthSelector from './MonthSelector';
import ActivityHeatmap from './ActivityHeatmap';
import ActivityBreakdownCharts from './ActivityBreakdownCharts';

interface SolveItem {
  problemId: string;
  name: string;
  rating: number;
  tag: string;
  solvedDate: string;
}

interface ActivityTabProps {
  cpData: {
    currentStreak?: number;
    maxStreak?: number;
    dailySolves?: SolveItem[];
  };
}

export default function ActivityTab({ cpData }: ActivityTabProps) {
  const currentStreak = cpData?.currentStreak || 0;
  const maxStreak = cpData?.maxStreak || 0;
  const dailySolves = cpData?.dailySolves || [];

  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    dailySolves.forEach((item) => {
      if (item.solvedDate) {
        monthsSet.add(item.solvedDate.substring(0, 7));
      }
    });

    const sortedMonths = Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
    if (sortedMonths.length === 0) {
      sortedMonths.push(new Date().toISOString().substring(0, 7));
    }
    return sortedMonths;
  }, [dailySolves]);

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] || new Date().toISOString().substring(0, 7));

  const monthlySolvesFiltered = useMemo(() => {
    return dailySolves.filter((item) => item.solvedDate && item.solvedDate.startsWith(selectedMonth));
  }, [dailySolves, selectedMonth]);

  const todayStr = new Date().toISOString().split('T')[0];
  const hasSolvedToday = dailySolves.some((item) => item.solvedDate === todayStr);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-base font-black tracking-wider text-purple-400 uppercase">
          🔥 Consistency & Velocity Tracker
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Monitor your submission streaks and review daily execution charts.</p>
      </div>

      <StreakMetricsCard currentStreak={currentStreak} maxStreak={maxStreak} hasSolvedToday={hasSolvedToday} />

      <MonthSelector
        availableMonths={availableMonths}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ActivityHeatmap selectedMonth={selectedMonth} monthlySolves={monthlySolvesFiltered} />
        <ActivityBreakdownCharts monthlySolves={monthlySolvesFiltered} />
      </div>
    </div>
  );
}