export class CompanyIdentity {
  constructor(data) {
    this.data = data;
  }

  getEIN() {
    return this.data.ein;
  }

  getGovCredentials() {
    return {
      uei: this.data.uei,
      samGovId: this.data.samGovId
    };
  }

  getProfile() {
    return {
      legalName: this.data.legalName,
      dbaName: this.data.dbaName,
      domicileState: this.data.domicileState,
      domicileCountry: this.data.domicileCountry,
      registeredAddress: this.data.registeredAddress,
      contactEmail: this.data.contactEmail,
      contactPhone: this.data.contactPhone,
      ein: this.data.ein,
      uei: this.data.uei,
      samGovId: this.data.samGovId
    };
  }

  getPublicProfile() {
    const { ein, uei, samGovId, ...rest } = this.data;
    return rest;
  }
}
