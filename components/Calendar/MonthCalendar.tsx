"use client";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { loadPlan } from "@/lib/storage";
import { DailyPlan } from "@/lib/types";
import { useRouter } from "next/navigation";

interface DayStats {
  date: string;
  completionRate: number | null;
  hasData: boolean;
}

function computeRate(plan: DailyPlan): number | null {
  const task = plan.carriages.filter((c) => c.taskId !== null);
  if (task.length === 0) return null;
  const allTagged = task.every((c) => c.status !== "pending");
  if (!allTagged) return null;
  const done = task.filter((c) => c.status === "done").length;
  return Math.round((done / task.length) * 100);
}

export default function MonthCalendar() {
  const router = useRouter();
  const [viewMonth, setViewMonth] = useState(dayjs());
  const [stats, setStats] = useState<Record<string, DayStats>>({});

  const today = dayjs().format("YYYY-MM-DD");

  useEffect(() => {
    const start = viewMonth.startOf("month");
    const end = viewMonth.endOf("month");
    const newStats: Record<string, DayStats> = {};

    for (let d = start; !d.isAfter(end); d = d.add(1, "day")) {
      const dateStr = d.format("YYYY-MM-DD");
      const plan = loadPlan(dateStr);
      if (plan) {
        const rate = computeRate(plan);
        newStats[dateStr] = { date: dateStr, completionRate: rate, hasData: true };
      } else {
        newStats[dateStr] = { date: dateStr, completionRate: null, hasData: false };
      }
    }
    setStats(newStats);
  }, [viewMonth]);

  const prevMonth = () => setViewMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setViewMonth((m) => m.add(1, "month"));

  const goToDate = (date: string) => {
    router.push(`/?date=${date}`);
  };

  const firstDay = viewMonth.startOf("month").day(); // 0=Sun
  const daysInMonth = viewMonth.daysInMonth();

  const cells: (string | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      viewMonth.date(i + 1).format("YYYY-MM-DD")
    ),
  ];

  const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

  function getCellStyle(rate: number | null) {
    if (rate === null) return "";
    if (rate === 100) return "bg-gradient-to-br from-green-400 to-green-500 text-white";
    if (rate >= 60) return "bg-gradient-to-br from-blue-400 to-blue-500 text-white";
    return "bg-gray-200 text-gray-600";
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-lg mx-auto">
      {/* Month navigation */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ background: "linear-gradient(135deg, #1565C0, #1976D2)" }}
      >
        <button
          onClick={prevMonth}
          className="text-white/80 hover:text-white p-1 rounded-lg transition-colors"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="text-white font-bold text-lg" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
          {viewMonth.format("YYYY年MM月")}
        </div>
        <button
          onClick={nextMonth}
          className="text-white/80 hover:text-white p-1 rounded-lg transition-colors"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-bold text-gray-400 py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 p-2">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;

          const stat = stats[date];
          const isToday = date === today;
          const rateStyle = getCellStyle(stat?.completionRate ?? null);

          return (
            <button
              key={date}
              onClick={() => stat?.hasData && goToDate(date)}
              className={`relative flex flex-col items-center justify-center rounded-xl p-1 transition-all aspect-square
                ${rateStyle || "bg-gray-50 hover:bg-gray-100"}
                ${isToday ? "ring-2 ring-orange-400 ring-offset-1" : ""}
                ${stat?.hasData ? "cursor-pointer hover:scale-105" : "cursor-default"}
              `}
            >
              <span className={`text-sm font-bold leading-none ${rateStyle ? "text-white" : isToday ? "text-orange-500" : "text-gray-700"}`}>
                {dayjs(date).date()}
              </span>
              {stat && stat.completionRate !== null && (
                <span className={`text-xs mt-0.5 leading-none font-semibold ${rateStyle ? "text-white/90" : "text-blue-600"}`}>
                  {stat.completionRate}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-green-400 to-green-500" />
          <span>100%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-blue-400 to-blue-500" />
          <span>≥60%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-200" />
          <span>&lt;60%</span>
        </div>
      </div>
    </div>
  );
}