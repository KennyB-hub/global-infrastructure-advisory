export async function handleAuthCallback(request) {
  const url = new URL(request.url);
  const role = url.searchParams.get("role") || "public";

  return new Response(JSON.stringify({
    authenticated: true,
    role,
    timestamp: Date.now()
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
