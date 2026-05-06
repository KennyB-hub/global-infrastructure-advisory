// 2050 V12 Alpha — AI Logs

export function logAIEvent({ type, task, result, error }) {
  const entry = {
    type,
    timestamp: Date.now(),
    task: task ? { kind: task.type, workflow: task.workflow } : null,
    result: result ? { ok: result.ok } : null,
    error: error ? { message: error.message || String(error) } : null
  };

  // For now: console. Later: send to log/analytics pipeline.
  console.log("[AI]", JSON.stringify(entry));
}
