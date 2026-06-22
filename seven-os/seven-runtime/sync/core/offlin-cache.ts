// © 2026 Global Infrastructure Advisory
// Seven Runtime — Offline Cache Engine

export class OfflineCache {
    private cache: Map<string, any> = new Map();
    private maxItems = 50000;

    constructor() {}

    set(key: string, value: any) {
        if (this.cache.size >= this.maxItems) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    get(key: string) {
        const entry = this.cache.get(key);
        return entry ? entry.value : null;
    }

    has(key: string) {
        return this.cache.has(key);
    }

    remove(key: string) {
        this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    keys() {
        return [...this.cache.keys()];
    }
}
