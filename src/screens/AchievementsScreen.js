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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { badges } from '../utils/badgeData';

const { width } = Dimensions.get('window');
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

const stars = generateStars(40);

// Badge Component
function BadgeItem({ badge }) {
  if (!badge.unlocked) {
    return (
      <View style={styles.badgeItem}>
        <View style={styles.lockedBadgeOuter}>
          <View style={styles.lockedBadgeInner}>
            <Ionicons name="lock-closed" size={28} color="#6b7280" />
          </View>
        </View>
        <View style={styles.badgeTextContainer}>
          <Text style={styles.lockedBadgeTitle}>{badge.title}</Text>
          <Text style={styles.lockedBadgeTier}>LOCKED</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.badgeItem} activeOpacity={0.8}>
      <LinearGradient
        colors={badge.colors}
        style={[
          styles.badgeOuter,
          badge.glow && styles.badgeGlow,
        ]}
      >
        <View style={[styles.badgeInner, { backgroundColor: badge.bgColor }]}>
          <View style={styles.badgeShine} />
          {badge.iconType === 'material' ? (
            <MaterialCommunityIcons 
              name={badge.icon} 
              size={36} 
              color={badge.iconColor} 
            />
          ) : (
            <Ionicons 
              name={badge.icon} 
              size={36} 
              color={badge.iconColor} 
            />
          )}
        </View>
      </LinearGradient>
      <View style={styles.badgeTextContainer}>
        <Text style={styles.badgeTitle}>{badge.title}</Text>
        {badge.tierColor === 'rainbow' ? (
          <LinearGradient
            colors={['#f472b6', '#06b6d4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.rainbowTierBg}
          >
            <Text style={styles.rainbowTierText}>{badge.tier.toUpperCase()}</Text>
          </LinearGradient>
        ) : (
          <Text style={[styles.badgeTier, { color: badge.tierColor }]}>
            {badge.tier.toUpperCase()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function AchievementsScreen({ navigation }) {
  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalCount = badges.length;
  const progressPercent = (unlockedCount / totalCount) * 100;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a1517', '#0f2023', '#071618']}
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

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerBrand}>QUITTR</Text>
            <Text style={styles.headerTitle}>Achievements</Text>
          </View>
          <View style={styles.headerLogo}>
            <LinearGradient
              colors={[PRIMARY, '#a855f7']}
              style={styles.logoGradient}
            >
              <View style={styles.logoInner}>
                <Text style={styles.logoText}>Q</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.levelText}>Level 4</Text>
              <Text style={styles.collectedText}>{unlockedCount}/{totalCount} collected</Text>
            </View>
            <View style={styles.progressBarOuter}>
              <LinearGradient
                colors={['#0891b2', PRIMARY, '#a855f7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
              />
            </View>
            <Text style={styles.progressHint}>Keep going to unlock next tier</Text>
          </View>

          {/* Badges Grid */}
          <View style={styles.badgesGrid}>
            {badges.map((badge) => (
              <BadgeItem key={badge.id} badge={badge} />
            ))}
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const badgeSize = (width - 48 - 32) / 3;

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(15, 32, 35, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerBrand: {
    fontSize: 10,
    fontWeight: '700',
    color: PRIMARY,
    letterSpacing: 3,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerLogo: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    padding: 1,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  logoInner: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#0f2023',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  progressSection: {
    paddingVertical: 24,
    gap: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  levelText: {
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY,
    textShadowColor: 'rgba(13, 242, 166, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  collectedText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  progressBarOuter: {
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 999,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 6,
  },
  progressHint: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(103, 232, 249, 0.5)',
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    paddingTop: 8,
  },
  badgeItem: {
    width: badgeSize,
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  badgeOuter: {
    width: badgeSize,
    height: badgeSize,
    borderRadius: badgeSize / 2,
    padding: 2,
  },
  badgeGlow: {
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  badgeInner: {
    flex: 1,
    borderRadius: badgeSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  badgeShine: {
    position: 'absolute',
    top: -badgeSize * 0.3,
    left: -badgeSize * 0.3,
    width: badgeSize * 0.8,
    height: badgeSize * 0.8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: badgeSize / 2,
    transform: [{ rotate: '45deg' }],
  },
  badgeTextContainer: {
    alignItems: 'center',
    gap: 4,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  badgeTier: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  rainbowTierBg: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rainbowTierText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  lockedBadgeOuter: {
    width: badgeSize,
    height: badgeSize,
    borderRadius: badgeSize / 2,
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 2,
    opacity: 0.5,
  },
  lockedBadgeInner: {
    flex: 1,
    borderRadius: badgeSize / 2,
    backgroundColor: '#151515',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedBadgeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9ca3af',
  },
  lockedBadgeTier: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4b5563',
    letterSpacing: 1,
  },
});
