import React from 'react';

interface DivSolveBreakdownProps {
  divisionDistribution: Record<string, number>;
}

export default function DivSolveBreakdown({ divisionDistribution }: DivSolveBreakdownProps) {
  const divisions = [
    { name: 'Div. 1', color: 'border-rose-500/20 text-rose-400 bg-rose-500/5' },
    { name: 'Div. 2', color: 'border-purple-500/20 text-purple-400 bg-purple-500/5' },
    { name: 'Div. 3', color: 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5' },
    { name: 'Div. 4', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' },
  ];

  return (
    <div className="pt-1 space-y-3">
      {divisions.map((div) => {
        const solveCount = divisionDistribution[div.name] || 0;
        return (
          <div
            key={div.name}
            className={`flex items-center justify-between p-3 border rounded-xl transition-all hover:scale-[1.02] ${div.color}`}
          >
            <div>
              <span className="text-xs font-black tracking-wide uppercase">{div.name} Context</span>
              <p className="text-[10px] opacity-60 font-semibold mt-0.5">Cumulative Contest Problems Solved</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black tracking-tight">{solveCount}</span>
              <span className="text-[10px] font-bold block opacity-70">Solved</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}