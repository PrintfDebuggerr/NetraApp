import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useStreak } from '../contexts/StreakContext';
import { useAuth } from '../contexts/AuthContext';
import PanicModal from '../components/PanicModal';
import StreakOptionsModal from '../components/StreakOptionsModal';
import DatePickerModal from '../components/DatePickerModal';
import HeroBadgeCarousel from '../components/HeroBadgeCarousel';
import { getCurrentBadge, badges } from '../utils/badgeData';
import { db } from '../../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const MOTIVATIONAL_QUOTES = [
  'Bugün bir başlangıç. Küçük adımlar, büyük değişimler yaratır.',
  'Direneceğin her gün bir zafer. Düşündüğünden çok daha güçlüsün.',
  'En zorlu savaşlar içinde kazanılır. Sen kazanıyorsun.',
  'Gelecekteki sen, güçlü kaldığın her gün için sana teşekkür edecek.',
  'İlerleme, mükemmellik değil. Devam et. Başarabilirsin.',
  'Bu, büyük bir şeyin başlangıcı. Yolda kal.',
  'Netlik, enerji, amaç — hepsi öte tarafta seni bekliyor.',
];

const generateStars = (count) => {
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.1,
    });
  }
  return arr;
};
const stars = generateStars(60);

function formatPornFreeFor(timer) {
  if (timer.days > 0) return `${timer.days}g`;
  if (timer.hours > 0) return `${timer.hours}s`;
  if (timer.minutes > 0) return `${timer.minutes}d`;
  return `${timer.seconds}sn`;
}

