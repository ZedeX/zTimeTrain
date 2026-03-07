"use client";
import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Carriage, Task, TaskStatus } from "@/lib/types";
import { useApp } from "@/lib/context";

interface Props {
  carriage: Carriage;
  index: number;
  task: Task | null;
  isCurrent: boolean;
  currentTime: string;
}

export default function TrainCarriage({
  carriage,
  index,
  task,
  isCurrent,
  currentTime,
}: Props) {
  const { setCarriageStatus, deleteCarriage, plan } = useApp();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: `carriage-${index}`,
    data: { type: "carriage", index },
  });

  const canDelete = plan.carriages.length > 1;

  // Visual class based on status
  let bgClass = "bg-gray-50 border-gray-200";
  if (carriage.status === "done") bgClass = "carriage-done border-green-400";
  if (carriage.status === "failed") bgClass = "carriage-failed border-red-300";

  if (isOver) bgClass += " drop-zone-active";
  if (isCurrent) bgClass = bgClass.replace("border-gray-200", "border-orange-400") + " carriage-current";

  const handleStatusToggle = (status: TaskStatus) => {
    setCarriageStatus(index, status);
  };

  const handleDelete = () => {
    if (carriage.taskId) {
      setShowDeleteConfirm(true);
    } else {
      deleteCarriage(index);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        className={`relative flex-shrink-0 rounded-xl border-2 carriage-transition carriage-enter select-none
          ${bgClass}
          w-[100px] h-[180px] sm:w-[120px] sm:h-[200px] lg:w-[140px] lg:h-[220px]
        `}
        style={{ overflow: "visible" }}
      >
        {/* Current time indicator stripe */}
        {isCurrent && (
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-orange-500 timeline-indicator" />
        )}

        {/* Current time label */}
        {isCurrent && (
          <div
            className="absolute -top-7 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap z-10"
            style={{ fontFamily: "'Baloo 2', monospace" }}
          >
            ⏱ {currentTime}
          </div>
        )}

        {/* Delete button */}
        {canDelete && (
          <button
            onClick={handleDelete}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold z-20 flex items-center justify-center shadow-md transition-colors"
            title="删除车厢"
          >
            ×
          </button>
        )}

        {/* Time label */}
        <div
          className="absolute top-1.5 left-0 right-0 text-center text-xs font-semibold"
          style={{
            fontFamily: "'Baloo 2', monospace",
            color: isCurrent ? "#E65100" : "#666",
          }}
        >
          {carriage.startTime}
          <span className="text-gray-400 mx-0.5">-</span>
          {carriage.endTime}
        </div>

        {/* Task content area */}
        <div className="absolute inset-x-2 top-8 bottom-10 flex flex-col items-center justify-center gap-1">
          {task ? (
            <>
              {/* Task icon */}
              <div className="relative">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                  style={{ background: task.color + "33", border: `2px solid ${task.color}` }}
                >
                  {task.icon}
                </div>
                {/* Status badge */}
                {carriage.status === "done" && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
                {carriage.status === "failed" && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✕</span>
                  </div>
                )}
              </div>
              {/* Task name */}
              <span
                className="text-xs font-semibold text-center leading-tight mt-0.5 px-1"
                style={{ color: task.color, maxWidth: "90px" }}
              >
                {task.name}
              </span>
            </>
          ) : (
            <div className="text-gray-300 text-3xl">＋</div>
          )}
        </div>

        {/* Action buttons */}
        {task && (
          <div className="absolute bottom-1.5 left-1 right-1 flex gap-1">
            <button
              onClick={() => handleStatusToggle("done")}
              className={`flex-1 rounded-lg text-xs font-bold py-1 transition-all ${
                carriage.status === "done"
                  ? "bg-green-500 text-white"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              ✔
            </button>
            <button
              onClick={() => handleStatusToggle("failed")}
              className={`flex-1 rounded-lg text-xs font-bold py-1 transition-all ${
                carriage.status === "failed"
                  ? "bg-red-500 text-white"
                  : "bg-red-100 text-red-600 hover:bg-red-200"
              }`}
            >
              ✖
            </button>
          </div>
        )}

        {/* Wheels decoration */}
        <div className="absolute -bottom-3 left-2 right-2 flex justify-between pointer-events-none">
          <div className="w-5 h-5 rounded-full border-2 border-gray-400 bg-gray-200 wheel-spin" style={{ animationPlayState: "paused" }} />
          <div className="w-5 h-5 rounded-full border-2 border-gray-400 bg-gray-200 wheel-spin" style={{ animationPlayState: "paused" }} />
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(false)}>
          <div
            className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xl font-bold text-gray-800 mb-2">删除车厢</div>
            <p className="text-gray-600 text-sm mb-4">
              该车厢中有任务「{task?.icon} {task?.name}」，删除后任务将返回任务库。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  deleteCarriage(index);
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
