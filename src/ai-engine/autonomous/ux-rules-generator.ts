import fs from "fs";

export function generateUXRulesForSector(sector) {
  const category = sector.category || "general";

  const uxSets = {
    workforce: [
      {
        intent: "job_request",
        required: ["workerType", "location", "urgency"],
        questions: {
          workerType: "What type of worker do you need?",
          location: "Where is the job located?",
          urgency: "How urgent is the job?"
        }
      },
      {
        intent: "credential_verification",
        required: ["workerId"],
        questions: {
          workerId: "What is the worker's ID?"
        }
      }
    ],

    land: [
      {
        intent: "farm_support",
        required: ["farmType", "issue"],
        questions: {
          farmType: "What type of farm is this?",
          issue: "What issue are you experiencing?"
        }
      },
      {
        intent: "crop_reporting",
        required: ["cropType", "acreage"],
        questions: {
          cropType: "What crop are you reporting?",
          acreage: "How many acres?"
        }
      }
    ],

    public: [
      {
        intent: "document_request",
        required: ["documentType"],
        questions: {
          documentType: "What document do you need?"
        }
      },
      {
        intent: "civic_issue",
        required: ["issueType", "location"],
        questions: {
          issueType: "What civic issue are you reporting?",
          location: "Where is it located?"
        }
      }
    ],

    digital: [
      {
        intent: "network_issue",
        required: ["symptom", "location"],
        questions: {
          symptom: "What issue are you experiencing?",
          location: "Where is the affected area?"
        }
      },
      {
        intent: "latency_check",
        required: ["connectionType"],
        questions: {
          connectionType: "What type of connection are you using?"
        }
      }
    ],

    energy: [
      {
        intent: "outage_report",
        required: ["location", "severity"],
        questions: {
          location: "Where is the outage?",
          severity: "How severe is the outage?"
        }
      },
      {
        intent: "line_inspection",
        required: ["lineId"],
        questions: {
          lineId: "What is the line or pole ID?"
        }
      }
    ],

    utilities: [
      {
        intent: "water_quality_issue",
        required: ["location", "symptom"],
        questions: {
          location: "Where is the issue occurring?",
          symptom: "What water quality issue are you seeing?"
        }
      }
    ],

    transport: [
      {
        intent: "route_planning",
        required: ["origin", "destination"],
        questions: {
          origin: "Where is the load starting?",
          destination: "Where is it going?"
        }
      }
    ],

    safety: [
      {
        intent: "incident_report",
        required: ["incidentType", "location"],
        questions: {
          incidentType: "What type of incident occurred?",
          location: "Where did it happen?"
        }
      }
    ],

    industrial: [
      {
        intent: "site_safety_check",
        required: ["siteId"],
        questions: {
          siteId: "What is the site ID?"
        }
      }
    ],

    resilience: [
      {
        intent: "hazard_report",
        required: ["hazardType", "location"],
        questions: {
          hazardType: "What type of hazard?",
          location: "Where is it located?"
        }
      }
    ],

    knowledge: [
      {
        intent: "research_request",
        required: ["topic"],
        questions: {
          topic: "What research topic are you working on?"
        }
      }
    ],

    general: [
      {
        intent: "general_request",
        required: ["description"],
        questions: {
          description: "How can I help you?"
        }
      }
    ]
  };

  return uxSets[category] || uxSets["general"];
}
