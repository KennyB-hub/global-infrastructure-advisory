// seven-os/core/resolution/IResolver.ts
export interface IResolver {
  resolve(request: string): string | null;
}
