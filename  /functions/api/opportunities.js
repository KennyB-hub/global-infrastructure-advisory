// /functions/api/opportunities.js
export async function onRequestGet(context) {
    // This is where your REAL data lives
    const opportunities = [
        { 
            id: 1, 
            title: "Grid Modernization Project", 
            program: "Energy Transition", 
            region: "Sub-Saharan Africa", 
            sector: "Energy",
            type: "Infrastructure",
            deadline: "2024-12-31",
            description: "Implementing smart grid tech for regional stability."
        },
        { 
            id: 2, 
            title: "Urban Water Expansion", 
            program: "WASH Initiative", 
            region: "Southeast Asia", 
            sector: "Water",
            type: "Construction",
            deadline: "2024-10-15",
            description: "Upgrading treatment plants and distribution networks."
        }
    ];

    return new Response(JSON.stringify(opportunities), {
        headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" 
        }
    });
}
// /functions/api/match.js
export async function onRequestPost(context) {
  try {
    // 1. Get the data sent from your dashboard
    const { candidate, opportunity } = await context.request.json();

    // 2. Your SECTOR_ADJACENCY logic (Imported or pasted here)
    const SECTOR_ADJACENCY = { 
        infrastructure: ["construction", "transportation", "energy", "water"],
        construction: ["infrastructure", "energy"]
    };

    // 3. Run your scoring engine
    const c = candidate.sector.toLowerCase();
    const o = opportunity.sector.toLowerCase();
    
    let score = 40;
    let reason = "Low Alignment";

    if (c === o) {
        score = 100;
        reason = "Primary Match";
    } else if (SECTOR_ADJACENCY[o]?.includes(c)) {
        score = 80;
        reason = "Adjacent";
    }

    // 4. Return the result as JSON
    return new Response(JSON.stringify({ score, reason }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
