import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import HomeStack from './HomeStack';
import StatsScreen from '../screens/StatsScreen';
import LibraryScreen from '../screens/LibraryScreen';
import FeedStack from './FeedStack';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }) {
  const iconColor = focused ? '#fff' : 'rgba(255,255,255,0.4)';
  const iconSize = 24;

  const icons = {
    Home: <Ionicons name="grid" size={iconSize} color={iconColor} />,
    Stats: <Ionicons name="bar-chart" size={iconSize} color={iconColor} />,
    Library: <Ionicons name="library-outline" size={iconSize} color={iconColor} />,
    Feed: <Ionicons name="chatbubble-outline" size={iconSize} color={iconColor} />,
    Profile: <Feather name="menu" size={iconSize} color={iconColor} />,
  };

  return (
    <View style={styles.tabIconContainer}>
      {icons[name]}
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
      />
      <Tab.Screen 
        name="Stats" 
        component={StatsScreen}
      />
      <Tab.Screen 
        name="Library" 
        component={LibraryScreen}
      />
      <Tab.Screen 
        name="Feed" 
        component={FeedStack}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0a0e27',
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 20,
    paddingTop: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
