export function WorkforceTable({ workforce }) {
  return (
    <table className="workforce-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Sector</th>
          <th>Region</th>
        </tr>
      </thead>
      <tbody>
        {workforce.map(w => (
          <tr key={w.id}>
            <td>{w.name}</td>
            <td>{w.sector}</td>
            <td>{w.region}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
