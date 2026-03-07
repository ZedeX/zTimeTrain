"use client";
import React, { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Common/Header";
import TrainTrack from "@/components/Train/TrainTrack";
import TaskLibrary from "@/components/Task/TaskLibrary";
import CelebrationEffect from "@/components/Common/CelebrationEffect";
import { useApp } from "@/lib/context";
import { syncFromCloud } from "@/lib/sync";

export default function HomePage() {
  const {
    tasks,
    plan,
    currentDate,
    setCurrentDate,
    assignTaskToCarriage,
    insertCarriageWithTask,
    replaceCarriageTask,
    removeTaskFromCarriage,
    allDone,
    completionRate,
  } = useApp();

  const searchParams = useSearchParams();
  const [activeDragTaskId, setActiveDragTaskId] = useState<string | null>(null);

  // Handle ?date= query param from calendar
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) setCurrentDate(dateParam);
  }, [searchParams]);

  // Initial cloud sync
  useEffect(() => {
    const uid = localStorage.getItem("tt_user_id");
    if (uid) {
      syncFromCloud(uid).then((state) => {
        if (state) window.location.reload();
      });
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === "task") setActiveDragTaskId(data.taskId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragTaskId(null);
    const { active, over } = event;
    if (!over) return;

    const dragData = active.data.current;
    const dropData = over.data.current;

    if (!dragData || !dropData) return;

    // Dragging a task from library
    if (dragData.type === "task") {
      const taskId = dragData.taskId as string;

      if (dropData.type === "carriage") {
        const idx = dropData.index as number;
        const carriage = plan.carriages[idx];
        if (carriage.taskId && carriage.taskId !== taskId) {
          replaceCarriageTask(idx, taskId);
        } else if (!carriage.taskId) {
          assignTaskToCarriage(idx, taskId);
        }
      } else if (dropData.type === "gap") {
        const idx = dropData.index as number;
        // idx = insert BEFORE carriages[idx]
        insertCarriageWithTask(idx - 1, taskId);
      } else if (dropData.type === "library") {
        // Drag back to library = find which carriage has this task and remove
        const carriageIdx = plan.carriages.findIndex((c) => c.taskId === taskId);
        if (carriageIdx >= 0) removeTaskFromCarriage(carriageIdx);
      }
    }
  };

  // Find active drag task for overlay
  const activeTask = activeDragTaskId
    ? tasks.find((t) => t.id === activeDragTaskId)
    : null;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "#E3F0FF" }}>
      <Header />

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Train track area - upper half */}
        <div
          className="flex-shrink-0 mx-2 mt-2 rounded-2xl overflow-hidden relative"
          style={{
            height: "calc(45vh)",
            minHeight: 200,
            maxHeight: 320,
          }}
        >
          <TrainTrack />
        </div>

        {/* Completion banner */}
        {completionRate !== null && (
          <div
            className="mx-2 my-1 flex items-center justify-center gap-2 py-1.5 rounded-xl text-sm font-bold"
            style={{
              background:
                completionRate === 100
                  ? "linear-gradient(135deg, #2E7D32, #43A047)"
                  : "linear-gradient(135deg, #1565C0, #1976D2)",
              color: "white",
            }}
          >
            {completionRate === 100 ? (
              <>🎉 今日任务全部完成！完成率 100%</>
            ) : (
              <>📊 今日完成率：{completionRate}%</>
            )}
          </div>
        )}

        {/* Task library - lower half */}
        <div className="flex-1 mx-2 mb-2 overflow-hidden rounded-2xl shadow-lg">
          <TaskLibrary />
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeTask && (
            <div
              className="flex flex-col items-center gap-1 p-2 rounded-xl border-2 bg-white shadow-2xl opacity-90 scale-110"
              style={{ borderColor: activeTask.color, width: 70 }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                style={{ background: activeTask.color + "22" }}
              >
                {activeTask.icon}
              </div>
              <span className="text-xs font-semibold text-center" style={{ color: activeTask.color }}>
                {activeTask.name}
              </span>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Celebration */}
      <CelebrationEffect active={allDone} />
    </div>
  );
}
