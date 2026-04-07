import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_W = Dimensions.get('window').width;
const POPOVER_W = SCREEN_W - 64;   // horizontal margin: 32 each side
const CARET_H   = 10;
const CARET_W   = 18;
const H_PADDING = 32;               // popover's left edge from screen left

/**
 * StreakOptionsModal — Anchored callout popover
 *
 * Props:
 *   visible         boolean
 *   anchorCardTop   number   — screen-Y of the top edge of the stats card
 *   anchorCenterX   number   — screen-X of the center of the stats card
 *   onClose         () => void
 *   onEditStartDate () => void
 *   onReset         () => void
 */
export default function StreakOptionsModal({
  visible,
  anchorCardTop = 0,
  anchorCenterX = SCREEN_W / 2,
  onClose,
  onEditStartDate,
  onReset,
}) {
  // Popover floats above the stats card
  // anchorCardTop = top edge of stats card in window coords
  // We put the popover + caret so the caret tip aligns with anchorCardTop
  const popoverBottom = Dimensions.get('window').height - anchorCardTop + 4;

  // Caret horizontal offset: how far the triangle is from popover's left edge
  // We want the caret to point at anchorCenterX
  const popoverLeft = H_PADDING;
  const caretOffset = Math.min(
    Math.max(anchorCenterX - popoverLeft - CARET_W, 12),
    POPOVER_W - CARET_W - 12
  );

  // Animation values
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const popoverOpacity  = useRef(new Animated.Value(0)).current;
  const popoverScale    = useRef(new Animated.Value(0.88)).current;
  const popoverTransY   = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(popoverScale, { toValue: 1, tension: 100, friction: 16, useNativeDriver: true }),
        Animated.timing(popoverOpacity, { toValue: 1, duration: 190, useNativeDriver: true }),
        Animated.spring(popoverTransY, { toValue: 0, tension: 100, friction: 16, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(popoverScale, { toValue: 0.92, duration: 150, useNativeDriver: true }),
        Animated.timing(popoverOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(popoverTransY, { toValue: 6, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleEdit = () => {
    onClose();
    onEditStartDate?.();
  };

  const handleReset = () => {
    onClose();
    onReset?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* ── Backdrop (dismiss on tap) ── */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}>
          <BlurView intensity={16} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, styles.backdropDim]} />
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* ── Anchored popover ── */}
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.popoverContainer,
          {
            bottom: popoverBottom,
            left: popoverLeft,
            width: POPOVER_W,
            opacity: popoverOpacity,
            transform: [
              { scale: popoverScale },
              { translateY: popoverTransY },
            ],
          },
        ]}
      >
        {/* Card */}
        <View style={styles.card}>
          {/* Top shimmer */}
          <LinearGradient
            colors={['rgba(255,255,255,0.11)', 'rgba(255,255,255,0.0)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.shimmer}
            pointerEvents="none"
          />

          {/* Title */}
          <View style={styles.titleRow}>
            <View style={styles.titleIconBadge}>
              <Ionicons name="flame" size={14} color="#0df2a6" />
            </View>
            <Text style={styles.title}>Seri Ayarları</Text>
          </View>

          <View style={styles.divider} />

          {/* Başlangıç Tarihini Düzenle */}
          <TouchableOpacity
            style={styles.editBtn}
            onPress={handleEdit}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(56,189,248,0.16)', 'rgba(14,165,233,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
              borderRadius={50}
            />
            <Ionicons name="calendar-outline" size={16} color="#38bdf8" />
            <Text style={styles.editBtnText}>Başlangıç Tarihini Düzenle</Text>
          </TouchableOpacity>

          {/* Seriyi Sıfırla */}
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(248,113,113,0.14)', 'rgba(220,38,38,0.04)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
              borderRadius={50}
            />
            <Ionicons name="refresh" size={16} color="#f87171" />
            <Text style={styles.resetBtnText}>Seriyi Sıfırla</Text>
          </TouchableOpacity>
        </View>

        {/* Caret / triangle pointing downward toward the stats card */}
        <View style={[styles.caretContainer, { paddingLeft: caretOffset }]}>
          {/* Border layer (slightly larger, drawn behind) */}
          <View style={styles.caretBorder} />
          {/* Fill layer */}
          <View style={styles.caretFill} />
        </View>
      </Animated.View>
    </Modal>
  );
}

const CARD_BG      = 'rgba(18, 28, 58, 0.97)';
const CARD_BORDER  = 'rgba(255,255,255,0.14)';

const styles = StyleSheet.create({
  backdropDim: {
    backgroundColor: 'rgba(3, 7, 20, 0.40)',
  },

  // Absolute container that positions the popover + caret
  popoverContainer: {
    position: 'absolute',
  },

  // ── Card ─────────────────────────────────────────────────────────────
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    overflow: 'hidden',
    paddingTop: 18,
    paddingBottom: 16,
    paddingHorizontal: 16,
    // depth shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.65,
    shadowRadius: 28,
    elevation: 20,
  },

  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },

  titleIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(13,242,166,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(13,242,166,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: 'rgba(255,255,255,0.93)',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
    marginHorizontal: -2,
  },

  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.34)',
    paddingVertical: 13,
    marginBottom: 9,
    overflow: 'hidden',
  },

  editBtnText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
  },

  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
    paddingVertical: 13,
    overflow: 'hidden',
  },

  resetBtnText: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '600',
  },

  // ── Caret ────────────────────────────────────────────────────────────
  // We stack two triangles: border-colored behind, card-colored in front
  caretContainer: {
    height: CARET_H,
    position: 'relative',
  },

  // Slightly larger — forms the 1px "border" of the caret
  caretBorder: {
    position: 'absolute',
    top: -1,
    width: 0,
    height: 0,
    borderLeftWidth: CARET_W / 2 + 1,
    borderRightWidth: CARET_W / 2 + 1,
    borderTopWidth: CARET_H + 1,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: CARD_BORDER,
  },

  caretFill: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: CARET_W / 2,
    borderRightWidth: CARET_W / 2,
    borderTopWidth: CARET_H,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: CARD_BG,
  },
});
