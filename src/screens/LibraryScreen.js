import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');
// ── Sound configuration ────────────────────────────────────────────────────
// To add real audio files:
//   1. Download free ambient MP3s from https://pixabay.com/sound-effects/
//   2. Place files in assets/sounds/ folder
//   3. Replace null values with: require('../../assets/sounds/rain.mp3')
//
// Or use CDN URIs: { uri: 'https://...' }
const SOUND_SOURCES = {
  rain:   require('../../assets/sounds/rain.mp3'),
  forest: require('../../assets/sounds/forest.mp3'),
  noise:  require('../../assets/sounds/white_noise.mp3'),
  ocean:  require('../../assets/sounds/ocean.mp3'),
};

const SOUNDS = [
  { key: 'rain',   label: 'Rain',        icon: 'rainy',     lib: 'Ionicons', color: '#93c5fd' },
  { key: 'forest', label: 'Forest',      icon: 'pine-tree', lib: 'Material', color: '#4ade80' },
  { key: 'noise',  label: 'White Noise', icon: 'waveform',  lib: 'Material', color: '#d1d5db' },
  { key: 'ocean',  label: 'Ocean',       icon: 'water',     lib: 'Ionicons', color: '#38bdf8' },
];

const TIMER_OPTIONS = [
  { label: '30m', seconds: 30 * 60 },
  { label: '1h',  seconds: 60 * 60 },
  { label: '∞',   seconds: null },
];

// Star background
const generateStars = (count) => {
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 50,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.2,
    });
  }
  return arr;
};
const stars = generateStars(30);

function SoundIcon({ soundInfo, isActive }) {
  const color = isActive ? soundInfo.color : '#6b7280';
  if (soundInfo.lib === 'Material') {
    return <MaterialCommunityIcons name={soundInfo.icon} size={26} color={color} />;
  }
  return <Ionicons name={soundInfo.icon} size={26} color={color} />;
}

