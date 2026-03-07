"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { Carriage, DailyPlan, Task, TaskStatus } from "./types";
import {
  getUserId,
  loadTasks,
  saveTasks,
  loadPlan,
  savePlan,
  createDefaultPlan,
} from "./storage";
import {
  insertCarriageAt,
  deleteCarriageAt,
  makeCarriage,
  add30,
  sub30,
  isValidTime,
  reindexCarriages,
} from "./timeUtils";
import {
  saveUndoSnapshot,
  popUndoRecord,
  clearUndoStack,
  hasUndoRecords,
} from "./undo";
import { scheduleSyncAfterOperation } from "./sync";

// ── Types ─────────────────────────────────────────────────────
interface AppContextValue {
  userId: string;
  currentDate: string;
  setCurrentDate: (d: string) => void;
  tasks: Task[];
  plan: DailyPlan;

  // Task operations
  addTask: (t: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskHidden: (id: string) => void;

  // Carriage operations
  addCarriageAtHead: () => void;
  addCarriageAtTail: () => void;
  addCarriageBetween: (afterIndex: number) => void;
  deleteCarriage: (index: number) => void;
  setCarriageStatus: (index: number, status: TaskStatus) => void;
  assignTaskToCarriage: (carriageIndex: number, taskId: string) => void;
  removeTaskFromCarriage: (carriageIndex: number) => void;
  insertCarriageWithTask: (afterIndex: number, taskId: string) => void;
  replaceCarriageTask: (carriageIndex: number, newTaskId: string) => void;

  // Undo
  canUndo: boolean;
  undo: () => void;

  // Stats
  completionRate: number | null; // null = not yet calculable
  allDone: boolean;
}

// ── Context ───────────────────────────────────────────────────
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userId] = useState(() =>
    typeof window !== "undefined" ? getUserId() : ""
  );
  const [currentDate, setCurrentDateRaw] = useState<string>(
    () => dayjs().format("YYYY-MM-DD")
  );
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [plan, setPlanState] = useState<DailyPlan>(() =>
    createDefaultPlan(dayjs().format("YYYY-MM-DD"))
  );
  const [canUndo, setCanUndo] = useState(false);

  // Load initial data from localStorage
  useEffect(() => {
    setTasksState(loadTasks());
  }, []);

  // When date changes, load that date's plan
  useEffect(() => {
    const saved = loadPlan(currentDate);
    if (saved) {
      setPlanState(saved);
    } else {
      const def = createDefaultPlan(currentDate);
      setPlanState(def);
      savePlan(def);
    }
    setCanUndo(hasUndoRecords(currentDate));
  }, [currentDate]);

  const setCurrentDate = useCallback((d: string) => {
    setCurrentDateRaw(d);
    clearUndoStack(currentDate);
    setCanUndo(false);
  }, [currentDate]);

  // ── Persistence helpers ──────────────────────────────────────
  const persistTasks = useCallback(
    (newTasks: Task[]) => {
      setTasksState(newTasks);
      saveTasks(newTasks);
      scheduleSyncAfterOperation();
    },
    []
  );

  const persistPlan = useCallback(
    (newPlan: DailyPlan, undoDescription?: string) => {
      if (undoDescription) {
        // Save current state before modifying
        saveUndoSnapshot(
          newPlan.date,
          undoDescription,
          tasks,
          plan
        );
        setCanUndo(true);
      }
      const updated = { ...newPlan, lastModified: Date.now() };
      setPlanState(updated);
      savePlan(updated);
      scheduleSyncAfterOperation();
    },
    [tasks, plan]
  );

  // ── Task operations ──────────────────────────────────────────
  const addTask = useCallback(
    (t: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
      const newTask: Task = {
        ...t,
        id: uuidv4(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      persistTasks([...tasks, newTask]);
    },
    [tasks, persistTasks]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      persistTasks(
        tasks.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
        )
      );
    },
    [tasks, persistTasks]
  );

  const deleteTask = useCallback(
    (id: string) => {
      persistTasks(tasks.filter((t) => t.id !== id));
      // Remove from any carriages
      const newCarriages = plan.carriages.map((c) =>
        c.taskId === id ? { ...c, taskId: null, status: "pending" as const } : c
      );
      persistPlan({ ...plan, carriages: newCarriages });
    },
    [tasks, plan, persistTasks, persistPlan]
  );

  const toggleTaskHidden = useCallback(
    (id: string) => {
      const t = tasks.find((x) => x.id === id);
      if (!t || !t.isPreset) return;
      updateTask(id, { isHidden: !t.isHidden });
    },
    [tasks, updateTask]
  );

  // ── Carriage operations ───────────────────────────────────────
  const addCarriageAtHead = useCallback(() => {
    const first = plan.carriages[0];
    if (!first) return;
    const newStart = sub30(first.startTime);
    if (!isValidTime(newStart)) return;
    const newCarriage = makeCarriage(currentDate, newStart, 0);
    const newCarriages = reindexCarriages([newCarriage, ...plan.carriages]);
    persistPlan({ ...plan, carriages: newCarriages }, "添加车厢（头部）");
  }, [plan, currentDate, persistPlan]);

  const addCarriageAtTail = useCallback(() => {
    const last = plan.carriages[plan.carriages.length - 1];
    const newStart = last ? add30(last.startTime) : "17:00";
    if (!isValidTime(newStart)) return;
    const newCarriage = makeCarriage(
      currentDate,
      newStart,
      plan.carriages.length + 1
    );
    const newCarriages = reindexCarriages([...plan.carriages, newCarriage]);
    persistPlan({ ...plan, carriages: newCarriages }, "添加车厢（尾部）");
  }, [plan, currentDate, persistPlan]);

  const addCarriageBetween = useCallback(
    (afterIndex: number) => {
      const newCarriages = insertCarriageAt(
        plan.carriages,
        afterIndex + 1,
        currentDate
      );
      persistPlan({ ...plan, carriages: newCarriages }, "插入车厢");
    },
    [plan, currentDate, persistPlan]
  );

  const deleteCarriage = useCallback(
    (index: number) => {
      if (plan.carriages.length <= 1) return;
      const c = plan.carriages[index];
      const returnedTaskId = c.taskId;
      const newCarriages = deleteCarriageAt(plan.carriages, index);
      persistPlan({ ...plan, carriages: newCarriages }, "删除车厢");
    },
    [plan, persistPlan]
  );

  const setCarriageStatus = useCallback(
    (index: number, status: TaskStatus) => {
      const c = plan.carriages[index];
      const newStatus = c.status === status ? "pending" : status;
      const newCarriages = plan.carriages.map((car, i) =>
        i === index
          ? { ...car, status: newStatus, updatedAt: Date.now() }
          : car
      );
      persistPlan({ ...plan, carriages: newCarriages }, "修改任务状态");
    },
    [plan, persistPlan]
  );

  const assignTaskToCarriage = useCallback(
    (carriageIndex: number, taskId: string) => {
      const newCarriages = plan.carriages.map((c, i) =>
        i === carriageIndex
          ? { ...c, taskId, status: "pending" as const, updatedAt: Date.now() }
          : c
      );
      persistPlan({ ...plan, carriages: newCarriages }, "分配任务");
    },
    [plan, persistPlan]
  );

  const removeTaskFromCarriage = useCallback(
    (carriageIndex: number) => {
      const newCarriages = plan.carriages.map((c, i) =>
        i === carriageIndex
          ? { ...c, taskId: null, status: "pending" as const, updatedAt: Date.now() }
          : c
      );
      persistPlan({ ...plan, carriages: newCarriages }, "移除任务");
    },
    [plan, persistPlan]
  );

  const insertCarriageWithTask = useCallback(
    (afterIndex: number, taskId: string) => {
      const newCarriages = insertCarriageAt(
        plan.carriages,
        afterIndex + 1,
        currentDate,
        taskId
      );
      persistPlan({ ...plan, carriages: newCarriages }, "插入任务车厢");
    },
    [plan, currentDate, persistPlan]
  );

  const replaceCarriageTask = useCallback(
    (carriageIndex: number, newTaskId: string) => {
      const newCarriages = plan.carriages.map((c, i) =>
        i === carriageIndex
          ? { ...c, taskId: newTaskId, status: "pending" as const, updatedAt: Date.now() }
          : c
      );
      persistPlan({ ...plan, carriages: newCarriages }, "替换任务");
    },
    [plan, persistPlan]
  );

  // ── Undo ────────────────────────────────────────────────────
  const undo = useCallback(() => {
    const record = popUndoRecord(currentDate);
    if (!record) return;
    setTasksState(record.snapshot.tasks);
    saveTasks(record.snapshot.tasks);
    setPlanState(record.snapshot.plan);
    savePlan(record.snapshot.plan);
    setCanUndo(hasUndoRecords(currentDate));
  }, [currentDate]);

  // ── Stats ───────────────────────────────────────────────────
  const taskCarriages = plan.carriages.filter((c) => c.taskId !== null);
  const allTagged =
    taskCarriages.length > 0 &&
    taskCarriages.every((c) => c.status !== "pending");
  const doneCount = taskCarriages.filter((c) => c.status === "done").length;
  const completionRate = allTagged
    ? Math.round((doneCount / taskCarriages.length) * 100)
    : null;
  const allDone =
    taskCarriages.length > 0 && taskCarriages.every((c) => c.status === "done");

  return (
    <AppContext.Provider
      value={{
        userId,
        currentDate,
        setCurrentDate,
        tasks,
        plan,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskHidden,
        addCarriageAtHead,
        addCarriageAtTail,
        addCarriageBetween,
        deleteCarriage,
        setCarriageStatus,
        assignTaskToCarriage,
        removeTaskFromCarriage,
        insertCarriageWithTask,
        replaceCarriageTask,
        canUndo,
        undo,
        completionRate,
        allDone,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
