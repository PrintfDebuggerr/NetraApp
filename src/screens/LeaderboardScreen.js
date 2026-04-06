import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  documentId,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentBadge } from '../utils/badgeData';

const PRIMARY = '#0df2a6';

function getMedalColor(rank) {
  if (rank === 1) return '#f59e0b';
  if (rank === 2) return '#94a3b8';
  if (rank === 3) return '#cd7c3a';
  return null;
}

function getRankBg(rank) {
  if (rank === 1) return 'rgba(245, 158, 11, 0.12)';
  if (rank === 2) return 'rgba(148, 163, 184, 0.10)';
  if (rank === 3) return 'rgba(205, 124, 58, 0.10)';
  return 'rgba(255, 255, 255, 0.04)';
}

function LeaderRow({ item, isCurrentUser }) {
  const medal = getMedalColor(item.rank);
  const badge = getCurrentBadge(item.streak);
  const initial = (item.username || 'A')[0].toUpperCase();

  return (
    <View style={[styles.row, { backgroundColor: getRankBg(item.rank) }, isCurrentUser && styles.rowSelf]}>
      {/* Rank */}
      <View style={styles.rankContainer}>
        {medal ? (
          <Ionicons name="medal" size={22} color={medal} />
        ) : (
          <Text style={styles.rankNumber}>{item.rank}</Text>
        )}
      </View>

      {/* Avatar */}
      <View style={[styles.avatar, isCurrentUser && styles.avatarSelf]}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.username, isCurrentUser && styles.usernameSelf]} numberOfLines={1}>
            {item.username}
          </Text>
          {isCurrentUser && (
            <View style={styles.youBadge}>
              <Text style={styles.youText}>SEN</Text>
            </View>
          )}
        </View>
        <Text style={styles.badgeName}>{badge.name}</Text>
      </View>

      {/* Streak */}
      <View style={styles.streakContainer}>
        <Ionicons name="flame" size={16} color={medal || PRIMARY} />
        <Text style={[styles.streakNumber, { color: medal || PRIMARY }]}>{item.streak}</Text>
        <Text style={styles.streakLabel}>gün</Text>
      </View>
    </View>
  );
}

export default function LeaderboardScreen({ navigation }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myRank, setMyRank] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      // 1. Top 50 streak al (daha sonra kullanıcı adı için merge)
      const streaksSnap = await getDocs(
        query(collection(db, 'streaks'), orderBy('currentStreak', 'desc'), limit(50))
      );

      const streakDocs = streaksSnap.docs
        .map((d) => ({ uid: d.id, streak: d.data().currentStreak || 0 }))
        .filter((s) => s.streak > 0);

      if (streakDocs.length === 0) {
        setEntries([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // 2. Firestore `in` max 30 — ilk 30'u al
      const uids = streakDocs.slice(0, 30).map((s) => s.uid);
      const usersSnap = await getDocs(
        query(collection(db, 'users'), where(documentId(), 'in', uids))
      );
      const userMap = {};
      usersSnap.docs.forEach((d) => {
        userMap[d.id] = d.data().username || 'Anonim';
      });

      // 3. Merge + rank
      const ranked = streakDocs.slice(0, 30).map((s, i) => ({
        rank: i + 1,
        uid: s.uid,
        username: userMap[s.uid] || 'Anonim',
        streak: s.streak,
      }));

      setEntries(ranked);

      // Kendi sıralaması
      const selfIndex = ranked.findIndex((e) => e.uid === user?.uid);
      if (selfIndex >= 0) {
        setMyRank(selfIndex + 1);
      } else {
        // Top 30'da değilse streak'ini al
        const selfEntry = streakDocs.find((s) => s.uid === user?.uid);
        if (selfEntry) setMyRank(selfEntry.rank ?? null);
        else setMyRank(null);
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0a0e27', '#1a1f3a']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liderlik Tablosu</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Kendi sırası banner (top 30 dışındaysa) */}
      {myRank && myRank > 30 && (
        <View style={styles.myRankBanner}>
          <Ionicons name="person" size={16} color={PRIMARY} />
          <Text style={styles.myRankText}>Senin sıran: #{myRank}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <LeaderRow item={item} isCurrentUser={item.uid === user?.uid} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={PRIMARY} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="trophy-outline" size={48} color="#334155" />
              <Text style={styles.emptyText}>Henüz yeterli veri yok.</Text>
              <Text style={styles.emptySubtext}>Streakini artır, tabloya gir!</Text>
            </View>
          }
          ListHeaderComponent={
            <Text style={styles.subtitle}>En uzun streak'e sahip ilk 30 kullanıcı</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  rowSelf: {
    borderColor: 'rgba(13, 242, 166, 0.3)',
  },
  rankContainer: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6b7280',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  avatarSelf: {
    borderColor: PRIMARY,
    backgroundColor: 'rgba(13,242,166,0.12)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    flexShrink: 1,
  },
  usernameSelf: {
    color: PRIMARY,
  },
  youBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(13,242,166,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(13,242,166,0.3)',
  },
  youText: {
    fontSize: 9,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: 1,
  },
  badgeName: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  streakLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#475569',
  },
  myRankBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(13,242,166,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(13,242,166,0.2)',
  },
  myRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY,
  },
});
