// backend/ai-engine/ai-matching.js

export async function matchIntent(input) {
  const text = (input?.text || "").toLowerCase()

  if (text.includes("distance") || text.includes("location")) return "geo"
  if (text.includes("convert") || text.includes("format")) return "utility"
  if (text.includes("should") || text.includes("decide")) return "decision"
  if (text.includes("deep") || text.includes("resonance") || text.includes("gia"))
   
    return "sandbox"
    
}

