import "../../ai/tools/security/ts-loader.js";

export async function loadAutonomousModule(path) {
  return await import(path);
}
