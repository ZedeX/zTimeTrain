import { DailyPlan, Task, UndoRecord } from "./types";
import { v4 as uuidv4 } from "uuid";

const MAX_UNDO = 10;
const UNDO_KEY = "tt_undo_stack";

export function saveUndoSnapshot(
  date: string,
  description: string,
  tasks: Task[],
  plan: DailyPlan
): void {
  if (typeof window === "undefined") return;
  const stack = loadUndoStack(date);
  const record: UndoRecord = {
    id: uuidv4(),
    timestamp: Date.now(),
    description,
    snapshot: { tasks, plan },
  };
  stack.push(record);
  if (stack.length > MAX_UNDO) stack.splice(0, stack.length - MAX_UNDO);
  saveUndoStack(date, stack);
}

export function loadUndoStack(date: string): UndoRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(`${UNDO_KEY}_${date}`);
  if (!raw) return [];
  return JSON.parse(raw) as UndoRecord[];
}

function saveUndoStack(date: string, stack: UndoRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${UNDO_KEY}_${date}`, JSON.stringify(stack));
}

export function popUndoRecord(
  date: string
): UndoRecord | null {
  if (typeof window === "undefined") return null;
  const stack = loadUndoStack(date);
  if (stack.length === 0) return null;
  const record = stack.pop()!;
  saveUndoStack(date, stack);
  return record;
}

export function clearUndoStack(date: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${UNDO_KEY}_${date}`);
}

export function hasUndoRecords(date: string): boolean {
  if (typeof window === "undefined") return false;
  return loadUndoStack(date).length > 0;
}
