import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, Bell, Cloud, ChevronRight, Info, Lock, Shield, FileText, HelpCircle, MessageCircle } from 'react-native-feather';
import { useRouter } from 'expo-router'; // Added for navigation

const SettingsScreen = () => {
  const router = useRouter();

  // Function to handle navigation or actions
  const handleOptionPress = (route: string) => {
    router.push(route); // Navigate to the specified route
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Search size={16} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search settings"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleOptionPress('/theme')}
          >
            <View style={styles.optionContent}>
              <View style={styles.iconPlaceholder}>
                <Text style={styles.iconText}>🌙</Text> {/* Placeholder for Theme icon */}
              </View>
              <Text style={styles.optionText}>Theme</Text>
            </View>
            <View style={styles.chevron}>
              <ChevronRight size={14} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleOptionPress('/reminders')}
          >
            <View style={styles.optionContent}>
              <Bell size={16} color="#4B5563" />
              <Text style={styles.optionText}>Reminders</Text>
            </View>
            <View style={styles.toggleOn}>
              <View style={styles.toggleDot} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleOptionPress('/reminder-time')}
          >
            <View style={styles.optionContent}>
              <View style={styles.iconPlaceholder}>
                <Text style={styles.iconText}>⏰</Text> {/* Placeholder for Clock icon */}
              </View>
              <Text style={styles.optionText}>Reminder Time</Text>
            </View>
            <View style={styles.chevron}>
              <Text style={styles.timeText}>9:00 PM</Text>
              <ChevronRight size={14} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Security</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleOptionPress('/data-backup')}
          >
            <View style={styles.optionContent}>
              <Cloud size={16} color="#4B5563" />
              <Text style={styles.optionText}>Data Backup</Text>
            </View>
            <View style={styles.chevron}>
              <ChevronRight size={14} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleOptionPress('/passcode-lock')}
          >
            <View style={styles.optionContent}>
              <Lock size={16} color="#4B5563" />
              <Text style={styles.optionText}>Passcode Lock</Text>
            </View>
            <View style={styles.toggleOff}>
              <View style={styles.toggleDot} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleOptionPress('/biometrics')}
          >
            <View style={styles.optionContent}>
              <Shield size={16} color="#4B5563" />
              <Text style={styles.optionText}>Use Biometrics</Text>
            </View>
            <View style={styles.toggleOff}>
              <View style={styles.toggleDot} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help & Support</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleOptionPress('/faqs')}
          >
            <View style={styles.optionContent}>
              <HelpCircle size={16} color="#4B5563" />
              <Text style={styles.optionText}>FAQs</Text>
            </View>
            <View style={styles.chevron}>
              <ChevronRight size={14} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleOptionPress('/contact-support')}
          >
            <View style={styles.optionContent}>
              <MessageCircle size={16} color="#4B5563" />
              <Text style={styles.optionText}>Contact Support</Text>
            </View>
            <View style={styles.chevron}>
              <ChevronRight size={14} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Us</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleOptionPress('/app-version')}
          >
            <View style={styles.optionContent}>
              <Info size={16} color="#4B5563" />
              <Text style={styles.optionText}>App Version</Text>
            </View>
            <Text style={styles.versionText}>1.2.3</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleOptionPress('/terms-of-service')}
          >
            <View style={styles.optionContent}>
              <FileText size={16} color="#4B5563" />
              <Text style={styles.optionText}>Terms of Service</Text>
            </View>
            <View style={styles.chevron}>
              <ChevronRight size={14} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleOptionPress('/privacy-policy')}
          >
            <View style={styles.optionContent}>
              <Shield size={16} color="#4B5563" />
              <Text style={styles.optionText}>Privacy Policy</Text>
            </View>
            <View style={styles.chevron}>
              <ChevronRight size={14} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingBottom: 64, // Adjusted for tab bar
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
  versionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  iconPlaceholder: {
    width: 16,
    height: 16,
    borderRadius: 9999,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 12,
    color: '#4B5563',
  },
});

export default SettingsScreen;