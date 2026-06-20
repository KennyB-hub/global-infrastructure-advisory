import { CyberEvent } from './event-model';
import { ThreatSurface } from './threat-surface';
import { IntegrityMonitor } from './integrity-monitor';
import { AnomalyDetector } from './anomaly-detector';
import { IncidentRouter } from './incident-router';

export class CyberEngine {
  private surface = new ThreatSurface();
  private integrity = new IntegrityMonitor();
  private anomaly = new AnomalyDetector();
  private router = new IncidentRouter();

  handle(event: CyberEvent) {
    this.surface.update(event);

    const ok = this.integrity.verify(event);
    if (!ok) {
      return this.router.route(event, 'integrity_drift');
    }

    const anomaly = this.anomaly.detect(event);
    return this.router.route(event, anomaly);
  }
}
