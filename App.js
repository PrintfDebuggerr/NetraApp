import * as WebBrowser from 'expo-web-browser';

// CRITICAL: Must be called at module scope before any component
WebBrowser.maybeCompleteAuthSession();

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { StreakProvider } from './src/contexts/StreakContext';
import AuthStack from './src/navigation/AuthStack';
import MainTabs from './src/navigation/MainTabs';
import UsernameSetupScreen from './src/screens/UsernameSetupScreen';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

function AppContent() {
  const { user, loading, isNewUser } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  if (user && isNewUser) {
    return <UsernameSetupScreen />;
  }

  if (user) {
    return <MainTabs />;
  }

  return <AuthStack />;
}

export default function App() {
  return (
    <AuthProvider>
      <StreakProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </StreakProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
