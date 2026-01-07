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
import { useStreak } from '../contexts/StreakContext';

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

// Circular Progress Component (simplified with proper circle)
function CircularProgress({ percentage, size = 240 }) {
  const strokeWidth = 28;
  const innerSize = size - strokeWidth * 2;

  return (
    <View style={styles.circularProgressContainer}>
      <View style={[styles.circularProgressOuter, { width: size, height: size }]}>
        {/* Background Circle */}
        <View
          style={[
            styles.circularProgressBgRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 2,
            },
          ]}
        />
        
        {/* Progress Ring with Gradient */}
        <View style={[styles.progressRingWrapper, { width: size, height: size, borderRadius: size / 2 }]}>
          <LinearGradient
            colors={['#10b981', '#06b6d4', '#3b82f6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.progressRingGradient,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: strokeWidth,
              },
            ]}
          />
        </View>

        {/* Inner Circle Mask */}
        <View
          style={[
            styles.innerCircleMask,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
            },
          ]}
        />

        {/* Glow Effect */}
        <View
          style={[
            styles.glowEffect,
            {
              width: size + 20,
              height: size + 20,
              borderRadius: (size + 20) / 2,
            },
          ]}
        />
      </View>
      
      <View style={styles.circularProgressText}>
        <Text style={styles.recoveryLabel}>RECOVERY</Text>
        <Text style={styles.percentageText}>{percentage}%</Text>
        <Text style={styles.streakLabel}>58 D STREAK</Text>
      </View>
    </View>
  );
}

