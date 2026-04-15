/**
 * summarizeForPublic.js
 * ----------------------
 * Converts complex information into a short, public-friendly summary.
 */

export function summarizeForPublic(data = {}) {
    const { topic = "general update", details = "" } = data;

    return {
        topic,
        summary: clean(details),
        note: "This summary is simplified for public understanding."
    };
}

function clean(text = "") {
    return text
        .replace(/technical/gi, "complex")
        .replace(/protocol/gi, "process")
        .replace(/configuration/gi, "setup")
        .replace(/optimize/gi, "improve")
        .trim();
}
