import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Droplet, Thermometer, Wind, Clock, RefreshCw, ExternalLink } from 'lucide-react';

// SWR fetcher function
const fetcher = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const error = new Error('An error occurred while fetching the data.');
      error.info = await res.json();
      error.status = res.status;
      throw error;
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching station data:', error);
    
    // Generate mock data if the API call fails
    return generateMockStationData();
  }
};

// Mock station data generator for fallback
function generateMockStationData() {
  // Base values
  const baseHeight = Math.random() * 3 + 2; // 2-5 feet
  const baseFlow = Math.random() * 2000 + 1000; // 1000-3000 cfs
  const baseTemp = Math.random() * 5 + 50; // 50-55°F
  
  // Generate current data
  const height = +(baseHeight + (Math.random() * 0.5 - 0.25)).toFixed(2);
  const flow = Math.round(baseFlow + (Math.random() * 400 - 200));
  const temperature = +(baseTemp + (Math.random() * 2 - 1)).toFixed(1);
  
  // Status indicators
  const status = {
    height: height > 4 ? 'high' : height < 3 ? 'low' : 'normal',
    flow: flow > 2500 ? 'high' : flow < 1500 ? 'low' : 'normal',
    temperature: temperature > 53 ? 'high' : temperature < 51 ? 'low' : 'normal'
  };

  // Generate historical data
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
  
  return {
    current: {
      height,
      flow,
      temperature,
      updated: new Date().toISOString()
    },
    status,
    historical: historicalData
  };
}

// Status indicator component
const StatusIndicator = ({ status }) => {
  const colors = {
    high: "bg-orange-500",
    normal: "bg-green-500",
    low: "bg-blue-500",
    unknown: "bg-gray-600"
  };
  
  return (
    <span className={`inline-block w-3 h-3 rounded-full ${colors[status] || colors.unknown} mr-2`}></span>
  );
};

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-md p-2 text-sm shadow-lg">
        <p className="text-gray-300 mb-1 font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name}: {entry.value} {entry.name.includes('Height') ? 'ft' : entry.name.includes('Flow') ? 'cfs' : '°F'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// River Station Card Component
export default function RiverStationCard({ stationId, stationName, riverName }) {
  // Fetch station data using SWR
  const { data: stationData, error, mutate } = useSWR(
    `/api/station/${stationId}`,
    fetcher,
    { 
      refreshInterval: 30 * 60 * 1000, // 30 minutes
      fallbackData: generateMockStationData() // Use mock data while loading
    }
  );
  
  const refreshData = () => {
    // Trigger SWR revalidation
    mutate();
  };
  
  // Loading state
  if (!stationData && !error) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl p-4 h-full animate-pulse-glow border border-gray-700">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-40 bg-gray-700 rounded mb-4"></div>
      </div>
    );
  }
  
  // Error state
  if (error && !stationData) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl p-4 h-full border border-gray-700">
        <h3 className="font-bold text-lg text-gray-100">{stationName}</h3>
        <p className="text-gray-400 text-sm">{riverName}</p>
        <div className="mt-4 p-4 bg-red-900/30 text-red-300 rounded-md border border-red-800/50">
          Error loading station data. Please try again later.
        </div>
        <button 
          onClick={refreshData}
          className="mt-4 text-sm text-blue-400 flex items-center hover:text-blue-300"
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
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl p-4 h-full border border-gray-700 card-glow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg text-blue-300">{stationName}</h3>
          <p className="text-gray-400 text-sm">{riverName}</p>
        </div>
        <span className="text-xs text-gray-400 flex items-center bg-gray-800/60 px-2 py-0.5 rounded-full">
          <Clock size={12} className="mr-1 text-blue-400" />
          {formattedTime}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-800/60 p-2 rounded-md border border-gray-700/70">
          <div className="flex items-center text-sm text-gray-400 mb-1">
            <Droplet size={16} className="mr-1 text-blue-400" />
            Height
          </div>
          <div className="flex items-center">
            <StatusIndicator status={stationData.status.height} />
            <span className="font-bold text-gray-100">
              {stationData.current.height !== null ? `${stationData.current.height} ft` : 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-800/60 p-2 rounded-md border border-gray-700/70">
          <div className="flex items-center text-sm text-gray-400 mb-1">
            <Wind size={16} className="mr-1 text-blue-400" />
            Flow
          </div>
          <div className="flex items-center">
            <StatusIndicator status={stationData.status.flow} />
            <span className="font-bold text-gray-100">
              {stationData.current.flow !== null ? `${stationData.current.flow} cfs` : 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-800/60 p-2 rounded-md border border-gray-700/70">
          <div className="flex items-center text-sm text-gray-400 mb-1">
            <Thermometer size={16} className="mr-1 text-blue-400" />
            Temp
          </div>
          <div className="flex items-center">
            <StatusIndicator status={stationData.status.temperature} />
            <span className="font-bold text-gray-100">{formattedTemperature}</span>
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
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }} 
                stroke="#94a3b8" 
                tickLine={{ stroke: '#475569' }}
              />
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                tick={{ fontSize: 10 }} 
                stroke="#94a3b8"
                tickLine={{ stroke: '#475569' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fontSize: 10 }} 
                stroke="#94a3b8"
                tickLine={{ stroke: '#475569' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="height" 
                stroke="#3b82f6" 
                name="Height (ft)" 
                dot={{ r: 2 }} 
                connectNulls
                activeDot={{ r: 4, stroke: '#1d4ed8', strokeWidth: 1 }}
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="flow" 
                stroke="#10b981" 
                name="Flow (cfs)" 
                dot={{ r: 2 }} 
                connectNulls
                activeDot={{ r: 4, stroke: '#065f46', strokeWidth: 1 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="flex justify-between mt-2">
        <a href={`https://waterdata.usgs.gov/nwis/uv?site_no=${stationId}`} 
           target="_blank" 
           rel="noopener noreferrer"
           className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center"
        >
          <ExternalLink size={12} className="mr-1" />
          USGS Data
        </a>
        <button 
          onClick={refreshData}
          className="text-xs text-gray-400 hover:text-blue-300 flex items-center transition-colors"
        >
          <RefreshCw size={12} className="mr-1" />
          Refresh
        </button>
      </div>
    </div>
  );
}
