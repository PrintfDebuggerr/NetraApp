import React, { useState } from 'react';
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
import { useAuth } from '../contexts/AuthContext';

export default function UsernameSetupScreen() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { completeProfile, logout } = useAuth();

  const validateUsername = (name) => {
    if (name.length < 3) {
      return 'Kullanıcı adı en az 3 karakter olmalı';
    }
    if (name.length > 20) {
      return 'Kullanıcı adı en fazla 20 karakter olabilir';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      return 'Sadece harf, rakam ve alt çizgi kullanılabilir';
    }
    return null;
  };

  const handleSubmit = async () => {
    setError('');

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError('Lütfen bir kullanıcı adı girin');
      return;
    }

    const validationError = validateUsername(trimmedUsername);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const result = await completeProfile(trimmedUsername);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Bir hata oluştu');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Hoş geldin!</Text>
        <Text style={styles.subtitle}>Profilini tamamlamak için bir kullanıcı adı seç</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı adı"
            placeholderTextColor="#999"
            value={username}
            onChangeText={(text) => setUsername(text)}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
            autoFocus
          />

          <Text style={styles.hintText}>
            3-20 karakter, sadece harf, rakam ve alt çizgi
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Başla</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={loading}
          >
            <Text style={styles.logoutText}>Farklı bir hesap kullan</Text>
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
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
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
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  hintText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 16,
    paddingHorizontal: 4,
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
  errorText: {
    color: '#e94560',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoutText: {
    color: '#999',
    fontSize: 14,
  },
});
