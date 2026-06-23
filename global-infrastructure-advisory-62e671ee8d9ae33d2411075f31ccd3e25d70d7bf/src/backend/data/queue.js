// Send to the 'Digital Laborer' to process while the user keeps working
await env.AI_QUEUE.send({
  type: "blueprint_analysis",
  data: contractorData,
  priority: "high"
});
