farmer-hub.js
export function farmerHub(payload) {
    return {
        sector: "farmer",
        trust: "auth-required",
        payload
    };
}
