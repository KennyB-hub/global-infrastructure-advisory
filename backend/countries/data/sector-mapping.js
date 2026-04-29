/**
 * © 2026 Global Infrastructure Advisory
 * Sector Mapping Logic
 */

function mapSectorContext(location) {
  const { country, state, lat, lon } = location;

  let context = {
    region: state || country,
    sector: 'general',
    isAgricultural: false,
    isFederal: false,
    coordinates: { lat, lon }
  };

  const agPriorityZones = ['Texas', 'Iowa', 'Kansas', 'Nebraska', 'California'];

  if (agPriorityZones.includes(state)) {
    context.sector = 'agriculture';
    context.isAgricultural = true;
  }

  if (country?.toLowerCase() === 'usa') {
    context.isFederal = true;
  }

  return context;
}

module.exports = { mapSectorContext };
