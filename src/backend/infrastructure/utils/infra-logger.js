export function infraLog(event, data = {}) {
    const timestamp = new Date().toISOString();

    return {
        timestamp,
        event,
        ...data
    };
}
