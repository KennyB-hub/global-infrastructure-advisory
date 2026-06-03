deepgov-hub.js
export function deepgovHub(payload) {
    return {
        sector: "deepgov",
        trust: "sovereign-only",
        payload
    };
}
