import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const PRIMARY = '#0df2a6';

const STARS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 1.5 + 0.8,
  opacity: Math.random() * 0.25 + 0.08,
}));

const INFO_ITEMS = [
  {
    icon: 'checkmark-circle',
    title: 'Ulaşılabilir Hedef',
    desc: 'Sadece bugün için temiz kalmaya söz ver.',
  },
  {
    icon: 'remove-circle',
    title: 'Fikrini Değiştirme',
    desc: 'Günü normal yaşa ve verdiğin sözü bozma.',
  },
  {
    icon: 'trending-up',
    title: 'Zor Başlar, Kolaylaşır',
    desc: 'İlk günler zor olabilir, sonra hafifler.',
  },
];

function formatCountdown(ms) {
  if (ms <= 0) return { hours: '00', minutes: '00', seconds: '00' };
  const totalSec = Math.floor(ms / 1000);
  return {
    hours:   String(Math.floor(totalSec / 3600)).padStart(2, '0'),
    minutes: String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0'),
    seconds: String(totalSec % 60).padStart(2, '0'),
  };
}

export default function PledgeScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading]             = useState(true);
  const [pledging, setPledging]           = useState(false);
  const [activePledge, setActivePledge]   = useState(null);
  const [timeLeft, setTimeLeft]           = useState(0);
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
    if (!user?.uid) return;
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

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <LinearGradient colors={['#070b18', '#0B1121', '#0f1a2e']} style={styles.fill}>
        <SafeAreaView style={styles.fill}>
          <View style={styles.centerFill}>
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── Completed ─────────────────────────────────────────────────────────────
  if (pledgeComplete) {
    return (
      <LinearGradient colors={['#070b18', '#0B1121', '#0f1a2e']} style={styles.fill}>
        <SafeAreaView style={styles.fill}>
          <View style={styles.screen}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Taahhüt</Text>
              <View style={styles.headerBtn} />
            </View>
            <View style={styles.completeCenter}>
              <Text style={styles.completeEmoji}>🎉</Text>
              <Text style={styles.completeTitle}>Başardın!</Text>
              <Text style={styles.completeSubtitle}>
                24 saat temizdin.{'\n'}Bugün gücünü kanıtladın.
              </Text>
            </View>
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => { setPledgeComplete(false); setActivePledge(null); }}
              >
                <Text style={styles.primaryBtnText}>Tekrar Söz Ver</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── Active Pledge ─────────────────────────────────────────────────────────
  if (activePledge) {
    return (
      <LinearGradient colors={['#070b18', '#0B1121', '#0f1a2e']} style={styles.fill}>
        {STARS.map((s) => (
          <View key={s.id} style={[styles.star, { left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, opacity: s.opacity }]} />
        ))}
        <SafeAreaView style={styles.fill}>
          <View style={styles.screen}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Taahhüt</Text>
              <View style={styles.headerBtn} />
            </View>

            <View style={styles.activeCenter}>
              <View style={styles.iconWrap}>
                <MaterialCommunityIcons name="hand-back-left" size={72} color="#d1d5db" />
              </View>
              <Text style={styles.activeTitleText}>Taahhüt Aktif</Text>
              <Text style={styles.activeSubText}>Kararlısın. Güçlü kal!</Text>
              <View style={styles.countdownRow}>
                <View style={styles.countUnit}>
                  <Text style={styles.countValue}>{countdown.hours}</Text>
                  <Text style={styles.countLabel}>saat</Text>
                </View>
                <Text style={styles.countSep}>:</Text>
                <View style={styles.countUnit}>
                  <Text style={styles.countValue}>{countdown.minutes}</Text>
                  <Text style={styles.countLabel}>dk</Text>
                </View>
                <Text style={styles.countSep}>:</Text>
                <View style={styles.countUnit}>
                  <Text style={styles.countValue}>{countdown.seconds}</Text>
                  <Text style={styles.countLabel}>sn</Text>
                </View>
              </View>
              <Text style={styles.countCaption}>taahhüdünde kalan süre</Text>
            </View>

            <View style={styles.bottomSection}>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.ghostBtnText}>Ana Sayfaya Dön</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── New Pledge (main view) ────────────────────────────────────────────────
  return (
    <LinearGradient colors={['#070b18', '#0B1121', '#0f1a2e']} style={styles.fill}>
      {STARS.map((s) => (
        <View key={s.id} style={[styles.star, { left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, opacity: s.opacity }]} />
      ))}
      <SafeAreaView style={styles.fill}>
        <View style={styles.screen}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Taahhüt</Text>
            <View style={styles.headerBtn} />
          </View>

          {/* ── Middle ── */}
          <View style={styles.middle}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="hand-back-left" size={80} color="#d1d5db" />
            </View>
            <Text style={styles.mainHeader}>Bugün Söz Ver</Text>
            <Text style={styles.mainDesc}>
              Bugün kendine söz ver. 24 saat sonra nasıl geçtiğini kontrol edeceksin.
            </Text>
          </View>

          {/* ── Bottom ── */}
          <View style={styles.bottomSection}>
            <View style={styles.card}>
              {INFO_ITEMS.map((item, idx) => (
                <View
                  key={item.title}
                  style={[
                    styles.cardItem,
                    idx < INFO_ITEMS.length - 1 && styles.cardItemBorder,
                  ]}
                >
                  <View style={styles.cardIconWrap}>
                    <Ionicons name={item.icon} size={18} color={PRIMARY} />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDesc}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, pledging && { opacity: 0.7 }]}
              onPress={handlePledgeNow}
              disabled={pledging}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>
                {pledging ? 'Kaydediliyor...' : 'Söz Ver'}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  star: { position: 'absolute', backgroundColor: '#fff', borderRadius: 10 },

  screen: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },

  centerFill: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9ca3af', fontSize: 16 },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Middle ──
  middle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  iconWrap: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainHeader: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  mainDesc: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },

  // ── Bottom Section ──
  bottomSection: {
    gap: 14,
  },

  // ── Card ──
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  cardItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  cardIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(13,242,166,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  cardText: { flex: 1 },
  cardTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardDesc: {
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 18,
  },

  // ── Buttons ──
  primaryBtn: {
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#0a0e27',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ghostBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    paddingVertical: 17,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ghostBtnText: {
    color: '#9ca3af',
    fontSize: 15,
    fontWeight: '600',
  },

  // ── Active Pledge ──
  activeCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTitleText: {
    color: PRIMARY,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  activeSubText: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 28,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  countUnit: {
    alignItems: 'center',
    minWidth: 68,
    backgroundColor: 'rgba(13,242,166,0.07)',
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(13,242,166,0.18)',
  },
  countValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  countLabel: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  countSep: {
    color: '#374151',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 14,
  },
  countCaption: {
    color: '#4b5563',
    fontSize: 12,
    letterSpacing: 0.3,
  },

  // ── Complete ──
  completeCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  completeEmoji: { fontSize: 64, marginBottom: 8 },
  completeTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  completeSubtitle: {
    color: '#9ca3af',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
});
