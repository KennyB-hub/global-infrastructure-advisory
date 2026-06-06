import { useState } from "react";
import { deepMindQuery } from "../api";

export function useDeepMind() {
  const [result, setResult] = useState(null);

  async function ask(query) {
    const res = await deepMindQuery(query);
    setResult(res);
  }

  return { result, ask };
}
