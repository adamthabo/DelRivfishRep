import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Droplet, Thermometer, Wind, Clock, RefreshCw } from 'lucide-react';

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

// Status indicator component
const StatusIndicator = ({ status }) => {
  const colors = {
    high: "bg-orange-500",
    normal: "bg-green-500",
    low: "bg-blue-500",
    unknown: "bg-gray-300"
  };
  
  return (
    <span className={`inline-block w-3 h-3 rounded-full ${colors[status] || colors.unknown} mr-2`}></span>
  );
};

// River Station Card Component
export default function RiverStationCard({ stationId, stationName, riverName }) {
  // Fetch station data using SWR
  const { data: stationData, error, mutate } = useSWR(
    `/api/station/${stationId}`,
    fetcher,
    { refreshInterval: 30 * 60 * 1000 } // 30 minutes
  );
  
  const refreshData = () => {
    // Trigger SWR revalidation
    mutate();
  };
  
  // Loading state
  if (!stationData && !error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-full animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-40 bg-gray-200 rounded mb-4"></div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-full">
        <h3 className="font-bold text-lg">{stationName}</h3>
        <p className="text-gray-600 text-sm">{riverName}</p>
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded">
          Error loading station data. Please try again later.
        </div>
        <button 
          onClick={refreshData}
          className="mt-4 text-sm text-blue-600 flex items-center hover:text-blue-800"
        >
          <RefreshCw size={12} className="mr-1" />
          Retry
        </button>
      </div>
    );
  }
  
  // Format temperature with unit if available
  const formattedTemperature = stationData.current.temperature !== null 
    ? `${stationData.current.temperature}°F` 
    : 'N/A';
  
  // Format time from ISO to local time
  const formattedTime = new Date(stationData.current.updated).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg">{stationName}</h3>
          <p className="text-gray-600 text-sm">{riverName}</p>
        </div>
        <span className="text-xs text-gray-500 flex items-center">
          <Clock size={12} className="mr-1" />
          Updated: {formattedTime}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-50 p-2 rounded">
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Droplet size={16} className="mr-1 text-blue-500" />
            Height
          </div>
          <div className="flex items-center">
            <StatusIndicator status={stationData.status.height} />
            <span className="font-bold">
              {stationData.current.height !== null ? `${stationData.current.height} ft` : 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-2 rounded">
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Wind size={16} className="mr-1 text-blue-500" />
            Flow
          </div>
          <div className="flex items-center">
            <StatusIndicator status={stationData.status.flow} />
            <span className="font-bold">
              {stationData.current.flow !== null ? `${stationData.current.flow} cfs` : 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-2 rounded">
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Thermometer size={16} className="mr-1 text-blue-500" />
            Temp
          </div>
          <div className="flex items-center">
            <StatusIndicator status={stationData.status.temperature} />
            <span className="font-bold">{formattedTemperature}</span>
          </div>
        </div>
      </div>
      
      {stationData.historical && stationData.historical.length > 0 && (
        <div className="h-40 mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={stationData.historical}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="height" 
                stroke="#3b82f6" 
                name="Height (ft)" 
                dot={{ r: 2 }} 
                connectNulls
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="flow" 
                stroke="#10b981" 
                name="Flow (cfs)" 
                dot={{ r: 2 }} 
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="flex justify-between mt-2">
        <a href={`https://waterdata.usgs.gov/nwis/uv?site_no=${stationId}`} 
           target="_blank" 
           rel="noopener noreferrer"
           className="text-xs text-blue-600 hover:underline">
          View USGS Data
        </a>
        <button 
          onClick={refreshData}
          className="text-xs text-gray-600 flex items-center hover:text-blue-600"
        >
          <RefreshCw size={12} className="mr-1" />
          Refresh
        </button>
      </div>
    </div>
  );
}
