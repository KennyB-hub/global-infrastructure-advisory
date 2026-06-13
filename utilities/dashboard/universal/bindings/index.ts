// © 2026 Global Infrastructure Advisory
// Universal Data Binding Registry

import { CattleBindings } from "./cattle";
import { DroneBindings } from "./drone";
import { UtilityBindings } from "./utilities";
import { PipelineBindings } from "./pipeline";
import { GenericBindings } from "./generic";

export const AllBindings = [
  ...CattleBindings,
  ...DroneBindings,
  ...UtilityBindings,
  ...PipelineBindings,
  ...GenericBindings
];

// Lookup helper
export function resolveBinding(key, stack) {
  const binding = AllBindings.find(b => b.key === key);
  return binding ? binding.resolve(stack) : null;
}
