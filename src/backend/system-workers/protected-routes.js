export async function protectedRoutes(request, env, ctx, user) {
  const url = new URL(request.url);

  if (url.pathname === "/api/profile") {
    return new Response(JSON.stringify({ user }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (url.pathname === "/api/dispatch") {
    return new Response(JSON.stringify({ status: "Dispatch received" }), {
      status: 200
    });
  }

  return new Response("Protected route not found", { status: 404 });
}
