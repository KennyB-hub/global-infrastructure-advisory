import { useEffect, useState } from "react";
import { fetchWorkforce } from "../api/index.js";

export function useWorkforce() {
  const [workforce, setWorkforce] = useState([]);

  useEffect(() => {
    fetchWorkforce().then(setWorkforce);
  }, []);

  return workforce;
}

