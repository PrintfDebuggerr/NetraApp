import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, getAuthErrorMessage } from '../utils/authHelpers';
import { getGoogleAuthConfig } from '../utils/googleAuthConfig';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const { login, loginWithGoogle, sendPasswordReset, getVerificationUsername } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleConfig = useMemo(() => getGoogleAuthConfig(), []);
  const hasGoogleConfig = Boolean(
    googleConfig.expoClientId ||
      googleConfig.iosClientId ||
      googleConfig.androidClientId ||
      googleConfig.webClientId
  );

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleConfig.expoClientId || 'disabled',
    iosClientId: googleConfig.iosClientId || 'disabled',
    androidClientId: googleConfig.androidClientId || 'disabled',
    webClientId: googleConfig.webClientId || 'disabled',
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
    if (!result.success) {
      if (result.error === 'EMAIL_NOT_VERIFIED') {
        const username = await getVerificationUsername(result.email) || result.email.split('@')[0];
        setLoading(false);
        navigation.navigate('Verification', { email: result.email, username });
        return;
      }
      setLoading(false);
      setError(getAuthErrorMessage(result.error));
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
        setError(getAuthErrorMessage(result.error));
      }
    };
    runGoogleLogin();
  }, [response, loginWithGoogle]);

  const handleForgotPassword = async () => {
    setResetMessage('');
    if (!validateEmail(resetEmail)) {
      setResetMessage('Geçerli bir email adresi girin.');
      return;
    }
    setResetLoading(true);
    const result = await sendPasswordReset(resetEmail);
    setResetLoading(false);
    if (result.success) {
      setResetMessage('Şifre sıfırlama emaili gönderildi. Gelen kutunu kontrol et.');
    } else {
      setResetMessage('Email gönderilemedi. Email adresini kontrol et.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    if (!hasGoogleConfig) {
      setError('Google giriş ayarları eksik. Lütfen client ID bilgilerini ekleyin.');
      return;
    }
    try {
      await promptAsync();
    } catch (err) {
      setError(getAuthErrorMessage(err?.message || err));
    }
  };

  const isGoogleDisabled = googleLoading || !hasGoogleConfig || !request;

  return (
    <LinearGradient colors={['#080820', '#081028']} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo & Brand ── */}
          <View style={styles.brandSection}>
            <View style={styles.logoBox}>
              <Ionicons name="leaf" size={32} color="#09f668" />
            </View>
            <Text style={styles.title}>Netra</Text>
            <Text style={styles.subtitle}>Break free from your addictions</Text>
          </View>

          {/* ── Form ── */}
          <View style={styles.form}>

            {/* Email */}
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="you@example.com"
                placeholderTextColor="#475569"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>

            {/* Password header row */}
            <View style={styles.passwordLabelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity
                onPress={() => { setShowForgotPassword(!showForgotPassword); setResetMessage(''); }}
              >
                <Text style={styles.forgotLink}>Forgot?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your password"
                placeholderTextColor="#475569"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#475569"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot password expand */}
            {showForgotPassword && (
              <View style={styles.forgotBox}>
                <Text style={styles.forgotBoxTitle}>Şifre Sıfırlama</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Email adresin"
                    placeholderTextColor="#475569"
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
                {resetMessage ? (
                  <Text style={[styles.errorText, resetMessage.includes('gönderildi') && styles.successText]}>
                    {resetMessage}
                  </Text>
                ) : null}
                <TouchableOpacity
                  style={[styles.resetButton, resetLoading && styles.buttonDisabled]}
                  onPress={handleForgotPassword}
                  disabled={resetLoading}
                >
                  {resetLoading
                    ? <ActivityIndicator color="#09f668" />
                    : <Text style={styles.resetButtonText}>Sıfırlama Emaili Gönder</Text>
                  }
                </TouchableOpacity>
              </View>
            )}

            {/* Error */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Login button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#111814" />
                : <Text style={styles.loginButtonText}>Log In</Text>
              }
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google */}
            <TouchableOpacity
              style={[styles.googleButton, isGoogleDisabled && styles.buttonDisabled]}
              onPress={handleGoogleLogin}
              disabled={isGoogleDisabled}
              activeOpacity={0.85}
            >
              {googleLoading
                ? <ActivityIndicator color="#1a1a2e" />
                : (
                  <View style={styles.googleInner}>
                    <Ionicons name="logo-google" size={18} color="#1a1a2e" style={{ marginRight: 8 }} />
                    <Text style={styles.googleButtonText}>Google ile devam et</Text>
                  </View>
                )
              }
            </TouchableOpacity>
          </View>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
              <Text style={styles.signupText}>
                Don't have an account?{'  '}
                <Text style={styles.signupBold}>Sign up</Text>
              </Text>
            </TouchableOpacity>
            <Text style={styles.tosText}>
              By logging in, you agree to our{' '}
              <Text style={styles.tosLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.tosLink}>Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const INPUT_BG = 'rgba(16, 24, 40, 0.85)';
const INPUT_BORDER = 'rgba(255,255,255,0.09)';
const PRIMARY = '#09f668';

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  /* Brand */
  brandSection: {
    alignItems: 'center',
    marginTop: 72,
    marginBottom: 40,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 6,
  },

  /* Form */
  form: { width: '100%' },

  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
    marginBottom: 8,
    marginLeft: 2,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 16,
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    height: 56,
    marginBottom: 4,
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    height: 56,
    color: '#fff',
    fontSize: 15,
    paddingHorizontal: 8,
  },
  eyeBtn: {
    padding: 14,
  },

  /* Forgot box */
  forgotBox: {
    backgroundColor: 'rgba(16,24,40,0.7)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    padding: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  forgotBoxTitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  resetButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PRIMARY,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    color: PRIMARY,
    fontWeight: '600',
    fontSize: 14,
  },

  /* Errors */
  errorText: {
    color: '#f87171',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  successText: {
    color: PRIMARY,
  },

  /* Login button */
  loginButton: {
    backgroundColor: PRIMARY,
    borderRadius: 50,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    shadowOpacity: 0.45,
    elevation: 8,
  },
  loginButtonText: {
    color: '#111814',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonDisabled: { opacity: 0.55 },

  /* Divider */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dividerText: {
    color: '#475569',
    marginHorizontal: 12,
    fontSize: 13,
  },

  /* Google */
  googleButton: {
    backgroundColor: '#fff',
    borderRadius: 50,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#111814',
    fontSize: 15,
    fontWeight: '600',
  },

  /* Footer */
  footer: {
    alignItems: 'center',
    marginTop: 36,
    gap: 12,
  },
  signupText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  signupBold: {
    color: '#fff',
    fontWeight: '700',
  },
  tosText: {
    color: '#334155',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  tosLink: {
    textDecorationLine: 'underline',
    color: '#475569',
  },
});
