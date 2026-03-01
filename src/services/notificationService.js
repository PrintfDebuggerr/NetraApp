import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIFICATIONS_PREF_KEY = '@notifications_enabled';
const NOTIFIED_MILESTONES_KEY = '@notified_milestones';
const DAILY_REMINDER_ID_KEY = '@daily_reminder_id';

export const MILESTONE_DAYS = [1, 7, 14, 21, 30, 45, 60, 90, 180, 365];

// App.js'de bir kez çağrılır – bildirimlerin ön plana geldiğinde nasıl davranacağını belirler
export const setupNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

// Android için bildirim kanalı oluştur
export const setupAndroidChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('streak-reminders', {
      name: 'Streak Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0df2a6',
    });
  }
};

// İzin iste (gerekirse OS izin diyaloğunu gösterir)
export const requestPermissions = async () => {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

// İzin durumunu sormadan kontrol et
export const checkPermissions = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
};

// Kullanıcı tercihini AsyncStorage'a kaydet / yükle
export const saveNotificationPref = async (enabled) => {
  await AsyncStorage.setItem(NOTIFICATIONS_PREF_KEY, JSON.stringify(enabled));
};

export const loadNotificationPref = async () => {
  const val = await AsyncStorage.getItem(NOTIFICATIONS_PREF_KEY);
  return val !== null ? JSON.parse(val) : false;
};

// Her gün 20:00'de tekrarlayan hatırlatıcı kur
export const scheduleDailyReminder = async () => {
  await cancelDailyReminder();
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Streak\'ini koru! 💪',
      body: 'Bugün güçlü kal. Her gün önemli.',
      sound: true,
      data: { type: 'daily_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });
  await AsyncStorage.setItem(DAILY_REMINDER_ID_KEY, id);
  return id;
};

export const cancelDailyReminder = async () => {
  const id = await AsyncStorage.getItem(DAILY_REMINDER_ID_KEY);
  if (id) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (_) {}
    await AsyncStorage.removeItem(DAILY_REMINDER_ID_KEY);
  }
};

// Bildirimleri aç: izin iste + kanal + hatırlatıcı + tercih kaydet
// true döner → başarılı, false → izin reddedildi
export const enableNotifications = async () => {
  await setupAndroidChannel();
  const granted = await requestPermissions();
  if (!granted) return false;
  await scheduleDailyReminder();
  await saveNotificationPref(true);
  return true;
};

// Bildirimleri kapat: hatırlatıcıyı iptal + tercih kaydet
export const disableNotifications = async () => {
  await cancelDailyReminder();
  await saveNotificationPref(false);
};

// Milestone'a özel bildirim mesajları
const MILESTONE_MESSAGES = {
  1:   { title: '🔥 İlk Gün!',      body: 'İlk günü tamamladın. Yolculuk başlıyor!' },
  7:   { title: '🛡️ Bir Hafta!',   body: '7 gün güçlü! Gerçek momentum kazanıyorsun.' },
  14:  { title: '🧠 2 Hafta!',      body: '2 hafta netlik. Beynin yeniden bağlanıyor!' },
  21:  { title: '❤️ 21 Gün!',       body: '21 gün! Yeni alışkanlıklar oluşuyor. Devam et!' },
  30:  { title: '💧 30 Gün!',       body: 'Bir ay özgür! Bunu yapabileceğini kanıtladın.' },
  45:  { title: '💎 45 Gün!',       body: '45 gün saf güç. İnanılmaz!' },
  60:  { title: '🌈 60 Gün Master!', body: 'Artık bir ustasın. 60 gün özgürlük!' },
  90:  { title: '👑 90 Gün!',       body: 'Efsanevi 90 gün. Başardın!' },
  180: { title: '⭐ 6 Ay!',          body: 'Yarım yıl özgürlük. İlham veriyorsun!' },
  365: { title: '🏆 1 Yıl!',        body: 'TAM BİR YIL. Hayatını tamamen dönüştürdün!' },
};

export const sendMilestoneNotification = async (days) => {
  const msg = MILESTONE_MESSAGES[days];
  if (!msg) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: msg.title,
      body: msg.body,
      sound: true,
      data: { type: 'milestone', days },
    },
    trigger: null, // anında gönder
  });
};

// Streak günü bir milestone'a ulaştıysa bildirim gönder (daha önce gönderilmediyse)
export const checkAndNotifyMilestone = async (currentStreak) => {
  if (!MILESTONE_DAYS.includes(currentStreak)) return;

  const granted = await checkPermissions();
  if (!granted) return;

  const notifEnabled = await loadNotificationPref();
  if (!notifEnabled) return;

  const raw = await AsyncStorage.getItem(NOTIFIED_MILESTONES_KEY);
  const notified = raw ? JSON.parse(raw) : [];
  if (notified.includes(currentStreak)) return;

  await sendMilestoneNotification(currentStreak);
  notified.push(currentStreak);
  await AsyncStorage.setItem(NOTIFIED_MILESTONES_KEY, JSON.stringify(notified));
};

// Streak sıfırlandığında çağrılır – milestone'ları sıfırla (tekrar kazanabilsin)
export const resetNotifiedMilestones = async () => {
  await AsyncStorage.removeItem(NOTIFIED_MILESTONES_KEY);
};

// Test bildirimi – 3 saniye sonra gelir (Settings'ten test için)
export const sendTestNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✅ Bildirimler Çalışıyor!',
      body: 'Günlük hatırlatıcın ve milestone bildirimlerin aktif.',
      sound: true,
    },
    trigger: { seconds: 3 },
  });
};
