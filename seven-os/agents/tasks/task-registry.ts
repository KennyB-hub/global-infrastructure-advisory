import { fixBackendStructure } from "../tasks/fix-backend";
import { repairSchemas } from "../tasks/repair-schemas";

export function getTaskHandler(type: string) {
  switch (type) {
    case "fix-backend-structure":
      return fixBackendStructure;
    case "repair-schemas":
      return repairSchemas;
    default:
      return null;
  }
}
