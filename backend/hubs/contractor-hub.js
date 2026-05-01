contractor-hub.js
export function contractorHub(payload) {
    return {
        sector: "contractor",
        trust: "auth-required",
        payload
    };
}
