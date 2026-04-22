/**
 * GIA CEREBRAL CORTEX + V12 ENGINE
 * --------------------------------
 * Single entrypoint for:
 * - Deep AI logic (Cortex)
 * - Hybrid V12 D1 engine
 * - Hub routing
 * - Continuity heartbeat
 * - Federal spending intelligence
 */

import { checkAILoad } from "./governor.js";
import { GIA_IDENTITY } from "../identity.js";
import { runDecisionEngine } from "./decision-engine.js";
import tools from "./tools/index.js";
import policies from "./policies/index.js";
import workflows from "./workflow/index.js";
import { filterAIOutput } from "./filters/code-filter.js";
import { beforeExecution } from "./hooks/before-execution.js";
import { afterExecution } from "./hooks/after-execution.js";
import { validateAIOutput } from "./validation/schema-guard.js";

/* ---------------------------
   Core AI Logic (Cortex)
---------------------------- */

export async function runAI(input) {
  const trustZone = input.trustZone || "public";
  const policy = policies[trustZone];

  if (!policy) {
    return { error: `No policy defined for: ${trustZone}`, trustZone };
  }

  const policyCheck = policy.validate(input);
  if (!policyCheck.valid) {
    return { error: "Policy violation", details: policyCheck.errors, trustZone };
  }

  const startAudit = beforeExecution(input);

  const decisionResult = await runDecisionEngine({
    ...input,
    trustZone,
    workflows,
    tools,
    // expose V12 + DB to the AI layer
    v12: V12_CYLINDERS,
    db: input.env?.DB
  });

  if (decisionResult.error) {
    return { ...decisionResult, audit: { start: startAudit } };
  }

  const rawOutput = decisionResult.output;

  const filterResult = filterAIOutput(rawOutput);
  if (!filterResult.valid) {
    return { error: "Output blocked by code filter", trustZone, audit: { start: startAudit } };
  }

  const schemaResult = validateAIOutput(rawOutput);
  if (!schemaResult.valid) {
    return { error: "Schema validation failed", trustZone, audit: { start: startAudit } };
  }

  const endAudit = afterExecution(input, rawOutput);

  return {
    success: true,
    identity: GIA_IDENTITY.name,
    output: rawOutput,
    audit: { start: startAudit, end: endAudit }
  };
}

/* ---------------------------
   Unified Worker
---------------------------- */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1) AI API (Cortex) – POST / (or /api/ai)
    if (request.method === "POST" && (path === "/" || path === "/api/ai")) {
      const input = await request.json();
      const result = await runAI({ ...input, env });
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2) Health / status
    if (path === "/status") {
      return json({
        ok: true,
        service: "global-infrastructure-advisory",
        time: Date.now()
      });
    }

    // 3) Hybrid V12: manual admin endpoints
    if (path.startsWith("/api/v12/")) {
      const cylinderName = path.replace("/api/v12/", "").replace(/\/+$/, "");
      const handler = V12_CYLINDERS[cylinderName];
      if (!handler) return json({ error: "Unknown V12 cylinder", cylinder: cylinderName }, 404);
      try {
        return await handler(request, env, ctx);
      } catch (err) {
        console.error("V12 error:", cylinderName, err);
        await logEvent(env, "v12_error", { cylinder: cylinderName, message: String(err) });
        return json({ error: "V12 cylinder failed", cylinder: cylinderName }, 500);
      }
    }

    // 4) Automatic hub routing (Governor mode – UI)
    if (path.startsWith("/government-hub")) {
      return env.ASSETS.fetch(new Request(`${url.origin}/government-hub/index.html`, request));
    }
    if (path.startsWith("/farmer-hub")) {
      return env.ASSETS.fetch(new Request(`${url.origin}/farmer-hub/index.html`, request));
    }
    if (path.startsWith("/contractors-hub")) {
      return env.ASSETS.fetch(new Request(`${url.origin}/contractors-hub/index.html`, request));
    }
    if (path.startsWith("/public-hub")) {
      return env.ASSETS.fetch(new Request(`${url.origin}/public-hub/index.html`, request));
    }

    // 5) Fallback to main Space-Grade UI
    return env.ASSETS.fetch(request);
  },

  // 6) Continuity heartbeat
  async scheduled(event, env, ctx) {
    ctx.waitUntil(heartbeatCylinder(env));
  }
};

/* ---------------------------
   Helpers
---------------------------- */

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers }
  });
}

async function runQuery(env, sql, ...params) {
  return env.DB.prepare(sql).bind(...params).run();
}

