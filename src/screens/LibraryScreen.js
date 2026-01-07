import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Yıldız efekti için rastgele noktalar
const generateStars = (count) => {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 50,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.2,
    });
  }
  return stars;
};

const stars = generateStars(30);

// Primary color - matching StatsScreen theme
const PRIMARY = '#0df2a6';

// Quick Action Button Component
function QuickActionButton({ icon, label, color }) {
  return (
    <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.7}>
      <View style={styles.quickActionIcon}>
        {icon}
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, subtitle, borderColor, iconBgColor }) {
  return (
    <TouchableOpacity 
      style={[styles.featureCard, { borderColor }]} 
      activeOpacity={0.7}
    >
      <View style={[styles.featureIconBg, { backgroundColor: iconBgColor }]}>
        {icon}
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

// Relaxation Sound Button Component
function SoundButton({ icon, label }) {
  return (
    <TouchableOpacity style={styles.soundButton} activeOpacity={0.7}>
      <View style={styles.soundIconContainer}>
        {icon}
      </View>
      <Text style={styles.soundLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function LibraryScreen() {
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

        {/* Moon glow */}
        <View style={styles.moonGlow} />

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

          {/* Quick Actions Grid */}
          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              icon={<MaterialCommunityIcons name="weather-windy" size={28} color="#a5f3fc" />}
              label="Breathing"
            />
            <QuickActionButton
              icon={<MaterialCommunityIcons name="robot" size={28} color="#c084fc" />}
              label="AI Therapist"
            />
            <QuickActionButton
              icon={<MaterialCommunityIcons name="meditation" size={28} color="#bfdbfe" />}
              label="Meditate"
            />
            <QuickActionButton
              icon={<Ionicons name="book-outline" size={28} color="#99f6e4" />}
              label="Research"
            />
          </View>

          {/* Feature Cards Grid */}
          <View style={styles.featureCardsGrid}>
            <FeatureCard
              icon={<Ionicons name="document-text" size={22} color="#22d3ee" />}
              title="Articles"
              subtitle="Educational Resources"
              borderColor="rgba(6, 182, 212, 0.3)"
              iconBgColor="rgba(6, 182, 212, 0.2)"
            />
            <FeatureCard
              icon={<Ionicons name="trophy" size={22} color="#facc15" />}
              title="Leaderboard"
              subtitle="Community Ranking"
              borderColor="rgba(234, 179, 8, 0.3)"
              iconBgColor="rgba(234, 179, 8, 0.2)"
            />
            <FeatureCard
              icon={<Ionicons name="school" size={22} color="#f472b6" />}
              title="Learn"
              subtitle="Course Material"
              borderColor="rgba(236, 72, 153, 0.3)"
              iconBgColor="rgba(236, 72, 153, 0.2)"
            />
            <FeatureCard
              icon={<Ionicons name="mic" size={22} color="#2dd4bf" />}
              title="Podcast"
              subtitle="Recovery Stories"
              borderColor="rgba(20, 184, 166, 0.3)"
              iconBgColor="rgba(20, 184, 166, 0.2)"
            />
          </View>

          {/* Relaxation Noises Section */}
          <View style={styles.relaxationSection}>
            <Text style={styles.sectionTitle}>Relaxation Noises</Text>
            <View style={styles.soundsRow}>
              <SoundButton
                icon={<Ionicons name="rainy" size={24} color="#93c5fd" />}
                label="Rain"
              />
              <SoundButton
                icon={<Ionicons name="flame" size={24} color="#fb923c" />}
                label="Fire"
              />
              <SoundButton
                icon={<MaterialCommunityIcons name="pine-tree" size={24} color="#4ade80" />}
                label="Forest"
              />
              <SoundButton
                icon={<MaterialCommunityIcons name="waveform" size={24} color="#d1d5db" />}
                label="Noise"
              />
            </View>
          </View>

          {/* Community Card */}
          <View style={styles.communityCard}>
            <View style={styles.communityAvatarContainer}>
              <LinearGradient
                colors={['#06b6d4', '#3b82f6']}
                style={styles.communityAvatarGradient}
              >
                <View style={styles.communityAvatarInner}>
                  <Ionicons name="person" size={24} color="#fff" />
                </View>
              </LinearGradient>
              <View style={styles.communityRankBadge}>
                <Text style={styles.communityRankText}>#4</Text>
              </View>
            </View>
            <View style={styles.communityTextContainer}>
              <Text style={styles.communityTitle}>You're doing great!</Text>
              <Text style={styles.communitySubtitle}>Top 5% of community this week.</Text>
            </View>
            <TouchableOpacity style={styles.communityViewButton}>
              <Text style={styles.communityViewButtonText}>View</Text>
            </TouchableOpacity>
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
  moonGlow: {
    position: 'absolute',
    top: 32,
    right: 24,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.2,
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
    paddingTop: 12,
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  websiteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#1e2738',
    borderWidth: 1,
    borderColor: '#2a3548',
  },
  websiteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  quickActionButton: {
    alignItems: 'center',
    gap: 8,
  },
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
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9ca3af',
    textAlign: 'center',
  },
  featureCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    width: '47%',
    aspectRatio: 1.15,
    backgroundColor: '#1e2738',
    borderRadius: 32,
    borderWidth: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  featureIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextContainer: {
    marginTop: 'auto',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  relaxationSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  soundsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  soundButton: {
    alignItems: 'center',
    gap: 8,
  },
  soundIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1e2738',
    borderWidth: 1,
    borderColor: '#2a3548',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
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
  communityAvatarContainer: {
    position: 'relative',
  },
  communityAvatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 2,
    backgroundColor: '#0df2a6',
  },
  communityAvatarInner: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityRankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0df2a6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a2332',
  },
  communityRankText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  communityTextContainer: {
    flex: 1,
  },
  communityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  communitySubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  communityViewButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#0B1121',
    borderWidth: 1,
    borderColor: 'rgba(13, 242, 166, 0.3)',
  },
  communityViewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0df2a6',
  },
});
