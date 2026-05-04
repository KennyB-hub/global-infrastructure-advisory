export function getTrustZone(pathname) {
    if (pathname.startsWith("/public/")) return "public";
    if (pathname.startsWith("/contractor/")) return "contractor";
    if (pathname.startsWith("/farmer/")) return "farmer";
    if (pathname.startsWith("/gov/")) return "gov";
    if (pathname.startsWith("/deepgov/")) return "deepgov";
    if (pathname.startsWith("/admin/")) return "admin";
    if (pathname.startsWith("/system/")) return "system";
    return "unknown";
}

export function checkTrust(zone, request) {
    const role = request.headers.get("X-Role") || "public";
    const auth = request.headers.get("Authorization");

    if (zone === "public") return true;
    if (zone === "contractor" || zone === "farmer") return !!auth;
    if (zone === "gov") return role === "gov" || role === "deepgov";
    if (zone === "deepgov") return role === "deepgov";
    if (zone === "admin") return role === "admin";
    if (zone === "system") return role === "system" || role === "admin";
    return false;
}
