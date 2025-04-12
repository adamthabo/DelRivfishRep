import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { RefreshCw } from 'lucide-react';

// Default coordinates for Upper Delaware region
const DEFAULT_COORDS = { lat: 41.6, lng: -75.0 };

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
    { refreshInterval: 60 * 60 * 1000 } // 1 hour
  );
  
  const refreshWeather = () => {
    mutate();
  };
  
  // Get appropriate weather emoji based on condition
  const getWeatherEmoji = (condition) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('rain') || conditionLower.includes('shower')) return '🌧️';
    if (conditionLower.includes('snow')) return '❄️';
    if (conditionLower.includes('cloud') && conditionLower.includes('part')) return '⛅';
    if (conditionLower.includes('cloud')) return '☁️';
    if (conditionLower.includes('sun') || conditionLower.includes('clear')) return '☀️';
    if (conditionLower.includes('thunder') || conditionLower.includes('storm')) return '⛈️';
    if (conditionLower.includes('fog') || conditionLower.includes('haz')) return '🌫️';
    return '⛅'; // Default
  };
  
  // Loading state
  if (!weather && !error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
        <h3 className="font-bold text-lg mb-2">Weather Forecast</h3>
        <div className="h-20 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-5 gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-bold text-lg mb-2">Weather Forecast</h3>
        <div className="p-4 bg-red-50 text-red-700 rounded mb-4">
          Error loading weather data. Please try again later.
        </div>
        <button 
          onClick={refreshWeather}
          className="text-sm text-blue-600 flex items-center hover:text-blue-800"
        >
          <RefreshCw size={12} className="mr-1" />
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">Weather Forecast</h3>
        <button 
          onClick={refreshWeather}
          className="text-xs text-gray-600 flex items-center hover:text-blue-600"
        >
          <RefreshCw size={12} className="mr-1" />
          Refresh
        </button>
      </div>
      
      <div className="flex items-center mb-4 p-2 bg-blue-50 rounded">
        <div className="text-3xl font-bold mr-4">{weather.current.temp}°F</div>
        <div>
          <div className="font-medium">{weather.current.condition}</div>
          <div className="text-sm text-gray-600">
            Precip: {weather.current.precipitation} • Wind: {weather.current.wind}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {weather.forecast.map((day, i) => (
          <div key={i} className="text-center text-sm">
            <div className="font-medium">{day.day}</div>
            <div className="my-1 text-xl">{getWeatherEmoji(day.condition)}</div>
            <div className="font-medium">{day.high}° <span className="text-gray-500 font-normal">{day.low}°</span></div>
            <div className="text-xs text-gray-600">{day.precipitation}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
