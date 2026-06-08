function buildPayload(persona: Persona, intent: string, context: any): any {
  switch (intent) {
    case "cattle-load-create":
      return {
        workflow: "cattle-load-create",
        farmerName: context.farmerName,
        contactPhone: context.contactPhone,
        origin: context.origin,
        destination: context.destination,
        headCount: context.headCount,
        weightClass: context.weightClass,
        earliestPickup: context.earliestPickup,
        latestPickup: context.latestPickup,
        notes: context.notes
      };

    case "cattle-load-match":
      return {
        workflow: "cattle-load-match",
        loadId: context.loadId
      };

    case "public-rental-agreement":
      return {
        workflow: "public-document-assist",
        docType: "rental-agreement",
        location: context.location
      };

    case "contractor-bid-generator":
      return {
        workflow: "contractor-bid-generator",
        jobType: context.jobType,
        location: context.location
      };

    case "gov-compliance-pack":
      return {
        workflow: "gov-compliance-pack",
        program: context.program
      };

    default:
      return {
        workflow: "general",
        text: context.text
      };
  }
}
