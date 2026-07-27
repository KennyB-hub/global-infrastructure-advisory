import { useEffect, useState } from "react";
import { fetchActiveOpportunity } from "../api/index.js";

export function useActiveOpportunity() {
  const [active, setActive] = useState(null);

  useEffect(() => {
    fetchActiveOpportunity().then(setActive);
  }, []);

  return active;
}

