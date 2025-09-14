import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ChevronRight } from 'react-native-feather';
import { JournalEntry, Mood } from '../../types';

interface JournalScreenProps {
  setCurrentScreen?: (screen: string) => void;
  journalEntries?: JournalEntry[]; // Made optional
  moods?: Mood[]; // Made optional
}

const JournalScreen: React.FC<JournalScreenProps> = ({ setCurrentScreen, journalEntries = [], moods = [] }) => {
  // Sample data (can be moved to types file or parent component)
  const defaultJournalEntries: JournalEntry[] = [
    {
      id: '1',
      title: 'First Day Reflection',
      date: '2025-09-14',
      content: 'Today was a great day with good weather and a nice walk.',
      mood: 'good',
    },
    {
      id: '2',
      title: 'Weekend Thoughts',
      date: '2025-09-13',
      content: 'Spent the weekend relaxing, but felt a bit tired.',
      mood: 'okay',
    },
  ];

  const defaultMoods: Mood[] = [
    { emoji: '😊', label: 'Amazing', value: 'amazing' },
    { emoji: '🙂', label: 'Good', value: 'good' },
    { emoji: '😐', label: 'Okay', value: 'okay' },
    { emoji: '😞', label: 'Not Great', value: 'not-great' },
    { emoji: '😠', label: 'Awful', value: 'awful' },
  ];

  // Use passed data or fallback to default data
  const entriesToDisplay = journalEntries.length > 0 ? journalEntries : defaultJournalEntries;
  const moodsToDisplay = moods.length > 0 ? moods : defaultMoods;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Journal</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => setCurrentScreen?.('journal-entry')}
        >
          <Text style={styles.newButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        {entriesToDisplay.map((entry) => (
          <View key={entry.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{entry.title}</Text>
              <Text style={styles.cardDate}>{entry.date}</Text>
            </View>
            <Text style={styles.cardContent} numberOfLines={2} ellipsizeMode="tail">
              {entry.content}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.moodText}>
                {moodsToDisplay.find((m) => m.value === entry.mood)?.emoji}{' '}
                {moodsToDisplay.find((m) => m.value === entry.mood)?.label || 'Unknown Mood'}
              </Text>
              <ChevronRight size={14} color="#9CA3AF" />
            </View>
          </View>
        ))}
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
    fontWeight: '600',
    color: '#1F2937',
  },
  newButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
  },
  newButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  cardDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardContent: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default JournalScreen;