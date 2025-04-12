import axios from 'axios';

// List of station IDs to monitor
const STATION_IDS = [
  "01427510", // Delaware River at Callicoon, NY
  "01428500", // Delaware River at Barryville, NY
  "01434000", // Delaware River at Port Jervis, NY
  "01417500", // East Branch Delaware River at Harvard, NY
  "01423000", // West Branch Delaware River at Hancock, NY
  "01437500", // Neversink River at Godeffroy, NY
  "01420500", // Beaver Kill at Cooks Falls, NY
  "01365000", // Willowemoc Creek near Livingston Manor, NY
];

export default async function handler(req, res) {
  try {
    // Fetch station metadata from USGS API
    const response = await axios.get(
      `https://waterservices.usgs.gov/nwis/site/?format=rdb&sites=${STATION_IDS.join(',')}&siteStatus=all&siteOutput=expanded`,
      {
        headers: {
          'User-Agent': 'DelawareRiverDashboard/1.0 (contact@example.com)'
        }
      }
    );

    // Parse the tab-delimited response
    const lines = response.data.split('\n');
    let headers = [];
    const stations = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip comments
      if (line.startsWith('#')) continue;
      
      // Parse headers
      if (line.startsWith('agency_cd')) {
        headers = line.split('\t');
        continue;
      }
      
      // Skip the dash line that follows headers
      if (line.includes('----------------')) continue;
      
      // Parse data rows
      if (line.trim() !== '') {
        const values = line.split('\t');
        const stationData = {};
        
        for (let j = 0; j < headers.length; j++) {
          stationData[headers[j]] = values[j];
        }
        
        // Map to our station format
        stations.push({
          id: stationData.site_no,
          name: stationData.station_nm,
          lat: parseFloat(stationData.dec_lat_va),
          lng: parseFloat(stationData.dec_long_va),
          river: determineUpdatedRiver(stationData.station_nm, stationData.site_no)
        });
      }
    }

    res.status(200).json(stations);
  } catch (error) {
    console.error('Error fetching stations:', error);
    
    // If there's an API error, fall back to hardcoded stations for demonstration
    if (process.env.NODE_ENV !== 'production') {
      console.log('Returning fallback station data');
      return res.status(200).json(getFallbackStations());
    }
    
    res.status(500).json({ error: 'Failed to fetch station data' });
  }
}

// Helper function to determine river name from station name with the updated rivers
function determineUpdatedRiver(stationName, stationId) {
  if (stationName.includes('Delaware') && !stationName.includes('Branch')) {
    return 'Upper Delaware River';
  }
  if (stationName.includes('East Branch Delaware')) {
    return 'East Branch Delaware River';
  }
  if (stationName.includes('West Branch Delaware')) {
    return 'West Branch Delaware River';
  }
  if (stationName.includes('Neversink')) {
    return 'Neversink River';
  }
  if (stationName.includes('Beaver Kill')) {
    return 'Beaverkill';
  }
  if (stationName.includes('Willowemoc')) {
    return 'Willowemoc';
  }
  
  // Map by ID if name doesn't match patterns
  const riverByID = {
    "01427510": "Upper Delaware River",
    "01428500": "Upper Delaware River",
    "01434000": "Upper Delaware River",
    "01417500": "East Branch Delaware River",
    "01423000": "West Branch Delaware River",
    "01437500": "Neversink River",
    "01420500": "Beaverkill",
    "01365000": "Willowemoc"
  };
  
  if (riverByID[stationId]) {
    return riverByID[stationId];
  }
  
  // Default to Upper Delaware if we can't determine
  return 'Upper Delaware River';
}

// Fallback station data for development/demo purposes
function getFallbackStations() {
  return [
    { id: "01427510", name: "Delaware River at Callicoon, NY", lat: 41.76056, lng: -75.05833, river: "Upper Delaware River" },
    { id: "01428500", name: "Delaware River at Barryville, NY", lat: 41.50822, lng: -74.91306, river: "Upper Delaware River" },
    { id: "01434000", name: "Delaware River at Port Jervis, NY", lat: 41.37128, lng: -74.69757, river: "Upper Delaware River" },
    { id: "01417500", name: "East Branch Delaware River at Harvard, NY", lat: 42.0201, lng: -75.1035, river: "East Branch Delaware River" },
    { id: "01423000", name: "West Branch Delaware River at Hancock, NY", lat: 41.9551, lng: -75.2829, river: "West Branch Delaware River" },
    { id: "01437500", name: "Neversink River at Godeffroy, NY", lat: 41.44056, lng: -74.60056, river: "Neversink River" },
    { id: "01420500", name: "Beaver Kill at Cooks Falls, NY", lat: 41.94611, lng: -74.97639, river: "Beaverkill" },
    { id: "01365000", name: "Willowemoc Creek near Livingston Manor, NY", lat: 41.9026, lng: -74.8004, river: "Willowemoc" }
  ];
}
