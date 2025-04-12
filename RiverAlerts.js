import { useState } from 'react';
import useSWR from 'swr';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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

export default function RiverAlerts() {
  // Fetch alerts data
  const { data: alerts, error, mutate } = useSWR(
    '/api/alerts',
    fetcher,
    { refreshInterval: 30 * 60 * 1000 } // 30 minutes
  );
  
  const refreshAlerts = () => {
    mutate();
  };
  
  // Loading state
  if (!alerts && !error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
        <h3 className="font-bold text-lg mb-2">Alerts & Notifications</h3>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
        ))}
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-bold text-lg mb-2">Alerts & Notifications</h3>
        <div className="p-4 bg-red-50 text-red-700 rounded mb-4">
          Error loading alerts. Please try again later.
        </div>
        <button 
          onClick={refreshAlerts}
          className="text-sm text-blue-600 flex items-center hover:text-blue-800"
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
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">Alerts & Notifications</h3>
          <button 
            onClick={refreshAlerts}
            className="text-xs text-gray-600 flex items-center hover:text-blue-600"
          >
            <RefreshCw size={12} className="mr-1" />
            Refresh
          </button>
        </div>
        <p className="text-green-700 bg-green-50 p-3 rounded">
          No active alerts at this time. All river conditions are normal.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">Alerts & Notifications</h3>
        <button 
          onClick={refreshAlerts}
          className="text-xs text-gray-600 flex items-center hover:text-blue-600"
        >
          <RefreshCw size={12} className="mr-1" />
          Refresh
        </button>
      </div>
      
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <div 
            key={i} 
            className={`rounded p-3 ${
              alert.severity === 'high' 
                ? 'bg-red-100 text-red-800' 
                : alert.severity === 'moderate'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
            }`}
          >
            <div className="flex items-start">
              <AlertTriangle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">{alert.river}</div>
                <div className="text-sm">{alert.message}</div>
                {alert.expires && (
                  <div className="text-xs mt-1">
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
