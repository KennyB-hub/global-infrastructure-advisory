/**
 * formatAdvisory.js
 * ------------------
 * Formats a government advisory into a clean, structured output.
 */

export function formatAdvisory({ sector, topic, analysis, recommendations }) {
    return {
        title: `Government Advisory: ${topic}`,
        sector,
        summary: analysis,
        recommendations,
        timestamp: Date.now()
    };
}
