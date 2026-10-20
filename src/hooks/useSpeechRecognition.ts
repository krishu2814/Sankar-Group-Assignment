"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SpeechRecognitionHookOptions {
  onTranscriptChange?: (interim: string) => void;
  onSentenceComplete?: (finalSentence: string) => void;
  language?: string;
}

// Browser API declarations for Web Speech API
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export function useSpeechRecognition({
  onTranscriptChange,
  onSentenceComplete,
  language = "en-US",
}: SpeechRecognitionHookOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef(false);
  const isPausedForSpeakingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        // If paused because the bot is speaking, ignore incoming mic feedback to prevent self-transcription
        if (isPausedForSpeakingRef.current) return;

        let currentInterim = "";
        let finalChunk = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalChunk += item[0].transcript;
          } else {
            currentInterim += item[0].transcript;
          }
        }

        setInterimTranscript(currentInterim);
        if (onTranscriptChange && currentInterim) {
          onTranscriptChange(currentInterim);
        }

        const trimmedFinal = finalChunk.trim();
        if (trimmedFinal) {
          setTranscript((prev) => (prev ? `${prev} ${trimmedFinal}` : trimmedFinal));
          setInterimTranscript("");
          if (onSentenceComplete) {
            onSentenceComplete(trimmedFinal);
          }
        }
      };

      recognition.onerror = (event: any) => {
        // 'no-speech' is normal when user is listening silently
        if (event.error === "no-speech") return;
        if (event.error === "aborted") return;

        console.warn("Speech recognition error:", event.error);
        setError(`Speech error: ${event.error}`);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Automatically restart listening if call is ongoing and not manually stopped or paused
        if (!isManuallyStoppedRef.current && !isPausedForSpeakingRef.current) {
          try {
            recognition.start();
          } catch {
            // Already started or busy
          }
        }
      };

      recognitionRef.current = recognition;
    } catch (err: any) {
      setError(`Failed to initialize speech recognition: ${err.message}`);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [language, onSentenceComplete, onTranscriptChange]);

  const startListening = useCallback(() => {
    isManuallyStoppedRef.current = false;
    isPausedForSpeakingRef.current = false;
    setError(null);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err: any) {
        // Recognition already active
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    isPausedForSpeakingRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  // Anti-echo helper: pause listening while bot is speaking so the mic doesn't capture the bot's own voice
  const pauseListening = useCallback(() => {
    isPausedForSpeakingRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const resumeListening = useCallback(() => {
    isPausedForSpeakingRef.current = false;
    if (!isManuallyStoppedRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // Already active
      }
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    resetTranscript,
  };
}
