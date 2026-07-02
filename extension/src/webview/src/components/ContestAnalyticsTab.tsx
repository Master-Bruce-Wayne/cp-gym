import React, { useState, useMemo } from 'react';
import RatingHistoryChart from './RatingHistoryChart';
import ContestPerformanceChart from './ContestPerformanceChart';
import DivSolveBreakdown from './DivSolveBreakdown';

interface ContestHistoryItem {
  contestId: number;
  contestName: string;
  rank: number;
  oldRating: number;
  newRating: number;
  solvedCount: number;
  problemsAvailable: number;
  division: 'Div. 1' | 'Div. 2' | 'Div. 3' | 'Div. 4' | 'Educational' | 'Global' | 'Other';
}

interface ContestAnalyticsTabProps {
  cpData: {
    contestHistory?: ContestHistoryItem[];
    divisionDistribution?: Record<string, number>;
  };
}

export type ScopeFilter = 'ALL' | 'DIV1' | 'DIV2' | 'DIV3' | 'DIV4';

export default function ContestAnalyticsTab({ cpData }: ContestAnalyticsTabProps) {
  const contestHistory = cpData?.contestHistory || [];
  const divisionDistribution = cpData?.divisionDistribution || { 'Div. 1': 0, 'Div. 2': 0, 'Div. 3': 0, 'Div. 4': 0 };

  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('ALL');

  // Filter contest logs based on Division patterns
  const filteredContests = useMemo(() => {
    return contestHistory.filter((c) => {
      if (scopeFilter === 'DIV1') return c.division === 'Div. 1';
      if (scopeFilter === 'DIV2') return c.division === 'Div. 2';
      if (scopeFilter === 'DIV3') return c.division === 'Div. 3';
      if (scopeFilter === 'DIV4') return c.division === 'Div. 4';
      return true;
    });
  }, [contestHistory, scopeFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Scope Filtering Context Bar */}
      <div className="flex flex-col gap-3 pb-4 border-b sm:flex-row sm:items-center sm:justify-between border-slate-800/60">
        <div>
          <h2 className="text-base font-black tracking-wider uppercase text-cyan-400">
            🏆 Contest Performance Core Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Evaluate historical rating progression patterns and runtime contest execution.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Scope Division:</label>
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value as ScopeFilter)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 border border-slate-800 text-slate-300 outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL">All Match Histories</option>
            <option value="DIV1">Div. 1 Only</option>
            <option value="DIV2">Div. 2 Only</option>
            <option value="DIV3">Div. 3 Only</option>
            <option value="DIV4">Div. 4 Only</option>
          </select>
        </div>
      </div>

      {/* Top Section: Rating Graph Mapping */}
      <div className="p-5 border bg-[#111622]/60 border-slate-800/80 rounded-xl space-y-4">
        <h3 className="text-sm font-black tracking-wider text-purple-400 uppercase">📈 Codeforces Rating Progression History</h3>
        <div className="w-full h-72">
          <RatingHistoryChart contestHistory={filteredContests} />
        </div>
      </div>

      {/* Bottom Section: Performance bars and Div metric rings */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="p-5 border bg-[#111622]/60 border-slate-800/80 rounded-xl space-y-4 lg:col-span-2">
          <h3 className="text-sm font-black tracking-wider uppercase text-cyan-400">📊 Performance Volume (Last 10 Matches)</h3>
          <div className="w-full h-64">
            <ContestPerformanceChart contestHistory={filteredContests} />
          </div>
        </div>

        <div className="p-5 border bg-[#111622]/60 border-slate-800/80 rounded-xl space-y-4">
          <h3 className="text-sm font-black tracking-wider uppercase text-emerald-400">🎯 Division Solve Index</h3>
          <DivSolveBreakdown divisionDistribution={divisionDistribution} />
        </div>
      </div>
    </div>
  );
}