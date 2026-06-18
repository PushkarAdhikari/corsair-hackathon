import Link from "next/link";

const features = [
  {
    icon: (
      <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
    title: "AI Agent Chat",
    desc: "Control Gmail and Calendar through natural language — send emails, schedule events, and check your day with plain English commands.",
    gradient: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-500/20",
    iconBg: "text-emerald-400",
  },
  {
    icon: (
      <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    title: "Smart Inbox",
    desc: "AI-classified priority sorting (high/medium/low) with semantic search across your entire cached inbox using vector embeddings.",
    gradient: "from-indigo-500/20 to-indigo-600/10",
    border: "border-indigo-500/20",
    iconBg: "text-indigo-400",
  },
  {
    icon: (
      <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: "Calendar Command",
    desc: "Schedule, reschedule, RSVP, and quick-add events using natural language — \"Meet Pushkar at 3 PM tomorrow\" just works.",
    gradient: "from-amber-500/20 to-amber-600/10",
    border: "border-amber-500/20",
    iconBg: "text-amber-400",
  },
  {
    icon: (
      <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Real-time Sync",
    desc: "Webhook-powered instant updates via Corsair — new emails and calendar changes appear without manual refreshing or polling.",
    gradient: "from-cyan-500/20 to-cyan-600/10",
    border: "border-cyan-500/20",
    iconBg: "text-cyan-400",
  },
  {
    icon: (
      <svg className="h-5 w-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    title: "Gmail Integration",
    desc: "Full Gmail API integration via Corsair — read threads, compose, reply, search, and manage your inbox from one place.",
    gradient: "from-rose-500/20 to-rose-600/10",
    border: "border-rose-500/20",
    iconBg: "text-rose-400",
  },
  {
    icon: (
      <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Keyboard-first",
    desc: "Superhuman-style shortcuts for power users — j/k to navigate, c to compose, r to reply, / to search, and 1-5 to switch tabs.",
    gradient: "from-purple-500/20 to-purple-600/10",
    border: "border-purple-500/20",
    iconBg: "text-purple-400",
  },
];

const techStack = [
  { name: "Next.js", color: "text-white" },
  { name: "TypeScript", color: "text-blue-400" },
  { name: "PostgreSQL", color: "text-cyan-400" },
  { name: "Corsair", color: "text-indigo-400" },
  { name: "Gemini AI", color: "text-emerald-400" },
  { name: "Tailwind CSS", color: "text-sky-400" },
];

const steps = [
  {
    num: "01",
    title: "Connect Your Accounts",
    desc: "Authorize Gmail and Google Calendar through the Corsair integration layer. Your data stays synced in real-time via webhooks.",
  },
  {
    num: "02",
    title: "AI Manages Your Workflow",
    desc: "Emails are automatically classified by priority. Semantic search with vector embeddings lets you find anything instantly.",
  },
  {
    num: "03",
    title: "Chat to Get Things Done",
    desc: "Tell the AI agent what you need in plain English — send emails, schedule meetings, check your calendar. No clicking around.",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] rounded-full bg-indigo-800/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] rounded-full bg-purple-800/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-emerald-800/5 blur-[120px] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ==================== HERO ==================== */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-28 pb-16 text-center w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-full text-xs font-medium text-indigo-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          Powered by Corsair Integration Layer
        </div>

        <h1 className="mt-8 text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Your{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            AI-Powered
          </span>{" "}
          <br />
          Command Center
        </h1>

        <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
          Email, Calendar, and AI — unified. Read and send emails, schedule events,
          and search everything using natural language. Powered by Corsair&apos;s integration layer
          and Gemini AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <Link
            href="/dashboard"
            className="group relative px-10 py-4 rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            <span className="relative">Launch Dashboard</span>
            <svg className="relative h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>

          <a
            href="#features"
            className="px-10 py-4 rounded-2xl border border-white/[0.1] hover:border-white/[0.2] text-slate-300 hover:text-white font-semibold text-sm transition-all duration-300 hover:bg-white/[0.03] flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
            Explore Features
          </a>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section id="features" className="relative z-10 px-4 py-20 w-full max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              move faster
            </span>
          </h2>
          <p className="mt-3 text-slate-400 text-sm max-w-lg mx-auto">
            Gmail and Calendar management, supercharged with AI — all from a single dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 text-left hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5"
            >
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${f.gradient} border ${f.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>
              <h3 className="mt-4 text-sm font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== TECH STACK ==================== */}
      <section className="relative z-10 px-4 py-16 w-full max-w-4xl mx-auto text-center">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Built with</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {techStack.map((t) => (
            <span
              key={t.name}
              className={`${t.color} px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-bold tracking-wide`}
            >
              {t.name}
            </span>
          ))}
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="relative z-10 px-4 py-20 w-full max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Get started in{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              three steps
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.num} className="text-center">
              <div className="text-4xl font-extrabold bg-gradient-to-b from-white/[0.06] to-white/[0.02] bg-clip-text text-transparent">
                {s.num}
              </div>
              <h3 className="mt-4 text-sm font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="relative z-10 px-4 py-20 w-full max-w-2xl mx-auto text-center">
        <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06] rounded-3xl p-12">
          <h2 className="text-2xl font-extrabold tracking-tight">
            Ready to take control?
          </h2>
          <p className="mt-3 text-sm text-slate-400 max-w-md mx-auto">
            Your email and calendar should work for you, not the other way around.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 mt-8 px-10 py-4 rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
          >
            Launch Dashboard
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="relative z-10 w-full border-t border-white/[0.05] py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="font-medium">
            Built with{" "}
            <a href="https://corsair.dev" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Corsair
            </a>{" "}
            for the Corsair Hackathon
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
