import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useStreak } from '../contexts/StreakContext';
import PanicModal from '../components/PanicModal';
import { getCurrentBadge } from '../utils/badgeData';

const { width } = Dimensions.get('window');

// Primary color - matching StatsScreen theme
const PRIMARY = '#0df2a6';

// Yıldız efekti için rastgele noktalar
const generateStars = (count) => {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.3 + 0.1,
    });
  }
  return stars;
};

const stars = generateStars(50);

// Week days component
function WeekDayCircle({ day, label, isToday, isCompleted }) {
  if (isToday) {
    return (
      <View style={styles.dayContainer}>
        <View style={[styles.dayCircle, styles.dayCircleToday]}>
          <Text style={styles.dayTodayText}>{day}</Text>
        </View>
        <Text style={styles.dayLabelToday}>{label}</Text>
      </View>
    );
  }
  
  if (isCompleted) {
    return (
      <View style={styles.dayContainer}>
        <View style={[styles.dayCircle, styles.dayCircleCompleted]}>
          <Ionicons name="checkmark" size={14} color="#fff" style={{ fontWeight: 'bold' }} />
        </View>
        <Text style={styles.dayLabel}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.dayContainer}>
      <View style={[styles.dayCircle, styles.dayCircleFuture]} />
      <Text style={styles.dayLabelFuture}>{label}</Text>
    </View>
  );
}

