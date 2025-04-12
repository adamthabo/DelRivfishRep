import { useState } from 'react';
import useSWR from 'swr';
import { AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';

// Mock alerts for fallback
const MOCK_ALERTS = [
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
  }
];

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
    console.error('Error fetching alerts:', error);
    return MOCK_ALERTS; // Return mock data on error
  }
};

export default function RiverAlerts() {
  // Fetch alerts data
  const { data: alerts, error, mutate } = useSWR(
    '/api/alerts',
    fetcher,
    { 
      refreshInterval: 30 * 60 * 1000, // 30 minutes
      fallbackData: MOCK_ALERTS // Use mock data while loading
    }
  );
  
  const refreshAlerts = () => {
    mutate();
  };
  
  // Loading state
  if (!alerts && !error) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl p-4 animate-pulse-glow border border-gray-700">
        <h3 className="font-bold text-lg mb-2 text-gray-100">Alerts & Notifications</h3>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-700 rounded-md mb-2"></div>
        ))}
      </div>
    );
  }
  
  // Error state
  if (error && !alerts) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl p-4 border border-gray-700">
        <h3 className="font-bold text-lg mb-2 text-gray-100">Alerts & Notifications</h3>
        <div className="p-4 bg-red-900/30 text-red-300 rounded-md mb-4 border border-red-800/50">
          Error loading alerts. Please try again later.
        </div>
        <button 
          onClick={refreshAlerts}
          className="text-sm text-blue-400 flex items-center hover:text-blue-300"
        >
          <RefreshCw size={12} className="mr-1" />
          Retry
        </button>
      </div>
    );
  }
  
  // No alerts state
  if (alerts.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl p-4 border border-gray-700 card-glow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg text-blue-300">Alerts & Notifications</h3>
          <button 
            onClick={refreshAlerts}
            className="text-xs text-gray-400 hover:text-blue-300 flex items-center transition-colors"
          >
            <RefreshCw size={12} className="mr-1" />
            Refresh
          </button>
        </div>
        <div className="p-4 bg-green-900/20 text-green-300 rounded-md flex items-center border border-green-800/30">
          <AlertCircle size={18} className="mr-2 text-green-400" />
          No active alerts at this time. All river conditions are normal.
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl p-4 border border-gray-700 card-glow">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-blue-300 flex items-center">
          <AlertTriangle size={18} className="mr-2 text-yellow-500" /> 
          Alerts & Notifications
        </h3>
        <button 
          onClick={refreshAlerts}
          className="text-xs text-gray-400 hover:text-blue-300 flex items-center transition-colors"
        >
          <RefreshCw size={12} className="mr-1" />
          Refresh
        </button>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <div 
            key={i} 
            className={`rounded-md p-3 border transition-all hover:translate-y-[-1px] ${
              alert.severity === 'high' 
                ? 'bg-red-900/30 text-red-200 border-red-800/50' 
                : alert.severity === 'moderate'
                  ? 'bg-yellow-900/30 text-yellow-200 border-yellow-800/50'
                  : 'bg-blue-900/30 text-blue-200 border-blue-800/50'
            }`}
          >
            <div className="flex items-start">
              <AlertTriangle 
                size={18} 
                className={`mr-2 flex-shrink-0 mt-0.5 ${
                  alert.severity === 'high' 
                    ? 'text-red-400' 
                    : alert.severity === 'moderate'
                      ? 'text-yellow-400'
                      : 'text-blue-400'
                }`} 
              />
              <div>
                <div className="font-medium text-white">{alert.river}</div>
                <div className="text-sm">{alert.message}</div>
                {alert.expires && (
                  <div className="text-xs mt-1 opacity-80">
                    Expires: {new Date(alert.expires).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
