import { enqueueTask } from "../seven-os/autonomous/task-queue.js";

const [,, taskType, payloadJson] = process.argv;

if (!taskType) {
  console.error("Usage: node trigger-task.js <taskType> <payloadJson>");
  process.exit(1);
}

let payload = {};
if (payloadJson) {
  try {
    payload = JSON.parse(payloadJson);
  } catch {
    console.error("Invalid JSON payload");
    process.exit(1);
  }
}

const task = enqueueTask(taskType, payload);
console.log("Task enqueued:", task);
