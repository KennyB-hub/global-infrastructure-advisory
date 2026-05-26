import { RemediationAction } from '../../remediation/RemediationEngine';

export interface AIWorkforceSyncLayer {
  dispatch(actions: RemediationAction[]): Promise<void>;
}

export class LoggingWorkforceSync implements AIWorkforceSyncLayer {
  async dispatch(actions: RemediationAction[]) {
    // later: send to drones, agents, services, etc.
    console.log('[AI Workforce] Dispatching actions:', actions);
  }
}
