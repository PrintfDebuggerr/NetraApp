import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useStreak } from '../contexts/StreakContext';
import PanicModal from '../components/PanicModal';

export default function HomeScreen() {
  const { streakData, timer, brainRewiring } = useStreak();
  const [showPanicModal, setShowPanicModal] = useState(false);

  const currentStreak = streakData?.currentStreak || 0;

  const getWeekDays = () => {
    const days = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'];
    const today = new Date().getDay();
    const adjustedToday = today === 0 ? 6 : today - 1;
    
    return days.map((day, index) => ({
      day,
      status: index <= adjustedToday && currentStreak > 0 ? 'success' : 'pending',
    }));
  };

  const weekDays = getWeekDays();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>QUITTER</Text>
        <View style={styles.headerIcons}>
          <Text style={styles.streakIcon}>🔥 {currentStreak}</Text>
        </View>
      </View>

      {/* Weekly Calendar */}
      <View style={styles.weekContainer}>
        {weekDays.map((d, i) => (
          <View key={i} style={styles.dayContainer}>
            <View style={[
              styles.dayCircle,
              d.status === 'success' && styles.daySuccess
            ]}>
              {d.status === 'success' ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <Text style={styles.dash}>-</Text>
              )}
            </View>
            <Text style={styles.dayLabel}>{d.day}</Text>
          </View>
        ))}
      </View>

      {/* Main Timer Circle */}
      <View style={styles.timerContainer}>
        <View style={styles.timerCircle}>
          <View style={styles.timerInner}>
            <View style={styles.moonGradient} />
          </View>
        </View>
        
        <Text style={styles.timerLabel}>Şu kadar süredir temizsin:</Text>
        <Text style={styles.timerValue}>{currentStreak} Gün</Text>
        
        <View style={styles.timerBadge}>
          <Text style={styles.timerBadgeText}>
            {String(timer.hours).padStart(2, '0')}sa {String(timer.minutes).padStart(2, '0')}dk {String(timer.seconds).padStart(2, '0')}sn
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <ActionButton icon="✋" label="Söz Ver" />
        <ActionButton icon="🧘" label="Meditasyon" />
        <ActionButton icon="🔄" label="Sıfırla" onPress={() => setShowPanicModal(true)} />
        <ActionButton icon="✏️" label="Düzenle" />
      </View>

      {/* Brain Rewiring Progress */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Beyin Yeniden Yapılanması</Text>
          <Text style={styles.progressValue}>{brainRewiring}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${brainRewiring}%` }]} />
        </View>
      </View>

      {/* Panic Button */}
      <TouchableOpacity 
        style={styles.panicButton}
        onPress={() => setShowPanicModal(true)}
      >
        <Text style={styles.panicIcon}>⚠️</Text>
        <Text style={styles.panicText}>Panik Butonu</Text>
      </TouchableOpacity>

      {/* Panic Modal */}
      <PanicModal 
        visible={showPanicModal} 
        onClose={() => setShowPanicModal(false)} 
      />
    </ScrollView>
  );
}

function ActionButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={styles.actionIconContainer}>
        <Text style={styles.actionIcon}>{icon}</Text>
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    fontSize: 18,
    color: '#ff6b35',
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  daySuccess: {
    backgroundColor: 'rgba(233,69,96,0.2)',
    borderColor: '#e94560',
  },
  checkmark: {
    color: '#e94560',
    fontSize: 14,
  },
  dash: {
    color: '#666',
    fontSize: 14,
  },
  dayLabel: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(233,69,96,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  moonGradient: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  timerLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  timerValue: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  timerBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  timerBadgeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionLabel: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
  },
  progressCard: {
    backgroundColor: 'rgba(22,33,62,0.5)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressValue: {
    color: '#e94560',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e94560',
    borderRadius: 4,
  },
  panicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 30,
    padding: 18,
    marginBottom: 20,
  },
  panicIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  panicText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
