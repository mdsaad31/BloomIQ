import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {analysisAPI, reportsAPI} from '../services/api';
import {useAuth} from '../context/AuthContext';
import {PlantLoader} from '../components/loaders';

interface Stats {
  totalAnalyses: number;
  recentAnalyses: Array<{
    _id: string;
    overallStage: string;
    confidence: number;
    createdAt: string;
    yieldKg: number;
    estimatedEarnings: number;
  }>;
  stageDistribution: Record<string, number>;
  averageConfidence: number;
  totalYield: number;
  totalEarnings: number;
}

const DashboardScreen = ({navigation}: {navigation: any}) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const {user} = useAuth();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [statsResponse, reportsResponse] = await Promise.all([
        analysisAPI.getStats(),
        reportsAPI.getReports(),
      ]);

      setStats(statsResponse.data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const getStageEmoji = (stage: string) => {
    if (stage.includes('flowering')) return '🌸';
    if (stage.includes('fruiting')) return '🍅';
    if (stage.includes('ripened')) return '🍎';
    if (stage.includes('green')) return '🟢';
    return '🌱';
  };

  const getStageColor = (stage: string) => {
    if (stage.includes('flowering')) return '#EC4899';
    if (stage.includes('fruiting')) return '#F97316';
    if (stage.includes('ripened')) return '#EF4444';
    if (stage.includes('green')) return '#10B981';
    return '#6B7280';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <PlantLoader message="Loading dashboard..." size={150} />
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
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.name}! 👋</Text>
          <Text style={styles.subtitle}>Here's your crop analysis overview</Text>
        </View>

        {stats && (
          <>
            {/* Quick Stats */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, styles.primaryCard]}>
                <Text style={styles.statNumber}>{stats.totalAnalyses}</Text>
                <Text style={styles.statLabel}>Total Analyses</Text>
              </View>
              
              <View style={[styles.statCard, styles.successCard]}>
                <Text style={styles.statNumber}>{stats.averageConfidence?.toFixed(1)}%</Text>
                <Text style={styles.statLabel}>Avg Confidence</Text>
              </View>
              
              <View style={[styles.statCard, styles.warningCard]}>
                <Text style={styles.statNumber}>{stats.totalYield?.toFixed(1)} kg</Text>
                <Text style={styles.statLabel}>Total Yield</Text>
              </View>
              
              <View style={[styles.statCard, styles.infoCard]}>
                <Text style={styles.statNumber}>₹{stats.totalEarnings?.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Total Earnings</Text>
              </View>
            </View>

            {/* Stage Distribution */}
            {stats.stageDistribution && Object.keys(stats.stageDistribution).length > 0 && (
              <View style={styles.distributionCard}>
                <Text style={styles.cardTitle}>📊 Stage Distribution</Text>
                <View style={styles.distributionList}>
                  {Object.entries(stats.stageDistribution)
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .map(([stage, count]) => (
                      <View key={stage} style={styles.distributionItem}>
                        <View style={styles.distributionLeft}>
                          <Text style={styles.stageEmoji}>{getStageEmoji(stage)}</Text>
                          <Text style={styles.stageName}>
                            {stage.replace(/_/g, ' ').toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.distributionRight}>
                          <View 
                            style={[
                              styles.countBadge, 
                              {backgroundColor: getStageColor(stage)}
                            ]}
                          >
                            <Text style={styles.countText}>{count}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                </View>
              </View>
            )}

            {/* Recent Analyses */}
            {stats.recentAnalyses && stats.recentAnalyses.length > 0 && (
              <View style={styles.recentCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>🕒 Recent Analyses</Text>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Reports')}
                    style={styles.viewAllButton}
                  >
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.recentList}>
                  {stats.recentAnalyses.slice(0, 5).map((analysis) => (
                    <View key={analysis._id} style={styles.recentItem}>
                      <View style={styles.recentLeft}>
                        <Text style={styles.recentStage}>
                          {getStageEmoji(analysis.overallStage)}
                          {analysis.overallStage?.replace(/_/g, ' ').toUpperCase()}
                        </Text>
                        <Text style={styles.recentDate}>
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.recentRight}>
                        <Text style={styles.recentConfidence}>
                          {analysis.confidence?.toFixed(1)}%
                        </Text>
                        <Text style={styles.recentYield}>
                          {analysis.yieldKg || 0} kg
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.actionsCard}>
              <Text style={styles.cardTitle}>⚡ Quick Actions</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryAction]}
                  onPress={() => navigation.navigate('Analysis')}
                >
                  <Text style={styles.actionIcon}>📸</Text>
                  <Text style={styles.actionText}>New Analysis</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryAction]}
                  onPress={() => navigation.navigate('Reports')}
                >
                  <Text style={styles.actionIcon}>📊</Text>
                  <Text style={styles.actionText}>View Reports</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.infoAction]}
                  onPress={() => navigation.navigate('Weather')}
                >
                  <Text style={styles.actionIcon}>🌤️</Text>
                  <Text style={styles.actionText}>Weather</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {!stats && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyTitle}>No analyses yet</Text>
            <Text style={styles.emptySubtitle}>
              Start by analyzing your first crop image
            </Text>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={() => navigation.navigate('Analysis')}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
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
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryCard: {
    backgroundColor: '#10B981',
  },
  successCard: {
    backgroundColor: '#059669',
  },
  warningCard: {
    backgroundColor: '#F59E0B',
  },
  infoCard: {
    backgroundColor: '#3B82F6',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  distributionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  distributionList: {
    gap: 12,
  },
  distributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  distributionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stageEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  stageName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  distributionRight: {
    alignItems: 'flex-end',
  },
  countBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  recentList: {
    gap: 12,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  recentLeft: {
    flex: 1,
  },
  recentStage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  recentDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  recentRight: {
    alignItems: 'flex-end',
  },
  recentConfidence: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 2,
  },
  recentYield: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  primaryAction: {
    backgroundColor: '#10B981',
  },
  secondaryAction: {
    backgroundColor: '#6366F1',
  },
  infoAction: {
    backgroundColor: '#F59E0B',
  },
  actionIcon: {
    fontSize: 24,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  getStartedButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;