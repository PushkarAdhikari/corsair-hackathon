"use client";

import React from "react";

interface GmailMessage {
  id?: string;
  threadId?: string;
  snippet?: string;
  internalDate?: string | number | Date | null;
  payload?: {
    headers?: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{
      mimeType?: string;
      body?: { data?: string };
      parts?: Array<{ mimeType?: string; body?: { data?: string } }>;
    }>;
  };
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
  searchSemantic: boolean;
  setSearchSemantic: (val: boolean) => void;
  searchFrom: string;
  setSearchFrom: (val: string) => void;
  searchSubject: string;
  setSearchSubject: (val: string) => void;
  loaderRef?: React.RefObject<HTMLDivElement | null>;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function InboxView({
  emails,
  liveGmailLoading,
  gmailConnected: _gmailConnected,
  isSandboxMode: _isSandboxMode,
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
  searchSemantic,
  setSearchSemantic,
  searchFrom,
  setSearchFrom,
  searchSubject,
  setSearchSubject,
  loaderRef,
  hasMore,
  isLoadingMore,
}: InboxViewProps) {
  const [isComposeOpen, setIsComposeOpen] = React.useState(false);
  const [composeTo, setComposeTo] = React.useState("");
  const [composeSubject, setComposeSubject] = React.useState("");
  const [composeBody, setComposeBody] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      
      if (isInput) {
        if (e.key === "Escape") {
          e.preventDefault();
          target.blur();
        }
        return;
      }

      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        setIsComposeOpen(true);
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        const replyInput = document.querySelector<HTMLInputElement>('input[placeholder*="Reply to"]');
        replyInput?.focus();
      } else if (e.key === "j" || e.key === "J") {
        e.preventDefault();
        const currentIndex = emails.findIndex((m) => m.id === selectedEmailId);
        if (currentIndex < emails.length - 1) {
          const nextEmail = emails[currentIndex + 1];
          if (nextEmail?.id) setSelectedEmailId(nextEmail.id);
        } else if (emails.length > 0 && currentIndex === -1) {
          const firstEmail = emails[0];
          if (firstEmail?.id) setSelectedEmailId(firstEmail.id);
        }
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        const currentIndex = emails.findIndex((m) => m.id === selectedEmailId);
        if (currentIndex > 0) {
          const prevEmail = emails[currentIndex - 1];
          if (prevEmail?.id) setSelectedEmailId(prevEmail.id);
        } else if (emails.length > 0 && currentIndex === -1) {
          const firstEmail = emails[0];
          if (firstEmail?.id) setSelectedEmailId(firstEmail.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [emails, selectedEmailId, setSelectedEmailId]);

  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (composeTo.trim() && composeSubject.trim() && composeBody.trim()) {
      sendMailMutate({ to: composeTo, subject: composeSubject, body: composeBody });
      setIsComposeOpen(false);
      setComposeTo("");
      setComposeSubject("");
      setComposeBody("");
    }
  };

  const getHeader = (msg: GmailMessage, name: string): string => {
    if (!msg.payload?.headers) return "";
    const header = msg.payload.headers.find(
      (h) => h.name.toLowerCase() === name.toLowerCase()
    );
    return header ? header.value : "";
  };

  const getEmailBody = (msg: GmailMessage): string => {
    if (!msg.payload) return msg.snippet ?? "(No content preview)";
    
    if (msg.payload.body?.data) {
      try {
        return Buffer.from(msg.payload.body.data, "base64").toString("utf-8");
      } catch {
        return msg.snippet ?? "";
      }
    }

    if (msg.payload.parts) {
      const plainPart = msg.payload.parts.find(
        (part) => part.mimeType === "text/plain"
      );
      if (plainPart?.body?.data) {
        try {
          return Buffer.from(plainPart.body.data, "base64").toString("utf-8");
        } catch {}
      }
      
      for (const part of msg.payload.parts) {
        if (part.parts) {
          const subPlainPart = part.parts.find(
            (p) => p.mimeType === "text/plain"
          );
          if (subPlainPart?.body?.data) {
            try {
              return Buffer.from(subPlainPart.body.data, "base64").toString("utf-8");
            } catch {}
          }
        }
      }
    }

    return msg.snippet ?? "(No content preview)";
  };

  const getAvatarBgColor = (name: string): string => {
    if (!name) return "bg-slate-500/15 text-slate-400 border border-slate-500/20";
    const colors = [
      "bg-gradient-to-br from-slate-500/20 to-slate-600/10 text-slate-400 border border-slate-500/15",
      "bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 text-indigo-400 border border-indigo-500/15",
      "bg-gradient-to-br from-sky-500/20 to-sky-600/10 text-sky-400 border border-sky-500/15",
      "bg-gradient-to-br from-violet-500/20 to-violet-600/10 text-violet-400 border border-violet-500/15",
      "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 text-emerald-400 border border-emerald-500/15",
      "bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/15",
      "bg-gradient-to-br from-rose-500/20 to-rose-600/10 text-rose-400 border border-rose-500/15",
      "bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 text-cyan-400 border border-cyan-500/15",
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length]!;
  };

  const parseDateVal = (val: string | number | Date | null | undefined): Date => {
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
    const fromHeader = getHeader(selectedEmail, "from");
    const match = /<([^>]+)>/.exec(fromHeader);
    const to = match?.[1] ?? fromHeader;
    const subject = `Re: ${getHeader(selectedEmail, "subject") ?? "No Subject"}`;
    if (replyText.trim()) {
      sendMailMutate({ to, subject, body: replyText });
    }
  };

  const formatRelativeTime = (dateVal: Date): string => {
    const now = new Date();
    const diff = now.getTime() - dateVal.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return dateVal.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <>
      <section className="w-[480px] border-r border-white/[0.05] flex flex-col bg-[#0c0c0f]/60 backdrop-blur-md shrink-0 z-10">
        {/* Search Bar Header */}
        <div className="p-4 border-b border-white/[0.05] flex flex-col gap-3 bg-gradient-to-b from-[#0c0c0f]/90 to-[#0c0c0f]/60">
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchSemantic ? "Ask semantically (e.g. project files update)..." : "Search emails..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.08] focus:border-indigo-500/40 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-200 placeholder-slate-500"
              />
            </div>
            
            <button
              onClick={() => setIsComposeOpen(true)}
              className="bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white px-3.5 py-2.5 rounded-xl text-[10px] font-bold tracking-wide flex items-center gap-1.5 transition-all duration-200 select-none active:scale-[0.98] shadow-lg shadow-indigo-600/20 shrink-0"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Compose
            </button>
          </div>

          {/* Advanced Filters */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-slate-400 hover:text-slate-200 text-[10px] font-semibold flex items-center gap-1.5 transition-colors duration-200"
              >
                <svg className={`h-3 w-3 transform transition-transform duration-200 ${showFilters ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
                Advanced Filters
              </button>
              
              <label className="flex items-center gap-2 cursor-pointer text-[10px] font-semibold text-slate-400 hover:text-slate-200 select-none transition-colors duration-200">
                <input
                  type="checkbox"
                  checked={searchSemantic}
                  onChange={(e) => setSearchSemantic(e.target.checked)}
                  className="rounded border-white/[0.08] bg-black/40 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                />
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Semantic Search (AI)
                </span>
              </label>
            </div>

            {showFilters && (
              <div className="grid grid-cols-2 gap-2 mt-1 animate-fade-in">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">From</label>
                  <input
                    type="text"
                    placeholder="e.g. Pushkar"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    className="w-full bg-black/20 border border-white/[0.06] focus:border-indigo-500/30 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none placeholder-slate-600 transition-all duration-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. feedback"
                    value={searchSubject}
                    onChange={(e) => setSearchSubject(e.target.value)}
                    className="w-full bg-black/20 border border-white/[0.06] focus:border-indigo-500/30 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none placeholder-slate-600 transition-all duration-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email List */}
        <div className="flex-grow overflow-y-auto">
          <div className="divide-y divide-white/[0.03]">
            {liveGmailLoading && emails.length === 0 && (
              <div className="p-4 border-b border-white/[0.05] text-center text-xs text-indigo-400 font-semibold flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-indigo-500/20 border-t-indigo-500" />
                Syncing live inbox...
              </div>
            )}

            {emails.map((msg, idx) => {
              const fromHeader = getHeader(msg, "from");
              const senderName = fromHeader.replace(/<.*>/, "").replace(/"/g, "").trim() || "Unknown";
              const subject = getHeader(msg, "subject") || "(No Subject)";
              const isSelected = msg.id === selectedEmailId;
              const isStarred = starredIds.has(msg.id ?? "");

              const dateVal = parseDateVal(msg.internalDate);
              const timeStr = formatRelativeTime(dateVal);

              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    if (msg.id) setSelectedEmailId(msg.id);
                  }}
                  className={`p-4 transition-all duration-200 cursor-pointer flex gap-3.5 relative group animate-fade-in ${
                    isSelected
                      ? "bg-gradient-to-r from-indigo-500/8 to-indigo-500/3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.01)]"
                      : "bg-transparent hover:bg-white/[0.015]"
                  }`}
                  style={{ animationDelay: `${idx * 20}ms` }}
                >
                  {/* Active indicator */}
                  {isSelected && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full bg-gradient-to-b from-indigo-400 to-purple-400" />
                  )}

                  {/* Avatar */}
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-sm ${getAvatarBgColor(senderName)}`}>
                    {senderName.charAt(0).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className={`text-xs font-semibold truncate ${isSelected ? "text-white" : "text-slate-300"}`}>
                        {senderName}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isStarred && (
                          <svg className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        )}
                        <span className="text-[10px] text-slate-500 font-medium">{timeStr}</span>
                      </div>
                    </div>

                    <h4 className="text-xs font-semibold text-white mt-1 line-clamp-1">
                      {subject}
                    </h4>

                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {msg.snippet}
                    </p>

                    {/* Bottom row: badge + actions */}
                    <div className="flex justify-between items-center mt-2.5">
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wide ${
                        msg.priority === "high"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/15"
                          : msg.priority === "medium"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/15"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                      }`}>
                        {msg.priority ?? "low"}
                      </span>

                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (msg.id) toggleStar(msg.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-500 hover:text-amber-400 transition-all duration-150"
                        >
                          <svg className="h-3.5 w-3.5" fill={isStarred ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {!liveGmailLoading && emails.length === 0 && (
              <div className="p-8 text-center py-24 animate-fade-in">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-xs font-semibold">No emails found</p>
                <p className="text-[10px] text-slate-500 mt-1">Authorized Gmail account is empty.</p>
              </div>
            )}

            {/* Infinite scroll */}
            {hasMore && emails.length > 0 && (
              <div ref={loaderRef} className="flex items-center justify-center py-6">
                {isLoadingMore ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-indigo-500/20 border-t-indigo-500" />
                    Loading more...
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-600 font-mono">~ scroll for more ~</div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* DETAIL PANE */}
      {/* ==================================================== */}
      {selectedEmail ? (
        <div className="flex flex-col h-full overflow-hidden flex-grow bg-gradient-to-b from-[#09090b]/30 to-transparent">
          {/* Toolbar */}
          <div className="p-4 border-b border-white/[0.05] flex items-center justify-between bg-[#0c0c0f]/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleStar(selectedEmail.id ?? "")}
                className={`p-2 rounded-lg border transition-all duration-200 ${
                  starredIds.has(selectedEmail.id ?? "")
                    ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    : "text-slate-500 hover:text-slate-300 bg-transparent border-transparent hover:border-white/[0.06] hover:bg-white/[0.04]"
                }`}
              >
                <svg className="h-4 w-4" fill={starredIds.has(selectedEmail.id ?? "") ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mr-1">Priority:</span>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider ${
                selectedEmail.priority === "high"
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/15"
                  : selectedEmail.priority === "medium"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/15"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
              }`}>
                {selectedEmail.priority ?? "low"}
              </span>
            </div>
          </div>

          {/* Email Content */}
          <div className="flex-grow overflow-y-auto p-8 space-y-6">
            {/* Subject */}
            <h2 className="text-xl font-bold text-white tracking-tight leading-relaxed">
              {getHeader(selectedEmail, "subject")}
            </h2>

            {/* Sender Block */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm select-none shadow-sm ${getAvatarBgColor(getHeader(selectedEmail, "from"))}`}>
                  {getHeader(selectedEmail, "from").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white leading-none">
                    {getHeader(selectedEmail, "from").replace(/<.*>/, "").replace(/"/g, "").trim()}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">
                    {(() => {
                      const fromHeader = getHeader(selectedEmail, "from");
                      const match = /<([^>]+)>/.exec(fromHeader);
                      return match?.[1] ?? fromHeader;
                    })()}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                {getHeader(selectedEmail, "date")}
              </span>
            </div>

            {/* Body */}
            <div className="text-sm text-slate-300 leading-relaxed space-y-4 whitespace-pre-line font-normal pr-4">
              {getEmailBody(selectedEmail)}
            </div>
          </div>

          {/* Quick Reply Pills */}
          <div className="px-8 py-3 flex gap-2 border-t border-white/[0.05] bg-[#0c0c0f]/20">
            {[
              { label: "Accept", text: "Hi, I accept the guidelines. Thank you!" },
              { label: "Request details", text: "Hi, could you please provide more details on this?" },
              { label: "Decline politely", text: "Thanks for the update. Unfortunately, I'm unable to join this time." },
            ].map((pill) => (
              <button
                key={pill.label}
                onClick={() => setReplyText(pill.text)}
                className="px-4 py-1.5 rounded-full bg-white/[0.02] hover:bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06] hover:border-white/[0.1] text-[10px] font-semibold transition-all duration-200 active:scale-[0.98] shadow-[inset_0_1px_1px_rgba(255,255,255,0.01)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Reply Input */}
          <div className="p-4 border-t border-white/[0.05] bg-[#0c0c0f]/50 backdrop-blur-md">
            <form onSubmit={handleReplySubmit} className="relative">
              <input
                type="text"
                placeholder={`Reply to ${getHeader(selectedEmail, "from").replace(/<.*>/, "").replace(/"/g, "").trim()} (Esc to blur)...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.08] focus:border-indigo-500/40 rounded-xl pl-4 pr-12 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-200 placeholder-slate-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sendMailIsPending || replyText.trim() === ""}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 disabled:bg-white/[0.02] disabled:border-white/[0.02] disabled:text-slate-600 text-white font-semibold text-xs transition-all duration-200 active:scale-[0.96] shadow-lg shadow-indigo-600/15"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="h-14 w-14 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-4">
            <svg className="h-7 w-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-500 text-xs font-semibold">Select an email to view details</p>
          <p className="text-[10px] text-slate-600 mt-1">or press <kbd className="px-1.5 py-0.5 rounded border border-white/[0.06] text-[9px] font-mono">C</kbd> to compose a new message</p>
        </div>
      )}

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0c0c0f] border border-white/[0.08] w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
            {/* Header */}
            <div className="p-4 border-b border-white/[0.05] flex items-center justify-between bg-gradient-to-r from-black/20 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-600/10 border border-indigo-500/20 flex items-center justify-center">
                  <svg className="h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">New Message</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-all duration-150"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleComposeSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">To</label>
                <input
                  type="email"
                  required
                  placeholder="recipient@example.com"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.08] focus:border-indigo-500/40 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-200 placeholder-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Subject line"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.08] focus:border-indigo-500/40 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-200 placeholder-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Message Body</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Write your email here..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.08] focus:border-indigo-500/40 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-200 placeholder-slate-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] text-xs font-semibold border border-transparent hover:border-white/[0.06] transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendMailIsPending}
                  className="bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-indigo-600/15"
                >
                  {sendMailIsPending ? (
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/20 border-t-white" />
                  ) : (
                    <>
                      <span>Send Mail</span>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
