import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Head from 'next/head';
import { Droplet, Fish, Clock, RefreshCw, BarChart3, Waves } from 'lucide-react';

// Import components directly
import RiverMap from '../components/RiverMap';
import RiverStationCard from '../components/RiverStationCard';
import WeatherForecast from '../components/WeatherForecast';
import FishingReports from '../components/FishingReports';
import RiverAlerts from '../components/RiverAlerts';

// Updated mock station data with the correct rivers
const MOCK_STATIONS = [
  { id: "01427510", name: "Delaware River at Callicoon, NY", lat: 41.76056, lng: -75.05833, river: "Upper Delaware River" },
  { id: "01428500", name: "Delaware River at Barryville, NY", lat: 41.50822, lng: -74.91306, river: "Upper Delaware River" },
  { id: "01434000", name: "Delaware River at Port Jervis, NY", lat: 41.37128, lng: -74.69757, river: "Upper Delaware River" },
  { id: "01417500", name: "East Branch Delaware River at Harvard, NY", lat: 42.0201, lng: -75.1035, river: "East Branch Delaware River" },
  { id: "01423000", name: "West Branch Delaware River at Hancock, NY", lat: 41.9551, lng: -75.2829, river: "West Branch Delaware River" },
  { id: "01437500", name: "Neversink River at Godeffroy, NY", lat: 41.44056, lng: -74.60056, river: "Neversink River" },
  { id: "01420500", name: "Beaver Kill at Cooks Falls, NY", lat: 41.94611, lng: -74.97639, river: "Beaverkill" },
  { id: "01365000", name: "Willowemoc Creek near Livingston Manor, NY", lat: 41.9026, lng: -74.8004, river: "Willowemoc" }
];

// SWR fetcher function with simple error handling
const fetcher = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return null; // Return null on error to trigger fallback
  }
};

// Main Dashboard Component
export default function Dashboard() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedRiver, setSelectedRiver] = useState("all");
  
  // Fetch all stations - with fallback to mock data
  const { data: stations, error: stationsError, mutate: mutateStations } = useSWR(
    '/api/stations',
    fetcher,
    { 
      refreshInterval: 30 * 60 * 1000, // 30 minutes
      fallbackData: MOCK_STATIONS, // Always use mock data as a fallback
      suspense: false,
      revalidateOnFocus: false
    }
  );
  
  // Filter stations by selected river
  const filteredStations = selectedRiver === "all" 
    ? stations || MOCK_STATIONS // Ensure we always have stations data
    : (stations || MOCK_STATIONS).filter(s => s.river === selectedRiver);
  
  // Get unique river names for filter
  const riverOptions = stations 
    ? ["all", ...new Set(stations.map(s => s.river))]
    : ["all", ...new Set(MOCK_STATIONS.map(s => s.river))];
    
  const refreshData = () => {
    // Trigger SWR revalidation
    mutateStations();
    setLastUpdated(new Date());
  };
  
  useEffect(() => {
    // Update the last updated timestamp whenever stations data changes
    if (stations) {
      setLastUpdated(new Date());
    }
  }, [stations]);
  
  return (
    <div className="min-h-screen dashboard-background text-gray-100">
      <Head>
        <title>Delaware River Dashboard</title>
        <meta name="description" content="Live monitoring dashboard for the Delaware River and its tributaries" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>
      
      <header className="dashboard-header py-4 px-6 shadow-xl border-b border-blue-900/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <h1 className="text-2xl md:text-3xl font-orbitron text-blue-400 flex items-center">
              <Waves className="mr-3 text-blue-500" />
              Delaware River Dashboard
            </h1>
            <div className="flex items-center mt-2 md:mt-0">
              <span className="text-sm mr-4 bg-gray-800/70 px-3 py-1 rounded-full flex items-center border border-gray-700/50 shadow-inner">
                <Clock size={14} className="mr-1 text-blue-400" />
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
              <button 
                onClick={refreshData}
                className="bg-blue-700 hover:bg-blue-600 text-white py-1 px-3 rounded-full flex items-center text-sm transition-all glow-button shadow-lg"
              >
                <RefreshCw size={14} className="mr-1" /> Refresh
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap mt-4 text-sm">
            <div className="mr-4 mb-2">
              <span className="mr-2 text-blue-300">Filter by river:</span>
              <select 
                value={selectedRiver}
                onChange={(e) => setSelectedRiver(e.target.value)}
                className="bg-gray-800 text-white rounded-md px-2 py-1 border border-gray-700 shadow-inner"
              >
                {riverOptions.map((river) => (
                  <option key={river} value={river}>
                    {river === "all" ? "All Rivers" : river}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <span className="flex items-center mr-3">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2 shadow-sm" /> Normal
              </span>
              <span className="flex items-center mr-3">
                <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-2 shadow-sm" /> High
              </span>
              <span className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2 shadow-sm" /> Low
              </span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <RiverMap stations={filteredStations} />
          </div>
          <div>
            <WeatherForecast />
          </div>
        </div>
        
        <div className="mb-6">
          <RiverAlerts />
        </div>
        
        <h2 className="text-xl font-bold mb-4 font-orbitron text-blue-400 flex items-center">
          <Droplet className="mr-2" /> River Conditions
        </h2>
        
        {stationsError && !stations && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-4 border border-red-700">
            Error loading station data. Using backup data instead.
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {filteredStations.length > 0 ? (
            filteredStations.map(station => (
              <RiverStationCard 
                key={station.id}
                stationId={station.id}
                stationName={station.name}
                riverName={station.river}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-400 bg-gray-800/30 rounded-lg border border-gray-700">
              No stations found for the selected river.
            </div>
          )}
        </div>
        
        <h2 className="text-xl font-bold mb-4 font-orbitron text-blue-400 flex items-center">
          <Fish className="mr-2" /> Fishing Reports
        </h2>
        
        <div className="mb-6">
          <FishingReports />
        </div>
        
        <footer className="mt-8 text-center text-sm text-gray-400 border-t border-gray-800 pt-6">
          <p>Data sources: USGS Water Data, NOAA, NWS, Delaware River Basin Commission, local fishing reports</p>
          <p className="mt-1">© {new Date().getFullYear()} Delaware River Dashboard • Built with Next.js and deployed on Vercel</p>
        </footer>
      </main>
    </div>
  );
}
