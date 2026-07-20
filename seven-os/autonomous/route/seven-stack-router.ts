import { SevenStack } from "../../seven-runtime/seven-stack";

const stack = new SevenStack(null, { say: console.log });

export function canHandle(input: any): boolean {
  return Boolean(input?.system || input?.stack);
}

export async function route(input: any) {
  switch (input.system) {
    case "status":
      return await stack.reportStatus();

    case "nap":
      return await stack.handleNAP(input.payload);

    case "vehicle-register":
      return stack.registerVehicle(input.plugin);

    default:
      return {
        ok: false,
        reason: "Unknown SevenStack route",
        input
      };
  }
}
