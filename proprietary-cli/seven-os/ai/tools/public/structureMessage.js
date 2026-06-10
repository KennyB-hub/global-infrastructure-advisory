/**
 * structureMessage.js
 * --------------------
 * Creates a structured, easy-to-read message for public audiences.
 */

export function structureMessage({ headline, body }) {
    return {
        headline,
        body: breakIntoSections(body),
        timestamp: Date.now()
    };
}

function breakIntoSections(text = "") {
    const sentences = text.split(".").map(s => s.trim()).filter(Boolean);

    return sentences.map((s, i) => ({
        section: i + 1,
        text: s
    }));
}
