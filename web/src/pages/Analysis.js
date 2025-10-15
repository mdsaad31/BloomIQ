import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { analysisAPI } from '../services/api';
import { PlantLoader } from '../components/loaders';

const Analysis = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await analysisAPI.analyze(formData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Crop Analysis 📸</h1>
        <p className="text-gray-600">Upload or capture an image of your crop for AI analysis</p>
      </motion.div>

      <div className="space-y-6">
        {/* Image Upload Section */}
        {!imagePreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            <div className="text-center">
              <div className="flex justify-center space-x-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center w-40 h-40 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl text-white cursor-pointer hover:shadow-xl transition-shadow"
                >
                  <Upload className="w-12 h-12 mb-2" />
                  <span className="font-semibold">Upload Image</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    fileInputRef.current?.setAttribute('capture', 'environment');
                    fileInputRef.current?.click();
                  }}
                  className="flex flex-col items-center justify-center w-40 h-40 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl text-white cursor-pointer hover:shadow-xl transition-shadow"
                >
                  <Camera className="w-12 h-12 mb-2" />
                  <span className="font-semibold">Take Photo</span>
                </motion.button>
              </div>

              <p className="text-gray-500 text-sm">
                Supported formats: JPG, PNG • Max size: 10MB
              </p>
            </div>
          </motion.div>
        )}

        {/* Image Preview and Analysis */}
        <AnimatePresence>
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Selected Image</h2>
                <button
                  onClick={handleReset}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden mb-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-auto max-h-96 object-contain bg-gray-100"
                />
              </div>

              {!result && !analyzing && (
                <button
                  onClick={handleAnalyze}
                  className="btn-primary w-full"
                >
                  Analyze Crop Stage
                </button>
              )}

              {analyzing && (
                <div className="text-center py-8">
                  <PlantLoader size={200} text="Analyzing your crop..." />
                  <p className="text-gray-500 text-sm mt-4">This may take a few seconds</p>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Summary Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="card bg-gradient-to-br from-green-500 to-emerald-600 text-white"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <CheckCircle className="w-12 h-12" />
                  <div>
                    <h3 className="text-2xl font-bold">Analysis Complete!</h3>
                    <p className="text-green-100">Stage detected successfully</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-green-100 text-sm mb-1">Overall Stage</p>
                    <p className="text-xl font-bold capitalize">{result.overallStage?.replace(/_/g, ' ') || result.stage}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-green-100 text-sm mb-1">Confidence</p>
                    <p className="text-xl font-bold">{result.confidence?.toFixed(1)}%</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-green-100 text-sm mb-1">Est. Yield</p>
                    <p className="text-xl font-bold">{result.yieldKg || 0} kg</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-green-100 text-sm mb-1">Est. Earnings</p>
                    <p className="text-xl font-bold">₹{result.estimatedEarnings || 0}</p>
                  </div>
                </div>
              </motion.div>

              {/* Detection Results */}
              <div className="card">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🔍 Detection Results</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-medium">🌸 Flowering Stage</span>
                      <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {result.floweringResults?.detections || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${result.floweringResults?.confidence || 0}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Confidence: {(result.floweringResults?.confidence || 0).toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-medium">🍎 Fruiting Stage</span>
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {result.fruitingResults?.detections || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${result.fruitingResults?.confidence || 0}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Confidence: {(result.fruitingResults?.confidence || 0).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Detections</p>
                      <p className="text-3xl font-bold text-blue-600">{result.detections || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Overall Confidence</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {result.confidence?.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Class Breakdown */}
                {result.classCounts && Object.keys(result.classCounts).length > 0 && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 mb-6 shadow-lg">
                    <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                      <span className="mr-2">📊</span> Tomato Class Distribution
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(result.classCounts)
                        .sort((a, b) => b[1] - a[1])
                        .map(([cls, count]) => {
                          let bgColor = 'bg-gray-50';
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

                <h4 className="font-semibold text-gray-700 mb-3">📋 All Detections</h4>
                <div className="max-h-64 overflow-y-auto space-y-2 mb-6">
                  {result.all_detections && result.all_detections.length > 0 ? (
                    result.all_detections.map((detection, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium text-gray-800 capitalize">
                              {detection.class?.replace(/_/g, ' ')}
                            </span>
                            {detection.bbox && (
                              <span className="text-xs text-gray-500 ml-2">
                                @ ({Math.round(detection.x)}, {Math.round(detection.y)})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${(detection.confidence * 100).toFixed(0)}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-600 w-12 text-right">
                              {(detection.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No detections found</p>
                  )}
                </div>

                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="text-green-600 mr-2">💡</span>
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start space-x-2"
                        >
                          <span className="text-green-600 mt-1 text-lg">✓</span>
                          <span className="text-gray-700">{rec}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={handleReset}
                  className="btn-secondary w-full mt-6"
                >
                  Analyze Another Image
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Analysis;
