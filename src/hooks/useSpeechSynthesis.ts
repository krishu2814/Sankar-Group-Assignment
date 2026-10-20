"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      // Prioritize natural sounding English voices
      const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
      const preferredVoice =
        englishVoices.find(
          (v) =>
            v.name.includes("Google US English") ||
            v.name.includes("Samantha") ||
            v.name.includes("Natural") ||
            v.name.includes("Jenny")
        ) ||
        englishVoices.find((v) => v.lang === "en-US") ||
        englishVoices[0] ||
        voices[0] ||
        null;

      selectedVoiceRef.current = preferredVoice;
    };

    updateVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text: string, options: SpeakOptions = {}) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        options.onError?.("Speech synthesis not supported");
        return;
      }

      // Cancel any ongoing speech before starting a new one
      window.speechSynthesis.cancel();

      // Clean markdown or unwanted symbols from speech text so the bot sounds natural
      const cleanedText = text
        .replace(/[*_#`~[\]]/g, "") // remove markdown asterisks, hashes, brackets
        .replace(/https?:\/\/\S+/g, "link") // replace urls with 'link'
        .trim();

      if (!cleanedText) return;

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
      }

      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        options.onStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        options.onEnd?.();
      };

      utterance.onerror = (e) => {
        setIsSpeaking(false);
        // Interrupted errors happen when cancel() is called deliberately
        if (e.error !== "interrupted" && e.error !== "canceled") {
          console.warn("Speech synthesis error:", e);
          options.onError?.(e);
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  const cancel = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isSpeaking,
    isSupported,
    availableVoices,
    speak,
    cancel,
  };
}
