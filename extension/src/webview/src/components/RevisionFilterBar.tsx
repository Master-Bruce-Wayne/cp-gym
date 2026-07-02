import React from 'react';

interface RevisionFilterBarProps {
  activeSubTab: 'REJECTED' | 'BUCKET';
  setActiveSubTab: (tab: 'REJECTED' | 'BUCKET') => void;
  rejectedCount: number;
  bucketCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  selectedRating: string;
  setSelectedRating: (rating: string) => void;
  uniqueTags: string[];
  uniqueRatings: string[];
  showToolbar: boolean;
}

export default function RevisionFilterBar({
  activeSubTab,
  setActiveSubTab,
  rejectedCount,
  bucketCount,
  searchQuery,
  setSearchQuery,
  selectedTag,
  setSelectedTag,
  selectedRating,
  setSelectedRating,
  uniqueTags = [],
  uniqueRatings = [],
  showToolbar
}: RevisionFilterBarProps) {
  
  const handleTabChange = (tab: 'REJECTED' | 'BUCKET') => {
    handleTabChangeInternal(tab);
  };

  const handleTabChangeInternal = (tab: 'REJECTED' | 'BUCKET') => {
    setActiveSubTab(tab);
    setSearchQuery('');
    setSelectedTag('ALL');
    setSelectedRating('ALL');
  };

  return (
    <div className="space-y-4">
      <div className="flex border border-slate-800/60 p-1 bg-[#0f172a]/80 rounded-xl max-w-md">
        <button
          onClick={() => handleTabChange('REJECTED')}
          className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'REJECTED' 
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
              : 'text-slate-400 hover:text-white bg-transparent'
          }`}
        >
          ❌ Rejected ({rejectedCount})
        </button>
        <button
          onClick={() => handleTabChange('BUCKET')}
          className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'BUCKET' 
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
              : 'text-slate-400 hover:text-white bg-transparent'
          }`}
        >
          📌 Added Questions ({bucketCount})
        </button>
      </div>

      <p className="text-xs text-slate-500">
        {activeSubTab === 'REJECTED' 
          ? '🎯 Auto-detected unique problem tracks where your last submission resulted in WA, TLE, or MLE.'
          : '📝 Problems that you manually bookmarked and saved into your custom training plan.'}
      </p>

      {showToolbar && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 p-4 bg-[#111622]/40 border border-slate-800/80 rounded-xl animate-fade-in">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Search Problem</label>
            <input
              type="text"
              placeholder="Type name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-[#0f172a] text-white border border-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Filter by Tag</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full text-xs bg-[#0f172a] text-white border border-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500/50 cursor-pointer"
            >
              {uniqueTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Filter by Rating</label>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full text-xs bg-[#0f172a] text-white border border-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500/50 cursor-pointer"
            >
              {uniqueRatings.map(rate => (
                <option key={rate} value={rate}>
                  {rate === 'ALL' ? 'ALL RATINGS' : `⭐ Rating: ${rate}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}