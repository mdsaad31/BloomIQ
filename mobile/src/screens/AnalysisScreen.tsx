import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import {launchImageLibrary, launchCamera, ImagePickerResponse} from 'react-native-image-picker';
import {analysisAPI} from '../services/api';
import {PlantLoader, TomatoStatus} from '../components/loaders';

interface AnalysisResult {
  stage: string;
  overallStage: string;
  confidence: number;
  detections: number;
  yieldKg: number;
  estimatedEarnings: number;
  marketPricePerKg: number;
  classCounts: Record<string, number>;
  all_detections: Array<{
    class: string;
    confidence: number;
    x: number;
    y: number;
  }>;
  recommendations?: string[];
}

const AnalysisScreen = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const selectImage = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to select an image',
      [
        {text: 'Camera', onPress: openCamera},
        {text: 'Gallery', onPress: openGallery},
        {text: 'Cancel', style: 'cancel'},
      ]
    );
  };

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      handleImageResponse
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      },
      handleImageResponse
    );
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel || response.errorMessage) {
      return;
    }

    if (response.assets && response.assets[0]) {
      setSelectedImage(response.assets[0].uri || null);
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: selectedImage,
        type: 'image/jpeg',
        name: 'crop_image.jpg',
      } as any);

      const response = await analysisAPI.analyze(formData);
      setResult(response.data);
    } catch (error: any) {
      Alert.alert(
        'Analysis Failed',
        error.response?.data?.message || 'Failed to analyze image'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setResult(null);
  };

  const getClassColor = (className: string) => {
    if (className.includes('fully_ripened')) return '#EF4444';
    if (className.includes('half_ripened')) return '#F97316';
    if (className.includes('green')) return '#10B981';
    if (className.includes('flower') || className === 'b_green') return '#EC4899';
    return '#6B7280';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🌱 Crop Analysis</Text>
        <Text style={styles.subtitle}>Capture or upload your crop image for AI analysis</Text>

        {!selectedImage ? (
          <View style={styles.uploadContainer}>
            <TouchableOpacity style={styles.uploadButton} onPress={selectImage}>
              <Text style={styles.uploadIcon}>📸</Text>
              <Text style={styles.uploadText}>Select Image</Text>
              <Text style={styles.uploadSubtext}>Camera or Gallery</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageContainer}>
            <Image source={{uri: selectedImage}} style={styles.selectedImage} />
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.resetButton} onPress={resetAnalysis}>
                <Text style={styles.resetButtonText}>Change Image</Text>
              </TouchableOpacity>
              
              {!result && (
                <TouchableOpacity 
                  style={[styles.analyzeButton, analyzing && styles.buttonDisabled]} 
                  onPress={analyzeImage}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <View style={styles.loadingContainer}>
                      <PlantLoader message="Analyzing crop..." size={60} />
                    </View>
                  ) : (
                    <Text style={styles.analyzeButtonText}>Analyze Crop</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {result && (
          <View style={styles.resultsContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.resultTitle}>✅ Analysis Complete!</Text>
              <Text style={styles.resultSubtitle}>Stage detected successfully</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Overall Stage</Text>
                  <Text style={styles.statValue}>
                    {result.overallStage?.replace(/_/g, ' ') || result.stage}
                  </Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Confidence</Text>
                  <Text style={styles.statValue}>{result.confidence?.toFixed(1)}%</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Est. Yield</Text>
                  <Text style={styles.statValue}>{result.yieldKg || 0} kg</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Est. Earnings</Text>
                  <Text style={styles.statValue}>₹{result.estimatedEarnings || 0}</Text>
                </View>
              </View>
            </View>

            {result.classCounts && Object.keys(result.classCounts).length > 0 && (
              <View style={styles.classBreakdown}>
                <Text style={styles.breakdownTitle}>📊 Class Distribution</Text>
                <View style={styles.classGrid}>
                  {Object.entries(result.classCounts)
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .map(([className, count]) => (
                      <View 
                        key={className} 
                        style={[styles.classCard, {backgroundColor: getClassColor(className) + '20'}]}
                      >
                        <Text style={styles.className}>
                          {className.replace(/_/g, ' ').toUpperCase()}
                        </Text>
                        <View 
                          style={[styles.countBadge, {backgroundColor: getClassColor(className)}]}
                        >
                          <Text style={styles.countText}>{count}</Text>
                        </View>
                      </View>
                    ))}
                </View>
              </View>
            )}

            {result.all_detections && result.all_detections.length > 0 && (
              <View style={styles.detectionsList}>
                <Text style={styles.detectionTitle}>📋 All Detections</Text>
                {result.all_detections.slice(0, 10).map((detection, index) => (
                  <View key={index} style={styles.detectionItem}>
                    <Text style={styles.detectionClass}>
                      {detection.class?.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                    <View style={styles.confidenceBar}>
                      <View 
                        style={[
                          styles.confidenceFill,
                          {width: `${Math.round(detection.confidence * 100)}%` as any}
                        ]}
                      />
                    </View>
                    <Text style={styles.confidenceText}>
                      {(detection.confidence * 100).toFixed(0)}%
                    </Text>
                  </View>
                ))}
                {result.all_detections.length > 10 && (
                  <Text style={styles.moreDetections}>
                    +{result.all_detections.length - 10} more detections
                  </Text>
                )}
              </View>
            )}

            {result.recommendations && result.recommendations.length > 0 && (
              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>💡 Recommendations</Text>
                {result.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>✓</Text>
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
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
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  uploadContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    width: '100%',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  imageContainer: {
    marginBottom: 32,
  },
  selectedImage: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#6B7280',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  analyzeButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    gap: 20,
  },
  summaryCard: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 24,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#D1FAE5',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '45%',
  },
  statLabel: {
    fontSize: 12,
    color: '#D1FAE5',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  classBreakdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  classCard: {
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  className: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  countBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detectionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  detectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  detectionClass: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  confidenceBar: {
    backgroundColor: '#E5E7EB',
    height: 8,
    borderRadius: 4,
    flex: 2,
  },
  confidenceFill: {
    backgroundColor: '#10B981',
    height: '100%',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    width: 40,
    textAlign: 'right',
  },
  moreDetections: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  recommendationsContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  recommendationBullet: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: 'bold',
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationText: {
    fontSize: 14,
    color: '#92400E',
    flex: 1,
    lineHeight: 20,
  },
});

export default AnalysisScreen;