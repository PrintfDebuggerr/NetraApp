import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import MeditationScreen from '../screens/MeditationScreen';
import PledgeScreen from '../screens/PledgeScreen';
import AddJournalScreen from '../screens/AddJournalScreen';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="Meditation" component={MeditationScreen} />
      <Stack.Screen name="Pledge" component={PledgeScreen} />
      <Stack.Screen name="AddJournal" component={AddJournalScreen} />
    </Stack.Navigator>
  );
}
