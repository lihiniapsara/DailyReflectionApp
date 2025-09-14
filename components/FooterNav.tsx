import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Home, BookOpen, Smile, BarChart3, Settings } from 'react-native-feather';

interface FooterNavProps {
  activeScreen: string;
  setCurrentScreen: (screen: string) => void;
}

const FooterNav: React.FC<FooterNavProps> = ({ activeScreen, setCurrentScreen }) => {
  const navItems = [
    { icon: Home, label: 'Home', screen: 'home' },
    { icon: BookOpen, label: 'Journal', screen: 'journal' },
    { icon: Smile, label: 'Mood', screen: 'mood' },
    { icon: BarChart3, label: 'Insights', screen: 'insights' },
    { icon: Settings, label: 'Settings', screen: 'settings' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map(({ icon: Icon, label, screen }) => (
        <TouchableOpacity
          key={screen}
          style={styles.navItem}
          onPress={() => setCurrentScreen(screen)}
        >
          <Icon size={18} color={activeScreen === screen ? '#007AFF' : '#999'} />
          <Text style={[styles.navLabel, { color: activeScreen === screen ? '#007AFF' : '#999' }]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingVertical: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxWidth: 375,
    alignSelf: 'center',
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});

export default FooterNav;