async function runGet(env, sql, ...params) {
  return env.DB.prepare(sql).bind(...params).first();
}

/* ---------------------------
   V12 Cylinder Map
---------------------------- */

const V12_CYLINDERS = {
  "job-sites": jobSitesCylinder,
  "contractors": contractorsCylinder,
  "employees": employeesCylinder,
  "assets": assetsCylinder,
  "sectors": sectorsCylinder,
  "countries": countriesCylinder,
  "blueprints": blueprintsCylinder,
  "media": mediaCylinder,
  "logs": logsCylinder,
  "ai-sessions": aiSessionsCylinder,
  "tasks": tasksCylinder,
  "heartbeat": heartbeatCylinder,
  "federal-spending": federalSpendingCylinder // AssistanceListings / USASpending
};

/* ---------------------------
   Core Cylinders
---------------------------- */

// 1) Job sites
async function jobSitesCylinder(request, env) {
  if (request.method === "POST") {
    const body = await request.json();
    const { contractor_id, latitude, longitude } = body;

    await runQuery(
      env,
      "INSERT INTO job_sites (contractor_id, latitude, longitude) VALUES (?, ?, ?)",
      contractor_id,
      latitude,
      longitude
    );

    await logEvent(env, "job_site_created", { contractor_id, latitude, longitude });
    return json({ ok: true });
  }

  if (request.method === "GET") {
    const result = await env.DB.prepare("SELECT * FROM job_sites LIMIT 500").all();
    return json({ ok: true, data: result.results || [] });
  }

  return json({ error: "Method not allowed" }, 405);
}

// 2) Contractors
async function contractorsCylinder(request, env) {
  if (request.method === "POST") {
    const body = await request.json();
    const { name, contact_email, sector } = body;

    await runQuery(
      env,
      "INSERT INTO contractors (name, contact_email, sector) VALUES (?, ?, ?)",
      name,
      contact_email,
      sector
    );

    await logEvent(env, "contractor_created", { name, contact_email, sector });
    return json({ ok: true });
  }

  if (request.method === "GET") {
    const result = await env.DB.prepare("SELECT * FROM contractors LIMIT 500").all();
    return json({ ok: true, data: result.results || [] });
  }

  return json({ error: "Method not allowed" }, 405);
}

// 3) Employees
async function employeesCylinder(request, env) {
  if (request.method === "POST") {
    const body = await request.json();
    const { name, role, hub } = body;

    await runQuery(
      env,
      "INSERT INTO employees (name, role, hub) VALUES (?, ?, ?)",
      name,
      role,
      hub
    );

    await logEvent(env, "employee_created", { name, role, hub });
    return json({ ok: true });
  }

  if (request.method === "GET") {
    const result = await env.DB.prepare("SELECT * FROM employees LIMIT 500").all();
    return json({ ok: true, data: result.results || [] });
  }

  return json({ error: "Method not allowed" }, 405);
}

// 4) Assets
async function assetsCylinder(request, env) {
  if (request.method === "POST") {
    const body = await request.json();
    const { asset_id, type, location, status } = body;

    await runQuery(
      env,
      "INSERT INTO assets (asset_id, type, location, status) VALUES (?, ?, ?, ?)",
      asset_id,
      type,
      location,
      status
    );

    await logEvent(env, "asset_created", { asset_id, type, location, status });
    return json({ ok: true });
  }

  if (request.method === "GET") {
    const result = await env.DB.prepare("SELECT * FROM assets LIMIT 500").all();
    return json({ ok: true, data: result.results || [] });
  }

  return json({ error: "Method not allowed" }, 405);
}

// 5) Sectors
async function sectorsCylinder(request, env) {
  if (request.method === "GET") {
    const result = await env.DB.prepare("SELECT * FROM sectors ORDER BY name ASC").all();
    return json({ ok: true, data: result.results || [] });
  }
  return json({ error: "Method not allowed" }, 405);
}

// 6) Countries
async function countriesCylinder(request, env) {
  if (request.method === "GET") {
    const result = await env.DB.prepare("SELECT * FROM countries ORDER BY name ASC").all();
    return json({ ok: true, data: result.results || [] });
  }
  return json({ error: "Method not allowed" }, 405);
}

// 7) Blueprints
async function blueprintsCylinder(request, env) {
  if (request.method === "GET") {
    const result = await env.DB.prepare(
      "SELECT * FROM blueprints ORDER BY created_at DESC LIMIT 500"
    ).all();
    return json({ ok: true, data: result.results || [] });
  }
  return json({ error: "Method not allowed" }, 405);
}

