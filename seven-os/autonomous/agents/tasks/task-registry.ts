import { fixBackendStructure } from "./fix-backend";
import { repairSchemas } from "./repair-schemas";

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
