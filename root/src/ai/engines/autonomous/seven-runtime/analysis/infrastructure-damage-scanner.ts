// © 2026 Global Infrastructure Advisory
// Seven Runtime — Infrastructure Damage Scanner

export type InfraType = "road" | "bridge" | "powerline" | "pipeline" | "building";

export interface InfraSample {
    lat: number;
    lon: number;
    type: InfraType;
    crackScore?: number;      // 0–1
    deformationScore?: number;
    heatAnomaly?: number;
    obstructionScore?: number;
}

export interface InfraDamageReport {
    type: InfraType;
    critical: InfraSample[];
    moderate: InfraSample[];
    minor: InfraSample[];
}

export class InfrastructureDamageScanner {
    analyze(samples: InfraSample[]): InfraDamageReport[] {
        const byType = new Map<InfraType, InfraSample[]>();
        for (const s of samples) {
            if (!byType.has(s.type)) byType.set(s.type, []);
            byType.get(s.type)!.push(s);
        }

        const reports: InfraDamageReport[] = [];

        for (const [type, list] of byType.entries()) {
            const critical: InfraSample[] = [];
            const moderate: InfraSample[] = [];
            const minor: InfraSample[] = [];

            for (const s of list) {
                const score =
                    (s.crackScore ?? 0) * 0.4 +
                    (s.deformationScore ?? 0) * 0.4 +
                    (s.obstructionScore ?? 0) * 0.2;

                if (score > 0.7) critical.push(s);
                else if (score > 0.4) moderate.push(s);
                else minor.push(s);
            }

            reports.push({ type, critical, moderate, minor });
        }

        return reports;
    }
}
