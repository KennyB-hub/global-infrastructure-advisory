// GIA Expansion Worker – Worker 9-of-12 (V12 Alpha)
// Safely expands the Collective across clouds, regions, satellites, and infra zones.

import { buildEvent } from "../../system/cyber/event-builder";
import { cyberHook } from "../../system/cyber/worker-hook";

import { MCP } from "./mcp/mcp-client";
import { DID } from "./backend/identity/did";
import { VC } from "./backend/identity/vc";
import { SovereignPolicy } from "../../policy-packs/sovereign/sovereign-policy";

import { ExpansionEngine } from "./expansion-engine";

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    // ---------------------------------------------------------
    // 1. Cyber Event (all expansion actions are logged)
    // ---------------------------------------------------------
    const event = buildEvent({
      source: "expansion-worker",
      sector: "system",
      trustZone: "system",
      type: "expansion_cycle_start",
      metadata: {
        path: url.pathname,
        method: request.method
      }
    });

    await cyberHook(event);

    // ---------------------------------------------------------
    // 2. Only POST is allowed (expansion cycles must be explicit)
    // ---------------------------------------------------------
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Expansion cycles must be triggered via POST",
          worker: "ExpansionWorker",
          version: "V12-Alpha"
        }, null, 2),
        { status: 405 }
      );
    }

    // ---------------------------------------------------------
    // 3. Parse input
    // ---------------------------------------------------------
    let payload: any;
    try {
      payload = await request.json();
    } catch (err: any) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid JSON", details: err.message }, null, 2),
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // 4. Sovereign Policy Enforcement
    // ---------------------------------------------------------
    const policy = new SovereignPolicy(env);
    const policyCheck = await policy.validateExpansionRequest(payload);

    if (!policyCheck.allowed) {
      return new Response(
        JSON.stringify({
          ok: false,
          type: "policy-deny",
          reason: policyCheck.reason,
          trustZone: "system",
          workflow: "expansion",
          timestamp: new Date().toISOString()
        }, null, 2),
        { status: 403 }
      );
    }

    // ---------------------------------------------------------
    // 5. Initialize Expansion Engine
    // ---------------------------------------------------------
    const engine = new ExpansionEngine(env);

    // ---------------------------------------------------------
    // 6. Execute Full Expansion Cycle
    // ---------------------------------------------------------
    const cycle = {};

    cycle["candidateSet"] = await engine.discoverCandidates(payload);
    cycle["viableCandidates"] = await engine.evaluateEconomics(cycle["candidateSet"]);
    cycle["approvedExpansionTargets"] = await engine.checkTrustAndPolicy(
      cycle["viableCandidates"]
    );

    cycle["expansionPlan"] = await engine.planExpansion(
      cycle["approvedExpansionTargets"]
    );

    cycle["expansionResults"] = await engine.executeExpansion(
      cycle["expansionPlan"]
    );

    cycle["performanceMetrics"] = await engine.monitorExpansion(
      cycle["expansionResults"]
    );

    cycle["strategyAdjustments"] = await engine.refineStrategy(
      cycle["performanceMetrics"]
    );

    cycle["updatedExpansionPlan"] = await engine.iterateExpansion(
      cycle["strategyAdjustments"]
    );

    cycle["finalEvaluationReport"] = await engine.evaluateExpansionOutcomes(
      cycle["updatedExpansionPlan"],
      cycle["performanceMetrics"]
    );

    cycle["knowledgeBaseEntry"] = await engine.documentLessonsLearned(
      cycle["finalEvaluationReport"]
    );

    cycle["nextIterationPlan"] = await engine.planNextIteration(
      cycle["knowledgeBaseEntry"]
    );

    // ---------------------------------------------------------
    // 7. Return full cycle output
    // ---------------------------------------------------------
    return new Response(
      JSON.stringify(
        {
          ok: true,
          worker: "ExpansionWorker",
          version: "V12-Alpha",
          cycle
        },
        null,
        2
      ),
      { status: 200 }
    );
  }
};
