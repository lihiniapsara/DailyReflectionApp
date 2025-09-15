import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft } from 'react-native-feather';
import { Mood } from '../../types';

interface MoodScreenProps {
  setCurrentScreen?: (screen: string) => void;
  moods?: Mood[]; // Made optional
  selectedMood?: string;
  setSelectedMood?: (mood: string) => void;
}

const MoodScreen: React.FC<MoodScreenProps> = ({ setCurrentScreen, moods = [], selectedMood = '', setSelectedMood }) => {
  // Sample default moods (can be moved to types file or parent)
  const defaultMoods: Mood[] = [
    { emoji: '😊', label: 'Amazing', value: 'amazing' },
    { emoji: '🙂', label: 'Good', value: 'good' },
    { emoji: '😐', label: 'Okay', value: 'okay' },
    { emoji: '😞', label: 'Not Great', value: 'not-great' },
    { emoji: '😠', label: 'Awful', value: 'awful' },
  ];

  // Use passed moods or fallback to default moods
  const moodsToDisplay = moods.length > 0 ? moods : defaultMoods;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen?.('home')}>
          <ChevronLeft size={20} color="#4B5563" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mood</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>How are you feeling today?</Text>
        <View style={styles.moodGrid}>
          {moodsToDisplay.map((mood, index) => (
            <TouchableOpacity
              key={mood.value}
              style={[
                styles.moodButton,
                selectedMood === mood.value && styles.moodButtonSelected,
                index > 2 && styles.moodButtonLastRow,
              ]}
              onPress={() => setSelectedMood?.(mood.value)}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={styles.moodLabel}>{mood.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => setCurrentScreen?.('home')}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 20,
  },
  content: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 32,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  moodButton: {
    width: '30%',
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  moodButtonSelected: {
    borderColor: '#A78BFA',
    backgroundColor: '#F5F3FF',
    transform: [{ scale: 1.05 }],
  },
  moodButtonLastRow: {
    marginTop: 12,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  nextButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 9999,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default MoodScreen;