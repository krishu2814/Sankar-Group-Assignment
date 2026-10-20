"use client";

import React from "react";
import { Sparkles, CheckCircle, HelpCircle, ArrowRight, Play, Volume2 } from "lucide-react";
import { AISummary, SalesStatus } from "@/types";

interface AISummaryCardProps {
  summary: AISummary;
  audioBlobUrl?: string;
  durationSeconds?: number;
}

export function getStatusBadgeStyle(status: SalesStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case "Converted":
      return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" };
    case "Demo Requested":
      return { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" };
    case "Interested":
      return { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/30" };
    case "Follow-up Required":
      return { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" };
    case "Not Interested":
      return { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" };
    case "No Response":
    default:
      return { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/30" };
  }
}

export function AISummaryCard({ summary, audioBlobUrl, durationSeconds }: AISummaryCardProps) {
  const badge = getStatusBadgeStyle(summary.salesStatus);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6 text-left animate-fade-in">
      {/* Header & Status Qualification */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Post-Call AI CRM Analysis</h3>
            <p className="text-xs text-slate-400">Automated 6-stage deal qualification</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Deal Stage:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border} shadow-sm`}
          >
            {summary.salesStatus}
          </span>
        </div>
      </div>

      {/* Audio Playback Player */}
      {audioBlobUrl && (
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-medium text-indigo-400">
              <Volume2 className="w-4 h-4" /> Call Audio Recording (Consent Verified)
            </span>
            {durationSeconds !== undefined && (
              <span className="font-mono text-slate-400 text-[11px]">
                {Math.floor(durationSeconds / 60)}:{(durationSeconds % 60).toString().padStart(2, "0")}
              </span>
            )}
          </div>
          <audio controls src={audioBlobUrl} className="w-full h-8 rounded-lg outline-none" />
        </div>
      )}

      {/* Conversation Overview */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Executive Overview
        </h4>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
          {summary.overview}
        </p>
      </div>

      {/* Requirements & Objections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Requirements */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <CheckCircle className="w-4 h-4" /> Customer Requirements
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {summary.customerRequirements.map((req, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Objections */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <HelpCircle className="w-4 h-4" /> Objections Raised
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {summary.objections.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Next Steps */}
      <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
          <ArrowRight className="w-4 h-4" /> Recommended Next Steps
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {summary.nextSteps}
        </p>
      </div>
    </div>
  );
}
