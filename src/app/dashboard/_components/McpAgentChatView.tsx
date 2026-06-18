"use client";

import React from "react";

interface ChatMessage {
  role: "user" | "model" | "function";
  parts: Array<{
    text?: string;
    functionCall?: {
      name: string;
      args: Record<string, unknown>;
    };
  }>;
}

interface McpAgentChatViewProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (val: string) => void;
  isPending: boolean;
  handleAgentChatSubmit: (textToSubmit?: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function McpAgentChatView({
  chatMessages,
  chatInput,
  setChatInput,
  isPending,
  handleAgentChatSubmit,
  messagesEndRef,
}: McpAgentChatViewProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.05] flex items-center justify-between bg-gradient-to-b from-[#0c0c0f]/50 to-transparent">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          </span>
          <span className="text-xs font-semibold text-white tracking-wide">Corsair MCP Agent Assistant</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-semibold">
          <div className="p-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/15">
            <svg className="h-3.5 w-3.5 text-indigo-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span>Granular Permission Gating</span>
        </div>
      </div>

      {/* Chat Body */}
      <div className="flex-grow overflow-y-auto p-8 flex flex-col justify-start">
        {chatMessages.length === 0 ? (
          /* Empty State */
          <div className="max-w-lg mx-auto w-full text-center my-auto py-12 flex flex-col items-center animate-fade-in">
            {/* Avatar with glow */}
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-2xl scale-150 pointer-events-none" />
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/5 border border-white/[0.08] flex items-center justify-center relative shadow-2xl">
                <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center animate-pulse">
                  <svg className="h-2.5 w-2.5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
                  </svg>
                </div>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-white tracking-wide">Meet your Command Center Agent</h3>

            <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm mt-3 font-medium">
              Using Corsair&apos;s Model Context Protocol (MCP), I have full permission-gated access to Gmail and Google Calendar. You can tell me to schedule meetings, compose drafts, or check invites in plain English!
            </p>

            {/* Suggested Prompts */}
            <div className="w-full mt-10 text-left space-y-3">
              <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest pl-1">Suggested Prompts</p>

              <button
                type="button"
                onClick={() => handleAgentChatSubmit("Send a calendar invite to pushkaradhikari.dev@gmail.com at 9 AM next Thursday. Email him saying I look forward to it.")}
                className="group w-full text-left p-4 bg-gradient-to-b from-[#0c0c0f] to-[#09090b] border border-white/[0.05] hover:border-indigo-500/25 rounded-xl text-[11px] text-slate-400 hover:text-indigo-300 font-semibold transition-all duration-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.01)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] active:scale-[0.99] text-left"
              >
                <span className="text-slate-500 group-hover:text-indigo-400 transition-colors duration-200">Send a calendar invite to </span>
                <span className="text-white">pushkaradhikari.dev@gmail.com</span>
                <span className="text-slate-500 group-hover:text-indigo-400 transition-colors duration-200"> at </span>
                <span className="text-white">9 AM next Thursday</span>
                <span className="text-slate-500 group-hover:text-indigo-400 transition-colors duration-200">. Email him saying I look forward to it.</span>
              </button>

              <button
                type="button"
                onClick={() => handleAgentChatSubmit("Draft email to Pushkar saying project is ready to submit")}
                className="group w-full text-left p-4 bg-gradient-to-b from-[#0c0c0f] to-[#09090b] border border-white/[0.05] hover:border-indigo-500/25 rounded-xl text-[11px] text-slate-400 hover:text-indigo-300 font-semibold transition-all duration-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.01)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] active:scale-[0.99] text-left"
              >
                Draft email to <span className="text-white">Pushkar</span> saying project is ready to submit
              </button>

              <button
                type="button"
                onClick={() => handleAgentChatSubmit("What is my schedule for today?")}
                className="group w-full text-left p-4 bg-gradient-to-b from-[#0c0c0f] to-[#09090b] border border-white/[0.05] hover:border-indigo-500/25 rounded-xl text-[11px] text-slate-400 hover:text-indigo-300 font-semibold transition-all duration-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.01)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] active:scale-[0.99] text-left"
              >
                What is my schedule for today?
              </button>
            </div>
          </div>
        ) : (
          /* Active Chat */
          <div className="space-y-4 max-w-2xl mx-auto w-full pr-1">
            {chatMessages
              .filter((msg) => msg.role === "user" || (msg.role === "model" && msg.parts?.some((p) => p.text)))
              .map((msg, index) => {
                const isUser = msg.role === "user";
                const text = msg.parts?.map((p) => p.text ?? "").join("") ?? "";
                return (
                  <div
                    key={index}
                    className={`flex gap-3.5 max-w-[80%] animate-fade-in ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {!isUser && (
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-600/5 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-sm">
                        <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed font-medium ${
                      isUser
                        ? "bg-gradient-to-b from-indigo-500 to-indigo-600 text-white rounded-tr-sm shadow-lg shadow-indigo-600/15"
                        : "bg-[#0c0c0f] border border-white/[0.06] text-slate-200 rounded-tl-sm whitespace-pre-line shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] shadow-md"
                    }`}>
                      {text}
                    </div>
                  </div>
                );
              })}

            {/* Typing Indicator */}
            {isPending && (
              <div className="flex gap-3.5 mr-auto max-w-[80%] items-end animate-fade-in">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-600/5 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="bg-[#0c0c0f] border border-white/[0.06] p-4 rounded-2xl rounded-tl-sm text-xs text-slate-400 font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span>Agent is processing your request</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/[0.05] bg-gradient-to-t from-[#0c0c0f]/50 to-transparent backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAgentChatSubmit();
          }}
          className="relative max-w-3xl mx-auto w-full"
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-500 text-xs font-bold leading-none select-none">
            <span>&gt;</span>
            <span className="text-emerald-500">_</span>
          </div>
          <input
            type="text"
            placeholder="Tell the agent to do something..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isPending}
            className="w-full bg-black/40 border border-white/[0.08] focus:border-indigo-500/40 rounded-xl pl-12 pr-12 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-200 placeholder-slate-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isPending || chatInput.trim() === ""}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 disabled:bg-white/[0.02] disabled:border-white/[0.02] disabled:text-slate-600 text-white font-semibold text-xs transition-all duration-200 active:scale-[0.96] shadow-lg shadow-indigo-600/15"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
