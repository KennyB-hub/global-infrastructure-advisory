import { CyberEngine } from './index';
import { CyberEvent } from './event-model';

const cyber = new CyberEngine();

export async function cyberHook(event: CyberEvent) {
  const result = cyber.handle(event);

  if (result.action === 'block') {
    throw new Error(`Blocked by CyberEngine: ${result.reason}`);
  }

  if (result.action === 'isolate') {
    throw new Error(`Worker isolated due to: ${result.reason}`);
  }

  return result;
}
