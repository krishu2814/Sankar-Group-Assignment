"use client";

import React from "react";
import { X, Sparkles, DollarSign, Shield, Zap, MessageSquareQuote } from "lucide-react";
import { CLOUDPULSE_PRODUCT } from "@/lib/saasProduct";

interface ProductCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProductCheatSheetModal({ isOpen, onClose }: ProductCheatSheetModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-left space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" /> B2B SaaS Product Blueprint
          </div>
          <h2 className="text-xl font-bold text-slate-100">{CLOUDPULSE_PRODUCT.name}</h2>
          <p className="text-xs text-slate-400">{CLOUDPULSE_PRODUCT.tagline}</p>
        </div>

        {/* Overview & Audience */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2 text-xs">
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
            Target Audience & Problem
          </span>
          <p className="text-slate-300 leading-relaxed">{CLOUDPULSE_PRODUCT.overview}</p>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <DollarSign className="w-3.5 h-3.5" /> Starter
            </div>
            <p className="text-xs text-slate-200 font-semibold">$49 / mo</p>
            <p className="text-[11px] text-slate-400">Up to 10 nodes, Slack alerts, 7-day retention.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-indigo-500/40 space-y-1 bg-indigo-950/20">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
              <Zap className="w-3.5 h-3.5" /> Growth (Popular)
            </div>
            <p className="text-xs text-slate-200 font-semibold">$149 / mo</p>
            <p className="text-[11px] text-slate-400">Up to 50 nodes, AI root-cause analysis, 30-day retention.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
              <Shield className="w-3.5 h-3.5" /> Enterprise
            </div>
            <p className="text-xs text-slate-200 font-semibold">Custom</p>
            <p className="text-[11px] text-slate-400">Unlimited clusters, custom SLA, dedicated support.</p>
          </div>
        </div>

        {/* Interactive Testing Suggestions */}
        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <MessageSquareQuote className="w-4 h-4 text-indigo-400" />
            Recommended Voice Prompts to Try on Call:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <strong className="text-indigo-400 block mb-0.5">Competitor Objection:</strong>
              &ldquo;We already use Datadog and AWS CloudWatch.&rdquo;
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <strong className="text-indigo-400 block mb-0.5">Pricing Question:</strong>
              &ldquo;How much does this cost per month?&rdquo;
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <strong className="text-indigo-400 block mb-0.5">Demo Request:</strong>
              &ldquo;Can we schedule a 15-minute live demo on Thursday?&rdquo;
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <strong className="text-indigo-400 block mb-0.5">Conversion / Sign Up:</strong>
              &ldquo;I want to sign up for the Starter plan right now.&rdquo;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
