import { useEffect, useState } from "react";
import { fetchWorkforce } from "../api";

export function useWorkforce() {
  const [workforce, setWorkforce] = useState([]);

  useEffect(() => {
    fetchWorkforce().then(setWorkforce);
  }, []);

  return workforce;
}
