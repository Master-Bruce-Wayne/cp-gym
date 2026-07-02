import React from 'react';

interface KpiCardsProps {
  cpData: {
    totalSubmissions?: number;
    acceptedSubmissions?: number;
    handle?: string;
    solvedCount?: number;
  };
}

export default function KpiCards({ cpData }: KpiCardsProps) {
  const totalSubmissions = cpData?.totalSubmissions || 0;
  const acceptedSubmissions = cpData?.acceptedSubmissions || 0;
  
  const acceptanceRate = totalSubmissions > 0 
    ? Math.round((acceptedSubmissions / totalSubmissions) * 100) 
    : 0;

  const cardsBlueprint = [
    { label: "Codeforces Handle", value: cpData?.handle || 'N/A', color: "text-cyan-400 truncate" },
    { label: "Total Submissions", value: totalSubmissions, color: "text-slate-200" },
    { label: "Unique Solved", value: cpData?.solvedCount || 0, color: "text-emerald-400" },
    { label: "Acceptance Rate", value: `${acceptanceRate}%`, color: "text-purple-400" }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cardsBlueprint.map((card, idx) => (
        <div key={idx} className="p-5 border bg-[#131926]/40 border-slate-800/80 rounded-xl">
          <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{card.label}</p>
          <p className={`text-xl font-black tracking-tight mt-1 ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}