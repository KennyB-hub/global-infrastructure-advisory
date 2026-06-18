import { useOpportunities } from "../hooks/useOpportunities";
import { OpportunityCard } from "../components/OpportunityCard";

export default function OpportunitiesPage() {
  const { opportunities, loading } = useOpportunities();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Opportunities</h1>
      <div className="grid">
        {opportunities.map(o => (
          <OpportunityCard key={o.id} item={o} />
        ))}
      </div>
    </div>
  );
}
