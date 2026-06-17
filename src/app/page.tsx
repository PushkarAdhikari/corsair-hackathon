import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16 text-center z-10">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/[0.08] rounded-full text-xs font-medium text-indigo-300">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Powered by Corsair Integration Layer
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent max-w-3xl leading-tight">
          Your Intelligent <br />
          <span className="text-indigo-400">Workspace Dashboard</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed mt-2">
          Sync your emails, draft responses, and schedule calendar invites seamlessly using Google Calendar & Gmail plugins.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2 group"
          >
            Enter Workspace Hub
            <svg
              className="h-4 w-4 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mt-16 w-full">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 text-left">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-rose-400">✉</span> Gmail Service
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Read current threads, compose and send base64-encoded messages to anywhere.
            </p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 text-left">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-blue-400">📅</span> Calendar Service
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Retrieve full timetables, schedule new events, set durations, and keep updated.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
