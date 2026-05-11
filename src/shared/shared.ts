export type TrustZone =
  | 'public'
  | 'farmer'
  | 'contractor'
  | 'employee'
  | 'admin'
  | 'gov'
  | 'deepgov'
  | 'system';

export type EnforcementDecision = 'ALLOW' | 'DENY' | 'REQUIRE_HUMAN_REVIEW';

export interface ActorContext {
  userId: string;
  roles: string[];
  trustZone: TrustZone;
  hub: string; // 'AdminHub' | 'GovHub' | 'SystemHub' | ...
}

export interface ActionContext {
  type: 'READ' | 'WRITE' | 'EXECUTE' | 'DEPLOY' | 'MATCH' | 'SURVEY';
  name: string;
  resourceType: 'DATASET' | 'MODEL' | 'WORKFLOW' | 'DOCUMENT' | 'ENDPOINT';
  resourceId: string;
}

export interface DataContext {
  containsHumanSubjects: boolean;
  containsPii: boolean;
  containsClassified: boolean;
  sourceSystem: string;
  intendedUse: 'STATISTICAL' | 'OPERATIONAL' | 'RESEARCH' | 'EVALUATION';
}

export interface AiContext {
  modelId?: string;
  modelType: 'LLM' | 'ML' | 'RULE_ENGINE';
  explainabilityRequired: boolean;
  humanInLoopRequired: boolean;
}

export interface EnvironmentContext {
  ip: string;
  location: string;
  clientType: 'WEB' | 'API' | 'BATCH';
  version: string;
}

export interface EnforcementRequest {
  requestId: string;
  timestamp: string;
  actor: ActorContext;
  action: ActionContext;
  dataContext: DataContext;
  aiContext: AiContext;
  environment: EnvironmentContext;
}

export interface PolicyHit {
  policyId: string;
  policyName: string;
  ruleId: string;
  effect: 'ALLOW' | 'DENY' | 'CONDITION';
  reason: string;
}

export interface EnforcementCondition {
  type: 'HUMAN_REVIEW' | string;
  details: string;
}

export interface EnforcementResponse {
  requestId: string;
  decision: EnforcementDecision;
  policyHits: PolicyHit[];
  conditions: EnforcementCondition[];
  explanation: string;
  timestamp: string;
}
