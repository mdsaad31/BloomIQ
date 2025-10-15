import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import {reportsAPI} from '../services/api';

interface Report {
  _id: string;
  imageUrl: string;
  stage: string;
  overallStage: string;
  confidence: number;
  detections: number;
  yieldKg: number;
  estimatedEarnings: number;
  marketPricePerKg: number;
  classCounts: Record<string, number>;
  all_detections: Array<any>;
  createdAt: string;
}

const ReportsScreen = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await reportsAPI.getReports();
      setReports(response.data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  const deleteReport = async (reportId: string) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await reportsAPI.deleteReport(reportId);
              setReports(reports.filter(r => r._id !== reportId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete report');
            }
          },
        },
      ]
    );
  };

  const toggleExpanded = (reportId: string) => {
    setExpandedReport(expandedReport === reportId ? null : reportId);
  };

  const getStageEmoji = (stage: string) => {
    if (stage.includes('flowering')) return '🌸';
    if (stage.includes('fruiting')) return '🍅';
    if (stage.includes('ripened')) return '🍎';
    if (stage.includes('green')) return '🟢';
    return '🌱';
  };

  const getClassColor = (className: string) => {
    if (className.includes('fully_ripened')) return '#EF4444';
    if (className.includes('half_ripened')) return '#F97316';
    if (className.includes('green')) return '#10B981';
    if (className.includes('flower') || className === 'b_green') return '#EC4899';
    return '#6B7280';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  if (reports.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>No Reports Yet</Text>
        <Text style={styles.emptySubtitle}>
          Your analysis reports will appear here
        </Text>
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
        <Text style={styles.title}>📊 Analysis Reports</Text>
        <Text style={styles.subtitle}>
          {reports.length} report{reports.length !== 1 ? 's' : ''} available
        </Text>

        <View style={styles.reportsList}>
          {reports.map((report) => (
            <View key={report._id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Image
                  source={{uri: report.imageUrl}}
                  style={styles.reportImage}
                />
                <View style={styles.reportInfo}>
                  <View style={styles.reportStage}>
                    <Text style={styles.stageEmoji}>
                      {getStageEmoji(report.overallStage || report.stage)}
                    </Text>
                    <Text style={styles.stageName}>
                      {(report.overallStage || report.stage)?.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.reportDate}>
                    {new Date(report.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.reportConfidence}>
                    Confidence: {report.confidence?.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.reportActions}>
                  <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() => toggleExpanded(report._id)}
                  >
                    <Text style={styles.expandButtonText}>
                      {expandedReport === report._id ? '↑' : '↓'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteReport(report._id)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {expandedReport === report._id && (
                <View style={styles.expandedContent}>
                  {/* Yield and Earnings */}
                  <View style={styles.yieldCard}>
                    <Text style={styles.sectionTitle}>💰 Yield & Earnings</Text>
                    <View style={styles.yieldGrid}>
                      <View style={styles.yieldItem}>
                        <Text style={styles.yieldLabel}>Estimated Yield</Text>
                        <Text style={styles.yieldValue}>{report.yieldKg || 0} kg</Text>
                      </View>
                      <View style={styles.yieldItem}>
                        <Text style={styles.yieldLabel}>Estimated Earnings</Text>
                        <Text style={styles.yieldValue}>₹{report.estimatedEarnings || 0}</Text>
                      </View>
                      <View style={styles.yieldItem}>
                        <Text style={styles.yieldLabel}>Market Price</Text>
                        <Text style={styles.yieldValue}>₹{report.marketPricePerKg || 5}/kg</Text>
                      </View>
                      <View style={styles.yieldItem}>
                        <Text style={styles.yieldLabel}>Total Detections</Text>
                        <Text style={styles.yieldValue}>{report.detections || 0}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Class Breakdown */}
                  {report.classCounts && Object.keys(report.classCounts).length > 0 && (
                    <View style={styles.classSection}>
                      <Text style={styles.sectionTitle}>🎯 Class Breakdown</Text>
                      <View style={styles.classGrid}>
                        {Object.entries(report.classCounts)
                          .sort((a, b) => (b[1] as number) - (a[1] as number))
                          .map(([className, count]) => (
                            <View 
                              key={className}
                              style={[
                                styles.classCard,
                                {backgroundColor: getClassColor(className) + '20'}
                              ]}
                            >
                              <Text style={styles.className}>
                                {className.replace(/_/g, ' ').toUpperCase()}
                              </Text>
                              <View 
                                style={[
                                  styles.classCount,
                                  {backgroundColor: getClassColor(className)}
                                ]}
                              >
                                <Text style={styles.classCountText}>{count as number}</Text>
                              </View>
                            </View>
                          ))}
                      </View>
                    </View>
                  )}

                  {/* All Detections */}
                  {report.all_detections && report.all_detections.length > 0 && (
                    <View style={styles.detectionsSection}>
                      <Text style={styles.sectionTitle}>
                        📋 All Detections ({report.all_detections.length})
                      </Text>
                      <View style={styles.detectionsList}>
                        {report.all_detections.slice(0, 5).map((detection, index) => (
                          <View key={index} style={styles.detectionItem}>
                            <Text style={styles.detectionClass}>
                              {detection.class?.replace(/_/g, ' ').toUpperCase()}
                            </Text>
                            <View style={styles.detectionConfidence}>
                              <View style={styles.confidenceBar}>
                                <View 
                                  style={[
                                    styles.confidenceFill,
                                    {width: `${(detection.confidence * 100).toFixed(0)}%`}
                                  ]}
                                />
                              </View>
                              <Text style={styles.confidenceText}>
                                {(detection.confidence * 100).toFixed(0)}%
                              </Text>
                            </View>
                          </View>
                        ))}
                        {report.all_detections.length > 5 && (
                          <Text style={styles.moreDetections}>
                            +{report.all_detections.length - 5} more detections
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  reportsList: {
    gap: 16,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reportImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportStage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stageEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  stageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  reportDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  reportConfidence: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  reportActions: {
    alignItems: 'center',
    gap: 8,
  },
  expandButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
    minWidth: 36,
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 8,
    minWidth: 36,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 16,
  },
  yieldCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  yieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  yieldItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  yieldLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  yieldValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  classSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  classCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  className: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  classCount: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  classCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detectionsSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  detectionsList: {
    gap: 8,
  },
  detectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  detectionClass: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  detectionConfidence: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    gap: 8,
  },
  confidenceBar: {
    backgroundColor: '#E5E7EB',
    height: 6,
    borderRadius: 3,
    flex: 1,
  },
  confidenceFill: {
    backgroundColor: '#10B981',
    height: '100%',
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  moreDetections: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ReportsScreen;