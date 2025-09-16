import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
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
  { label: 'Amazing', value: 5, emoji: '😊', color: 'bg-green-500' },
  { label: 'Good', value: 4, emoji: '🙂', color: 'bg-blue-500' },
  { label: 'Okay', value: 3, emoji: '😐', color: 'bg-yellow-500' },
  { label: 'Not Great', value: 2, emoji: '😞', color: 'bg-orange-500' },
  { label: 'Awful', value: 1, emoji: '😢', color: 'bg-red-500' },
];

// Calculate mood item width based on screen size - more mobile friendly
const moodItemWidth = width < 400 ? (width - 48) / 3.5 : (width - 64) / 4.5;

// Journal item component
const JournalEntryItem: React.FC<{ entry: JournalEntry }> = ({ entry }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between p-4 bg-white border border-gray-200 rounded-lg mb-3"
      onPress={() => router.push(`/journal/${entry.id}`)}
      accessibilityLabel={`View journal entry: ${entry.title}`}
      accessibilityRole="button"
    >
      <View className="flex-1 mr-3">
        <Text className="text-base font-medium text-gray-900" numberOfLines={1}>
          {entry.title}
        </Text>
        <Text className="text-xs text-gray-500 mt-1">
          {entry.date} • {entry.mood}
        </Text>
        <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
          {entry.content}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: 'Daily Reflection' }} />

      {/* Header */}
      <View className="flex-row items-center justify-between bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
            Daily Reflection
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            Today, {new Date().toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          accessibilityLabel="Settings"
          accessibilityRole="button"
          className="p-2"
        >
          <Ionicons name="settings-outline" size={22} color="#4B5563" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Mood Selection */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            How are you feeling today?
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-2"
            contentContainerStyle={{ paddingHorizontal: 4, paddingVertical: 8 }}
          >
            {moodOptions.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={{ width: moodItemWidth, marginHorizontal: 6 }}
                className={`flex-col items-center justify-center h-28 rounded-xl p-3
                  ${selectedMood === mood.value
                    ? `${mood.color}`
                    : 'bg-white border border-gray-200'
                  }`}
                onPress={() => {
                  setSelectedMood(mood.value);
                  router.push(`/mood?mood=${mood.label}`);
                }}
                accessibilityLabel={`Select ${mood.label} mood`}
                accessibilityRole="button"
              >
                <Text className="text-3xl mb-1">{mood.emoji}</Text>
                <Text
                  className={`text-xs font-semibold text-center
                    ${selectedMood === mood.value ? 'text-white' : 'text-gray-800'}`}
                  numberOfLines={1}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Daily Reflection */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Daily Reflection
          </Text>
          <TouchableOpacity
            className="flex-row items-center p-4 bg-white border border-gray-200 rounded-lg"
            onPress={() => router.push('/journal')}
            accessibilityLabel="Journal"
            accessibilityRole="button"
          >
            <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="book-outline" size={20} color="#7C3AED" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900">
                Journal Entry
              </Text>
              <Text className="text-sm text-gray-500">Tap to start writing</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Daily Prompt */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Daily Prompt
          </Text>
          <View className="p-4 bg-white border border-gray-200 rounded-lg">
            <Text className="text-base text-gray-700 italic mb-4">
              "What is one thing you're grateful for today?"
            </Text>
            <TouchableOpacity
              className="w-full bg-purple-600 py-3 rounded-lg"
              onPress={() => router.push('/journal')}
              accessibilityLabel="Write about daily prompt"
              accessibilityRole="button"
            >
              <Text className="text-base font-medium text-white text-center">
                Write about it
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Journal Entries */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Recent Entries
          </Text>
          {journal.length > 0 ? (
            <>
              {journal.slice(0, 3).map((entry) => (
                <JournalEntryItem key={entry.id} entry={entry} />
              ))}
              {journal.length > 3 && (
                <TouchableOpacity
                  className="w-full py-3 mt-2"
                  onPress={() => router.push('/journal')}
                  accessibilityLabel="View all journal entries"
                  accessibilityRole="button"
                >
                  <Text className="text-base font-medium text-purple-600 text-center">
                    View All Entries ({journal.length})
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View className="p-4 bg-white border border-gray-200 rounded-lg">
              <Text className="text-base text-gray-500 text-center mb-4">
                No journal entries yet. Start by writing your first entry!
              </Text>
              <TouchableOpacity
                className="w-full bg-purple-600 py-3 rounded-lg"
                onPress={() => router.push('/journal')}
              >
                <Text className="text-base font-medium text-white text-center">
                  Start Journaling
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;