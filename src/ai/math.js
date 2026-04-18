// src/ai/engines/math.js
// Math Engine — basic calculation and numeric reasoning

export async function run(input) {
  const query = (input.query || "").toLowerCase();

  // Very simple pattern-based math to start
  // You can later replace this with a parser or AI-assisted math
  try {
    // Example: "calculate 5 + 7"
    const match = query.match(/calculate\s+([0-9\.\+\-\*\/\(\)\s]+)/);
    if (match && match[1]) {
      // ⚠️ This is intentionally minimal; replace eval in production with a safe parser
      const expression = match[1];
      // eslint-disable-next-line no-eval
      const value = eval(expression);
      return {
        type: "math_result",
        expression,
        value
      };
    }

    return {
      type: "math_result",
      message: "No explicit expression detected. Extend math engine for more patterns.",
      query
    };
  } catch (err) {
    return {
      type: "math_error",
      error: "Math evaluation failed.",
      details: err.message
    };
  }
}
