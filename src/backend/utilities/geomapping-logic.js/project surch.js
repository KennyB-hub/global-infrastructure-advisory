const fs = require('fs');
const path = require('path');
const { calculateDistance } = require('../utilities/geo');

/**
 * Searches for projects within a specific radius of a user's coordinates.
 * @param {number} userLat - User's latitude
 * @param {number} userLon - User's longitude
 * @returns {Array} - List of matching projects with their distance
 */
module.exports.findNearbyProjects = function(userLat, userLon) {
  try {
    // 1. Load the projects data safely
    const dataPath = path.join(__dirname, '../data/projects.json');
    const projects = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // 2. Filter projects based on distance
    return projects.filter(project => {
      const { lat, lon, country } = project.location;
      
      // Determine unit based on country (e.g., USA uses miles, Kenya uses km)
      const unit = country.toLowerCase() === 'usa' ? 'miles' : 'km';
      const distance = calculateDistance(userLat, userLon, lat, lon, unit);
      
      // Get the allowed radius from the JSON (radius_miles or radius_km)
      const allowedRadius = project.radius_miles || project.radius_km;

      // Add the calculated distance to the project object for the UI
      project.current_distance = parseFloat(distance.toFixed(2));
      project.distance_unit = unit;

      return distance <= allowedRadius;
    });
  } catch (error) {
    console.error("Error searching projects:", error);
    return [];
  }
};
