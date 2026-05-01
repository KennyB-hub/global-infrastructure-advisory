export function basicSecurityGuard(request) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const ua = request.headers.get("User-Agent") || "";

  // Block obvious junk
  if (!ua || ua.length < 5 || ua.toLowerCase().includes("bot")) {
    return new Response("Forbidden", { status: 403 });
  }

  // Allow only expected methods
  const allowed = ["GET", "POST", "OPTIONS"];
  if (!allowed.includes(request.method)) {
    return new Response("Method Not Allowed", { status: 405 });
  }

  return null; // OK
}
