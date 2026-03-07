"use client";
import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Task } from "@/lib/types";
import { useApp } from "@/lib/context";

interface Props {
  task: Task;
  isAssigned: boolean; // already placed on a carriage today
  onEdit: (task: Task) => void;
}

export default function TaskCard({ task, isAssigned, onEdit }: Props) {
  const { toggleTaskHidden, deleteTask } = useApp();
  const [showMenu, setShowMenu] = useState(false);

  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: `task-${task.id}`,
    data: { type: "task", taskId: task.id },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)`, zIndex: 999 }
    : undefined;

  return (
    <div className="relative">
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-all select-none
          ${isDragging ? "opacity-40 scale-95" : "hover:scale-105 hover:shadow-md"}
          ${isAssigned ? "opacity-50" : "opacity-100"}
          bg-white
        `}
        style={{
          ...style,
          borderColor: task.color,
          width: 70,
          minHeight: 72,
        }}
      >
        {/* Emoji */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
          style={{ background: task.color + "22" }}
        >
          {task.icon}
        </div>
        {/* Name */}
        <span className="text-xs font-semibold text-center leading-tight" style={{ color: task.color, maxWidth: 64 }}>
          {task.name}
        </span>
        {/* Assigned badge */}
        {isAssigned && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs leading-none">✓</span>
          </div>
        )}
      </div>

      {/* Long-press / right-click menu button */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
        className="absolute top-0 right-0 w-5 h-5 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        style={{ fontSize: 10, top: -2, right: -2 }}
        title="操作"
      >
        ⋯
      </button>

      {showMenu && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
          style={{ minWidth: 110 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { onEdit(task); setShowMenu(false); }}
            className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            ✏️ 编辑
          </button>
          {task.isPreset ? (
            <button
              onClick={() => { toggleTaskHidden(task.id); setShowMenu(false); }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-yellow-50 hover:text-yellow-600"
            >
              🙈 隐藏
            </button>
          ) : (
            <button
              onClick={() => { deleteTask(task.id); setShowMenu(false); }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              🗑️ 删除
            </button>
          )}
        </div>
      )}

      {/* Click outside closes menu */}
      {showMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
      )}
    </div>
  );
}