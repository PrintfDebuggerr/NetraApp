import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import HomeStack from './HomeStack';
import StatsScreen from '../screens/StatsScreen';
import LibraryStack from './LibraryStack';
import FeedStack from './FeedStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color }) => {
          const size = 22;
          if (route.name === 'Home') return <Ionicons name="grid" size={size} color={color} />;
          if (route.name === 'Analytics') return <Ionicons name="bar-chart" size={size} color={color} />;
          if (route.name === 'Library') return <Ionicons name="library-outline" size={size} color={color} />;
          if (route.name === 'Community') return <Ionicons name="chatbubble-outline" size={size} color={color} />;
          if (route.name === 'Profile') return <Feather name="menu" size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={({ route }) => {
          const focused = getFocusedRouteNameFromRoute(route) ?? 'HomeMain';
          const hide = ['Pledge', 'Meditation'].includes(focused);
          return { tabBarStyle: hide ? { display: 'none' } : styles.tabBar };
        }}
      />
      <Tab.Screen name="Analytics" component={StatsScreen} />
      <Tab.Screen name="Library" component={LibraryStack} />
      <Tab.Screen name="Community" component={FeedStack} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0a0e27',
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 16,
    paddingTop: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
});
