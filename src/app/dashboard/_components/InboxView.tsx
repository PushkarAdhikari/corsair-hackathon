"use client";

import React from "react";

interface GmailMessage {
  id?: string;
  threadId?: string;
  snippet?: string;
  internalDate?: string | number | Date | null;
  payload?: any;
  priority?: "high" | "medium" | "low";
  starred?: boolean;
  labelIds?: string[];
}

interface InboxViewProps {
  emails: GmailMessage[];
  liveGmailLoading: boolean;
  gmailConnected: boolean;
  isSandboxMode: boolean;
  selectedEmailId: string;
  setSelectedEmailId: (val: string) => void;
  starredIds: Set<string>;
  toggleStar: (id: string) => void;
  replyText: string;
  setReplyText: (val: string) => void;
  sendMailIsPending: boolean;
  sendMailMutate: (args: { to: string; subject: string; body: string }) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export function InboxView({
  emails,
  liveGmailLoading,
  gmailConnected,
  isSandboxMode,
  selectedEmailId,
  setSelectedEmailId,
  starredIds,
  toggleStar,
  replyText,
  setReplyText,
  sendMailIsPending,
  sendMailMutate,
  searchQuery,
  setSearchQuery,
  searchInputRef,
}: InboxViewProps) {
  // Helper to extract headers from Gmail Message format
  const getHeader = (msg: GmailMessage, name: string): string => {
    if (!msg.payload?.headers) return "";
    const header = msg.payload.headers.find(
      (h: any) => h.name.toLowerCase() === name.toLowerCase()
    );
    return header ? header.value : "";
  };

  // Helper to resolve email bodies correctly (supporting text/plain, nested parts, snippets)
  const getEmailBody = (msg: GmailMessage): string => {
    if (!msg.payload) return msg.snippet || "(No content preview)";
    
    // Check if simple body
    if (msg.payload.body?.data) {
      try {
        return Buffer.from(msg.payload.body.data, "base64").toString("utf-8");
      } catch {
        return msg.snippet || "";
      }
    }

    // Check nested parts
    if (msg.payload.parts) {
      const plainPart = msg.payload.parts.find(
        (part: any) => part.mimeType === "text/plain"
      );
      if (plainPart?.body?.data) {
        try {
          return Buffer.from(plainPart.body.data, "base64").toString("utf-8");
        } catch {}
      }
      
      // Try nested nested parts (e.g. multipart/alternative)
      for (const part of msg.payload.parts) {
        if (part.parts) {
          const subPlainPart = part.parts.find(
            (p: any) => p.mimeType === "text/plain"
          );
          if (subPlainPart?.body?.data) {
            try {
              return Buffer.from(subPlainPart.body.data, "base64").toString("utf-8");
            } catch {}
          }
        }
      }
    }

    return msg.snippet || "(No content preview)";
  };

  // Safe avatar color generator based on name hash (Low-saturation slate/matte tones)
  const getAvatarBgColor = (name: string): string => {
    if (!name) return "bg-slate-500/10 text-slate-400 border border-slate-500/15";
    const colors = [
      "bg-slate-500/10 text-slate-400 border border-slate-500/15",
      "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15",
      "bg-sky-500/10 text-sky-400 border border-sky-500/15",
      "bg-violet-500/10 text-violet-400 border border-violet-500/15",
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15",
      "bg-amber-500/10 text-amber-400 border border-amber-500/15",
      "bg-rose-500/10 text-rose-400 border border-rose-500/15",
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length]!;
  };

  // Safe Date parsing to remove any "Invalid Date" errors
  const parseDateVal = (val: any): Date => {
    if (!val) return new Date();
    if (val instanceof Date) return val;
    if (typeof val === "number") return new Date(val);
    if (typeof val === "string") {
      if (/^\d+$/.test(val)) {
        return new Date(parseInt(val, 10));
      }
      return new Date(val);
    }
    return new Date();
  };

  const selectedEmail = emails.find((msg) => msg.id === selectedEmailId);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmail) return;
    const to = getHeader(selectedEmail, "from").match(/<([^>]+)>/)?.[1] || getHeader(selectedEmail, "from");
    const subject = `Re: ${getHeader(selectedEmail, "subject") || "No Subject"}`;
    if (replyText.trim()) {
      sendMailMutate({ to, subject, body: replyText });
    }
  };

  return (
    <>
      {/* ==================================================== */}
      {/* MIDDLE COLUMN: INBOX SEARCH & LIST */}
      {/* ==================================================== */}
      <section className="w-[480px] border-r border-white/[0.05] flex flex-col bg-[#0c0c0f]/60 backdrop-blur-md shrink-0 z-10">
        {/* Search Bar / Options Header */}
        <div className="p-4 border-b border-white/[0.05] flex items-center gap-2 bg-[#0c0c0f]/80">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.08] focus:border-indigo-500/40 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-200 placeholder-slate-500"
            />
          </div>
          <button className="bg-white/[0.02] hover:bg-white/[0.04] text-slate-300 hover:text-white border border-white/[0.06] hover:border-white/[0.1] px-3.5 py-2 rounded-xl text-[10px] font-semibold tracking-wide flex items-center gap-1.5 transition-all duration-200 select-none active:scale-[0.98]">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Search
          </button>
        </div>

        {/* Content list body */}
        <div className="flex-grow overflow-y-auto pr-1">
          <div className="divide-y divide-white/[0.04]">
            {liveGmailLoading && emails.length === 0 && (
              <div className="p-4 bg-indigo-500/5 border-b border-white/[0.05] text-center text-xs text-indigo-400 font-semibold flex items-center justify-center gap-2 animate-pulse">
                <div className="animate-spin rounded-full h-3.5 w-3.5 border border-indigo-500/20 border-t-indigo-500" />
                Syncing live inbox...
              </div>
            )}

            {emails.map((msg) => {
              const fromHeader = getHeader(msg, "from");
              const senderName = fromHeader.replace(/<.*>/, "").replace(/"/g, "").trim() || "Unknown";
              const subject = getHeader(msg, "subject") || "(No Subject)";
              const isSelected = msg.id === selectedEmailId;
              const isStarred = starredIds.has(msg.id || "");

              // Format Time
              const dateVal = parseDateVal(msg.internalDate);
              const timeStr = dateVal.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });

              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    if (msg.id) setSelectedEmailId(msg.id);
                  }}
                  className={`p-4 transition-all duration-200 cursor-pointer flex gap-3.5 relative group border-l-2 ${isSelected
                    ? "bg-indigo-500/5 border-indigo-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.01)]"
                    : "border-transparent bg-transparent hover:bg-white/[0.02] hover:border-l-white/[0.15]"
                    }`}
                >
                  {/* User Avatar Circle */}
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${getAvatarBgColor(senderName)}`}>
                    {senderName.charAt(0).toUpperCase()}
                  </div>

                  {/* Email Text Meta */}
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className={`text-[12px] font-semibold ${isSelected ? "text-white" : "text-slate-300"}`}>
                        {senderName}
                      </span>
                      <div className="flex items-center gap-2">
                        {isStarred && (
                          <span className="text-[#fbbf24] text-xs">★</span>
                        )}
                        <span className="text-[10px] text-slate-500 font-semibold">{timeStr}</span>
                      </div>
                    </div>

                    <h4 className="text-xs font-semibold text-white mt-1 line-clamp-1">
                      {subject}
                    </h4>

                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {msg.snippet}
                    </p>

                    {/* Tag badges */}
                    <div className="flex justify-between items-center mt-3">
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide ${msg.priority === "high"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/15"
                        : msg.priority === "medium"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/15"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                        }`}>
                        {msg.priority || "low"}
                      </span>

                      {/* Inline card hover controls */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (msg.id) toggleStar(msg.id);
                          }}
                          className="p-1 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-all duration-150"
                        >
                          <svg className="h-3.5 w-3.5" fill={isStarred ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {!liveGmailLoading && emails.length === 0 && (
              <div className="p-8 text-center py-24">
                <svg className="h-10 w-10 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-slate-400 text-xs font-semibold">No emails found in this account.</p>
                <p className="text-[10px] text-slate-500 mt-1">Authorized Gmail account is empty.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* RIGHT COLUMN: RICH DETAILS VIEW */}
      {/* ==================================================== */}
      {selectedEmail ? (
        <div className="flex flex-col h-full overflow-hidden flex-grow">
          {/* Detail Pane Header Toolbar */}
          <div className="p-4 border-b border-white/[0.05] flex items-center justify-between bg-[#0c0c0f]/40">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleStar(selectedEmail.id || "")}
                className={`p-1.5 rounded-lg hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all duration-200 ${starredIds.has(selectedEmail.id || "") ? "text-[#fbbf24]" : "text-slate-500 hover:text-slate-300"
                  }`}
              >
                <svg className="h-4 w-4" fill={starredIds.has(selectedEmail.id || "") ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mr-1">Priority:</span>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${selectedEmail.priority === "high"
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/15"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                }`}>
                {selectedEmail.priority || "low"}
              </span>
            </div>
          </div>

          {/* Email Message Content container */}
          <div className="flex-grow overflow-y-auto p-8 space-y-6">
            {/* Subject Title */}
            <h2 className="text-xl font-bold text-white tracking-wide leading-relaxed">
              {getHeader(selectedEmail, "subject")}
            </h2>

            {/* Sender Block */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs select-none ${getAvatarBgColor(getHeader(selectedEmail, "from"))}`}>
                  {getHeader(selectedEmail, "from").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white leading-none">
                    {getHeader(selectedEmail, "from").replace(/<.*>/, "").replace(/"/g, "").trim()}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">
                    {getHeader(selectedEmail, "from").match(/<([^>]+)>/)?.[1] || getHeader(selectedEmail, "from")}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">
                {getHeader(selectedEmail, "date")}
              </span>
            </div>

            {/* Text Body */}
            <div className="text-[12px] text-slate-300 leading-relaxed space-y-4 whitespace-pre-line font-normal pr-4">
              {getEmailBody(selectedEmail)}
            </div>
          </div>

          {/* Pill response triggers */}
          <div className="px-8 py-3.5 flex gap-2 border-t border-white/[0.05] bg-[#0c0c0f]/20">
            <button
              onClick={() => setReplyText("Hi, I accept the guidelines. Thank you!")}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.02] hover:bg-white/[0.04] text-slate-300 hover:text-white border border-white/[0.06] hover:border-white/[0.1] text-[10px] font-semibold transition-all duration-200 active:scale-[0.98] shadow-[inset_0_1px_1px_rgba(255,255,255,0.01)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]"
            >
              Accept
            </button>
            <button
              onClick={() => setReplyText("Hi, could you please provide more details on this?")}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.02] hover:bg-white/[0.04] text-slate-300 hover:text-white border border-white/[0.06] hover:border-white/[0.1] text-[10px] font-semibold transition-all duration-200 active:scale-[0.98] shadow-[inset_0_1px_1px_rgba(255,255,255,0.01)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]"
            >
              Request details
            </button>
            <button
              onClick={() => setReplyText("Thanks for the update. Unfortunately, I'm unable to join this time.")}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.02] hover:bg-white/[0.04] text-slate-300 hover:text-white border border-white/[0.06] hover:border-white/[0.1] text-[10px] font-semibold transition-all duration-200 active:scale-[0.98] shadow-[inset_0_1px_1px_rgba(255,255,255,0.01)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]"
            >
              Decline politely
            </button>
          </div>

          {/* Bottom Input Reply Area */}
          <div className="p-4 border-t border-white/[0.05] bg-[#0c0c0f]/50 backdrop-blur-md">
            <form onSubmit={handleReplySubmit} className="relative">
              <input
                type="text"
                placeholder={`Reply to ${getHeader(selectedEmail, "from").replace(/<.*>/, "").replace(/"/g, "").trim()} (press Esc to focus out)...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.08] focus:border-indigo-500/40 rounded-xl pl-4 pr-12 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-200 placeholder-slate-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sendMailIsPending || replyText.trim() === ""}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/[0.02] disabled:border-white/[0.02] disabled:text-slate-600 text-white font-semibold text-xs transition-all duration-200 active:scale-[0.96] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] shadow-md"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>

        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center py-20 text-center">
          <p className="text-slate-500 text-xs font-semibold">Select an item to display details</p>
        </div>
      )}
    </>
  );
}
