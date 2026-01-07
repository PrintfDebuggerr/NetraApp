import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useStreak } from '../contexts/StreakContext';

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
      opacity: Math.random() * 0.15 + 0.05,
    });
  }
  return stars;
};

const stars = generateStars(40);

// Achievement Badge Component
function AchievementBadge({ icon, label, isUnlocked, gradientColors }) {
  if (isUnlocked) {
    return (
      <View style={styles.achievementItem}>
        <LinearGradient
          colors={gradientColors}
          style={styles.achievementGradient}
        >
          <View style={styles.achievementInner}>
            {icon}
          </View>
        </LinearGradient>
        <Text style={styles.achievementLabel}>{label}</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.achievementItem}>
      <View style={styles.achievementLocked}>
        <View style={styles.achievementLockedInner}>
          {icon}
        </View>
      </View>
      <Text style={styles.achievementLabelLocked}>Locked</Text>
    </View>
  );
}

// Settings Item Component
function SettingsItem({ icon, iconBgColor, title, subtitle, hasToggle, toggleValue, onToggle, onPress }) {
  return (
    <TouchableOpacity 
      style={styles.settingsItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.settingsIconBg, { backgroundColor: iconBgColor }]}>
          {icon}
        </View>
        <View>
          <Text style={styles.settingsTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {hasToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: '#374151', true: PRIMARY }}
          thumbColor="#fff"
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { streakData } = useStreak();
  const [internetFilter, setInternetFilter] = useState(true);

  const handleLogout = async () => {
    await logout();
  };

  const currentStreak = streakData?.currentStreak || 12;
  const longestStreak = streakData?.longestStreak || 45;
  const xp = 450;
  const daysToSober = 90;
  const userName = user?.email?.split('@')[0] || 'User';

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

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity>
            <Text style={styles.settingsLink}>SETTINGS</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Hero */}
          <View style={styles.profileHero}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#0df2a6', '#06b6d4']}
                style={styles.avatarGradient}
              >
                <View style={styles.avatarInner}>
                  <Ionicons name="person" size={48} color="#fff" />
                </View>
              </LinearGradient>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
              </View>
            </View>
            <Text style={styles.userName}>@{userName}</Text>
            <Text style={styles.userTitle}>RECOVERY WARRIOR</Text>

            {/* Status Chips */}
            <View style={styles.statusChips}>
              <LinearGradient
                colors={['rgba(249, 115, 22, 0.2)', 'rgba(239, 68, 68, 0.2)']}
                style={styles.statusChip}
              >
                <Ionicons name="flame" size={20} color="#fb923c" />
                <Text style={styles.statusChipText}>{currentStreak} Days</Text>
              </LinearGradient>
              <LinearGradient
                colors={['rgba(59, 130, 246, 0.2)', 'rgba(13, 204, 242, 0.2)']}
                style={styles.statusChip}
              >
                <Ionicons name="diamond" size={20} color={PRIMARY} />
                <Text style={styles.statusChipTextBlue}>{xp} XP</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Achievements Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsRow}
            >
              <AchievementBadge
                icon={<Ionicons name="trophy" size={28} color="#facc15" />}
                label="First Week"
                isUnlocked={true}
                gradientColors={['#facc15', '#ea580c']}
              />
              <AchievementBadge
                icon={<MaterialCommunityIcons name="brain" size={28} color={PRIMARY} />}
                label="Mindful"
                isUnlocked={true}
                gradientColors={['#60a5fa', PRIMARY]}
              />
              <AchievementBadge
                icon={<Ionicons name="medal" size={28} color="#9ca3af" />}
                label="Locked"
                isUnlocked={false}
                gradientColors={['#6b7280', '#4b5563']}
              />
              <AchievementBadge
                icon={<Ionicons name="ribbon" size={28} color="#9ca3af" />}
                label="Locked"
                isUnlocked={false}
                gradientColors={['#6b7280', '#4b5563']}
              />
              <AchievementBadge
                icon={<Ionicons name="star" size={28} color="#9ca3af" />}
                label="Locked"
                isUnlocked={false}
                gradientColors={['#6b7280', '#4b5563']}
              />
            </ScrollView>
          </View>

          {/* Progress CTA Button */}
          <TouchableOpacity style={styles.progressCTA} activeOpacity={0.9}>
            <LinearGradient
              colors={['#0df2a6', '#06b6d4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.progressCTAGradient}
            >
              <View style={styles.progressCTAContent}>
                <View>
                  <Text style={styles.progressCTATitle}>View Progress Card</Text>
                  <Text style={styles.progressCTASubtitle}>Detailed analytics & insights</Text>
                </View>
                <View style={styles.progressCTAIcon}>
                  <Ionicons name="arrow-forward" size={24} color="#fff" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: 'rgba(250, 204, 21, 0.1)' }]}>
                <Ionicons name="trophy" size={22} color="#facc15" />
              </View>
              <View>
                <Text style={styles.statValue}>
                  {longestStreak} <Text style={styles.statUnit}>days</Text>
                </Text>
                <Text style={styles.statLabel}>BEST RECORD</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: 'rgba(74, 222, 128, 0.1)' }]}>
                <Ionicons name="flag" size={22} color="#4ade80" />
              </View>
              <View>
                <Text style={styles.statValue}>
                  {daysToSober} <Text style={styles.statUnit}>days</Text>
                </Text>
                <Text style={styles.statLabel}>TIL SOBER</Text>
              </View>
            </View>
          </View>

          {/* Invite Friends Card */}
          <View style={styles.inviteCard}>
            <View style={styles.inviteCardBlob} />
            <View style={styles.inviteCardContent}>
              <View style={styles.inviteCardHeader}>
                <View style={styles.inviteCardText}>
                  <Text style={styles.inviteCardTitle}>Invite Your Friends</Text>
                  <Text style={styles.inviteCardSubtitle}>
                    Recovery is stronger together. Get premium features for every invite.
                  </Text>
                </View>
                <View style={styles.inviteCardIconBg}>
                  <Ionicons name="people" size={24} color="#c084fc" />
                </View>
              </View>
              <TouchableOpacity style={styles.inviteButton}>
                <Ionicons name="share-outline" size={18} color="#e9d5ff" />
                <Text style={styles.inviteButtonText}>Share Invite</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings List */}
          <View style={styles.settingsList}>
            <SettingsItem
              icon={<Ionicons name="shield-checkmark" size={20} color="#60a5fa" />}
              iconBgColor="rgba(59, 130, 246, 0.1)"
              title="Internet Filter"
              subtitle="Block adult content"
              hasToggle={true}
              toggleValue={internetFilter}
              onToggle={setInternetFilter}
            />
            <View style={styles.settingsDivider} />
            <SettingsItem
              icon={<Ionicons name="options" size={20} color="#d1d5db" />}
              iconBgColor="rgba(107, 114, 128, 0.1)"
              title="App Preferences"
            />
            <View style={styles.settingsDivider} />
            <SettingsItem
              icon={<Ionicons name="help-circle" size={20} color="#d1d5db" />}
              iconBgColor="rgba(107, 114, 128, 0.1)"
              title="Help & Support"
            />
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#f87171" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: 'rgba(11, 17, 33, 0.8)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  settingsLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0df2a6',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  profileHero: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarGradient: {
    width: 128,
    height: 128,
    borderRadius: 64,
    padding: 3,
    shadowColor: '#0df2a6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 64,
    backgroundColor: '#0B1121',
    borderWidth: 4,
    borderColor: '#0B1121',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  userTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(13, 242, 166, 0.8)',
    letterSpacing: 3,
    marginBottom: 24,
  },
  statusChips: {
    flexDirection: 'row',
    gap: 12,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  statusChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fed7aa',
  },
  statusChipTextBlue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#bfdbfe',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
  },
  achievementsRow: {
    gap: 16,
    paddingRight: 24,
  },
  achievementItem: {
    alignItems: 'center',
    gap: 8,
    minWidth: 80,
  },
  achievementGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementInner: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: '#162035',
    borderWidth: 2,
    borderColor: '#162035',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementLocked: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(107, 114, 128, 0.5)',
    padding: 2,
  },
  achievementLockedInner: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: '#162035',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  achievementLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  achievementLabelLocked: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
  },
  progressCTA: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0df2a6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  progressCTAGradient: {
    padding: 24,
  },
  progressCTAContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCTATitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  progressCTASubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(219, 234, 254, 0.9)',
  },
  progressCTAIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(22, 32, 53, 0.6)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 1,
    marginTop: 4,
  },
  inviteCard: {
    backgroundColor: 'rgba(22, 32, 53, 0.6)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    position: 'relative',
  },
  inviteCardBlob: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  inviteCardContent: {
    position: 'relative',
    zIndex: 10,
  },
  inviteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  inviteCardText: {
    flex: 1,
    paddingRight: 16,
  },
  inviteCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  inviteCardSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  inviteCardIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '3deg' }],
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1a2642',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  inviteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e9d5ff',
  },
  settingsList: {
    backgroundColor: 'rgba(22, 32, 53, 0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingsIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  settingsSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f87171',
  },
});
