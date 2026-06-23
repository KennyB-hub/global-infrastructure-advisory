import { useEffect, useState } from "react";
import { fetchOpportunities } from "../api";

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpportunities().then(data => {
      setOpportunities(data);
      setLoading(false);
    });
  }, []);

  return { opportunities, loading };
}
