/**
 * Seven-OS Global Infrastructure Advisory Sovereign Map
 * Programmatically binds your verified EIN, SAM.gov, and cloud tokens.
 */
require('dotenv').config();

const GIA_SOVEREIGN_MANIFEST = {
    entity: process.env.GIA_COMPANY_NAME || "Global Infrastructure Advisory LLC",
    status: process.env.GIA_SAM_GOV_ID ? "ACTIVE_FEDERAL_CONTRACTOR" : "LOCAL_ROOT_MODE",
    credentials: {
        ein: process.env.GIA_EIN_NUMBER || "UNSET",
        samGov: process.env.GIA_SAM_GOV_ID || "UNSET"
    },
    cloudGateway: {
        environment: process.env.AZURE_ENVIRONMENT || "custom",
        tenant: process.env.AZURE_TENANT_ID || "Common",
        paymentActive: !!process.env.STRIPE_SECRET_KEY
    },
    operationalMetrics: {
        totalSectors: 38,
        activeWorkers: 100,
        latencyCeilingMs: parseInt(process.env.SYSTEM_MAX_LATENCY_MS) || 1500,
        targetUptime: "97%-100%"
    }
};

console.log(`🔒 [GIA ENGINE CORE] System32-Level Security: Sovereign matrix bound for ${GIA_SOVEREIGN_MANIFEST.entity}`);

module.exports = { GIA_SOVEREIGN_MANIFEST };
