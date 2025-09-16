import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { JournalEntry } from '@/types/JournalEntry';
import { auth, db } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

// Get screen dimensions
const { width } = Dimensions.get('window');

// Mood options
const moodOptions: { label: string; value: number; emoji: string; color: string }[] = [
  { label: 'Amazing', value: 5, emoji: '😊', color: '#22c55e' },
  { label: 'Good', value: 4, emoji: '🙂', color: '#3b82f6' },
  { label: 'Okay', value: 3, emoji: '😐', color: '#eab308' },
  { label: 'Not Great', value: 2, emoji: '😞', color: '#f97316' },
  { label: 'Awful', value: 1, emoji: '😢', color: '#ef4444' },
];

// Calculate mood item width based on screen size
const moodItemWidth = (width - 32) / 3.5; // Adjusted for better mobile fit

// Journal item component
const JournalEntryItem: React.FC<{ entry: JournalEntry }> = ({ entry }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.journalItem}
      onPress={() => router.push(`/journal/${entry.id}`)}
      accessibilityLabel={`View journal entry: ${entry.title}`}
      accessibilityRole="button"
    >
      <View style={styles.journalItemContent}>
        <Text style={styles.journalItemTitle} numberOfLines={1}>
          {entry.title}
        </Text>
        <Text style={styles.journalItemDate}>
          {entry.date} • {entry.mood}
        </Text>
        <Text style={styles.journalItemPreview} numberOfLines={2}>
          {entry.content}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
};

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [journal, setJournal] = useState<JournalEntry[]>([]);

  // Fetch journal entries from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'journal'), (querySnapshot) => {
      const allJournals = querySnapshot.docs
        .filter((doc) => doc.data().userId === auth.currentUser?.uid)
        .map(
          (doc) =>
            ({
              ...doc.data(),
              id: doc.id,
            } as JournalEntry)
        );
      setJournal(allJournals);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Daily Reflection' }} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Daily Reflection
          </Text>
          <Text style={styles.headerDate}>
            Today, {new Date().toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          accessibilityLabel="Settings"
          accessibilityRole="button"
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={22} color="#4B5563" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Mood Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              How are you feeling today?
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.moodScroll}
              contentContainerStyle={styles.moodScrollContent}
            >
              {moodOptions.map((mood) => (
                <TouchableOpacity
                  key={mood.value}
                  style={[
                    styles.moodItem,
                    { width: moodItemWidth },
                    selectedMood === mood.value
                      ? { backgroundColor: mood.color }
                      : styles.moodItemInactive
                  ]}
                  onPress={() => {
                    setSelectedMood(mood.value);
                    router.push(`/mood?mood=${mood.label}`);
                  }}
                  accessibilityLabel={`Select ${mood.label} mood`}
                  accessibilityRole="button"
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      selectedMood === mood.value && styles.moodLabelSelected
                    ]}
                    numberOfLines={1}
                  >
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Daily Reflection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Daily Reflection
            </Text>
            <TouchableOpacity
              style={styles.reflectionCard}
              onPress={() => router.push('/journal')}
              accessibilityLabel="Journal"
              accessibilityRole="button"
            >
              <View style={styles.reflectionIcon}>
                <Ionicons name="book-outline" size={20} color="#7C3AED" />
              </View>
              <View style={styles.reflectionContent}>
                <Text style={styles.reflectionTitle}>
                  Journal Entry
                </Text>
                <Text style={styles.reflectionSubtitle}>Tap to start writing</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Daily Prompt */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Daily Prompt
            </Text>
            <View style={styles.promptCard}>
              <Text style={styles.promptText}>
                "What is one thing you're grateful for today?"
              </Text>
              <TouchableOpacity
                style={styles.promptButton}
                onPress={() => router.push('/journal')}
                accessibilityLabel="Write about daily prompt"
                accessibilityRole="button"
              >
                <Text style={styles.promptButtonText}>
                  Write about it
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Journal Entries */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Recent Entries
            </Text>
            {journal.length > 0 ? (
              <>
                {journal.slice(0, 3).map((entry) => (
                  <JournalEntryItem key={entry.id} entry={entry} />
                ))}
                {journal.length > 3 && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => router.push('/journal')}
                    accessibilityLabel="View all journal entries"
                    accessibilityRole="button"
                  >
                    <Text style={styles.viewAllText}>
                      View All Entries ({journal.length})
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No journal entries yet. Start by writing your first entry!
                </Text>
                <TouchableOpacity
                  style={styles.startJournalingButton}
                  onPress={() => router.push('/journal')}
                >
                  <Text style={styles.startJournalingText}>
                    Start Journaling
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flex: 1,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  settingsButton: {
    padding: 4,
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  moodScroll: {
    marginBottom: 8,
  },
  moodScrollContent: {
    paddingHorizontal: 8,
  },
  moodItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 96,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 6,
  },
  moodItemInactive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1f2937',
  },
  moodLabelSelected: {
    color: '#ffffff',
  },
  reflectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  reflectionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f3e8ff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reflectionContent: {
    flex: 1,
  },
  reflectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  reflectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  promptCard: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  promptText: {
    fontSize: 16,
    color: '#374151',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  promptButton: {
    width: '100%',
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    borderRadius: 12,
  },
  promptButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
  },
  journalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 8,
  },
  journalItemContent: {
    flex: 1,
    marginRight: 8,
  },
  journalItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  journalItemDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  journalItemPreview: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
  },
  viewAllButton: {
    width: '100%',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7c3aed',
    textAlign: 'center',
  },
  emptyState: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  startJournalingButton: {
    width: '100%',
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    borderRadius: 12,
  },
  startJournalingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default HomeScreen;