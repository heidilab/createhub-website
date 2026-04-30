"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const FILTERS = [
  {
    key: "status",
    label: "時間",
    options: [
      { v: "upcoming", label: "即將舉行" },
      { v: "past", label: "過往活動" },
    ],
    default: "upcoming",
  },
  {
    key: "type",
    label: "活動形式",
    options: [
      { v: "all", label: "全部" },
      { v: "online", label: "線上" },
      { v: "offline", label: "線下" },
      { v: "hybrid", label: "混合" },
    ],
    default: "all",
  },
  {
    key: "category",
    label: "類別",
    options: [
      { v: "all", label: "全部" },
      { v: "lecture", label: "講座" },
      { v: "workshop", label: "工作坊" },
      { v: "networking", label: "交流會" },
    ],
    default: "all",
  },
] as const;

export default function EventFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all" || (key === "status" && value === "upcoming")) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`/events${params.toString() ? `?${params.toString()}` : ""}`, {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  return (
    <div className="border-b border-brand-hair">
      <div className="container-wide px-5 lg:px-8 py-6 flex flex-wrap gap-x-8 gap-y-4">
        {FILTERS.map((f) => {
          const current = searchParams.get(f.key) || f.default;
          return (
            <div key={f.key} className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] text-brand-softer tracking-[0.2em] uppercase font-semibold">
                {f.label}
              </span>
              <div className="flex items-center gap-1">
                {f.options.map((opt) => {
                  const active = current === opt.v;
                  return (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => update(f.key, opt.v)}
                      className={`text-[12px] px-3 py-1.5 transition ${
                        active
                          ? "bg-brand-dark text-white font-semibold"
                          : "text-brand-muted hover:text-brand-dark"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