export default function LibraryScreen({ navigation }) {
  const [activeKey, setActiveKey] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [timerIdx, setTimerIdx] = useState(2); // default: ∞

  const soundRef = useRef(null);
  const stopTimerRef = useRef(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });
    return () => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      if (soundRef.current) {
        soundRef.current.stopAsync().catch(() => {});
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const stopSound = async () => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
    setActiveKey(null);
  };

  const handleSoundPress = async (key) => {
    if (isLoading) return;

    // Toggle off
    if (activeKey === key) {
      await stopSound();
      return;
    }

    setIsLoading(true);
    await stopSound();

    try {
      const { sound } = await Audio.Sound.createAsync(SOUND_SOURCES[key], {
        isLooping: true,
        volume,
      });
      soundRef.current = sound;
      await sound.playAsync();
      setActiveKey(key);

      const timerOption = TIMER_OPTIONS[timerIdx];
      if (timerOption.seconds) {
        stopTimerRef.current = setTimeout(stopSound, timerOption.seconds * 1000);
      }
    } catch {
      Alert.alert('Playback Error', 'Could not play this sound.');
    }
    setIsLoading(false);
  };

  const adjustVolume = async (delta) => {
    const newVol = Math.max(0.0, Math.min(1.0, Math.round((volume + delta) * 10) / 10));
    setVolume(newVol);
    if (soundRef.current) {
      try { await soundRef.current.setVolumeAsync(newVol); } catch {}
    }
  };

  const handleTimerChange = (idx) => {
    setTimerIdx(idx);
    // Update running timer
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    if (activeKey && TIMER_OPTIONS[idx].seconds) {
      stopTimerRef.current = setTimeout(stopSound, TIMER_OPTIONS[idx].seconds * 1000);
    }
  };

  const activeSound = activeKey ? SOUNDS.find((s) => s.key === activeKey) : null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0B1121', '#162035', '#1a2642']} style={styles.gradient}>
        {stars.map((star) => (
          <View
            key={star.id}
            style={[
              styles.star,
              { left: `${star.left}%`, top: `${star.top}%`, width: star.size, height: star.size, opacity: star.opacity },
            ]}
          />
        ))}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Library</Text>
            <TouchableOpacity style={styles.websiteButton}>
              <Text style={styles.websiteButtonText}>Website</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Meditation')}
            >
              <View style={styles.quickActionIcon}>
                <MaterialCommunityIcons name="weather-windy" size={28} color="#a5f3fc" />
              </View>
              <Text style={styles.quickActionLabel}>Breathing</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Meditation')}
            >
              <View style={styles.quickActionIcon}>
                <MaterialCommunityIcons name="meditation" size={28} color="#bfdbfe" />
              </View>
              <Text style={styles.quickActionLabel}>Meditate</Text>
            </TouchableOpacity>
          </View>

          {/* Leaderboard */}
          <TouchableOpacity
            style={styles.leaderboardCard}
            activeOpacity={0.7}
            onPress={() => Alert.alert('Yakında', 'Leaderboard özelliği geliyor.')}
          >
            <View style={styles.leaderboardIconBg}>
              <Ionicons name="trophy" size={24} color="#facc15" />
            </View>
            <View style={styles.leaderboardText}>
              <Text style={styles.leaderboardTitle}>Leaderboard</Text>
              <Text style={styles.leaderboardSubtitle}>Topluluk Sıralaması</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#4b5563" />
          </TouchableOpacity>

          {/* ── Relaxation Noises ── */}
          <View style={styles.relaxationSection}>
            <Text style={styles.sectionTitle}>Relaxation Noises</Text>

                    <View style={styles.soundsGrid}>
              {SOUNDS.map((s) => {
                const isActive = activeKey === s.key;
                return (
                  <TouchableOpacity
                    key={s.key}
                    style={[
                      styles.soundButton,
                      isActive && {
                        borderColor: s.color,
                        backgroundColor: s.color + '18',
                      },
                    ]}
                    onPress={() => handleSoundPress(s.key)}
                    activeOpacity={0.75}
                  >
                    <View
                      style={[
                        styles.soundIconContainer,
                        isActive && { borderColor: s.color },
                      ]}
                    >
                      {isLoading && isActive ? (
                        <ActivityIndicator size="small" color={s.color} />
                      ) : (
                        <SoundIcon soundInfo={s} isActive={isActive} />
                      )}
                    </View>
                    <Text style={[styles.soundLabel, isActive && { color: s.color }]}>
                      {s.label}
                    </Text>
                    {isActive && (
                      <View style={[styles.soundActiveDot, { backgroundColor: s.color }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Volume + Timer controls (visible when a sound is active) */}
            {activeKey && (
              <View style={[styles.controlsCard, { borderColor: activeSound?.color + '44' }]}>
                {/* Volume row */}
                <View style={styles.controlRow}>
                  <Text style={styles.controlLabel}>Volume</Text>
                  <View style={styles.volumeRow}>
                    <TouchableOpacity
                      style={styles.volBtn}
                      onPress={() => adjustVolume(-0.1)}
                    >
                      <Ionicons name="remove" size={18} color="#9ca3af" />
                    </TouchableOpacity>
                    <View style={styles.volumeDots}>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.volumeDot,
                            {
                              backgroundColor:
                                i < Math.round(volume * 10)
                                  ? activeSound?.color
                                  : '#374151',
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <TouchableOpacity
                      style={styles.volBtn}
                      onPress={() => adjustVolume(0.1)}
                    >
                      <Ionicons name="add" size={18} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Timer row */}
                <View style={styles.controlRow}>
                  <Text style={styles.controlLabel}>Timer</Text>
                  <View style={styles.timerOptions}>
                    {TIMER_OPTIONS.map((opt, idx) => (
                      <TouchableOpacity
                        key={opt.label}
                        style={[
                          styles.timerBtn,
                          idx === timerIdx && {
                            backgroundColor: activeSound?.color,
                            borderColor: activeSound?.color,
                          },
                        ]}
                        onPress={() => handleTimerChange(idx)}
                      >
                        <Text
                          style={[
                            styles.timerBtnText,
                            idx === timerIdx && { color: '#0a0e27' },
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Community Card */}
          <View style={styles.communityCard}>
            <LinearGradient
              colors={['#06b6d4', '#3b82f6']}
              style={styles.communityAvatarGradient}
            >
              <View style={styles.communityAvatarInner}>
                <Ionicons name="person" size={24} color="#fff" />
              </View>
            </LinearGradient>
            <View style={styles.communityTextContainer}>
              <Text style={styles.communityTitle}>You're doing great!</Text>
              <Text style={styles.communitySubtitle}>Top 5% of community this week.</Text>
            </View>
            <TouchableOpacity style={styles.communityViewButton}>
              <Text style={styles.communityViewButtonText}>View</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const SOUND_BTN_SIZE = (width - 48 - 36) / 4;

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  star: { position: 'absolute', backgroundColor: '#fff', borderRadius: 10 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 48 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 32,
  },
  headerTitle: { fontSize: 30, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },
  websiteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#1e2738',
    borderWidth: 1,
    borderColor: '#2a3548',
  },
  websiteButtonText: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },

  // Quick Actions
  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  quickActionButton: { alignItems: 'center', gap: 8 },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1e2738',
    borderWidth: 1,
    borderColor: '#2a3548',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionLabel: { fontSize: 11, fontWeight: '500', color: '#9ca3af', textAlign: 'center' },

  // Leaderboard
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2738',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.3)',
    padding: 16,
    gap: 14,
    marginBottom: 32,
  },
  leaderboardIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(234,179,8,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardText: { flex: 1 },
  leaderboardTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  leaderboardSubtitle: { color: '#9ca3af', fontSize: 12 },

  // Relaxation Sounds
  relaxationSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 16, paddingHorizontal: 4 },
  soundsGrid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  soundButton: {
    width: SOUND_BTN_SIZE,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2a3548',
    backgroundColor: '#1e2738',
    gap: 8,
    position: 'relative',
  },
  soundIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0f1522',
    borderWidth: 1,
    borderColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '500' },
  soundActiveDot: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },

  // Controls card
  controlsCard: {
    marginTop: 16,
    backgroundColor: '#1a2332',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  controlLabel: { color: '#9ca3af', fontSize: 13, fontWeight: '600', width: 54 },
  volumeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  volBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0f1522',
    borderWidth: 1,
    borderColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeDots: { flexDirection: 'row', gap: 4 },
  volumeDot: { width: 8, height: 8, borderRadius: 4 },
  timerOptions: { flexDirection: 'row', gap: 8 },
  timerBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#0f1522',
  },
  timerBtnText: { color: '#9ca3af', fontSize: 13, fontWeight: '600' },

  // Community
  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2332',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2a3548',
    padding: 16,
    gap: 16,
  },
  communityAvatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 2,
  },
  communityAvatarInner: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityTextContainer: { flex: 1 },
  communityTitle: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 2 },
  communitySubtitle: { fontSize: 12, color: '#9ca3af' },
  communityViewButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#0B1121',
    borderWidth: 1,
    borderColor: 'rgba(13,242,166,0.3)',
  },
  communityViewButtonText: { fontSize: 12, fontWeight: '600', color: '#0df2a6' },
});
