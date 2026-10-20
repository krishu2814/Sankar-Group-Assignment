"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  PhoneCall,
  Sparkles,
  History,
  BookOpen,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { Message, CallState, AISummary, CallRecord } from "@/types";
import { INITIAL_BOT_GREETING } from "@/lib/saasProduct";
import { saveCallRecord, getAllCallRecords, deleteCallRecord, clearAllCalls } from "@/lib/db";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

import { CallControls } from "@/components/CallControls";
import { LiveTranscript } from "@/components/LiveTranscript";
import { AISummaryCard } from "@/components/AISummaryCard";
import { CallHistoryDrawer } from "@/components/CallHistoryDrawer";
import { ConsentModal } from "@/components/ConsentModal";
import { ProductCheatSheetModal } from "@/components/ProductCheatSheetModal";

export default function Home() {
  const [callState, setCallState] = useState<CallState>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<"call" | "history">("call");

  // Modals
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);

  // Post-call data
  const [latestSummary, setLatestSummary] = useState<AISummary | null>(null);
  const [latestAudioUrl, setLatestAudioUrl] = useState<string | null>(null);
  const [callDurationAtEnd, setCallDurationAtEnd] = useState(0);

  // Persisted History
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);

  // Speech Hooks
  const { speak, cancel: cancelSpeech, isSpeaking: isBotSpeaking } = useSpeechSynthesis();
  const {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    resetRecording,
    permissionError,
  } = useAudioRecorder();

  // Reference to always hold latest messages for async callbacks
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  // Load history on mount
  useEffect(() => {
    getAllCallRecords()
      .then((records) => setCallHistory(records))
      .catch((err) => console.warn("Failed to load call history:", err));
  }, []);

  // Dispatch customer utterance to /api/chat and speak response
  const handleUserSpeech = useCallback(
    async (spokenText: string) => {
      if (!spokenText.trim() || isMuted || callState !== "in-call") return;

      const userMsg: Message = {
        id: `user_${Date.now()}`,
        sender: "user",
        text: spokenText.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const updatedMessages = [...messagesRef.current, userMsg];
      setMessages(updatedMessages);

      // Anti-echo: Pause mic listening while bot formulates and speaks
      pauseListening();
      setIsBotThinking(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages }),
        });

        const data = await res.json();
        const botReply = data.text || "I understand. Would you like to schedule a 15-minute live demo?";

        const botMsg: Message = {
          id: `bot_${Date.now()}`,
          sender: "bot",
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, botMsg]);
        setIsBotThinking(false);

        // Speak the reply out loud, and resume mic listening only after speaking completes
        speak(botReply, {
          onStart: () => pauseListening(),
          onEnd: () => {
            if (!isMuted && callState === "in-call") {
              resumeListening();
            }
          },
        });
      } catch (err) {
        console.error("Error communicating with chat API:", err);
        setIsBotThinking(false);
        resumeListening();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callState, isMuted, speak]
  );

  const {
    isListening,
    interimTranscript,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    resetTranscript,
  } = useSpeechRecognition({
    onSentenceComplete: handleUserSpeech,
  });

  // Start Call Handler (Prompt Consent First)
  const handleStartCallClick = () => {
    setIsConsentModalOpen(true);
  };

  // User Consented ➔ Initialize Voice Call
  const handleConsentApproved = async () => {
    setIsConsentModalOpen(false);
    setCallState("connecting");
    setLatestSummary(null);
    setLatestAudioUrl(null);
    resetTranscript();

    // Start Audio Recording
    const recordingStarted = await startRecording();
    if (!recordingStarted) {
      setCallState("idle");
      return;
    }

    // Bot Opening Greeting
    const greetingMsg: Message = {
      id: `bot_${Date.now()}`,
      sender: "bot",
      text: INITIAL_BOT_GREETING,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([greetingMsg]);
    setCallState("in-call");

    // Speak initial greeting
    speak(INITIAL_BOT_GREETING, {
      onStart: () => pauseListening(),
      onEnd: () => {
        startListening();
      },
    });
  };

  // End Call Handler
  const handleEndCall = async () => {
    setCallState("processing");
    stopListening();
    cancelSpeech();

    const finalDuration = recordingDuration;
    setCallDurationAtEnd(finalDuration);

    // Stop MediaRecorder and extract audio Blob
    const recordingData = await stopRecording();
    const finalAudioBlob = recordingData?.blob;
    const finalAudioUrl = recordingData?.url;

    if (finalAudioUrl) {
      setLatestAudioUrl(finalAudioUrl);
    }

    try {
      // Call /api/summarize for CRM intelligence & 6 sales stages
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcripts: messagesRef.current }),
      });

      const summary: AISummary = await res.json();
      setLatestSummary(summary);

      // Persist full session to IndexedDB
      const record: CallRecord = {
        id: `call_${Date.now()}`,
        timestamp: new Date().toISOString(),
        durationSeconds: finalDuration,
        status: summary.salesStatus,
        transcripts: [...messagesRef.current],
        summary,
        audioBlob: finalAudioBlob,
        audioBlobUrl: finalAudioUrl,
      };

      await saveCallRecord(record);
      setCallHistory((prev) => [record, ...prev]);
    } catch (err) {
      console.error("Failed to generate summary:", err);
    } finally {
      setCallState("completed");
    }
  };

  // Mute Toggle
  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        pauseListening();
      } else {
        resumeListening();
      }
      return next;
    });
  };

  // Delete Call from History
  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteCallRecord(id);
      setCallHistory((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to delete record:", err);
    }
  };

  // Automated Call Simulation for Reviewers / Noisy Environments
  const handleRunSimulation = async () => {
    setCallState("connecting");
    setLatestSummary(null);
    setLatestAudioUrl(null);
    resetTranscript();

    const simMessages: Message[] = [
      {
        id: `bot_${Date.now()}_1`,
        sender: "bot",
        text: INITIAL_BOT_GREETING,
        timestamp: "00:01",
      },
      {
        id: `user_${Date.now()}_2`,
        sender: "user",
        text: "We currently monitor 25 AWS servers with Datadog, but our monthly bill keeps increasing. How does CloudPulse compare?",
        timestamp: "00:08",
      },
      {
        id: `bot_${Date.now()}_3`,
        sender: "bot",
        text: "CloudPulse provides flat pricing starting at $149 for up to 50 nodes with zero hidden per-host overages, cutting your costs by 70%. Plus, our AI diagnoses the exact root cause in under 60 seconds. Would you like to schedule a 15-minute live demo on Thursday?",
        timestamp: "00:18",
      },
      {
        id: `user_${Date.now()}_4`,
        sender: "user",
        text: "That sounds fantastic. Let's schedule a 15-minute live demo this Thursday at 2 PM.",
        timestamp: "00:26",
      },
      {
        id: `bot_${Date.now()}_5`,
        sender: "bot",
        text: "Awesome! I have you booked for Thursday at 2 PM and will send the calendar invitation with the Zoom link shortly.",
        timestamp: "00:32",
      },
    ];

    setCallState("in-call");
    setMessages(simMessages);
    setCallDurationAtEnd(35);

    // Call summarize endpoint
    setCallState("processing");
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcripts: simMessages }),
      });
      const summary: AISummary = await res.json();
      setLatestSummary(summary);

      const record: CallRecord = {
        id: `call_${Date.now()}`,
        timestamp: new Date().toISOString(),
        durationSeconds: 35,
        status: summary.salesStatus,
        transcripts: simMessages,
        summary,
      };

      await saveCallRecord(record);
      setCallHistory((prev) => [record, ...prev]);
    } catch (err) {
      console.error("Simulation summary error:", err);
    } finally {
      setCallState("completed");
    }
  };

  // Clear All Call History
  const handleClearAll = async () => {
    try {
      await clearAllCalls();
      setCallHistory([]);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8">
      {/* Top Banner Navigation */}
      <header className="max-w-5xl w-full flex flex-wrap items-center justify-between gap-4 py-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 text-white shadow-lg shadow-indigo-500/20">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                SalesPulse AI
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Sankar Group
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous B2B SaaS Voice Sales Agent</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCheatSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-xs text-slate-300 font-medium transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            Product Blueprint
          </button>

          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("call")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === "call"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Live Call
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "history"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History ({callHistory.length})
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-5xl w-full space-y-6">
        {/* Browser Speech Compatibility Warning */}
        {!isSpeechSupported && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Your browser doesn&apos;t support the native Web Speech API. For full hands-free voice experience, please open in <strong>Google Chrome, Microsoft Edge, or Safari</strong>. You can still use the text input below.
            </span>
          </div>
        )}

        {/* Microphone Permission Error */}
        {permissionError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{permissionError}</span>
          </div>
        )}

        {activeTab === "call" ? (
          <>
            {/* Call Controls Bar */}
            <CallControls
              callState={callState}
              durationSeconds={callState === "completed" ? callDurationAtEnd : recordingDuration}
              isMuted={isMuted}
              isBotSpeaking={isBotSpeaking}
              isUserSpeaking={isListening && Boolean(interimTranscript)}
              onStartCall={handleStartCallClick}
              onEndCall={handleEndCall}
              onToggleMute={handleToggleMute}
              onRunSimulation={handleRunSimulation}
            />

            {/* Live Transcript Screen */}
            <LiveTranscript
              messages={messages}
              interimTranscript={interimTranscript}
              isListening={isListening && !isMuted}
              isBotThinking={isBotThinking}
              onSendTextMessage={handleUserSpeech}
              isInCall={callState === "in-call"}
            />

            {/* Post-Call Summary Card */}
            {callState === "completed" && latestSummary && (
              <AISummaryCard
                summary={latestSummary}
                audioBlobUrl={latestAudioUrl || undefined}
                durationSeconds={callDurationAtEnd}
              />
            )}
          </>
        ) : (
          /* Call History Drawer */
          <CallHistoryDrawer
            records={callHistory}
            onDeleteRecord={handleDeleteRecord}
            onClearAll={handleClearAll}
          />
        )}
      </div>

      {/* Consent Modal */}
      <ConsentModal
        isOpen={isConsentModalOpen}
        onConsent={handleConsentApproved}
        onCancel={() => setIsConsentModalOpen(false)}
      />

      {/* Product Blueprint / Cheat Sheet Modal */}
      <ProductCheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />
    </main>
  );
}
