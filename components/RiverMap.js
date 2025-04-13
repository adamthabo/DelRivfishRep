import React, { useState } from 'react';
import { MapPin, ExternalLink, Activity } from 'lucide-react';

// This is an ultra-reliable version that doesn't use any mapping - just a styled table
export default function RiverMap({ stations = [] }) {
  // Group stations by river
  const groupedStations = {};
  
  stations.forEach(station => {
    if (!groupedStations[station.river]) {
      groupedStations[station.river] = [];
    }
    groupedStations[station.river].push(station);
  });
  
  // Get randomly assigned status for demo
  const getStatusColor = (stationId) => {
    const statusOptions = ["bg-green-500", "bg-orange-500", "bg-blue-500"];
    const colorIndex = stationId.charCodeAt(stationId.length - 1) % 3;
    return statusOptions[colorIndex];
  };
  
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl p-4 h-full border border-gray-700">
      <h3 className="font-bold text-lg mb-3 text-blue-300 flex items-center">
        <MapPin className="mr-2" /> River Monitoring Stations
      </h3>
      
      <div className="overflow-hidden border border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                Station
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                River
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 bg-gray-900/30">
            {Object.keys(groupedStations).sort().map(riverName => (
              <React.Fragment key={riverName}>
                {groupedStations[riverName].map((station, idx) => (
                  <tr key={station.id} className="hover:bg-gray-800/70 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200">
                      {station.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200">
                      {station.river}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(station.id)} mr-2`}></span>
                        <Activity size={14} className="text-blue-400 mr-1" />
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200">
                      <div className="flex space-x-2">
                        <a 
                          href={`#station-${station.id}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 bg-blue-900/30 rounded"
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(`station-${station.id}`)?.scrollIntoView({ 
                              behavior: 'smooth', 
                              block: 'center' 
                            });
                          }}
                        >
                          View Details
                        </a>
                        <a 
                          href={`https://waterdata.usgs.gov/monitoring-location/${station.id}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-200 transition-colors px-2 py-1 bg-gray-700/30 rounded flex items-center"
                        >
                          USGS <ExternalLink size={12} className="ml-1" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        <p>All station data is sourced from the USGS Water Data Service</p>
      </div>
    </div>
  );
}
