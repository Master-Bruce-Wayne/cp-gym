import React from 'react';

interface MonthSelectorProps {
  availableMonths: string[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}

export default function MonthSelector({ availableMonths = [], selectedMonth, setSelectedMonth }: MonthSelectorProps) {
  const formatMonthLabel = (monthStr: string) => {
    if (!monthStr || !monthStr.includes('-')) return monthStr;
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/60 pb-3">
      <div>
        <label className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">
          Target Scope Frame
        </label>
        <span className="text-xs text-slate-500">Pick a calendar month to isolate analytics profiles.</span>
      </div>
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 border border-slate-800 text-slate-300 outline-none focus:border-cyan-500 cursor-pointer"
      >
        {availableMonths.map((m) => (
          <option key={m} value={m}>
            📅 {formatMonthLabel(m)}
          </option>
        ))}
      </select>
    </div>
  );
}