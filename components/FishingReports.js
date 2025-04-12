import { useState } from 'react';
import useSWR from 'swr';
import { Fish, RefreshCw } from 'lucide-react';

// Mock fishing reports for fallback
const MOCK_FISHING_REPORTS = [
  { 
    river: "Upper Delaware River", 
    section: "Callicoon", 
    report: "Fishing has been excellent with the recent water levels. Sulphur hatches in the evenings. Most success with size 16-18 dry flies. Water clarity is good, with some staining in deeper pools.", 
    date: "April 10, 2025",
    flies: ["Sulphur Dun #16", "Light Cahill #16", "Blue Winged Olive #18"]
  },
  { 
    river: "Neversink River", 
    section: "Main Stem", 
    report: "Water running clear. Good numbers of rainbow and brown trout being caught. Nymphing most effective in deeper pools. Some dry fly action in the evenings with Blue Winged Olives.", 
    date: "April 9, 2025",
    flies: ["Pheasant Tail Nymph #16", "Hare's Ear #14", "Prince Nymph #16"]
  },
  { 
    river: "Beaverkill", 
    section: "Cooks Falls", 
    report: "Good action in the riffles and runs. Water temperatures in the optimal range. Some great dry fly action in the evenings with caddis hatches. Browns and rainbows both active.",
    date: "April 7, 2025",
    flies: ["Elk Hair Caddis #16", "Woolly Bugger #10", "Adams #16"]
  },
  { 
    river: "Willowemoc", 
    section: "Main Stem", 
    report: "Consistent action in the early mornings. Clear water with good visibility. Medium-sized brown trout responding well to nymphs fished in riffle-pool transitions.",
    date: "April 8, 2025",
    flies: ["Copper John #16", "Parachute Adams #16", "CDC Caddis #14"]
  },
  { 
    river: "East Branch Delaware River", 
    section: "Harvard", 
    report: "Excellent dry fly fishing in the afternoon with good hatches of March Browns and Blue Winged Olives. Water levels stable and clear. Trout are selective but feeding well on the surface.",
    date: "April 8, 2025",
    flies: ["March Brown #12", "Blue Winged Olive #18", "Isonychia #12"]
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
    console.error('Error fetching fishing reports:', error);
    return MOCK_FISHING_REPORTS; // Return mock data on error
  }
};

export default function FishingReports() {
  // State for filtering reports
  const [selectedRiver, setSelectedRiver] = useState("all");
  
  // Fetch fishing reports
  const { data: reports, error, mutate } = useSWR(
    '/api/fishing-reports',
    fetcher,
    { 
      refreshInterval: 24 * 60 * 60 * 1000, // Daily
      fallbackData: MOCK_FISHING_REPORTS // Use mock data while loading
    }
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
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl p-4 animate-pulse-glow border border-gray-700">
        <h3 className="font-bold text-lg mb-2 text-gray-100">Fishing Reports</h3>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-b border-gray-700 pb-4 mb-4 last:border-b-0">
            <div className="h-4 bg-gray-700 rounded-md w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded-md w-1/2 mb-2"></div>
            <div className="h-16 bg-gray-700 rounded-md"></div>
          </div>
        ))}
      </div>
    );
  }
  
  // Error state
  if (error && !reports) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl p-4 border border-gray-700">
        <h3 className="font-bold text-lg mb-2 text-gray-100">Fishing Reports</h3>
        <div className="p-4 bg-red-900/30 text-red-300 rounded-md mb-4 border border-red-800/50">
          Error loading fishing reports. Please try again later.
        </div>
        <button 
          onClick={refreshReports}
          className="text-sm text-blue-400 flex items-center hover:text-blue-300"
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
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl p-4 border border-gray-700 card-glow">
        <h3 className="font-bold text-lg mb-2 text-blue-300">Fishing Reports</h3>
        <p className="text-gray-400 text-center py-4">No fishing reports available.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl p-4 border border-gray-700 card-glow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-blue-300 flex items-center">
          <Fish className="mr-2" /> Fishing Reports
        </h3>
        
        <div className="flex items-center">
          <select 
            value={selectedRiver}
            onChange={(e) => setSelectedRiver(e.target.value)}
            className="text-sm bg-gray-800 text-white border border-gray-700 rounded-md mr-2 px-2 py-1"
          >
            {riverOptions.map((river) => (
              <option key={river} value={river}>
                {river === "all" ? "All Rivers" : river}
              </option>
            ))}
          </select>
          
          <button 
            onClick={refreshReports}
            className="text-xs text-gray-400 hover:text-blue-300 flex items-center transition-colors"
          >
            <RefreshCw size={12} className="mr-1" />
            Refresh
          </button>
        </div>
      </div>
      
      <div className="space-y-4 divide-y divide-gray-700/70">
        {filteredReports.length > 0 ? (
          filteredReports.map((report, i) => (
            <div key={i} className="pt-4 first:pt-0">
              <div className="flex justify-between">
                <div className="font-medium text-blue-300">
                  {report.river} - {report.section}
                </div>
                <div className="text-xs text-gray-400 bg-gray-800/60 px-2 py-0.5 rounded-full">
                  {report.date}
                </div>
              </div>
              <p className="text-sm my-2 text-gray-300">{report.report}</p>
              {report.flies && report.flies.length > 0 && (
                <div className="flex flex-wrap mt-2">
                  {report.flies.map((fly, j) => (
                    <span key={j} className="text-xs bg-green-900/30 text-green-200 border border-green-800/50 rounded-full px-2 py-0.5 mr-1 mb-1">
                      <Fish size={10} className="inline mr-0.5 text-green-400" /> {fly}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-4">
            No reports available for the selected river.
          </p>
        )}
      </div>
    </div>
  );
}
