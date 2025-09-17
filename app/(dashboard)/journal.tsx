import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  Animated,
  SafeAreaView,
  Alert,
  RefreshControl,
} from "react-native";
import {
  DateTimePickerAndroid,
  DateTimePicker,
} from "@react-native-community/datetimepicker";
import { ChevronRight } from "react-native-feather";
import { JournalEntry } from "../../types/JournalEntry";
import { Mood, defaultMoods } from "../../types/Mood";
import { createJournal } from "@/services/journalService";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { auth, db } from "@/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface JournalScreenProps {
  setCurrentScreen?: (screen: string) => void;
  journalEntries?: JournalEntry[];
  moods?: Mood[];
}

const JournalScreen: React.FC<JournalScreenProps> = ({
  setCurrentScreen,
  journalEntries = [],
  moods = [],
}) => {
  const { prompt } = useLocalSearchParams();
  const [promptReceived, setPromptReceived] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  
  // State for journal entries from Firestore
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  
  // Use passed data or fallback to fetched data
  const entriesToDisplay = journalEntries.length > 0 ? journalEntries : entries;
  const moodsToDisplay = moods.length > 0 ? moods : defaultMoods;

  // State for modal and form
  const [isModalVisible, setModalVisible] = useState(false);
  const [newEntry, setNewEntry] = useState<JournalEntry>({
    id: "",
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    mood: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const animatedValues = useRef(
    moodsToDisplay.map(() => new Animated.Value(1))
  ).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  // Mood color mapping
  const moodColorMap = {
    amazing: "#22c55e",
    good: "#3b82f6",
    okay: "#eab308",
    notGreat: "#f97316",
    awful: "#ef4444",
  };

  // Helper functions to store and retrieve last update time
  const getLastUpdateTime = async (): Promise<number> => {
    try {
      const time = await AsyncStorage.getItem('lastJournalUpdateTime');
      return time ? parseInt(time, 10) : 0;
    } catch (error) {
      console.error("Error getting last update time:", error);
      return 0;
    }
  };

  const setLastUpdateTime = async (time: number): Promise<void> => {
    try {
      await AsyncStorage.setItem('lastJournalUpdateTime', time.toString());
    } catch (error) {
      console.error("Error setting last update time:", error);
    }
  };

  // Fetch journal entries from Firestore
  const fetchJournalEntries = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const q = query(
        collection(db, "journal"),
        where("userId", "==", auth.currentUser?.uid)
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const journalEntries = querySnapshot.docs.map(
          (doc) =>
            ({
              ...doc.data(),
              id: doc.id,
            }) as JournalEntry
        );
        // Sort manually on the client side as a temporary solution
        const sortedEntries = journalEntries.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setEntries(sortedEntries);
        setRefreshing(false);
        setLastRefreshed(new Date());
        setLastUpdateTime(Date.now());
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      setRefreshing(false);
      return () => {}; // Return empty function
    }
  }, []);

  useEffect(() => {
    const unsubscribe = fetchJournalEntries();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Check if we need to refresh data on focus
  useFocusEffect(
    React.useCallback(() => {
      setPromptReceived(false);
      
      // Check if 24 hours have passed since last refresh
      const checkForUpdate = async () => {
        const lastUpdateTime = await getLastUpdateTime();
        const now = Date.now();
        const hoursSinceLastRefresh = (now - lastUpdateTime) / (1000 * 60 * 60);
        
        if (hoursSinceLastRefresh >= 24) {
          fetchJournalEntries();
          Alert.alert("Journal Updated", "Your journal entries have been refreshed.");
        }
      };
      
      checkForUpdate();
    }, [])
  );

  // Auto-open modal if prompt is passed and it's the first time
  useEffect(() => {
    if (prompt && isFirstTime) {
      // Set the prompt as the title and add some default content
      setNewEntry({
        id: "",
        title: "Daily Reflection",
        content: `Prompt: ${prompt}\n\n`,
        date: new Date().toISOString().split("T")[0],
        mood: "",
      });
      setModalVisible(true);
      animateModal(true);
      setIsFirstTime(false); // Mark as not first time anymore
    }
  }, [prompt, isFirstTime]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchJournalEntries();
    Alert.alert("Refreshed", "Journal entries have been updated.");
  };

  // Handle mood button animation
  const animateMoodButton = (index: number) => {
    Animated.sequence([
      Animated.timing(animatedValues[index], {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  };

  // Handle modal animation
  const animateModal = (visible: boolean) => {
    Animated.timing(modalOpacity, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Handle Android date picker
  const showDatePickerAndroid = () => {
    DateTimePickerAndroid.open({
      value: date,
      mode: "date",
      display: "default",
      onChange: (event, selectedDate) => {
        setShowDatePicker(Platform.OS === "ios");
        if (selectedDate) {
          setDate(selectedDate);
          setNewEntry({
            ...newEntry,
            date: selectedDate.toISOString().split("T")[0],
          });
        }
      },
    });
  };

  // Handle iOS date picker
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
      setNewEntry({
        ...newEntry,
        date: selectedDate.toISOString().split("T")[0],
      });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (newEntry.title && newEntry.content && newEntry.mood) {
      try {
        await createJournal(newEntry);
        closeModal();
        
        // Refresh the entries after creating a new one
        fetchJournalEntries();
      } catch (error) {
        console.error("Error creating journal entry:", error);
        Alert.alert("Error", "Failed to create journal entry. Please try again.");
      }
    }
  };

  // Open modal
  const openModal = () => {
    setNewEntry({
      id: "",
      title: "",
      content: "",
      date: new Date().toISOString().split("T")[0],
      mood: "",
    });
    setDate(new Date());
    setModalVisible(true);
    animateModal(true);
    setIsFirstTime(false); // Ensure modal doesn't auto-open again
  };

  // Close modal and reset form
  const closeModal = () => {
    setModalVisible(false);
    animateModal(false);
    setNewEntry({
      id: "",
      title: "",
      content: "",
      date: new Date().toISOString().split("T")[0],
      mood: "",
    });
    setDate(new Date());
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 bg-gray-50">
        {/* Modal for New Journal Entry */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={closeModal}
        >
          <Animated.View
            className="flex-1 justify-center items-center bg-black/50"
            style={{ opacity: modalOpacity }}
          >
            <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                New Journal Entry
              </Text>

              {/* Title Input */}
              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-900 bg-gray-50"
                placeholder="Title"
                value={newEntry.title}
                onChangeText={(text) =>
                  setNewEntry({ ...newEntry, title: text })
                }
                accessibilityLabel="Enter journal entry title"
              />

              {/* Content Input */}
              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-900 bg-gray-50 h-32"
                placeholder="Write your thoughts..."
                value={newEntry.content}
                onChangeText={(text) =>
                  setNewEntry({ ...newEntry, content: text })
                }
                multiline
                accessibilityLabel="Enter journal entry content"
              />

              {/* Date Picker Trigger */}
              <TouchableOpacity
                className="border border-gray-300 rounded-lg p-3 mb-4 bg-gray-50"
                onPress={() => {
                  if (Platform.OS === "android") {
                    showDatePickerAndroid();
                  } else {
                    setShowDatePicker(true);
                  }
                }}
                accessibilityLabel="Select journal entry date"
                accessibilityRole="button"
              >
                <Text className="text-sm text-gray-600">
                  Date: {newEntry.date}
                </Text>
              </TouchableOpacity>

              {/* iOS Date Picker */}
              {Platform.OS !== "android" && showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}

              {/* Mood Selection */}
              <Text className="text-sm font-semibold text-gray-900 mb-2">
                Select Mood
              </Text>
              <View className="flex-row flex-wrap justify-between mb-4">
                {moodsToDisplay.map((mood, index) => (
                  <Animated.View
                    key={mood.value}
                    style={{ transform: [{ scale: animatedValues[index] }] }}
                  >
                    <TouchableOpacity
                      className={`flex-col items-center justify-center w-20 h-20 rounded-xl p-2 mb-2 ${
                        newEntry.mood === mood.value
                          ? "bg-white border border-gray-200"
                          : "bg-white border border-gray-200"
                      }`}
                      style={
                        newEntry.mood === mood.value
                          ? { backgroundColor: moodColorMap[mood.value] }
                          : {}
                      }
                      onPress={() => {
                        setNewEntry({ ...newEntry, mood: mood.value });
                        animateMoodButton(index);
                      }}
                      accessibilityLabel={`Select ${mood.label} mood`}
                      accessibilityRole="button"
                    >
                      <Text className="text-2xl mb-1">{mood.emoji}</Text>
                      <Text
                        className={`text-xs font-medium ${
                          newEntry.mood === mood.value
                            ? "text-white"
                            : "text-gray-800"
                        }`}
                      >
                        {mood.label}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>

              {/* Buttons */}
              <View className="flex-row justify-end" style={{ gap: 8 }}>
                <TouchableOpacity
                  className="bg-gray-200 py-2 px-4 rounded-full"
                  onPress={closeModal}
                  accessibilityLabel="Cancel new journal entry"
                  accessibilityRole="button"
                >
                  <Text className="text-sm font-medium text-gray-800">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`py-2 px-4 rounded-full ${
                    !newEntry.title || !newEntry.content || !newEntry.mood
                      ? "bg-gray-400"
                      : "bg-purple-600"
                  }`}
                  onPress={handleSubmit}
                  disabled={
                    !newEntry.title || !newEntry.content || !newEntry.mood
                  }
                  accessibilityLabel="Save new journal entry"
                  accessibilityRole="button"
                >
                  <Text
                    className={`text-sm font-medium ${
                      !newEntry.title || !newEntry.content || !newEntry.mood
                        ? "text-gray-600"
                        : "text-white"
                    }`}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </Modal>

        {/* Header */}
        <View className="flex-row justify-between items-center bg-white px-4 py-4 border-b border-gray-200">
          <Text className="text-xl font-semibold text-gray-900">Journal</Text>
          <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
            <Text className="text-purple-600 text-sm">
              {refreshing ? "Refreshing..." : "Refresh"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          className="p-4"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#7C3AED"
            />
          }
        >
          {/* Last updated info */}
          <Text className="text-xs text-gray-500 mb-4 text-center">
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </Text>

          {/* Add New Journal Button at the Top */}
          <TouchableOpacity
            className="bg-purple-600 py-3 rounded-lg mb-4"
            onPress={openModal}
            accessibilityLabel="Add new journal entry"
            accessibilityRole="button"
          >
            <Text className="text-base font-medium text-white text-center">
              + New Journal Entry
            </Text>
          </TouchableOpacity>

          {entriesToDisplay.length > 0 ? (
            entriesToDisplay.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                className="bg-white p-4 rounded-xl border border-gray-200 mb-3"
                onPress={() => setCurrentScreen?.(`journal/${entry.id}`)}
                accessibilityLabel={`View journal entry: ${entry.title}`}
                accessibilityRole="button"
              >
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm font-medium text-gray-900">
                    {entry.title}
                  </Text>
                  <Text className="text-xs text-gray-500">{entry.date}</Text>
                </View>
                <Text className="text-xs text-gray-600 mb-2" numberOfLines={2}>
                  {entry.content}
                </Text>
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs text-gray-600">
                    {moodsToDisplay.find((m) => m.value === entry.mood)?.emoji}{" "}
                    {moodsToDisplay.find((m) => m.value === entry.mood)?.label ||
                      "Unknown Mood"}
                  </Text>
                  <ChevronRight size={14} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
              <Text className="text-base text-gray-500 text-center mb-4">
                No journal entries yet. Start by writing your first entry!
              </Text>
              <TouchableOpacity
                className="w-full bg-purple-600 py-3 rounded-lg"
                onPress={openModal}
              >
                <Text className="text-base font-medium text-white text-center">
                  Start Journaling
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default JournalScreen;