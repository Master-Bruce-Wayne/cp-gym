import React from 'react';

interface StreakMetricsCardProps {
  currentStreak: number;
  maxStreak: number;
  hasSolvedToday: boolean;
}

export default function StreakMetricsCard({ currentStreak = 0, maxStreak = 0, hasSolvedToday }: StreakMetricsCardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="flex items-center justify-between p-4 border rounded-xl border-orange-500/20 bg-gradient-to-br from-orange-950/20 to-transparent">
        <div>
          <span className="block text-[10px] font-black tracking-wider uppercase text-orange-400">Current Streak</span>
          <h3 className="flex items-baseline gap-1 mt-1 text-2xl font-black text-white">
            🔥 {currentStreak} <span className="text-xs font-bold text-slate-500">Days</span>
          </h3>
        </div>
        <div className="flex items-center justify-center w-10 h-10 text-xl rounded-lg bg-orange-500/10 animate-pulse">⚡</div>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-xl border-purple-500/20 bg-gradient-to-br from-purple-950/20 to-transparent">
        <div>
          <span className="block text-[10px] font-black tracking-wider uppercase text-purple-400">All-Time Peak</span>
          <h3 className="flex items-baseline gap-1 mt-1 text-2xl font-black text-white">
            👑 {maxStreak} <span className="text-xs font-bold text-slate-500">Days</span>
          </h3>
        </div>
        <div className="flex items-center justify-center w-10 h-10 text-xl rounded-lg bg-purple-500/10">🏆</div>
      </div>

      <div className={`p-4 rounded-xl border flex items-center justify-between ${
        hasSolvedToday ? 'border-emerald-500/20 bg-emerald-950/10' : 'border-rose-500/20 bg-rose-950/10'
      }`}>
        <div>
          <span className="block text-[10px] font-black tracking-wider uppercase text-slate-400">Today's Guard Status</span>
          <p className={`text-xs font-black uppercase tracking-wider mt-2 ${hasSolvedToday ? 'text-emerald-400' : 'text-rose-400'}`}>
            {hasSolvedToday ? '✅ Streak Secured!' : '⚠️ Action Required!'}
          </p>
        </div>
        <span className="text-xs font-medium text-slate-500 max-w-[120px] text-right">
          {hasSolvedToday ? 'Great job! Rest up for tomorrow.' : 'Solve 1 target problem to extend.'}
        </span>
      </div>
    </div>
  );
}