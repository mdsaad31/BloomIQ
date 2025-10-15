const express = require('express');
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get weather (main endpoint for mobile)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { lat, lon, city } = req.query;

    // If no location provided, get from user profile
    let location = city;
    if (!location && !lat && !lon) {
      const user = await User.findById(req.userId);
      location = user?.region || 'London';
    }

    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey || apiKey === 'your-weather-api-key') {
      // Return mock data if API key not configured
      return res.json({
        location: {
          name: location || 'Unknown',
          region: '',
          country: 'Mock'
        },
        current: {
          temp_c: 22,
          temp_f: 72,
          condition: {
            text: 'Partly cloudy',
            icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
          },
          humidity: 65,
          wind_kph: 15,
          wind_mph: 9,
          feelslike_c: 22,
          feelslike_f: 72,
          uv: 5,
          precip_mm: 0,
          cloud: 30
        },
        forecast: {
          forecastday: [
            {
              date: new Date().toISOString().split('T')[0],
              day: {
                maxtemp_c: 25,
                mintemp_c: 18,
                avgtemp_c: 22,
                condition: { text: 'Partly cloudy' },
                daily_chance_of_rain: 30
              }
            },
            {
              date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              day: {
                maxtemp_c: 26,
                mintemp_c: 19,
                avgtemp_c: 23,
                condition: { text: 'Sunny' },
                daily_chance_of_rain: 10
              }
            },
            {
              date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
              day: {
                maxtemp_c: 24,
                mintemp_c: 17,
                avgtemp_c: 21,
                condition: { text: 'Cloudy' },
                daily_chance_of_rain: 40
              }
            }
          ]
        }
      });
    }

    // Build WeatherAPI.com URL with forecast
    let query = location;
    if (lat && lon) {
      query = `${lat},${lon}`;
    }
    
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=3&aqi=no`;

    const response = await axios.get(url);
    res.json(response.data);

  } catch (error) {
    console.error('Weather API error:', error.message);
    
    // Return mock data on error
    res.json({
      location: {
        name: req.query.city || 'Unknown',
        region: '',
        country: 'Mock'
      },
      current: {
        temp_c: 22,
        temp_f: 72,
        condition: {
          text: 'Weather data unavailable',
          icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
        },
        humidity: 65,
        wind_kph: 15,
        wind_mph: 9,
        feelslike_c: 22,
        feelslike_f: 72,
        uv: 5,
        precip_mm: 0,
        cloud: 30
      },
      forecast: {
        forecastday: []
      }
    });
  }
});

// Get current weather (legacy endpoint)
router.get('/current', authMiddleware, async (req, res) => {
  try {
    const { lat, lon, city } = req.query;

    // If no location provided, get from user profile
    let location = city;
    if (!location && !lat && !lon) {
      const user = await User.findById(req.userId);
      location = user?.region || 'London';
    }

    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey || apiKey === 'your-weather-api-key') {
      // Return mock data if API key not configured
      return res.json({
        location: location || 'Unknown',
        temperature: 22,
        humidity: 65,
        rainfall_probability: 30,
        description: 'Partly cloudy',
        icon: '02d',
        recommendations: [
          'Good time for watering in the evening',
          'Monitor soil moisture levels',
          'Consider applying fertilizer tomorrow'
        ]
      });
    }

    // Build WeatherAPI.com URL
    let query = location;
    if (lat && lon) {
      query = `${lat},${lon}`;
    }
    
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${query}&aqi=no`;

    const response = await axios.get(url);
    const data = response.data;

    // Generate recommendations based on weather
    const recommendations = generateWeatherRecommendations(data);

    res.json({
      location: data.location.name,
      temperature: Math.round(data.current.temp_c),
      humidity: data.current.humidity,
      rainfall_probability: data.current.precip_mm > 0 ? 80 : data.current.cloud,
      description: data.current.condition.text,
      icon: data.current.condition.icon,
      recommendations
    });

  } catch (error) {
    console.error('Weather API error:', error);
    
    // Return mock data on error
    res.json({
      location: 'Unknown',
      temperature: 22,
      humidity: 65,
      rainfall_probability: 30,
      description: 'Weather data unavailable',
      icon: '02d',
      recommendations: [
        'Check local weather forecast',
        'Monitor plant health regularly'
      ]
    });
  }
});

// Generate recommendations based on weather data
function generateWeatherRecommendations(weatherData) {
  const recommendations = [];
  const temp = weatherData.current.temp_c;
  const humidity = weatherData.current.humidity;
  const rain = weatherData.current.precip_mm;
  const uv = weatherData.current.uv;

  if (temp > 30) {
    recommendations.push('High temperature - increase watering frequency');
    recommendations.push('Consider shade protection for sensitive plants');
  } else if (temp < 10) {
    recommendations.push('Low temperature - protect plants from frost');
    recommendations.push('Reduce watering frequency');
  }

  if (humidity < 40) {
    recommendations.push('Low humidity - mist plants regularly');
  } else if (humidity > 80) {
    recommendations.push('High humidity - watch for fungal diseases');
  }

  if (rain > 0) {
    recommendations.push('Rain detected - skip watering today');
  } else if (rain === 0 && temp > 25) {
    recommendations.push('No rain and warm - water plants in the evening');
  }

  if (uv > 7) {
    recommendations.push('High UV index - provide shade during peak hours');
  }

  if (recommendations.length === 0) {
    recommendations.push('Weather conditions are favorable');
    recommendations.push('Continue regular plant care routine');
  }

  return recommendations;
}

module.exports = router;