// 8) Media
async function mediaCylinder(request, env) {
  if (request.method === "POST") {
    const body = await request.json();
    const { job_site_id, url, media_type } = body;

    await runQuery(
      env,
      "INSERT INTO media (job_site_id, url, media_type) VALUES (?, ?, ?)",
      job_site_id,
      url,
      media_type
    );

    await logEvent(env, "media_uploaded", { job_site_id, url, media_type });
    return json({ ok: true });
  }

  if (request.method === "GET") {
    const result = await env.DB.prepare(
      "SELECT * FROM media ORDER BY created_at DESC LIMIT 500"
    ).all();
    return json({ ok: true, data: result.results || [] });
  }

  return json({ error: "Method not allowed" }, 405);
}

// 9) Logs
async function logsCylinder(request, env) {
  if (request.method === "GET") {
    const result = await env.DB.prepare(
      "SELECT * FROM logs ORDER BY created_at DESC LIMIT 500"
    ).all();
    return json({ ok: true, data: result.results || [] });
  }
  return json({ error: "Method not allowed" }, 405);
}

// 10) AI Sessions
async function aiSessionsCylinder(request, env) {
  if (request.method === "POST") {
    const body = await request.json();
    const { session_id, user_role, hub, payload } = body;

    await runQuery(
      env,
      "INSERT INTO ai_sessions (session_id, user_role, hub, payload) VALUES (?, ?, ?, ?)",
      session_id,
      user_role,
      hub,
      JSON.stringify(payload || {})
    );

    await logEvent(env, "ai_session_logged", { session_id, user_role, hub });
    return json({ ok: true });
  }

  if (request.method === "GET") {
    const result = await env.DB.prepare(
      "SELECT * FROM ai_sessions ORDER BY created_at DESC LIMIT 200"
    ).all();
    return json({ ok: true, data: result.results || [] });
  }

  return json({ error: "Method not allowed" }, 405);
}

// 11) Tasks
async function tasksCylinder(request, env) {
  if (request.method === "POST") {
    const body = await request.json();
    const { title, status, assigned_to, hub } = body;

    await runQuery(
      env,
      "INSERT INTO tasks (title, status, assigned_to, hub) VALUES (?, ?, ?, ?)",
      title,
      status,
      assigned_to,
      hub
    );

    await logEvent(env, "task_created", { title, status, assigned_to, hub });
    return json({ ok: true });
  }

  if (request.method === "GET") {
    const result = await env.DB.prepare(
      "SELECT * FROM tasks ORDER BY created_at DESC LIMIT 500"
    ).all();
    return json({ ok: true, data: result.results || [] });
  }

  return json({ error: "Method not allowed" }, 405);
}

// 12) Heartbeat / continuity
async function heartbeatCylinder(env) {
  const ts = Date.now();
  await runQuery(
    env,
    "INSERT INTO continuity_heartbeat (timestamp_ms) VALUES (?)",
    ts
  );
  await logEvent(env, "heartbeat", { timestamp_ms: ts });
  return new Response("OK", { status: 200 });
}

/* ---------------------------
   Federal Spending / AssistanceListings
   AssistanceListings_USASpendingGov_PUBLIC_WEEKLY_20260103
---------------------------- */

async function federalSpendingCylinder(request, env) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") || "200");
  const agency = url.searchParams.get("agency");
  const cfda = url.searchParams.get("cfda"); // Assistance Listing / CFDA number

  // Adjust table/columns to match your actual schema
  let baseSql = "SELECT * FROM assistance_listings WHERE 1=1";
  const params = [];

  if (agency) {
    baseSql += " AND agency_name = ?";
    params.push(agency);
  }

  if (cfda) {
    baseSql += " AND cfda_number = ?";
    params.push(cfda);
  }

  baseSql += " ORDER BY fiscal_year DESC, obligation_amount DESC LIMIT ?";
  params.push(limit);

  const result = await env.DB.prepare(baseSql).bind(...params).all();

  await logEvent(env, "federal_spending_query", {
    agency: agency || null,
    cfda: cfda || null,
    limit
  });

  return json({
    ok: true,
    source: "AssistanceListings_USASpendingGov_PUBLIC_WEEKLY_20260103",
    data: result.results || []
  });
}

/* ---------------------------
   Logging helper
---------------------------- */

async function logEvent(env, event_type, payload) {
  try {
    await runQuery(
      env,
      "INSERT INTO logs (event_type, payload) VALUES (?, ?)",
      event_type,
      JSON.stringify(payload || {})
    );
  } catch (e) {
    console.error("logEvent failed:", e);
  }
}