// Action Button Component
function ActionButton({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.actionIconContainer}>
        {icon}
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { streakData, timer, brainRewiring } = useStreak();
  const [showPanicModal, setShowPanicModal] = useState(false);

  const currentStreak = streakData?.currentStreak || 35;
  const currentBadge = getCurrentBadge(currentStreak);

  // Get week days based on current day
  const getWeekDays = () => {
    const dayLabels = ['M', 'T', 'W', 'TH', 'F', 'S', 'S'];
    const today = new Date().getDay();
    const adjustedToday = today === 0 ? 6 : today - 1; // Monday = 0
    
    return dayLabels.map((label, index) => {
      const isToday = index === adjustedToday;
      const isCompleted = index < adjustedToday && currentStreak > 0;
      const day = index === 3 ? 'TH' : label;
      return { day, label, isToday, isCompleted };
    });
  };

  const weekDays = getWeekDays();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B1121', '#162035', '#1a2642']}
        style={styles.gradient}
      >
        {/* Yıldız efekti */}
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>QUITTR</Text>
            <View style={styles.headerPill}>
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={18} color="#f97316" />
                <Text style={styles.streakText}>{currentStreak}</Text>
              </View>
              <View style={styles.headerIconsRight}>
                <Ionicons name="gift-outline" size={18} color="#f472b6" />
                <Ionicons name="flash" size={18} color="#facc15" />
              </View>
            </View>
          </View>

          {/* Weekly Calendar */}
          <View style={styles.weekContainer}>
            {weekDays.map((d, i) => (
              <WeekDayCircle 
                key={i} 
                day={d.day}
                label={d.label}
                isToday={d.isToday}
                isCompleted={d.isCompleted}
              />
            ))}
          </View>

          {/* Main Medal Circle - Tıklanabilir */}
          <TouchableOpacity 
            style={styles.medalContainer}
            onPress={() => navigation.navigate('Achievements')}
            activeOpacity={0.8}
          >
            <View style={styles.medalGlow} />
            <LinearGradient
              colors={currentBadge.colors}
              style={styles.medalRing}
            >
              <View style={[styles.medalInner, { backgroundColor: currentBadge.bgColor }]}>
                <View style={styles.medalInnerBorder} />
                <View style={styles.medalShine} />
                {currentBadge.iconType === 'material' ? (
                  <MaterialCommunityIcons 
                    name={currentBadge.icon} 
                    size={70} 
                    color={currentBadge.iconColor} 
                    style={styles.medalIcon} 
                  />
                ) : (
                  <Ionicons 
                    name={currentBadge.icon} 
                    size={70} 
                    color={currentBadge.iconColor} 
                    style={styles.medalIcon} 
                  />
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Timer Info */}
          <View style={styles.timerInfo}>
            <Text style={styles.timerLabel}>You've been porn-free for:</Text>
            <View style={styles.timerValueRow}>
              <Text style={styles.timerValue}>{currentStreak}</Text>
              <Text style={styles.timerUnit}>days</Text>
            </View>
            <View style={styles.timerBadge}>
              <Ionicons name="time-outline" size={14} color={PRIMARY} />
              <Text style={styles.timerBadgeText}>
                {timer.hours}h {timer.minutes}m {timer.seconds}s
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <ActionButton 
              icon={<MaterialCommunityIcons name="handshake" size={24} color="#0df2a6" />} 
              label="Pledge" 
            />
            <ActionButton 
              icon={<MaterialCommunityIcons name="meditation" size={24} color="#0df2a6" />} 
              label="Meditate" 
            />
            <ActionButton 
              icon={<Ionicons name="refresh" size={24} color="#0df2a6" />} 
              label="Reset" 
            />
            <ActionButton 
              icon={<Ionicons name="pencil" size={22} color="#9ca3af" />} 
              label="Edit Streak" 
            />
          </View>

          {/* Brain Rewiring Progress */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressHeaderLeft}>
                <View style={styles.progressIconBg}>
                  <MaterialCommunityIcons name="brain" size={20} color="#06b6d4" />
                </View>
                <Text style={styles.progressLabel}>Brain Rewiring</Text>
              </View>
              <Text style={styles.progressValue}>{brainRewiring}%</Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#0df2a6', '#06b6d4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${brainRewiring}%` }]}
              />
            </View>
            <Text style={styles.progressSubtext}>Estimated full recovery: 90 days</Text>
          </View>

          {/* Panic Button */}
          <TouchableOpacity 
            style={styles.panicButton}
            onPress={() => setShowPanicModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.panicButtonInner}>
              <Ionicons name="warning" size={22} color="#fff" />
              <Text style={styles.panicText}>PANIC BUTTON</Text>
            </View>
          </TouchableOpacity>

          {/* Bottom spacing for tab bar */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Panic Modal */}
        <PanicModal 
          visible={showPanicModal} 
          onClose={() => setShowPanicModal(false)} 
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 12,
  },
  logo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2738',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 6,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  streakText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  headerIconsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 12,
    paddingLeft: 4,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingVertical: 24,
  },
  dayContainer: {
    alignItems: 'center',
    gap: 6,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleCompleted: {
    backgroundColor: '#0df2a6',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#0df2a6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  dayCircleToday: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0df2a6',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#0df2a6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  dayCircleFuture: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#374151',
  },
  dayTodayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  dayLabel: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '500',
  },
  dayLabelToday: {
    color: '#0df2a6',
    fontSize: 10,
    fontWeight: '700',
  },
  dayLabelFuture: {
    color: '#4b5563',
    fontSize: 10,
    fontWeight: '500',
  },
  medalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  medalGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(13, 242, 166, 0.15)',
  },
  medalRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.9,
    shadowRadius: 28,
    elevation: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#4b5563',
  },
  medalInner: {
    flex: 1,
    borderRadius: 110,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 9,
    overflow: 'hidden',
  },
  medalInnerBorder: {
    position: 'absolute',
    top: 11,
    left: 11,
    right: 11,
    bottom: 11,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    opacity: 0.3,
  },
  medalShine: {
    position: 'absolute',
    top: -65,
    left: -65,
    width: 165,
    height: 165,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 82,
    transform: [{ rotate: '45deg' }],
  },
  medalIcon: {
    opacity: 0.9,
    zIndex: 10,
  },
  timerInfo: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  timerLabel: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  timerValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timerValue: {
    color: '#fff',
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
  },
  timerUnit: {
    color: '#6b7280',
    fontSize: 28,
    fontWeight: '400',
    marginLeft: 4,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#0f1522',
    borderWidth: 1,
    borderColor: 'rgba(13, 242, 166, 0.3)',
  },
  timerBadgeText: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 0,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1e2738',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  actionLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
  },
  progressCard: {
    backgroundColor: '#1a2332',
    borderRadius: 16,
    padding: 20,
    marginTop: 32,
    borderWidth: 1,
    borderColor: 'rgba(13, 242, 166, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressLabel: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
  },
  progressValue: {
    color: '#0df2a6',
    fontSize: 14,
    fontWeight: '700',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#0B1121',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 4,
  },
  progressSubtext: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'right',
    marginTop: 10,
  },
  panicButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    marginTop: 32,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
    overflow: 'hidden',
  },
  panicButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  panicText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 3,
  },
});
