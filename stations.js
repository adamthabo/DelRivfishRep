import axios from 'axios';

// List of station IDs to monitor
const STATION_IDS = [
  "01438500", // Delaware River at Montague, NJ
  "01434000", // Delaware River at Port Jervis, NY
  "01432160", // Delaware River at Barryville, NY
  "01427510", // Delaware River at Callicoon, NY
  "01427207", // Delaware River at Lordville, NY
  "01437500", // Neversink River at Godeffroy, NY
  "01431500", // Lackawaxen River at Hawley, PA
  "01420500", // Beaver Kill at Cooks Falls, NY
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
          river: determineRiver(stationData.station_nm)
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

// Helper function to determine river name from station name
function determineRiver(stationName) {
  if (stationName.includes('Delaware')) return 'Delaware River';
  if (stationName.includes('Neversink')) return 'Neversink River';
  if (stationName.includes('Lackawaxen')) return 'Lackawaxen River';
  if (stationName.includes('Beaver Kill')) return 'Beaver Kill';
  if (stationName.includes('West Branch')) return 'West Branch Delaware';
  if (stationName.includes('East Branch')) return 'East Branch Delaware';
  
  // Default to main stem if we can't determine
  return 'Delaware River';
}

// Fallback station data for development/demo purposes
function getFallbackStations() {
  return [
    { id: "01438500", name: "Delaware River at Montague, NJ", lat: 41.40938, lng: -74.79621, river: "Delaware River" },
    { id: "01434000", name: "Delaware River at Port Jervis, NY", lat: 41.37128, lng: -74.69757, river: "Delaware River" },
    { id: "01432160", name: "Delaware River at Barryville, NY", lat: 41.50822, lng: -74.91306, river: "Delaware River" },
    { id: "01427510", name: "Delaware River at Callicoon, NY", lat: 41.76056, lng: -75.05833, river: "Delaware River" },
    { id: "01427207", name: "Delaware River at Lordville, NY", lat: 41.91861, lng: -75.11139, river: "Delaware River" },
    { id: "01437500", name: "Neversink River at Godeffroy, NY", lat: 41.44056, lng: -74.60056, river: "Neversink River" },
    { id: "01431500", name: "Lackawaxen River at Hawley, PA", lat: 41.47583, lng: -75.16306, river: "Lackawaxen River" },
    { id: "01420500", name: "Beaver Kill at Cooks Falls, NY", lat: 41.94611, lng: -74.97639, river: "Beaver Kill" }
  ];
}
