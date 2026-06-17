"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/trpc/react";
import { InboxView } from "./_components/InboxView";
import { CalendarAgendaView } from "./_components/CalendarAgendaView";
import { McpAgentChatView } from "./_components/McpAgentChatView";
import { SettingsApiView } from "./_components/SettingsApiView";

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

export default function Dashboard() {
  const utils = api.useUtils();

  // Navigation states
  // Tab possibilities: "all-inbox", "priority-inbox", "calendar-agenda", "mcp-agent", "settings"
  const [activeTab, setActiveTab] = useState<string>("all-inbox");

  // Selected Item states
  const [selectedEmailId, setSelectedEmailId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals / Interactive state
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Keyboard navigation & focus state
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Email replies state
  const [replyText, setReplyText] = useState("");

  // Calendar event schedule state
  const [selectedEventId, setSelectedEventId] = useState("");
  const [quickAddText, setQuickAddText] = useState("");

  // Configuration States
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(true);
  const [calendarConnected, setCalendarConnected] = useState(true);
  const [gmailClientId, setGmailClientId] = useState("pushkar-client-id.apps.googleusercontent.com");
  const [gmailClientSecret, setGmailClientSecret] = useState("••••••••••••••••");
  const [calendarClientId, setCalendarClientId] = useState("pushkar-calendar-id.apps.googleusercontent.com");
  const [calendarClientSecret, setCalendarClientSecret] = useState("••••••••••••••••");

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sandbox = localStorage.getItem("corsair_isSandboxMode");
      if (sandbox !== null) setIsSandboxMode(sandbox === "true");

      const gmailConn = localStorage.getItem("corsair_gmailConnected");
      if (gmailConn !== null) setGmailConnected(gmailConn === "true");

      const calConn = localStorage.getItem("corsair_calendarConnected");
      if (calConn !== null) setCalendarConnected(calConn === "true");

      const gmailId = localStorage.getItem("corsair_gmailClientId");
      if (gmailId !== null) setGmailClientId(gmailId);

      const gmailSecret = localStorage.getItem("corsair_gmailClientSecret");
      if (gmailSecret !== null) setGmailClientSecret(gmailSecret);

      const calId = localStorage.getItem("corsair_calendarClientId");
      if (calId !== null) setCalendarClientId(calId);

      const calSecret = localStorage.getItem("corsair_calendarClientSecret");
      if (calSecret !== null) setCalendarClientSecret(calSecret);
    }
  }, []);

  // Save settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem("corsair_isSandboxMode", String(isSandboxMode));
  }, [isSandboxMode]);

  useEffect(() => {
    localStorage.setItem("corsair_gmailConnected", String(gmailConnected));
  }, [gmailConnected]);

  useEffect(() => {
    localStorage.setItem("corsair_calendarConnected", String(calendarConnected));
  }, [calendarConnected]);

  useEffect(() => {
    localStorage.setItem("corsair_gmailClientId", gmailClientId);
  }, [gmailClientId]);

  useEffect(() => {
    localStorage.setItem("corsair_gmailClientSecret", gmailClientSecret);
  }, [gmailClientSecret]);

  useEffect(() => {
    localStorage.setItem("corsair_calendarClientId", calendarClientId);
  }, [calendarClientId]);

  useEffect(() => {
    localStorage.setItem("corsair_calendarClientSecret", calendarClientSecret);
  }, [calendarClientSecret]);

  // Live queries
  const { data: liveGmailData, isLoading: liveGmailLoading } =
    api.corsair.getGmailMessages.useQuery({ limit: 10 }, {
      retry: false,
      refetchOnWindowFocus: false,
    });

  const { data: liveCalendarData, isLoading: liveCalendarLoading } =
    api.corsair.getCalendarEvents.useQuery({ limit: 10 }, {
      retry: false,
      refetchOnWindowFocus: false,
    });

  // Mutations
  const sendMailMutation = api.corsair.sendGmailMessage.useMutation({
    onSuccess: async () => {
      showToast("Email reply sent successfully!", "success");
      setReplyText("");
      await utils.corsair.getGmailMessages.invalidate();
    },
    onError: (err) => {
      showToast(err.message || "Failed to send email.", "error");
    },
  });

  const quickAddMutation = api.corsair.quickAddCalendarEvent.useMutation({
    onSuccess: async () => {
      showToast("Calendar event created via Quick Add!", "success");
      setQuickAddText("");
      await utils.corsair.getCalendarEvents.invalidate();
    },
    onError: (err) => {
      showToast(err.message || "Failed to add event.", "error");
    },
  });

  const respondEventMutation = api.corsair.respondToCalendarEvent.useMutation({
    onSuccess: async () => {
      showToast("RSVP status updated!", "success");
      await utils.corsair.getCalendarEvents.invalidate();
    },
    onError: (err) => {
      showToast(err.message || "Failed to update RSVP.", "error");
    },
  });

  const deleteEventMutation = api.corsair.deleteCalendarEvent.useMutation({
    onSuccess: async () => {
      showToast("Event cancelled successfully!", "success");
      setSelectedEventId("");
      await utils.corsair.getCalendarEvents.invalidate();
    },
    onError: (err) => {
      showToast(err.message || "Failed to cancel event.", "error");
    },
  });

  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agentChatMutation = api.corsair.agentChat.useMutation({
    onSuccess: (data) => {
      setChatMessages(data.messages);
      void utils.corsair.getGmailMessages.invalidate();
      void utils.corsair.getCalendarEvents.invalidate();
    },
    onError: (err) => {
      showToast(err.message || "Failed to communicate with agent.", "error");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleAgentChatSubmit = (textToSubmit?: string) => {
    const text = textToSubmit || chatInput;
    if (!text.trim()) return;

    const newUserMessage = {
      role: "user" as const,
      parts: [{ text: text.trim() }],
    };

    const updatedMessages = [...chatMessages, newUserMessage];
    setChatMessages(updatedMessages);
    setChatInput("");

    agentChatMutation.mutate({ messages: updatedMessages });
  };

  // Keybindings listener for focus `/` shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const parseDateVal = (val: any): Date => {
    if (!val) return new Date();
    if (val instanceof Date) return val;
    if (typeof val === "number") return new Date(val);
    if (typeof val === "string") {
      if (/^\d+$/.test(val)) {
        return new Date(parseInt(val, 10));
      }
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  };

  // Process / merge Gmail threads
  const getProcessedEmails = (): GmailMessage[] => {
    const list: GmailMessage[] = [];

    // Append live Gmail data if available
    if (liveGmailData?.messages) {
      liveGmailData.messages.forEach((msg: any) => {
        // Prevent duplicate IDs
        if (list.some((m) => m.id === msg.id)) return;

        const headers = msg.payload?.headers || [];
        const subject = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "(No Subject)";

        const isImportant = msg.labelIds?.includes("IMPORTANT") ||
          subject.toLowerCase().includes("urgent") ||
          subject.toLowerCase().includes("important");

        list.push({
          id: msg.id,
          threadId: msg.threadId,
          snippet: msg.snippet || "",
          internalDate: msg.internalDate,
          priority: isImportant ? "high" : "low",
          starred: msg.labelIds?.includes("STARRED") || false,
          payload: msg.payload,
          labelIds: msg.labelIds || [],
        });
      });
    }

    // Filter by Priority Inbox tab
    let filteredList = list;
    if (activeTab === "priority-inbox") {
      filteredList = list.filter((m) => m.priority === "high");
    }

    // Filter by Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filteredList = filteredList.filter((m) => {
        const headers = m.payload?.headers || [];
        const subject = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "";
        const from = headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "";
        return (
          subject.toLowerCase().includes(q) ||
          from.toLowerCase().includes(q) ||
          m.snippet?.toLowerCase().includes(q)
        );
      });
    }

    // Sort by Date descending
    return filteredList.sort((a, b) => {
      const dateA = parseDateVal(a.internalDate).getTime();
      const dateB = parseDateVal(b.internalDate).getTime();
      return dateB - dateA;
    });
  };

  const emails = getProcessedEmails();

  const toggleStar = (id: string) => {
    const newStarred = new Set(starredIds);
    if (newStarred.has(id)) {
      newStarred.delete(id);
      showToast("Thread unstarred", "success");
    } else {
      newStarred.add(id);
      showToast("Thread starred", "success");
    }
    setStarredIds(newStarred);
  };

  // Get counts for badges dynamically from loaded gmail messages
  const listForCounts: GmailMessage[] = [];
  if (liveGmailData?.messages) {
    liveGmailData.messages.forEach((msg: any) => {
      if (listForCounts.some((m) => m.id === msg.id)) return;
      const headers = msg.payload?.headers || [];
      const subject = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "";
      const isImportant = msg.labelIds?.includes("IMPORTANT") ||
        subject.toLowerCase().includes("urgent") ||
        subject.toLowerCase().includes("important");

      listForCounts.push({
        id: msg.id,
        threadId: msg.threadId,
        snippet: msg.snippet || "",
        internalDate: msg.internalDate,
        priority: isImportant ? "high" : "low",
        starred: msg.labelIds?.includes("STARRED") || false,
        payload: msg.payload,
        labelIds: msg.labelIds || [],
      });
    });
  }

  const allInboxUnread = listForCounts.filter(m => m.labelIds?.includes("UNREAD")).length;
  const priorityInboxUnread = listForCounts.filter(m => m.priority === "high" && m.labelIds?.includes("UNREAD")).length;

  return (
    <div className="min-h-screen bg-[#09090b] text-[#e2e8f0] font-sans overflow-hidden flex h-screen select-none">
      {/* Background glow effects - Muted for professional matte layout */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[350px] rounded-full bg-indigo-950/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-950/5 blur-[120px] pointer-events-none z-0" />

      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border backdrop-blur-lg shadow-2xl transition-all duration-300 animate-slide-in ${toast.type === "success"
          ? "bg-[#064e3b]/90 border-emerald-500/30 text-emerald-200"
          : "bg-[#4c0519]/90 border-rose-500/30 text-rose-200"
          }`}>
          <span className="text-lg">{toast.type === "success" ? "✓" : "⚠"}</span>
          <p className="text-xs font-semibold tracking-wide">{toast.message}</p>
        </div>
      )}

      {/* ==================================================== */}
      {/* 1. LEFT SIDEBAR */}
      {/* ==================================================== */}
      <aside className="w-[240px] border-r border-[#1e1e24] flex flex-col justify-between shrink-0 bg-[#0c0c0f] z-10">
        <div>
          {/* Logo & Branding */}
          <div className="p-6 pb-8">
            <div className="flex items-center gap-3">
              {/* Command Center Icon */}
              <div className="h-8.5 w-8.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/10">
                <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xs font-extrabold tracking-widest text-white uppercase leading-none">Command Center</h2>
                <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-wider">powered by Corsair</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            <button
              onClick={() => { setActiveTab("all-inbox"); }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === "all-inbox"
                ? "bg-gradient-to-r from-indigo-500/10 to-transparent text-white border-l-2 border-indigo-500 pl-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>All Inbox</span>
              </div>
              {allInboxUnread > 0 && (
                <span className="bg-[#18182b] text-indigo-300 font-bold px-1.5 py-0.5 rounded text-[9px] border border-indigo-500/15">{allInboxUnread}</span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab("priority-inbox"); }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === "priority-inbox"
                ? "bg-gradient-to-r from-indigo-500/10 to-transparent text-white border-l-2 border-indigo-500 pl-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span>Priority Inbox</span>
              </div>
              {priorityInboxUnread > 0 && (
                <span className="bg-[#18182b] text-indigo-300 font-bold px-1.5 py-0.5 rounded text-[9px] border border-indigo-500/15">{priorityInboxUnread}</span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab("calendar-agenda"); }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === "calendar-agenda"
                ? "bg-gradient-to-r from-indigo-500/10 to-transparent text-white border-l-2 border-indigo-500 pl-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Calendar Agenda</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab("mcp-agent"); }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === "mcp-agent"
                ? "bg-gradient-to-r from-indigo-500/10 to-transparent text-white border-l-2 border-indigo-500 pl-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>MCP Agent Chat</span>
              </div>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            </button>

            <button
              onClick={() => { setActiveTab("settings"); }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === "settings"
                ? "bg-gradient-to-r from-indigo-500/10 to-transparent text-white border-l-2 border-indigo-500 pl-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings & API</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Integration Setup Flags at bottom */}
        <div className="p-5 border-t border-[#1a1b26] bg-[#09090c]">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">Integrations</p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Gmail API</span>
              <span className={`flex items-center gap-1.5 font-semibold px-2 py-0.5 rounded-full text-[9px] ${
                gmailConnected 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" 
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/15"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${gmailConnected ? "bg-emerald-400" : "bg-amber-400"}`} /> 
                {gmailConnected ? "Connected" : "Setup"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Google Calendar</span>
              <span className={`flex items-center gap-1.5 font-semibold px-2 py-0.5 rounded-full text-[9px] ${
                calendarConnected 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" 
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/15"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${calendarConnected ? "bg-emerald-400" : "bg-amber-400"}`} /> 
                {calendarConnected ? "Connected" : "Setup"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ==================================================== */}
      {/* 2 & 3: CONTENT VIEW ACCORDING TO TAB */}
      {/* ==================================================== */}
      {activeTab === "settings" ? (
        <main className="flex-grow flex flex-col bg-[#09090b]/50 z-10 h-full overflow-hidden">
          <SettingsApiView
            isSandboxMode={isSandboxMode}
            setIsSandboxMode={setIsSandboxMode}
            gmailConnected={gmailConnected}
            setGmailConnected={setGmailConnected}
            calendarConnected={calendarConnected}
            setCalendarConnected={setCalendarConnected}
            gmailClientId={gmailClientId}
            setGmailClientId={setGmailClientId}
            gmailClientSecret={gmailClientSecret}
            setGmailClientSecret={setGmailClientSecret}
            calendarClientId={calendarClientId}
            setCalendarClientId={setCalendarClientId}
            calendarClientSecret={calendarClientSecret}
            setCalendarClientSecret={setCalendarClientSecret}
            showToast={showToast}
          />
        </main>
      ) : activeTab === "mcp-agent" ? (
        <main className="flex-grow flex flex-col bg-[#09090b]/50 z-10 h-full overflow-hidden">
          <McpAgentChatView
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            isPending={agentChatMutation.isPending}
            handleAgentChatSubmit={handleAgentChatSubmit}
            messagesEndRef={messagesEndRef}
          />
        </main>
      ) : activeTab === "calendar-agenda" ? (
        <main className="flex-grow flex flex-col bg-[#09090b]/50 z-10 h-full overflow-hidden">
          <CalendarAgendaView
            liveCalendarData={liveCalendarData}
            liveCalendarLoading={liveCalendarLoading}
            calendarConnected={calendarConnected}
            isSandboxMode={isSandboxMode}
            selectedEventId={selectedEventId}
            setSelectedEventId={setSelectedEventId}
            quickAddText={quickAddText}
            setQuickAddText={setQuickAddText}
            quickAddIsPending={quickAddMutation.isPending}
            quickAddMutate={quickAddMutation.mutate}
            respondEventIsPending={respondEventMutation.isPending}
            respondEventMutate={respondEventMutation.mutate}
            deleteEventIsPending={deleteEventMutation.isPending}
            deleteEventMutate={deleteEventMutation.mutate}
            invalidateEvents={() => void utils.corsair.getCalendarEvents.invalidate()}
          />
        </main>
      ) : (
        <InboxView
          emails={emails}
          liveGmailLoading={liveGmailLoading}
          gmailConnected={gmailConnected}
          isSandboxMode={isSandboxMode}
          selectedEmailId={selectedEmailId}
          setSelectedEmailId={setSelectedEmailId}
          starredIds={starredIds}
          toggleStar={toggleStar}
          replyText={replyText}
          setReplyText={setReplyText}
          sendMailIsPending={sendMailMutation.isPending}
          sendMailMutate={sendMailMutation.mutate}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchInputRef={searchInputRef}
        />
      )}
    </div>
  );
}
