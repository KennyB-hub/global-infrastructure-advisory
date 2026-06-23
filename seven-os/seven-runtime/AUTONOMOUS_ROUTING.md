# Autonomous Task Management Routing (Seven-of-Nine)

## Overview
Seven-of-Nine is the autonomous task queue worker that processes background tasks in the GIA system. Tasks are enqueued through the AI router and processed asynchronously.

## New Imports Added to `ai-router.js`
```javascript
import { enqueueTask, getNextPendingTask, updateTask } from "./seven-os/task-queue.js";
import { getTaskHandler } from "./seven-os/task-registry.js";
import { runSevenOfNineOnce } from "./seven-os/seven-of-nine.js";
```

## AI Router Switch Cases (ai-router.js)

### `task-enqueue`
Enqueues a new task for Seven-of-Nine to process.

**Input:**
```json
{
  "workflow": "task-enqueue",
  "taskType": "cattle-load-auto-match",
  "payload": { "loadId": "LOAD_123" }
}
```

**Output:**
```json
{
  "ok": true,
  "type": "task-enqueue",
  "task": {
    "id": "TASK_1621234567_abc123",
    "type": "cattle-load-auto-match",
    "payload": { "loadId": "LOAD_123" },
    "status": "pending",
    "createdAt": "2026-05-21T13:56:29.579Z",
    "updatedAt": "2026-05-21T13:56:29.579Z"
  }
}
```

### `task-status`
Get status of a specific task or all tasks.

**Input (single task):**
```json
{
  "workflow": "task-status",
  "taskId": "TASK_1621234567_abc123"
}
```

**Output:**
```json
{
  "ok": true,
  "type": "task-status",
  "task": {
    "id": "TASK_1621234567_abc123",
    "type": "cattle-load-auto-match",
    "status": "running",
    "createdAt": "2026-05-21T13:56:29.579Z",
    "updatedAt": "2026-05-21T13:56:30.123Z"
  }
}
```

### `task-process`
Manually trigger Seven-of-Nine to process the next pending task (one cycle).

**Input:**
```json
{
  "workflow": "task-process"
}
```

**Output:**
```json
{
  "ok": true,
  "type": "task-process",
  "message": "Task processor executed (one cycle)"
}
```

### `task-list`
Get all tasks or filter by status.

**Input (all tasks):**
```json
{
  "workflow": "task-list"
}
```

**Input (filtered by status):**
```json
{
  "workflow": "task-list",
  "status": "pending"
}
```

**Output:**
```json
{
  "ok": true,
  "type": "task-list",
  "tasks": [
    {
      "id": "TASK_1621234567_abc123",
      "type": "cattle-load-auto-match",
      "status": "pending",
      "createdAt": "2026-05-21T13:56:29.579Z",
      "updatedAt": "2026-05-21T13:56:29.579Z"
    }
  ],
  "total": 1
}
```

## REST API Endpoints (router.js)

New endpoints added to `/backend/functions/api/router.js`:

### POST `/api/autonomous/task/enqueue`
Enqueue a new task.

```bash
curl -X POST http://localhost/api/autonomous/task/enqueue \
  -H "Content-Type: application/json" \
  -d '{
    "taskType": "cattle-load-auto-match",
    "payload": { "loadId": "LOAD_123" }
  }'
```

### GET `/api/autonomous/task/status`
Get task status (specific or all).

```bash
curl -X GET http://localhost/api/autonomous/task/status \
  -H "Content-Type: application/json" \
  -d '{ "taskId": "TASK_1621234567_abc123" }'
```

### POST `/api/autonomous/task/process`
Manually trigger task processor.

```bash
curl -X POST http://localhost/api/autonomous/task/process
```

### GET `/api/autonomous/task/list`
List all tasks or filter by status.

```bash
curl -X GET http://localhost/api/autonomous/task/list \
  -H "Content-Type: application/json" \
  -d '{ "status": "pending" }'
```

### POST `/api/ai/process`
General AI engine router (gateway to all AI workflows).

```bash
curl -X POST http://localhost/api/ai/process \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": "task-enqueue",
    "taskType": "repo-scan",
    "payload": {}
  }'
```

## Available Task Types (task-registry.js)

Handlers registered in `task-registry.ts`:

- **`cattle-load-auto-match`** - Auto-match open livestock loads to haulers
- **`repo-scan`** - Scan repository structure
- **`repo-analyze`** - Analyze repository and generate suggestions
- **`expand-sectors`** - Expand sector directories with templates
- **`generate-workflows`** - Generate workflow files for all sectors
- **`generate-ux-rules`** - Generate UX rules for all sectors
- **`generate-ai-engines`** - Generate AI engine stubs for all sectors
- **`generate-compliance`** - Generate compliance files for sectors

## Task Status Values

- **`pending`** - Task is waiting to be processed
- **`running`** - Task is currently being executed
- **`done`** - Task completed successfully
- **`failed`** - Task failed with an error

## Integration Notes

1. **Seven-of-Nine Worker**: The autonomous worker continuously picks up pending tasks and executes their registered handlers.
2. **Task Queue**: File-backed queue stored in `data/task-queue.json`
3. **Error Handling**: Failed tasks store `lastError` message for debugging
4. **Async Processing**: Tasks can be long-running; use task IDs to poll status

## Example Workflow

```javascript
// 1. Enqueue a task
POST /api/autonomous/task/enqueue
{ "taskType": "cattle-load-auto-match", "payload": {} }
// Returns: { task: { id: "TASK_...", status: "pending" } }

// 2. Check status
POST /api/autonomous/task/status
{ "taskId": "TASK_..." }
// Returns: { task: { status: "running" } }

// 3. Manually trigger processor (optional)
POST /api/autonomous/task/process
// Seven-of-Nine processes one cycle

// 4. Check final status
POST /api/autonomous/task/status
{ "taskId": "TASK_..." }
// Returns: { task: { status: "done" } }
```

## Files Updated

- ✅ `/ai/engines/ai-router.js` - Added autonomous imports and route handlers
- ✅ `/backend/functions/api/router.js` - Added REST endpoints for task management
- ✅ `/ai/engines/AUTONOMOUS_ROUTING.md` - This documentation
