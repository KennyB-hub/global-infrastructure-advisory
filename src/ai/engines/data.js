// src/ai/engines/data.js
// Data Engine — basic dataset / table reasoning scaffold

export async function run(input) {
  const query = (input.query || "").toLowerCase();
  const dataset = input.dataset || null;

  if (!dataset) {
    return {
      type: "data_result",
      message: "No dataset provided. Attach 'dataset' to input for analysis.",
      query
    };
  }

  // Simple summary scaffold
  const summary = summarizeDataset(dataset);

  return {
    type: "data_result",
    message: "Data engine processed dataset.",
    query,
    summary
  };
}

function summarizeDataset(dataset) {
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
