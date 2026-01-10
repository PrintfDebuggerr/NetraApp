import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function VerificationScreen({ navigation, route }) {
  const { email, password, username } = route.params || {};
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const { verifyEmailCode, resendVerificationEmail, completeRegistration } = useAuth();
  
  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleCodeChange = (text, index) => {
    if (text.length > 1) {
      text = text.slice(-1);
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (fullCode) => {
    if (!email || !password || !username) {
      Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı');
      return;
    }

    setLoading(true);
    const verifyResult = await verifyEmailCode(email, fullCode);
    
    if (verifyResult.success) {
      const registrationResult = await completeRegistration(
        verifyResult.data.email,
        verifyResult.data.password,
        verifyResult.data.username
      );
      
      setLoading(false);
      
      if (registrationResult.success) {
        Alert.alert('Hoş Geldin! 🎉', 'Hesabın başarıyla oluşturuldu ve giriş yaptın!', [
          {
            text: 'Tamam'
          }
        ]);
      } else {
        Alert.alert('Hata', registrationResult.error || 'Hesap oluşturulamadı');
      }
    } else {
      setLoading(false);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      Alert.alert('Hata', verifyResult.error || 'Doğrulama başarısız');
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    if (!email || !password || !username) {
      Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı');
      return;
    }

    setResendLoading(true);
    const result = await resendVerificationEmail(email, password, username);
    setResendLoading(false);

    if (result.success) {
      setCountdown(60);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      Alert.alert('Başarılı', 'Yeni doğrulama kodu gönderildi. Lütfen email kutunuzu kontrol edin.');
    } else {
      Alert.alert('Hata', result.error || 'Kod gönderilemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleChangeEmail = () => {
    Alert.alert(
      'Email Değiştir',
      'Email adresinizi değiştirmek için yeni bir hesap oluşturmanız gerekiyor.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Yeni Hesap',
          onPress: () => navigation.navigate('Register')
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={80} color="#e94560" />
          <View style={styles.checkmarkBadge}>
            <Ionicons name="shield-checkmark" size={30} color="#fff" />
          </View>
        </View>

        <Text style={styles.title}>Email Doğrulama</Text>
        <Text style={styles.subtitle}>6 haneli kodu girin</Text>

        <View style={styles.emailContainer}>
          <Text style={styles.emailLabel}>Doğrulama kodu gönderildi:</Text>
          <Text style={styles.emailText}>{email}</Text>
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            📧 Email kutunuzu kontrol edin{'\n'}
            🔢 6 haneli kodu aşağıya girin{'\n'}
            ⏱️ Kod 5 dakika geçerlidir
          </Text>
        </View>

        <View style={styles.codeInputContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.codeInput,
                digit ? styles.codeInputFilled : null
              ]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!loading}
            />
          ))}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e94560" />
            <Text style={styles.loadingText}>Doğrulanıyor...</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.resendButton, (resendLoading || countdown > 0) && styles.buttonDisabled]}
          onPress={handleResendCode}
          disabled={resendLoading || countdown > 0}
        >
          {resendLoading ? (
            <ActivityIndicator color="#e94560" />
          ) : (
            <>
              <Ionicons name="refresh-outline" size={20} color="#e94560" style={styles.buttonIcon} />
              <Text style={styles.resendButtonText}>
                {countdown > 0 ? `Yeni Kod Gönder (${countdown}s)` : 'Yeni Kod Gönder'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.changeEmailButton}
          onPress={handleChangeEmail}
        >
          <Text style={styles.changeEmailText}>Farklı Email Kullan</Text>
        </TouchableOpacity>

        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            💡 Email gelmedi mi? Spam klasörünü kontrol edin
          </Text>
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
    paddingVertical: 50,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  checkmarkBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1a1a2e',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
  emailContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  emailLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    color: '#e94560',
    fontWeight: 'bold',
  },
  instructionsContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  instructionsText: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 28,
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  codeInput: {
    width: 50,
    height: 60,
    backgroundColor: '#16213e',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0f3460',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  codeInputFilled: {
    borderColor: '#e94560',
    backgroundColor: '#1f2a44',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    color: '#999',
    marginTop: 10,
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  resendButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e94560',
    marginBottom: 15,
  },
  resendButtonText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: 'bold',
  },
  changeEmailButton: {
    alignItems: 'center',
    padding: 10,
    marginBottom: 20,
  },
  changeEmailText: {
    color: '#999',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  helpContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  helpText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});
