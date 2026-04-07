import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import HomeStack from './HomeStack';
import StatsScreen from '../screens/StatsScreen';
import LibraryStack from './LibraryStack';
import FeedStack from './FeedStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

// Geometry constants — derived once so the animated bubble knows where to go.
// Wrapper: left:14 + right:14 = 28px taken from screen width.
// Container: paddingHorizontal:6 on each side.
const SCREEN_W    = Dimensions.get('window').width;
const H_PAD       = 6;                             // container paddingHorizontal
const CONTAINER_W = SCREEN_W - 28;                 // 14+14 wrapper margin
const TAB_COUNT   = 5;
const TAB_W       = (CONTAINER_W - H_PAD * 2) / TAB_COUNT;

const TAB_CONFIG = [
  { name: 'Home',      label: 'Anasayfa',  icon: 'home-outline',          iconActive: 'home'             },
  { name: 'Analytics', label: 'Analiz',    icon: 'trending-up-outline',   iconActive: 'trending-up'      },
  { name: 'Library',   label: 'Kütüphane', icon: 'library-outline',       iconActive: 'library'          },
  { name: 'Community', label: 'Topluluk',  icon: 'chatbubble-outline',    iconActive: 'chatbubble'       },
  { name: 'Profile',   label: 'Profil',    icon: 'person-circle-outline', iconActive: 'person-circle'    },
];

function GlassTabBar({ state, descriptors, navigation }) {
  // All hooks first — before any conditional return.
  const bubbleX = useRef(new Animated.Value(state.index * TAB_W)).current;

  useEffect(() => {
    Animated.spring(bubbleX, {
      toValue: state.index * TAB_W,
      useNativeDriver: true,
      damping: 22,
      stiffness: 200,
      mass: 0.7,
    }).start();
  }, [state.index]);

  // Respect hide-tabbar from screen options (e.g. Pledge screen).
  const activeRoute   = state.routes[state.index];
  const activeOptions = descriptors[activeRoute.key].options;
  if (activeOptions?.tabBarStyle?.display === 'none') return null;

  return (
    <View style={tabStyles.wrapper} pointerEvents="box-none">
      <View style={tabStyles.container}>
        {/*
          Single glass capsule that slides horizontally to the active tab.
          position:absolute + left:H_PAD means it starts aligned with tab 0;
          translateX offsets it by (index * TAB_W) for the active tab.
        */}
        <Animated.View
          pointerEvents="none"
          style={[tabStyles.activeBubble, { transform: [{ translateX: bubbleX }] }]}
        />

        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config    = TAB_CONFIG.find((t) => t.name === route.name);
          if (!config) return null;

          const iconColor = isFocused ? '#0df2a6' : 'rgba(255,255,255,0.36)';
          const iconName  = isFocused ? config.iconActive : config.icon;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.75}
              style={tabStyles.tab}
            >
              <Ionicons name={iconName} size={22} color={iconColor} />
              <Text
                style={[tabStyles.label, isFocused && tabStyles.labelActive]}
                numberOfLines={1}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={({ route }) => {
          const focused = getFocusedRouteNameFromRoute(route) ?? 'HomeMain';
          const hide = ['Pledge', 'Meditation', 'AddJournal'].includes(focused);
          return hide ? { tabBarStyle: { display: 'none' } } : {};
        }}
      />
      <Tab.Screen name="Analytics" component={StatsScreen} />
      <Tab.Screen name="Library" component={LibraryStack} />
      <Tab.Screen name="Community" component={FeedStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 18,
    left: 14,
    right: 14,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(7, 10, 28, 0.90)',
    borderRadius: 34,
    paddingVertical: 10,
    paddingHorizontal: H_PAD,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#0df2a6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 28,
    alignItems: 'center',
  },
  tab: {
    width: TAB_W,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
  },
  // Single absolutely-positioned capsule — moved by Animated.spring
  activeBubble: {
    position: 'absolute',
    left: H_PAD,          // aligns with the first tab; translateX shifts it further
    top: 4,
    bottom: 4,
    width: TAB_W - 4,     // 2px inset on each side within the tab
    backgroundColor: 'rgba(13, 242, 166, 0.10)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(13, 242, 166, 0.20)',
  },
  label: {
    fontSize: 8.5,
    marginTop: 3,
    color: 'rgba(255,255,255,0.36)',
    fontWeight: '500',
  },
  labelActive: {
    color: '#0df2a6',
    fontWeight: '700',
  },
});
