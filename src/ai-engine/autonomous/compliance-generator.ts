import fs from "fs";

export function generateComplianceForSector(sector) {
  const category = sector.category || "general";

  const complianceSets = {
    workforce: [
      { id: "cred_verify", rule: "All workers must have verified credentials before assignment." },
      { id: "background_check", rule: "Background checks required for sensitive operations." },
      { id: "safety_training", rule: "Workers must complete safety training annually." }
    ],

    land: [
      { id: "soil_reporting", rule: "Soil and crop data must be reported accurately." },
      { id: "equipment_safety", rule: "Farm equipment must pass annual safety checks." },
      { id: "rural_infra", rule: "Rural infrastructure hazards must be logged within 24 hours." }
    ],

    public: [
      { id: "data_privacy", rule: "Civic data must be handled according to privacy standards." },
      { id: "document_chain", rule: "All documents must maintain a verifiable chain of custody." },
      { id: "gov_access", rule: "Only authorized government actors may access restricted files." }
    ],

    digital: [
      { id: "cyber_logging", rule: "All systems must maintain audit logs for 12 months." },
      { id: "uptime_monitor", rule: "Digital services must report outages within 5 minutes." },
      { id: "latency_threshold", rule: "Latency must remain below defined thresholds." }
    ],

    energy: [
      { id: "grid_safety", rule: "Grid components must meet safety and inspection standards." },
      { id: "outage_reporting", rule: "Outages must be reported within 15 minutes." },
      { id: "line_clearance", rule: "Vegetation clearance must meet regulatory requirements." }
    ],

    utilities: [
      { id: "water_quality", rule: "Water quality must meet EPA standards." },
      { id: "treatment_logs", rule: "Treatment cycles must be logged daily." },
      { id: "pipe_inspection", rule: "Pipes must be inspected annually." }
    ],

    transport: [
      { id: "vehicle_inspection", rule: "Vehicles must pass DOT inspections." },
      { id: "load_limits", rule: "Loads must comply with weight limits." },
      { id: "route_safety", rule: "Routes must be checked for hazards." }
    ],

    safety: [
      { id: "incident_logging", rule: "Incidents must be logged within 10 minutes." },
      { id: "emergency_protocol", rule: "Emergency protocols must be followed." },
      { id: "risk_assessment", rule: "Risk assessments must be updated quarterly." }
    ],

    industrial: [
      { id: "site_safety", rule: "Industrial sites must meet OSHA safety standards." },
      { id: "equipment_checks", rule: "Equipment must be inspected monthly." },
      { id: "hazard_reporting", rule: "Hazards must be reported immediately." }
    ],

    resilience: [
      { id: "climate_risk", rule: "Climate risks must be assessed annually." },
      { id: "disaster_plan", rule: "Disaster recovery plans must be maintained." },
      { id: "hazard_map", rule: "Hazard maps must be updated quarterly." }
    ],

    knowledge: [
      { id: "research_ethics", rule: "Research must follow ethical guidelines." },
      { id: "data_integrity", rule: "Research data must maintain integrity." },
      { id: "peer_review", rule: "Research outputs must undergo peer review." }
    ],

    general: [
      { id: "default_compliance", rule: "Sector must maintain general compliance standards." }
    ]
  };

  return complianceSets[category] || complianceSets["general"];
}
