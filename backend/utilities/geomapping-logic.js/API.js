const { findNearbyProjects } = require('./hubs-logic/project-search');

// Example: Searching for projects near Abilene, TX
const matches = findNearbyProjects(32.4, -99.7);
console.log("Nearby Opportunities:", matches);