// Line Chart Component (using simple Views)
function LineChart() {
  const chartWidth = width - 60;
  const chartHeight = 120;
  
  // Data points for the chart (y positions, 0 = top, 100 = bottom)
  const dataPoints = [
    { x: 0, y: 80 },
    { x: 20, y: 65 },
    { x: 40, y: 50 },
    { x: 60, y: 35 },
    { x: 80, y: 20 },
    { x: 100, y: 10 },
  ];

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Your progress</Text>
      <View style={[styles.chartArea, { width: chartWidth, height: chartHeight }]}>
        {/* Vertical Grid Lines */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            style={[
              styles.gridLine,
              {
                left: (i * chartWidth) / 5,
                height: chartHeight,
              },
            ]}
          />
        ))}
        {/* Data Points */}
        {dataPoints.map((point, index) => (
          <View
            key={index}
            style={[
              styles.dataPoint,
              {
                left: (point.x / 100) * chartWidth - 3,
                top: (point.y / 100) * chartHeight - 3,
              },
            ]}
          />
        ))}
        {/* Connecting Lines (approximation) */}
        {dataPoints.map((point, index) => {
          if (index === dataPoints.length - 1) return null;
          const nextPoint = dataPoints[index + 1];
          const x1 = (point.x / 100) * chartWidth;
          const y1 = (point.y / 100) * chartHeight;
          const x2 = (nextPoint.x / 100) * chartWidth;
          const y2 = (nextPoint.y / 100) * chartHeight;
          
          const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
          
          return (
            <View
              key={`line-${index}`}
              style={[
                styles.connectingLine,
                {
                  left: x1,
                  top: y1,
                  width: length,
                  transform: [{ rotate: `${angle}deg` }],
                },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.chartLabels}>
        <Text style={styles.chartLabel}>First Login date</Text>
        <Text style={styles.chartLabel}>Today</Text>
      </View>
    </View>
  );
}

// Benefit Card Component
function BenefitCard({ emoji, title, description, progress }) {
  return (
    <View style={styles.benefitCard}>
      <View style={styles.benefitHeader}>
        <Text style={styles.benefitEmoji}>{emoji}</Text>
        <View style={styles.benefitTextContainer}>
          <Text style={styles.benefitTitle}>{title}</Text>
          <Text style={styles.benefitDescription}>{description}</Text>
        </View>
      </View>
      <View style={styles.benefitProgressBar}>
        <LinearGradient
          colors={['#3b82f6', '#06b6d4', '#10b981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.benefitProgressFill, { width: `${progress}%` }]}
        />
      </View>
    </View>
  );
}

export default function StatsScreen() {
  const { streakData } = useStreak();
  const currentStreak = streakData?.currentStreak || 0;
  const recoveryPercentage = Math.min(Math.round((currentStreak / 90) * 100), 100);

  const benefits = [
    {
      emoji: '💬',
      title: 'Improved confidence',
      description: 'Confidence grows, especially in social and personal interactions.',
      progress: 95,
    },
    {
      emoji: '🌟',
      title: 'Increased Self-Esteem',
      description: 'Improving control boosts your self-image and self-esteem.',
      progress: 92,
    },
    {
      emoji: '🧘',
      title: 'Mental Clarity',
      description: 'Clear thinking and focus returns after quitting.',
      progress: 88,
    },
    {
      emoji: '🔥',
      title: 'Increased Sex Drive',
      description: 'Healthier sex drive and performance after 30-45 days.',
      progress: 85,
    },
    {
      emoji: '🧠',
      title: 'Healthier Thoughts',
      description: 'Less anxiety; healthier views on sex and relationships develop over time.',
      progress: 78,
    },
    {
      emoji: '⏰',
      title: 'More Time & Productivity',
      description: 'More energy and focus for meaningful, productive daily activities.',
      progress: 90,
    },
    {
      emoji: '😴',
      title: 'Better Sleep',
      description: 'Improved sleep quality often seen within a few weeks.',
      progress: 87,
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0a0e27', '#1a1f3a', '#0a0e27']} style={styles.gradient}>
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
              <Text style={styles.shareText}>Share</Text>
              <Ionicons name="share-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Circular Progress */}
          <View style={styles.circularSection}>
            <CircularProgress percentage={recoveryPercentage} />
          </View>

          {/* On Track Card */}
          <View style={styles.onTrackSection}>
            <Text style={styles.onTrackText}>You're on track to quit porn by:</Text>
            <View style={styles.datePill}>
              <Text style={styles.datePillText}>Şub 8, 2026</Text>
            </View>
          </View>

          {/* Motivation Text */}
          <Text style={styles.motivationText}>
            You've come so far—over 50 days! Reflect on the mental and emotional strength you've
            gained. You're becoming the person you've always wanted to be.
          </Text>

          {/* Line Chart */}
          <LineChart />

          {/* Benefits List */}
          <View style={styles.benefitsSection}>
            {benefits.map((benefit, index) => (
              <BenefitCard
                key={index}
                emoji={benefit.emoji}
                title={benefit.title}
                description={benefit.description}
                progress={benefit.progress}
              />
            ))}
          </View>

          {/* Bottom spacing for tab bar */}
          <View style={{ height: 100 }} />
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
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shareText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  circularSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  circularProgressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  circularProgressOuter: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressBgRing: {
    position: 'absolute',
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'transparent',
  },
  progressRingWrapper: {
    position: 'absolute',
    overflow: 'hidden',
  },
  progressRingGradient: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  innerCircleMask: {
    position: 'absolute',
    backgroundColor: '#0a0e27',
    zIndex: 10,
  },
  glowEffect: {
    position: 'absolute',
    backgroundColor: 'transparent',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    zIndex: -1,
  },
  circularProgressText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  recoveryLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 3,
    marginBottom: 10,
    fontFamily: 'System',
  },
  percentageText: {
    color: '#fff',
    fontSize: 80,
    fontWeight: '100',
    letterSpacing: -4,
    fontFamily: 'System',
  },
  streakLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 8,
    fontFamily: 'System',
  },
  onTrackSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  onTrackText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginBottom: 14,
    fontWeight: '400',
  },
  datePill: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.6)',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  datePillText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  motivationText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
    fontWeight: '400',
  },
  chartContainer: {
    backgroundColor: 'rgba(30, 41, 82, 0.5)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chartTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartArea: {
    position: 'relative',
    marginBottom: 12,
  },
  gridLine: {
    position: 'absolute',
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  dataPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  connectingLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#fff',
    transformOrigin: 'left center',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  benefitsSection: {
    gap: 16,
  },
  benefitCard: {
    backgroundColor: 'rgba(30, 41, 82, 0.6)',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  benefitEmoji: {
    fontSize: 32,
    marginRight: 14,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  benefitDescription: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 20,
  },
  benefitProgressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  benefitProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
