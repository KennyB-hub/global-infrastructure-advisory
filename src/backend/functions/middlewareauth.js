// functions/_middleware.js
export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // 1. Define public routes that don't need auth (like your Home page)
  if (url.pathname === "/" || url.pathname.startsWith("/assets")) {
    return next();
  }

  // 2. Check for the Microsoft Entra ID Token
  // In 2026, Cloudflare Access can automatically inject identity headers
  const identity = request.headers.get("Cf-Access-Jwt-Assertion");

  if (!identity) {
    // Redirect to login if no token is found
    return new Response("Unauthorized: Please log in via @globalinfrastructureadvisory.com", { status: 401 });
  }

  try {
    // 3. (Optional) Strict Validation
    // You can verify the token against your Microsoft Tenant ID here
    return await next(); 
  } catch (err) {
    return new Response("Forbidden: Invalid Credentials", { status: 403 });
  }
}
