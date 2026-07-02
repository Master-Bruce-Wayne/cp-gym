import React, { useState, useEffect } from 'react';
import AuthViews from './components/AuthViews';
import KpiCards from './components/KpiCards';
import RoadmapTab from './components/RoadmapTab';
import AnalyticsTab from './components/AnalyticsTab';
import RevisionTab from './components/RevisionTab';
import ActivityTab from './components/ActivityTab';
import ContestAnalyticsTab from './components/ContestAnalyticsTab';

interface VSCodeAPI {
  postMessage: (message: unknown) => void;
  getState: () => unknown;
  setState: (state: unknown) => void;
}

declare const acquireVsCodeApi: () => VSCodeAPI;
const vscode = acquireVsCodeApi();

interface TopicBlueprint {
  tag: string;
  count: number;
  required: number;
}

interface MilestoneRoadmap {
  currentDivision: string;
  nextDivision: string;
  targetRating: number;
  requiredRatingPoints: number;
}

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

interface DashboardPayload {
  handle: string;
  rating: number;
  rank: string;
  totalSubmissions: number;
  acceptedSubmissions: number;
  solvedCount: number;
  strongTopics: TopicBlueprint[];
  weakTopics: TopicBlueprint[];
  ratingDistribution: { rating: number; count: number }[];
  revisionBucket: unknown[];
  roadmap: MilestoneRoadmap;
  contestHistory?: ContestHistoryItem[];
  divisionDistribution?: Record<string, number>;
}

interface MessageEventPayload {
  command: string;
  data?: DashboardPayload;
  reason?: string;
  problems?: unknown[];
}

type TabType = "roadmap" | "analytics" | "revision" | "activity" | "contests";

