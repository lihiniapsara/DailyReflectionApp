import React, { useState, useRef } from "react";
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
} from "react-native";
import {
  DateTimePickerAndroid,
  DateTimePicker,
} from "@react-native-community/datetimepicker";
import { ChevronRight } from "react-native-feather";
import { JournalEntry } from "../../types/JournalEntry";
import { Mood, defaultMoods } from "../../types/Mood";
import { createJournal } from "@/services/journalService";

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
  // Sample data
  const defaultJournalEntries: JournalEntry[] = [
    {
      id: "1",
      title: "First Day Reflection",
      date: "2025-09-14",
      content: "Today was a great day with good weather and a nice walk.",
      mood: "good",
    },
    {
      id: "2",
      title: "Weekend Thoughts",
      date: "2025-09-13",
      content: "Spent the weekend relaxing, but felt a bit tired.",
      mood: "okay",
    },
  ];

  // Use passed data or fallback to default data
  const entriesToDisplay =
    journalEntries.length > 0 ? journalEntries : defaultJournalEntries;
  const moodsToDisplay = moods.length > 0 ? moods : defaultMoods;

  // State for modal and form
  const [isModalVisible, setModalVisible] = useState(false);
  const [newEntry, setNewEntry] = useState<JournalEntry>({
    id: "",
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0], // Default to current date
    mood: "",
  });
  const [tempEntries, setTempEntries] =
    useState<JournalEntry[]>(entriesToDisplay);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const animatedValues = useRef(
    moodsToDisplay.map(() => new Animated.Value(1))
  ).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  // Handle mood button animation
  const animateMoodButton = (index: number) => {
    Animated.timing(animatedValues[index], {
      toValue: 1.1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
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
      const newId = (tempEntries.length + 1).toString();
      await createJournal(newEntry);
      setTempEntries([{ ...newEntry, id: newId }, ...tempEntries]);
      setModalVisible(false);
      setNewEntry({
        id: "",
        title: "",
        content: "",
        date: new Date().toISOString().split("T")[0],
        mood: "",
      });
      setDate(new Date());
      animateModal(false);
    }
  };

  // Open modal
  const openModal = () => {
    setModalVisible(true);
    animateModal(true);
  };

  return (
    <SafeAreaView>
      <View className="flex-1 bg-gray-50">
        {/* Modal for New Journal Entry */}
        <Modal
          animationType="none"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            animateModal(false);
          }}
        >
          <Animated.View
            className="flex-1 justify-center items-center bg-black/50"
            style={{ opacity: modalOpacity }}
          >
            <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md shadow-lg">
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
                          ? `${mood.color.replace("bg-", "bg-gradient-to-r from-")} via-${mood.color.replace("bg-", "")}/90 to-${mood.color.replace("bg-", "")}/70 text-white shadow-md`
                          : "bg-white border border-gray-200 shadow-sm"
                      }`}
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
              <View className="flex-row justify-end space-x-2">
                <TouchableOpacity
                  className="bg-gray-200 py-2 px-4 rounded-full"
                  onPress={() => {
                    setModalVisible(false);
                    animateModal(false);
                  }}
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
                      : "bg-gradient-to-r from-purple-600 to-purple-500"
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
          <TouchableOpacity
            className="bg-gradient-to-r from-purple-600 to-purple-500 py-2 px-4 rounded-full shadow-sm"
            onPress={openModal}
            accessibilityLabel="Add new journal entry"
            accessibilityRole="button"
          >
            <Text className="text-sm font-medium text-white">+ New</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView className="p-4">
          {entriesToDisplay.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              className="bg-white p-4 rounded-xl border border-gray-200 mb-3 shadow-sm"
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
              <Text className="text-xs text-gray-600 line-clamp-2 mb-2">
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
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default JournalScreen;
