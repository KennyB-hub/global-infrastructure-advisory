public-hub.js
export function publicHub(payload) {
    return {
        sector: "public",
        trust: "open",
        payload
    };
}
