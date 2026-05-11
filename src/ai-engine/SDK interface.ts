export interface AIEEClientOptions {
  baseUrl: string; // e.g. 'https://aiee.internal/api/enforcement'
  apiKey?: string;
}

export class AIEEClient {
  constructor(private readonly options: AIEEClientOptions) {}

  async evaluate(request: EnforcementRequest): Promise<EnforcementResponse> {
    const res = await fetch(`${this.options.baseUrl}/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.options.apiKey ? { Authorization: `Bearer ${this.options.apiKey}` } : {})
      },
      body: JSON.stringify(request)
    });

    if (!res.ok) {
      throw new Error(`AIEE evaluate failed: ${res.status} ${res.statusText}`);
    }

    return (await res.json()) as EnforcementResponse;
  }
}
