// /backend/services/constants.js
export const CONSTANTS = {
  VERSION: "1.0.0",
  DISPATCH: {
    MAX_DISTANCE: 50000, // meters
    PRIORITY_WEIGHTS: [3, -1, 2]
  },
  SECURITY: {
    TOKEN_EXPIRY: "1h",
    OTP_EXPIRY: 300
  }
};
