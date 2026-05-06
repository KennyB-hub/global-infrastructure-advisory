export function OpportunityCard({ item }) {
  return (
    <div className="opportunity-card">
      <h3>{item.title}</h3>
      <p>{item.program}</p>
      <p>{item.region}</p>
      <p>{item.sector}</p>
      <p>Deadline: {item.deadline}</p>
    </div>
  );
}
