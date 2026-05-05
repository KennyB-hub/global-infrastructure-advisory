// /ai-engine/sandbox-bridge.js

import { basicSecurityGuard } from "../backend/security/worker-guard.js";
import { AI as SandboxAI } from "../../src/ai/ai-engine.js"

export async function runSandboxAI(input, env) {
    return SandboxAI.run(input, env)
}

