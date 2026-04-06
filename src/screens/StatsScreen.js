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

const PRIMARY = '#0df2a6';

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

// Non-linear progress curves
// fast:    sqrt curve — hızlı başlar, ~60 günde platoya ulaşır
// medium:  üstel doyum — ılımlı başlar, ~60 günde %95
// delayed: sigmoid (merkez: 20. gün) — ilk 10 gün yavaş, sonra ivmelenir
// slow:    sigmoid (merkez: 40. gün) — geç açılır, 90+ günde zirve
// sexdrive: 30. güne kadar kilitli, sonra doğrusal büyür
function calculateProgressCurve(days, curve) {
  const d = Math.max(0, days);
  switch (curve) {
    case 'fast':
      return Math.min(100, Math.round(100 * Math.sqrt(d / 60)));
    case 'medium':
      return Math.min(100, Math.round(100 * (1 - Math.exp(-d / 18))));
    case 'delayed':
      return Math.min(100, Math.max(0, Math.round(100 / (1 + Math.exp(-(d - 20) / 8)))));
    case 'slow':
      return Math.min(100, Math.max(0, Math.round(100 / (1 + Math.exp(-(d - 40) / 12)))));
    case 'sexdrive':
      if (d < 30) return 0;
      return Math.min(100, Math.round((d - 30) * 100 / 60));
    default:
      return Math.min(100, Math.round(d * 100 / 90));
  }
}

const BENEFIT_CONFIGS = [
  {
    emoji: '⚡',
    title: 'Enerji',
    description: 'Fiziksel enerji seviyen ilk günden itibaren yükseliyor.',
    color: '#fbbf24',
    curve: 'fast',
  },
  {
    emoji: '🎯',
    title: 'Motivasyon',
    description: 'Hayata olan bağlılığın ve isteğin sürekli artıyor.',
    color: '#a78bfa',
    curve: 'fast',
  },
  {
    emoji: '😴',
    title: 'Uyku Kalitesi',
    description: 'Uyku düzenin ilk haftadan itibaren oturuyor.',
    color: '#38bdf8',
    curve: 'fast',
  },
  {
    emoji: '🧘',
    title: 'Zihinsel Netlik',
    description: 'Odaklanma ve berrak düşünme gücü kazanıyorsun.',
    color: '#818cf8',
    curve: 'medium',
  },
  {
    emoji: '⏰',
    title: 'Üretkenlik',
    description: 'Zamanını çok daha anlamlı şeylere harcıyorsun.',
    color: '#facc15',
    curve: 'medium',
  },
  {
    emoji: '💬',
    title: 'Özgüven',
    description: 'Sosyal ortamlarda kendine olan güven büyüyor.',
    color: '#0df2a6',
    curve: 'delayed',
  },
  {
    emoji: '💥',
    title: 'Öz-Saygı',
    description: 'Kontrolünü kazandıkça içindeki ses değişiyor.',
    color: '#f472b6',
    curve: 'delayed',
  },
  {
    emoji: '🤝',
    title: 'Sosyal Beceriler',
    description: 'Çevreniyle olan bağlantıların derinleşiyor.',
    color: '#4ade80',
    curve: 'delayed',
  },
  {
    emoji: '🧠',
    title: 'Sağlıklı Düşünceler',
    description: 'Kaygı azalıyor; ilişkilere bakışın kökten değişiyor.',
    color: '#c084fc',
    curve: 'slow',
  },
  {
    emoji: '💪',
    title: 'Disiplin',
    description: 'İrade ve öz-kontrol en geç, ama en kalıcı güç.',
    color: '#fb7185',
    curve: 'slow',
  },
  {
    emoji: '🔥',
    title: 'Cinsel Enerji',
    description: '30. günden sonra dengeleniyor ve güçleniyor.',
    color: '#f97316',
    curve: 'sexdrive',
  },
];

// Circular Progress Component
function CircularProgress({ percentage, streak, size = 256 }) {
  const strokeWidth = 6;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.circularProgressContainer}>
      <View style={styles.outerGlow} />
      <Svg width={size} height={size} viewBox="0 0 100 100" style={styles.svgCircle}>
        <Circle
          cx="50" cy="50" r={radius}
          stroke="#1f2937" strokeWidth={strokeWidth}
          fill="transparent" strokeLinecap="round"
        />
        <Circle
          cx="50" cy="50" r={radius}
          stroke={PRIMARY} strokeWidth={strokeWidth}
          fill="transparent" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          rotation="-90" origin="50, 50"
        />
      </Svg>
      <View style={styles.circularInnerContent}>
        <Text style={styles.percentageText}>
          {percentage}<Text style={styles.percentageSymbol}>%</Text>
        </Text>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color={PRIMARY} />
          <Text style={styles.streakBadgeText}>{streak} G STREAK</Text>
        </View>
      </View>
    </View>
  );
}

