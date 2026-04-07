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
const SCREEN_W = Dimensions.get('window').width;

// ── Layout ────────────────────────────────────────────────────────────────
// Item is 56% of screen → 22% of screen visible on each side, giving
// clearly readable previous/next badges without clipping tricks.
const ITEM_W       = SCREEN_W * 0.56;
const SIDE_SPACING = (SCREEN_W - ITEM_W) / 2;

// Badge visual sizes
const RING_SZ       = 140;
const CONTAINER_SZ  = RING_SZ + 48;   // room for glow + pulse ring
const ICON_SZ       = 46;

const STORAGE_KEY = '@badge_carousel_last_index';
const PRIMARY     = '#0df2a6';
const LOCKED_GRAD = ['#1a2035', '#252d3d'];

// ─────────────────────────────────────────────────────────────────────────
// Individual badge slide
// ─────────────────────────────────────────────────────────────────────────
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

  // inputRange aligned to ITEM_W so interpolations track correctly
  const inputRange = [
    (index - 1) * ITEM_W,
    index       * ITEM_W,
    (index + 1) * ITEM_W,
  ];

  const scale = useMemo(
    () => scrollX.interpolate({ inputRange, outputRange: [0.78, 1, 0.78], extrapolate: 'clamp' }),
    [scrollX, index]
  );
  const opacity = useMemo(
    () => scrollX.interpolate({ inputRange, outputRange: [0.55, 1, 0.55], extrapolate: 'clamp' }),
    [scrollX, index]
  );
  const translateY = useMemo(
    () => scrollX.interpolate({ inputRange, outputRange: [8, 0, 8], extrapolate: 'clamp' }),
    [scrollX, index]
  );

  // Pulse ring for the "next to unlock" badge
  const pulseScale   = useRef(new Animated.Value(1)).current;
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
          Animated.timing(pulseScale,   { toValue: 1.13, duration: 1100, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.5,  duration: 550,  useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale,   { toValue: 1, duration: 850, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0, duration: 850, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isNext]);

  const theme      = getBadgeTheme(badge.id, isEarned);
  const ringColors = isEarned ? [theme.ringColor, theme.iconColor + '90'] : LOCKED_GRAD;

  let statusText, statusStyleKey;
  if (isCurrent) {
    statusText     = `${currentStreak} gün`;
    statusStyleKey = 'statusCurrent';
  } else if (isEarned) {
    statusText     = `Kazanıldı  ·  ${badge.requiredDays} gün`;
    statusStyleKey = 'statusEarned';
  } else {
    statusText     = `${badge.requiredDays} günde açılır`;
    statusStyleKey = 'statusLocked';
  }

  return (
    <Animated.View
      style={[
        styles.itemOuter,
        { opacity, transform: [{ scale }, { translateY }] },
      ]}
    >
      {/* Badge ring */}
      <View style={styles.ringContainer}>
        {/* Outer glow blob */}
        <View
          style={[
            styles.glowOuter,
            isCurrent && isEarned && { backgroundColor: theme.outerGlow },
          ]}
        />

        {/* Pulse ring (next badge only) */}
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

        <TouchableOpacity onPress={onPress} onLongPress={onLongPress} activeOpacity={0.88}>
          <LinearGradient
            colors={ringColors}
            style={[
              styles.badgeRing,
              isCurrent && isEarned && {
                shadowColor:   theme.iconColor,
                shadowOffset:  { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius:  28,
                elevation:     14,
              },
              !isEarned && { opacity: 0.5 },
            ]}
          >
            <View style={[styles.badgeInner, { backgroundColor: theme.innerBg }]}>
              <View style={styles.badgeShine} />
              {!isEarned ? (
                <Ionicons name="lock-closed" size={26} color={theme.iconColor} />
              ) : badge.iconType === 'material' ? (
                <MaterialCommunityIcons name={badge.icon} size={ICON_SZ} color={theme.iconColor} />
              ) : (
                <Ionicons name={badge.icon} size={ICON_SZ} color={theme.iconColor} />
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Label */}
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
    </Animated.View>
  );
});

// ─────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────
export default function HeroBadgeCarousel({
  badges,
  currentStreak,
  currentBadge,
  onNavigateToAll,
  onLongPress,
}) {
  const listRef = useRef(null);

  const hasCurrent  = currentBadge?.id !== undefined;
  const currentIndex = hasCurrent
    ? Math.max(0, badges.findIndex((b) => b.id === currentBadge.id))
    : 0;

  const nextBadge = badges
    .filter((b) => b.requiredDays > currentStreak)
    .sort((a, b) => a.requiredDays - b.requiredDays)[0];
  const nextIndex = nextBadge ? badges.findIndex((b) => b.id === nextBadge.id) : -1;

  // initialise scrollX to the current badge offset so first render is correct
  const scrollX = useRef(new Animated.Value(currentIndex * ITEM_W)).current;

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          const idx = parseInt(saved, 10);
          if (!isNaN(idx) && idx >= 0 && idx < badges.length) {
            listRef.current?.scrollToIndex({ index: idx, animated: false });
            scrollX.setValue(idx * ITEM_W);
            return;
          }
        }
      } catch {}
      // Fallback: jump to current badge
      if (currentIndex > 0) {
        listRef.current?.scrollToIndex({ index: currentIndex, animated: false });
        scrollX.setValue(currentIndex * ITEM_W);
      }
    })();
  }, []);

  const handleMomentumScrollEnd = useCallback((e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / ITEM_W);
    AsyncStorage.setItem(STORAGE_KEY, String(idx)).catch(() => {});
  }, []);

  const getItemLayout = useCallback(
    (_, index) => ({ length: ITEM_W, offset: ITEM_W * index, index }),
    []
  );

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
    // marginHorizontal:-20 cancels the parent ScrollView's paddingHorizontal:20
    // so the FlatList spans the full screen width
    <View style={styles.container}>
      <AnimatedFlatList
        ref={listRef}
        data={badges}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_W}
        snapToAlignment="start"
        decelerationRate="fast"
        bounces={false}
        getItemLayout={getItemLayout}
        // padding ensures first item is centered; side items overflow naturally
        contentContainerStyle={{ paddingHorizontal: SIDE_SPACING }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Full-width wrapper that breaks out of parent horizontal padding
  container: {
    marginHorizontal: -20,
    marginBottom: 10,
  },

  // Each slide is exactly ITEM_W wide — narrower than screen by design
  itemOuter: {
    width: ITEM_W,
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },

  // Badge ring area
  ringContainer: {
    width: CONTAINER_SZ,
    height: CONTAINER_SZ,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
    width: CONTAINER_SZ,
    height: CONTAINER_SZ,
    borderRadius: CONTAINER_SZ / 2,
    backgroundColor: 'transparent',
  },
  pulseRing: {
    position: 'absolute',
    width: RING_SZ + 16,
    height: RING_SZ + 16,
    borderRadius: (RING_SZ + 16) / 2,
    borderWidth: 2,
  },
  badgeRing: {
    width: RING_SZ,
    height: RING_SZ,
    borderRadius: RING_SZ / 2,
    padding: 5,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
  },
  badgeInner: {
    flex: 1,
    borderRadius: (RING_SZ - 10) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  badgeShine: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 50,
    transform: [{ rotate: '45deg' }],
  },

  // Text
  badgeName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 0.2,
  },
  badgeNameDim: {
    color: '#4b5563',
  },
  badgeStatus: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 3,
    textAlign: 'center',
  },
  statusCurrent: { color: '#9ca3af' },
  statusEarned:  { color: PRIMARY, fontWeight: '600' },
  statusLocked:  { color: '#374151' },

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
