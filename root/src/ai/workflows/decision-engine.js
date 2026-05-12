/**
 * Workflow Registry
 * -----------------
 * Each workflow is a safe, modular, multi-step process the AI can run.
 * Workflows NEVER execute code directly. They only analyze, plan, or simulate.
 */

import { safeAnalyze } from "../tools/analyzer.js";
import { safeSummarize } from "../tools/summarizer.js";
import { safeInspectInfra } from "../tools/infra-inspector.js";

const workflows = {

    // --- 1. Default workflow ---
    default: {
        name: "default",
        description: "Basic reasoning workflow for general tasks.",

        async run(input, tools) {
            return {
                action: "analyze",
                trustZone: input.trustZone || "public",
                summary: await safeSummarize(input),
                metadata: {
                    workflow: "default",
                    timestamp: Date.now()
                }
            };
        }
    },

    // --- 2. Diagnostic workflow ---
    diagnostics: {
        name: "diagnostics",
        description: "Runs safe infrastructure diagnostics using approved tools.",

        async run(input, tools) {
            const infra = await safeInspectInfra(input.target || null);

            return {
                action: "analyze",
                trustZone: "internal",
                diagnostics: infra,
                metadata: {
                    workflow: "diagnostics",
                    timestamp: Date.now()
                }
            };
        }
    },

    // --- 3. Code analysis workflow ---
    codeAnalysis: {
        name: "codeAnalysis",
        description: "Analyzes code safely without executing it.",

        async run(input, tools) {
            const code = input.code || "";

            const analysis = await safeAnalyze(code);

            return {
                action: "analyze",
                trustZone: "internal",
                analysis,
                metadata: {
                    workflow: "codeAnalysis",
                    timestamp: Date.now()
                }
            };
        }
    },

    // --- 4. Simulation workflow ---
    simulate: {
        name: "simulate",
        description: "Runs a safe simulation (no execution, no side effects).",

        async run(input, tools) {
            return {
                action: "simulate",
                trustZone: "internal",
                simulation: {
                    scenario: input.scenario || "none",
                    result: "Simulation completed safely.",
                    notes: "No code executed. No external systems touched."
                },
                metadata: {
                    workflow: "simulate",
                    timestamp: Date.now()
                }
            };
        }
    }
};

export default workflows;

