const API_URL = "/api/opportunities";

async function fetchOpportunities() {
  const res = await fetch(API_URL, {
    headers: {
      "X-Client": "GIA-Frontend.V12A"
    }
  });

  const data = await res.json();

  // V12 Alpha response contract
  if (!data.ok) {
    console.error("Sovereign API Error:", data.error);
    return [];
  }

  return data.payload.opportunities || [];
}
