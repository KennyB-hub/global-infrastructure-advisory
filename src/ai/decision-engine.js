    // --- 7. Return safe, validated output ---
    log("Decision engine completed successfully.");

    return {
      success: true,
      timestamp: new Date().toISOString(),
      engine: config.engine, // Pulled from your new config.json
      version: config.version,
      trustZone,
      data: result,
      metadata: {
        sectorVerified: !!sectorSchema, // Ensures schema guard was active
        environment: config.environment,
        isMock: !input.live && !!MockData.mockSectors // Flags if using fallback data
      },
      // --- 8. Auto-Logging (Integrated with your new logs folder) ---
      logId: await persistDecisionLog(input, result, trustZone) 
    };
  } catch (globalErr) {
    return { error: "Critical engine failure", details: globalErr.message };
  }
}

/**
 * Utility to save "thoughts" to your new src/data/logs folder
 */
async function persistDecisionLog(input, output, zone) {
  const logEntry = {
    input,
    output,
    zone,
    configSnapshot: config.features
  };
  
  // In a real environment, you'd use fs.writeFile to src/data/logs/
  // For now, we signal the platform to store this in the AI Sandbox
  console.info("[LOGGING] Decision persisted to src/data/logs/session.json");
  return `log-${Date.now()}`;
}

        output: result,
        trustZone
    };
}

// 1. Import your restored Audit Engine from the Enterprise Hub
import { sovereignAudit } from './audit-engine.js'; 

// 2. Update the persist function inside Decision Engine
async function persistDecisionLog(input, output, zone, env) {
    const auditToken = await sovereignAudit.generateEntry({
        sector: input.sector,
        decision: output,
        trustZone: zone,
        governorVersion: "v12-Enterprise"
    }, env);

    // Instead of a local file, push to your Secure Enterprise Log Endpoint
    await env.GLOBAL_DB.prepare(
        "INSERT INTO system_audit (id, zone, payload) VALUES (?, ?, ?)"
    ).bind(auditToken.id, zone, auditToken.signedPayload).run();

    return auditToken.id;
}
