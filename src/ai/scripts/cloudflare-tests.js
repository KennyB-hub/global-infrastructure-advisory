/**
 * Cloudflare API Test Suite
 * -------------------------
 * Safe, read-only diagnostic checks for your Deep Mind AI.
 * This script NEVER writes or modifies Cloudflare resources.
 */

import fetch from "node-fetch";

const CF_API_TOKEN = process.env.CF_API_TOKEN;
const ACCOUNT_ID = process.env.CF_ACCOUNT_ID; // optional but recommended

if (!CF_API_TOKEN) {
    console.error("[CF TEST] Missing CF_API_TOKEN in environment");
    process.exit(1);
}

const CF_HEADERS = {
    "Authorization": `Bearer ${CF_API_TOKEN}`,
    "Content-Type": "application/json"
};

// --- Utility: Cloudflare GET wrapper ---
async function cfGet(url) {
    try {
        const res = await fetch(url, { headers: CF_HEADERS });
        const data = await res.json();

        if (!res.ok) {
            console.error(`[CF TEST] Error: ${data.errors?.[0]?.message}`);
            return null;
        }

        return data.result;
    } catch (err) {
        console.error("[CF TEST] Network error:", err);
        return null;
    }
}

// --- 1. List Zones ---
async function testZones() {
    console.log("\n[CF TEST] Fetching zones...");
    const zones = await cfGet("https://api.cloudflare.com/client/v4/zones");

    if (!zones) return;

    zones.forEach(z => {
        console.log(` - Zone: ${z.name} (ID: ${z.id})`);
    });

    return zones;
}

// --- 2. DNS Records for each zone ---
async function testDNS(zoneId) {
    console.log(`\n[CF TEST] DNS Records for Zone: ${zoneId}`);
    const dns = await cfGet(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`);

    if (!dns) return;

    dns.forEach(r => {
        console.log(` - ${r.type} ${r.name} → ${r.content}`);
    });
}

// --- 3. Workers Routes ---
async function testWorkersRoutes(zoneId) {
    console.log(`\n[CF TEST] Workers Routes for Zone: ${zoneId}`);
    const routes = await cfGet(`https://api.cloudflare.com/client/v4/zones/${zoneId}/workers/routes`);

    if (!routes) return;

    routes.forEach(r => {
        console.log(` - Pattern: ${r.pattern} | Script: ${r.script}`);
    });
}

// --- 4. Pages Projects ---
async function testPages() {
    if (!ACCOUNT_ID) {
        console.log("[CF TEST] Skipping Pages (missing CF_ACCOUNT_ID)");
        return;
    }

    console.log("\n[CF TEST] Pages Projects...");
    const pages = await cfGet(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects`);

    if (!pages) return;

    pages.forEach(p => {
        console.log(` - Project: ${p.name} | Source: ${p.source?.config?.repo_name}`);
    });
}

// --- 5. Security Posture ---
async function testSecurity(zoneId) {
    console.log(`\n[CF TEST] Security Settings for Zone: ${zoneId}`);
    const settings = await cfGet(`https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/security_level`);

    if (!settings) return;

    console.log(` - Security Level: ${settings.value}`);
}

// --- Main Runner ---
async function run() {
    console.log("\n==============================");
    console.log(" Cloudflare Diagnostic Tests ");
    console.log("==============================\n");

    const zones = await testZones();
    if (!zones) return;

    for (const zone of zones) {
        await testDNS(zone.id);
        await testWorkersRoutes(zone.id);
        await testSecurity(zone.id);
    }

    await testPages();

    console.log("\n[CF TEST] All tests complete.\n");
}

run();
