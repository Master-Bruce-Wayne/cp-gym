import React, { useState, useMemo } from 'react';
import RevisionFilterBar from './RevisionFilterBar';

interface RevisionItem {
  problemId: string;
  name: string;
  rating: number;
  tag: string;
  status: "failed" | "bookmark";
  addedAt: string;
}

interface RevisionTabProps {
  cpData: {
    revisionBucket?: RevisionItem[];
  };
  removeManualRevisionItem: (problemId: string) => void;
}

export default function RevisionTab({ cpData, removeManualRevisionItem }: RevisionTabProps) {
  const bucket = cpData?.revisionBucket || [];

  const [activeSubTab, setActiveSubTab] = useState<'REJECTED' | 'BUCKET'>('REJECTED');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [selectedRating, setSelectedRating] = useState('ALL');

  const { rejectedProblems, bucketList } = useMemo(() => {
    const rejectedMap = new Map<string, RevisionItem>();
    const bucketItems: RevisionItem[] = [];

    bucket.forEach(item => {
      if (item.status === 'failed') {
        if (!rejectedMap.has(item.problemId)) {
          rejectedMap.set(item.problemId, item);
        }
      } else if (item.status === 'bookmark') {
        bucketItems.push(item);
      }
    });

    return {
      rejectedProblems: Array.from(rejectedMap.values()),
      bucketList: bucketItems
    };
  }, [bucket]);

  const activePool = activeSubTab === 'REJECTED' ? rejectedProblems : bucketList;

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    activePool.forEach(item => {
      if (item.tag) tags.add(item.tag.toUpperCase());
    });
    return ['ALL', ...Array.from(tags)];
  }, [activePool]);

  const uniqueRatings = useMemo(() => {
    const ratings = new Set<number>();
    activePool.forEach(item => {
      if (item.rating) ratings.add(item.rating);
    });
    return ['ALL', ...Array.from(ratings).sort((a, b) => a - b).map(String)];
  }, [activePool]);

  const filteredItems = useMemo(() => {
    let result = [...activePool];

    if (searchQuery.trim() !== '') {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.problemId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedTag !== 'ALL') {
      result = result.filter(item => item.tag?.toUpperCase() === selectedTag);
    }

    if (selectedRating !== 'ALL') {
      result = result.filter(item => String(item.rating) === selectedRating);
    }

    return result;
  }, [activePool, searchQuery, selectedTag, selectedRating]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 pb-4 border-b sm:flex-row sm:items-center sm:justify-between border-slate-800/60">
        <div>
          <h2 className="text-base font-black tracking-wider text-purple-400 uppercase">
            📥 CP Gym Revision Basket
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Review and manage your custom targets and submission blockades.</p>
        </div>
        <span className="self-start px-3 py-1 text-xs font-bold border rounded-full bg-slate-800 text-slate-400 border-slate-700/50">
          {bucket.length} Tasks Total
        </span>
      </div>

      <RevisionFilterBar
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        rejectedCount={rejectedProblems.length}
        bucketCount={bucketList.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        selectedRating={selectedRating}
        setSelectedRating={setSelectedRating}
        uniqueTags={uniqueTags}
        uniqueRatings={uniqueRatings}
        showToolbar={activePool.length > 0}
      />

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const problemUrl = item.problemId.includes('-')
              ? `https://codeforces.com/contest/${item.problemId.split('-')[0]}/problem/${item.problemId.split('-')[1]}`
              : '#';

            return (
              <div 
                key={item.problemId} 
                className={`p-4 border bg-[#111622]/60 rounded-xl flex flex-col justify-between gap-4 group transition-all duration-200 ${
                  activeSubTab === 'REJECTED' 
                    ? 'border-rose-950/60 hover:border-rose-500/40' 
                    : 'border-slate-800/80 hover:border-purple-500/40'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <a 
                      href={problemUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm font-bold text-white transition-colors hover:text-purple-400 hover:underline line-clamp-1"
                    >
                      {item.name}
                    </a>
                    {item.rating > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-black rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                        {item.rating}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 items-center">
                    {item.tag && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 uppercase tracking-wider">
                        🏷️ {item.tag}
                      </span>
                    )}
                    
                    {activeSubTab === 'REJECTED' ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-950/50 text-rose-400 border border-rose-900/30 uppercase tracking-widest">
                        ⚠️ REJECTED
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950/40 text-blue-400 border border-blue-900/20 uppercase tracking-wider">
                        📌 PINNED TARGET
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                      {activeSubTab === 'REJECTED' ? 'Date Detected' : 'Date Pinned'}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  
                  {activeSubTab === 'BUCKET' && (
                    <button 
                      onClick={() => removeManualRevisionItem(item.problemId)} 
                      className="text-xs font-black tracking-wider uppercase transition-colors cursor-pointer text-slate-500 hover:text-rose-400"
                    >
                      Clear Target
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center border-2 border-dashed border-slate-800/60 rounded-xl">
          <p className="text-sm font-bold tracking-wide uppercase text-slate-400">No items found</p>
          <p className="max-w-xs text-xs text-slate-500">
            {activeSubTab === 'REJECTED' 
              ? 'Awesome! You have zero pending auto-scraped submission errors.'
              : 'Your custom added questions track list is currently empty.'}
          </p>
        </div>
      )}
    </div>
  );
}