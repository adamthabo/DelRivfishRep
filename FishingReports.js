import { useState } from 'react';
import useSWR from 'swr';
import { Fish, RefreshCw } from 'lucide-react';

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

export default function FishingReports() {
  // State for filtering reports
  const [selectedRiver, setSelectedRiver] = useState("all");
  
  // Fetch fishing reports
  const { data: reports, error, mutate } = useSWR(
    '/api/fishing-reports',
    fetcher,
    { refreshInterval: 24 * 60 * 60 * 1000 } // Daily
  );
  
  const refreshReports = () => {
    mutate();
  };
  
  // Filter reports based on selected river
  const filteredReports = selectedRiver === "all" 
    ? reports 
    : reports?.filter(report => report.river === selectedRiver);
  
  // Get unique river names for filter
  const riverOptions = reports 
    ? ["all", ...new Set(reports.map(report => report.river))]
    : ["all"];
  
  // Loading state
  if (!reports && !error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
        <h3 className="font-bold text-lg mb-2">Fishing Reports</h3>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-b pb-4 mb-4 last:border-b-0">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-bold text-lg mb-2">Fishing Reports</h3>
        <div className="p-4 bg-red-50 text-red-700 rounded mb-4">
          Error loading fishing reports. Please try again later.
        </div>
        <button 
          onClick={refreshReports}
          className="text-sm text-blue-600 flex items-center hover:text-blue-800"
        >
          <RefreshCw size={12} className="mr-1" />
          Retry
        </button>
      </div>
    );
  }
  
  // Empty state
  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-bold text-lg mb-2">Fishing Reports</h3>
        <p className="text-gray-500 text-center py-4">No fishing reports available.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Fishing Reports</h3>
        
        <div className="flex items-center">
          <select 
            value={selectedRiver}
            onChange={(e) => setSelectedRiver(e.target.value)}
            className="text-sm border rounded mr-2 px-2 py-1"
          >
            {riverOptions.map((river) => (
              <option key={river} value={river}>
                {river === "all" ? "All Rivers" : river}
              </option>
            ))}
          </select>
          
          <button 
            onClick={refreshReports}
            className="text-xs text-gray-600 flex items-center hover:text-blue-600"
          >
            <RefreshCw size={12} className="mr-1" />
            Refresh
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredReports.length > 0 ? (
          filteredReports.map((report, i) => (
            <div key={i} className="border-b pb-3 last:border-b-0 last:pb-0">
              <div className="flex justify-between">
                <div className="font-medium">{report.river} - {report.section}</div>
                <div className="text-xs text-gray-500">{report.date}</div>
              </div>
              <p className="text-sm my-1">{report.report}</p>
              {report.flies && report.flies.length > 0 && (
                <div className="flex flex-wrap mt-1">
                  {report.flies.map((fly, j) => (
                    <span key={j} className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5 mr-1 mb-1">
                      <Fish size={10} className="inline mr-0.5" /> {fly}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">
            No reports available for the selected river.
          </p>
        )}
      </div>
    </div>
  );
}
