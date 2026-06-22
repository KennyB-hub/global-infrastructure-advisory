// © 2026 Global Infrastructure Advisory
// Seven Runtime — Neighborhood Action Program (NAP) Sector Group

export type NAPAgency =
    | "code-enforcement"
    | "public-works"
    | "police"
    | "fire"
    | "ems";

export interface NAPEvent {
    agency: NAPAgency;
    type: string;
    payload: any;
}
