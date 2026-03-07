"use client";
import React, { useState } from "react";
import { Task, TaskCategory, CATEGORIES } from "@/lib/types";

const EMOJI_PRESETS = ["📐","📖","🔤","📚","🍚","🧼","😴","🏃","🧹","🎮","📝","🎨","🎵","🏊","⚽","🎯","🧩","💻","🌱","🛁","🧘","📱","🎤","🏋️","🚴"];

const COLOR_PRESETS = [
  "#FFB84D","#4DA6FF","#FF7A45","#52C41A","#FFC53D","#36CFC9",
  "#85A5FF","#FF4D4F","#A0D911","#722ED1","#d4d4d4","#13C2C2",
  "#EB2F96","#FA8C16","#2F54EB","#389E0D",
];

interface Props {
  initial?: Partial<Task>;
  onSave: (data: Omit<Task, "id" | "createdAt" | "updatedAt" | "isPreset" | "isHidden">) => void;
  onClose: () => void;
}

export default function TaskForm({ initial, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "📝");
  const [color, setColor] = useState(initial?.color ?? "#4DA6FF");
  const [category, setCategory] = useState<TaskCategory>(initial?.category ?? "study");
  const [customEmoji, setCustomEmoji] = useState("");

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({ name: trimmed.slice(0, 10), icon, color, category });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-lg">{initial?.id ? "编辑任务" : "新增任务"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">×</button>
        </div>

        <div className="p-4 space-y-4">
          {/* Preview */}
          <div className="flex justify-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm border-2"
              style={{ background: color + "22", borderColor: color }}
            >
              {icon}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">任务名称（最多10字）</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 10))}
              placeholder="例：数学作业"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />
          </div>

          {/* Emoji */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">图标</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {EMOJI_PRESETS.map((e) => (
                <button
                  key={e}
                  onClick={() => setIcon(e)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${
                    icon === e ? "bg-blue-100 ring-2 ring-blue-400 scale-110" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={customEmoji}
              onChange={(e) => { setCustomEmoji(e.target.value); if (e.target.value) setIcon(e.target.value.slice(-2)); }}
              placeholder="或输入自定义emoji"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">颜色</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${color === c ? "scale-125 ring-2 ring-offset-1 ring-gray-400" : "hover:scale-110"}`}
                  style={{ background: c }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded-full border-0 cursor-pointer"
                title="自定义颜色"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">分类</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    category === cat.key
                      ? "text-white shadow-sm scale-105"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                  style={category === cat.key ? { background: cat.color } : undefined}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 pt-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
