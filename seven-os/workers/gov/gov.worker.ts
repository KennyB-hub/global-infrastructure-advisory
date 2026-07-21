import { buildEvent } from '../../system/cyber/event-builder';
import { cyberHook } from '../../system/cyber/worker-hook';

export default {
  async fetch(request: Request) {
    const event = buildEvent({
      source: 'gov-worker',
      sector: 'gov',
      trustZone: 'user', // or system/admin based on auth
      type: 'access_attempt',
      metadata: {
        route: new URL(request.url).pathname,
        method: request.method,
        ip: request.headers.get('cf-connecting-ip')
      }
    });

    const result = await cyberHook(event);

    // If not blocked, continue normal worker logic
    return new Response(`Gov worker OK: ${JSON.stringify(result)}`);
  }
};
