"use client";

import React from "react";
import { Mic, ShieldCheck, AlertCircle, X } from "lucide-react";

interface ConsentModalProps {
  isOpen: boolean;
  onConsent: () => void;
  onCancel: () => void;
}

export function ConsentModal({ isOpen, onConsent, onCancel }: ConsentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-left space-y-5">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Microphone & Call Recording</h3>
            <p className="text-xs text-slate-400">SalesPulse AI Consent Verification</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-2 leading-relaxed">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Audio Recording:</strong> This demonstration records your microphone stream via browser MediaRecorder for immediate post-call audio playback.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>
              <strong>Speech-to-Text & AI Analysis:</strong> Your spoken dialogue is transcribed in real-time and analyzed by AI to generate a post-call CRM summary.
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Recordings and transcripts are stored securely in your browser&apos;s local IndexedDB and never uploaded to public servers without your knowledge.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConsent}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-indigo-500 to-sky-500 text-white hover:from-indigo-600 hover:to-sky-600 shadow-md shadow-indigo-500/20 transition-all font-semibold"
          >
            I Consent & Start Call
          </button>
        </div>
      </div>
    </div>
  );
}
