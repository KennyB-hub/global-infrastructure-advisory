/**
 * © 2026 Global Infrastructure Advisory
 * Sector Mapping Logic
 */

const COUNTRY_PROFILES = {
  USA: {
    primary_sectors: ["Data Centers", "Grid Modernization", "Federal Facilities"],
    engineering_focus: ["Electrical (Local 26)", "Civil", "Cybersecurity"],
    compliance: "SAM.gov / FAR / NIST",
    language_default: "en",
    hub: "ContractorHub"
  },
  KSA: {
    primary_sectors: ["Oil & Gas", "Desalination", "NEOM Infrastructure"],
    engineering_focus: ["Petroleum", "Mechanical", "Renewables"],
    compliance: "Aramco Standards / SAGIA",
    language_default: "ar",
    hub: "DesignerHub"
  },
  Australia: {
    primary_sectors: ["Mining", "Rare Earths", "Critical Minerals"],
    engineering_focus: ["Mining Engineering", "Geotechnical", "Logistics"],
    compliance: "AS/NZS Standards",
    language_default: "en",
    hub: "ContractorHub"
  }
};

const PROJECT_REGISTRY = [
  {
    id: "PROJ-TX-001",
    name: "Texas Agriculture Expansion",
    hub: "FarmerHub",
    location: {
      country: "USA",
      state: "Texas",
      lat: 31.9686,
      lon: -99.9018
    },
    status: "active",
    radius_miles: 50
  },
  {
    id: "PROJ-AF-002",
    name: "Donor-Funded Africa Infrastructure",
    hub: "ContractorHub",
    location: {
      country: "Kenya",
      state: "Nairobi",
      lat: -1.2863,
      lon: 36.8172
    },
    status: "pending",
    radius_km: 100
  },
  {
    id: "PROJ-SEA-003",
    name: "Southeast Asia Renewable Energy",
    hub: "DesignerHub",
    location: {
      country: "Indonesia",
      state: "Jakarta",
      lat: -6.2088,
      lon: 106.8456
    },
    status: "active",
    radius_km: 150
  }
];

function mapSectorContext(location) {
  const { country, state, lat, lon } = location;

  let context = {
    region: state || country,
    sector: "general",
    isAgricultural: false,
    isFederal: false,
    coordinates: { lat, lon }
  };

  const agPriorityZones = ["Texas", "Iowa", "Kansas", "Nebraska", "California"];

  if (agPriorityZones.includes(state)) {
    context.sector = "agriculture";
    context.isAgricultural = true;
  }

  if (country?.toLowerCase() === "usa") {
    context.isFederal = true;
  }

  // Attach country profile if available
  if (COUNTRY_PROFILES[country]) {
    context.countryProfile = COUNTRY_PROFILES[country];
  }

  return context;
}

module.exports = {
  mapSectorContext,
  COUNTRY_PROFILES,
  PROJECT_REGISTRY
};
