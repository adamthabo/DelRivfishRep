import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { MapPin, Droplet, Thermometer, Wind, AlertTriangle, Fish, Clock, RefreshCw, BarChart3 } from 'lucide-react';

// Import components
import RiverStationCard from '../components/RiverStationCard';
import WeatherForecast from '../components/WeatherForecast';
import FishingReports from '../components/FishingReports';
import RiverAlerts from '../components/RiverAlerts';

// Import Map component dynamically to avoid SSR issues with map libraries
const RiverMap = dynamic(() => import('../components/RiverMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl p-4 h-full border border-gray-700">
      <h3 className="font-bold text-lg mb-2 text-gray-100">Monitoring Stations</h3>
      <div className="h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">Loading map...</p>
      </div>
    </div>
  )
});

// SWR fetcher function
const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  return res.json();
};

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

// Main Dashboard Component
export default function Dashboard() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedRiver, setSelectedRiver] = useState("all");
  
  // Fetch all stations
  const { data: stations, error: stationsError, mutate: mutateStations } = useSWR(
    '/api/stations',
    fetcher,
    { refreshInterval: 30 * 60 * 1000, // 30 minutes
      fallbackData: MOCK_STATIONS } 
  );
  
  // Filter stations by selected river
  const filteredStations = selectedRiver === "all" 
    ? stations 
    : stations?.filter(s => s.river === selectedRiver) || [];
  
  // Get unique river names for filter
  const riverOptions = stations 
    ? ["all", ...new Set(stations.map(s => s.river))]
    : ["all"];
    
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
      
      <header className="dashboard-header py-4 px-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <h1 className="text-2xl md:text-3xl font-orbitron text-blue-400 flex items-center">
              <BarChart3 className="mr-2 text-blue-500" />
              Delaware River Dashboard
            </h1>
            <div className="flex items-center mt-2 md:mt-0">
              <span className="text-sm mr-4 bg-gray-800/60 px-3 py-1 rounded-full flex items-center">
                <Clock size={14} className="mr-1 text-blue-400" />
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
              <button 
                onClick={refreshData}
                className="bg-blue-700 hover:bg-blue-600 text-white py-1 px-3 rounded-full flex items-center text-sm transition-all glow-button"
              >
                <RefreshCw size={14} className="mr-1" /> Refresh
              </button>
            </div>
          </div>
          
          {stations && (
            <div className="flex flex-wrap mt-4 text-sm">
              <div className="mr-4 mb-2">
                <span className="mr-2 text-blue-300">Filter by river:</span>
                <select 
                  value={selectedRiver}
                  onChange={(e) => setSelectedRiver(e.target.value)}
                  className="bg-gray-800 text-white rounded-md px-2 py-1 border border-gray-700"
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
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2" /> Normal
                </span>
                <span className="flex items-center mr-3">
                  <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-2" /> High
                </span>
                <span className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2" /> Low
                </span>
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <RiverMap stations={stations || []} />
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
        
        {stationsError && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-4 border border-red-700">
            Error loading station data. Please try again later.
          </div>
        )}
        
        {!stations && !stationsError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3, 4, 5, 6].map((placeholder) => (
              <div key={placeholder} className="bg-gray-800/40 rounded-lg shadow-lg p-4 h-full animate-pulse border border-gray-700">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-40 bg-gray-700 rounded mb-4"></div>
              </div>
            ))}
          </div>
        )}
        
        {stations && (
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
        )}
        
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
