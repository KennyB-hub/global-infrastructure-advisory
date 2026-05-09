const aiee = new AIEEClient({ baseUrl: process.env.AIEE_URL! });

async function guardDatasetRead(params: {
  userId: string;
  roles: string[];
  trustZone: TrustZone;
  hub: string;
  datasetId: string;
  sourceSystem: string;
  intendedUse: DataContext['intendedUse'];
}) {
  const request: EnforcementRequest = {
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    actor: {
      userId: params.userId,
      roles: params.roles,
      trustZone: params.trustZone,
      hub: params.hub
    },
    action: {
      type: 'READ',
      name: 'AccessDataset',
      resourceType: 'DATASET',
      resourceId: params.datasetId
    },
    dataContext: {
      containsHumanSubjects: true,
      containsPii: true,
      containsClassified: false,
      sourceSystem: params.sourceSystem,
      intendedUse: params.intendedUse
    },
    aiContext: {
      modelType: 'RULE_ENGINE',
      explainabilityRequired: false,
      humanInLoopRequired: false
    },
    environment: {
      ip: '0.0.0.0', // fill from request
      location: 'unknown',
      clientType: 'API',
      version: 'v12-alpha'
    }
  };

  const response = await aiee.evaluate(request);

  if (response.decision === 'DENY') {
    throw new Error(`Access denied by AIEE: ${response.explanation}`);
  }

  if (response.decision === 'REQUIRE_HUMAN_REVIEW') {
    // route to Gov/Admin workflow, log, etc.
    throw new Error(`Action requires human review: ${response.explanation}`);
  }

  // ALLOW → proceed with dataset read
}
