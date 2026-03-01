import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import {
  loadNotificationPref,
  enableNotifications,
  disableNotifications,
  sendTestNotification,
} from '../services/notificationService';

const PRIMARY = '#0df2a6';

function SettingsRow({ icon, iconBgColor, title, subtitle, hasToggle, toggleValue, onToggle, onPress, destructive }) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={hasToggle}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.rowIconBg, { backgroundColor: iconBgColor }]}>
          {icon}
        </View>
        <View>
          <Text style={[styles.rowTitle, destructive && { color: '#f87171' }]}>{title}</Text>
          {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {hasToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: '#374151', true: PRIMARY }}
          thumbColor="#fff"
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={destructive ? '#f87171' : '#6b7280'} />
      )}
    </TouchableOpacity>
  );
}

function SectionDivider() {
  return <View style={styles.divider} />;
}

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Kaydedilmiş bildirim tercihini yükle
  useEffect(() => {
    loadNotificationPref().then(setNotificationsEnabled);
  }, []);

  const handleNotificationToggle = async (value) => {
    if (value) {
      const success = await enableNotifications();
      if (success) {
        setNotificationsEnabled(true);
      } else {
        // İzin reddedildi – kullanıcıyı ayarlara yönlendir
        Alert.alert(
          'Bildirim İzni Gerekli',
          'Bildirimleri açmak için lütfen cihaz ayarlarından izin verin.',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Ayarları Aç', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } else {
      await disableNotifications();
      setNotificationsEnabled(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Not Available', 'Account deletion is not yet available. Please contact support.'),
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0B1121', '#162035', '#1a2642']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Account Section */}
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.card}>
            <SettingsRow
              icon={<Ionicons name="person-outline" size={18} color="#60a5fa" />}
              iconBgColor="rgba(59,130,246,0.15)"
              title="Email"
              subtitle={user?.email || '—'}
              onPress={() => {}}
            />
            <SectionDivider />
            <SettingsRow
              icon={<Ionicons name="lock-closed-outline" size={18} color="#a78bfa" />}
              iconBgColor="rgba(139,92,246,0.15)"
              title="Change Password"
              subtitle="Reset via email"
              onPress={() =>
                Alert.alert(
                  'Change Password',
                  'A password reset email will be sent to ' + (user?.email || 'your email') + '.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Send', onPress: () => {} },
                  ]
                )
              }
            />
          </View>

          {/* Preferences Section */}
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <View style={styles.card}>
            <SettingsRow
              icon={<Ionicons name="notifications-outline" size={18} color="#34d399" />}
              iconBgColor="rgba(52,211,153,0.15)"
              title="Notifications"
              subtitle="Streak reminders & badges"
              hasToggle
              toggleValue={notificationsEnabled}
              onToggle={handleNotificationToggle}
            />
            {notificationsEnabled && (
              <>
                <SectionDivider />
                <SettingsRow
                  icon={<Ionicons name="flask-outline" size={18} color="#34d399" />}
                  iconBgColor="rgba(52,211,153,0.1)"
                  title="Test Notification"
                  subtitle="3 saniye sonra gelir"
                  onPress={async () => {
                    await sendTestNotification();
                    Alert.alert('Gönderildi', '3 saniye sonra bildirim gelecek. Uygulamayı arka plana al.');
                  }}
                />
              </>
            )}
            <SectionDivider />
            <SettingsRow
              icon={<Ionicons name="moon-outline" size={18} color="#818cf8" />}
              iconBgColor="rgba(129,140,248,0.15)"
              title="Dark Mode"
              hasToggle
              toggleValue={darkMode}
              onToggle={setDarkMode}
            />
          </View>

          {/* Support Section */}
          <Text style={styles.sectionLabel}>SUPPORT</Text>
          <View style={styles.card}>
            <SettingsRow
              icon={<Ionicons name="help-circle-outline" size={18} color="#fbbf24" />}
              iconBgColor="rgba(251,191,36,0.15)"
              title="Help & FAQ"
              onPress={() => Alert.alert('Help', 'Support documentation coming soon.')}
            />
            <SectionDivider />
            <SettingsRow
              icon={<Ionicons name="mail-outline" size={18} color="#fb923c" />}
              iconBgColor="rgba(251,146,60,0.15)"
              title="Contact Support"
              onPress={() => Alert.alert('Contact', 'support@netraapp.com')}
            />
            <SectionDivider />
            <SettingsRow
              icon={<Ionicons name="document-text-outline" size={18} color="#94a3b8" />}
              iconBgColor="rgba(148,163,184,0.1)"
              title="Privacy Policy"
              onPress={() => {}}
            />
          </View>

          {/* Danger Zone */}
          <Text style={styles.sectionLabel}>ACCOUNT ACTIONS</Text>
          <View style={styles.card}>
            <SettingsRow
              icon={<Ionicons name="log-out-outline" size={18} color="#f87171" />}
              iconBgColor="rgba(248,113,113,0.1)"
              title="Log Out"
              destructive
              onPress={handleLogout}
            />
            <SectionDivider />
            <SettingsRow
              icon={<Ionicons name="trash-outline" size={18} color="#f87171" />}
              iconBgColor="rgba(248,113,113,0.1)"
              title="Delete Account"
              destructive
              onPress={handleDeleteAccount}
            />
          </View>

          <Text style={styles.versionText}>Version 1.2.0</Text>
          <View style={{ height: 60 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  sectionLabel: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: 'rgba(22,32,53,0.7)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginLeft: 64,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  rowIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#e5e7eb',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  versionText: {
    textAlign: 'center',
    color: '#374151',
    fontSize: 12,
    marginTop: 32,
  },
});
