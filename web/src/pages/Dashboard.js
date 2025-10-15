import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Camera, 
  FileText, 
  Cloud, 
  TrendingUp, 
  Thermometer, 
  Droplets,
  CloudRain,
  Sparkles,
  CheckCircle,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analysisAPI, weatherAPI, reportsAPI } from '../services/api';
import { PlantLoader, UniversalLoader } from '../components/loaders';

// Recent Reports Component
const LoadRecentReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await reportsAPI.getAll({ limit: 3 });
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Error loading recent reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <PlantLoader size={80} text="Loading reports..." />
      </div>
    );
  }

  if (reports.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Latest Reports</h3>
      {reports.map((report, idx) => (
        <Link key={report.id} to="/reports">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02, x: 5 }}
            className="flex items-center space-x-4 p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
          >
            {report.imageUrl && (
              <img
                src={report.imageUrl}
                alt="Crop"
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  report.stage === 'flowering'
                    ? 'bg-pink-100 text-pink-700'
                    : report.stage === 'fruiting'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {report.stage}
                </span>
                <span className="text-xs text-gray-500">
                  {report.confidence?.toFixed(1) || 0}% confidence
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {report.detections || 0} detections • {new Date(report.analysisDate).toLocaleDateString()}
              </p>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400 transform rotate-[-90deg]" />
          </motion.div>
        </Link>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalAnalyses: 0 });
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, weatherRes] = await Promise.all([
        analysisAPI.getStats(),
        weatherAPI.getCurrent({})
      ]);
      
      setStats(statsRes.data);
      setWeather(weatherRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Analyze Now',
      description: 'Capture or upload crop image',
      icon: Camera,
      path: '/analysis',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      title: 'View Reports',
      description: 'Check analysis history',
      icon: FileText,
      path: '/reports',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Check Weather',
      description: 'Weather insights',
      icon: Cloud,
      path: '/weather',
      gradient: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <UniversalLoader isLoading={loading} loadingText="Loading your dashboard...">
      <div className="space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.name}! 🌱
          </h1>
          <p className="text-gray-600">
            Let's monitor your crops and ensure healthy growth
          </p>
        </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card bg-gradient-to-br from-green-500 to-emerald-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 mb-1">Total Analyses</p>
              <p className="text-4xl font-bold">{stats.totalAnalyses}</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-50" />
          </div>
        </motion.div>

        {weather && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="card bg-gradient-to-br from-blue-500 to-cyan-600 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 mb-1">Temperature</p>
                  <p className="text-4xl font-bold">{weather.temperature}°C</p>
                </div>
                <Thermometer className="w-12 h-12 opacity-50" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="card bg-gradient-to-br from-purple-500 to-pink-600 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 mb-1">Humidity</p>
                  <p className="text-4xl font-bold">{weather.humidity}%</p>
                </div>
                <Droplets className="w-12 h-12 opacity-50" />
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={action.path} to={action.path}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`card bg-gradient-to-br ${action.gradient} text-white cursor-pointer`}
                >
                  <Icon className="w-12 h-12 mb-4 opacity-90" />
                  <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                  <p className="text-white/90">{action.description}</p>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📊 Recent Analysis</h2>
          <Link to="/reports" className="text-green-600 hover:text-green-700 font-medium text-sm">
            View All →
          </Link>
        </div>
        
        {stats.totalAnalyses > 0 ? (
          <div className="space-y-4">
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Latest Analysis</p>
                  <p className="text-xl font-bold text-gray-800">
                    {stats.lastAnalysisDate ? new Date(stats.lastAnalysisDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-gray-600 mb-4">
                You've completed <span className="font-bold text-green-600">{stats.totalAnalyses}</span> crop analyses
              </p>
              <Link to="/analysis" className="btn-primary inline-block">
                Start New Analysis
              </Link>
            </div>

            {/* Recent Reports Preview */}
            <LoadRecentReports />
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No analyses yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start analyzing your crops to track their growth stages
            </p>
            <Link to="/analysis" className="btn-primary inline-block">
              Analyze Your First Crop
            </Link>
          </div>
        )}
      </motion.div>

      {/* Weather Info */}
      {weather && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">🌤️ Today's Weather</h2>
            <CloudRain className="w-8 h-8 text-blue-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Cloud className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600">Location:</span>
                <span className="font-semibold">{weather.location}</span>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <Thermometer className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600">Condition:</span>
                <span className="font-semibold capitalize">{weather.description}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CloudRain className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600">Rain Probability:</span>
                <span className="font-semibold">{weather.rainfall_probability}%</span>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-800">Recommendations</h3>
              </div>
              <ul className="space-y-1">
                {weather.recommendations?.slice(0, 3).map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-700">• {rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
      </div>
    </UniversalLoader>
  );
};

export default Dashboard;
