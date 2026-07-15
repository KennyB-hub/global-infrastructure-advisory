// trustzone-firewall.js
// V12 Alpha – TrustZone Memory Firewall

const { retrieveDocuments } = require("./document-retrieval");
const { generatePdfDocument } = require("./document-generator");

// Hard V12 Alpha trustZone hierarchy
const TRUSTZONE_RANK = {
  public: 1,
  farmer: 1,
  contractor: 2,
  employee: 2,
  admin: 3,
  gov: 3,
  deepgov: 4,
  system: 5
};

/**
 * Ensure caller trustZone is allowed to access target trustZone memory.
 * Higher rank can see lower or equal; lower cannot see higher.
 */
function assertTrustZoneAccess(callerTrustZone, targetTrustZone) {
  const callerRank = TRUSTZONE_RANK[callerTrustZone] || 0;
  const targetRank = TRUSTZONE_RANK[targetTrustZone] || 0;

  if (callerRank === 0) {
    throw new Error(`Unknown caller trustZone '${callerTrustZone}'.`);
  }
  if (targetRank === 0) {
    throw new Error(`Unknown target trustZone '${targetTrustZone}'.`);
  }
  if (callerRank < targetRank) {
    throw new Error(
      `Access denied: '${callerTrustZone}' cannot access '${targetTrustZone}' memory.`
    );
  }
}

/**
 * Firewall‑wrapped document retrieval.
 * Ensures the memory index used matches caller trustZone permissions.
 */
async function firewallRetrieveDocuments(query, callerTrustZone) {
  const routing = await retrieveDocuments(query, { trustZone: callerTrustZone });

  // routing.trustZone is the index trustZone selected by semantic router
  assertTrustZoneAccess(callerTrustZone, routing.trustZone);

  return routing;
}

/**
 * Firewall‑wrapped PDF generation from template.
 * Ensures caller is allowed to generate docs for the given trustZone.
 */
async function firewallGeneratePdf(templateName, callerTrustZone, data = {}) {
  const targetTrustZone = data.trustZone || callerTrustZone;
  assertTrustZoneAccess(callerTrustZone, targetTrustZone);

  return await generatePdfDocument(templateName, {
    ...data,
    trustZone: targetTrustZone
  });
}

/**
 * High‑level helper:
 * Caller asks for a doc in natural language.
 * Firewall enforces trustZone, then generates PDF.
 */
async function firewallGenerateDocumentFromQuery(query, callerTrustZone, userData = {}) {
  const routing = await firewallRetrieveDocuments(query, callerTrustZone);

  const templateName = routing.docType || "generic-document";

  return await firewallGeneratePdf(templateName, callerTrustZone, {
    ...userData,
    trustZone: routing.trustZone,
    sector: routing.sector,
    risk: routing.risk
  });
}

module.exports = {
  firewallRetrieveDocuments,
  firewallGeneratePdf,
  firewallGenerateDocumentFromQuery,
  assertTrustZoneAccess
};
