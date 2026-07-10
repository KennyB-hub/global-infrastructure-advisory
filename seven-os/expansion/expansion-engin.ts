// src/expansion/expansion-engine.ts
// ExpansionEngine – orchestrates the full expansion lifecycle.

import { MCP } from "../mcp/mcp-client";
import { DID } from "../backend/identity/did";
import { VC } from "../backend/identity/vc";
import { SovereignPolicy } from "../policy/sovereign-policy";

export class ExpansionEngine {
  private env: any;
  private mcp: MCP;
  private policy: SovereignPolicy;

  constructor(env: any) {
    this.env = env;
    this.mcp = new MCP(env);
    this.policy = new SovereignPolicy(env);
  }

  // ----------------- 1. discoverCandidates -----------------
  async discoverCandidates(input: {
    demandSignals?: any;
    economicSignals?: any;
    policySignals?: any;
  }): Promise<any[]> {
    // TODO: wire to real discovery sources (telemetry, demand, configs)
    const candidates = await this.mcp.call("mcp://discovery", {
      demandSignals: input.demandSignals,
      economicSignals: input.economicSignals,
      policySignals: input.policySignals
    });

    return candidates?.candidateSet || [];
  }

  // ----------------- 2. evaluateEconomics -----------------
  async evaluateEconomics(candidateSet: any[]): Promise<any[]> {
    const result = await this.mcp.call("mcp://planning", {
      candidateSet,
      filters: {
        minROIThreshold: this.env.MIN_ROI_THRESHOLD ?? 0.1,
        maxLatencyTarget: this.env.MAX_LATENCY_TARGET ?? 150,
        minPowerAvailability: this.env.MIN_POWER_AVAILABILITY ?? 0.8
      }
    });

    return result?.viableCandidates || [];
  }

  // ----------------- 3. checkTrustAndPolicy -----------------
  async checkTrustAndPolicy(viableCandidates: any[]): Promise<any[]> {
    const sovereignPolicy = await this.policy.loadPolicies();
    const trustZones = sovereignPolicy.trustZones || [];

    const result = await this.mcp.call("mcp://governance", {
      viableCandidates,
      sovereignPolicy,
      trustZones
    });

    return result?.approvedExpansionTargets || [];
  }

  // ----------------- 4. planExpansion -----------------
  async planExpansion(approvedExpansionTargets: any[]): Promise<any> {
    const expansionPlan = await this.mcp.call("mcp://planning", {
      approvedExpansionTargets
    });

    return expansionPlan?.expansionPlan || {};
  }

  // ----------------- 5. executeExpansion -----------------
  async executeExpansion(expansionPlan: any): Promise<any> {
    // Provision infra via MCP
    const infraResult = await this.mcp.call("mcp://execution", {
      step: "provisionInfra",
      plan: expansionPlan
    });

    // Issue DIDs
    const dids = await DID.issueForPlan(expansionPlan, this.env);

    // Issue VCs
    const vcs = await VC.issueForPlan(expansionPlan, dids, this.env);

    // Register with Organizer 7-of-9 via MCP
    await this.mcp.call("mcp://execution", {
      step: "registerWithOrganizer_7of9",
      dids,
      vcs
    });

    // Open MCP channels
    await this.mcp.call("mcp://execution", {
      step: "openMCPChannels",
      dids
    });

    return {
      infraResult,
      dids,
      vcs
    };
  }

  // ----------------- 6. monitorExpansion -----------------
  async monitorExpansion(expansionResults: any): Promise<{
    performanceMetrics: any;
    complianceReports: any;
  }> {
    const monitoring = await this.mcp.call("mcp://monitoring", {
      expansionResults
    });

    return {
      performanceMetrics: monitoring?.performanceMetrics || {},
      complianceReports: monitoring?.complianceReports || {}
    };
  }

  // ----------------- 7. refineStrategy -----------------
  async refineStrategy(
    performanceMetrics: any,
    complianceReports?: any
  ): Promise<any> {
    const result = await this.mcp.call("mcp://planning", {
      performanceMetrics,
      complianceReports
    });

    return result?.strategyAdjustments || {};
  }

  // ----------------- 8. iterateExpansion -----------------
  async iterateExpansion(strategyAdjustments: any): Promise<any> {
    const result = await this.mcp.call("mcp://planning", {
      strategyAdjustments
    });

    return result?.updatedExpansionPlan || {};
  }

  // ----------------- 9. evaluateExpansionOutcomes -----------------
  async evaluateExpansionOutcomes(
    updatedExpansionPlan: any,
    performanceMetrics: any
  ): Promise<any> {
    const result = await this.mcp.call("mcp://governance", {
      updatedExpansionPlan,
      performanceMetrics
    });

    return result?.finalEvaluationReport || {};
  }

  // ----------------- 10. documentLessonsLearned -----------------
  async documentLessonsLearned(finalEvaluationReport: any): Promise<any> {
    const kbEntry = await this.mcp.call("mcp://governance", {
      finalEvaluationReport
    });

    return kbEntry?.knowledgeBaseEntry || {};
  }

  // ----------------- 11. planNextIteration -----------------
  async planNextIteration(knowledgeBaseEntry: any): Promise<any> {
    const result = await this.mcp.call("mcp://planning", {
      knowledgeBaseEntry
    });

    return result?.nextIterationPlan || {};
  }
}
