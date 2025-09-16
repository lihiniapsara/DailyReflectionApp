import React, { memo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// Type definitions for options
interface SettingOption {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  toggle?: boolean;
  extraText?: string;
}

interface Section {
  title: string;
  options: SettingOption[];
}

// Sample data for settings
const sections: Section[] = [
  {
    title: "Appearance",
    options: [{ id: "theme", title: "Theme", icon: "moon", route: "/theme" }],
  },
  {
    title: "Notifications",
    options: [
      {
        id: "reminders",
        title: "Reminders",
        icon: "notifications",
        route: "/reminders",
        toggle: true,
      },
      {
        id: "reminder-time",
        title: "Reminder Time",
        icon: "time",
        route: "/reminder-time",
        extraText: "9:00 PM",
      },
    ],
  },
  {
    title: "Data & Security",
    options: [
      {
        id: "data-backup",
        title: "Data Backup",
        icon: "cloud",
        route: "/data-backup",
      },
      {
        id: "passcode-lock",
        title: "Passcode Lock",
        icon: "lock-closed",
        route: "/passcode-lock",
        toggle: false,
      },
      {
        id: "biometrics",
        title: "Use Biometrics",
        icon: "finger-print",
        route: "/biometrics",
        toggle: false,
      },
    ],
  },
  {
    title: "Help & Support",
    options: [
      { id: "faqs", title: "FAQs", icon: "help-circle", route: "/faqs" },
      {
        id: "contact-support",
        title: "Contact Support",
        icon: "chatbubble",
        route: "/contact-support",
      },
    ],
  },
  {
    title: "About Us",
    options: [
      {
        id: "app-version",
        title: "App Version",
        icon: "information-circle",
        route: "/app-version",
        extraText: "1.2.3",
      },
      {
        id: "terms-of-service",
        title: "Terms of Service",
        icon: "document-text",
        route: "/terms-of-service",
      },
      {
        id: "privacy-policy",
        title: "Privacy Policy",
        icon: "shield",
        route: "/privacy-policy",
      },
    ],
  },
];

// Option component
const SettingOption = memo(
  ({
    option,
    onPress,
  }: {
    option: SettingOption;
    onPress: (route: string) => void;
  }) => {
    const [isToggled, setIsToggled] = useState(option.toggle || false);

    return (
      <TouchableOpacity
        className="flex-row justify-between items-center p-3 border-b border-gray-100"
        onPress={() => onPress(option.route)}
        accessibilityLabel={option.title}
        accessibilityRole="button"
      >
        <View className="flex-row items-center">
          <Ionicons name={option.icon} size={16} color="#4B5563" />
          <Text className="text-sm text-gray-900 ml-3">{option.title}</Text>
        </View>
        <View className="flex-row items-center">
          {option.extraText && (
            <Text className="text-sm text-gray-500 mr-2">{option.extraText}</Text>
          )}
          {option.toggle !== undefined ? (
            <TouchableOpacity
              className={`w-10 h-5 rounded-full justify-center px-0.5 ${
                isToggled ? "bg-blue-600" : "bg-gray-300"
              }`}
              onPress={() => setIsToggled(!isToggled)}
              accessibilityLabel={`${option.title} toggle`}
            >
              <View
                className={`w-4 h-4 bg-white rounded-full ${
                  isToggled ? "ml-5" : "mr-5"
                }`}
              />
            </TouchableOpacity>
          ) : (
            <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

const SettingsScreen: React.FC = () => {
  const router = useRouter();

  const handleOptionPress = (route: string) => {
    router.push(route);
  };

  const renderSection = ({ item }: { item: Section }) => (
    <View className="mb-4">
      <Text className="text-xs font-medium text-gray-500 uppercase ml-4 mb-2">
        {item.title}
      </Text>
      <View className="bg-white">
        <FlatList
          data={item.options}
          keyExtractor={(option) => option.id}
          renderItem={({ item: option }) => (
            <SettingOption option={option} onPress={handleOptionPress} />
          )}
          scrollEnabled={false}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 bg-gray-50">
        <Stack.Screen options={{ title: "Settings" }} />
        <View className="bg-white px-4 py-4 items-center">
          <Text className="text-xl font-semibold text-gray-900">Settings</Text>
        </View>
        <View className="flex-row items-center bg-white rounded-lg border border-gray-200 mx-4 my-4 px-3 py-2">
          <Ionicons
            name="search"
            size={16}
            color="#9CA3AF"
            className="mr-2"
          />
          <TextInput
            className="flex-1 py-0 text-sm text-gray-900"
            placeholder="Search settings"
            placeholderTextColor="#9CA3AF"
            accessibilityLabel="Search settings input"
          />
        </View>
        <FlatList
          data={sections}
          keyExtractor={(section) => section.title}
          renderItem={renderSection}
          showsVerticalScrollIndicator={false}
          className="px-4"
          contentContainerStyle={{ paddingBottom: 64 }}
        />
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;