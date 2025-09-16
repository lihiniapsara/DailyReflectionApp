import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { JournalEntry } from "@/types/JournalEntry";
import { auth, db } from "@/firebase";
import { collection, onSnapshot } from "firebase/firestore";

// Mood options
const moodOptions: {
  label: string;
  value: number;
  emoji: string;
  color: string;
}[] = [
  { label: "Amazing", value: 5, emoji: "😊", color: "bg-green-500" },
  { label: "Good", value: 4, emoji: "🙂", color: "bg-blue-500" },
  { label: "Okay", value: 3, emoji: "😐", color: "bg-yellow-500" },
  { label: "Not Great", value: 2, emoji: "😞", color: "bg-orange-500" },
  { label: "Awful", value: 1, emoji: "😢", color: "bg-red-500" },
];

// Journal item component
const JournalEntryItem: React.FC<{ entry: JournalEntry }> = ({ entry }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between p-4 bg-white border border-gray-200 rounded-lg mb-3 shadow-sm"
      onPress={() => router.push(`/journal/${entry.id}`)}
      accessibilityLabel={`View journal entry: ${entry.title}`}
      accessibilityRole="button"
    >
      <View className="flex-1 mr-3">
        <Text className="text-base font-medium text-gray-900" numberOfLines={1}>
          {entry.title}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
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
  const { width } = useWindowDimensions();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [journal, setJournal] = useState<JournalEntry[]>([]);

  // Calculate mood item width based on screen size
  const moodItemWidth = width < 400 ? (width - 48) / 3.5 : 100;
  const moodItemHeight = width < 400 ? 90 : 100;

  // Fetch journal entries from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "journal"),
      (querySnapshot) => {
        const allJournals = querySnapshot.docs
          .filter((doc) => doc.data().userId === auth.currentUser?.uid)
          .map(
            (doc) =>
              ({
                ...doc.data(),
                id: doc.id,
              }) as JournalEntry
          );
        setJournal(allJournals);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: "Home", headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center justify-between bg-white px-5 py-4 border-b border-gray-200">
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900">
            Daily Reflection
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            Today, {new Date().toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/setting")}
          accessibilityLabel="Settings"
          accessibilityRole="button"
          className="p-2"
        >
          <Ionicons name="settings-outline" size={24} color="#4B5563" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        className="flex-1"
      >
        {/* Mood Selection */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            How are you feeling today?
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
            contentContainerStyle={{ paddingHorizontal: 4 }}
          >
            {moodOptions.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={{
                  width: moodItemWidth,
                  height: moodItemHeight,
                  marginHorizontal: 6,
                }}
                className={`flex-col items-center justify-center rounded-xl p-3
                  ${
                    selectedMood === mood.value
                      ? `${mood.color}`
                      : "bg-white border border-gray-200"
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
                    ${selectedMood === mood.value ? "text-white" : "text-gray-800"}`}
                  numberOfLines={1}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Monthly Goals */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              Monthly Goals
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/goals")}
              accessibilityLabel="View all goals"
              accessibilityRole="button"
            >
              <Text className="text-purple-600 text-sm font-medium">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="trophy-outline" size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Fitness Goal
                </Text>
                <Text className="text-sm text-gray-500">
                  15/30 days completed
                </Text>
              </View>
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-xs font-medium text-blue-800">50%</Text>
              </View>
            </View>

            <View className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <View
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: "50%" }}
              ></View>
            </View>

            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="book-outline" size={20} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Reading Challenge
                </Text>
                <Text className="text-sm text-gray-500">3/5 books read</Text>
              </View>
              <View className="bg-green-100 px-2 py-1 rounded-full">
                <Text className="text-xs font-medium text-green-800">60%</Text>
              </View>
            </View>

            <View className="w-full bg-gray-200 rounded-full h-2">
              <View
                className="bg-green-500 h-2 rounded-full"
                style={{ width: "60%" }}
              ></View>
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-center mt-4 pt-3 border-t border-gray-100"
              onPress={() => router.push("/goals")}
              accessibilityLabel="Add new goal"
              accessibilityRole="button"
            >
              <Ionicons name="add-circle-outline" size={18} color="#7C3AED" />
              <Text className="text-purple-600 text-sm font-medium ml-1">
                Add New Goal
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Prompt */}
{/* Daily Prompt */}
<View className="mb-6">
  <Text className="text-lg font-semibold text-gray-900 mb-4">
    Daily Prompt
  </Text>
  <View className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
    <Text className="text-base text-gray-700 italic mb-4">
      "What is one thing you're grateful for today?"
    </Text>
    <TouchableOpacity
      className="w-full bg-purple-600 py-3 rounded-lg"
      onPress={() => {
        // Navigate to journal tab with prompt parameter
        router.push({
          pathname: "/journal",
          params: { prompt: "What is one thing you're grateful for today?" }
        });
      }}
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
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              Recent Entries
            </Text>
            {journal.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push("/journal")}
                accessibilityLabel="View all journal entries"
                accessibilityRole="button"
              >
                <Text className="text-purple-600 text-sm font-medium">
                  View All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {journal.length > 0 ? (
            <>
              {journal.slice(0, 3).map((entry) => (
                <JournalEntryItem key={entry.id} entry={entry} />
              ))}
            </>
          ) : (
            <View className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
              <Text className="text-base text-gray-500 text-center mb-4">
                No journal entries yet. Start by writing your first entry!
              </Text>
              <TouchableOpacity
                className="w-full bg-purple-600 py-3 rounded-lg"
                onPress={() => router.push("/journal")}
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
