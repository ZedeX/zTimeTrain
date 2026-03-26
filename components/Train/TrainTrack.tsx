"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useApp } from "@/lib/context";
import TrainCarriage from "./TrainCarriage";
import CarriageGap from "./CarriageGap";
import { getCurrentCarriageIndex, getCurrentTime } from "@/lib/timeUtils";

export default function TrainTrack() {
  const { plan, tasks } = useApp();
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [currentCarriageIdx, setCurrentCarriageIdx] = useState(-1);
  const autoScrollRef = useRef<ReturnType<typeof setTimeout>>();

  // Update time every minute
  useEffect(() => {
    const tick = () => {
      const t = getCurrentTime();
      setCurrentTime(t);
      setCurrentCarriageIdx(getCurrentCarriageIndex(plan.carriages));
    };
    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, [plan.carriages]);

  // Auto-scroll to current carriage on mount / date change
  useEffect(() => {
    scrollToCurrentCarriage();
  }, [plan.date, currentCarriageIdx]);

  const scrollToCurrentCarriage = useCallback(() => {
    if (!trackRef.current) return;
    const idx = currentCarriageIdx >= 0 ? currentCarriageIdx : 0;
    const carriageW = getCarriageWidth();
    const gapW = 32; // 8 * 4
    const offset = idx * (carriageW + gapW) + gapW;
    const centerOffset = (trackRef.current.clientWidth - carriageW) / 2;
    trackRef.current.scrollTo({
      left: Math.max(0, offset - centerOffset),
      behavior: "smooth",
    });
  }, [currentCarriageIdx]);

  // Drag-to-scroll
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    isDragging.current = true;
    startX.current = e.clientX;
    startScroll.current = trackRef.current?.scrollLeft ?? 0;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    const dx = e.clientX - startX.current;
    trackRef.current.scrollLeft = startScroll.current - dx;
    // Schedule auto-snap back
    if (autoScrollRef.current) clearTimeout(autoScrollRef.current);
    autoScrollRef.current = setTimeout(scrollToCurrentCarriage, 2000);
  };

  const onMouseUp = () => { isDragging.current = false; };

  function getCarriageWidth() {
    if (typeof window === "undefined") return 90;
    if (window.innerWidth >= 1200) return 120;
    if (window.innerWidth >= 768) return 100;
    return 90;
  }

  const taskMap = Object.fromEntries(tasks.map((t) => [t.id, t]));

  return (
    <div
      className="relative w-full"
      style={{ height: "100%" }}
    >
      {/* Track background */}
      <div className="absolute inset-0 track-bg rounded-2xl" />

      {/* Train head */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-5xl pointer-events-none select-none">
        🚂
      </div>

      {/* Scrollable track */}
      <div
        ref={trackRef}
        className="train-track-scroll relative w-full h-full flex items-center pl-20 pr-8"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ paddingTop: "32px", paddingBottom: "24px" }}
      >
        <div className="flex items-center gap-0 relative">
          {/* Leading gap (prepend) */}
          <CarriageGap index={0} isFirst />

          {plan.carriages.map((carriage, idx) => (
            <React.Fragment key={carriage.id}>
              <TrainCarriage
                carriage={carriage}
                index={idx}
                task={carriage.taskId ? taskMap[carriage.taskId] ?? null : null}
                isCurrent={idx === currentCarriageIdx}
                currentTime={currentTime}
                currentCarriageIdx={currentCarriageIdx}
              />
              {/* Gap after each carriage */}
              <CarriageGap
                index={idx + 1}
                isLast={idx === plan.carriages.length - 1}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Track rails */}
      <div className="absolute bottom-5 left-0 right-0 h-1 bg-blue-300/50 pointer-events-none" />
      <div className="absolute bottom-3 left-0 right-0 h-0.5 bg-blue-200/50 pointer-events-none" />
    </div>
  );
}