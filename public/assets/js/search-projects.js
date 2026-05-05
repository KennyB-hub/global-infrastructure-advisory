export async function searchProjects(lat, lon) {
  const res = await fetch("/api/search-projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lon })
  });

  return await res.json();
}
