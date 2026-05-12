infrastructure-hub.js
export function infrastructureHub(payload) {
    return {
        sector: "infrastructure",
        trust: "restricted",
        payload
    };
}
