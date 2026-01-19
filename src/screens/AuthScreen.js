import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function AuthScreen() {
  const {
    signInWithGoogle,
    googleLoading,
    googleAuthReady,
    authError,
    clearAuthError
  } = useAuth();

  useEffect(() => {
    if (authError) {
      Alert.alert('Giriş Hatası', getErrorMessage(authError), [
        { text: 'Tamam', onPress: clearAuthError }
      ]);
    }
  }, [authError, clearAuthError]);

  const getErrorMessage = (error) => {
    const errorString = String(error);

    if (errorString.includes('network')) {
      return 'İnternet bağlantısı hatası. Lütfen bağlantınızı kontrol edin.';
    }
    if (errorString.includes('cancelled') || errorString.includes('dismiss')) {
      return 'Giriş iptal edildi.';
    }
    if (errorString.includes('popup_closed')) {
      return 'Giriş penceresi kapatıldı.';
    }

    return 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.';
  };

  const handleGoogleSignIn = async () => {
    if (!googleAuthReady) {
      Alert.alert('Hata', 'Google girişi henüz hazır değil. Lütfen bekleyin.');
      return;
    }
    await signInWithGoogle();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Quitter</Text>
        <Text style={styles.subtitle}>Bağımlılıklarından kurtul</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.googleButton,
              (googleLoading || !googleAuthReady) && styles.buttonDisabled
            ]}
            onPress={handleGoogleSignIn}
            disabled={googleLoading || !googleAuthReady}
          >
            {googleLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleIcon}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Google ile devam et</Text>
              </>
            )}
          </TouchableOpacity>

          {!googleAuthReady && (
            <View style={styles.loadingHint}>
              <ActivityIndicator size="small" color="#666" />
              <Text style={styles.loadingHintText}>Google yükleniyor...</Text>
            </View>
          )}
        </View>

        <Text style={styles.termsText}>
          Devam ederek Kullanım Koşullarını ve Gizlilik Politikasını kabul etmiş olursunuz.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginBottom: 60,
  },
  buttonContainer: {
    width: '100%',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  googleButtonText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '600',
  },
  loadingHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  loadingHintText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 8,
  },
  termsText: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
