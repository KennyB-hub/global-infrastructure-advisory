async function sevenHandleEvent(event: InfraEvent) {
  const context = await loadRecentContext(event); // last events in same zone/sector

  const analysis = await llmAnalyze(event, context); // Seven's "brain"

  const response: SevenResponse = {
    severity: analysis.severity,          // info | warning | critical
    summary: analysis.summary,            // 1–2 line explanation
    details: analysis.details,            // bullet points
    recommendedActions: analysis.actions, // what humans should do
    audience: analysis.audience,          // ["contractor", "farmer", ...]
  };

  const outputs = composeOutputs(response);

  await publishOutputs(outputs);
}
