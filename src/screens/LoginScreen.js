import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, getAuthErrorMessage } from '../utils/authHelpers';
import { getGoogleAuthConfig } from '../utils/googleAuthConfig';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, loginWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleConfig = useMemo(() => getGoogleAuthConfig(), []);
  const hasGoogleConfig = Boolean(
    googleConfig.expoClientId ||
      googleConfig.iosClientId ||
      googleConfig.androidClientId ||
      googleConfig.webClientId
  );

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleConfig.expoClientId || undefined,
    iosClientId: googleConfig.iosClientId || undefined,
    androidClientId: googleConfig.androidClientId || undefined,
    webClientId: googleConfig.webClientId || undefined,
    prompt: 'select_account',
  });

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    if (!validateEmail(email)) {
      setError('Geçersiz email adresi');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      const errorMessage = getAuthErrorMessage(result.error);
      setError(errorMessage);
    }
  };

  useEffect(() => {
    const runGoogleLogin = async () => {
      if (response?.type !== 'success') return;

      const idToken = response.params?.id_token;
      if (!idToken) {
        setError('Google oturumu açılamadı. Lütfen tekrar deneyin.');
        return;
      }

      setGoogleLoading(true);
      const result = await loginWithGoogle(idToken);
      setGoogleLoading(false);

      if (!result.success) {
        const errorMessage = getAuthErrorMessage(result.error);
        setError(errorMessage);
      }
    };

    runGoogleLogin();
  }, [response, loginWithGoogle]);

  const handleGoogleLogin = async () => {
    setError('');

    if (!hasGoogleConfig) {
      setError('Google giriş ayarları eksik. Lütfen client ID bilgilerini ekleyin.');
      return;
    }

    try {
      await promptAsync();
    } catch (error) {
      setError(getAuthErrorMessage(error?.message || error));
    }
  };

  const isGoogleDisabled = googleLoading || !hasGoogleConfig || !request;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Quitter</Text>
        <Text style={styles.subtitle}>Hoş Geldin</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={(text) => setEmail(text)}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Şifre"
            placeholderTextColor="#999"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, isGoogleDisabled && styles.buttonDisabled]}
            onPress={handleGoogleLogin}
            disabled={isGoogleDisabled}
          >
            {googleLoading ? (
              <ActivityIndicator color="#1a1a2e" />
            ) : (
              <Text style={styles.googleButtonText}>Google ile devam et</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            <Text style={styles.linkText}>
              Hesabın yok mu? <Text style={styles.linkTextBold}>Kayıt Ol</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#999',
    textAlign: 'center',
    marginBottom: 50,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  button: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e94560',
  },
  googleButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#999',
    fontSize: 14,
  },
  linkTextBold: {
    color: '#e94560',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#e94560',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#0f3460',
  },
  dividerText: {
    color: '#999',
    marginHorizontal: 12,
  },
});
