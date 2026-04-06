import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BADGES, getCurrentBadge, getNextBadge } from '../utils/badgeData';
import { BADGE_THEMES } from '../utils/badgeThemes';
import BadgeCircle from '../components/BadgeCircle';
import { useStreak } from '../contexts/StreakContext';

const { width } = Dimensions.get('window');
const PRIMARY   = '#0df2a6';
const GRID_PAD  = 20;
const GRID_GAP  = 14;
const BADGE_SZ  = Math.floor((width - GRID_PAD * 2 - GRID_GAP * 2) / 3);

// ─── Static stars (generated once) ───────────────────────────────────────────
const STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left:    Math.random() * 100,
  top:     Math.random() * 100,
  size:    Math.random() * 1.8 + 0.8,
  opacity: Math.random() * 0.22 + 0.05,
}));

// ─── Badge grid item ──────────────────────────────────────────────────────────
function BadgeItem({ badge, currentStreak, isCurrent, index }) {
  const isEarned = badge.requiredDays <= currentStreak;
  const daysLeft = Math.max(0, badge.requiredDays - currentStreak);

  // Entry: staggered spring scale + fade
  const entryScale   = useRef(new Animated.Value(0.55)).current;
  const entryOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(entryScale, {
        toValue: 1,
        tension: 55,
        friction: 7,
        delay: index * 55,
        useNativeDriver: true,
      }),
      Animated.timing(entryOpacity, {
        toValue: isEarned ? 1 : 0.36,
        duration: 280,
        delay: index * 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.badgeItem,
        { opacity: entryOpacity, transform: [{ scale: entryScale }] },
      ]}
    >
      <BadgeCircle
        badge={badge}
        size={BADGE_SZ}
        isEarned={isEarned}
        isCurrent={isCurrent}
      />

      <View style={styles.labelWrap}>
        <Text
          style={[styles.badgeName, !isEarned && styles.badgeNameLocked]}
          numberOfLines={1}
        >
          {badge.name}
        </Text>

        {isCurrent && isEarned ? (
          <View style={styles.activePill}>
            <View style={styles.activeDot} />
            <Text style={styles.activePillText}>Aktif</Text>
          </View>
        ) : isEarned ? (
          <Text style={styles.earnedLabel}>
            {badge.requiredDays === 0 ? '—' : `${badge.requiredDays} gün`}
          </Text>
        ) : (
          <Text style={styles.lockedLabel}>
            {daysLeft === 0 ? 'Hemen!' : `${daysLeft}g kaldı`}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function AchievementsScreen({ navigation }) {
  const { streakData }   = useStreak();
  const currentStreak    = streakData?.currentStreak ?? 0;
  const currentBadge     = getCurrentBadge(currentStreak);
  const nextBadge        = getNextBadge(currentStreak);
  const earnedCount      = BADGES.filter((b) => b.requiredDays <= currentStreak).length;
  const totalCount       = BADGES.length;
  const overallPct       = (earnedCount / totalCount) * 100;

  // Segment: progress from current badge to next
  const prevDays    = currentBadge?.requiredDays ?? 0;
  const nextDays    = nextBadge?.requiredDays ?? prevDays;
  const segmentPct  = nextBadge && nextDays > prevDays
    ? Math.min(100, ((currentStreak - prevDays) / (nextDays - prevDays)) * 100)
    : 100;

  // Colors for segment bar — pulled from theme, not from badge object
  const nextTheme   = nextBadge ? BADGE_THEMES[nextBadge.id] : null;
  const curTheme    = currentBadge ? BADGE_THEMES[currentBadge.id] : null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#07090f', '#0a0d18', '#060810']} style={styles.gradient}>

        {/* Stars */}
        {STARS.map((s) => (
          <View
            key={s.id}
            style={[
              styles.star,
              { left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, opacity: s.opacity },
            ]}
          />
        ))}

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerBrand}>NETRA</Text>
            <Text style={styles.headerTitle}>Başarımlar</Text>
          </View>

          <View style={styles.countChip}>
            <Text style={styles.countChipNum}>{earnedCount}</Text>
            <Text style={styles.countChipSep}>/</Text>
            <Text style={styles.countChipTotal}>{totalCount}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Progress card ── */}
          <View style={styles.card}>
            {/* Top row: current badge name + fraction */}
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.cardLabel}>Mevcut Rozet</Text>
                <Text style={[styles.cardBadgeName, { color: curTheme?.iconColor ?? PRIMARY }]}>
                  {currentBadge?.name ?? 'Başlangıç'}
                </Text>
              </View>
              <View style={styles.fraction}>
                <Text style={styles.fractionNum}>{earnedCount}</Text>
                <Text style={styles.fractionSlash}>/</Text>
                <Text style={styles.fractionDen}>{totalCount}</Text>
              </View>
            </View>

            {/* Overall collection progress */}
            <View style={styles.barTrack}>
              <View style={[styles.barFillWrap, { width: `${overallPct}%` }]}>
                <LinearGradient
                  colors={['#0891b2', PRIMARY, '#a855f7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.barFill}
                />
              </View>
            </View>

            {/* Next badge row */}
            {nextBadge ? (
              <>
                <View style={styles.nextRow}>
                  <View>
                    <Text style={styles.nextLabel}>Sonraki Rozet</Text>
                    <Text style={[styles.nextName, { color: nextTheme?.iconColor ?? PRIMARY }]}>
                      {nextBadge.name}
                    </Text>
                  </View>
                  <View style={styles.daysLeftWrap}>
                    <Text style={styles.daysLeftNum}>
                      {Math.max(0, nextBadge.requiredDays - currentStreak)}
                    </Text>
                    <Text style={styles.daysLeftUnit}>gün</Text>
                  </View>
                </View>

                {/* Segment progress bar */}
                <View style={[styles.barTrack, { height: 4, marginTop: 8 }]}>
                  <View style={[styles.barFillWrap, { width: `${segmentPct}%` }]}>
                    <LinearGradient
                      colors={[
                        nextTheme?.ringColor  ?? PRIMARY,
                        nextTheme?.iconColor  ?? '#a855f7',
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.barFill}
                    />
                  </View>
                </View>
              </>
            ) : (
              <Text style={styles.allDoneText}>
                Tüm rozetler kazanıldı — Efsane!
              </Text>
            )}
          </View>

          {/* ── Badge grid ── */}
          <View style={styles.grid}>
            {BADGES.map((badge, i) => (
              <BadgeItem
                key={badge.id}
                badge={badge}
                currentStreak={currentStreak}
                isCurrent={badge.id === currentBadge?.id}
                index={i}
              />
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient:  { flex: 1 },
  star: { position: 'absolute', backgroundColor: '#fff', borderRadius: 10 },

  // Header
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingTop:        52,
    paddingBottom:     14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  backBtn: {
    width:           38,
    height:          38,
    borderRadius:    19,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent:  'center',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.08)',
  },
  headerCenter: { alignItems: 'center' },
  headerBrand: {
    fontSize:    9,
    fontWeight:  '800',
    color:       PRIMARY,
    letterSpacing: 3.5,
    marginBottom:  1,
  },
  headerTitle: {
    fontSize:   18,
    fontWeight: '700',
    color:      '#f3f4f6',
  },
  countChip: {
    flexDirection:   'row',
    alignItems:      'baseline',
    backgroundColor: 'rgba(13,242,166,0.08)',
    borderRadius:    10,
    paddingHorizontal: 10,
    paddingVertical:   5,
    borderWidth:     1,
    borderColor:     'rgba(13,242,166,0.18)',
    gap: 2,
  },
  countChipNum:   { fontSize: 15, fontWeight: '800', color: PRIMARY },
  countChipSep:   { fontSize: 12, fontWeight: '400', color: 'rgba(13,242,166,0.4)' },
  countChipTotal: { fontSize: 12, fontWeight: '500', color: 'rgba(13,242,166,0.5)' },

  // Scroll
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: GRID_PAD, paddingTop: 20 },

  // Progress card
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius:    22,
    padding:         18,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.07)',
    marginBottom:    28,
  },
  cardTop: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   14,
  },
  cardLabel: {
    fontSize:      10,
    fontWeight:    '600',
    color:         '#4b5563',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom:  3,
  },
  cardBadgeName: {
    fontSize:   22,
    fontWeight: '800',
  },
  fraction: {
    flexDirection: 'row',
    alignItems:    'baseline',
    gap: 2,
  },
  fractionNum:   { fontSize: 30, fontWeight: '800', color: '#f3f4f6' },
  fractionSlash: { fontSize: 18, fontWeight: '400', color: '#2d3748' },
  fractionDen:   { fontSize: 15, fontWeight: '500', color: '#374151' },

  // Bars
  barTrack: {
    height:          7,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius:    999,
    overflow:        'hidden',
  },
  barFillWrap: { height: '100%' },
  barFill:     { flex: 1 },

  // Next badge
  nextRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginTop:      14,
  },
  nextLabel: {
    fontSize:      9,
    fontWeight:    '700',
    color:         '#374151',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom:  3,
  },
  nextName:      { fontSize: 14, fontWeight: '700' },
  daysLeftWrap:  { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  daysLeftNum:   { fontSize: 26, fontWeight: '800', color: '#f3f4f6' },
  daysLeftUnit:  { fontSize: 12, fontWeight: '500', color: '#4b5563' },
  allDoneText: {
    fontSize:   12,
    fontWeight: '600',
    color:      PRIMARY,
    textAlign:  'center',
    marginTop:  12,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           GRID_GAP,
  },

  // Badge item
  badgeItem: {
    width:      BADGE_SZ,
    alignItems: 'center',
    gap:        10,
    marginBottom: 6,
  },
  labelWrap: {
    alignItems: 'center',
    gap:        4,
    width:      BADGE_SZ,
  },
  badgeName: {
    fontSize:   12,
    fontWeight: '700',
    color:      '#e5e7eb',
    textAlign:  'center',
  },
  badgeNameLocked: { color: '#1e2a3a' },
  earnedLabel:     { fontSize: 10, fontWeight: '500', color: '#374151' },
  lockedLabel:     { fontSize: 10, fontWeight: '500', color: '#1a2030' },

  // Active pill
  activePill: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             4,
    backgroundColor: 'rgba(13,242,166,0.1)',
    borderRadius:    6,
    paddingHorizontal: 7,
    paddingVertical:   2,
    borderWidth:     1,
    borderColor:     'rgba(13,242,166,0.22)',
  },
  activeDot:     { width: 5, height: 5, borderRadius: 3, backgroundColor: PRIMARY },
  activePillText: { color: PRIMARY, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
});
