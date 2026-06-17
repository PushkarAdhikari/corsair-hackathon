"use client";

import React from "react";

interface SettingsApiViewProps {
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
  gmailConnected: boolean;
  setGmailConnected: (val: boolean) => void;
  calendarConnected: boolean;
  setCalendarConnected: (val: boolean) => void;
  gmailClientId: string;
  setGmailClientId: (val: string) => void;
  gmailClientSecret: string;
  setGmailClientSecret: (val: string) => void;
  calendarClientId: string;
  setCalendarClientId: (val: string) => void;
  calendarClientSecret: string;
  setCalendarClientSecret: (val: string) => void;
  showToast: (message: string, type: "success" | "error") => void;
}

export function SettingsApiView({
  isSandboxMode,
  setIsSandboxMode,
  gmailConnected,
  setGmailConnected,
  calendarConnected,
  setCalendarConnected,
  gmailClientId,
  setGmailClientId,
  gmailClientSecret,
  setGmailClientSecret,
  calendarClientId,
  setCalendarClientId,
  calendarClientSecret,
  setCalendarClientSecret,
  showToast,
}: SettingsApiViewProps) {
  return (
    <div className="p-8 max-w-4xl w-full mx-auto space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-white/[0.05]">
        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white tracking-wider">System Settings</h2>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">Configure credentials and sync rules for Google Integrations.</p>
        </div>
      </div>

      {/* Execution Mode Card */}
      <div className="bg-[#0c0c0f] border border-white/[0.06] rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-black/20">
        <div className="max-w-xl space-y-1.5">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Execution Mode</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
            Sandbox mode runs inside a local mock engine pre-populated with realistic hackathon context. Live Sync pulls and updates items directly on Google APIs using your credentials.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsSandboxMode(!isSandboxMode);
            showToast(
              !isSandboxMode 
                ? "Switched to Sandbox Demo Mode!"
                : "Switched to Live Sync Mode! APIs will pull fresh live credentials.", 
              "success"
            );
          }}
          className="px-4 py-2 rounded-xl border text-[11px] font-semibold tracking-wide flex items-center gap-2.5 transition-all duration-200 ease-in-out select-none active:scale-[0.98] cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.06] hover:border-white/[0.1] text-slate-300"
        >
          {/* Toggle Pill Icon */}
          <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${isSandboxMode ? "bg-indigo-600" : "bg-slate-700"}`}>
            <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${isSandboxMode ? "translate-x-3.5" : "translate-x-0"}`} />
          </div>
          <span>{isSandboxMode ? "Sandbox Demo Mode" : "Live Sync Mode"}</span>
        </button>
      </div>

      {/* API Setups side-by-side */}
      <div className="grid grid-cols-2 gap-6">
        {/* Gmail API Setup Card */}
        <div className="bg-[#0c0c0f] border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between shadow-lg shadow-black/20">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Gmail API Setup</h3>
              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${
                gmailConnected
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/15"
              }`}>
                {gmailConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">OAuth Client ID</label>
                <input
                  type="text"
                  placeholder="Paste your Client ID here"
                  value={gmailClientId}
                  onChange={(e) => setGmailClientId(e.target.value)}
                  className="w-full bg-black/35 border border-white/[0.08] focus:border-indigo-500/40 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none placeholder-slate-600 focus:ring-1 focus:ring-indigo-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Client Secret</label>
                <input
                  type="password"
                  placeholder="Paste Client Secret here"
                  value={gmailClientSecret}
                  onChange={(e) => setGmailClientSecret(e.target.value)}
                  className="w-full bg-black/35 border border-white/[0.08] focus:border-indigo-500/40 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none placeholder-slate-600 focus:ring-1 focus:ring-indigo-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setGmailConnected(!gmailConnected);
              showToast(
                gmailConnected ? "Gmail API disconnected!" : "Gmail API connected successfully!",
                gmailConnected ? "error" : "success"
              );
            }}
            className={`w-full mt-6 py-2.5 rounded-xl border text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-all duration-200 ease-in-out active:scale-[0.98] cursor-pointer ${
              gmailConnected
                ? "bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 text-rose-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]"
                : "bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] shadow-md"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>{gmailConnected ? "Disconnect Gmail" : "Connect Gmail"}</span>
          </button>
        </div>

        {/* Google Calendar Setup Card */}
        <div className="bg-[#0c0c0f] border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between shadow-lg shadow-black/20">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/[0.05]">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Google Calendar Setup</h3>
              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${
                calendarConnected
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/15"
              }`}>
                {calendarConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">OAuth Client ID</label>
                <input
                  type="text"
                  placeholder="Paste your Client ID here"
                  value={calendarClientId}
                  onChange={(e) => setCalendarClientId(e.target.value)}
                  className="w-full bg-black/35 border border-white/[0.08] focus:border-indigo-500/40 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none placeholder-slate-600 focus:ring-1 focus:ring-indigo-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Client Secret</label>
                <input
                  type="password"
                  placeholder="Paste Client Secret here"
                  value={calendarClientSecret}
                  onChange={(e) => setCalendarClientSecret(e.target.value)}
                  className="w-full bg-black/35 border border-white/[0.08] focus:border-indigo-500/40 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none placeholder-slate-600 focus:ring-1 focus:ring-indigo-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setCalendarConnected(!calendarConnected);
              showToast(
                calendarConnected ? "Google Calendar disconnected!" : "Google Calendar connected successfully!",
                calendarConnected ? "error" : "success"
              );
            }}
            className={`w-full mt-6 py-2.5 rounded-xl border text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-all duration-200 ease-in-out active:scale-[0.98] cursor-pointer ${
              calendarConnected
                ? "bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 text-rose-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]"
                : "bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] shadow-md"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>{calendarConnected ? "Disconnect Calendar" : "Connect Calendar"}</span>
          </button>
        </div>
      </div>

      {/* Security Credentials */}
      <div className="bg-[#0c0c0f] border border-white/[0.06] rounded-2xl p-6 space-y-4 shadow-lg shadow-black/20">
        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.05]">
          <svg className="h-4.5 w-4.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Security Credentials</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3.5 p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.02] transition-colors duration-150">
            <svg className="h-5.5 w-5.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <div>
              <h4 className="text-[11px] font-semibold text-white leading-none">Key Encryption Key</h4>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">Loaded from .env.local</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.02] transition-colors duration-150">
            <svg className="h-5.5 w-5.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            <div>
              <h4 className="text-[11px] font-semibold text-white leading-none">PostgreSQL Pool</h4>
              <p className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400/50" /> Active and Connected
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
