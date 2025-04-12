import { useState } from 'react';
import { MapPin, X, ExternalLink, Info } from 'lucide-react';

// A simple, reliable map component that doesn't rely on external libraries
export default function RiverMap({ stations = [] }) {
  const [selectedStation, setSelectedStation] = useState(null);
  
  // Define station positions by river for a simple static map
  const getStationPosition = (station) => {
    // Default position if we can't determine
    let left = 50;
    let top = 50;
    
    // Position based on river name
    if (station.river === "Upper Delaware River") {
      if (station.name.includes("Callicoon")) {
        left = 50; top = 30;
      } else if (station.name.includes("Barryville")) {
        left = 55; top = 50;
      } else if (station.name.includes("Port Jervis")) {
        left = 45; top = 70;
      } else {
        left = 50; top = 40;
      }
    } else if (station.river === "East Branch Delaware River") {
      left = 80; top = 40;
    } else if (station.river === "West Branch Delaware River") {
      left = 75; top = 70;
    } else if (station.river === "Neversink River") {
      left = 20; top = 80;
    } else if (station.river === "Beaverkill") {
      left = 30; top = 40;
    } else if (station.river === "Willowemoc") {
      left = 25; top = 30;
    }
    
    return { left, top };
  };
  
  // Get status color (simplified for reliability)
  const getStatusColor = (stationId) => {
    // Simple deterministic color based on station ID
    const colorIndex = stationId.charCodeAt(stationId.length - 1) % 3;
    return ["text-green-500", "text-orange-500", "text-blue-500"][colorIndex];
  };
  
  // Handle station selection
  const handleStationClick = (station) => {
    setSelectedStation(station);
  };
  
  // Close the station info popup
  const closeStationInfo = () => {
    setSelectedStation(null);
  };
  
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl p-4 h-full border border-gray-700 card-glow">
      <h3 className="font-bold text-lg mb-2 text-blue-300 flex items-center">
        <MapPin className="mr-2" /> Monitoring Stations
      </h3>
      
      {/* Simple static map */}
      <div className="relative bg-gray-900 h-64 rounded-md overflow-hidden border border-gray-700">
        {/* Simplified river visualization */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            background: `radial-gradient(circle at 25% 30%, rgba(19, 78, 94, 0.3) 0%, transparent 80%),
                        radial-gradient(circle at 75% 70%, rgba(21, 94, 117, 0.2) 0%, transparent 80%),
                        linear-gradient(to bottom, #0F172A 0%, #1E293B 100%)`
          }}
        >
          {/* Basic river lines */}
          <div className="absolute w-1 h-full bg-blue-500/20 left-1/2 top-0"></div>
          <div className="absolute w-20 h-1 bg-blue-500/20" style={{ left: '60%', top: '60%' }}></div>
          <div className="absolute w-20 h-1 bg-blue-500/20" style={{ left: '60%', top: '40%' }}></div>
          <div className="absolute w-20 h-1 bg-blue-500/20" style={{ left: '20%', top: '40%' }}></div>
          <div className="absolute w-20 h-1 bg-blue-500/20" style={{ left: '20%', top: '80%' }}></div>
        </div>
        
        {/* River labels */}
        <div className="absolute text-xs text-blue-400 font-bold" style={{ left: '52%', top: '45%' }}>
          Upper Delaware
        </div>
        <div className="absolute text-xs text-blue-400 font-bold" style={{ left: '75%', top: '35%' }}>
          East Branch
        </div>
        <div className="absolute text-xs text-blue-400 font-bold" style={{ left: '75%', top: '55%' }}>
          West Branch
        </div>
        <div className="absolute text-xs text-blue-400 font-bold" style={{ left: '15%', top: '75%' }}>
          Neversink
        </div>
        <div className="absolute text-xs text-blue-400 font-bold" style={{ left: '15%', top: '35%' }}>
          Beaverkill
        </div>
        <div className="absolute text-xs text-blue-400 font-bold" style={{ left: '15%', top: '15%' }}>
          Willowemoc
        </div>
        
        {/* Station markers */}
        {stations.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-400">Loading stations...</p>
          </div>
        ) : (
          stations.map(station => {
            const { left, top } = getStationPosition(station);
            return (
              <div 
                key={station.id}
                id={`map-station-${station.id}`}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                style={{ left: `${left}%`, top: `${top}%` }}
                onClick={() => handleStationClick(station)}
              >
                <MapPin className={`w-6 h-6 ${getStatusColor(station.id)}`} />
              </div>
            );
          })
        )}
        
        {/* Station info popup */}
        {selectedStation && (
          <div 
            className="absolute z-10 bg-gray-800 p-3 rounded-md shadow-lg border border-blue-900 max-w-xs"
            style={{ 
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <button 
              className="absolute top-1 right-1 text-gray-400 hover:text-white p-1"
              onClick={closeStationInfo}
            >
              <X size={16} />
            </button>
            <div className="font-medium text-blue-300 mb-1">{selectedStation.name}</div>
            <div className="text-gray-300 text-xs mb-2">{selectedStation.river}</div>
            <div className="flex flex-col gap-2 mt-3">
              <a 
                href={`#station-${selectedStation.id}`}
                className="text-xs flex items-center justify-center bg-blue-900/50 hover:bg-blue-800/70 text-blue-200 px-3 py-1.5 rounded"
                onClick={() => {
                  closeStationInfo();
                  // Find the station card in the page
                  const element = document.getElementById(`station-${selectedStation.id}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
              >
                <Info size={12} className="mr-1" />
                View Conditions
              </a>
              <a 
                href={`https://waterdata.usgs.gov/nwis/uv?site_no=${selectedStation.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1.5 rounded"
              >
                <ExternalLink size={12} className="mr-1" />
                USGS Data
              </a>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        <p className="flex items-center">
          <Info size={12} className="mr-1 text-blue-400" />
          Click on stations to view information and current conditions
        </p>
      </div>
    </div>
  );
}
