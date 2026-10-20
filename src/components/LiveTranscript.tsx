"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bot, User, Send, Mic, Sparkles } from "lucide-react";
import { Message } from "@/types";

interface LiveTranscriptProps {
  messages: Message[];
  interimTranscript: string;
  isListening: boolean;
  isBotThinking: boolean;
  onSendTextMessage?: (text: string) => void;
  isInCall: boolean;
}

export function LiveTranscript({
  messages,
  interimTranscript,
  isListening,
  isBotThinking,
  onSendTextMessage,
  isInCall,
}: LiveTranscriptProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [typedMessage, setTypedMessage] = useState("");

  // Auto scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, interimTranscript, isBotThinking]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !onSendTextMessage) return;
    onSendTextMessage(typedMessage.trim());
    setTypedMessage("");
  };

  return (
    <div className="flex flex-col h-[420px] sm:h-[480px] w-full bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/90 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          Live Conversation Transcript
        </span>
        <span className="text-slate-500">
          {messages.length} message{messages.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Message Feed */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scroll-smooth"
      >
        {messages.length === 0 && !interimTranscript && (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2 p-6">
            <Bot className="w-8 h-8 text-slate-600" />
            <p className="text-xs sm:text-sm">
              {isInCall
                ? "Connecting to sales agent... Voice conversation will appear here."
                : "Click 'Start Voice Call' above to begin your interactive sales pitch."}
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isBot = msg.sender === "bot";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                isBot ? "justify-start" : "justify-end"
              } animate-fade-in`}
            >
              {isBot && (
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  isBot
                    ? "bg-slate-800/90 border border-slate-700/60 text-slate-100 rounded-tl-sm shadow-md"
                    : "bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-600/20"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-75">
                  <span className="font-semibold tracking-wide">
                    {isBot ? "Alex (CloudPulse AI)" : "You (Prospect)"}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>

              {!isBot && (
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Real-time Interim User Utterance */}
        {interimTranscript && (
          <div className="flex items-start gap-3 justify-end animate-pulse">
            <div className="max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 rounded-tr-sm shadow-sm">
              <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 mb-1">
                <Mic className="w-3 h-3 animate-bounce" />
                <span>Transcribing your speech in real-time...</span>
              </div>
              <p className="italic">{interimTranscript}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Bot Thinking Indicator */}
        {isBotThinking && (
          <div className="flex items-start gap-3 justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="rounded-2xl p-3 bg-slate-800/80 border border-slate-700/60 rounded-tl-sm flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              <span>Alex is formulating response...</span>
            </div>
          </div>
        )}
      </div>

      {/* Optional Text Fallback Input Bar */}
      {isInCall && (
        <form
          onSubmit={handleSend}
          className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            placeholder="Type a message or speak naturally into your microphone..."
            className="flex-1 bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!typedMessage.trim()}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all"
            title="Send text message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
