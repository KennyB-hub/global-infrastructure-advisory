export class IntegrityMonitor {
  private knownHashes = new Map<string, string>();

  verify(event: CyberEvent): boolean {
    const currentHash = event.metadata?.hash;
    const known = this.knownHashes.get(event.source);

    if (!known) {
      this.knownHashes.set(event.source, currentHash);
      return true;
    }

    return known === currentHash;
  }
}
