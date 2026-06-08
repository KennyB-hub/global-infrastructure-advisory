/**
 * formatBriefing.js
 * ------------------
 * Formats a public-facing briefing in clear, accessible language.
 * No technical jargon, no sensitive details.
 */

export function formatBriefing({ subject, content, tone = "public-safe" }) {
    return {
        title: `Public Briefing: ${subject}`,
        tone,
        summary: simplify(content),
        guidance: generatePublicGuidance(subject),
        timestamp: Date.now()
    };
}

// --- Helper: Simplify content for public audiences ---
function simplify(text = "") {
    if (!text.trim()) return "No content provided.";

    // Basic simplification rules
    return text
        .replace(/infrastructure/gi, "systems")
        .replace(/operational/gi, "working")
        .replace(/mitigation/gi, "prevention")
        .replace(/assessment/gi, "review")
        .replace(/analysis/gi, "review")
        .replace(/stakeholders/gi, "people involved")
        .trim();
}

// --- Helper: Public guidance templates ---
function generatePublicGuidance(subject) {
    return [
        `Stay informed about updates related to ${subject}.`,
        "Follow official channels for accurate information.",
        "Avoid sharing unverified claims.",
        "Reach out to local authorities if you have concerns."
    ];
}
