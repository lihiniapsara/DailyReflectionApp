import React from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions,
  ScrollView
} from "react-native";
import { ChevronLeft } from "react-native-feather";
import { Mood } from "../../types/Mood";

interface MoodScreenProps {
  setCurrentScreen?: (screen: string) => void;
  moods?: Mood[];
  selectedMood?: string;
  setSelectedMood?: (mood: string) => void;
}

const { width } = Dimensions.get('window');

const MoodScreen: React.FC<MoodScreenProps> = ({
  setCurrentScreen,
  moods = [],
  selectedMood = "",
  setSelectedMood,
}) => {
  // Sample default moods
   const defaultMoods: Mood[] = [
    { emoji: "😊", label: "Amazing", value: "amazing", color: "bg-green-500" },
    { emoji: "🙂", label: "Good", value: "good", color: "bg-blue-500" },
    { emoji: "😐", label: "Okay", value: "okay", color: "bg-yellow-500" },
    { emoji: "😞", label: "Not Great", value: "not-great", color: "bg-orange-500" },
    { emoji: "😠", label: "Awful", value: "awful", color: "bg-red-500" },
  ];

  // Use passed moods or fallback to default moods
  const moodsToDisplay = moods.length > 0 ? moods : defaultMoods;

  // Calculate button width based on screen size
  const buttonWidth = (width - 64) / 3; // 64 = padding (16*4)

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between bg-white px-4 py-3 border-b border-gray-200">
          <TouchableOpacity 
            onPress={() => setCurrentScreen?.("home")}
            className="p-1"
          >
            <ChevronLeft size={24} color="#4B5563" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Mood</Text>
          <View className="w-8" />
        </View>

        {/* Content */}
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, padding: 16, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-xl font-semibold text-gray-900 text-center mb-8 mt-4">
            How are you feeling today?
          </Text>
          
          <View className="flex-row flex-wrap justify-between mb-8">
            {moodsToDisplay.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={{ width: buttonWidth }}
                className={`p-4 border-2 rounded-xl items-center mb-4 bg-white min-h-[100px] justify-center
                  ${selectedMood === mood.value 
                    ? 'border-purple-500 bg-purple-50 transform scale-105' 
                    : 'border-gray-200'
                  }`}
                onPress={() => setSelectedMood?.(mood.value)}
              >
                <Text className="text-3xl mb-2">{mood.emoji}</Text>
                <Text className="text-sm font-medium text-gray-700 text-center">
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            className="bg-purple-600 py-4 rounded-xl items-center mt-4"
            onPress={() => setCurrentScreen?.("home")}
          >
            <Text className="text-base font-semibold text-white">Next</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default MoodScreen;