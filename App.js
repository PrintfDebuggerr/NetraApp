import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { StreakProvider } from './src/contexts/StreakContext';
import AuthStack from './src/navigation/AuthStack';
import MainTabs from './src/navigation/MainTabs';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { setupNotificationHandler } from './src/services/notificationService';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  return user ? <MainTabs /> : <AuthStack />;
}

// Bildirim handler'ı uygulama başlarken bir kez kur
setupNotificationHandler();

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
