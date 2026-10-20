"use client";

import React from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, Sparkles, Clock } from "lucide-react";
import { CallState } from "@/types";
import { AudioWaveform } from "./AudioWaveform";

interface CallControlsProps {
  callState: CallState;
  durationSeconds: number;
  isMuted: boolean;
  isBotSpeaking: boolean;
  isUserSpeaking: boolean;
  onStartCall: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onRunSimulation?: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function CallControls({
  callState,
  durationSeconds,
  isMuted,
  isBotSpeaking,
  isUserSpeaking,
  onStartCall,
  onEndCall,
  onToggleMute,
  onRunSimulation,
}: CallControlsProps) {
  const isInCall = callState === "in-call";
  const isConnecting = callState === "connecting";
  const isProcessing = callState === "processing";

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
      {/* Status & Timer & Waveform */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          {callState === "in-call" && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          )}
          {callState === "connecting" && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          )}
          {callState === "processing" && (
            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
          )}
          {callState === "idle" && (
            <span className="inline-flex rounded-full h-3 w-3 bg-slate-600"></span>
          )}
          {callState === "completed" && (
            <span className="inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
          )}

          <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">
            {callState === "in-call" && "Live Call"}
            {callState === "connecting" && "Connecting..."}
            {callState === "processing" && "Analyzing Insights..."}
            {callState === "idle" && "Ready to Call"}
            {callState === "completed" && "Call Ended"}
          </span>
        </div>

        {/* Live Call Duration */}
        {(isInCall || callState === "completed") && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {formatDuration(durationSeconds)}
          </div>
        )}

        {/* Live Audio Waveform when in call */}
        {isInCall && (
          <div className="flex items-center gap-2">
            <AudioWaveform
              isActive={isBotSpeaking || isUserSpeaking}
              color={isUserSpeaking ? "emerald" : "indigo"}
            />
            <div className="hidden lg:flex items-center gap-1.5 text-[11px]">
              {isBotSpeaking && (
                <span className="flex items-center gap-1 text-indigo-400 font-medium">
                  <Volume2 className="w-3.5 h-3.5" /> Alex Speaking
                </span>
              )}
              {isUserSpeaking && !isBotSpeaking && (
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Mic className="w-3.5 h-3.5" /> Listening to You
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Simulation Shortcut for Silent Environments / Interview Reviewers */}
        {!isInCall && onRunSimulation && (
          <button
            onClick={onRunSimulation}
            disabled={isConnecting || isProcessing}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-xs text-slate-300 font-medium transition-all disabled:opacity-50"
            title="Simulate a 3-turn sales call without speaking aloud"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Simulate Call
          </button>
        )}

        {isInCall && (
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
            className={`p-2.5 rounded-xl border transition-all ${
              isMuted
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
            title={isMuted ? "Unmute microphone" : "Mute microphone"}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        )}

        {!isInCall ? (
          <button
            onClick={onStartCall}
            disabled={isConnecting || isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            <Phone className="w-4 h-4" />
            {callState === "completed" ? "Start New Call" : "Start Voice Call"}
          </button>
        ) : (
          <button
            onClick={onEndCall}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs sm:text-sm shadow-lg shadow-rose-600/25 transition-all"
          >
            <PhoneOff className="w-4 h-4" />
            End Call
          </button>
        )}
      </div>
    </div>
  );
}
