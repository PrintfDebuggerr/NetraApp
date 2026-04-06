import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getBadgeTheme } from '../utils/badgeThemes';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = 150;
const CARD_H = 196;
const SPACING = 14;
const ITEM_SIZE = CARD_W + SPACING;
const SIDE_PAD = (SCREEN_W - CARD_W) / 2;
const PRIMARY = '#0df2a6';
const LOCKED_GRAD = ['#1e2535', '#252d3d'];

// ─────────────────────────────────────────────────────────────────────
// Single achievement card
// ─────────────────────────────────────────────────────────────────────
function AchievementCard({ badge, index, scrollX, currentStreak, isCurrent, isNext }) {
  const isEarned = badge.requiredDays <= currentStreak;
  const daysLeft = Math.max(0, badge.requiredDays - currentStreak);

  // Scale + opacity driven by scroll position
  const inputRange = [
    (index - 1) * ITEM_SIZE,
    index * ITEM_SIZE,
    (index + 1) * ITEM_SIZE,
  ];
  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.84, 1, 0.84],
    extrapolate: 'clamp',
  });
  const cardOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.45, 1, 0.45],
    extrapolate: 'clamp',
  });

  // Subtle pulse for the next-to-unlock badge
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isNext) {
      pulseAnim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.022, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1100, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isNext, pulseAnim]);

  const combinedScale = isNext ? Animated.multiply(scale, pulseAnim) : scale;
  // ── All colors from theme — no hardcoding ──
  const theme = getBadgeTheme(badge.id, isEarned);
  const borderColors = isEarned ? [theme.ringColor, theme.iconColor + '80'] : LOCKED_GRAD;
  const innerBg = theme.innerBg;
  const iconSize = isCurrent ? 46 : 34;
  const iconColor = theme.iconColor;

  return (
    <Animated.View
      style={[
        styles.cardWrap,
        { opacity: cardOpacity, transform: [{ scale: combinedScale }] },
      ]}
    >
      {/* iOS glow for current/active card */}
      {isCurrent && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: 22,
              shadowColor: theme.iconColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.65,
              shadowRadius: 22,
            },
          ]}
        />
      )}

      <LinearGradient
        colors={borderColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.cardBorder,
          !isEarned && { opacity: isNext ? 0.78 : 0.5 },
          isCurrent && { elevation: 14 },
        ]}
      >
        <View style={[styles.cardInner, { backgroundColor: innerBg }]}>
          {/* Shine highlight */}
          <View style={styles.shine} />

          {/* Lock icon overlay (top-right) */}
          {!isEarned && (
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={9} color="#6b7280" />
            </View>
          )}

          {/* "CURRENT" label */}
          {isCurrent && (
            <LinearGradient
              colors={['rgba(13,242,166,0.22)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.currentLabel}
            >
              <Text style={styles.currentLabelText}>AKTİF</Text>
            </LinearGradient>
          )}

          {/* Badge icon */}
          <View style={[styles.iconArea, isCurrent && styles.iconAreaBig]}>
            {badge.iconType === 'material' ? (
              <MaterialCommunityIcons name={badge.icon} size={iconSize} color={iconColor} />
            ) : (
              <Ionicons name={badge.icon} size={iconSize} color={iconColor} />
            )}
          </View>

          {/* Badge name */}
          <Text style={[styles.cardName, !isEarned && styles.cardNameDim]}>
            {badge.name}
          </Text>

          {/* Status pill */}
          <View style={styles.statusArea}>
            {isCurrent ? (
              <View style={styles.activePill}>
                <View style={styles.activeDot} />
                <Text style={styles.activePillText}>Aktif</Text>
              </View>
            ) : isEarned ? (
              <View style={styles.earnedPill}>
                <Ionicons
                  name="checkmark"
                  size={10}
                  color={theme.iconColor}
                />
                <Text style={[styles.earnedPillText, { color: theme.iconColor }]}>
                  Kazanıldı
                </Text>
              </View>
            ) : isNext ? (
              <View style={styles.nextPill}>
                <Text style={styles.nextPillText}>
                  {daysLeft === 0 ? 'Neredeyse!' : `${daysLeft}g kaldı`}
                </Text>
              </View>
            ) : (
              <Text style={styles.lockedHint}>
                {badge.requiredDays === 0 ? 'Başlangıç' : `${badge.requiredDays}g'de açılır`}
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Carousel container
// ─────────────────────────────────────────────────────────────────────
export default function AchievementsCarousel({
  badges,
  currentStreak,
  currentBadge,
  onViewAll,
}) {
  const listRef = useRef(null);

  // Find indices
  const currentIndex = Math.max(
    0,
    badges.findIndex((b) => b.id === currentBadge?.id)
  );

  // Next badge = lowest requiredDays that user hasn't earned yet
  const nextBadge = badges
    .filter((b) => b.requiredDays > currentStreak)
    .sort((a, b) => a.requiredDays - b.requiredDays)[0];
  const nextIndex = nextBadge ? badges.findIndex((b) => b.id === nextBadge.id) : -1;

  const initialOffset = currentIndex * ITEM_SIZE;
  const scrollX = useRef(new Animated.Value(initialOffset)).current;

  // Scroll to current badge on mount (without animation)
  useEffect(() => {
    if (currentIndex > 0) {
      const t = setTimeout(() => {
        listRef.current?.scrollToOffset({ offset: initialOffset, animated: false });
      }, 80);
      return () => clearTimeout(t);
    }
  }, []);

  const renderItem = useCallback(
    ({ item, index }) => (
      <AchievementCard
        badge={item}
        index={index}
        scrollX={scrollX}
        currentStreak={currentStreak}
        isCurrent={index === currentIndex}
        isNext={index === nextIndex}
      />
    ),
    [scrollX, currentStreak, currentIndex, nextIndex]
  );

  const keyExtractor = useCallback((item) => String(item.id), []);
  const separator = useCallback(() => <View style={{ width: SPACING }} />, []);

  return (
    <View style={styles.section}>
      {/* Header row */}
      <TouchableOpacity style={styles.header} onPress={onViewAll} activeOpacity={0.7}>
        <Text style={styles.headerTitle}>Başarımlar</Text>
        <View style={styles.headerRight}>
          <Text style={styles.headerSub}>Tümünü gör</Text>
          <Ionicons name="chevron-forward" size={14} color="#6b7280" />
        </View>
      </TouchableOpacity>

      {/* Horizontal snap carousel */}
      <AnimatedFlatList
        ref={listRef}
        data={badges}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_SIZE}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={separator}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        style={styles.flatList}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    color: '#f3f4f6',
    fontSize: 17,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  headerSub: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '500',
  },

  // FlatList
  flatList: {
    marginHorizontal: -20, // break out of parent paddingHorizontal: 20
    overflow: 'visible',
  },
  listContent: {
    paddingHorizontal: SIDE_PAD,
    paddingVertical: 14, // breathing room for scale transform + glow
  },

  // Card
  cardWrap: {
    width: CARD_W,
  },
  cardBorder: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 20,
    padding: 1.5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  cardInner: {
    flex: 1,
    borderRadius: 18.5,
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 12,
  },

  // Decorative shine
  shine: {
    position: 'absolute',
    top: -48,
    left: -42,
    width: 110,
    height: 110,
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderRadius: 55,
    transform: [{ rotate: '30deg' }],
  },

  // Lock icon
  lockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(55,65,81,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    zIndex: 2,
  },

  // "CURRENT" label
  currentLabel: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(13,242,166,0.25)',
    alignSelf: 'center',
  },
  currentLabelText: {
    color: PRIMARY,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 2,
  },

  // Icon areas
  iconArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  iconAreaBig: {
    marginTop: 2,
  },

  // Badge name
  cardName: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.2,
  },
  cardNameDim: {
    color: '#374151',
  },

  // Tier labels
  cardTier: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  rainbowTierWrap: {
    marginTop: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rainbowTierText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },

  // Status area
  statusArea: {
    marginTop: 8,
    alignItems: 'center',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(13,242,166,0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(13,242,166,0.22)',
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: PRIMARY,
  },
  activePillText: {
    color: PRIMARY,
    fontSize: 10,
    fontWeight: '600',
  },
  earnedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  earnedPillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  nextPill: {
    backgroundColor: 'rgba(251,191,36,0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.28)',
  },
  nextPillText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '600',
  },
  lockedHint: {
    color: '#2d3748',
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
  },
});
