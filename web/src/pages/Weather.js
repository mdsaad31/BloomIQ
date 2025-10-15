import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Cloud, 
  Thermometer, 
  Droplets, 
  Wind, 
  CloudRain, 
  Sun,
  Sparkles
} from 'lucide-react';
import { weatherAPI } from '../services/api';

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      const response = await weatherAPI.getCurrent({});
      setWeather(response.data);
    } catch (error) {
      console.error('Error loading weather:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-dots text-green-500">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="card text-center py-12">
        <Cloud className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Weather Unavailable</h3>
        <p className="text-gray-500">Unable to load weather data</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Weather Insights ☁️</h1>
        <p className="text-gray-600">Current conditions and farming recommendations</p>
      </motion.div>

      <div className="space-y-6">
        {/* Current Weather Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card bg-gradient-to-br from-blue-500 to-cyan-600 text-white"
        >
          <div className="text-center mb-6">
            <Sun className="w-20 h-20 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-2">{weather.location}</h2>
            <p className="text-blue-100 capitalize text-lg">{weather.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <Thermometer className="w-8 h-8 mx-auto mb-2 opacity-90" />
              <p className="text-blue-100 text-sm mb-1">Temperature</p>
              <p className="text-3xl font-bold">{weather.temperature}°C</p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 text-center">
              <Droplets className="w-8 h-8 mx-auto mb-2 opacity-90" />
              <p className="text-blue-100 text-sm mb-1">Humidity</p>
              <p className="text-3xl font-bold">{weather.humidity}%</p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 text-center">
              <CloudRain className="w-8 h-8 mx-auto mb-2 opacity-90" />
              <p className="text-blue-100 text-sm mb-1">Rain Chance</p>
              <p className="text-3xl font-bold">{weather.rainfall_probability}%</p>
            </div>
          </div>
        </motion.div>

        {/* Recommendations Card */}
        {weather.recommendations && weather.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">Farming Recommendations</h2>
            </div>

            <div className="space-y-3">
              {weather.recommendations.map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl"
                >
                  <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {idx + 1}
                  </span>
                  <p className="text-gray-700 flex-1">{rec}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Weather Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Droplets className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-800">Watering Guide</h3>
            </div>
            <div className="space-y-2">
              {weather.rainfall_probability > 60 ? (
                <>
                  <p className="text-gray-600">⚠️ High chance of rain today</p>
                  <p className="text-gray-600">Skip watering and let nature do the work</p>
                </>
              ) : weather.temperature > 30 ? (
                <>
                  <p className="text-gray-600">☀️ Hot weather ahead</p>
                  <p className="text-gray-600">Water early morning or evening</p>
                  <p className="text-gray-600">Increase watering frequency</p>
                </>
              ) : (
                <>
                  <p className="text-gray-600">✅ Good conditions for watering</p>
                  <p className="text-gray-600">Maintain regular schedule</p>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Sun className="w-6 h-6 text-yellow-600" />
              <h3 className="text-xl font-bold text-gray-800">Growing Conditions</h3>
            </div>
            <div className="space-y-2">
              {weather.temperature >= 15 && weather.temperature <= 30 ? (
                <p className="text-green-600 font-semibold">✓ Ideal temperature range</p>
              ) : (
                <p className="text-orange-600 font-semibold">⚠ Temperature outside optimal range</p>
              )}
              
              {weather.humidity >= 40 && weather.humidity <= 70 ? (
                <p className="text-green-600 font-semibold">✓ Optimal humidity levels</p>
              ) : (
                <p className="text-orange-600 font-semibold">⚠ Humidity needs attention</p>
              )}
              
              <p className="text-gray-600 mt-3">
                Monitor your crops daily for best results
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
