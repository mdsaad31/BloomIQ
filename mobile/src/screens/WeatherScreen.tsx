import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {weatherAPI} from '../services/api';

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
    uv: number;
    feelslike_c: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
        daily_chance_of_rain: number;
      };
    }>;
  };
}

const WeatherScreen = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [city, setCity] = useState('Delhi');
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    loadWeather();
  }, [city]);

  const loadWeather = async () => {
    try {
      const response = await weatherAPI.getWeatherByCity(city);
      setWeather(response.data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load weather data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWeather();
  };

  const searchWeather = () => {
    if (searchCity.trim()) {
      setCity(searchCity.trim());
      setSearchCity('');
    }
  };

  const getWeatherEmoji = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('sunny') || cond.includes('clear')) return '☀️';
    if (cond.includes('cloud')) return '☁️';
    if (cond.includes('rain')) return '🌧️';
    if (cond.includes('storm')) return '⛈️';
    if (cond.includes('snow')) return '❄️';
    if (cond.includes('mist') || cond.includes('fog')) return '🌫️';
    return '🌤️';
  };

  const getCropAdvice = (weather: WeatherData) => {
    const temp = weather.current.temp_c;
    const humidity = weather.current.humidity;
    const uv = weather.current.uv;
    
    const advice = [];
    
    if (temp > 35) {
      advice.push('🌡️ High temperature detected. Ensure adequate irrigation and consider shade nets.');
    } else if (temp < 15) {
      advice.push('🥶 Cool temperature. Monitor for frost damage and consider protective covering.');
    }
    
    if (humidity > 80) {
      advice.push('💧 High humidity levels. Watch for fungal diseases and ensure good ventilation.');
    } else if (humidity < 40) {
      advice.push('🏜️ Low humidity. Increase irrigation frequency and consider mulching.');
    }
    
    if (uv > 8) {
      advice.push('☀️ High UV levels. Consider shade protection during peak hours (10 AM - 4 PM).');
    }
    
    const forecast = weather.forecast.forecastday[0];
    if (forecast.day.daily_chance_of_rain > 70) {
      advice.push('🌧️ High chance of rain today. Delay fertilizer application and check drainage.');
    }
    
    if (advice.length === 0) {
      advice.push('✅ Weather conditions are favorable for crop growth. Continue regular maintenance.');
    }
    
    return advice;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading weather...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter city name"
            value={searchCity}
            onChangeText={setSearchCity}
          />
          <TouchableOpacity style={styles.searchButton} onPress={searchWeather}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>

        {weather && (
          <>
            {/* Current Weather */}
            <View style={styles.currentWeatherCard}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationName}>{weather.location.name}</Text>
                <Text style={styles.locationDetails}>
                  {weather.location.region}, {weather.location.country}
                </Text>
              </View>
              
              <View style={styles.currentWeatherContent}>
                <View style={styles.temperatureSection}>
                  <Text style={styles.weatherEmoji}>
                    {getWeatherEmoji(weather.current.condition.text)}
                  </Text>
                  <Text style={styles.temperature}>
                    {Math.round(weather.current.temp_c)}°C
                  </Text>
                  <Text style={styles.condition}>
                    {weather.current.condition.text}
                  </Text>
                  <Text style={styles.feelsLike}>
                    Feels like {Math.round(weather.current.feelslike_c)}°C
                  </Text>
                </View>
              </View>
              
              <View style={styles.weatherDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>💧</Text>
                  <Text style={styles.detailLabel}>Humidity</Text>
                  <Text style={styles.detailValue}>{weather.current.humidity}%</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>💨</Text>
                  <Text style={styles.detailLabel}>Wind</Text>
                  <Text style={styles.detailValue}>{weather.current.wind_kph} km/h</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>☀️</Text>
                  <Text style={styles.detailLabel}>UV Index</Text>
                  <Text style={styles.detailValue}>{weather.current.uv}</Text>
                </View>
              </View>
            </View>

            {/* Forecast */}
            {weather.forecast && weather.forecast.forecastday && (
              <View style={styles.forecastCard}>
                <Text style={styles.forecastTitle}>📅 3-Day Forecast</Text>
                <View style={styles.forecastList}>
                  {weather.forecast.forecastday.slice(0, 3).map((day, index) => (
                    <View key={day.date} style={styles.forecastItem}>
                      <Text style={styles.forecastDate}>
                        {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', {weekday: 'short'})}
                      </Text>
                      <Text style={styles.forecastEmoji}>
                        {getWeatherEmoji(day.day.condition.text)}
                      </Text>
                      <Text style={styles.forecastTemp}>
                        {Math.round(day.day.maxtemp_c)}° / {Math.round(day.day.mintemp_c)}°
                      </Text>
                      <Text style={styles.forecastCondition}>
                        {day.day.condition.text}
                      </Text>
                      <Text style={styles.forecastRain}>
                        🌧️ {day.day.daily_chance_of_rain}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Crop Advice */}
            <View style={styles.adviceCard}>
              <Text style={styles.adviceTitle}>🌱 Crop Care Recommendations</Text>
              <View style={styles.adviceList}>
                {getCropAdvice(weather).map((advice, index) => (
                  <View key={index} style={styles.adviceItem}>
                    <Text style={styles.adviceText}>{advice}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Additional Tips */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 General Tips</Text>
              <View style={styles.tipsList}>
                <Text style={styles.tipItem}>
                  🌅 Best time for crop inspection: Early morning (6-8 AM)
                </Text>
                <Text style={styles.tipItem}>
                  🚰 Optimal irrigation: Early morning or late evening
                </Text>
                <Text style={styles.tipItem}>
                  🌾 Monitor soil moisture regularly during dry periods
                </Text>
                <Text style={styles.tipItem}>
                  🔄 Update weather data regularly for accurate planning
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
  },
  content: {
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  searchButtonText: {
    fontSize: 20,
  },
  currentWeatherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  locationHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  locationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationDetails: {
    fontSize: 16,
    color: '#6B7280',
  },
  currentWeatherContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  temperatureSection: {
    alignItems: 'center',
  },
  weatherEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  condition: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 4,
  },
  feelsLike: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  forecastCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  forecastList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forecastItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  forecastDate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  forecastEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  forecastTemp: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  forecastCondition: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  forecastRain: {
    fontSize: 10,
    color: '#3B82F6',
  },
  adviceCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 16,
  },
  adviceList: {
    gap: 12,
  },
  adviceItem: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  adviceText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 16,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
    backgroundColor: '#DBEAFE',
    padding: 12,
    borderRadius: 8,
  },
});

export default WeatherScreen;