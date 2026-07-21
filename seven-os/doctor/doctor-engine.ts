// doctor-engine.ts
import { loadIntegrationMap } from './integration-map-loader';
import { validateBindings } from './binding-validator';
import { buildSectorGraph } from './sector-map';
import { buildGridGraph } from './grid-map';
import { Governor } from '../system/governor-interface';

export type DoctorRouteRequest = {
  source: 'cli' | 'api' | 'voice' | 'system';
  intent: string;
  sector?: string;
  context?: Record<string, unknown>;
};

export type DoctorRoutePlan = {
  sector: string;
  grid: string;
  worker: string;
  runtime: string;
  checks: string[];
};

export class DoctorEngine {
  private integrationMap: any;
  private sectorGraph: any;
  private gridGraph: any;
  private governor: Governor;

  async init() {
    this.integrationMap = await loadIntegrationMap();
    this.sectorGraph = buildSectorGraph(this.integrationMap);
    this.gridGraph = buildGridGraph(this.integrationMap);
    await validateBindings(this.integrationMap);
    this.governor = new Governor();
  }

  // ============================================================
  //  ROUTING ENGINE
  // ============================================================
  route(request: DoctorRouteRequest): DoctorRoutePlan {
    const sector = this.resolveSector(request);
    const grid = this.resolveGrid(request, sector);

    this.governor.assertAllowed({
      source: request.source,
      intent: request.intent,
      sector,
      grid,
    });

    const { worker, runtime } = this.resolveExecutionTargets(
      sector,
      grid,
      request.intent
    );

    return {
      sector,
      grid,
      worker,
      runtime,
      checks: ['bindings', 'integrity', 'sector', 'trust'],
    };
  }

  private resolveSector(req: DoctorRouteRequest): string {
    return req.sector || 'air-ops';
  }

  private resolveGrid(req: DoctorRouteRequest, sector: string): string {
    return 'grid-001';
  }

  private resolveExecutionTargets(sector: string, grid: string, intent: string) {
    return {
      worker: 'autonomous-worker',
      runtime: 'seven-runtime.drone',
    };
  }

  // ============================================================
  //  FULL SYSTEM CHECK (SOVEREIGN OS AUDIT)
  // ============================================================
  fullSystemCheck() {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Integration map presence
    if (!this.integrationMap || !this.integrationMap.components) {
      errors.push('Integration map missing or invalid.');
    }

    // 2. Sector bindings
    const sectorBindings = this.governor.getSectorBindings();
    if (!sectorBindings) {
      errors.push('Sector engine binding file missing.');
    }

    // 3. Integrity rules
    const integrity = this.governor.getIntegrityRules();
    if (!integrity) {
      errors.push('Integrity rules missing.');
    }

    // 4. Validate each component
    for (const comp of this.integrationMap.components || []) {
      const { component, component_type } = comp;

      if (!sectorBindings[component]) {
        warnings.push(`No sector binding for component: ${component}`);
      }

      if (integrity.forbidden?.includes(component)) {
        errors.push(`Component violates integrity rules: ${component}`);
      }

      if (component_type === 'worker') {
        if (!this.integrationMap.workers?.includes(component)) {
          errors.push(`Worker not registered: ${component}`);
        }
      }

      if (component_type === 'runtime') {
        if (!this.integrationMap.runtime?.includes(component)) {
          errors.push(`Runtime not registered: ${component}`);
        }
      }
    }

    // 5. Sector graph consistency
    if (!this.sectorGraph || Object.keys(this.sectorGraph).length === 0) {
      errors.push('Sector graph is empty or invalid.');
    }

    // 6. Grid graph consistency
    if (!this.gridGraph || Object.keys(this.gridGraph).length === 0) {
      errors.push('Grid graph is empty or invalid.');
    }

    // 7. Trust matrix
    const trustIssues = this.governor.checkTrustMatrix();
    errors.push(...trustIssues);

    // 8. Runtime presence
    const runtimeMissing = this.checkRuntimePresence();
    errors.push(...runtimeMissing);

    // 9. Backend routes
    const backendIssues = this.checkBackendRoutes();
    errors.push(...backendIssues);

    // 10. Voice routes
    const voiceIssues = this.checkVoiceRoutes();
    errors.push(...voiceIssues);

    return {
      sectors: Object.keys(this.sectorGraph || {}).length,
      grids: Object.keys(this.gridGraph || {}).length,
      workers: this.integrationMap.workers?.length || 0,
      runtime: this.integrationMap.runtime?.length || 0,
      backend: this.integrationMap.backend?.length || 0,
      voice: this.integrationMap.voice?.length || 0,
      warnings,
      errors,
    };
  }

  // ============================================================
  //  SUPPORT CHECKS
  // ============================================================
  private checkRuntimePresence() {
    const errors: string[] = [];
    const runtime = this.integrationMap.runtime || [];

    for (const r of runtime) {
      if (!this.integrationMap.components.find((c) => c.component === r)) {
        errors.push(`Runtime declared but not implemented: ${r}`);
      }
    }

    return errors;
  }

  private checkBackendRoutes() {
    const errors: string[] = [];
    const backend = this.integrationMap.backend || [];

    for (const route of backend) {
      if (!route.path || !route.calls) {
        errors.push(`Backend route missing path or calls: ${route.component}`);
      }
    }

    return errors;
  }

  private checkVoiceRoutes() {
    const errors: string[] = [];
    const voice = this.integrationMap.voice || [];

    for (const v of voice) {
      if (!v.calls || v.calls.length === 0) {
        errors.push(`Voice handler missing call-sites: ${v.component}`);
      }
    }

    return errors;
  }
}
