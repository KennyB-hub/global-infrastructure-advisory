// seven-os/schema/sector-schema.js

/**
 * SEVEN‑OS Sector Schema
 * Defines the structural shape of a sector inside the routing engine.
 * Used by: audit-engine, decision-engine, autonomous-engine, gov/public/farmer/contractor engines.
 */

module.exports = {
  /**
   * Create a new sector definition
   */
  createSector(sectorId, config = {}) {
    return {
      id: sectorId,

      // Classification (public, gov, deepgov, contractor, farmer, alfa, etc.)
      class: config.class || "public",

      // Security level (0 = open, 5 = sovereign)
      security: config.security || 1,

      // AI engines bound to this sector
      engines: {
        decision: config.engines?.decision || null,
        audit: config.engines?.audit || null,
        logic: config.engines?.logic || null,
        math: config.engines?.math || null,
        data: config.engines?.data || null,
        sectorEngine: config.engines?.sectorEngine || null
      },

      // Routing capabilities
      routes: {
        public: config.routes?.public || [],
        internal: config.routes?.internal || [],
        restricted: config.routes?.restricted || [],
        autonomous: config.routes?.autonomous || []
      },

      // Worker bindings (cyber, govView, marketplace, etc.)
      workers: config.workers || [],

      // Data sources (R2 buckets, JSON models, external feeds)
      dataSources: config.dataSources || [],

      // Audit hooks
      audit: {
        enabled: config.audit?.enabled ?? true,
        validators: config.audit?.validators || [],
        schema: config.audit?.schema || null
      },

      // Health + manifest integration
      manifest: {
        version: config.manifest?.version || "1.0",
        lastUpdated: new Date().toISOString(),
        clusterHealth: config.manifest?.clusterHealth || "unknown"
      }
    };
  }
};
