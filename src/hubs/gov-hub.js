gov-hub.
export function govHub(payload) {
    return {
        sector: "gov",
        trust: "restricted",
        payload
    };
}
