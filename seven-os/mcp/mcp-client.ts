// seven-os/mcp/mcp-client.ts
// Minimal MCP client wrapper – all expansion flows go through here.

export class MCP {
  private env: any;

  constructor(env: any) {
    this.env = env;
  }

  async call(channel: string, payload: any): Promise<any> {
    // You can later swap this to real MCP transport (NATS, HTTP, QUIC, etc.)
    const binding = this.env.MCP_BINDING;

    if (!binding || typeof binding.fetch !== "function") {
      // Soft failure – caller decides what to do
      return { ok: false, error: "MCP binding not available", channel };
    }

    const res = await binding.fetch("https://mcp/" + encodeURIComponent(channel), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MCP-Channel": channel
      },
      body: JSON.stringify(payload)
    });

    try {
      return await res.json();
    } catch {
      return { ok: false, error: "Invalid MCP response", status: res.status };
    }
  }
}
