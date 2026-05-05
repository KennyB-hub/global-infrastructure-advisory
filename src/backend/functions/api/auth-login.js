export async function handleAuthLogin(request) {
  const url = new URL(request.url);
  const role = url.searchParams.get("role") || "public";

  // In a real system, you'd validate credentials here.

  return new Response(null, {
    status: 302,
    headers: {
      "Location": `/auth/callback.html?role=${role}`
    }
  });
}
