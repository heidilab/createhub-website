"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { TeamMember } from "@/types";

interface Props {
  founders: TeamMember[];
  intervalMs?: number;
}

export default function RotatingFounderCard({
  founders,
  intervalMs = 4000,
}: Props) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (founders.length <= 1) return;
    const interval = setInterval(() => {
      // Fade out
      setVisible(false);
      // Switch + fade in
      setTimeout(() => {
        setIdx((prev) => (prev + 1) % founders.length);
        setVisible(true);
      }, 350);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [founders.length, intervalMs]);

  if (founders.length === 0) return null;
  const m = founders[idx];

  return (
    <div
      className="transition-opacity duration-300 ease-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="glass-card rounded-full pl-1.5 pr-5 py-1.5 flex items-center gap-3 max-w-full">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-accent to-brand-dark flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0 overflow-hidden">
          {m.photoUrl ? (
            <Image
              src={m.photoUrl}
              alt={m.name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            m.name.charAt(0)
          )}
        </div>
        <div className="text-left min-w-0 flex-1">
          <div className="text-[12px] font-bold text-brand-dark leading-tight whitespace-nowrap">
            {m.name}
          </div>
          <div className="text-[10px] text-brand-muted leading-tight truncate lg:whitespace-nowrap">
            {m.title}
          </div>
        </div>
      </div>

      {/* Indicator dots */}
      {founders.length > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {founders.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === idx
                  ? "w-5 bg-brand-accent"
                  : "w-1 bg-brand-rule"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
