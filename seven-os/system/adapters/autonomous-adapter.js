import "../../../ts-loader.js";

export async function loadAutonomousModule(path) {
  return await import(path);
}
