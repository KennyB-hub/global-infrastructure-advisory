export function GateKeeper(request) {
  const email = request.headers.get("Cf-Access-Authenticated-User-Email");
  const jwt = request.headers.get("Cf-Access-Jwt-Assertion");
  const url = new URL(request.url);

  // PUBLIC user
  if (!email || !jwt) {
    return {
      role: "public",
      allowed: !url.pathname.startsWith("/gov")
            && !url.pathname.startsWith("/executive")
            && !url.pathname.startsWith("/vault")
            && !url.pathname.startsWith("/system")
    };
  }

  // GOV user
  if (email.endsWith("@state.gov") || email.endsWith("@agency.gov")) {
    return {
      role: "gov",
      allowed: true
    };
  }

  // EXECUTIVE user
  if (email.endsWith("@gia-executive.net")) {
    return {
      role: "executive",
      allowed: true
    };
  }

  // DEFAULT authenticated user
  return {
    role: "authenticated",
    allowed: true
  };
}
