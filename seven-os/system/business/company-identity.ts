// seven-os/system/business/company-identity.ts

export class CompanyIdentity {
  constructor(env, vaultProfile) {
    this.env = env;
    this.vault = vaultProfile;
  }

  getProfile() {
    return {
      ...this.vault,
      ein: this.env.EIN || null,
      gov: {
        uei: this.env.UEI || null,
        samGovId: this.env.SAM_GOV_ID || null
      }
    };
  }
}
