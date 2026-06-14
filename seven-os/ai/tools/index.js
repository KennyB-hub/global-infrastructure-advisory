/**
 * Global Tools Index
 * -------------------
 * Central registry that exposes all safe, approved tools
 * to the decision engine and workflow system.
 *
 * Tools are grouped by domain:
 *  - core: general-purpose analysis tools
 *  - security: infrastructure & posture inspection
 *  - gov: government advisory tools
 *  - public: public communication tools
 */

import securityTools from "./security/index.js";
import govTools from "./gov/index.js";
import publicTools from "./public/index.js";

// Core tools (safe, read-only)
import { safeAnalyze } from "./analyzer.js";
import { safeSummarize } from "./summarizer.js";
import { safeInspectInfra } from "./infra-inspector.js";

const tools = {
    core: {
        analyze: safeAnalyze,
        summarize: safeSummarize,
        inspectInfra: safeInspectInfra
    },

    security: {
        ...securityTools
    },

    gov: {
        ...govTools
    },

    public: {
        ...publicTools
    }
};

export default tools;
