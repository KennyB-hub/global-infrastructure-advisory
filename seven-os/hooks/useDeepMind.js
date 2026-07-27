import { useState } from "react";
import { deepMindQuery } from "../api/index.js";

export function useDeepMind() {
  const [result, setResult] = useState(null);

  async function ask(query) {
    const res = await deepMindQuery(query);
    setResult(res);
  }

  return { result, ask };
}

