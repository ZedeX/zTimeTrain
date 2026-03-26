import type { AppState, DailyPlan, Task } from "./types";

export function getDB(): any {
  if (typeof process !== "undefined" && (process as any).env.DB) {
    return (process as any).env.DB;
  }
  return null;
}

export async function dbGetTasks(db: any, userId: string): Promise<Task[]> {
  const result = await db
    .prepare("SELECT * FROM tasks WHERE user_id = ?")
    .bind(userId)
    .all();
  if (!result.success) return [];
  return (result.results as any[]).map((row) => ({
    id: row.task_id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    category: row.category,
    isPreset: Boolean(row.is_preset),
    isHidden: Boolean(row.is_hidden),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function dbSetTasks(db: any, userId: string, tasks: Task[]): Promise<void> {
  const now = Date.now();
  await db.prepare("DELETE FROM tasks WHERE user_id = ?").bind(userId).run();
  for (const task of tasks) {
    await db
      .prepare(
        "INSERT INTO tasks (task_id, user_id, name, icon, color, category, is_preset, is_hidden, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        task.id,
        userId,
        task.name,
        task.icon,
        task.color,
        task.category,
        task.isPreset ? 1 : 0,
        task.isHidden ? 1 : 0,
        task.createdAt,
        task.updatedAt
      )
      .run();
  }
}

export async function dbGetPlan(db: any, userId: string, date: string): Promise<DailyPlan | null> {
  const planResult = await db
    .prepare("SELECT * FROM daily_plans WHERE user_id = ? AND date = ?")
    .bind(userId, date)
    .first();
  if (!planResult) return null;

  const carriagesResult = await db
    .prepare("SELECT * FROM carriages WHERE user_id = ? AND date = ? ORDER BY `order` ASC")
    .bind(userId, date)
    .all();

  const carriages = (carriagesResult.results as any[]).map((row) => ({
    id: row.carriage_id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    taskId: row.task_id,
    status: row.status,
    order: row.order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return {
    date: (planResult as any).date,
    carriages,
    lastModified: (planResult as any).last_modified,
  };
}

export async function dbSetPlan(db: any, userId: string, plan: DailyPlan): Promise<void> {
  const now = Date.now();
  const planId = `${userId}-${plan.date}`;

  await db
    .prepare(
      "INSERT OR REPLACE INTO daily_plans (plan_id, user_id, date, last_modified) VALUES (?, ?, ?, ?)"
    )
    .bind(planId, userId, plan.date, plan.lastModified)
    .run();

  await db.prepare("DELETE FROM carriages WHERE user_id = ? AND date = ?").bind(userId, plan.date).run();
  for (const carriage of plan.carriages) {
    await db
      .prepare(
        "INSERT INTO carriages (carriage_id, user_id, plan_id, date, start_time, end_time, task_id, status, `order`, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        carriage.id,
        userId,
        planId,
        carriage.date,
        carriage.startTime,
        carriage.endTime,
        carriage.taskId,
        carriage.status,
        carriage.order,
        carriage.createdAt,
        carriage.updatedAt
      )
      .run();
  }
}

export async function dbGetMeta(db: any, userId: string): Promise<{ lastModified: number; planDates: string[] } | null> {
  const userResult = await db
    .prepare("SELECT * FROM users WHERE user_id = ?")
    .bind(userId)
    .first();
  if (!userResult) return null;

  const plansResult = await db
    .prepare("SELECT date FROM daily_plans WHERE user_id = ?")
    .bind(userId)
    .all();

  const planDates = (plansResult.results as any[]).map((r) => r.date);
  return {
    lastModified: (userResult as any).last_modified,
    planDates,
  };
}

export async function dbSetMeta(db: any, userId: string, meta: { lastModified: number; planDates: string[] }): Promise<void> {
  await db
    .prepare(
      "INSERT OR REPLACE INTO users (user_id, created_at, last_modified) VALUES (?, ?, ?)"
    )
    .bind(userId, Date.now(), meta.lastModified)
    .run();
}

export async function dbGetFullState(db: any, userId: string): Promise<AppState | null> {
  const meta = await dbGetMeta(db, userId);
  if (!meta) return null;

  const tasks = await dbGetTasks(db, userId);
  const plans: Record<string, DailyPlan> = {};
  for (const date of meta.planDates) {
    const plan = await dbGetPlan(db, userId, date);
    if (plan) {
      plans[date] = plan;
    }
  }

  return {
    userId,
    tasks,
    plans,
    lastModified: meta.lastModified,
  };
}

export async function dbSaveFullState(db: any, state: AppState): Promise<void> {
  await dbSetMeta(db, state.userId, {
    lastModified: state.lastModified,
    planDates: Object.keys(state.plans),
  });
  await dbSetTasks(db, state.userId, state.tasks);
  for (const date of Object.keys(state.plans)) {
    await dbSetPlan(db, state.userId, state.plans[date]);
  }
}
