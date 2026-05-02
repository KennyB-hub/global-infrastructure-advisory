// /backend/workers/heartbeat.js
export function heartbeat() {
  return new Response("OK", { status: 200 });
}
