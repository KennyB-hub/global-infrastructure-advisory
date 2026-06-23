await fetch(`/api/pastures/${pastureId}/boundary`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ pastureId, polygon, name }),
});
