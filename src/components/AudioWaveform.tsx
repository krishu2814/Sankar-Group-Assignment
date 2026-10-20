"use client";

import React, { useEffect, useState } from "react";

interface AudioWaveformProps {
  isActive: boolean;
  color?: "indigo" | "emerald";
  barCount?: number;
}

export function AudioWaveform({
  isActive,
  color = "indigo",
  barCount = 18,
}: AudioWaveformProps) {
  const [heights, setHeights] = useState<number[]>(
    Array(barCount).fill(15)
  );

  useEffect(() => {
    if (!isActive) {
      setHeights(Array(barCount).fill(15));
      return;
    }

    const interval = setInterval(() => {
      setHeights(
        Array.from({ length: barCount }, () => Math.floor(Math.random() * 75) + 20)
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isActive, barCount]);

  const colorClasses =
    color === "emerald"
      ? "bg-emerald-400 shadow-emerald-500/50"
      : "bg-indigo-400 shadow-indigo-500/50";

  return (
    <div className="flex items-center justify-center gap-1 h-10 px-3 py-1 bg-slate-900/60 rounded-xl border border-slate-800">
      {heights.map((height, i) => (
        <span
          key={i}
          className={`w-1 rounded-full transition-all duration-100 ${colorClasses} ${
            isActive ? "opacity-90 shadow-sm" : "opacity-30"
          }`}
          style={{ height: `${isActive ? height : 15}%` }}
        />
      ))}
    </div>
  );
}
