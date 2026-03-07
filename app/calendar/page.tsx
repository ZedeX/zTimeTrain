"use client";
import React from "react";
import { useRouter } from "next/navigation";
import MonthCalendar from "@/components/Calendar/MonthCalendar";
import dayjs from "dayjs";

export default function CalendarPage() {
  const router = useRouter();
  const today = dayjs().format("YYYY-MM-DD");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#E3F0FF" }}>
      {/* Header */}
      <header
        className="flex items-center gap-3 px-4 py-3 sticky top-0 z-40"
        style={{
          background: "linear-gradient(135deg, #1565C0, #1976D2)",
          boxShadow: "0 2px 12px rgba(21,101,192,0.4)",
        }}
      >
        <button
          onClick={() => router.back()}
          className="text-white/80 hover:text-white p-1 rounded-lg transition-colors"
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">📅</span>
          <span
            className="text-white font-bold text-lg"
            style={{ fontFamily: "'Baloo 2', sans-serif" }}
          >
            月历统计
          </span>
        </div>
        <button
          onClick={() => router.push(`/?date=${today}`)}
          className="ml-auto bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
        >
          返回今日
        </button>
      </header>

      {/* Calendar */}
      <div className="flex-1 p-4">
        <MonthCalendar />

        {/* Legend / tips */}
        <div className="mt-4 bg-white/60 rounded-2xl p-4 text-sm text-gray-600 max-w-lg mx-auto">
          <p className="font-semibold text-gray-700 mb-2">📌 使用说明</p>
          <ul className="space-y-1 text-xs">
            <li>• 点击有数据的日期可跳转至当日火车计划</li>
            <li>• 仅当日所有任务均标记后，才显示完成率</li>
            <li>• 🟢 绿色 = 100% 完成 &nbsp;🔵 蓝色 = ≥60% &nbsp;⬜ 灰色 = &lt;60%</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
