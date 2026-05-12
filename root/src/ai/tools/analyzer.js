/**
 * analyzer.js
 * ------------
 * Safe static analysis tool.
 * Inspects code or text without executing anything.
 */

export async function safeAnalyze(input = "") {
    const text = typeof input === "string" ? input : JSON.stringify(input);

    return {
        length: text.length,
        lines: text.split("\n").length,
        containsFunctions: text.includes("function") || text.includes("=>"),
        containsImports: text.includes("import ") || text.includes("require("),
        containsNetworkCalls: text.includes("fetch(") || text.includes("axios"),
        containsDangerousPatterns: detectDangerousPatterns(text),
        note: "Static analysis only. No code executed."
    };
}

function detectDangerousPatterns(text) {
    const patterns = [
        "child_process",
        "eval(",
        "Function(",
        "process.",
        "fs.",
        "while(true)",
        "for(;;)"
    ];

    return patterns.filter(p => text.includes(p));
}
