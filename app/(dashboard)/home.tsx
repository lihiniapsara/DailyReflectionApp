import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Settings, Edit, ChevronRight } from 'react-native-feather';
import { Mood } from '../../types/Mood';

interface HomeScreenProps {
  setCurrentScreen?: (screen: string) => void;
  moods: Mood[]; // Removed default value from interface
}

const HomeScreen: React.FC<HomeScreenProps> = ({ setCurrentScreen, moods = [] }) => { // Default value here
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today</Text>
        <TouchableOpacity onPress={() => setCurrentScreen?.('settings')}>
          <Settings size={20} color="#4B5563" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How are you feeling today?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodContainer}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={styles.moodButton}
                onPress={() => setCurrentScreen?.('mood')}
              >
                <Text style={styles.moodButtonText}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Reflection</Text>
          <TouchableOpacity
            style={styles.card}
            onPress={() => setCurrentScreen?.('journal-entry')}
          >
            <View style={styles.iconContainer}>
              <Edit size={14} color="#7C3AED" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Journal Entry</Text>
              <Text style={styles.cardSubtitle}>Tap to start writing</Text>
            </View>
            <ChevronRight size={14} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Prompt</Text>
          <View style={styles.card}>
            <Text style={styles.promptText}>
              "What is one thing you're grateful for today?"
            </Text>
            <TouchableOpacity
              style={styles.promptButton}
              onPress={() => setCurrentScreen?.('journal-entry')}
            >
              <Text style={styles.promptButtonText}>Write about it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  moodContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  moodButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 9999,
    marginRight: 8,
  },
  moodButtonText: {
    fontSize: 12,
    color: '#1F2937',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#EDE9FE',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  promptText: {
    fontSize: 16,
    color: '#4B5563',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  promptButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: 'center',
  },
  promptButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default HomeScreen;