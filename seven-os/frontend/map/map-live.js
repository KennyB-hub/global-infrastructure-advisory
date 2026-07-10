// map-live.js
// Frontend Live Data Ingestion Engine (UI only)

export const LiveMap = {
  interval: null,
  listeners: [],

  startPolling(ms = 5000) {
    if (this.interval) clearInterval(this.interval);

    this.interval = setInterval(async () => {
      const [sectors, risk, routes] = await Promise.all([
        fetch("/api/map/sectors").then(r => r.json()).catch(() => null),
        fetch("/api/map/risk").then(r => r.json()).catch(() => null),
        fetch("/api/map/routes").then(r => r.json()).catch(() => null)
      ]);

      this.emit({ sectors, risk, routes });
    }, ms);
  },

  stopPolling() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  },

  onUpdate(callback) {
    this.listeners.push(callback);
  },

  emit(data) {
    for (const cb of this.listeners) cb(data);
  }
};
