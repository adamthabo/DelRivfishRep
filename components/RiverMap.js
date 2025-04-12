import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

// Note: In a real implementation, you would use a library like Leaflet or Mapbox
// For this example, we'll create a simplified map using a static background

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
    <div className="bg-white rounded-lg shadow-md p-4 h-full">
      <h3 className="font-bold text-lg mb-2">Monitoring Stations</h3>
      
      {/* Simplified map container */}
      <div 
        ref={mapRef} 
        className="relative bg-blue-100 h-64 rounded overflow-hidden"
        style={{
          backgroundImage: "url('/map-background.jpg')", // You would need to add this image
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Station markers */}
        {stations.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">Loading stations...</p>
          </div>
        ) : (
          stations.map(station => {
            // These would be actual coordinates in a real implementation
            // Here we're using a simple algorithm to spread the stations across the map
            const index = stations.indexOf(station);
            const totalStations = stations.length;
            const left = 10 + (80 * (index % 4)) / 3;
            const top = 10 + (80 * Math.floor(index / 4)) / 2;
            
            return (
              <div 
                key={station.id}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: `${left}%`, 
                  top: `${top}%` 
                }}
                onClick={() => handleStationClick(station)}
              >
                <MapPin className={`w-6 h-6 ${getMarkerColor(station.id)}`} />
              </div>
            );
          })
        )}
        
        {/* Station info popup */}
        {selectedStation && (
          <div 
            className="absolute bg-white p-2 rounded shadow-md text-sm z-10"
            style={{ 
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <button 
              className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
              onClick={closeStationInfo}
            >
              ✕
            </button>
            <div className="font-medium">{selectedStation.name}</div>
            <div className="text-gray-600 text-xs">{selectedStation.river}</div>
            <button 
              className="mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
              onClick={() => window.location.href = `#station-${selectedStation.id}`}
            >
              View Details
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-sm text-gray-600">
        <p>Click on stations to view information. For a real implementation, this would use a proper mapping library.</p>
      </div>
    </div>
  );
}
