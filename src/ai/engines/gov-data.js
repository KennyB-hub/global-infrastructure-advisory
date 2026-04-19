// Government Data Engine
// Scaffold for working with federal / state / municipal datasets.

export async function run(input) {
  const query = (input.query || "").toLowerCase();
  const intent = detectDataIntent(query);

  const dataset = input.dataset || null;

  return {
    type: "gov_data_result",
    intent,
    datasetSummary: summarize(dataset),
    message: "Government data engine scaffold. Attach real datasets and logic here."
  };
}

function detectDataIntent(text) {
  if (text.includes("census")) return "census_data";
  if (text.includes("traffic")) return "traffic_data";
  if (text.includes("crash") || text.includes("accident")) return "safety_data";
  if (text.includes("fema") || text.includes("disaster")) return "disaster_data";
  return "general_gov_data";
}

function summarize(dataset) {
  if (!dataset) return { kind: "none", message: "No dataset attached." };

  if (Array.isArray(dataset)) {
    return {
      kind: "array",
      count: dataset.length,
      sample: dataset.slice(0, 5)
    };
  }

  if (typeof dataset === "object") {
    return {
      kind: "object",
      keys: Object.keys(dataset),
      sample: Object.fromEntries(Object.entries(dataset).slice(0, 5))
    };
  }

  return {
    kind: typeof dataset,
    value: dataset
  };
}
