import * as aiRouter from "./ai-router.js";
import sevenStackRouter from "./seven-stack-router";

export async function route(input: any, env: any) {
  if (aiRouter.canHandle(input)) {
    return await aiRouter.route(input, env);
  }

  if (sevenStackRouter.canHandle(input)) {
    return await sevenStackRouter.route(input, env);
  }

  return {
    ok: false,
    reason: "No router matched input",
    input
  };
}
