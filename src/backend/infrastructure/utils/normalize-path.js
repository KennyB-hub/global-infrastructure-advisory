export function normalizePath(path) {
    if (!path) return "";

    return path
        .replace(/\\/g, "/")
        .replace(/\/+/g, "/")
        .trim();
}
