import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export class SevenOsFirewallBanner {
    private firewallRegistryPath = join(process.cwd(), "seven-os", "config", "firewall.registry.json");
    private ledgerPath = join(process.cwd(), "seven-os", "config", "workforce.ledger.json");

    public bannerUnauthorizedHost(ip: string, sector: string, violationReason: string): boolean {
        console.log(`\n🛡️ [Cyber-Firewall] Network Exception Triggered from IP: [${ip}]`);
        console.log(`🚨 [Cyber-Firewall] Sector Infraction: Target -> sector/${sector}/ | Reason: ${violationReason}`);

        let registry = {
            meta: { system: "Seven-OS Automated IP Perimeter Guard", updatedAt: new Date().toISOString(), activeBlocksCount: 1 },
            bannedHosts: [{ ipAddress: ip, reason: violationReason, bannedAt: new Date().toISOString(), attemptedSector: sector }]
        };

        try {
            writeFileSync(this.firewallRegistryPath, JSON.stringify(registry, null, 4), "utf-8");
            console.log(`🚫 [Cyber-Firewall] PACKET DROP APPLIED: Host ${ip} completely barred from system networks.`);
            this.syncFirewallStateToLedger(1);
            return true;
        } catch { return false; }
    }

    private syncFirewallStateToLedger(activeBlocks: number): void {
        if (!existsSync(this.ledgerPath)) return;
        try {
            const ledger = JSON.parse(readFileSync(this.ledgerPath, "utf-8"));
            ledger.meta.activeNetworkBansCount = activeBlocks;
            ledger.meta.lastFirewallSync = new Date().toISOString();
            writeFileSync(this.ledgerPath, JSON.stringify(ledger, null, 4), "utf-8");
            console.log("💾 [R2-Stack] Firewall state engine token cached to workforce ledger.");
        } catch {}
    }
}
