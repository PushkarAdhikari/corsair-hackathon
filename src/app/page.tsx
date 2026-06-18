import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] rounded-full bg-indigo-800/15 blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] rounded-full bg-purple-800/15 blur-[140px] pointer-events-none animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-cyan-800/8 blur-[120px] pointer-events-none" />

      {/* Grid overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16 text-center z-10">
        {/* Badge */}
        <div className="animate-fade-in flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-full text-xs font-medium text-indigo-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse-glow" />
          Powered by Corsair Integration Layer
        </div>

        {/* Hero Title */}
        <h1 className="animate-fade-in text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent max-w-3xl leading-tight" style={{ animationDelay: "0.1s" }}>
          Your Intelligent <br />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Workspace Dashboard</span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed mt-2" style={{ animationDelay: "0.2s" }}>
          Sync your emails, draft responses, and schedule calendar invites seamlessly using Google Calendar & Gmail plugins.
        </p>

        {/* CTA */}
        <div className="animate-fade-in flex flex-col sm:flex-row gap-4 mt-6" style={{ animationDelay: "0.3s" }}>
          <Link
            href="/dashboard"
            className="group relative px-10 py-4 rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            <span className="relative">Enter Workspace Hub</span>
            <svg
              className="relative h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300"
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

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mt-16 w-full">
          <div className="animate-fade-in group bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 text-left hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500/20 to-rose-600/10 border border-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="h-4 w-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              Gmail Service
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Read current threads, compose and send base64-encoded messages to anywhere.
            </p>
          </div>
          <div className="animate-fade-in group bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 text-left hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5" style={{ animationDelay: "0.5s" }}>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              Calendar Service
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