// Hedef Card
function TargetCard({ targetDays, targetDate }) {
  return (
    <View style={styles.targetCard}>
      <View style={styles.targetIconContainer}>
        <Ionicons name="locate" size={18} color={PRIMARY} />
      </View>
      <View style={styles.targetTextContainer}>
        <Text style={styles.targetLabel}>Hedef</Text>
        <Text style={styles.targetText}>
          {targetDays} güne doğru gidiyorsun{' '}
          <Text style={styles.targetDate}>({targetDate})</Text>
        </Text>
      </View>
    </View>
  );
}

// İlerlemen Chart
function ProgressChart() {
  const chartWidth = width - 80;
  const chartHeight = 128;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>İlerlemen</Text>
        <View style={styles.chartBadge}>
          <Ionicons name="trending-up" size={16} color={PRIMARY} />
          <Text style={styles.chartBadgeText}>+12%</Text>
        </View>
      </View>
      <View style={styles.chartArea}>
        <View style={styles.gridLines}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.gridLine} />
          ))}
        </View>
        <Svg width={chartWidth} height={chartHeight} viewBox="0 0 300 100" preserveAspectRatio="none">
          <Defs>
            <SvgLinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={PRIMARY} stopOpacity="0.2" />
              <Stop offset="100%" stopColor={PRIMARY} stopOpacity="0" />
            </SvgLinearGradient>
          </Defs>
          <Path
            d="M0 80 Q 50 70, 75 50 T 150 40 T 225 30 T 300 10 V 100 H 0 Z"
            fill="url(#chartGradient)"
          />
          <Path
            d="M0 80 Q 50 70, 75 50 T 150 40 T 225 30 T 300 10"
            stroke={PRIMARY} strokeWidth="3" strokeLinecap="round" fill="none"
          />
          <Circle cx="300" cy="10" r="4" fill="#10231d" stroke={PRIMARY} strokeWidth="2" />
        </Svg>
        <View style={styles.chartLabels}>
          <Text style={styles.chartLabel}>Hf 1</Text>
          <Text style={styles.chartLabel}>Hf 2</Text>
          <Text style={styles.chartLabel}>Hf 3</Text>
          <Text style={styles.chartLabel}>Hf 4</Text>
        </View>
      </View>
    </View>
  );
}

// Benefit Card
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
  return target.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export default function StatsScreen() {
  const { streakData } = useStreak();
  const currentStreak = streakData?.currentStreak || 0;
  const recoveryPercentage = Math.min(Math.round((currentStreak / 90) * 100), 100);
  const targetDate = getTargetDate(streakData);

  const benefits = BENEFIT_CONFIGS.map((cfg) => ({
    ...cfg,
    progress: calculateProgressCurve(currentStreak, cfg.curve),
  }));

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0a0e27', '#1a1f3a']} style={styles.gradient}>
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
            <Text style={styles.headerTitle}>Analizler</Text>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color={PRIMARY} />
            </TouchableOpacity>
          </View>

          {/* Hero Progress Circle */}
          <View style={styles.heroSection}>
            <CircularProgress percentage={recoveryPercentage} streak={currentStreak} />
            <TargetCard targetDays={90} targetDate={targetDate} />
            <Text style={styles.motivationText}>
              "Bin millik yolculuk tek bir adımla başlar."
            </Text>
          </View>

          {/* Chart */}
          <ProgressChart />

          {/* Benefits */}
          <View style={styles.benefitsSection}>
            <View style={styles.benefitsHeader}>
              <Text style={styles.benefitsTitle}>Açılan Kazanımlar</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>Tümünü Gör</Text>
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

          <View style={{ height: 120 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  star: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  scrollView: { flex: 1 },
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
    maxWidth: 300,
  },
  targetIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(13, 242, 166, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetTextContainer: { flex: 1 },
  targetLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  targetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginTop: 2,
  },
  targetDate: { color: '#0df2a6' },
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
  chartArea: { height: 148 },
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
  benefitsSection: { marginTop: 32 },
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
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
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
  benefitEmoji: { fontSize: 24 },
  benefitContent: { flex: 1 },
  benefitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  benefitTitle: {
    fontSize: 15,
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
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 17,
  },
  benefitProgressBar: {
    height: 5,
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  benefitProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
