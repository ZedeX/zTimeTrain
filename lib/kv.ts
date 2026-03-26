// Server-side only – used in API routes
import { AppState, DailyPlan, Task } from "./types";

const KEY = {
  tasks: (uid: string) => `user:${uid}:tasks`,
  plan: (uid: string, date: string) => `user:${uid}:plan:${date}`,
  meta: (uid: string) => `user:${uid}:meta`,
};

async function getKV() {
  try {
    const mod = await import("@vercel/kv");
    return mod.kv;
  } catch {
    return null;
  }
}

export async function kvGetTasks(userId: string): Promise<Task[] | null> {
  const kv = await getKV();
  if (!kv) return null;
  return kv.get<Task[]>(KEY.tasks(userId));
}

export async function kvSetTasks(userId: string, tasks: Task[]): Promise<void> {
  const kv = await getKV();
  if (!kv) return;
  await kv.set(KEY.tasks(userId), tasks);
}

export async function kvGetPlan(
  userId: string,
  date: string
): Promise<DailyPlan | null> {
  const kv = await getKV();
  if (!kv) return null;
  return kv.get<DailyPlan>(KEY.plan(userId, date));
}

export async function kvSetPlan(
  userId: string,
  plan: DailyPlan
): Promise<void> {
  const kv = await getKV();
  if (!kv) return;
  await kv.set(KEY.plan(userId, plan.date), plan);
}

export async function kvGetMeta(
  userId: string
): Promise<{ lastModified: number; planDates: string[] } | null> {
  const kv = await getKV();
  if (!kv) return null;
  return kv.get(KEY.meta(userId));
}

export async function kvSetMeta(
  userId: string,
  meta: { lastModified: number; planDates: string[] }
): Promise<void> {
  const kv = await getKV();
  if (!kv) return;
  await kv.set(KEY.meta(userId), meta);
}

export async function kvGetFullState(userId: string): Promise<AppState | null> {
  const meta = await kvGetMeta(userId);
  if (!meta) return null;
  const tasks = (await kvGetTasks(userId)) ?? [];
  const planEntries = await Promise.all(
    meta.planDates.map(async (d) => {
      const p = await kvGetPlan(userId, d);
      return p ? [d, p] : null;
    })
  );
  const plans = Object.fromEntries(
    planEntries.filter(Boolean) as [string, DailyPlan][]
  );
  return { userId, tasks, plans, lastModified: meta.lastModified };
}

export async function kvSaveFullState(state: AppState): Promise<void> {
  await kvSetTasks(state.userId, state.tasks);
  const planDates = Object.keys(state.plans);
  await Promise.all(
    planDates.map((d) => kvSetPlan(state.userId, state.plans[d]))
  );
  await kvSetMeta(state.userId, {
    lastModified: state.lastModified,
    planDates,
  });
}
