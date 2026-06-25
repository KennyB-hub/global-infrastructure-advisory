// V12 Alpha – Autonomous Worker "7 of 9"

import { getNextPendingTask, updateTask, Task } from "./task-queue";
import { getTaskHandler } from "./task-registry";

async function runSingleTask(task: Task) {
  const handler = getTaskHandler(task.type);
  if (!handler) {
    task.status = "failed";
    task.lastError = `No handler for task type: ${task.type}`;
    task.updatedAt = new Date().toISOString();
    updateTask(task);
    return;
  }

  try {
    task.status = "running";
    task.updatedAt = new Date().toISOString();
    updateTask(task);

    await handler(task);

    task.status = "done";
    task.updatedAt = new Date().toISOString();
    updateTask(task);
  } catch (err: any) {
    task.status = "failed";
    task.lastError = err?.message || String(err);
    task.updatedAt = new Date().toISOString();
    updateTask(task);
  }
}

export async function runSevenOfNineOnce() {
  const task = getNextPendingTask();
  if (!task) return; // nothing to do
  await runSingleTask(task);
}

// Optional: loop mode (if you run it as a long-lived worker)
export async function runSevenOfNineLoop(intervalMs = 60000) {
  // simple loop; in real infra you'd use cron / scheduled jobs
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await runSevenOfNineOnce();
    await new Promise(res => setTimeout(res, intervalMs));
  }
}
