// © 2026 Global Infrastructure Advisory
// Universal Mission Action Registry

import { CattleActions } from "./cattle";
import { DroneActions } from "./drone";
import { RescueActions } from "./rescue";
import { UtilityActions } from "./utilities";
import { PipelineActions } from "./pipeline";
import { GenericActions } from "./generic";

export const AllActions = [
  ...CattleActions,
  ...DroneActions,
  ...RescueActions,
  ...UtilityActions,
  ...PipelineActions,
  ...GenericActions
];

export function resolveAction(id: string) {
  return AllActions.find(a => a.id === id) || null;
}
