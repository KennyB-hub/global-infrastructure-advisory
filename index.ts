export default {
  // --- PART 1: THE FRONT DOOR (Handles Users & AI Requests) ---
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. ROUTE: AI Blueprint Assistant
    if (url.pathname === "/api/ai-chat") {
      const { prompt } = await request.json();
      const answer = await env.intelligence.run("@cf/meta/llama-3-8b-instruct", {
        prompt: `You are the GIA Intelligence System. Help this contractor: ${prompt}`
      });
      return new Response(JSON.stringify(answer), { headers: { "Content-Type": "application/json" } });
    }

    // 2. ROUTE: GPS Manual Check (Staff/Contractor Tracking)
    if (url.pathname === "/api/heartbeat") {
      return new Response(JSON.stringify({ status: "Pulse Verified", timestamp: new Date() }));
    }

    // 3. DEFAULT: Serve your Clean HTML Hubs (Home, Contractor, Space, etc.)
    return await env.ASSETS.fetch(request);
  },

  // --- PART 2: THE HEARTBEAT (Runs Automatically Every Minute) ---
  async scheduled(event, env, ctx) {
    console.log("GIA Heartbeat: Verifying System Integrity...");
    
    // Check the connection to your Azure Vault Secrets
    try {
      const pulse = await fetch("https://azurewebsites.net", {
          headers: { "x-functions-key": env.AZURE_API_KEY }
      });
      console.log("Azure Pulse Status:", pulse.ok ? "Strong" : "Weak");
    } catch (err) {
      console.log("Azure Pulse Failed: Check connection settings.");
    }
  }
};

};

    console.log("Pulse Status:", pulse.ok ? "Strong" : "Weak");
  }
};
