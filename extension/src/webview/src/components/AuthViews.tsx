import React from 'react';

interface AuthViewsProps {
  viewMode: string;
  errorMessage: string;
  handleInput: string;
  setHandleInput: (val: string) => void;
  handleLoginSubmit: (e: React.FormEvent) => void;
}

export default function AuthViews({
  viewMode,
  errorMessage,
  handleInput,
  setHandleInput,
  handleLoginSubmit
}: AuthViewsProps) {
  if (viewMode === "login") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 font-sans text-slate-200">
        <div className="w-full max-w-md p-8 space-y-6 border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-black tracking-wide text-cyan-400">Welcome to CP Gym</h1>
            <p className="text-xs font-semibold tracking-widest uppercase text-slate-400">
              Enter Codeforces Handle to Sync Profile
            </p>
          </div>
          {errorMessage && (
            <div className="p-3 text-xs font-semibold text-center border bg-rose-500/10 text-rose-400 border-rose-500/20 rounded-xl">
              ❌ {errorMessage}
            </div>
          )}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <input 
              type="text"
              placeholder="Enter Codeforces Handle..."
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value)}
              className="w-full px-4 py-3 font-medium text-center text-white transition-all border bg-slate-950 border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500 placeholder-slate-600"
            />
            <button type="submit" className="w-full py-3 text-sm font-bold tracking-wide uppercase transition-all shadow-lg bg-cyan-500 hover:bg-cyan-600 text-slate-950 rounded-xl shadow-cyan-500/10">
              Analyze Profile Metrics →
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 font-sans text-slate-200">
      <div className="w-full max-w-md p-8 space-y-6 border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-black tracking-wide text-white">Switch to Another Account</h1>
          <p className="text-xs font-medium text-slate-500">
            Enter a different Codeforces username handle below to recalculate analytics configurations.
          </p>
        </div>
        {errorMessage && (
          <div className="p-3 text-xs font-semibold text-center border bg-rose-500/10 text-rose-400 border-rose-500/20 rounded-xl">
            ❌ {errorMessage}
          </div>
        )}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block pl-1">Codeforces Handle</label>
            <input 
              type="text"
              placeholder="Enter New Codeforces Handle..."
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value)}
              className="w-full px-4 py-3 text-sm font-medium text-white transition-all border bg-slate-950 border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 placeholder-slate-700"
            />
          </div>
          <button type="submit" className="w-full py-3 text-sm font-bold tracking-wide text-white transition-all bg-blue-500 shadow-lg hover:bg-blue-600 rounded-xl shadow-blue-500/10">
            Switch Context
          </button>
        </form>
      </div>
    </div>
  );
}