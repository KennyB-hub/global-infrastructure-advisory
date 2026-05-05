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

// Example Worker logic for the Admin Login
async function handleAdminLogin(request) {
    const { email, password, otp } = await request.json();

    // In a real SAIC-style environment, these would be Environment Variables
    const VALID_EMAIL = "admin@gia.agency";
    const VALID_PASS = "DeepMind2050"; 
    const CURRENT_OTP = "GIA-77-ALPHA"; // This would be dynamic in a real DB

    if (email === VALID_EMAIL && password === VALID_PASS && otp === CURRENT_OTP) {
        return new Response(JSON.stringify({ status: "authorized" }), { status: 200 });
    } else {
        return new Response(JSON.stringify({ status: "denied" }), { status: 403 });
    }
}
