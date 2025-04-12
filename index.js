import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { MapPin, Droplet, Thermometer, Wind, AlertTriangle, Fish, Clock, RefreshCw } from 'lucide-react';

// Import components
import RiverStationCard from '../components/RiverStationCard';
import WeatherForecast from '../components/WeatherForecast';
import FishingReports from '../components/FishingReports';
import RiverAlerts from '../components/RiverAlerts';

// Import Map component dynamically to avoid SSR issues with map libraries
const RiverMap = dynamic(() => import('../components/RiverMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg shadow-md p-4 h-full">
      <h3 className="font-bold text-lg mb-2">Monitoring Stations</h3>
      <div className="h-64 bg-blue-100 rounded flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
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

// Main Dashboard Component
export default function Dashboard() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedRiver, setSelectedRiver] = useState("all");
  
  // Fetch all stations
  const { data: stations, error: stationsError, mutate: mutateStations } = useSWR(
    '/api/stations',
    fetcher,
    { refreshInterval: 30 * 60 * 1000 } // 30 minutes
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
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Delaware River Dashboard</title>
        <meta name="description" content="Live monitoring dashboard for the Delaware River and its tributaries" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <header className="bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <h1 className="text-2xl font-bold">Delaware River Dashboard</h1>
            <div className="flex items-center mt-2 md:mt-0">
              <span className="text-sm mr-4">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
              <button 
                onClick={refreshData}
                className="bg-blue-700 hover:bg-blue-600 text-white py-1 px-3 rounded flex items-center text-sm"
              >
                <RefreshCw size={14} className="mr-1" /> Refresh All
              </button>
            </div>
          </div>
          
          {stations && (
            <div className="flex flex-wrap mt-2 text-sm">
              <div className="mr-4 mb-2">
                <span className="mr-2">Filter by river:</span>
                <select 
                  value={selectedRiver}
                  onChange={(e) => setSelectedRiver(e.target.value)}
                  className="bg-blue-700 text-white rounded px-2 py-1"
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
        
        <h2 className="text-xl font-bold mb-4">River Conditions</h2>
        
        {stationsError && (
          <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
            Error loading station data. Please try again later.
          </div>
        )}
        
        {!stations && !stationsError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3, 4, 5, 6].map((placeholder) => (
              <div key={placeholder} className="bg-white rounded-lg shadow-md p-4 h-full animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-40 bg-gray-200 rounded mb-4"></div>
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
              <div className="col-span-full text-center py-8 text-gray-500">
                No stations found for the selected river.
              </div>
            )}
          </div>
        )}
        
        <div className="mb-6">
          <FishingReports />
        </div>
        
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>Data sources: USGS Water Data, NOAA, NWS, Delaware River Basin Commission, local fishing reports</p>
          <p className="mt-1">© {new Date().getFullYear()} Delaware River Dashboard • Built with Next.js and deployed on Vercel</p>
        </footer>
      </main>
    </div>
  );
}