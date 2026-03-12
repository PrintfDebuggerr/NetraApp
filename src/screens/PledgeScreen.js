import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

// Star background
const generateStars = (count) => {
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.3 + 0.1,
    });
  }
  return arr;
};
const stars = generateStars(40);

const INFO_ITEMS = [
  {
    icon: 'checkmark-circle',
    lib: 'Ionicons',
    title: 'Ulaşılabilir Hedef',
    desc: 'Söz verdiğinde yalnızca bugün için relapse olmamayı taahhüt ediyorsun.',
  },
  {
    icon: 'sparkles',
    lib: 'Ionicons',
    title: 'Rahatla',
    desc: 'Günü normal yaşa. Söz verdikten sonra fikrinden dönme.',
  },
  {
    icon: 'crown',
    lib: 'Material',
    title: 'Başarı Kaçınılmaz',
    desc: 'İlk birkaç gün zor olacak ama zamanla çok daha kolaylaşacak. Güçlü dur.',
  },
];

function formatCountdown(ms) {
  if (ms <= 0) return { hours: '00', minutes: '00', seconds: '00' };
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return {
    hours: String(h).padStart(2, '0'),
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
  };
}

export default function PledgeScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pledging, setPledging] = useState(false);
  const [activePledge, setActivePledge] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [pledgeComplete, setPledgeComplete] = useState(false);

  const loadPledge = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const snap = await getDoc(doc(db, 'pledges', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        if (data.pledgedAt) {
          const pledgedAt = data.pledgedAt.toDate ? data.pledgedAt.toDate() : new Date(data.pledgedAt);
          const remaining = pledgedAt.getTime() + 24 * 60 * 60 * 1000 - Date.now();
          if (remaining > 0) {
            setActivePledge({ pledgedAt });
            setTimeLeft(remaining);
          } else {
            setPledgeComplete(true);
          }
        }
      }
    } catch {}
    setLoading(false);
  }, [user]);

  useEffect(() => { loadPledge(); }, [loadPledge]);

  useEffect(() => {
    if (!activePledge) return;
    const iv = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1000;
        if (next <= 0) {
          clearInterval(iv);
          setActivePledge(null);
          setPledgeComplete(true);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [activePledge]);

  const handlePledgeNow = async () => {
    if (!user) return;
    setPledging(true);
    try {
      await setDoc(
        doc(db, 'pledges', user.uid),
        { userId: user.uid, pledgedAt: serverTimestamp() },
        { merge: true }
      );
      setActivePledge({ pledgedAt: new Date() });
      setTimeLeft(24 * 60 * 60 * 1000);
    } catch {
      Alert.alert('Hata', 'Söz kaydedilemedi. Tekrar dene.');
    }
    setPledging(false);
  };

  const countdown = formatCountdown(timeLeft);

  if (loading) {
    return (
      <LinearGradient colors={['#070b18', '#0B1121', '#0f1a2e']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerFill}>
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#070b18', '#0B1121', '#0f1a2e']} style={styles.container}>
      {/* Stars */}
      {stars.map((star) => (
        <View
          key={star.id}
          style={[
            styles.star,
            { left: `${star.left}%`, top: `${star.top}%`, width: star.size, height: star.size, opacity: star.opacity },
          ]}
        />
      ))}

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Taahhüt</Text>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="help-circle-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Taahhüt Tamamlandı ── */}
          {pledgeComplete && (
            <View style={styles.centerContent}>
              <Text style={styles.completeEmoji}>🎉</Text>
              <Text style={styles.completeTitle}>Başardın!</Text>
              <Text style={styles.completeSubtitle}>
                24 saat temizdin!{'\n'}Bugün gücünü kanıtladın. Harikasın.
              </Text>
              <TouchableOpacity
                style={styles.pledgeNowBtn}
                onPress={() => {
                  setPledgeComplete(false);
                  setActivePledge(null);
                }}
              >
                <Text style={styles.pledgeNowText}>Tekrar Söz Ver</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Aktif Taahhüt Geri Sayımı ── */}
          {!pledgeComplete && activePledge && (
            <View style={styles.centerContent}>
              <View style={styles.handContainer}>
                <MaterialCommunityIcons name="hand-back-left" size={100} color="#d1d5db" />
              </View>
              <Text style={styles.pledgeActiveTitle}>Taahhüt Aktif</Text>
              <Text style={styles.pledgeActiveSubtitle}>
                Kararlısın. Güçlü kal!
              </Text>

              <View style={styles.countdownContainer}>
                <View style={styles.countdownUnit}>
                  <Text style={styles.countdownValue}>{countdown.hours}</Text>
                  <Text style={styles.countdownLabel}>saat</Text>
                </View>
                <Text style={styles.countdownSep}>:</Text>
                <View style={styles.countdownUnit}>
                  <Text style={styles.countdownValue}>{countdown.minutes}</Text>
                  <Text style={styles.countdownLabel}>dk</Text>
                </View>
                <Text style={styles.countdownSep}>:</Text>
                <View style={styles.countdownUnit}>
                  <Text style={styles.countdownValue}>{countdown.seconds}</Text>
                  <Text style={styles.countdownLabel}>sn</Text>
                </View>
              </View>

              <Text style={styles.countdownCaption}>taahhüdünde kalan süre</Text>

              <View style={styles.infoCard}>
                {INFO_ITEMS.map((item) => (
                  <View key={item.title} style={styles.infoItem}>
                    <View style={styles.infoIconWrapper}>
                      {item.lib === 'Material' ? (
                        <MaterialCommunityIcons name={item.icon} size={20} color="#0df2a6" />
                      ) : (
                        <Ionicons name={item.icon} size={20} color="#0df2a6" />
                      )}
                    </View>
                    <View style={styles.infoText}>
                      <Text style={styles.infoTitle}>{item.title}</Text>
                      <Text style={styles.infoDesc}>{item.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Yeni Taahhüt ── */}
          {!pledgeComplete && !activePledge && (
            <>
              <View style={styles.handContainer}>
                <MaterialCommunityIcons name="hand-back-left" size={120} color="#d1d5db" />
              </View>

              <Text style={styles.pledgeTitle}>Bugün Temizliğe Söz Ver</Text>
              <Text style={styles.pledgeSubtitle}>
                Kendinle bir taahhütte bulun. 24 saat sonra bildirim alacaksın ve nasıl gittiğini göreceksin.
              </Text>

              <View style={styles.infoCard}>
                {INFO_ITEMS.map((item, idx) => (
                  <View
                    key={item.title}
                    style={[
                      styles.infoItem,
                      idx < INFO_ITEMS.length - 1 && styles.infoItemBorder,
                    ]}
                  >
                    <View style={styles.infoIconWrapper}>
                      {item.lib === 'Material' ? (
                        <MaterialCommunityIcons name={item.icon} size={22} color="#e5e7eb" />
                      ) : (
                        <Ionicons name={item.icon} size={22} color="#e5e7eb" />
                      )}
                    </View>
                    <View style={styles.infoText}>
                      <Text style={styles.infoTitle}>{item.title}</Text>
                      <Text style={styles.infoDesc}>{item.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Tab bar spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Söz Ver Butonu */}
        {!pledgeComplete && !activePledge && (
          <View style={styles.btnContainer}>
            <TouchableOpacity
              style={[styles.pledgeNowBtn, pledging && { opacity: 0.7 }]}
              onPress={handlePledgeNow}
              disabled={pledging}
              activeOpacity={0.85}
            >
              <Text style={styles.pledgeNowText}>
                {pledging ? 'Kaydediliyor...' : 'Söz Ver'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ana Sayfaya Dön */}
        {(activePledge || pledgeComplete) && (
          <View style={styles.btnContainer}>
            <TouchableOpacity
              style={styles.backHomeBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.backHomeBtnText}>Ana Sayfaya Dön</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  star: { position: 'absolute', backgroundColor: '#fff', borderRadius: 10 },
  centerFill: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9ca3af', fontSize: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    alignItems: 'center',
  },

  centerContent: {
    alignItems: 'center',
    paddingTop: 16,
    width: '100%',
  },

  handContainer: {
    marginBottom: 24,
    opacity: 0.85,
  },

  pledgeTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  pledgeSubtitle: {
    color: '#9ca3af',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },

  infoCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 18,
    gap: 14,
  },
  infoItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  infoIconWrapper: { marginTop: 2 },
  infoText: { flex: 1 },
  infoTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoDesc: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 20,
  },

  btnContainer: {
    paddingHorizontal: 24,
    paddingBottom: 96,
    paddingTop: 8,
  },
  pledgeNowBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
  },
  pledgeNowText: {
    color: '#0a0e27',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  backHomeBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  backHomeBtnText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '600',
  },

  // Aktif taahhüt geri sayım
  pledgeActiveTitle: {
    color: '#0df2a6',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  pledgeActiveSubtitle: {
    color: '#9ca3af',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  countdownUnit: {
    alignItems: 'center',
    minWidth: 64,
    backgroundColor: 'rgba(13,242,166,0.08)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(13,242,166,0.2)',
  },
  countdownValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  countdownLabel: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  countdownSep: {
    color: '#4b5563',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
  },
  countdownCaption: {
    color: '#6b7280',
    fontSize: 13,
    marginBottom: 32,
    marginTop: 4,
  },

  // Tamamlandı ekranı
  completeEmoji: { fontSize: 72, marginBottom: 16 },
  completeTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 12,
  },
  completeSubtitle: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
});
