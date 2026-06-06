export const getEnv = (key, fallback = null) =>
    process.env[key] ?? fallback
