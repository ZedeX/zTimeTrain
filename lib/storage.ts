import { AppState, DailyPlan, Task } from "./types";
import { PRESET_TASKS } from "./presets";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

const STORAGE_KEYS = {
  USER_ID: "tt_user_id",
  TASKS: "tt_tasks",
  PLANS_PREFIX: "tt_plan_",
  LAST_MODIFIED: "tt_last_modified",
};

// ── User ID ──────────────────────────────────────────────────
export function getUserId(): string {
  if (typeof window === "undefined") return "";
  let uid = localStorage.getItem(STORAGE_KEYS.USER_ID);
  if (!uid) {
    uid = uuidv4();
    localStorage.setItem(STORAGE_KEYS.USER_ID, uid);
  }
  return uid;
}

// ── Tasks ─────────────────────────────────────────────────────
export function saveTasks(tasks: Task[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  bumpLastModified();
}

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return PRESET_TASKS;
  const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
  if (!raw) {
    saveTasks(PRESET_TASKS);
    return PRESET_TASKS;
  }
  return JSON.parse(raw) as Task[];
}

// ── Daily Plans ───────────────────────────────────────────────
export function savePlan(plan: DailyPlan): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEYS.PLANS_PREFIX + plan.date,
    JSON.stringify(plan)
  );
  bumpLastModified();
}

export function loadPlan(date: string): DailyPlan | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEYS.PLANS_PREFIX + date);
  if (!raw) return null;
  return JSON.parse(raw) as DailyPlan;
}

export function loadAllPlanDates(): string[] {
  if (typeof window === "undefined") return [];
  const dates: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEYS.PLANS_PREFIX)) {
      dates.push(key.replace(STORAGE_KEYS.PLANS_PREFIX, ""));
    }
  }
  return dates;
}

export function loadAllPlans(): DailyPlan[] {
  const dates = loadAllPlanDates();
  return dates.map((d) => loadPlan(d)).filter(Boolean) as DailyPlan[];
}

// ── Last Modified ─────────────────────────────────────────────
function bumpLastModified(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.LAST_MODIFIED, String(Date.now()));
}

export function getLastModified(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(STORAGE_KEYS.LAST_MODIFIED) || 0);
}

// ── Default plan factory ──────────────────────────────────────
export function createDefaultPlan(date: string): DailyPlan {
  const { v4: uid } = require("uuid");
  // Default: 17:00 ~ 22:00 => 10 carriages
  const starts = [
    "17:00","17:30","18:00","18:30","19:00",
    "19:30","20:00","20:30","21:00","21:30",
  ];
  const carriages = starts.map((start, i) => {
    const [h, m] = start.split(":").map(Number);
    const endMinutes = h * 60 + m + 30;
    const endH = Math.floor(endMinutes / 60).toString().padStart(2, "0");
    const endM = (endMinutes % 60).toString().padStart(2, "0");
    return {
      id: uid(),
      date,
      startTime: start,
      endTime: `${endH}:${endM}`,
      taskId: null,
      status: "pending" as const,
      order: i + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  });
  return { date, carriages, lastModified: Date.now() };
}

// ── Full app state snapshot (for sync) ────────────────────────
export function getFullSnapshot(): AppState {
  return {
    userId: getUserId(),
    tasks: loadTasks(),
    plans: Object.fromEntries(
      loadAllPlans().map((p) => [p.date, p])
    ),
    lastModified: getLastModified(),
  };
}

export function applySnapshot(state: AppState): void {
  saveTasks(state.tasks);
  Object.values(state.plans).forEach((p) => savePlan(p));
}
