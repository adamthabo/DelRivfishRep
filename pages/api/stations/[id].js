import axios from 'axios';

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Station ID is required' });
  }
  
  try {
    // Fetch real-time data from USGS
    // Parameters: 00060 = flow, 00065 = gage height, 00010 = temperature
    const response = await axios.get(
      `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${id}&parameterCd=00060,00065,00010&siteStatus=all`,
      {
        headers: {
          'User-Agent': 'DelawareRiverDashboard/1.0 (contact@example.com)'
        }
      }
    );
    
    const usgsData = response.data;
    const timeSeries = usgsData.value.timeSeries;
    
    // Extract the data we need
    let flow = null;
    let height = null;
    let temperature = null;
    let stationName = '';
    
    for (const series of timeSeries) {
      stationName = series.sourceInfo.siteName;
      const parameter = series.variable.variableCode[0].value;
      
      if (parameter === '00060' && series.values[0].value.length > 0) {
        flow = parseFloat(series.values[0].value[0].value);
      } else if (parameter === '00065' && series.values[0].value.length > 0) {
        height = parseFloat(series.values[0].value[0].value);
      } else if (parameter === '00010' && series.values[0].value.length > 0) {
        temperature = parseFloat(series.values[0].value[0].value);
      }
    }
    
    // Determine status based on data
    const statusData = {
      flow: determineStatus('flow', flow),
      height: determineStatus('height', height),
      temperature: determineStatus('temperature', temperature)
    };
    
    // Get historical data
    const historicalData = await fetchHistoricalData(id);
    
    // Format the response
    const result = {
      id,
      name: stationName,
      current: {
        flow,
        height,
        temperature,
        updated: new Date().toISOString()
      },
      status: statusData,
      historical: historicalData
    };
    
    res.status(200).json(result);
  } catch (error) {
    console.error(`Error fetching data for station ${id}:`, error);
    
    // If there's an API error, fall back to mock data for demonstration
    if (process.env.NODE_ENV !== 'production') {
      console.log('Returning fallback station data');
      return res.status(200).json(generateMockStationData(id));
    }
    
    res.status(500).json({ error: 'Failed to fetch station data' });
  }
}

// Helper function to determine status based on thresholds
function determineStatus(type, value) {
  if (value === null) return 'unknown';
  
  switch (type) {
    case 'flow':
      if (value > 2500) return 'high';
      if (value < 1500) return 'low';
      return 'normal';
    
    case 'height':
      if (value > 4) return 'high';
      if (value < 3) return 'low';
      return 'normal';
    
    case 'temperature':
      // Temperature thresholds for trout health
      if (value > 70) return 'high';
      if (value < 40) return 'low';
      return 'normal';
    
    default:
      return 'unknown';
  }
}

// Helper function to fetch historical data
async function fetchHistoricalData(stationId) {
  try {
    // Get data for the past 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    
    const response = await axios.get(
      `https://waterservices.usgs.gov/nwis/dv/?format=json&sites=${stationId}&startDT=${formattedStartDate}&endDT=${formattedEndDate}&parameterCd=00060,00065,00010&siteStatus=all`,
      {
        headers: {
          'User-Agent': 'DelawareRiverDashboard/1.0 (contact@example.com)'
        }
      }
    );
    
    const dailyValues = response.data.value.timeSeries;
    
    // Create lookup for dates
    const dateMap = {};
    
    // Process each time series (one per parameter)
    for (const series of dailyValues) {
      const parameter = series.variable.variableCode[0].value;
      const values = series.values[0].value;
      
      for (const entry of values) {
        const date = entry.dateTime.split('T')[0];
        
        if (!dateMap[date]) {
          dateMap[date] = {
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            flow: null,
            height: null,
            temperature: null
          };
        }
        
        const value = parseFloat(entry.value);
        
        if (parameter === '00060') {
          dateMap[date].flow = value;
        } else if (parameter === '00065') {
          dateMap[date].height = value;
        } else if (parameter === '00010') {
          dateMap[date].temperature = value;
        }
      }
    }
    
    // Convert the map to an array and sort by date
    const historicalArray = Object.values(dateMap);
    historicalArray.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return historicalArray;
  } catch (error) {
    console.error(`Error fetching historical data for station ${stationId}:`, error);
    return generateMockHistoricalData(); // Return mock data on error
  }
}

// Generate mock station data for development/demo purposes
function generateMockStationData(stationId) {
  // Base values
  const baseHeight = Math.random() * 3 + 2; // 2-5 feet
  const baseFlow = Math.random() * 2000 + 1000; // 1000-3000 cfs
  const baseTemp = Math.random() * 5 + 50; // 50-55°F
  
  // Generate current data
  const heightVar = Math.random() * 0.5 - 0.25;
  const flowVar = Math.random() * 400 - 200;
  const tempVar = Math.random() * 2 - 1;
  
  const height = +(baseHeight + heightVar).toFixed(2);
  const flow = Math.round(baseFlow + flowVar);
  const temperature = +(baseTemp + tempVar).toFixed(1);
  
  // Status indicators
  const status = {
    height: height > 4 ? 'high' : height < 3 ? 'low' : 'normal',
    flow: flow > 2500 ? 'high' : flow < 1500 ? 'low' : 'normal',
    temperature: temperature > 53 ? 'high' : temperature < 51 ? 'low' : 'normal'
  };
  
  return {
    id: stationId,
    name: getStationName(stationId),
    current: {
      height,
      flow,
      temperature,
      updated: new Date().toISOString()
    },
    status,
    historical: generateMockHistoricalData(baseHeight, baseFlow, baseTemp)
  };
}

// Generate mock historical data
function generateMockHistoricalData(baseHeight = 3, baseFlow = 1500, baseTemp = 52) {
  const historicalData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some random variation
    const heightVar = Math.random() * 0.5 - 0.25;
    const flowVar = Math.random() * 400 - 200;
    const tempVar = Math.random() * 2 - 1;
    
    historicalData.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      height: +(baseHeight + heightVar).toFixed(2),
      flow: Math.round(baseFlow + flowVar),
      temperature: +(baseTemp + tempVar).toFixed(1),
    });
  }
  
  return historicalData;
}

// Get station name based on ID (for mock data)
function getStationName(stationId) {
  const stationMap = {
    "01438500": "Delaware River at Montague, NJ",
    "01434000": "Delaware River at Port Jervis, NY",
    "01432160": "Delaware River at Barryville, NY",
    "01427510": "Delaware River at Callicoon, NY",
    "01427207": "Delaware River at Lordville, NY",
    "01437500": "Neversink River at Godeffroy, NY",
    "01431500": "Lackawaxen River at Hawley, PA",
    "01420500": "Beaver Kill at Cooks Falls, NY"
  };
  
  return stationMap[stationId] || `Station ${stationId}`;
}
