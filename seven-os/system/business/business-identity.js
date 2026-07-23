// seven-os/system/business/business-identity.js
export class BusinessIdentity {
  constructor(env) {
    this.env = env;
  }

  getEIN() {
    return this.env.EIN; // secure pull
  }

  getCompanyName() {
    return this.env.COMPANY_LEGAL_NAME;
  }

  getSAM() {
    return {
      uei: this.env.UEI,
      samId: this.env.SAM_GOV_ID
    };
  }
}