function ActionButton({ icon, label, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.actionIconWrap, danger && styles.actionIconWrapDanger]}>{icon}</View>
      <Text style={[styles.actionLabel, danger && styles.actionLabelDanger]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { streakData, timer, brainRewiring, resetStreak, editStreak } = useStreak();
  const { user } = useAuth();
  const [showPanicModal, setShowPanicModal] = useState(false);
  const [showStreakOptions, setShowStreakOptions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState({ cardTop: 0, cardCenterX: 0 });
  const statsCardRef = useRef(null);
  const [pledgeReason, setPledgeReason] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [editReason, setEditReason] = useState('');

  const currentStreak = streakData?.currentStreak || 0;
  const currentBadge = getCurrentBadge(currentStreak);
  const tilSober = Math.max(0, 90 - currentStreak);
  const quote = MOTIVATIONAL_QUOTES[currentStreak % MOTIVATIONAL_QUOTES.length];

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'pledges', user.uid));
        if (snap.exists() && snap.data().reason) {
          setPledgeReason(snap.data().reason);
        }
      } catch {}
    })();
  }, [user]);

  const handleSaveReason = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'pledges', user.uid), { reason: editReason }, { merge: true });
      setPledgeReason(editReason);
      setShowReasonModal(false);
    } catch {
      Alert.alert('Hata', 'Kaydedilemedi. Tekrar dene.');
    }
  };

  const handleDateSave = async (date) => {
    try {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      await editStreak(days);
    } catch {
      Alert.alert('Hata', 'Streak güncellenemedi. Tekrar dene.');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0B1121', '#162035', '#1a2642']} style={styles.gradient}>
        {stars.map((star) => (
          <View
            key={star.id}
            style={[
              styles.star,
              {
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
              },
            ]}
          />
        ))}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.logo}>QUITTR</Text>
              <Text style={styles.headerMotto}>Ya bir gün, ya bugün.</Text>
            </View>
            <View style={styles.streakPill}>
              <Ionicons name="flame" size={15} color="#0df2a6" />
              <Text style={styles.streakPillText}>{currentStreak} G STREAK</Text>
            </View>
          </View>

          {/* ── Hero Badge Carousel ── */}
          <HeroBadgeCarousel
            badges={badges}
            currentStreak={currentStreak}
            currentBadge={currentBadge}
            onNavigateToAll={() => navigation.navigate('Achievements')}
          />

          {/* ── Motto under badge ── */}
          <Text style={styles.mottoText}>Ya bir gün, ya bugün.</Text>

          {/* ── Stats Row ── */}
          <TouchableOpacity
            ref={statsCardRef}
            style={styles.statsRow}
            onPress={() => {
              statsCardRef.current?.measureInWindow((x, y, width, height) => {
                setPopoverAnchor({ cardTop: y, cardCenterX: x + width / 2 });
                setShowStreakOptions(true);
              });
            }}
            activeOpacity={0.75}
          >
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Nüks</Text>
              <Text style={styles.statValue}>{streakData?.relapses || 0}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Temiz Süre</Text>
              <Text style={[styles.statValue, { color: '#0df2a6' }]}>{formatPornFreeFor(timer)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Hedef</Text>
              <Text style={styles.statValue}>{tilSober}g</Text>
            </View>
          </TouchableOpacity>

          {/* ── Action Buttons ── */}
          <View style={styles.actionsRow}>
            <ActionButton
              icon={<MaterialCommunityIcons name="hand-back-left" size={26} color="#a78bfa" />}
              label="Söz Ver"
              onPress={() => navigation.navigate('Pledge')}
            />
            <ActionButton
              icon={<MaterialCommunityIcons name="meditation" size={26} color="#60a5fa" />}
              label="Meditasyon"
              onPress={() => navigation.navigate('Meditation')}
            />
            <ActionButton
              danger
              icon={<Ionicons name="refresh-circle" size={28} color="#f87171" />}
              label="Sıfırla"
              onPress={() =>
                Alert.alert(
                  'Streak Sıfırla',
                  'Streak\'ini sıfırlamak istediğinden emin misin? Bu bir nüks olarak kaydedilecek.\n\nYa bir gün, ya bugün.',
                  [
                    { text: 'Vazgeç', style: 'cancel' },
                    { text: 'Sıfırla', style: 'destructive', onPress: resetStreak },
                  ]
                )
              }
            />
          </View>

          {/* ── Zihin Gelişimi Bar ── */}
          <View style={styles.brainRow}>
            <Text style={styles.brainLabel}>Zihin Gelişimi</Text>
            <View style={styles.brainTrack}>
              <LinearGradient
                colors={['#0df2a6', '#06b6d4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.brainFill, { width: `${Math.max(brainRewiring, 2)}%` }]}
              />
            </View>
            <Text style={styles.brainPct}>{brainRewiring}%</Text>
          </View>

          {/* ── Quote Card ── */}
          <View style={styles.quoteCard}>
            <Text style={styles.quoteOpenMark}>{'\u201C\u201C'}</Text>
            <Text style={styles.quoteText}>{quote}</Text>
            <Text style={styles.quoteCloseMark}>{'\u201D\u201D'}</Text>
          </View>

          {/* ── Engellenen Siteler Stub ── */}
          <TouchableOpacity
            style={styles.listCard}
            activeOpacity={0.75}
            onPress={() => Alert.alert('Yakında', 'Site engelleme özelliği çok yakında geliyor.')}
          >
            <View style={styles.listCardLeft}>
              <View style={styles.listCardIconRed}>
                <Ionicons name="ban" size={22} color="#ef4444" />
              </View>
              <View>
                <Text style={styles.listCardTitle}>Engellenen Siteler</Text>
                <Text style={styles.listCardSub}>Engellemek istediklerini seç</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          {/* ── Günlük ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Günlük</Text>
          </View>
          <TouchableOpacity
            style={styles.addNewBtn}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Yakında', 'Günlük özelliği çok yakında geliyor.')}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.addNewText}>Yeni Ekle</Text>
          </TouchableOpacity>

          {/* ── Neden Bırakıyorum ── */}
          <View style={styles.whyCard}>
            <View style={styles.whyCardHeader}>
              <View style={styles.whyCardLeft}>
                <View style={styles.whyIconWrap}>
                  <Ionicons name="help" size={14} color="#9ca3af" />
                </View>
                <Text style={styles.whyCardLabel}>Neden Bırakıyorum</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setEditReason(pledgeReason);
                  setShowReasonModal(true);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="pencil" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.whyText}>
              {pledgeReason ? `\u2018${pledgeReason}\u2019` : 'Sebebini yazmak için kaleme dokun...'}
            </Text>
            <View style={styles.whyBestRow}>
              <Ionicons name="star-outline" size={13} color="#facc15" />
              <Text style={styles.whyBestText}>En iyi {streakData?.longestStreak || 0} gün</Text>
            </View>
          </View>

          {/* Bottom spacer: panic button height + gap + tab bar */}
          <View style={{ height: 160 }} />
        </ScrollView>

        {/* ── Acil Durum Butonu (her zaman görünür) ── */}
        <TouchableOpacity
          style={styles.stickyPanicButton}
          onPress={() => setShowPanicModal(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="alert-circle" size={22} color="#fff" />
          <Text style={styles.panicText}>Acil Durum</Text>
        </TouchableOpacity>

        {/* ── Modals ── */}
        <PanicModal visible={showPanicModal} onClose={() => setShowPanicModal(false)} />

        <StreakOptionsModal
          visible={showStreakOptions}
          anchorCardTop={popoverAnchor.cardTop}
          anchorCenterX={popoverAnchor.cardCenterX}
          onClose={() => setShowStreakOptions(false)}
          onEditStartDate={() => setShowDatePicker(true)}
          onReset={() =>
            Alert.alert(
              'Seriyi Sıfırla',
              "Serini sıfırlamak istediğinden emin misin? Bu bir nüks olarak kaydedilecek.\n\nYa bir gün, ya bugün.",
              [
                { text: 'Vazgeç', style: 'cancel' },
                { text: 'Sıfırla', style: 'destructive', onPress: resetStreak },
              ]
            )
          }
        />

        <DatePickerModal
          visible={showDatePicker}
          initialDate={
            streakData?.startDate
              ? (streakData.startDate instanceof Date
                  ? streakData.startDate
                  : streakData.startDate.toDate?.() || new Date(streakData.startDate))
              : new Date()
          }
          onClose={() => setShowDatePicker(false)}
          onSave={handleDateSave}
        />

        {/* Neden Bırakıyorum Modal */}
        <Modal
          visible={showReasonModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowReasonModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalOverlay}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Neden Bırakıyorum</Text>
              <Text style={styles.modalSubtitle}>
                Zor anlarda güçlü kalmak için kişisel sebebini yaz.
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { fontSize: 15, minHeight: 80, textAlignVertical: 'top', paddingTop: 14 },
                ]}
                value={editReason}
                onChangeText={setEditReason}
                placeholder="Sebebim..."
                placeholderTextColor="#6b7280"
                multiline
                maxLength={200}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowReasonModal(false)}
                >
                  <Text style={styles.modalCancelText}>Vazgeç</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSaveReason}>
                  <Text style={styles.modalConfirmText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  star: { position: 'absolute', backgroundColor: '#fff', borderRadius: 10 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 52 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
  },
  headerMotto: {
    color: 'rgba(255,255,255,0.28)',
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 1.2,
    fontStyle: 'italic',
    marginTop: 2,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(13, 242, 166, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(13, 242, 166, 0.25)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  streakPillText: {
    color: '#0df2a6',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Motto under badge
  mottoText: {
    color: 'rgba(255,255,255,0.22)',
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 1.5,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: -4,
    marginBottom: 12,
  },

  // Main Badge
  mainBadgeCenter: {
    alignItems: 'center',
    marginBottom: 16,
  },
  mainBadgeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBadgeOuterGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(13, 242, 166, 0.05)',
  },
  mainBadgeGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(13, 242, 166, 0.08)',
  },
  mainBadgeRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    padding: 5,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
  },
  mainBadgeInner: {
    flex: 1,
    borderRadius: 85,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  badgeShine: {
    position: 'absolute',
    top: -55,
    left: -55,
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 70,
    transform: [{ rotate: '45deg' }],
  },

  // Badge Info
  badgeInfo: {
    alignItems: 'center',
    marginBottom: 22,
    gap: 2,
  },
  badgeName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  badgeDays: {
    color: '#9ca3af',
    fontSize: 15,
    fontWeight: '400',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(13,242,166,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(13,242,166,0.12)',
    paddingVertical: 18,
    marginBottom: 22,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  statValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 2,
  },

  // Action Buttons
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 28,
    marginBottom: 24,
  },
  actionButton: { alignItems: 'center', gap: 9 },
  actionIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(13,242,166,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(13,242,166,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIconWrapDanger: {
    backgroundColor: 'rgba(248,113,113,0.07)',
    borderColor: 'rgba(248,113,113,0.2)',
  },
  actionLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
  },
  actionLabelDanger: {
    color: 'rgba(248,113,113,0.7)',
  },

  // Horizontal Achievements
  achievementsSection: {
    marginBottom: 24,
  },
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  achievementsTitle: {
    color: '#f3f4f6',
    fontSize: 17,
    fontWeight: '700',
  },
  achievementsScroll: {
    paddingVertical: 4,
    gap: 14,
  },
  achieveBadge: {
    alignItems: 'center',
    gap: 6,
    width: 72,
  },
  achieveBadgeCurrentRing: {
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#0df2a6',
    padding: 2,
  },
  achieveBadgeRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 3,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  achieveBadgeInner: {
    flex: 1,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  achieveBadgeName: {
    color: '#d1d5db',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  achieveBadgeNameDim: {
    color: '#4b5563',
  },
  achieveBadgeDaysText: {
    color: '#0df2a6',
    fontSize: 10,
    fontWeight: '600',
  },
  achieveBadgeDaysDim: {
    color: '#6b7280',
  },

  // Brain Rewiring
  brainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  brainLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
    minWidth: 100,
  },
  brainTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(13,242,166,0.08)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  brainFill: {
    height: '100%',
    borderRadius: 999,
  },
  brainPct: {
    color: '#0df2a6',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'right',
  },

  // Quote Card
  quoteCard: {
    backgroundColor: 'rgba(13,242,166,0.03)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(13,242,166,0.1)',
    padding: 22,
    marginBottom: 14,
  },
  quoteOpenMark: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 26,
    lineHeight: 20,
    marginBottom: 6,
    fontWeight: '900',
  },
  quoteText: {
    color: '#e5e7eb',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
    textAlign: 'center',
  },
  quoteCloseMark: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 26,
    lineHeight: 14,
    marginTop: 6,
    fontWeight: '900',
    textAlign: 'right',
  },

  // Websites Blocked Card
  listCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  listCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  listCardIconRed: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listCardTitle: {
    color: '#f3f4f6',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  listCardSub: {
    color: '#9ca3af',
    fontSize: 12,
  },

  // Journal
  sectionHeader: { marginBottom: 12 },
  sectionTitle: {
    color: '#f3f4f6',
    fontSize: 18,
    fontWeight: '700',
  },
  addNewBtn: {
    backgroundColor: 'rgba(13,242,166,0.1)',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(13,242,166,0.3)',
    shadowColor: '#0df2a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  addNewText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  // Why I'm Quitting
  whyCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 18,
    marginBottom: 20,
    gap: 10,
  },
  whyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  whyCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  whyIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  whyCardLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  whyText: {
    color: '#e5e7eb',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  whyBestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  whyBestText: {
    color: '#facc15',
    fontSize: 12,
    fontWeight: '600',
  },

  // Sticky Panic Button
  stickyPanicButton: {
    position: 'absolute',
    bottom: 88,
    left: 20,
    right: 20,
    backgroundColor: '#dc2626',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.25)',
  },
  panicText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    backgroundColor: '#141f33',
    borderRadius: 22,
    padding: 28,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#0b1221',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#9ca3af',
    fontSize: 15,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0df2a6',
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#0a0e27',
    fontSize: 15,
    fontWeight: '700',
  },
});
