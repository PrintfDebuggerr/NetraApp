import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useStreak } from '../contexts/StreakContext';

const { width, height } = Dimensions.get('window');

const MOTIVATIONAL_MESSAGES = [
  'Hedeflerine Odaklan',
  'Sen Bundan Güçlüsün',
  'Bu Anı Atlatabilirsin',
  'Özgürlüğün Bu Tarafta',
  'Geleceğin İçin Savaş',
];

export default function PanicModal({ visible, onClose }) {
  const { resetStreak } = useStreak();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const messageIndex = useRef(Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)).current;
  const motivationalText = MOTIVATIONAL_MESSAGES[messageIndex];

  // Haptic + animations on open
  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation for main text
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(40);
      pulseAnim.setValue(1);
    }
  }, [visible]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleThinking = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Dur. Nefes Al.',
      '15 dakika bekle. Bu his geçecek.\n\nBeynin seni kandırmaya çalışıyor — gerçek mutluluk bu değil.',
      [{ text: 'Tamam, bekleyeceğim', style: 'default', onPress: handleClose }]
    );
  };

  const handleRelapse = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert(
      'Emin misin?',
      'Streak\'in sıfırlanacak. Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Sıfırla',
          style: 'destructive',
          onPress: () => {
            resetStreak();
            onClose();
            Alert.alert(
              'Yeniden Başla',
              'Düşmek utanç değil, kalkmamak utanç. Yeni bir başlangıç yap!',
            );
          },
        },
      ],
    );
  };

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  const hasCamera = permission?.granted;

  // Shared bottom action panel
  const renderActionPanel = () => (
    <Animated.View
      style={[
        styles.overlayContent,
        hasCamera && styles.overlayContentAbsolute,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.alertBadge}>
        <Ionicons name="warning" size={14} color="#f97316" />
        <Text style={styles.alertBadgeText}>PANİK BUTONU</Text>
      </View>

      <Animated.Text style={[styles.mainText, { transform: [{ scale: pulseAnim }] }]}>
        {motivationalText}
      </Animated.Text>

      <View style={styles.subTextContainer}>
        <Text style={styles.subText}>Bu olmak istediğin kişi değil.</Text>
        <Text style={styles.subText}>Kontrolü elinde tut.</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.thinkingBtn} onPress={handleThinking} activeOpacity={0.85}>
          <Ionicons name="alert-circle-outline" size={18} color="#f97316" />
          <Text style={styles.thinkingBtnText}>Nüks etmeyi düşünüyorum</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.relapseBtn} onPress={handleRelapse} activeOpacity={0.85}>
          <Text style={styles.relapseBtnText}>Nüks ettim</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

        {/* ── CAMERA mode ── */}
        {hasCamera && (
          <>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="front"
              onCameraReady={() => setCameraReady(true)}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.5)', 'transparent']}
              style={styles.topGradient}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.94)']}
              style={styles.bottomGradient}
            />
          </>
        )}

        {/* ── NO PERMISSION mode — flat layout, no absolute overlap ── */}
        {!hasCamera && (
          <View style={styles.noPermissionScreen}>
            <LinearGradient
              colors={['#0B1121', '#1a0a2e', '#2d0a1e']}
              style={StyleSheet.absoluteFill}
            />
            {/* Top section: icon + permission info */}
            <View style={styles.permissionTop}>
              <Ionicons name="eye-off-outline" size={44} color="rgba(255,255,255,0.25)" />
              <Text style={styles.permissionText}>Kamera erişimi yok</Text>
              <Text style={styles.permissionSub}>
                Kendini görmek için izin ver — bu özelliğin gücü budur.
              </Text>
              {permission && !permission.granted && (
                <TouchableOpacity style={styles.permissionBtn} onPress={handleRequestPermission}>
                  <Text style={styles.permissionBtnText}>İzin Ver</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Bottom section: action panel (no absolute positioning) */}
            {renderActionPanel()}
          </View>
        )}

        {/* Camera mode: action panel absolutely at bottom */}
        {hasCamera && renderActionPanel()}

        {/* Close button — always on top */}
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.7}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>

      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    zIndex: 2,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.65,
    zIndex: 2,
  },
  closeBtn: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Shared panel — flat in no-permission mode
  overlayContent: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 24,
    alignItems: 'center',
  },
  // Overlaid on camera when permission granted
  overlayContentAbsolute: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 0,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.35)',
    marginBottom: 20,
  },
  alertBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#f97316',
    letterSpacing: 2,
  },
  mainText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 42,
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subTextContainer: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 28,
  },
  subText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 24,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  thinkingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(249, 115, 22, 0.45)',
  },
  thinkingBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f97316',
  },
  relapseBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  relapseBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
  },
  // No-permission flat layout
  noPermissionScreen: {
    flex: 1,
    flexDirection: 'column',
  },
  permissionTop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  permissionText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  permissionSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionBtn: {
    marginTop: 12,
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  permissionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
