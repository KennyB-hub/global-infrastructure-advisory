export const CommandLibrary = {
  rural: [
    {
      intent: "agri.cattle.locate",
      priority: "normal",
      patterns: [
        "where are my cattle",
        "locate herd",
        "find livestock",
        "track cattle",
        "show herd"
      ]
    },
    {
      intent: "agri.boundary.check",
      priority: "normal",
      patterns: [
        "check boundary",
        "fence status",
        "scan perimeter",
        "boundary sweep"
      ]
    },
    {
      intent: "agri.route.safe",
      priority: "warning",
      patterns: [
        "safe route",
        "route me out",
        "find exit",
        "show escape path"
      ]
    }
  ],

  engineering: [
    {
      intent: "eng.equipment.check",
      priority: "normal",
      patterns: [
        "check excavator",
        "scan loader",
        "machine diagnostics",
        "equipment status"
      ]
    },
    {
      intent: "eng.site.hazard",
      priority: "warning",
      patterns: [
        "scan site",
        "hazard check",
        "site sweep",
        "detect hazards"
      ]
    }
  ],

  emergency: [
    {
      intent: "emt.vitals.check",
      priority: "emergency",
      patterns: [
        "check vitals",
        "patient status",
        "scan patient"
      ]
    },
    {
      intent: "emt.route.hospital",
      priority: "emergency",
      patterns: [
        "route to hospital",
        "fastest hospital",
        "hospital route"
      ]
    }
  ],

  tactical: [
    {
      intent: "tac.survivor.scan",
      priority: "critical",
      patterns: [
        "scan for survivors",
        "thermal search",
        "locate survivors"
      ]
    },
    {
      intent: "tac.drone.deploy",
      priority: "warning",
      patterns: [
        "launch drone",
        "deploy scout",
        "send drone"
      ]
    }
  ]
};
