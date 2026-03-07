"use client";
import React, { useState } from "react";
import dayjs from "dayjs";
import { useApp } from "@/lib/context";
import { useRouter } from "next/navigation";

export default function Header() {
  const { currentDate, setCurrentDate, canUndo, undo, completionRate } = useApp();
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const today = dayjs().format("YYYY-MM-DD");
  const isToday = currentDate === today;
  const displayDate = dayjs(currentDate).format("MM月DD日 ddd");

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDate(e.target.value);
    setShowDatePicker(false);
  };

  const goToday = () => setCurrentDate(today);
  const goPrev = () => setCurrentDate(dayjs(currentDate).subtract(1, "day").format("YYYY-MM-DD"));
  const goNext = () => setCurrentDate(dayjs(currentDate).add(1, "day").format("YYYY-MM-DD"));

  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-2 px-3 py-2"
      style={{
        background: "linear-gradient(135deg, #1565C0, #1976D2)",
        boxShadow: "0 2px 12px rgba(21,101,192,0.4)",
      }}
    >
      {/* Logo / Title */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-2xl">🚂</span>
        <span
          className="text-white font-bold text-lg leading-none hidden sm:block"
          style={{ fontFamily: "'Baloo 2', sans-serif" }}
        >
          时间小火车
        </span>
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={goPrev}
          className="text-white/80 hover:text-white rounded-lg p-1 transition-colors"
          title="前一天"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <span>{displayDate}</span>
            {isToday && (
              <span className="bg-orange-400 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                今日
              </span>
            )}
          </button>

          {showDatePicker && (
            <div
              className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl p-3 z-50"
              style={{ minWidth: 200 }}
            >
              <input
                type="date"
                value={currentDate}
                onChange={handleDateChange}
                className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoFocus
              />
              {!isToday && (
                <button
                  onClick={() => { goToday(); setShowDatePicker(false); }}
                  className="mt-2 w-full text-center text-blue-600 text-sm font-medium hover:underline"
                >
                  回到今天
                </button>
              )}
            </div>
          )}
        </div>

        <button
          onClick={goNext}
          className="text-white/80 hover:text-white rounded-lg p-1 transition-colors"
          title="后一天"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Completion rate */}
      {completionRate !== null && (
        <div
          className="flex items-center gap-1 bg-white/20 rounded-lg px-2 py-1 text-sm font-bold text-white flex-shrink-0"
        >
          <span>{completionRate}%</span>
        </div>
      )}

      {/* Undo button */}
      <button
        onClick={undo}
        disabled={!canUndo}
        title="撤销"
        className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-semibold transition-all flex-shrink-0 ${
          canUndo
            ? "bg-white/20 hover:bg-white/30 text-white"
            : "bg-white/10 text-white/30 cursor-not-allowed"
        }`}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path d="M3 10H13C17.4183 10 21 13.5817 21 18V20M3 10L7 6M3 10L7 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="hidden sm:inline">撤销</span>
      </button>

      {/* Calendar button */}
      <button
        onClick={() => router.push("/calendar")}
        title="月历统计"
        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 rounded-lg px-2 py-1.5 text-sm font-semibold text-white transition-all flex-shrink-0"
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline">月历</span>
      </button>
    </header>
  );
}
