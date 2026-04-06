/**
 * BadgeCircle — reusable 5-layer circular badge component.
 *
 * Visual layer stack (outermost → innermost):
 *   1. Ambient glow        — semi-transparent outerGlow circle
 *   2. Pulse ring          — animated border ring (isCurrent only)
 *   3. Dark outer ring     — DARK_BASE circle, carries iOS shadow
 *   4. Bright inner ring   — ringColor circle (4px stripe visible)
 *   5. Center disc + icon  — innerBg circle with shine + icon
 *
 * All colors come from getBadgeTheme() — nothing is hardcoded here.
 * Entry / unlock animations are the parent's responsibility.
 */

import React, { useRef, useEffect } from 'react';
import { View, Animated } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getBadgeTheme } from '../utils/badgeThemes';

// The outermost dark ring color — same across all badges for visual consistency
const DARK_BASE = '#070c18';

// Pixel offsets from total `size` for each layer
const BRIGHT_OFFSET = 8;   // bright ring: size - 8  → 4px dark ring each side
const CENTER_OFFSET = 16;  // center disc: size - 16 → 4px bright ring each side

export default function BadgeCircle({
  badge,
  size = 88,
  isEarned = true,
  isCurrent = false,
  style,
}) {
  const theme = getBadgeTheme(badge.id, isEarned);

  const brightSz  = size - BRIGHT_OFFSET;
  const centerSz  = size - CENTER_OFFSET;
  const iconSz    = Math.round(size * 0.36);
  const glowSz    = size + 20;
  const pulseSz   = size + 28;
  const glowOff   = -10;   // (glowSz - size) / 2
  const pulseOff  = -14;   // (pulseSz - size) / 2

  // ── Pulse animation (isCurrent && isEarned only) ──────────────────────────
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale   = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    if (!isCurrent || !isEarned) {
      pulseOpacity.setValue(0);
      pulseScale.setValue(0.88);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseOpacity, { toValue: 0.65, duration: 1050, useNativeDriver: true }),
          Animated.timing(pulseScale,   { toValue: 1.14, duration: 1050, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseOpacity, { toValue: 0,    duration: 900, useNativeDriver: true }),
          Animated.timing(pulseScale,   { toValue: 0.88, duration: 900, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isCurrent, isEarned]);

  const IconComponent =
    badge.iconType === 'material' ? MaterialCommunityIcons : Ionicons;

  return (
    <View
      style={[
        { width: size, height: size, alignItems: 'center', justifyContent: 'center' },
        style,
      ]}
    >
      {/* ── Layer 1: Ambient glow circle (earned only) ── */}
      {isEarned && (
        <View
          pointerEvents="none"
          style={{
            position:      'absolute',
            width:         glowSz,
            height:        glowSz,
            borderRadius:  glowSz / 2,
            backgroundColor: theme.outerGlow,
            top:  glowOff,
            left: glowOff,
          }}
        />
      )}

      {/* ── Layer 2: Animated pulse ring (isCurrent only) ── */}
      {isCurrent && isEarned && (
        <Animated.View
          pointerEvents="none"
          style={{
            position:     'absolute',
            width:        pulseSz,
            height:       pulseSz,
            borderRadius: pulseSz / 2,
            top:          pulseOff,
            left:         pulseOff,
            borderWidth:  1.5,
            borderColor:  theme.iconColor,
            opacity:      pulseOpacity,
            transform:    [{ scale: pulseScale }],
          }}
        />
      )}

      {/* ── Layer 3: Dark outer ring — carries the iOS glow shadow ── */}
      <View
        style={{
          position:     'absolute',
          width:        size,
          height:       size,
          borderRadius: size / 2,
          backgroundColor: DARK_BASE,
          // iOS glow
          shadowColor:   isEarned ? theme.iconColor : 'transparent',
          shadowOffset:  { width: 0, height: 0 },
          shadowOpacity: isCurrent ? 0.9 : isEarned ? 0.5 : 0,
          shadowRadius:  isCurrent ? 22 : 12,
          // Android elevation
          elevation: isCurrent ? 14 : isEarned ? 6 : 0,
        }}
      />

      {/* ── Layer 4: Bright inner ring ── */}
      <View
        style={{
          position:        'absolute',
          width:           brightSz,
          height:          brightSz,
          borderRadius:    brightSz / 2,
          backgroundColor: theme.ringColor,
        }}
      />

      {/* ── Layer 5: Center disc — dark bg, shine, icon ── */}
      <View
        style={{
          position:        'absolute',
          width:           centerSz,
          height:          centerSz,
          borderRadius:    centerSz / 2,
          backgroundColor: theme.innerBg,
          overflow:        'hidden',
          alignItems:      'center',
          justifyContent:  'center',
        }}
      >
        {/* Diagonal shine highlight */}
        <View
          pointerEvents="none"
          style={{
            position:        'absolute',
            top:             -(centerSz * 0.32),
            left:            -(centerSz * 0.32),
            width:           centerSz * 0.70,
            height:          centerSz * 0.70,
            borderRadius:    centerSz / 2,
            backgroundColor: 'rgba(255,255,255,0.08)',
            transform:       [{ rotate: '38deg' }],
          }}
        />

        <IconComponent
          name={badge.icon}
          size={iconSz}
          color={theme.iconColor}
        />
      </View>
    </View>
  );
}
