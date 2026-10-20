"use client";

import React, { useState } from "react";
import { History, Trash2, Clock, Calendar, Volume2, ChevronDown, ChevronUp, Bot, User } from "lucide-react";
import { CallRecord } from "@/types";
import { getStatusBadgeStyle } from "./AISummaryCard";

interface CallHistoryDrawerProps {
  records: CallRecord[];
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export function CallHistoryDrawer({
  records,
  onDeleteRecord,
  onClearAll,
}: CallHistoryDrawerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5 text-left">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-slate-100">Call History & Persistence</h3>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
            {records.length}
          </span>
        </div>

        {records.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
            title="Clear all calls"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs sm:text-sm">
          No previous calls recorded yet. Complete a sales call to view its audio recording, transcript, and AI summary here.
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((rec) => {
            const badge = getStatusBadgeStyle(rec.status);
            const isExpanded = expandedId === rec.id;
            const dateStr = new Date(rec.timestamp).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={rec.id}
                className="bg-slate-800/40 border border-slate-800/80 hover:border-slate-700 rounded-xl overflow-hidden transition-all"
              >
                {/* Summary Row */}
                <div
                  onClick={() => toggleExpand(rec.id)}
                  className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {rec.status}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {dateStr}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {Math.floor(rec.durationSeconds / 60)}:{(rec.durationSeconds % 60).toString().padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRecord(rec.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition-colors"
                      title="Delete call"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details: Audio Player + Transcripts */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-4 text-xs animate-fade-in">
                    {/* Audio Player */}
                    {rec.audioBlobUrl && (
                      <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-indigo-400 font-medium text-[11px]">
                          <Volume2 className="w-3.5 h-3.5" /> Replay Call Recording
                        </div>
                        <audio controls src={rec.audioBlobUrl} className="w-full h-8 outline-none" />
                      </div>
                    )}

                    {/* Summary Overview */}
                    {rec.summary && (
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
                          AI Executive Summary
                        </span>
                        <p className="text-slate-200 leading-relaxed bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                          {rec.summary.overview}
                        </p>
                      </div>
                    )}

                    {/* Full Transcript */}
                    <div className="space-y-2">
                      <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
                        Full Conversation Transcript ({rec.transcripts.length} entries)
                      </span>
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                        {rec.transcripts.map((m) => (
                          <div
                            key={m.id}
                            className={`p-2.5 rounded-lg flex items-start gap-2 ${
                              m.sender === "bot"
                                ? "bg-slate-800/60 text-slate-200"
                                : "bg-indigo-950/40 border border-indigo-500/20 text-indigo-200"
                            }`}
                          >
                            {m.sender === "bot" ? (
                              <Bot className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 text-[11px] leading-relaxed">
                              <span className="font-semibold opacity-75 mr-1.5">
                                {m.sender === "bot" ? "Alex:" : "Prospect:"}
                              </span>
                              <span>{m.text}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
