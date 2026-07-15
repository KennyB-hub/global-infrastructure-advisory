/**
 * summarizer.js
 * ---------------
 * Safe summarization tool.
 * Reduces content into a short, structured summary.
 */

export async function safeSummarize(input = {}) {
    const text = typeof input === "string"
        ? input
        : JSON.stringify(input);

    return {
        summary: generateSummary(text),
        length: text.length,
        note: "Summary generated safely with no external calls."
    };
}

function generateSummary(text) {
    if (text.length < 120) return text;

    return text.slice(0, 120) + "...";
}
