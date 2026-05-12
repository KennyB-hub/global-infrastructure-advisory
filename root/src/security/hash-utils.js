// /src/security/hash-utils.js
export class HashUtils {
  async hash(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)));
  }

  async compare(password, hashed) {
    const hash = await this.hash(password);
    return hash === hashed;
  }
}
