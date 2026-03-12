import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useStreak } from '../contexts/StreakContext';

const { width } = Dimensions.get('window');

// Primary color from design
const PRIMARY = '#0df2a6';
const PRIMARY_DIM = 'rgba(13, 242, 166, 0.2)';

// Yıldız efekti için rastgele noktalar
const generateStars = (count) => {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
    });
  }
  return stars;
};

const stars = generateStars(50);

// Circular Progress Component with SVG
function CircularProgress({ percentage, streak, size = 256 }) {
  const strokeWidth = 6;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.circularProgressContainer}>
      {/* Outer Glow */}
      <View style={styles.outerGlow} />
      
      {/* SVG Circle */}
      <Svg width={size} height={size} viewBox="0 0 100 100" style={styles.svgCircle}>
        {/* Background Circle */}
        <Circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#1f2937"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
        />
        {/* Progress Circle */}
        <Circle
          cx="50"
          cy="50"
          r={radius}
          stroke={PRIMARY}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin="50, 50"
        />
      </Svg>

      {/* Inner Content */}
      <View style={styles.circularInnerContent}>
        <Text style={styles.percentageText}>
          {percentage}<Text style={styles.percentageSymbol}>%</Text>
        </Text>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color={PRIMARY} />
          <Text style={styles.streakBadgeText}>{streak} D STREAK</Text>
        </View>
      </View>
    </View>
  );
}

// Target Card Component
function TargetCard({ targetDays, targetDate }) {
  return (
    <View style={styles.targetCard}>
      <View style={styles.targetIconContainer}>
        <Ionicons name="locate" size={18} color={PRIMARY} />
      </View>
      <View style={styles.targetTextContainer}>
        <Text style={styles.targetLabel}>Target</Text>
        <Text style={styles.targetText}>
          On track for {targetDays} Days <Text style={styles.targetDate}>({targetDate})</Text>
        </Text>
      </View>
    </View>
  );
}

// Progress Chart Component
function ProgressChart() {
  const chartWidth = width - 80;
  const chartHeight = 128;

  return (
    <View style={styles.chartContainer}>
      {/* Header */}
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Your Progress</Text>
        <View style={styles.chartBadge}>
          <Ionicons name="trending-up" size={16} color={PRIMARY} />
          <Text style={styles.chartBadgeText}>+12%</Text>
        </View>
      </View>

      {/* Chart Area */}
      <View style={styles.chartArea}>
        {/* Grid Lines */}
        <View style={styles.gridLines}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.gridLine} />
          ))}
        </View>

        {/* SVG Chart */}
        <Svg width={chartWidth} height={chartHeight} viewBox="0 0 300 100" preserveAspectRatio="none">
          <Defs>
            <SvgLinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={PRIMARY} stopOpacity="0.2" />
              <Stop offset="100%" stopColor={PRIMARY} stopOpacity="0" />
            </SvgLinearGradient>
          </Defs>
          {/* Area Fill */}
          <Path
            d="M0 80 Q 50 70, 75 50 T 150 40 T 225 30 T 300 10 V 100 H 0 Z"
            fill="url(#chartGradient)"
          />
          {/* Line */}
          <Path
            d="M0 80 Q 50 70, 75 50 T 150 40 T 225 30 T 300 10"
            stroke={PRIMARY}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          {/* Current Point */}
          <Circle cx="300" cy="10" r="4" fill="#10231d" stroke={PRIMARY} strokeWidth="2" />
        </Svg>

        {/* Week Labels */}
        <View style={styles.chartLabels}>
          <Text style={styles.chartLabel}>Wk 1</Text>
          <Text style={styles.chartLabel}>Wk 2</Text>
          <Text style={styles.chartLabel}>Wk 3</Text>
          <Text style={styles.chartLabel}>Wk 4</Text>
        </View>
      </View>
    </View>
  );
}

// Milestone-based progress calculator
function calculateProgress(streakDays, milestones) {
  for (let i = milestones.length - 1; i >= 0; i--) {
    if (streakDays >= milestones[i].days) return milestones[i].progress;
  }
  return milestones[0].progress;
}

