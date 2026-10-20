# SalesPulse AI — Technical Interview & Presentation Guide

This guide is prepared to help you confidently present, explain, and defend the **SalesPulse AI** project during your technical interview with **Sankar Group**.

---

## 1. 🎯 60-Second Elevator Pitch

> *"For my assignment, I built **SalesPulse AI**, an interactive voice sales bot designed to qualify B2B SaaS leads over real-time conversational phone calls. It uses native browser Web Speech STT and TTS for zero-latency voice interaction, captures and records the call audio with upfront user consent, and streams the transcript live. When the call concludes, our backend analyzes the dialogue and automatically classifies the prospect into one of six standard deal stages—such as 'Demo Requested' or 'Follow-up Required'—while persisting the full session and audio recordings in IndexedDB."*
>
> 🌐 **Live Demo**: [https://sankar-group-assignment-7udocyxf7-krishu2814.vercel.app/](https://sankar-group-assignment-7udocyxf7-krishu2814.vercel.app/)

---

## 2. 🏛️ Core Architecture & Design Decisions

### A. Why Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) instead of Cloud Whisper / ElevenLabs?
- **Zero API Latency**: Web Speech API runs directly in the browser's audio pipeline. Cloud-based STT (like OpenAI Whisper) requires sending chunks over WebSockets or HTTP, introducing 800ms - 2000ms latency, which breaks the flow of a natural phone conversation.
- **Zero Cost & Reliability**: Web Speech synthesis does not deplete monthly voice quotas during testing or evaluation.
- **Interim Speech Streaming**: Emits live interim transcript events so the user sees their words on screen in real time as they speak.

### B. Anti-Echo Feedback Loop Prevention (Critical Engineering Insight)
- **The Problem**: When the AI sales bot speaks through the user's laptop speakers, the laptop microphone can capture the bot's own voice and re-transcribe it as customer speech, creating an infinite echo loop.
- **Our Solution**:
  - In `useSpeechSynthesis`, when `speak()` begins, we trigger `pauseListening()` on `useSpeechRecognition`.
  - Only when the browser fires `utterance.onend` (the bot finishes speaking) do we trigger `resumeListening()`.

### C. Why IndexedDB instead of `localStorage`?
- **Binary Blob Storage**: `MediaRecorder` outputs raw `audio/webm` Blobs. `localStorage` only supports strings and has a hard 5MB limit. Storing a 2-minute audio file in `localStorage` as base64 immediately crashes with `QuotaExceededError`.
- **IndexedDB**: Supports hundreds of megabytes of binary data, persists across browser reloads, and rehydrates transient `URL.createObjectURL` references on page load.

### D. 6-Stage Deal Qualification Pipeline
Calls are analyzed and classified into:
1. **`Converted`**: Prospect commits to subscription or purchase.
2. **`Interested`**: Prospect has strong positive sentiment and asks qualifying questions.
3. **`Follow-up Required`**: Prospect needs internal team review or requests collateral.
4. **`Not Interested`**: Prospect explicitly declines.
5. **`Demo Requested`**: Prospect agrees to or schedules a live demo walkthrough.
6. **`No Response`**: Call was initiated but no customer speech occurred.

---

## 3. 📹 Video Walkthrough Demonstration Script (2–3 Minutes)

Use this script when recording your demonstration video:

### Scene 1: Introduction (0:00 – 0:30)
- *"Hello! Today I'm demonstrating SalesPulse AI, an autonomous voice sales bot built for the Sankar Group Intern Assignment."*
- Show the dashboard: highlight the clean dark mode, status badge (`Ready to Call`), and click **Product Blueprint** to show *CloudPulse AI* specs (pricing, competitor comparisons, and feature set).

### Scene 2: Live Voice Call & Consent (0:30 – 1:30)
- Click **"Start Voice Call"**.
- Point out the **Microphone & Call Recording Consent Modal**: *"Before any audio is captured, we enforce explicit user consent."*
- Click **"I Consent & Start Call"**.
- Alex (the bot) speaks the opening greeting: *"Hi there! This is Alex from CloudPulse AI..."*
- Show the live audio waveform pulsing in the header.
- Speak a customer response: *"We currently monitor 20 AWS servers using Datadog, but it's getting too expensive. How does CloudPulse compare?"*
- Alex responds verbally with the 70% cost savings rebuttal and suggests a live demo.
- Speak: *"That sounds great. Can we schedule a 15-minute live demo on Thursday at 2 PM?"*

### Scene 3: Call Termination & AI Analysis (1:30 – 2:15)
- Click **"End Call"**.
- Watch the status transition to `Analyzing Insights...`.
- Showcase the **Post-Call AI CRM Analysis Card**:
  - Deal Stage Badge: `Demo Requested` (in purple).
  - Executive Overview summary.
  - Customer Requirements list (AWS monitoring, budget sensitivity).
  - Objections Raised list (Currently on Datadog).
  - Next Steps.
  - Play back the recorded audio snippet using the embedded player.

### Scene 4: Persistence & Wrap-up (2:15 – 2:45)
- Click on the **"History"** tab: show the saved call with duration, date/time, status badge, and audio replay.
- Refresh the browser page to prove that IndexedDB preserved the session.
- Conclude: *"Thank you! The project is fully open-source and ready for review."*

---

## 4. 💡 Common Interview Questions & How to Answer

**Q: What happens if the Gemini API key runs out of quota or is offline?**
> *"We designed a zero-failure architecture. Both `/api/chat` and `/api/summarize` include a contextual rule-based fallback engine tailored to the CloudPulse SaaS domain. Even if the network drops or the API key is missing, the conversation and 6-stage qualification run 100% reliably."*

**Q: How do you handle non-Chromium browsers like Firefox that don't support `webkitSpeechRecognition`?**
> *"The app detects API support on mount. If unsupported, it displays a helpful notification advising the user to use Chrome/Edge/Safari, while enabling a built-in text input bar so the reviewer can still test the conversational flow seamlessly."*
