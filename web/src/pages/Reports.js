import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp,
  Target,
  Flower2,
  Apple,
  BarChart3,
  Clock,
  Sparkles
} from 'lucide-react';
import { reportsAPI } from '../services/api';
import { PlantLoader, TomatoStatus, UniversalLoader } from '../components/loaders';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await reportsAPI.getAll({ limit: 50 });
      setReports(response.data.reports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = async (reportId) => {
    if (expandedId === reportId) {
      setExpandedId(null);
      setSelectedReport(null);
    } else {
      try {
        const response = await reportsAPI.getById(reportId);
        console.log('Full report data:', response.data); // Debug log
        setSelectedReport(response.data.report); // Access the 'report' property
        setExpandedId(reportId);
      } catch (error) {
        console.error('Error loading report details:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <UniversalLoader isLoading={loading} loadingText="Loading your reports...">
      <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Analysis Reports 📊</h1>
        <p className="text-gray-600">View your crop analysis history and insights</p>
      </motion.div>

      {reports.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-12"
        >
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reports Yet</h3>
          <p className="text-gray-500">Start analyzing your crops to see reports here</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => handleExpand(report.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <img
                    src={report.imageUrl}
                    alt="Crop"
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        report.stage === 'Flower'
                          ? 'bg-pink-100 text-pink-700'
                          : report.stage === 'Fruit'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {report.stage}
                      </span>
                      <span className="text-sm text-gray-500">
                        {(report.confidence * 100).toFixed(1)}% confidence
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-2">{report.healthSummary}</p>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(report.createdAt)}
                    </div>
                  </div>
                </div>

                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  {expandedId === report.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>

              <AnimatePresence>
                {expandedId === report.id && selectedReport && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-6 pt-6 border-t border-gray-200"
                  >
                    <div className="space-y-6">
                      {/* Large Image and Overall Stage */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-xl overflow-hidden bg-gray-900 h-96">
                          <img
                            src={selectedReport.imageUrl}
                            alt="Analysis"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col justify-center items-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-700 mb-4">Overall Stage</h3>
                          <TomatoStatus 
                            type={selectedReport.overallStage || selectedReport.stage} 
                            size={200} 
                          />
                          <p className="text-2xl font-bold text-gray-800 mt-4 capitalize">
                            {(selectedReport.overallStage || selectedReport.stage)?.replace(/_/g, ' ')}
                          </p>
                          <div className="mt-6 w-full space-y-3 bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">Est. Yield:</span>
                              <span className="text-lg font-bold text-green-700">{selectedReport.yieldKg || 0} kg</span>
                            </div>
                            <div className="flex justify-between items-center border-t pt-2">
                              <span className="text-sm font-medium text-gray-600">Est. Earnings:</span>
                              <span className="text-lg font-bold text-green-700">₹{selectedReport.estimatedEarnings || 0}</span>
                            </div>
                            <div className="flex justify-between items-center border-t pt-2">
                              <span className="text-sm font-medium text-gray-600">Market Price:</span>
                              <span className="text-lg font-bold text-gray-700">₹{selectedReport.marketPricePerKg || selectedReport.marketPrice || 0}/kg</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Class Breakdown */}
                      {selectedReport.classCounts && Object.keys(selectedReport.classCounts).length > 0 && (
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 shadow-lg">
                          <h4 className="font-bold text-gray-800 text-xl mb-5 flex items-center">
                            <BarChart3 className="w-6 h-6 mr-2 text-indigo-600" />
                            Tomato Class Distribution
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(selectedReport.classCounts)
                              .sort((a, b) => b[1] - a[1]) // Sort by count descending
                              .map(([cls, count]) => {
                                // Determine color based on class
                                let bgColor = 'bg-gray-100';
                                let textColor = 'text-gray-700';
                                let badgeColor = 'bg-gray-600';
                                
                                if (cls.includes('fully_ripened')) {
                                  bgColor = 'bg-red-50';
                                  textColor = 'text-red-700';
                                  badgeColor = 'bg-red-600';
                                } else if (cls.includes('half_ripened')) {
                                  bgColor = 'bg-orange-50';
                                  textColor = 'text-orange-700';
                                  badgeColor = 'bg-orange-600';
                                } else if (cls.includes('green')) {
                                  bgColor = 'bg-green-50';
                                  textColor = 'text-green-700';
                                  badgeColor = 'bg-green-600';
                                } else if (cls.includes('flower') || cls === 'b_green') {
                                  bgColor = 'bg-pink-50';
                                  textColor = 'text-pink-700';
                                  badgeColor = 'bg-pink-600';
                                }
                                
                                return (
                                  <motion.div 
                                    key={cls} 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`${bgColor} rounded-lg p-4 shadow-md border-2 border-white`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className={`text-sm font-bold capitalize ${textColor}`}>
                                        {cls.replace(/_/g, ' ')}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-600">Count:</span>
                                      <span className={`${badgeColor} text-white px-3 py-1 rounded-full text-base font-bold`}>
                                        {count}
                                      </span>
                                    </div>
                                  </motion.div>
                                );
                              })}
                          </div>
                        </div>
                      )}

                      {/* Analysis Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            <span className="text-sm text-gray-600">Overall Confidence</span>
                          </div>
                          <p className="text-3xl font-bold text-blue-600">
                            {selectedReport.confidence?.toFixed(1) || 0}%
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <BarChart3 className="w-5 h-5 text-purple-600" />
                            <span className="text-sm text-gray-600">Total Detections</span>
                          </div>
                          <p className="text-3xl font-bold text-purple-600">
                            {selectedReport.detections || 0}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-gray-600">Processing Time</span>
                          </div>
                          <p className="text-3xl font-bold text-green-600">
                            {selectedReport.processingTime?.toFixed(2) || 0}s
                          </p>
                        </div>
                      </div>

                      {/* Growth Stage Analysis */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Flower2 className="w-5 h-5 text-pink-600" />
                              <span className="font-semibold text-gray-800">Flowering Stage</span>
                            </div>
                            <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              {selectedReport.floweringResults?.detections || 0}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div
                              className="bg-gradient-to-r from-pink-500 to-rose-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${selectedReport.floweringResults?.confidence || 0}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-600">
                            Confidence: {selectedReport.floweringResults?.confidence?.toFixed(1) || 0}%
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Apple className="w-5 h-5 text-orange-600" />
                              <span className="font-semibold text-gray-800">Fruiting Stage</span>
                            </div>
                            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              {selectedReport.fruitingResults?.detections || 0}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${selectedReport.fruitingResults?.confidence || 0}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-600">
                            Confidence: {selectedReport.fruitingResults?.confidence?.toFixed(1) || 0}%
                          </p>
                        </div>
                      </div>

                      {/* Detailed Breakdown by Type */}
                      {selectedReport.detections > 0 && (
                        <div className="space-y-6">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <BarChart3 className="w-5 h-5 mr-2 text-gray-600" />
                            Detailed Detection Breakdown
                          </h4>

                          {/* Flowers Section */}
                          {Array.isArray(selectedReport.allDetections) && selectedReport.allDetections.filter(d => 
                            d.class.includes('flower') || 
                            d.class.includes('bloom') || 
                            d.class.includes('blossom') ||
                            d.class === 'b_green'
                          ).length > 0 && (
                            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-5">
                              <div className="flex items-center space-x-2 mb-4">
                                <Flower2 className="w-6 h-6 text-pink-600" />
                                <h5 className="font-bold text-gray-800 text-lg">
                                  Flowers Detected ({selectedReport.allDetections.filter(d => 
                                    d.class.includes('flower') || 
                                    d.class.includes('bloom') || 
                                    d.class.includes('blossom') ||
                                    d.class === 'b_green'
                                  ).length})
                                </h5>
                              </div>
                              <div className="space-y-3 max-h-64 overflow-y-auto">
                                {selectedReport.allDetections
                                  .filter(d => 
                                    d.class.includes('flower') || 
                                    d.class.includes('bloom') || 
                                    d.class.includes('blossom') ||
                                    d.class === 'b_green'
                                  )
                                  .map((det, idx) => (
                                    <motion.div
                                      key={idx}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.05 }}
                                      className="bg-white rounded-lg p-4 shadow-sm"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                          <TomatoStatus type="flower" size={40} />
                                          <span className="font-semibold capitalize text-gray-800">
                                            Flower #{idx + 1}: {det.class.replace(/_/g, ' ')}
                                          </span>
                                        </div>
                                        <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                          {(det.confidence * 100).toFixed(1)}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                        <div
                                          className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full"
                                          style={{ width: `${det.confidence * 100}%` }}
                                        />
                                      </div>
                                      {det.x && det.y && (
                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                          <div>
                                            <span className="font-medium">Position:</span> x:{det.x}, y:{det.y}
                                          </div>
                                          <div>
                                            <span className="font-medium">Size:</span> {det.width}×{det.height}px
                                          </div>
                                        </div>
                                      )}
                                    </motion.div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Fruits Section */}
                          {Array.isArray(selectedReport.allDetections) && selectedReport.allDetections.filter(d => 
                            (d.class.includes('fruit') || 
                            d.class.includes('berry') || 
                            d.class.includes('ripened') ||
                            (d.class.includes('green') && d.class !== 'b_green') ||
                            d.class.includes('half') ||
                            d.class.includes('fully'))
                          ).length > 0 && (
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5">
                              <div className="flex items-center space-x-2 mb-4">
                                <Apple className="w-6 h-6 text-orange-600" />
                                <h5 className="font-bold text-gray-800 text-lg">
                                  Fruits Detected ({selectedReport.allDetections.filter(d => 
                                    (d.class.includes('fruit') || 
                                    d.class.includes('berry') || 
                                    d.class.includes('ripened') ||
                                    (d.class.includes('green') && d.class !== 'b_green') ||
                                    d.class.includes('half') ||
                                    d.class.includes('fully'))
                                  ).length})
                                </h5>
                              </div>
                              <div className="space-y-3 max-h-64 overflow-y-auto">
                                {selectedReport.allDetections
                                  .filter(d => 
                                    (d.class.includes('fruit') || 
                                    d.class.includes('berry') || 
                                    d.class.includes('ripened') ||
                                    (d.class.includes('green') && d.class !== 'b_green') ||
                                    d.class.includes('half') ||
                                    d.class.includes('fully'))
                                  )
                                  .map((det, idx) => (
                                    <motion.div
                                      key={idx}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.05 }}
                                      className="bg-white rounded-lg p-4 shadow-sm"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                          <TomatoStatus type={det.class} size={40} />
                                          <span className="font-semibold capitalize text-gray-800">
                                            Fruit #{idx + 1}: {det.class.replace(/_/g, ' ')}
                                          </span>
                                        </div>
                                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                          {(det.confidence * 100).toFixed(1)}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                        <div
                                          className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full"
                                          style={{ width: `${det.confidence * 100}%` }}
                                        />
                                      </div>
                                      {det.x && det.y && (
                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                          <div>
                                            <span className="font-medium">Position:</span> x:{det.x}, y:{det.y}
                                          </div>
                                          <div>
                                            <span className="font-medium">Size:</span> {det.width}×{det.height}px
                                          </div>
                                        </div>
                                      )}
                                    </motion.div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Summary if no detailed detections available */}
                          {(!Array.isArray(selectedReport.allDetections) || selectedReport.allDetections.length === 0) && (
                            <div className="bg-gray-50 rounded-xl p-6 text-center">
                              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-600 font-medium">
                                {selectedReport.detections} objects detected
                              </p>
                              <p className="text-sm text-gray-500 mt-2">
                                {selectedReport.floweringResults?.detections || 0} flowering • {' '}
                                {selectedReport.fruitingResults?.detections || 0} fruiting
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Recommendations */}
                      {selectedReport.recommendations && selectedReport.recommendations.length > 0 && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                            <Sparkles className="w-5 h-5 mr-2 text-green-600" />
                            Recommendations
                          </h4>
                          <div className="space-y-3">
                            {selectedReport.recommendations.map((rec, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-start space-x-3 bg-white rounded-lg p-3"
                              >
                                <span className="text-green-600 text-xl mt-0.5">✓</span>
                                <span className="text-gray-700 flex-1">{rec}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Model Version:</span>
                            <span className="ml-2 font-medium text-gray-800">
                              {selectedReport.modelVersion || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Analysis Date:</span>
                            <span className="ml-2 font-medium text-gray-800">
                              {formatDate(selectedReport.analysisDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
      </div>
    </UniversalLoader>
  );
};

export default Reports;