const BENEFIT_CONFIGS = [
  {
    emoji: '💬',
    title: 'Improved Confidence',
    description: 'Confidence grows in social and personal interactions.',
    color: '#0df2a6',
    milestones: [{ days: 0, progress: 5 }, { days: 7, progress: 20 }, { days: 14, progress: 50 }, { days: 30, progress: 100 }],
  },
  {
    emoji: '💥',
    title: 'Increased Self-Esteem',
    description: 'Improving control boosts your self-image.',
    color: '#f472b6',
    milestones: [{ days: 0, progress: 5 }, { days: 10, progress: 30 }, { days: 21, progress: 70 }, { days: 30, progress: 100 }],
  },
  {
    emoji: '🧘',
    title: 'Mental Clarity',
    description: 'Clear thinking and focus returns after quitting.',
    color: '#818cf8',
    milestones: [{ days: 0, progress: 5 }, { days: 5, progress: 15 }, { days: 14, progress: 60 }, { days: 21, progress: 100 }],
  },
  {
    emoji: '🧠',
    title: 'Healthier Thoughts',
    description: 'Less anxiety; healthier views on relationships.',
    color: '#c084fc',
    milestones: [{ days: 0, progress: 5 }, { days: 14, progress: 25 }, { days: 30, progress: 60 }, { days: 45, progress: 100 }],
  },
  {
    emoji: '⏰',
    title: 'More Productivity',
    description: 'More energy and focus for meaningful activities.',
    color: '#facc15',
    milestones: [{ days: 0, progress: 10 }, { days: 7, progress: 40 }, { days: 21, progress: 80 }, { days: 30, progress: 100 }],
  },
  {
    emoji: '😴',
    title: 'Better Sleep',
    description: 'Improved sleep quality seen within a few days.',
    color: '#38bdf8',
    milestones: [{ days: 0, progress: 10 }, { days: 3, progress: 30 }, { days: 7, progress: 70 }, { days: 14, progress: 100 }],
  },
  {
    emoji: '🔥',
    title: 'Increased Sex Drive',
    description: 'Healthier drive and performance after 30-45 days.',
    color: '#f97316',
    milestones: [{ days: 0, progress: 0 }, { days: 30, progress: 0 }, { days: 45, progress: 50 }, { days: 60, progress: 100 }],
  },
  {
    emoji: '⚡',
    title: 'Energy Levels',
    description: 'Physical energy noticeably increases.',
    color: '#fbbf24',
    milestones: [{ days: 0, progress: 5 }, { days: 7, progress: 35 }, { days: 21, progress: 75 }, { days: 30, progress: 100 }],
  },
  {
    emoji: '🤝',
    title: 'Social Skills',
    description: 'Social interaction quality improves.',
    color: '#4ade80',
    milestones: [{ days: 0, progress: 5 }, { days: 10, progress: 25 }, { days: 30, progress: 70 }, { days: 60, progress: 100 }],
  },
  {
    emoji: '🎯',
    title: 'Motivation',
    description: 'General motivation levels rise steadily.',
    color: '#a78bfa',
    milestones: [{ days: 0, progress: 5 }, { days: 7, progress: 30 }, { days: 21, progress: 65 }, { days: 45, progress: 100 }],
  },
  {
    emoji: '💪',
    title: 'Discipline',
    description: 'Self-control and willpower strengthen.',
    color: '#fb7185',
    milestones: [{ days: 0, progress: 5 }, { days: 7, progress: 30 }, { days: 30, progress: 70 }, { days: 60, progress: 100 }],
  },
];

