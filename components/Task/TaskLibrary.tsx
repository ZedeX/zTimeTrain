"use client";
import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Task, TaskCategory, CATEGORIES } from "@/lib/types";
import { useApp } from "@/lib/context";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";

export default function TaskLibrary() {
  const { tasks, plan, addTask, updateTask } = useApp();
  const [activeCategory, setActiveCategory] = useState<TaskCategory>("study");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  // Drop zone for "return task to library"
  const { setNodeRef: setLibraryRef, isOver: isOverLibrary } = useDroppable({
    id: "task-library",
    data: { type: "library" },
  });

  // Tasks in current category (not hidden)
  const visibleTasks = tasks.filter(
    (t) => t.category === activeCategory && !t.isHidden
  );

  // Find which task IDs are currently assigned in today's plan
  const assignedTaskIds = new Set(
    plan.carriages.filter((c) => c.taskId).map((c) => c.taskId!)
  );

  const handleAddTask = (data: Omit<Task, "id" | "createdAt" | "updatedAt" | "isPreset" | "isHidden">) => {
    addTask({ ...data, isPreset: false, isHidden: false });
    setShowForm(false);
  };

  const handleEditTask = (data: Omit<Task, "id" | "createdAt" | "updatedAt" | "isPreset" | "isHidden">) => {
    if (editingTask) {
      updateTask(editingTask.id, { ...data, updatedAt: Date.now() });
    }
    setEditingTask(undefined);
    setShowForm(false);
  };

  const activeCat = CATEGORIES.find((c) => c.key === activeCategory)!;

  return (
    <div
      ref={setLibraryRef}
      className={`flex flex-col h-full transition-all ${
        isOverLibrary ? "ring-2 ring-blue-400 ring-inset rounded-t-2xl" : ""
      }`}
      style={{ background: "rgba(255,255,255,0.85)", borderRadius: "20px 20px 0 0" }}
    >
      {/* Category tabs */}
      <div className="flex items-center gap-1 px-3 pt-3 pb-2 border-b border-gray-100 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeCategory === cat.key
                ? "text-white shadow-sm"
                : "text-gray-500 bg-gray-100 hover:bg-gray-200"
            }`}
            style={activeCategory === cat.key ? { background: cat.color } : undefined}
          >
            {cat.label}
          </button>
        ))}

        {/* Return area indicator when dragging */}
        {isOverLibrary && (
          <div className="ml-auto flex-shrink-0 bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full animate-pulse">
            松手取消分配
          </div>
        )}
      </div>

      {/* Task grid */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="flex flex-wrap gap-2">
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isAssigned={assignedTaskIds.has(task.id)}
              onEdit={(t) => { setEditingTask(t); setShowForm(true); }}
            />
          ))}

          {/* Add task button */}
          <button
            onClick={() => { setEditingTask(undefined); setShowForm(true); }}
            className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all"
            style={{ width: 70, minHeight: 72 }}
          >
            <span className="text-2xl text-gray-300">+</span>
            <span className="text-xs text-gray-400 font-medium leading-tight text-center">新增</span>
          </button>
        </div>

        {/* Empty state */}
        {visibleTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-sm">暂无任务，点击「新增」添加</p>
          </div>
        )}
      </div>

      {/* Task form modal */}
      {showForm && (
        <TaskForm
          initial={editingTask}
          onSave={editingTask ? handleEditTask : handleAddTask}
          onClose={() => { setShowForm(false); setEditingTask(undefined); }}
        />
      )}
    </div>
  );
}
