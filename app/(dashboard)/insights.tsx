import { Mood, MoodDistribution, WeeklyMoodData } from "../../types/Mood";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BarChart } from "react-native-chart-kit";
import { useRouter } from "expo-router";

interface InsightsScreenProps {
  setCurrentScreen?: (screen: string) => void;
  weeklyMoodData?: WeeklyMoodData[];
  moodDistribution?: MoodDistribution[];
  moods?: Mood[];
}

const InsightsScreen: React.FC<InsightsScreenProps> = ({
  setCurrentScreen,
  weeklyMoodData = [],
  moodDistribution = [],
  moods = [],
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Mood");
  const [chartWidth, setChartWidth] = useState(0);
  const { width, height } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  // Check if we should show back button
  const showBackButton = setCurrentScreen !== undefined;

  useEffect(() => {
    setChartWidth(width - 40);
  }, [width]);

  const defaultWeeklyMoodData: WeeklyMoodData[] = [
    { day: "Mon", value: 4.2, mood: "good" },
    { day: "Tue", value: 4.8, mood: "amazing" },
    { day: "Wed", value: 4.1, mood: "good" },
    { day: "Thu", value: 3.5, mood: "okay" },
    { day: "Fri", value: 2.8, mood: "not-great" },
    { day: "Sat", value: 4.9, mood: "amazing" },
    { day: "Sun", value: 4.3, mood: "good" },
  ];

  const defaultMoods: Mood[] = [
    { emoji: "😊", label: "Amazing", value: "amazing", color: "bg-green-500" },
    { emoji: "🙂", label: "Good", value: "good", color: "bg-blue-500" },
    { emoji: "😐", label: "Okay", value: "okay", color: "bg-yellow-500" },
    { emoji: "😞", label: "Not Great", value: "not-great", color: "bg-orange-500" },
    { emoji: "😠", label: "Awful", value: "awful", color: "bg-red-500" },
  ];

  const dataToDisplay = weeklyMoodData.length > 0 ? weeklyMoodData : defaultWeeklyMoodData;
  const moodsToDisplay = moods.length > 0 ? moods : defaultMoods;

  // Calculate average score and improvement
  const averageScore = (
    dataToDisplay.reduce((sum, item) => sum + item.value, 0) /
    dataToDisplay.length
  ).toFixed(1);
  const lastWeekAverage = 3.7;
  const improvement = (
    ((parseFloat(averageScore) - lastWeekAverage) / lastWeekAverage) *
    100
  ).toFixed(0);

  // Chart data for react-native-chart-kit
  const chartData = {
    labels: dataToDisplay.map((item) => item.day.substring(0, 3)),
    datasets: [
      {
        data: dataToDisplay.map((item) => item.value),
      },
    ],
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header - Fixed height */}
        <View className="flex-row items-center justify-between bg-white px-4 py-3 border-b border-gray-200">
          {/* Back button - only show if setCurrentScreen is provided */}
          {showBackButton ? (
            <TouchableOpacity 
              onPress={() => setCurrentScreen?.("home")}
              className="p-1"
            >
              <Feather name="chevron-left" size={22} color="#4B5563" />
            </TouchableOpacity>
          ) : (
            <View className="w-6" /> // Empty spacer when no back button
          )}
          
          <Text className="text-lg font-bold text-gray-900">Insights</Text>
          
          <TouchableOpacity 
            onPress={() => router.push('/settings')}
            className="p-1"
          >
            <Feather name="settings" size={22} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {/* Tab Container - Fixed height */}
        <View className="flex-row bg-gray-100 mx-3 my-3 rounded-lg p-1">
          {["Mood", "Goals", "Journals"].map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-2 rounded-md ${activeTab === tab ? "bg-purple-600" : ""}`}
              onPress={() => setActiveTab(tab)}
            >
              <Text className={`text-xs text-center ${activeTab === tab ? "text-white font-semibold" : "text-gray-600"}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main Content - Takes remaining space */}
        <View className="flex-1 px-3">
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {activeTab === "Mood" && (
              <View className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900">Mood Trends</Text>
                    <Text className="text-xs text-gray-500">Last 7 days overview</Text>
                  </View>
                  <View className="bg-purple-500 p-1.5 rounded-lg ml-2">
                    <Feather name="trending-up" size={18} color="#FFFFFF" />
                  </View>
                </View>
                
                <View className="flex-row justify-between mb-3">
                  <View className="bg-green-50 p-2 rounded-lg flex-1 mr-2">
                    <Text className="text-lg font-bold text-green-800">{averageScore}</Text>
                    <Text className="text-xs text-green-600">Average Score</Text>
                  </View>
                  <View className="bg-blue-50 p-2 rounded-lg flex-1 ml-2">
                    <Text className="text-lg font-bold text-blue-800">{`+${improvement}%`}</Text>
                    <Text className="text-xs text-blue-600">Improvement</Text>
                  </View>
                </View>
                
                {chartWidth > 0 && (
                  <View className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                    <BarChart
                      data={chartData}
                      width={chartWidth}
                      height={isSmallScreen ? 180 : 200}
                      yAxisLabel=""
                      yAxisSuffix=""
                      fromZero={true}
                      withInnerLines={false}
                      withOuterLines={false}
                      chartConfig={{
                        backgroundColor: "#FFFFFF",
                        backgroundGradientFrom: "#FFFFFF",
                        backgroundGradientTo: "#F9FAFB",
                        decimalPlaces: 1,
                        color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
                        style: {
                          borderRadius: 12,
                        },
                        propsForDots: {
                          r: "3",
                          strokeWidth: "1",
                          stroke: "#7C3AED"
                        },
                        propsForLabels: {
                          fontSize: isSmallScreen ? 9 : 10,
                        },
                        barPercentage: 0.5,
                      }}
                      style={{
                        borderRadius: 8,
                        marginVertical: 6,
                      }}
                      verticalLabelRotation={0}
                    />
                  </View>
                )}
              </View>
            )}
            
            {activeTab === "Goals" && (
              <View className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900">Goals</Text>
                    <Text className="text-xs text-gray-500">Your progress and targets</Text>
                  </View>
                  <View className="bg-purple-500 p-1.5 rounded-lg ml-2">
                    <Feather name="target" size={18} color="#FFFFFF" />
                  </View>
                </View>
                
                <View className="space-y-2">
                  <View className="flex-row items-start">
                    <View className="bg-green-100 rounded-full w-4 h-4 items-center justify-center mt-0.5 mr-2">
                      <Feather name="check" size={10} color="#059669" />
                    </View>
                    <Text className="text-sm text-gray-700 flex-1">
                      Complete 5 workouts this week
                    </Text>
                  </View>
                  
                  <View className="flex-row items-start">
                    <View className="bg-blue-100 rounded-full w-4 h-4 items-center justify-center mt-0.5 mr-2">
                      <Text className="text-[10px] text-blue-600">2/4</Text>
                    </View>
                    <Text className="text-sm text-gray-700 flex-1">
                      Read 1 book by end of September
                    </Text>
                  </View>
                  
                  <View className="flex-row items-start">
                    <View className="bg-yellow-100 rounded-full w-4 h-4 items-center justify-center mt-0.5 mr-2">
                      <Text className="text-[10px] text-yellow-600">3/7</Text>
                    </View>
                    <Text className="text-sm text-gray-700 flex-1">
                      Meditate daily for 10 minutes
                    </Text>
                  </View>
                </View>
              </View>
            )}
            
            {activeTab === "Journals" && (
              <View className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900">Journals</Text>
                    <Text className="text-xs text-gray-500">Your recent entries</Text>
                  </View>
                  <View className="bg-purple-500 p-1.5 rounded-lg ml-2">
                    <Feather name="book" size={18} color="#FFFFFF" />
                  </View>
                </View>
                
                <View className="space-y-3">
                  <View className="border-b border-gray-100 pb-2">
                    <Text className="text-xs text-gray-500">2025-09-14</Text>
                    <Text className="text-sm text-gray-800 mt-1">
                      Had a great day, finished a project! 😊
                    </Text>
                  </View>
                  
                  <View className="border-b border-gray-100 pb-2">
                    <Text className="text-xs text-gray-500">2025-09-13</Text>
                    <Text className="text-sm text-gray-800 mt-1">
                      Felt a bit stressed, need to relax. 😞
                    </Text>
                  </View>
                  
                  <View className="border-b border-gray-100 pb-2">
                    <Text className="text-xs text-gray-500">2025-09-12</Text>
                    <Text className="text-sm text-gray-800 mt-1">
                      Productive morning routine made a difference. 🙂
                    </Text>
                  </View>
                  
                  <TouchableOpacity className="pt-1">
                    <Text className="text-purple-600 text-xs font-medium text-center">
                      View All Journal Entries
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default InsightsScreen;