export function parseEndpoint(endpoint) {
    if (!endpoint) {
        return { error: "No endpoint provided" };
    }

    const clean = endpoint.replace(/\/+/g, "/").trim();
    const parts = clean.split("/").filter(Boolean);

    return {
        raw: endpoint,
        clean,
        parts,
        root: parts[0] || null,
        sub: parts.slice(1)
    };
}
