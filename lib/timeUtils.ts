import dayjs from "dayjs";
import { Carriage } from "./types";
import { v4 as uuidv4 } from "uuid";

/** Convert "HH:MM" to total minutes from midnight */
export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Convert total minutes from midnight to "HH:MM" */
export function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

/** Add 30 minutes to a time string */
export function add30(t: string): string {
  return minutesToTime(timeToMinutes(t) + 30);
}

/** Subtract 30 minutes from a time string */
export function sub30(t: string): string {
  return minutesToTime(timeToMinutes(t) - 30);
}

/** Check if a time is valid (00:00 - 23:30) */
export function isValidTime(t: string): boolean {
  const m = timeToMinutes(t);
  return m >= 0 && m <= 23 * 60 + 30;
}

/** Get current time as "HH:MM" */
export function getCurrentTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

/** Round current time down to nearest :00 or :30 */
export function getCurrentCarriageStart(): string {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes() < 30 ? 0 : 30;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/** Which carriage index does the current time fall in? Returns -1 if none */
export function getCurrentCarriageIndex(carriages: Carriage[]): number {
  const start = getCurrentCarriageStart();
  return carriages.findIndex((c) => c.startTime === start);
}

/** Create a blank carriage */
export function makeCarriage(
  date: string,
  startTime: string,
  order: number
): Carriage {
  const endTime = add30(startTime);
  return {
    id: uuidv4(),
    date,
    startTime,
    endTime,
    taskId: null,
    status: "pending",
    order,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/** Re-index carriages (order from 1) and fix times based on initial startTime + position */
export function reindexCarriages(carriages: Carriage[]): Carriage[] {
  return carriages.map((c, i) => ({
    ...c,
    order: i + 1,
    updatedAt: Date.now(),
  }));
}

/** Insert a new carriage at position idx, pushing later carriages' times forward 30min */
export function insertCarriageAt(
  carriages: Carriage[],
  idx: number,
  date: string,
  taskId: string | null = null
): Carriage[] {
  const newCarriages = [...carriages];
  // The new carriage takes the start time of what was at idx
  const prevCarriage = newCarriages[idx - 1];
  const nextCarriage = newCarriages[idx];

  let newStart: string;
  if (nextCarriage) {
    newStart = nextCarriage.startTime;
    // Shift all carriages from idx onward +30
    for (let i = idx; i < newCarriages.length; i++) {
      newCarriages[i] = {
        ...newCarriages[i],
        startTime: add30(newCarriages[i].startTime),
        endTime: add30(newCarriages[i].endTime),
      };
    }
  } else {
    // Append at end
    newStart = prevCarriage ? add30(prevCarriage.startTime) : "17:00";
  }

  const inserted: Carriage = {
    id: uuidv4(),
    date,
    startTime: newStart,
    endTime: add30(newStart),
    taskId,
    status: "pending",
    order: 0, // will be fixed by reindex
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  newCarriages.splice(idx, 0, inserted);
  return reindexCarriages(newCarriages);
}

/** Delete carriage at index, shift later times back 30min */
export function deleteCarriageAt(
  carriages: Carriage[],
  idx: number
): Carriage[] {
  const newCarriages = [...carriages];
  newCarriages.splice(idx, 1);
  // Shift back: don't shift because PRD says after deletion, subsequent carriages shift forward (they fill the gap)
  // Actually PRD 4.5: after deletion, subsequent carriages shift FORWARD (earlier), meaning move 30min earlier
  for (let i = idx; i < newCarriages.length; i++) {
    newCarriages[i] = {
      ...newCarriages[i],
      startTime: sub30(newCarriages[i].startTime),
      endTime: sub30(newCarriages[i].endTime),
    };
  }
  return reindexCarriages(newCarriages);
}
