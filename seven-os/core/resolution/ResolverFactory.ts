// seven-os/core/resolution/ResolverFactory.ts
export function createResolver(env: "node" | "dotnet"): IResolver {
  if (env === "node") return new NodeResolver();
  throw new Error("DotNet resolver not implemented yet");
}
