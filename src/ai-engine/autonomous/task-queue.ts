// V12 Alpha – Simple file-backed task queue

import fs from "fs";
import path from "path";

export type TaskStatus = "pending" | "running" | "done" | "failed";

export interface Task {
  id: string;
  type: string;              // e.g. "cattle-load-auto-match"
  payload: any;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  lastError?: string;
}

const QUEUE_PATH = path.join(process.cwd(), "data/task-queue.json");

function loadQueue(): Task[] {
  if (!fs.existsSync(QUEUE_PATH)) {
    fs.writeFileSync(QUEUE_PATH, JSON.stringify([], null, 2));
  }
  return JSON.parse(fs.readFileSync(QUEUE_PATH, "utf8"));
}

function saveQueue(tasks: Task[]) {
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(tasks, null, 2));
}

export function enqueueTask(type: string, payload: any): Task {
  const tasks = loadQueue();
  const now = new Date().toISOString();

  const task: Task = {
    id: `TASK_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    type,
    payload,
    status: "pending",
    createdAt: now,
    updatedAt: now
  };

  tasks.push(task);
  saveQueue(tasks);
  return task;
}

export function getNextPendingTask(): Task | null {
  const tasks = loadQueue();
  const task = tasks.find(t => t.status === "pending") || null;
  return task || null;
}

export function updateTask(task: Task) {
  const tasks = loadQueue();
  const idx = tasks.findIndex(t => t.id === task.id);
  if (idx >= 0) {
    tasks[idx] = task;
    saveQueue(tasks);
  }
}
