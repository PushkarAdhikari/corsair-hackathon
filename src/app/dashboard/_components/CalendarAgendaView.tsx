"use client";

import React from "react";

interface CalendarEvent {
  id?: string;
  summary?: string;
  description?: string;
  hangoutLink?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
  attendees?: Array<{
    email?: string;
    displayName?: string;
    responseStatus?: string;
    self?: boolean;
  }>;
}

interface CalendarAgendaViewProps {
  liveCalendarData: { items?: CalendarEvent[] } | undefined;
  liveCalendarLoading: boolean;
  calendarConnected: boolean;
  isSandboxMode: boolean;
  selectedEventId: string;
  setSelectedEventId: (val: string) => void;
  quickAddText: string;
  setQuickAddText: (val: string) => void;
  quickAddIsPending: boolean;
  quickAddMutate: (args: { text: string }) => void;
  respondEventIsPending: boolean;
  respondEventMutate: (args: { id: string; responseStatus: "accepted" | "declined" | "tentative" }) => void;
  deleteEventIsPending: boolean;
  deleteEventMutate: (args: { id: string }) => void;
  invalidateEvents: () => void;
}

export function CalendarAgendaView({
  liveCalendarData,
  liveCalendarLoading,
  calendarConnected: _calendarConnected,
  isSandboxMode: _isSandboxMode,
  selectedEventId,
  setSelectedEventId,
  quickAddText,
  setQuickAddText,
  quickAddIsPending,
  quickAddMutate,
  respondEventIsPending,
  respondEventMutate,
  deleteEventIsPending,
  deleteEventMutate,
  invalidateEvents,
}: CalendarAgendaViewProps) {
  return (
    <div className="flex flex-row h-full w-full overflow-hidden">
      {/* Center: Event Detail */}
      <div className="flex-grow flex flex-col justify-center items-center p-8 overflow-y-auto">
        {selectedEventId && liveCalendarData?.items?.find((e) => e.id === selectedEventId) ? (
          (() => {
            const event = liveCalendarData?.items?.find((e) => e.id === selectedEventId);
            if (!event?.id) return null;
            const startVal = event.start?.dateTime ?? event.start?.date;
            const endVal = event.end?.dateTime ?? event.end?.date;
            const dateStart = startVal ? new Date(startVal) : new Date();
            const dateEnd = endVal ? new Date(endVal) : new Date();
            const isAllDay = !event.start?.dateTime && !!event.start?.date;
            const userAttendee = event.attendees?.find((a) => a.self);
            const status = userAttendee?.responseStatus ?? "needsAction";

            return (
              <div className="max-w-2xl w-full bg-gradient-to-b from-[#0e0e11] to-[#0c0c0f] border border-white/[0.06] rounded-2xl p-8 space-y-6 shadow-2xl shadow-black/40 relative animate-scale-in">
                {/* Close */}
                <button
                  type="button"
                  onClick={() => setSelectedEventId("")}
                  className="absolute top-4 right-4 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all duration-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close
                </button>

                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider ${
                      status === "accepted"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : status === "declined"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : status === "tentative"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                    }`}>
                      {status === "needsAction" ? "Needs Action" : status}
                    </span>
                    {event.hangoutLink && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/15 text-indigo-300 text-[9px] font-semibold">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Video Call
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white leading-tight tracking-tight">{event.summary ?? "(No Title)"}</h2>
                </div>

                {/* Time Details */}
                <div className="grid grid-cols-2 gap-4 bg-gradient-to-b from-white/[0.02] to-white/[0.01] p-5 border border-white/[0.05] rounded-xl">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Start</p>
                    <p className="text-xs font-semibold text-white">
                      {dateStart.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {isAllDay ? "All Day" : dateStart.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">End</p>
                    <p className="text-xs font-semibold text-white">
                      {dateEnd.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {isAllDay ? "All Day" : dateEnd.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Description</p>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium bg-white/[0.01] border border-white/[0.04] rounded-xl p-4 min-h-[80px] whitespace-pre-wrap">
                    {event.description ?? "No description provided."}
                  </p>
                </div>

                {/* Attendees */}
                {event.attendees && event.attendees.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Attendees ({event.attendees.length})</p>
                    <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-2">
                      {event.attendees.map((attendee, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-white/[0.01] border border-white/[0.04] px-3.5 py-2.5 rounded-xl text-xs hover:bg-white/[0.02] transition-colors duration-150"
                        >
                          <span className="font-medium text-slate-200 line-clamp-1">{attendee.displayName ?? attendee.email}</span>
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wide ${
                            attendee.responseStatus === "accepted"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                              : attendee.responseStatus === "declined"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/15"
                                : attendee.responseStatus === "tentative"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/15"
                                  : "bg-slate-500/10 text-slate-400 border border-slate-500/15"
                          }`}>
                            {attendee.responseStatus === "needsAction" ? "Pending" : attendee.responseStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* RSVP Actions */}
                {(userAttendee ?? !isAllDay) && (
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/[0.06]">
                    <div className="flex gap-2">
                      {userAttendee && (
                        <>
                          <button
                            type="button"
                            onClick={() => respondEventMutate({ id: event.id!, responseStatus: "accepted" })}
                            disabled={respondEventIsPending}
                            className="bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-emerald-600/15"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => respondEventMutate({ id: event.id!, responseStatus: "tentative" })}
                            disabled={respondEventIsPending}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                            </svg>
                            Maybe
                          </button>
                          <button
                            type="button"
                            onClick={() => respondEventMutate({ id: event.id!, responseStatus: "declined" })}
                            disabled={respondEventIsPending}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Decline
                          </button>
                        </>
                      )}
                    </div>

                    {!isAllDay && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Are you sure you want to cancel this event?")) {
                            deleteEventMutate({ id: event.id! });
                          }
                        }}
                        disabled={deleteEventIsPending}
                        className="bg-transparent hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-500/20 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                      >
                        Cancel Event
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          /* Empty State */
          <div className="max-w-md text-center py-12 flex flex-col items-center animate-fade-in">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 blur-xl scale-125 pointer-events-none" />
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/5 border border-white/[0.08] flex items-center justify-center relative shadow-2xl">
                <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-white tracking-wide">Google Calendar Connected</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mt-3 font-medium">
              Your calendar schedules are synced via Corsair. Use the agenda panel on the right to RSVP and manage events.
            </p>
          </div>
        )}
      </div>

      {/* Right Panel: Today's Schedule */}
      <div className="w-[380px] border-l border-white/[0.05] bg-[#0c0c0f]/60 flex flex-col shrink-0 h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/[0.05] flex items-center justify-between bg-gradient-to-b from-[#0c0c0f]/80 to-[#0c0c0f]/40">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500/15 to-purple-600/5 border border-indigo-500/15 flex items-center justify-center">
              <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-white tracking-wide">Today&apos;s Schedule</span>
          </div>
          <button
            type="button"
            onClick={invalidateEvents}
            className="p-1.5 rounded-lg hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] text-slate-400 hover:text-white transition-all duration-200"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
            </svg>
          </button>
        </div>

        {/* Quick Add */}
        <div className="p-4 border-b border-white/[0.05] bg-gradient-to-b from-[#0c0c0f]/30 to-transparent">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (quickAddText.trim()) quickAddMutate({ text: quickAddText });
            }}
            className="relative flex items-center gap-2"
          >
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </span>
              <input
                type="text"
                placeholder='e.g. "Meet Pushkar at 3 PM tomorrow"...'
                value={quickAddText}
                onChange={(e) => setQuickAddText(e.target.value)}
                disabled={quickAddIsPending}
                className="w-full bg-black/40 border border-white/[0.08] focus:border-indigo-500/40 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none transition-all duration-200 placeholder-slate-500 focus:ring-1 focus:ring-indigo-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={quickAddIsPending || !quickAddText.trim()}
              className="bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold p-2.5 rounded-xl text-xs transition-all duration-200 ease-in-out flex items-center justify-center shrink-0 active:scale-[0.96] shadow-lg shadow-indigo-600/10 disabled:bg-white/[0.02] disabled:text-slate-600 disabled:border-white/[0.02] disabled:shadow-none"
            >
              {quickAddIsPending ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/20 border-t-white" />
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              )}
            </button>
          </form>
        </div>

        {/* Events List */}
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {liveCalendarLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500/20 border-t-indigo-500 mb-3" />
              <p className="text-xs text-slate-500">Loading events...</p>
            </div>
          ) : !liveCalendarData?.items || liveCalendarData.items.length === 0 ? (
            <div className="p-6 text-center bg-white/[0.01] border border-white/[0.04] rounded-2xl">
              <p className="text-slate-500 text-xs font-semibold">No events found for today.</p>
              <p className="text-[10px] text-slate-600 mt-1">Use quick add above to create one.</p>
            </div>
          ) : (() => {
            const seen = new Set<string>();
            const renderItems = (liveCalendarData.items ?? []).filter((event) => {
              if (!event.id) return true;
              if (seen.has(event.id)) return false;
              seen.add(event.id);
              return true;
            });
            return renderItems.map((event, idx) => {
              const startVal = event.start?.dateTime ?? event.start?.date;
              const dateObj = startVal ? new Date(startVal) : new Date();
              const isSelected = event.id === selectedEventId;
              const userAttendee = event.attendees?.find((a) => a.self);
              const status = userAttendee?.responseStatus ?? "needsAction";
              const isAllDay = !event.start?.dateTime && !!event.start?.date;

              const timeStr = isAllDay
                ? "All Day"
                : dateObj.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });

              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id ?? "")}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-2.5 animate-fade-in ${
                    isSelected
                      ? "bg-gradient-to-b from-indigo-500/10 to-indigo-500/5 border-indigo-500/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]"
                      : "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.03] hover:border-white/[0.08]"
                  }`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="flex justify-between items-center select-none">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        status === "accepted" ? "bg-emerald-500" :
                        status === "declined" ? "bg-rose-500" :
                        status === "tentative" ? "bg-amber-500" :
                        "bg-slate-500"
                      }`} />
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{timeStr}</span>
                    </div>
                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide ${
                      status === "accepted"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                        : status === "declined"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/15"
                          : status === "tentative"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/15"
                            : "bg-slate-500/10 text-slate-400 border border-slate-500/15"
                    }`}>
                      {status === "needsAction" ? "New" : status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-white leading-snug line-clamp-1">{event.summary ?? "(No Title)"}</h4>
                    <p className="text-[11px] text-slate-400 leading-normal line-clamp-2 mt-1 font-medium">{event.description ?? "No description."}</p>
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    {event.hangoutLink ? (
                      <a
                        href={event.hangoutLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-lg text-[9px] font-semibold tracking-wide flex items-center gap-1.5 transition-all select-none"
                      >
                        <svg className="h-3 w-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Join Meet
                      </a>
                    ) : (
                      <div className="text-[9px] text-slate-600 font-bold select-none">No meet link</div>
                    )}

                    {userAttendee && (
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          title="Accept"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (event.id) respondEventMutate({ id: event.id, responseStatus: "accepted" });
                          }}
                          disabled={respondEventIsPending}
                          className={`p-1.5 rounded-md hover:bg-white/[0.06] transition-all duration-150 ${
                            status === "accepted" ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          title="Decline"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (event.id) respondEventMutate({ id: event.id, responseStatus: "declined" });
                          }}
                          disabled={respondEventIsPending}
                          className={`p-1.5 rounded-md hover:bg-white/[0.06] transition-all duration-150 ${
                            status === "declined" ? "text-rose-400 bg-rose-500/10" : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          title="Maybe"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (event.id) respondEventMutate({ id: event.id, responseStatus: "tentative" });
                          }}
                          disabled={respondEventIsPending}
                          className={`p-1.5 rounded-md hover:bg-white/[0.06] transition-all duration-150 ${
                            status === "tentative" ? "text-amber-400 bg-amber-500/10" : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
