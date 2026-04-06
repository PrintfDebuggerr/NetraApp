import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getBadgeTheme } from '../utils/badgeThemes';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const { width: SCREEN_W } = Dimensions.get('window');

// Layout constants
const PEEK = 42;                        // visible strip of neighboring badge
const SLIDE_W = SCREEN_W - 2 * PEEK;   // each pager slide width

// Badge visual sizes — reduced for compactness
const CONTAINER_SZ = 210;
const RING_SZ = 156;
const GLOW_OUTER_SZ = 210;
const GLOW_INNER_SZ = 176;
const PULSE_SZ = 172;
const ICON_SZ = 52;

const STORAGE_KEY = '@badge_carousel_last_index';

const PRIMARY = '#0df2a6';
const LOCKED_GRAD = ['#1a2035', '#252d3d'];

// ─────────────────────────────────────────────────────────────────────
// Individual badge slide
// ─────────────────────────────────────────────────────────────────────
const BadgeSlide = React.memo(function BadgeSlide({
  badge,
  index,
  scrollX,
  currentStreak,
  isCurrent,
  isNext,
  onPress,
  onLongPress,
}) {
  const isEarned = badge.requiredDays <= currentStreak;
  const daysLeft = Math.max(0, badge.requiredDays - currentStreak);

  // Scroll-driven scale + fade
  const scale = useMemo(
    () =>
      scrollX.interpolate({
        inputRange: [(index - 1) * SLIDE_W, index * SLIDE_W, (index + 1) * SLIDE_W],
        outputRange: [0.78, 1.0, 0.78],
        extrapolate: 'clamp',
      }),
    [scrollX, index]
  );
  const fadeOpacity = useMemo(
    () =>
      scrollX.interpolate({
        inputRange: [(index - 1) * SLIDE_W, index * SLIDE_W, (index + 1) * SLIDE_W],
        outputRange: [0.28, 1.0, 0.28],
        extrapolate: 'clamp',
      }),
    [scrollX, index]
  );

  // Independent pulse ring for the "next" badge
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isNext) {
      pulseScale.setValue(1);
      pulseOpacity.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, { toValue: 1.13, duration: 1100, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.5, duration: 550, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, { toValue: 1, duration: 850, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0, duration: 850, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isNext, pulseScale, pulseOpacity]);

  const theme = getBadgeTheme(badge.id, isEarned);
  const ringColors = isEarned ? [theme.ringColor, theme.iconColor + '90'] : LOCKED_GRAD;
  const innerBg = theme.innerBg;
  const iconColor = theme.iconColor;

  let statusText, statusStyleKey;
  if (isCurrent) {
    statusText = `${currentStreak} gün`;
    statusStyleKey = 'statusCurrent';
  } else if (isEarned) {
    statusText = `Kazanıldı  ·  ${badge.requiredDays} gün`;
    statusStyleKey = 'statusEarned';
  } else {
    statusText = `${badge.requiredDays} günde açılır`;
    statusStyleKey = 'statusLocked';
  }

  return (
    <Animated.View style={[styles.slideOuter, { opacity: fadeOpacity, transform: [{ scale }] }]}>
      <View style={styles.slide}>

        {/* Ring container */}
        <View style={styles.ringContainer}>

          <View
            style={[
              styles.glowOuter,
              isCurrent && isEarned && { backgroundColor: theme.outerGlow },
            ]}
          />
          <View
            style={[
              styles.glowInner,
              isCurrent && isEarned && { backgroundColor: theme.outerGlow },
            ]}
          />

          <Animated.View
            pointerEvents="none"
            style={[
              styles.pulseRing,
              {
                borderColor: isEarned ? theme.iconColor : '#1e2a3a',
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              },
            ]}
          />

          <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.88}
            style={styles.ringWrap}
          >
            <LinearGradient
              colors={ringColors}
              style={[
                styles.badgeRing,
                isCurrent && isEarned && {
                  shadowColor: theme.iconColor,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.75,
                  shadowRadius: 28,
                  elevation: 14,
                },
                !isEarned && { opacity: 0.55 },
              ]}
            >
              <View style={[styles.badgeInner, { backgroundColor: innerBg }]}>
                <View style={styles.badgeShine} />
                {!isEarned ? (
                  <Ionicons name="lock-closed" size={28} color={iconColor} />
                ) : badge.iconType === 'material' ? (
                  <MaterialCommunityIcons name={badge.icon} size={ICON_SZ} color={iconColor} />
                ) : (
                  <Ionicons name={badge.icon} size={ICON_SZ} color={iconColor} />
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Text area */}
        <Text style={[styles.badgeName, !isEarned && styles.badgeNameDim]}>
          {badge.name}
        </Text>

        <Text style={[styles.badgeStatus, styles[statusStyleKey]]}>
          {statusText}
        </Text>

        {isNext && !isEarned && daysLeft > 0 && (
          <View style={styles.nextHintPill}>
            <Text style={styles.nextHintText}>{daysLeft} gün kaldı</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
});

// ─────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────
export default function HeroBadgeCarousel({
  badges,
  currentStreak,
  currentBadge,
  onNavigateToAll,
  onLongPress,
}) {
  const listRef = useRef(null);

  const hasCurrent = currentBadge?.id !== undefined;
  const currentIndex = hasCurrent
    ? Math.max(0, badges.findIndex((b) => b.id === currentBadge.id))
    : -1;

  const nextBadge = badges
    .filter((b) => b.requiredDays > currentStreak)
    .sort((a, b) => a.requiredDays - b.requiredDays)[0];
  const nextIndex = nextBadge ? badges.findIndex((b) => b.id === nextBadge.id) : -1;

  const defaultIndex = hasCurrent ? currentIndex : Math.max(0, nextIndex);
  const scrollX = useRef(new Animated.Value(defaultIndex * SLIDE_W)).current;

  // Load last-viewed index from AsyncStorage and snap to it
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          const idx = parseInt(saved, 10);
          if (!isNaN(idx) && idx >= 0 && idx < badges.length) {
            listRef.current?.scrollToOffset({ offset: idx * SLIDE_W, animated: false });
            scrollX.setValue(idx * SLIDE_W);
            return;
          }
        }
      } catch {}
      // Fallback: scroll to current badge
      if (defaultIndex > 0) {
        listRef.current?.scrollToOffset({ offset: defaultIndex * SLIDE_W, animated: false });
      }
    })();
  }, []);

  // Persist last-viewed index when swipe settles
  const handleMomentumScrollEnd = useCallback((event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const idx = Math.round(offsetX / SLIDE_W);
    AsyncStorage.setItem(STORAGE_KEY, String(idx)).catch(() => {});
  }, []);

  const renderItem = useCallback(
    ({ item, index }) => (
      <BadgeSlide
        badge={item}
        index={index}
        scrollX={scrollX}
        currentStreak={currentStreak}
        isCurrent={hasCurrent && index === currentIndex}
        isNext={index === nextIndex}
        onPress={onNavigateToAll}
        onLongPress={onLongPress}
      />
    ),
    [scrollX, currentStreak, currentIndex, nextIndex, hasCurrent, onNavigateToAll, onLongPress]
  );

  return (
    <View style={styles.container}>
      <AnimatedFlatList
        ref={listRef}
        data={badges}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SLIDE_W}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={styles.listContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        style={styles.list}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    marginHorizontal: -20,
    marginBottom: 10,
  },
  list: {
    overflow: 'visible',
  },
  listContent: {
    paddingHorizontal: PEEK,
  },

  slideOuter: {
    width: SLIDE_W,
  },
  slide: {
    width: SLIDE_W,
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 10,
  },

  // Ring container
  ringContainer: {
    width: CONTAINER_SZ,
    height: CONTAINER_SZ,
    alignItems: 'center',
    justifyContent: 'center',
  },

  glowOuter: {
    position: 'absolute',
    width: GLOW_OUTER_SZ,
    height: GLOW_OUTER_SZ,
    borderRadius: GLOW_OUTER_SZ / 2,
    top: 0,
    left: 0,
    backgroundColor: 'transparent',
  },
  glowInner: {
    position: 'absolute',
    width: GLOW_INNER_SZ,
    height: GLOW_INNER_SZ,
    borderRadius: GLOW_INNER_SZ / 2,
    top: (CONTAINER_SZ - GLOW_INNER_SZ) / 2,
    left: (CONTAINER_SZ - GLOW_INNER_SZ) / 2,
    backgroundColor: 'transparent',
  },

  pulseRing: {
    position: 'absolute',
    width: PULSE_SZ,
    height: PULSE_SZ,
    borderRadius: PULSE_SZ / 2,
    borderWidth: 2,
    top: (CONTAINER_SZ - PULSE_SZ) / 2,
    left: (CONTAINER_SZ - PULSE_SZ) / 2,
  },

  ringWrap: {},
  badgeRing: {
    width: RING_SZ,
    height: RING_SZ,
    borderRadius: RING_SZ / 2,
    padding: 5,
  },
  badgeInner: {
    flex: 1,
    borderRadius: (RING_SZ - 10) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  badgeShine: {
    position: 'absolute',
    top: -44,
    left: -44,
    width: 110,
    height: 110,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 55,
    transform: [{ rotate: '45deg' }],
  },

  // Text
  badgeName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 0.2,
  },
  badgeNameDim: {
    color: '#4b5563',
  },
  badgeStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  statusCurrent: {
    color: '#9ca3af',
  },
  statusEarned: {
    color: PRIMARY,
    fontWeight: '600',
  },
  statusLocked: {
    color: '#374151',
  },
  nextHintPill: {
    marginTop: 8,
    backgroundColor: 'rgba(251,191,36,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.28)',
  },
  nextHintText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '600',
  },
});
