import { useState, useEffect, useRef } from 'react';
import { MapPin, X, ExternalLink, Info } from 'lucide-react';

// Note: In a real implementation, you would use a library like Leaflet or Mapbox
// For this example, we'll create a simplified map using a styled background

export default function RiverMap({ stations = [] }) {
  const [selectedStation, setSelectedStation] = useState(null);
  const mapRef = useRef(null);
  
  // In a real implementation, this would initialize the map library
  useEffect(() => {
    // This is a placeholder for real map initialization
    console.log('Map would initialize here with a real mapping library');
  }, []);
  
  // Station marker colors based on status (would be determined from station data)
  const getMarkerColor = (stationId) => {
    // In a real implementation, this would use actual station data
    // For this example, we'll randomize the colors
    const colors = ['text-green-500', 'text-orange-500', 'text-blue-500'];
    const randomIndex = stationId.charCodeAt(stationId.length - 1) % 3;
    return colors[randomIndex];
  };
  
  // Handle station marker click
  const handleStationClick = (station) => {
    setSelectedStation(station);
  };
  
  // Close station info popup
  const closeStationInfo = () => {
    setSelectedStation(null);
  };
  
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl p-4 h-full border border-gray-700 card-glow">
      <h3 className="font-bold text-lg mb-2 text-blue-300 flex items-center">
        <MapPin className="mr-2" /> Monitoring Stations
      </h3>
      
      {/* Simplified map container */}
      <div 
        ref={mapRef} 
        className="relative bg-gray-900/70 h-64 rounded-md overflow-hidden border border-gray-700"
        style={{
          background: `radial-gradient(circle at 25% 30%, rgba(19, 78, 94, 0.3) 0%, transparent 80%),
                      radial-gradient(circle at 75% 70%, rgba(21, 94, 117, 0.2) 0%, transparent 80%),
                      linear-gradient(to bottom, #0F172A 0%, #1E293B 100%)`,
        }}
      >
        {/* Stylized "rivers" as light blue lines */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Main Delaware River */}
          <path
            d="M50,0 C55,20 62,40 60,60 C58,80 40,90 40,100"
            stroke="#3b82f6"
            strokeWidth="0.8"
            strokeOpacity="0.4"
            fill="none"
          />
          {/* East Branch */}
          <path
            d="M60,60 C70,55 80,45 90,40"
            stroke="#3b82f6"
            strokeWidth="0.6"
            strokeOpacity="0.3"
            fill="none"
          />
          {/* West Branch */}
          <path
            d="M60,60 C65,70 75,75 90,70"
            stroke="#3b82f6"
            strokeWidth="0.6"
            strokeOpacity="0.3"
            fill="none"
          />
          {/* Neversink */}
          <path
            d="M40,80 C30,82 20,75 10,80"
            stroke="#3b82f6"
            strokeWidth="0.5"
            strokeOpacity="0.3"
            fill="none"
          />
          {/* Beaverkill */}
          <path
            d="M50,45 C45,40 35,42 30,40"
            stroke="#3b82f6"
            strokeWidth="0.5"
            strokeOpacity="0.3"
            fill="none"
          />
          {/* Willowemoc */}
          <path
            d="M50,30 C40,28 30,32 20,30"
            stroke="#3b82f6"
            strokeWidth="0.5"
            strokeOpacity="0.3"
            fill="none"
          />
        </svg>
        
        {/* Station markers */}
        {stations.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-400">Loading stations...</p>
          </div>
        ) : (
          stations.map(station => {
            // Position stations based on their river
            let left = 50;
            let top = 50;
            
            // Define positions based on river and station name
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
            
            return (
              <div 
                key={station.id}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform duration-200"
                style={{ 
                  left: `${left}%`, 
                  top: `${top}%`,
                  filter: 'drop-shadow(0 0 4px rgba(0, 0, 0, 0.7))'
                }}
                onClick={() => handleStationClick(station)}
              >
                <div className="relative">
                  <MapPin className={`w-6 h-6 ${getMarkerColor(station.id)}`} />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                </div>
              </div>
            );
          })
        )}
        
        {/* Label rivers */}
        <div className="absolute text-xs text-blue-400/80 font-bold" style={{ left: '52%', top: '45%' }}>
          Upper Delaware
        </div>
        <div className="absolute text-xs text-blue-400/80 font-bold" style={{ left: '82%', top: '35%' }}>
          East Branch
        </div>
        <div className="absolute text-xs text-blue-400/80 font-bold" style={{ left: '78%', top: '65%' }}>
          West Branch
        </div>
        <div className="absolute text-xs text-blue-400/80 font-bold" style={{ left: '15%', top: '75%' }}>
          Neversink
        </div>
        <div className="absolute text-xs text-blue-400/80 font-bold" style={{ left: '25%', top: '35%' }}>
          Beaverkill
        </div>
        <div className="absolute text-xs text-blue-400/80 font-bold" style={{ left: '20%', top: '25%' }}>
          Willowemoc
        </div>
        
        {/* Station info popup */}
        {selectedStation && (
          <div 
            className="absolute z-10 bg-gray-800/95 p-3 rounded-lg shadow-xl border border-blue-900/50 max-w-xs"
            style={{ 
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              backdropFilter: 'blur(4px)'
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
                className="text-xs flex items-center justify-center bg-blue-900/50 hover:bg-blue-800/70 text-blue-200 px-3 py-1.5 rounded transition-colors"
                onClick={() => {
                  closeStationInfo();
                  document.getElementById(`station-${selectedStation.id}`)?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center'
                  });
                }}
              >
                <Info size={12} className="mr-1" />
                View Conditions
              </a>
              <a 
                href={`https://waterdata.usgs.gov/nwis/uv?site_no=${selectedStation.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs flex items-center justify-center bg-gray-700/80 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded transition-colors"
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
