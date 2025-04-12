import axios from 'axios';
import { load } from 'cheerio';

export default async function handler(req, res) {
  try {
    // Attempt to fetch from real sources
    let alerts = [];
    
    try {
      // This would be implemented to fetch actual data in production
      // alerts = await fetchRealAlerts();
      
      // For now, we're just using mock data because actual alert fetching is complex
      throw new Error('Using mock data for demo');
    } catch (fetchError) {
      console.log('Using mock alerts data:', fetchError.message);
      alerts = getMockAlerts();
    }
    
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Error in alerts API:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
}

// This function would be implemented to fetch real alerts in production
async function fetchRealAlerts() {
  const alerts = [];
  
  try {
    // Example: Fetch NWS weather alerts for the Delaware River region
    const area = '42.5,-76.0,39.5,-74.0'; // Bounding box for Delaware River region
    const response = await axios.get(
      `https://api.weather.gov/alerts/active?area=${area}`,
      { headers: { 'User-Agent': 'DelawareRiverDashboard/1.0 (contact@example.com)' } }
    );
    
    const features = response.data.features;
    
    for (const feature of features) {
      const properties = feature.properties;
      
      // Only include alerts relevant to rivers/flooding/water
      if (
        properties.event.toLowerCase().includes('flood') ||
        properties.description.toLowerCase().includes('river') ||
        properties.description.toLowerCase().includes('water') ||
        properties.description.toLowerCase().includes('stream') ||
        properties.description.toLowerCase().includes('flood')
      ) {
        alerts.push({
          type: 'weather',
          river: 'All Areas',
          message: `${properties.headline}: ${properties.description.split('.')[0]}.`,
          severity: getSeverity(properties.severity),
          expires: properties.expires
        });
      }
    }
    
    // Fetch dam release schedules - this would be site-specific scraping
    // const releaseAlerts = await fetchDamReleases();
    // alerts.push(...releaseAlerts);
    
  } catch (error) {
    console.error('Error fetching real alerts:', error);
  }
  
  return alerts;
}

// Helper function to map NWS severity to our format
function getSeverity(nwsSeverity) {
  switch (nwsSeverity?.toLowerCase()) {
    case 'extreme':
    case 'severe':
      return 'high';
    case 'moderate':
      return 'moderate';
    default:
      return 'low';
  }
}

// Mock alerts for development/demo purposes
function getMockAlerts() {
  return [
    {
      type: "release",
      river: "Delaware River",
      message: "Scheduled water release from Cannonsville Reservoir on April 12, 6:00 AM - 12:00 PM. Expect rising water levels.",
      severity: "moderate",
      expires: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString()
    },
    {
      type: "weather",
      river: "All Areas",
      message: "Heavy rainfall expected April 13-14. Flash flood watch in effect for smaller tributaries.",
      severity: "high",
      expires: new Date(new Date().getTime() + 48 * 60 * 60 * 1000).toISOString()
    },
    {
      type: "condition",
      river: "Beaver Kill",
      message: "Unusually high water temperatures near Cooks Falls. Fishing not recommended during mid-day hours to avoid stressing fish.",
      severity: "moderate",
      expires: new Date(new Date().getTime() + 72 * 60 * 60 * 1000).toISOString()
    }
  ];
}
