import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { RefreshCw, CloudRain, Cloud, Sun, CloudSun, Umbrella, Wind as WindIcon } from 'lucide-react';

// Default coordinates for Upper Delaware region
const DEFAULT_COORDS = { lat: 41.6, lng: -75.0 };

// Mock weather data for fallback
const MOCK_WEATHER = {
  current: {
    temp: 58,
    condition: "Partly Cloudy",
    precipitation: "0%",
    wind: "SW 5 mph"
  },
  forecast: [
    { day: "Today", high: 62, low: 45, condition: "Partly Cloudy", precipitation: "10%" },
    { day: "Thu", high: 64, low: 48, condition: "Mostly Sunny", precipitation: "5%" },
    { day: "Fri", high: 59, low: 52, condition: "Rain", precipitation: "70%" },
    { day: "Sat", high: 55, low: 45, condition: "Showers", precipitation: "40%" },
    { day: "Sun", high: 60, low: 44, condition: "Partly Cloudy", precipitation: "20%" }
  ]
};

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
    console.error('Error fetching weather data:', error);
    return MOCK_WEATHER; // Return mock data on error
  }
};

export default function WeatherForecast() {
  const [coordinates, setCoordinates] = useState(DEFAULT_COORDS);
  
  // Get user location if available
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        // On error, keep default coordinates
        () => {}
      );
    }
  }, []);
  
  // Fetch weather data
  const { data: weather, error, mutate } = useSWR(
    `/api/weather/${coordinates.lat}/${coordinates.lng}`,
    fetcher,
    { 
      refreshInterval: 60 * 60 * 1000, // 1 hour
      fallbackData: MOCK_WEATHER // Use mock data while loading
    }
  );
  
  const refreshWeather = () => {
    mutate();
  };
  
  // Get weather icon based on condition
  const getWeatherIcon = (condition, size = 24) => {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('rain') || conditionLower.includes('shower')) {
      return <CloudRain size={size} className="text-blue-400" />;
    }
    if (conditionLower.includes('cloud') && conditionLower.includes('part')) {
      return <CloudSun size={size} className="text-yellow-300" />;
    }
    if (conditionLower.includes('cloud')) {
      return <Cloud size={size} className="text-gray-400" />;
    }
    if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
      return <Sun size={size} className="text-yellow-400" />;
    }
    
    // Default icon
    return <CloudSun size={size} className="text-gray-400" />;
  };
  
  // Loading state
  if (!weather && !error) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl p-4 animate-pulse-glow border border-gray-700">
        <h3 className="font-bold text-lg mb-2 text-gray-100">Weather Forecast</h3>
        <div className="h-20 bg-gray-700 rounded-md mb-4"></div>
        <div className="grid grid-cols-5 gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error && !weather) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl p-4 border border-gray-700">
        <h3 className="font-bold text-lg mb-2 text-gray-100">Weather Forecast</h3>
        <div className="p-4 bg-red-900/30 text-red-300 rounded-md mb-4 border border-red-800/50">
          Error loading weather data. Please try again later.
        </div>
        <button 
          onClick={refreshWeather}
          className="text-sm text-blue-400 flex items-center hover:text-blue-300"
        >
          <RefreshCw size={12} className="mr-1" />
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl p-4 border border-gray-700 card-glow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg text-blue-300">Weather Forecast</h3>
        <button 
          onClick={refreshWeather}
          className="text-xs text-gray-400 hover:text-blue-300 flex items-center transition-colors"
        >
          <RefreshCw size={12} className="mr-1" />
          Refresh
        </button>
      </div>
      
      <div className="flex items-center mb-4 p-3 bg-gray-800/60 rounded-md border border-gray-700/70">
        <div className="mr-4">
          {getWeatherIcon(weather.current.condition, 42)}
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-100">{weather.current.temp}°F</div>
          <div className="font-medium text-blue-300">{weather.current.condition}</div>
          <div className="text-sm text-gray-400 flex flex-wrap items-center gap-x-3 mt-1">
            <span className="flex items-center">
              <Umbrella size={12} className="mr-1 text-blue-400" />
              {weather.current.precipitation}
            </span>
            <span className="flex items-center">
              <WindIcon size={12} className="mr-1 text-blue-400" />
              {weather.current.wind}
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {weather.forecast.map((day, i) => (
          <div key={i} className="text-center p-2 bg-gray-800/40 rounded-md border border-gray-700/50 hover:bg-gray-800/70 transition-colors">
            <div className="font-medium text-gray-300 text-xs">{day.day}</div>
            <div className="my-1">
              {getWeatherIcon(day.condition, 20)}
            </div>
            <div className="font-medium text-gray-100 text-sm">{day.high}° <span className="text-gray-500 font-normal">{day.low}°</span></div>
            <div className="text-xs text-blue-400">{day.precipitation}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
