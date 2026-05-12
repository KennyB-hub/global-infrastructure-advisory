/**
 * GIA AGRI-VISUAL ENGINE
 * Manages 2D/3D Mapping, Blueprints, and Documents
 */
import { init3DMapping } from './engine-3d.js';
import { init2DMapping } from './engine-2d.js';
import { processBlueprints } from './engine-blueprint.js';
import { renderDocuments } from './engine-docs.js';

export const AgriVisualEngine = {
    async initialize(containerId, sectorData, env) {
        console.log("[VISUAL] Initializing Agricultural Visual Stack...");

        // 1. Dual-Mapping Handshake
        const map3D = await init3DMapping(containerId, sectorData.geo, env);
        const map2D = await init2DMapping('overlay-ui', sectorData.satellite, env);

        // 2. Technical Layer Integration
        const blueprints = await processBlueprints(sectorData.blueprints);
        const docs = await renderDocuments(sectorData.docs);

        return { 
            active: true, 
            layers: { map3D, map2D, blueprints, docs },
            status: "VISUAL_READY" 
        };
    }
};