// Benefit Card Component
function BenefitCard({ emoji, title, description, progress, barColor }) {
  const getPercentColor = () => {
    if (progress >= 70) return PRIMARY;
    if (progress >= 40) return '#d1d5db';
    return '#9ca3af';
  };

  const bgColor = barColor + '22';
  const borderColor = barColor + '44';

  return (
    <View style={styles.benefitCard}>
      <View style={[styles.benefitIconContainer, { backgroundColor: bgColor, borderColor }]}>
        <Text style={styles.benefitEmoji}>{emoji}</Text>
      </View>
      <View style={styles.benefitContent}>
        <View style={styles.benefitHeader}>
          <Text style={styles.benefitTitle} numberOfLines={1}>{title}</Text>
          <Text style={[styles.benefitPercent, { color: getPercentColor() }]}>{progress}%</Text>
        </View>
        <Text style={styles.benefitDescription} numberOfLines={1}>{description}</Text>
        <View style={styles.benefitProgressBar}>
          <View
            style={[
              styles.benefitProgressFill,
              { width: `${progress}%`, backgroundColor: barColor },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

function getTargetDate(streakData) {
  if (!streakData?.startDate) return 'N/A';
  const start = streakData.startDate instanceof Date
    ? streakData.startDate
    : streakData.startDate.toDate?.() || new Date(streakData.startDate);
  const target = new Date(start);
  target.setDate(target.getDate() + 90);
  return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function StatsScreen() {
  const { streakData } = useStreak();
  const currentStreak = streakData?.currentStreak || 0;
  const recoveryPercentage = Math.min(Math.round((currentStreak / 90) * 100), 100);

  const targetDate = getTargetDate(streakData);

  const benefits = BENEFIT_CONFIGS.map((cfg) => ({
    ...cfg,
    progress: calculateProgress(currentStreak, cfg.milestones),
  }));

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0a0e27', '#1a1f3a']} style={styles.gradient}>
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
            <Text style={styles.headerTitle}>Analytics</Text>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color={PRIMARY} />
            </TouchableOpacity>
          </View>

          {/* Hero Progress Circle Section */}
          <View style={styles.heroSection}>
            <CircularProgress percentage={recoveryPercentage} streak={currentStreak} />
            
            {/* Target Card */}
            <TargetCard targetDays={90} targetDate={targetDate} />

            {/* Motivational Text */}
            <Text style={styles.motivationText}>
              "The journey of a thousand miles begins with a single step."
            </Text>
          </View>

          {/* Chart Section */}
          <ProgressChart />

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <View style={styles.benefitsHeader}>
              <Text style={styles.benefitsTitle}>Benefits Unlocked</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {benefits.map((benefit, index) => (
              <BenefitCard
                key={index}
                emoji={benefit.emoji}
                title={benefit.title}
                description={benefit.description}
                progress={benefit.progress}
                barColor={benefit.color}
              />
            ))}
          </View>

          {/* Bottom spacing for tab bar */}
          <View style={{ height: 120 }} />
        </ScrollView>
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
    marginBottom: 16,
    paddingTop: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 16,
  },
  circularProgressContainer: {
    position: 'relative',
    width: 256,
    height: 256,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerGlow: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: 999,
    backgroundColor: 'rgba(13, 242, 166, 0.05)',
  },
  svgCircle: {
    transform: [{ rotate: '-90deg' }],
  },
  circularInnerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -2,
  },
  percentageSymbol: {
    fontSize: 30,
    color: '#0df2a6',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(13, 242, 166, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(13, 242, 166, 0.2)',
  },
  streakBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0df2a6',
    letterSpacing: 1,
  },
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    width: '100%',
    maxWidth: 280,
  },
  targetIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(13, 242, 166, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetTextContainer: {
    flex: 1,
  },
  targetLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  targetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginTop: 2,
  },
  targetDate: {
    color: '#0df2a6',
  },
  motivationText: {
    marginTop: 24,
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'italic',
    color: 'rgba(156, 163, 175, 0.8)',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  chartContainer: {
    marginTop: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  chartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(13, 242, 166, 0.1)',
  },
  chartBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0df2a6',
  },
  chartArea: {
    height: 148,
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20,
    justifyContent: 'space-between',
    opacity: 0.2,
  },
  gridLine: {
    height: 1,
    backgroundColor: '#6b7280',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  chartLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  benefitsSection: {
    marginTop: 32,
  },
  benefitsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0df2a6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  benefitEmoji: {
    fontSize: 24,
  },
  benefitContent: {
    flex: 1,
  },
  benefitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  benefitPercent: {
    fontSize: 12,
    fontWeight: '700',
  },
  benefitDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  benefitProgressBar: {
    height: 6,
    backgroundColor: 'rgba(107, 114, 128, 0.5)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  benefitProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
