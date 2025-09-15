import React, { memo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

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
    title: 'Appearance',
    options: [
      { id: 'theme', title: 'Theme', icon: 'moon', route: '/theme' },
    ],
  },
  {
    title: 'Notifications',
    options: [
      { id: 'reminders', title: 'Reminders', icon: 'notifications', route: '/reminders', toggle: true },
      { id: 'reminder-time', title: 'Reminder Time', icon: 'time', route: '/reminder-time', extraText: '9:00 PM' },
    ],
  },
  {
    title: 'Data & Security',
    options: [
      { id: 'data-backup', title: 'Data Backup', icon: 'cloud', route: '/data-backup' },
      { id: 'passcode-lock', title: 'Passcode Lock', icon: 'lock-closed', route: '/passcode-lock', toggle: false },
      { id: 'biometrics', title: 'Use Biometrics', icon: 'finger-print', route: '/biometrics', toggle: false },
    ],
  },
  {
    title: 'Help & Support',
    options: [
      { id: 'faqs', title: 'FAQs', icon: 'help-circle', route: '/faqs' },
      { id: 'contact-support', title: 'Contact Support', icon: 'chatbubble', route: '/contact-support' },
    ],
  },
  {
    title: 'About Us',
    options: [
      { id: 'app-version', title: 'App Version', icon: 'information-circle', route: '/app-version', extraText: '1.2.3' },
      { id: 'terms-of-service', title: 'Terms of Service', icon: 'document-text', route: '/terms-of-service' },
      { id: 'privacy-policy', title: 'Privacy Policy', icon: 'shield', route: '/privacy-policy' },
    ],
  },
];

// Option component
const SettingOption = memo(
  ({ option, onPress }: { option: SettingOption; onPress: (route: string) => void }) => {
    const [isToggled, setIsToggled] = useState(option.toggle || false);

    return (
      <TouchableOpacity
        style={styles.option}
        onPress={() => onPress(option.route)}
        accessibilityLabel={option.title}
        accessibilityRole="button"
      >
        <View style={styles.optionContent}>
          <Ionicons name={option.icon} size={16} color="#4B5563" />
          <Text style={styles.optionText}>{option.title}</Text>
        </View>
        <View style={styles.chevron}>
          {option.extraText && <Text style={styles.timeText}>{option.extraText}</Text>}
          {option.toggle !== undefined ? (
            <TouchableOpacity
              style={isToggled ? styles.toggleOn : styles.toggleOff}
              onPress={() => setIsToggled(!isToggled)}
              accessibilityLabel={`${option.title} toggle`}
            >
              <View style={styles.toggleDot} />
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
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{item.title}</Text>
      <View style={styles.card}>
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
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Settings' }} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
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
        contentContainerStyle={{ paddingBottom: 64 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 14,
    color: '#1F2937',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginLeft: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 12,
  },
  chevron: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleOn: {
    width: 40,
    height: 20,
    backgroundColor: '#2563EB',
    borderRadius: 9999,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOff: {
    width: 40,
    height: 20,
    backgroundColor: '#D1D5DB',
    borderRadius: 9999,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleDot: {
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    marginLeft: 'auto',
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
});

export default SettingsScreen;