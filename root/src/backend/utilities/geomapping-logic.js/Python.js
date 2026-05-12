import json

# Creating the sample projects.json file as described in previous turn to test the logic
projects_data = [
  {
    "id": "PROJ-TX-001",
    "name": "Texas Agriculture Expansion",
    "hub": "FarmerHub",
    "location": {
      "country": "usa",
      "state": "Texas",
      "lat": 31.9686,
      "lon": -99.9018
    },
    "status": "active",
    "radius_miles": 50
  },
  {
    "id": "PROJ-AF-002",
    "name": "Donor-Funded Africa Infrastructure",
    "hub": "ContractorHub",
    "location": {
      "country": "Kenya",
      "state": "Nairobi",
      "lat": -1.2863,
      "lon": 36.8172
    },
    "status": "pending",
    "radius_km": 100
  }
]

# This simulates the logic that will be in project-search.js
def calculate_distance_sim(lat1, lon1, lat2, lon2, unit='miles'):
    import math
    to_rad = lambda x: (x * math.pi) / 180
    R = 3958.8 if unit == 'miles' else 6371
    dLat = to_rad(lat2 - lat1)
    dLon = to_rad(lon2 - lon1)
    a = math.sin(dLat / 2)**2 + math.cos(to_rad(lat1)) * math.cos(to_rad(lat2)) * math.sin(dLon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def find_nearby_projects(user_lat, user_lon, projects):
    nearby = []
    for p in projects:
        p_lat = p['location']['lat']
        p_lon = p['location']['lon']
        # Default to miles for Texas projects, km for others based on your data structure
        unit = 'miles' if p['location']['country'] == 'usa' else 'km'
        dist = calculate_distance_sim(user_lat, user_lon, p_lat, p_lon, unit)
        
        limit = p.get('radius_miles') or p.get('radius_km')
        if dist <= limit:
            nearby.append({**p, "current_distance": round(dist, 2), "unit": unit})
    return nearby

# Test: User is in Abilene, TX (approx 32.4, -99.7)
test_results = find_nearby_projects(32.4, -99.7, projects_data)
print(test_results)
