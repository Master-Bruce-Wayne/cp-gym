import React from 'react';

interface TopicMetric {
  tag: string;
  count: number;
  required: number;
}

interface RoadmapTabProps {
  cpData: {
    roadmap?: {
      requiredRatingPoints: number;
      currentDivision: string;
      nextDivision: string;
      targetRating: number;
    };
    rank?: string;
    rating?: number;
    weakTopics?: TopicMetric[];
    strongTopics?: TopicMetric[];
  };
  expandedTopicLink: string;
  toggleLinkReveal: (tag: string) => void;
  selectedTopic: string;
  selectedRatingOffset: number | null;
  fetchOffsetRecommendations: (tag: string, offset: number) => void;
  loadingTracks: boolean;
  recommendations: any[];
  addManualRevisionItem: (prob: any, tag: string) => void;
}

export default function RoadmapTab({
  cpData, expandedTopicLink, toggleLinkReveal, selectedTopic,
  selectedRatingOffset, fetchOffsetRecommendations, loadingTracks,
  recommendations = [], addManualRevisionItem
}: RoadmapTabProps) {
  const ratingOffsets = [100, 200, 300, 400];

  return (
    <div className="space-y-7 animate-fade-in">
      {/* ROADMAP PROGRESS BAR */}
      {cpData?.roadmap && (
        <div className="p-6 border bg-[#131926]/20 border-slate-800/90 rounded-xl space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold tracking-wide text-md text-slate-200">Division Roadmap Progression</h2>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                Current Status: <span className="font-bold capitalize text-cyan-400">{cpData.rank}</span> 
                <span className="text-slate-600">({cpData.rating} Rating)</span>
              </div>
            </div>
            {cpData.roadmap.requiredRatingPoints > 0 ? (
              <div className="px-3 py-1 text-xs font-bold border rounded-full bg-rose-500/10 border-rose-500/20 text-rose-400">
                🎯 {cpData.roadmap.requiredRatingPoints} points to target
              </div>
            ) : (
              <div className="px-3 py-1 text-xs font-bold border rounded-full bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                🏆 Top Tier Maxed Out
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pb-1 text-xs font-black tracking-widest uppercase text-slate-400">
            <div className="text-cyan-400 bg-cyan-500/5 border border-cyan-500/10 px-3 py-1.5 rounded-lg font-bold">
              {cpData.roadmap.currentDivision || "Newbie"}
            </div>
            <div className="font-light text-slate-600">➔</div>
            <div className="text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1.5 rounded-lg font-bold">
              {cpData.roadmap.nextDivision || "Pupil"} <span className="text-[10px] text-slate-500 font-mono font-normal">({cpData.roadmap.targetRating})</span>
            </div>
          </div>

          <div className="relative w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
            {(() => {
              const current = cpData.rating || 0;
              const target = cpData.roadmap.targetRating || 1200;
              let floor = 0;
              if (target === 1400) floor = 1200;
              if (target === 1600) floor = 1400;
              if (target === 1900) floor = 1600;
              if (target === 2400) floor = 1900;
              
              const totalBracketRange = target - floor;
              const pointsEarnedInBracket = current - floor;
              const cleanPercentage = totalBracketRange > 0 ? Math.min(100, Math.max(5, (pointsEarnedInBracket / totalBracketRange) * 100)) : 100;
              return <div className="h-full transition-all duration-1000 ease-out rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${cleanPercentage}%` }} />;
            })()}
          </div>
        </div>
      )}

      {/* TABLES COLUMNS PANEL */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* WEAK TOPICS */}
        <div className="space-y-4">
          <h3 className="text-sm font-black tracking-wider text-amber-500 uppercase flex items-center gap-1.5">⚠️ Practice Target (Weak Topics)</h3>
          <div className="space-y-3">
            {cpData?.weakTopics?.map((item: TopicMetric) => (
              <div key={item.tag} className="p-4 border bg-[#111622]/60 border-slate-800/80 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold tracking-wide capitalize text-slate-200">{item.tag}</span>
                  <span className="text-xs px-2 py-0.5 font-bold rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono">{item.count}/{item.required} solved</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full transition-all duration-300 bg-amber-500/80" style={{ width: `${Math.min(100, (item.count / item.required) * 100)}%` }} />
                </div>
                <div className="pt-0.5">
                  <button onClick={() => toggleLinkReveal(item.tag)} className="block text-xs font-bold underline transition-all text-cyan-400 hover:text-cyan-300 underline-offset-2">
                    {expandedTopicLink === item.tag ? "Collapse panel options ▲" : "Click below to solve new problems →"}
                  </button>
                </div>

                {expandedTopicLink === item.tag && (
                  <div className="pt-3 mt-3 space-y-3 border-t border-slate-800/80 animate-fade-in">
                    <div className="flex flex-wrap gap-2">
                      {ratingOffsets.map((offset) => (
                        <button
                          key={offset}
                          onClick={() => fetchOffsetRecommendations(item.tag, offset)}
                          className={`px-2.5 py-1 text-xs font-bold rounded transition-all tracking-wide ${selectedTopic === item.tag && selectedRatingOffset === offset ? "bg-amber-500 text-slate-950 font-black scale-105" : "bg-slate-900/90 text-slate-400 border border-slate-800/80"}`}
                        >
                          +{offset} ({Math.ceil(((cpData?.rating || 1200) + offset) / 100) * 100})
                        </button>
                      ))}
                    </div>

                    {selectedTopic === item.tag && (
                      <div className="pt-3 mt-3 space-y-2 border-t border-slate-800/40">
                        {loadingTracks ? (
                          <div className="py-2 text-[11px] uppercase tracking-widest font-bold text-slate-500 animate-pulse">Loading problems...</div>
                        ) : recommendations.length === 0 ? (
                          <p className="py-1 text-xs text-rose-400">No problems found for this offset criteria.</p>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {recommendations.map((prob) => (
                              <div key={`${prob.contestId}-${prob.index}`} className="flex items-center justify-between p-2 text-xs border rounded-lg bg-slate-950 border-slate-800/40 text-slate-300">
                                <a href={`https://codeforces.com/problemset/problem/${prob.contestId}/${prob.index}`} target="_blank" rel="noreferrer" className="flex-1 pr-2 truncate hover:text-cyan-400">
                                  <strong className="pr-1 font-mono text-slate-600">[{prob.contestId}{prob.index}]</strong> {prob.name}
                                </a>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-amber-500 font-mono bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10 font-bold">{prob.rating}</span>
                                  <button onClick={() => addManualRevisionItem(prob, item.tag)} className="text-slate-500 hover:text-cyan-400">📌</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* STRONG TOPICS */}
        <div className="space-y-4">
          <h3 className="text-sm font-black tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">🏆 Strength Profile (Strong Topics)</h3>
          <div className="space-y-3">
            {cpData?.strongTopics?.map((item: TopicMetric) => (
              <div key={item.tag} className="p-4 border bg-[#111622]/60 border-slate-800/80 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold tracking-wide capitalize text-slate-200">{item.tag}</span>
                  <span className="text-xs px-2 py-0.5 font-bold rounded bg-emerald-500/10 text-emerald-400 font-mono">{item.count} solved</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: "100%" }} />
                </div>
                <div className="pt-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-600 bg-slate-900/50 px-2 py-0.5 rounded border border-slate-800/40">Proficiency Mastered</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}