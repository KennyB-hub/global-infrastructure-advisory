// ux-core-types.ts
export type Persona = "farmer" | "public" | "contractor" | "gov";

export interface UXInput {
  persona: Persona;
  text: string;
  context?: Record<string, any>; // previous answers, session state
}

export interface UXQuestion {
  type: "question";
  field: string;
  prompt: string;
}

export interface UXReadyPayload {
  type: "ready";
  workflow: string;
  trustZone: string;
  payload: Record<string, any>;
  summary: string;
}

export type UXResult = UXQuestion | UXReadyPayload;
