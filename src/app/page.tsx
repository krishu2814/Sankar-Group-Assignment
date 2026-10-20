import React from "react";
import { PhoneCall, Sparkles, Mic, History, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          Sankar Group Intern Assignment
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
          SalesPulse Voice AI Agent
        </h1>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Interactive voice bot capable of selling B2B SaaS through conversational voice dialogues, real-time transcription, audio recording, automated summaries, and CRM status classification.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 font-medium text-sm">
              <Mic className="w-4 h-4" /> Real-time Voice
            </div>
            <p className="text-xs text-slate-400">Interactive voice conversation with Web Speech STT/TTS.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1">
            <div className="flex items-center gap-2 text-sky-400 font-medium text-sm">
              <PhoneCall className="w-4 h-4" /> Live Call Controls
            </div>
            <p className="text-xs text-slate-400">Consent, live transcript, duration timer, and audio recorder.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
              <History className="w-4 h-4" /> AI CRM Insights
            </div>
            <p className="text-xs text-slate-400">Automated post-call summary, 6 sales statuses, and call history.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" /> Phase 1 Setup Verified
          </span>
          <span>Next.js 14 • TypeScript • Tailwind CSS</span>
        </div>
      </div>
    </main>
  );
}
