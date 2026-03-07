// ============================================================
// Core Types for TimeTrain (时间小火车)
// ============================================================

export type TaskCategory = "study" | "life" | "activity" | "other";
export type TaskStatus = "pending" | "done" | "failed";

export interface Task {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: TaskCategory;
  isPreset: boolean;
  isHidden: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Carriage {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  taskId: string | null;
  status: TaskStatus;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface DailyPlan {
  date: string;
  carriages: Carriage[];
  lastModified: number;
}

export interface AppState {
  userId: string;
  tasks: Task[];
  plans: Record<string, DailyPlan>; // keyed by date YYYY-MM-DD
  lastModified: number;
}

export interface UndoRecord {
  id: string;
  timestamp: number;
  description: string;
  snapshot: {
    tasks: Task[];
    plan: DailyPlan;
  };
}

export type CategoryLabel = {
  key: TaskCategory;
  label: string;
  color: string;
};

export const CATEGORIES: CategoryLabel[] = [
  { key: "study", label: "学习类", color: "#4DA6FF" },
  { key: "life", label: "生活类", color: "#FFC53D" },
  { key: "activity", label: "活动类", color: "#FF4D4F" },
  { key: "other", label: "其他类", color: "#d4d4d4" },
];
