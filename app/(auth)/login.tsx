import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { JournalEntry } from '@/types/JournalEntry';

// Sample data
const moodOptions: { label: string; value: number; emoji: string; color: string }[] = [
  { label: 'Amazing', value: 5, emoji: '😊', color: 'bg-green-600' },
  { label: 'Good', value: 4, emoji: '🙂', color: 'bg-blue-600' },
  { label: 'Okay', value: 3, emoji: '😐', color: 'bg-yellow-600' },
  { label: 'Not Great', value: 2, emoji: '😞', color: 'bg-orange-600' },
  { label: 'Awful', value: 1, emoji: '😢', color: 'bg-red-600' },
];

const sampleEntries: JournalEntry[] = [
  { id: 1, title: 'Grateful Day', content: 'Today I felt amazing because I spent time with family.', date: '2025-09-15', mood: 'Amazing' },
  { id: 2, title: 'Reflective Evening', content: 'Had a tough day but learned a lot.', date: '2025-09-14', mood: 'Not Great' },
];

// Journal entry item component
const JournalEntryItem: React.FC<{ entry: JournalEntry }> = ({ entry }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between p-3 bg-white border border-gray-200 rounded-xl mb-2"
      onPress={() => router.push(`/journal/${entry.id}`)}
      accessibilityLabel={`View journal entry: ${entry.title}`}
      accessibilityRole="button"
    >
      <View className="flex-1">
        <Text className="text-sm font-medium text-gray-900">{entry.title}</Text>
        <Text className="text-xs text-gray-500">{entry.date} • {entry.mood}</Text>
        <Text className="text-xs text-gray-600 line-clamp-2">{entry.content}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );
};

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const animatedValues = useRef(moodOptions.map(() => new Animated.Value(1))).current;

  // Split moodOptions into two rows
  const firstRowMoods = moodOptions.slice(0, Math.ceil(moodOptions.length / 2));
  const secondRowMoods = moodOptions.slice(Math.ceil(moodOptions.length / 2));

  // One-by-one play implementation with animation
  const MOOD_SWITCH_INTERVAL = 3000; // 3 seconds interval
  useEffect(() => {
    const moodValues = moodOptions.map((mood) => mood.value);
    let currentIndex = 0;

    const moodInterval = setInterval(() => {
      // Reset previous scale
      animatedValues[currentIndex].setValue(1);
      currentIndex = (currentIndex + 1) % moodValues.length;
      setSelectedMood(moodValues[currentIndex]);

      // Animate current card
      Animated.timing(animatedValues[currentIndex], {
        toValue: 1.1, // Scale up to 110%
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, MOOD_SWITCH_INTERVAL);

    return () => clearInterval(moodInterval); // Cleanup interval on unmount
  }, [animatedValues]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: 'Daily Reflection' }} />
      {/* Header */}
      <View className="flex-row items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
        <View>
          <Text className="text-xl font-semibold text-gray-900">Daily Reflection Dashboard</Text>
          <Text className="text-sm text-gray-500">Today, {new Date().toLocaleDateString()}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          accessibilityLabel="Settings"
          accessibilityRole="button"
        >
          <Ionicons name="settings" size={20} color="#4B5563" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 64 }}>
        {/* Mood Selection (Patta Kathai Design, One-by-One Play, Two-Line Layout) */}
        <View className="space-y-4">
          <Text className="text-xl font-bold text-gray-900">How are you feeling today?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row space-x-3"
          >
            <View className="flex-col space-y-2">
              {/* First Row */}
              <View className="flex-row space-x-3">
                {firstRowMoods.map((mood, index) => (
                  <Animated.View
                    key={mood.value}
                    style={{ transform: [{ scale: animatedValues[mood.value - 1] }] }}
                  >
                    <TouchableOpacity
                      className={`flex-col items-center justify-center w-24 h-24 rounded-2xl p-3 shadow-md ${
                        selectedMood === mood.value
                          ? `${mood.color.replace('bg-', 'bg-gradient-to-r from-')} via-${mood.color.replace('bg-', '')}/90 to-${mood.color.replace('bg-', '')}/70 text-white`
                          : 'bg-white border border-gradient-to-r from-gray-300/50 to-gray-200/50'
                      }`}
                      onPress={() => {
                        setSelectedMood(mood.value);
                        Animated.timing(animatedValues[mood.value - 1], {
                          toValue: 1.1,
                          duration: 300,
                          useNativeDriver: true,
                        }).start();
                        router.push(`/mood?mood=${mood.label}`);
                      }}
                      accessibilityLabel={`Select ${mood.label} mood`}
                      accessibilityRole="button"
                    >
                      <Text className="text-3xl mb-2">{mood.emoji}</Text>
                      <Text
                        className={`text-sm font-semibold ${
                          selectedMood === mood.value ? 'text-white' : 'text-gray-800'
                        }`}
                      >
                        {mood.label}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
              {/* Second Row */}
              <View className="flex-row space-x-3">
                {secondRowMoods.map((mood, index) => (
                  <Animated.View
                    key={mood.value}
                    style={{ transform: [{ scale: animatedValues[mood.value - 1] }] }}
                  >
                    <TouchableOpacity
                      className={`flex-col items-center justify-center w-24 h-24 rounded-2xl p-3 shadow-md ${
                        selectedMood === mood.value
                          ? `${mood.color.replace('bg-', 'bg-gradient-to-r from-')} via-${mood.color.replace('bg-', '')}/90 to-${mood.color.replace('bg-', '')}/70 text-white`
                          : 'bg-white border border-gradient-to-r from-gray-300/50 to-gray-200/50'
                      }`}
                      onPress={() => {
                        setSelectedMood(mood.value);
                        Animated.timing(animatedValues[mood.value - 1], {
                          toValue: 1.1,
                          duration: 300,
                          useNativeDriver: true,
                        }).start();
                        router.push(`/mood?mood=${mood.label}`);
                      }}
                      accessibilityLabel={`Select ${mood.label} mood`}
                      accessibilityRole="button"
                    >
                      <Text className="text-3xl mb-2">{mood.emoji}</Text>
                      <Text
                        className={`text-sm font-semibold ${
                          selectedMood === mood.value ? 'text-white' : 'text-gray-800'
                        }`}
                      >
                        {mood.label}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Daily Reflection */}
        <View className="space-y-3 mt-6">
          <Text className="text-lg font-semibold text-gray-900">Daily Reflection</Text>
          <TouchableOpacity
            className="flex-row items-center p-3 bg-white border border-gray-200 rounded-xl"
            onPress={() => router.push('/journal-entry')}
            accessibilityLabel="Journal Entry"
            accessibilityRole="button"
          >
            <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="book" size={16} color="#7C3AED" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-900">Journal Entry</Text>
              <Text className="text-xs text-gray-500">Tap to start writing</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Daily Prompt */}
        <View className="space-y-3 mt-6">
          <Text className="text-lg font-semibold text-gray-900">Daily Prompt</Text>
          <View className="p-3 bg-white border border-gray-200 rounded-xl">
            <Text className="text-sm text-gray-600 italic mb-3">
              "What is one thing you're grateful for today?"
            </Text>
            <TouchableOpacity
              className="w-full bg-purple-600 py-3 rounded-full"
              onPress={() => router.push('/journal-entry')}
              accessibilityLabel="Write about daily prompt"
              accessibilityRole="button"
            >
              <Text className="text-sm font-medium text-white text-center">Write about it</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Journal Entries */}
        <View className="space-y-3 mt-6">
          <Text className="text-lg font-semibold text-gray-900">Recent Entries</Text>
          {sampleEntries.slice(0, 3).map((entry) => (
            <JournalEntryItem key={entry.id} entry={entry} />
          ))}
          {sampleEntries.length > 3 && (
            <TouchableOpacity
              className="w-full py-2"
              onPress={() => router.push('/journal')}
              accessibilityLabel="View all journal entries"
              accessibilityRole="button"
            >
              <Text className="text-sm font-medium text-purple-600 text-center">View All Entries</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;