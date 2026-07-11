import fs from "node:fs";
import path from "node:path";

function resolveTraceFile() {
  if (process.env.PROPRIETARY_CLI_TRACE === "0") return null;

  const configuredPath = process.env.PROPRIETARY_CLI_TRACE_FILE;
  if (configuredPath) return configuredPath;

  const configuredDir = process.env.PROPRIETARY_CLI_TRACE_DIR || path.join(process.cwd(), ".trace");
  fs.mkdirSync(configuredDir, { recursive: true });
  return path.join(configuredDir, "cli-trace.jsonl");
}

export function traceEvent(event, payload = {}, meta = {}) {
  const traceFile = resolveTraceFile();
  if (!traceFile) return;

  const record = {
    timestamp: new Date().toISOString(),
    event,
    payload,
    ...meta,
  };

  try {
    fs.appendFileSync(traceFile, `${JSON.stringify(record)}\n`, "utf8");
  } catch (error) {
    if (process.env.PROPRIETARY_CLI_TRACE_DEBUG === "1") {
      console.error("Trace write failed:", error);
    }
  }
}
