# SalesPulse AI — AI Voice Sales Bot

An interactive AI voice sales bot built for the **Sankar Group Intern Assignment**. SalesPulse conducts real-time sales phone calls with prospects to pitch B2B SaaS software, listens and understands responses, displays live transcripts, records calls with consent, and generates automated CRM sales summaries with 6-stage deal qualification.

## 🚀 Key Features

1. **Interactive Voice Conversation**: Understands customer speech, answers questions, handles common sales objections, and guides the prospect toward conversion.
2. **Real-time Live Chat Feed**: Streams user utterances and AI responses instantaneously on screen.
3. **Call Controls & Status**: Start/End call buttons, active call duration counter, and status badges (`Idle`, `Connecting`, `In Call`, `Processing`, `Completed`).
4. **Call Recording with Consent**: Audio recording via browser MediaRecorder API with explicit user consent notice and immediate post-call playback.
5. **AI-Powered CRM Summary**: Automatically extracts conversation summary, customer requirements, objections, and next steps.
6. **Sales Status Classification**: Automatically classifies calls into one of six stages:
   - `Converted`
   - `Interested`
   - `Follow-up Required`
   - `Not Interested`
   - `Demo Requested`
   - `No Response`
7. **Call History & Audio Persistence**: Persistent session history with full transcripts, audio playback, and sales badges stored locally.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Speech-to-Text (STT)**: Web Speech API (`SpeechRecognition`)
- **Text-to-Speech (TTS)**: Web Speech Synthesis API (`SpeechSynthesis`)
- **Audio Capture**: Browser `MediaRecorder` API
- **AI Brain**: Google Gemini API (`gemini-2.5-flash` / `gemini-1.5-flash`)
- **Storage**: IndexedDB for persistent audio recording blobs and call logs

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js `v18+` or `v20+` (tested on Node v22)
- npm `v9+` or `v10+`
- A Chromium-based browser (Google Chrome, Microsoft Edge, Brave) or Safari for native Web Speech API support.

### 2. Installation
```bash
git clone https://github.com/krishu2814/Sankar-Group-Assignment.git
cd Sankar-Group-Assignment
npm install
```

### 3. Environment Configuration
Create a `.env.local` file from the example template:
```bash
cp .env.example .env.local
```
Add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: A smart rule-based fallback mode is built-in, allowing full end-to-end testing even before setting an API key!)*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Build and Test
```bash
npm run build
```
