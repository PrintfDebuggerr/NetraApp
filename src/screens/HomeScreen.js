import React, { useState, useEffect, useRef } from 'react';
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
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useStreak } from '../contexts/StreakContext';
import PanicModal from '../components/PanicModal';

const { width } = Dimensions.get('window');

// Yıldız efekti için rastgele noktalar
const generateStars = (count) => {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
    });
  }
  return stars;
};

const stars = generateStars(50);

export default function HomeScreen() {
  const { streakData, timer, brainRewiring } = useStreak();
  const [showPanicModal, setShowPanicModal] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const currentStreak = streakData?.currentStreak || 0;

  // Metalik daire için yavaş dönen animasyon
  useEffect(() => {
    const rotation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    );
    rotation.start();
    return () => rotation.stop();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getWeekDays = () => {
    const days = ['T', 'W', 'T', 'F', 'S', 'S', 'M'];
    const today = new Date().getDay();
    const adjustedToday = today === 0 ? 6 : today - 1;
    
    return days.map((day, index) => {
      let status = 'future';
      if (index < adjustedToday && currentStreak > 0) {
        status = 'success';
      } else if (index === adjustedToday) {
        status = 'today';
      }
      return { day, status };
    });
  };

  const weekDays = getWeekDays();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0e27', '#1a1f3a', '#0a0e27']}
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
            <View style={styles.headerIcons}>
              <View style={styles.headerIconItem}>
                <Ionicons name="flame" size={20} color="#ff6b35" />
                <Text style={styles.headerIconText}>{currentStreak}</Text>
              </View>
              <TouchableOpacity style={styles.headerIconBtn}>
                <MaterialCommunityIcons name="leaf" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIconBtn}>
                <Ionicons name="power" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Weekly Calendar */}
          <View style={styles.weekContainer}>
            {weekDays.map((d, i) => (
              <View key={i} style={styles.dayContainer}>
                <View style={[
                  styles.dayCircle,
                  d.status === 'success' && styles.daySuccess,
                  d.status === 'today' && styles.dayToday,
                ]}>
                  {d.status === 'success' ? (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  ) : d.status === 'today' ? (
                    <Text style={styles.dash}>—</Text>
                  ) : null}
                </View>
                <Text style={styles.dayLabel}>{d.day}</Text>
              </View>
            ))}
          </View>

          {/* Main Timer Circle - 3D Metalik */}
          <View style={styles.timerContainer}>
            <Animated.View style={[styles.metalCircleOuter, { transform: [{ rotate: spin }] }]}>
              <LinearGradient
                colors={['#e8e8e8', '#b8b8b8', '#d0d0d0', '#a0a0a0', '#c8c8c8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.metalCircle}
              >
                <View style={styles.metalCircleInner}>
                  <LinearGradient
                    colors={['#f0f0f0', '#c0c0c0', '#e0e0e0', '#b0b0b0']}
                    start={{ x: 0.2, y: 0.2 }}
                    end={{ x: 0.8, y: 0.8 }}
                    style={styles.metalCircleCenter}
                  />
                </View>
              </LinearGradient>
            </Animated.View>
            
            <Text style={styles.timerLabel}>You've been porn-free for:</Text>
            <Text style={styles.timerValue}>{currentStreak} days</Text>
            
            <View style={styles.timerBadge}>
              <Text style={styles.timerBadgeText}>
                {timer.hours}hr {timer.minutes}m {timer.seconds}s
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <ActionButton 
              icon={<MaterialCommunityIcons name="hand-back-left" size={24} color="#fff" />} 
              label="Pledge" 
            />
            <ActionButton 
              icon={<MaterialCommunityIcons name="meditation" size={24} color="#fff" />} 
              label="Meditate" 
            />
            <ActionButton 
              icon={<Ionicons name="refresh" size={24} color="#fff" />} 
              label="Reset" 
              onPress={() => setShowPanicModal(true)} 
            />
            <ActionButton 
              icon={<Feather name="edit-2" size={22} color="#fff" />} 
              label="Edit Streak" 
            />
          </View>

          {/* Brain Rewiring Progress */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Brain Rewiring</Text>
              <Text style={styles.progressValue}>{brainRewiring}%</Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#3b82f6', '#06b6d4', '#10b981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${brainRewiring}%` }]}
              />
            </View>
          </View>

          {/* ===== SCROLLABLE SECTION 2 ===== */}
          
          {/* Two Cards Row - Quit Date & Tempted */}
          <View style={styles.twoCardsRow}>
            <View style={styles.smallCard}>
              <View style={styles.smallCardIcon}>
                <Ionicons name="checkmark-circle" size={32} color="#8b5cf6" />
              </View>
              <Text style={styles.smallCardLabel}>You're on track to quit by:</Text>
              <Text style={styles.smallCardValue}>Şub 8, 2026</Text>
            </View>
            <View style={styles.smallCard}>
              <Text style={styles.emojiIcon}>😄</Text>
              <Text style={styles.smallCardLabel}>Tempted to Relapse:</Text>
              <Text style={styles.smallCardValueGreen}>False</Text>
            </View>
          </View>

          {/* I'm Quitting Because Card */}
          <View style={styles.quittingCard}>
            <View style={styles.quittingHeader}>
              <View style={styles.quittingHeaderLeft}>
                <Ionicons name="help-circle-outline" size={20} color="rgba(255,255,255,0.6)" />
                <Text style={styles.quittingHeaderText}>I'm quitting because:</Text>
              </View>
              <TouchableOpacity>
                <Feather name="edit-2" size={18} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>
            <Text style={styles.quittingReason}>
              'Mentalimi ve üretkenligimi geri kazanmak icin'
            </Text>
            <View style={styles.bestDaysRow}>
              <Ionicons name="star-outline" size={16} color="#3b82f6" />
              <Text style={styles.bestDaysText}>Best 58 days</Text>
            </View>
          </View>

          {/* 28 Day Challenge */}
          <View style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <Text style={styles.challengeLabel}>28 Day Challenge</Text>
              <Text style={styles.challengeValue}>10%</Text>
            </View>
            <View style={styles.challengeBar}>
              <LinearGradient
                colors={['#ef4444', '#f97316', '#eab308']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.challengeFill, { width: '10%' }]}
              />
            </View>
          </View>

          {/* Main Section */}
          <View style={styles.mainSection}>
            <Text style={styles.mainSectionTitle}>Main</Text>
            
            {/* Save A Friend */}
            <TouchableOpacity style={styles.mainCard} activeOpacity={0.7}>
              <View style={styles.mainCardLeft}>
                <View style={styles.mainCardIconBg}>
                  <MaterialCommunityIcons name="account-heart" size={24} color="#06b6d4" />
                </View>
                <View style={styles.mainCardText}>
                  <Text style={styles.mainCardTitle}>Save A Friend</Text>
                  <Text style={styles.mainCardDesc}>Send an anonymous invite to a friend that goons too much</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>

            {/* Blogs */}
            <TouchableOpacity style={styles.mainCard} activeOpacity={0.7}>
              <View style={styles.mainCardLeft}>
                <View style={styles.mainCardIconBg}>
                  <Ionicons name="document-text" size={24} color="#06b6d4" />
                </View>
                <View style={styles.mainCardText}>
                  <Text style={styles.mainCardTitle}>Blogs</Text>
                  <Text style={styles.mainCardDesc}>Learn about quitting porn from hundreds of our blog posts</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>

          {/* Panic Button */}
          <TouchableOpacity 
            style={styles.panicButton}
            onPress={() => setShowPanicModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.panicButtonInner}>
              <Ionicons name="alert-circle-outline" size={24} color="#fff" />
              <Text style={styles.panicText}>Panic Button</Text>
            </View>
          </TouchableOpacity>

          {/* Bottom spacing for tab bar */}
          <View style={{ height: 100 }} />
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

function ActionButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.actionIconContainer}>
        {icon}
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
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
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  logo: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 3,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerIconText: {
    color: '#ff6b35',
    fontSize: 14,
    fontWeight: '700',
  },
  headerIconBtn: {
    padding: 4,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  daySuccess: {
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    borderColor: '#8b5cf6',
  },
  dayToday: {
    borderColor: 'rgba(139, 92, 246, 0.6)',
    borderStyle: 'dashed',
  },
  dash: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: '300',
  },
  dayLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  metalCircleOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  metalCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  metalCircleInner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(200,200,200,0.3)',
  },
  metalCircleCenter: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  timerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    marginBottom: 8,
  },
  timerValue: {
    color: '#fff',
    fontSize: 52,
    fontWeight: '300',
    marginBottom: 15,
    letterSpacing: 2,
  },
  timerBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  timerBadgeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(30, 41, 82, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
  },
  progressCard: {
    backgroundColor: 'rgba(30, 41, 82, 0.5)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  progressValue: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '700',
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  panicButton: {
    backgroundColor: '#dc2626',
    borderRadius: 30,
    marginBottom: 20,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  panicButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
  },
  panicText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  // ===== SECTION 2 STYLES =====
  twoCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  smallCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  smallCardIcon: {
    marginBottom: 8,
  },
  smallCardLabel: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  smallCardValue: {
    color: '#1a1a2e',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  smallCardValueGreen: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emojiIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quittingCard: {
    backgroundColor: 'rgba(30, 41, 82, 0.6)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quittingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quittingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quittingHeaderText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  quittingReason: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 26,
    marginBottom: 16,
  },
  bestDaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bestDaysText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  challengeCard: {
    backgroundColor: 'rgba(30, 41, 82, 0.5)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  challengeValue: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '700',
  },
  challengeBar: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  challengeFill: {
    height: '100%',
    borderRadius: 5,
  },
  mainSection: {
    marginBottom: 20,
  },
  mainSectionTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  mainCard: {
    backgroundColor: 'rgba(30, 41, 82, 0.7)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  mainCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mainCardIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  mainCardText: {
    flex: 1,
  },
  mainCardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  mainCardDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    lineHeight: 18,
  },
});