export default function App() {
  const [viewMode, setViewMode] = useState<string>("login");
  const [activeTab, setActiveTab] = useState<TabType>("roadmap");
  const [handleInput, setHandleInput] = useState<string>("");
  const [cpData, setCpData] = useState<DashboardPayload | null>(null);
  const [recommendations, setRecommendations] = useState<unknown[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedRatingOffset, setSelectedRatingOffset] = useState<number | null>(null);
  const [loadingTracks, setLoadingTracks] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [expandedTopicLink, setExpandedTopicLink] = useState<string>("");

  useEffect(() => {
    // @ts-expect-error window.initialViewMode is injected dynamically inside HTML script context templates
    const initialMode = (window.initialViewMode as string) || "login";
    
    if (initialMode !== "login" && initialMode !== "switch") {
      setTimeout(() => {
        setViewMode("dashboard");
        vscode.postMessage({ command: "requestDashboardData", handle: initialMode });
      }, 0);
    } else {
      setTimeout(() => {
        setViewMode(initialMode);
      }, 0);
    }

    const handleIncomingMessage = (event: MessageEvent<MessageEventPayload>) => {
      const message = event.data;
      switch (message.command) {
        case "initData":
          if (message.data) {
            setCpData(message.data);
            setErrorMessage("");
            setViewMode("dashboard");
          }
          break;
        case "syncError":
          setErrorMessage(message.reason || "Sync processing layout error.");
          setCpData(null);
          setViewMode("switch");
          break;
        case "recommendationsResponse":
          setRecommendations(message.problems || []);
          setLoadingTracks(false);
          break;
      }
    };
    
    window.addEventListener('message', handleIncomingMessage);
    return () => window.removeEventListener('message', handleIncomingMessage);
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleInput.trim()) return;
    setErrorMessage("");
    setCpData(null);
    vscode.postMessage({ command: "saveHandle", handle: handleInput.trim() });
  };

  const fetchOffsetRecommendations = (topicName: string, offset: number) => {
    setSelectedTopic(topicName);
    setSelectedRatingOffset(offset);
    setLoadingTracks(true);
    setRecommendations([]);
    const userBaseRating = cpData?.rating || 1200;
    const computedTarget = Math.ceil((userBaseRating + offset) / 100) * 100;
    vscode.postMessage({ command: "fetchRecommendations", topic: topicName, rating: computedTarget });
  };

  const addManualRevisionItem = (prob: unknown, currentTag: string) => {
    if (!cpData) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = prob as any;
    vscode.postMessage({ 
      command: "addManualRevision", 
      handle: cpData.handle, 
      problemId: `${p.contestId as string}-${p.index as string}`, 
      name: p.name as string, 
      rating: p.rating as number, 
      tag: currentTag 
    });
  };

  const removeManualRevisionItem = (problemId: string) => {
    if (!cpData) return;
    vscode.postMessage({ command: "removeManualRevision", handle: cpData.handle, problemId });
  };

  const toggleLinkReveal = (topicName: string) => {
    setExpandedTopicLink(expandedTopicLink === topicName ? "" : topicName);
    setSelectedTopic("");
    setSelectedRatingOffset(null);
    setRecommendations([]);
  };

  if (viewMode === "login" || viewMode === "switch") {
    return (
      <AuthViews 
        viewMode={viewMode} 
        errorMessage={errorMessage} 
        handleInput={handleInput} 
        setHandleInput={setHandleInput} 
        handleLoginSubmit={handleLoginSubmit} 
      />
    );
  }

  if (!cpData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xs font-bold uppercase text-cyan-400 animate-pulse">
        Compiling Dashboard telemetry...
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto font-sans antialiased max-w-7xl space-y-7 text-slate-100">
      {/* NAVIGATION HEADER BAR */}
      <div className="flex flex-col justify-between gap-4 pb-2 border-b sm:flex-row sm:items-center border-slate-800/60">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white">CP Gym <span className="text-xl font-medium text-cyan-400">Dashboard</span></h1>
          <div className="flex flex-wrap gap-4 pl-2 text-xs font-bold tracking-wider uppercase">
            {(["roadmap", "analytics", "revision", "activity", "contests"] as const).map((tab) => {
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === tab 
                      ? "text-cyan-400 border-cyan-400 font-black" 
                      : "text-slate-500 border-transparent hover:text-slate-300"
                  }`}
                >
                  {tab === "roadmap" && "Roadmap Tracking"}
                  {tab === "analytics" && "Visual Analytics"}
                  {tab === "revision" && `Revision Basket (${cpData.revisionBucket?.length || 0})`}
                  {tab === "activity" && "🔥 Streak Tracker"}
                  {tab === "contests" && "🏆 Contest Performance"}
                </button>
              );
            })}
          </div>
        </div>
        <button onClick={() => setViewMode("switch")} className="px-4 py-1.5 text-xs font-bold border bg-slate-900 border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
          Switch Context
        </button>
      </div>

      {/* KPI METRICS CARD STRIP */}
      <KpiCards cpData={cpData} />

      {/* TAB ACTIVE SWITCH ROUTER PANELS */}
      <div className="mt-4">
        {activeTab === "roadmap" && (
          <RoadmapTab 
            cpData={cpData} 
            expandedTopicLink={expandedTopicLink} 
            toggleLinkReveal={toggleLinkReveal} 
            selectedTopic={selectedTopic} 
            selectedRatingOffset={selectedRatingOffset} 
            fetchOffsetRecommendations={fetchOffsetRecommendations} 
            loadingTracks={loadingTracks} 
            recommendations={recommendations} 
            addManualRevisionItem={addManualRevisionItem} 
          />
        )}

        {activeTab === "analytics" && <AnalyticsTab cpData={cpData} />}

        {activeTab === "revision" && (
          <RevisionTab cpData={cpData} removeManualRevisionItem={removeManualRevisionItem} />
        )}

        {activeTab === "activity" && <ActivityTab cpData={cpData} />}
        
        {activeTab === "contests" && <ContestAnalyticsTab cpData={cpData} />}
      </div>
    </div>
  );
}