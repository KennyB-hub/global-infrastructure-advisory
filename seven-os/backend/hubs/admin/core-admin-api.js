// /backend/admin/admin-api.js
export class AdminAPI {
  constructor() {
    this.token = localStorage.getItem("admin_token") || null;
  }

  headers() {
    return {
      "Content-Type": "application/json",
      ...(this.token ? { "Authorization": `Bearer ${this.token}` } : {})
    };
  }

  async health() {
    const res = await fetch("/heartbeat", { headers: this.headers() });
    return await res.text();
  }

  async testCortex() {
    const res = await fetch("/ai/process", {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        workflow: "analyze",
        data: { test: true }
      })
    });
    return await res.json();
  }

  async login(email, password) {
    const res = await fetch("/admin/login", {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem("admin_token", data.token);
      this.token = data.token;
    }

    return data;
  }
}
