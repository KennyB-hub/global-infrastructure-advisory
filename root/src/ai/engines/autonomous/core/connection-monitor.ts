// © 2026 Global Infrastructure Advisory
// Seven Runtime — Connection Monitor (Hybrid Mode Compatible)

export type ConnectionState = "CONNECTED" | "DEGRADED" | "OFFLINE";

export interface ConnectionStatus {
    state: ConnectionState;
    transport: "starlink" | "lte" | "wifi" | "none";
    lastChange: number;
    signalStrength?: number;
}

export class ConnectionMonitor {
    private status: ConnectionStatus = {
        state: "OFFLINE",
        transport: "none",
        lastChange: Date.now()
    };

    private listeners: Array<(status: ConnectionStatus) => void> = [];

    constructor() {
        // Start periodic checks
        setInterval(() => this.checkConnections(), 3000);
    }

    onChange(listener: (status: ConnectionStatus) => void) {
        this.listeners.push(listener);
    }

    private emit(status: ConnectionStatus) {
        this.listeners.forEach(l => l(status));
    }

    private updateStatus(newStatus: ConnectionStatus) {
        const changed =
            newStatus.state !== this.status.state ||
            newStatus.transport !== this.status.transport;

        this.status = newStatus;

        if (changed) {
            this.emit(newStatus);
        }
    }

    private async checkConnections() {
        // 1. Check Starlink
        const starlink = await this.checkStarlink();
        if (starlink.available) {
            return this.updateStatus({
                state: starlink.strong ? "CONNECTED" : "DEGRADED",
                transport: "starlink",
                lastChange: Date.now(),
                signalStrength: starlink.strength
            });
        }

        // 2. Check LTE
        const lte = await this.checkLTE();
        if (lte.available) {
            return this.updateStatus({
                state: lte.strong ? "CONNECTED" : "DEGRADED",
                transport: "lte",
                lastChange: Date.now(),
                signalStrength: lte.strength
            });
        }

        // 3. Check WiFi
        const wifi = await this.checkWiFi();
        if (wifi.available) {
            return this.updateStatus({
                state: wifi.strong ? "CONNECTED" : "DEGRADED",
                transport: "wifi",
                lastChange: Date.now(),
                signalStrength: wifi.strength
            });
        }

        // 4. No signal at all
        this.updateStatus({
            state: "OFFLINE",
            transport: "none",
            lastChange: Date.now()
        });
    }

    // --- Transport Checks (Stubbed for now — real logic added later) ---

    private async checkStarlink() {
        return {
            available: false,
            strong: false,
            strength: 0
        };
    }

    private async checkLTE() {
        return {
            available: false,
            strong: false,
            strength: 0
        };
    }

    private async checkWiFi() {
        return {
            available: false,
            strong: false,
            strength: 0
        };
    }

    getStatus() {
        return this.status;
    }
}
