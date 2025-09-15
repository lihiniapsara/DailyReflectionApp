import { Mood, MoodDistribution, WeeklyMoodData } from '../../types/Mood';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit'; // Import chart library

interface InsightsScreenProps {
  setCurrentScreen?: (screen: string) => void;
  weeklyMoodData?: WeeklyMoodData[];
  moodDistribution?: MoodDistribution[];
  moods?: Mood[];
}

const InsightsScreen: React.FC<InsightsScreenProps> = ({ setCurrentScreen, weeklyMoodData = [], moodDistribution = [], moods = [] }) => {
  const [activeTab, setActiveTab] = useState('Mood'); // State to manage active tab

  const defaultWeeklyMoodData: WeeklyMoodData[] = [
    { day: 'Mon', value: 4.2, mood: 'good' },
    { day: 'Tue', value: 4.8, mood: 'amazing' },
    { day: 'Wed', value: 4.1, mood: 'good' },
    { day: 'Thu', value: 3.5, mood: 'okay' },
    { day: 'Fri', value: 2.8, mood: 'not-great' },
    { day: 'Sat', value: 4.9, mood: 'amazing' },
    { day: 'Sun', value: 4.3, mood: 'good' },
  ];

  const defaultMoodDistribution: MoodDistribution[] = [
    { mood: 'Amazing', percentage: 45, color: '#10B981', count: 18 },
    { mood: 'Good', percentage: 30, color: '#3B82F6', count: 12 },
    { mood: 'Okay', percentage: 15, color: '#F59E0B', count: 6 },
    { mood: 'Not Great', percentage: 8, color: '#EF4444', count: 3 },
    { mood: 'Awful', percentage: 2, color: '#7C2D12', count: 1 },
  ];

  const defaultMoods: Mood[] = [
    { emoji: '😊', label: 'Amazing', value: 'amazing' },
    { emoji: '🙂', label: 'Good', value: 'good' },
    { emoji: '😐', label: 'Okay', value: 'okay' },
    { emoji: '😞', label: 'Not Great', value: 'not-great' },
    { emoji: '😠', label: 'Awful', value: 'awful' },
  ];

  const dataToDisplay = weeklyMoodData.length > 0 ? weeklyMoodData : defaultWeeklyMoodData;
  const distributionToDisplay = moodDistribution.length > 0 ? moodDistribution : defaultMoodDistribution;
  const moodsToDisplay = moods.length > 0 ? moods : defaultMoods;

  // Calculate average score and improvement
  const averageScore = (dataToDisplay.reduce((sum, item) => sum + item.value, 0) / dataToDisplay.length).toFixed(1);
  const lastWeekAverage = 3.7; // Example value
  const improvement = (((parseFloat(averageScore) - lastWeekAverage) / lastWeekAverage) * 100).toFixed(0);

  // Chart data for react-native-chart-kit
  const chartData = {
    labels: dataToDisplay.map(item => item.day),
    datasets: [
      {
        data: dataToDisplay.map(item => item.value),
      },
    ],
  };

  const screenWidth = Dimensions.get('window').width - 40; // Adjusted for padding

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen?.('home')}>
          <Feather name="chevron-left" size={24} color="#4B5563" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Insights</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity style={activeTab === 'Mood' ? styles.tabActive : styles.tab} onPress={() => setActiveTab('Mood')}>
          <Text style={activeTab === 'Mood' ? styles.tabTextActive : styles.tabText}>Mood</Text>
        </TouchableOpacity>
        <TouchableOpacity style={activeTab === 'Goals' ? styles.tabActive : styles.tab} onPress={() => setActiveTab('Goals')}>
          <Text style={activeTab === 'Goals' ? styles.tabTextActive : styles.tabText}>Goals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={activeTab === 'Journals' ? styles.tabActive : styles.tab} onPress={() => setActiveTab('Journals')}>
          <Text style={activeTab === 'Journals' ? styles.tabTextActive : styles.tabText}>Journals</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        {activeTab === 'Mood' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Mood Trends</Text>
                <Text style={styles.cardSubtitle}>Last 7 days overview</Text>
              </View>
              <View style={styles.iconContainer}>
                <Feather name="trending-up" size={24} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{averageScore}</Text>
                <Text style={styles.statLabel}>Average Score</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{`+${improvement}%`}</Text>
                <Text style={styles.statLabel}>Improvement</Text>
              </View>
            </View>
            <View style={styles.chartContainer}>
              <BarChart
                data={chartData}
                width={screenWidth}
                height={220}
                yAxisLabel=""
                chartConfig={{
                  backgroundGradientFrom: '#FFFFFF',
                  backgroundGradientTo: '#F1F5F9',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
                  style: {
                    borderRadius: 16,
                    padding: 10,
                  },
                  propsForLabels: {
                    fontSize: 12,
                  },
                  barPercentage: 0.5,
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                decorator={() =>
                  dataToDisplay.map((item, index) => {
                    const moodInfo = moodsToDisplay.find((m) => m.value === item.mood);
                    return {
                      x: (index * (screenWidth / 7)) + (screenWidth / 14) - 10,
                      y: item.value * 40 + 10,
                      props: {
                        fill: '#000000',
                        text: moodInfo ? moodInfo.emoji : '😶',
                        fontSize: 16,
                      },
                    };
                  })
                }
              />
            </View>
          </View>
        )}
        {activeTab === 'Goals' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Goals</Text>
                <Text style={styles.cardSubtitle}>Your progress and targets</Text>
              </View>
              <View style={styles.iconContainer}>
                <Feather name="target" size={24} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.goalContainer}>
              <Text style={styles.goalText}>- Complete 5 workouts this week</Text>
              <Text style={styles.goalText}>- Read 1 book by end of September</Text>
              <Text style={styles.goalText}>- Meditate daily for 10 minutes</Text>
            </View>
          </View>
        )}
        {activeTab === 'Journals' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Journals</Text>
                <Text style={styles.cardSubtitle}>Your recent entries</Text>
              </View>
              <View style={styles.iconContainer}>
                <Feather name="book" size={24} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.journalContainer}>
              <Text style={styles.journalText}>
                2025-09-14: Had a great day, finished a project! 😊
              </Text>
              <Text style={styles.journalText}>
                2025-09-13: Felt a bit stressed, need to relax. 😞
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    margin: 10,
    borderRadius: 10,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabActive: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 12,
    color: '#6B7280',
  },
  tabTextActive: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    padding: 10,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  iconContainer: {
    backgroundColor: '#7C3AED',
    padding: 8,
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 12,
    marginRight: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#047857',
  },
  statLabel: {
    fontSize: 10,
    color: '#059669',
  },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  goalContainer: {
    padding: 10,
  },
  goalText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  journalContainer: {
    padding: 10,
  },
  journalText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
});

export default InsightsScreen;