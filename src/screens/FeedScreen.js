import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, increment, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useStreak } from '../contexts/StreakContext';
import CreatePostModal from '../components/CreatePostModal';

const PRIMARY = '#0df2a6';

// Post tag styles — Turkish keys + legacy English fallbacks
const TAG_STYLES = {
  'Başarı':  { bg: 'rgba(34, 197, 94, 0.1)',   border: 'rgba(34, 197, 94, 0.2)',   text: '#4ade80' },
  'İpucu':   { bg: 'rgba(59, 130, 246, 0.1)',  border: 'rgba(59, 130, 246, 0.2)',  text: '#60a5fa' },
  'Günlük':  { bg: 'rgba(167, 139, 250, 0.1)', border: 'rgba(167, 139, 250, 0.2)', text: '#a78bfa' },
  'Soru':    { bg: 'rgba(251, 191, 36, 0.1)',  border: 'rgba(251, 191, 36, 0.2)',  text: '#fbbf24' },
  // Legacy support for old posts
  'Victory': { bg: 'rgba(34, 197, 94, 0.1)',   border: 'rgba(34, 197, 94, 0.2)',   text: '#4ade80' },
  'Vent':    { bg: 'rgba(239, 68, 68, 0.1)',   border: 'rgba(239, 68, 68, 0.2)',   text: '#f87171' },
  'Tips':    { bg: 'rgba(59, 130, 246, 0.1)',  border: 'rgba(59, 130, 246, 0.2)',  text: '#60a5fa' },
  'Relapse': { bg: 'rgba(100, 116, 139, 0.1)', border: 'rgba(100, 116, 139, 0.2)', text: '#94a3b8' },
};

function PostTag({ type }) {
  const style = TAG_STYLES[type] || TAG_STYLES['İpucu'];
  return (
    <View style={[styles.postTag, { backgroundColor: style.bg, borderColor: style.border }]}>
      <Text style={[styles.postTagText, { color: style.text }]}>{type}</Text>
    </View>
  );
}

// Streak level: early → gray, mid → blue, advanced → purple, elite → gold
function getStreakLevel(days) {
  if (days >= 90) return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.25)' };
  if (days >= 30) return { color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)', border: 'rgba(167, 139, 250, 0.25)' };
  if (days >= 7)  return { color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.1)',  border: 'rgba(59, 130, 246, 0.25)' };
  return           { color: '#94a3b8', bg: 'rgba(100, 116, 139, 0.1)', border: 'rgba(100, 116, 139, 0.2)' };
}

function StreakBadge({ days }) {
  const level = getStreakLevel(days);
  return (
    <View style={[styles.streakBadge, { backgroundColor: level.bg, borderColor: level.border }]}>
      <Text style={[styles.streakBadgeText, { color: level.color }]}>{days}. Gün</Text>
    </View>
  );
}

function CommunityPostCard({ post, onPress, onUpvote, isHighlighted, currentUserId }) {
  const timeAgo = post.createdAt ? getTimeAgo(post.createdAt.toDate()) : 'Şimdi';
  const postType = post.type || 'İpucu';
  const streakDays = post.streakDays || 0;
  const isUpvoted = currentUserId ? (post.likedBy || []).includes(currentUserId) : false;

  return (
    <TouchableOpacity
      style={[styles.postCard, isHighlighted && styles.postCardHighlighted]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* User Header */}
      <View style={styles.postHeader}>
        <View style={styles.postAvatar}>
          <Ionicons name="person" size={20} color="#fff" />
        </View>
        <View style={styles.postUserInfo}>
          <View style={styles.postUserRow}>
            <Text style={styles.postUserName}>{post.userName || 'Anonim'}</Text>
            <StreakBadge days={streakDays} />
          </View>
          <Text style={styles.postTime}>{timeAgo}</Text>
        </View>
        <PostTag type={postType} />
      </View>

      {/* Post Content */}
      <Text style={styles.postContent}>{post.content}</Text>

      {/* Footer */}
      <View style={styles.postFooter}>
        <View style={styles.quittrBrand}>
          <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.3)" />
          <Text style={styles.quittrText}>QUITTR</Text>
        </View>
        <View style={styles.postActions}>
          <View style={styles.commentAction}>
            <Ionicons name="chatbubble-outline" size={16} color="#94a3b8" />
            <Text style={styles.commentCount}>{post.commentCount || 0}</Text>
          </View>
          <TouchableOpacity
            style={[styles.upvoteButton, isUpvoted && styles.upvoteButtonActive]}
            onPress={() => onUpvote(post)}
            activeOpacity={0.8}
          >
            <Text style={[styles.upvoteCount, isUpvoted && styles.upvoteCountActive]}>
              {post.likes || 0}
            </Text>
            <View style={[styles.upvoteIconBg, isUpvoted && styles.upvoteIconBgActive]}>
              <Ionicons name="arrow-up" size={14} color={isUpvoted ? '#0F172A' : '#fff'} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Şimdi';
  if (diffMins < 60) return `${diffMins} dk önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  return `${diffDays} gün önce`;
}

export default function FeedScreen({ navigation }) {
  const { user } = useAuth();
  const { streakData } = useStreak();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Forum');

  useEffect(() => {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPosts(postsData);
      setLoading(false);
      setRefreshing(false);
    }, () => {
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (content, type) => {
    if (!user) return;
    await addDoc(collection(db, 'posts'), {
      userId: user.uid,
      userName: user.email?.split('@')[0] || 'Anonim',
      content,
      createdAt: serverTimestamp(),
      likes: 0,
      commentCount: 0,
      type: type || 'İpucu',
      streakDays: streakData?.currentStreak || 0,
    });
  };

  const handleUpvote = async (post) => {
    if (!user) return;
    const postRef = doc(db, 'posts', post.id);
    const isLiked = (post.likedBy || []).includes(user.uid);
    await updateDoc(postRef, {
      likes: increment(isLiked ? -1 : 1),
      likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };

  const handlePostPress = (post) => {
    navigation.navigate('PostDetail', { post });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.starsOverlay} />
      <LinearGradient
        colors={['transparent', 'rgba(15, 23, 42, 0.9)']}
        style={styles.gradientOverlay}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Topluluk</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('Leaderboard')}
            >
              <Ionicons name="trophy-outline" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsPill}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'Forum' && styles.tabButtonActive]}
              onPress={() => setActiveTab('Forum')}
            >
              <Text style={[styles.tabText, activeTab === 'Forum' && styles.tabTextActive]}>Forum</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'Gruplar' && styles.tabButtonActive]}
              onPress={() => setActiveTab('Gruplar')}
            >
              <Text style={[styles.tabText, activeTab === 'Gruplar' && styles.tabTextActive]}>Gruplar</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Yeni</Text>
            <Ionicons name="chevron-down" size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <CommunityPostCard
            post={item}
            onPress={() => handlePostPress(item)}
            onUpvote={handleUpvote}
            isHighlighted={index === 0}
            currentUserId={user?.uid}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => setRefreshing(true)}
            tintColor={PRIMARY}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color="#334155" />
            <Text style={styles.emptyText}>Yalnız değilsin.</Text>
            <Text style={styles.emptySubtext}>Herkes bu yoldan geçiyor.</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={32} color="#0F172A" />
      </TouchableOpacity>

      <CreatePostModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  starsOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.3,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabsPill: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: '#1E293B',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tabButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tabButtonActive: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1E293B',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#cbd5e1',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 140,
  },
  postCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  postCardHighlighted: {
    borderColor: 'rgba(13, 242, 166, 0.2)',
    shadowColor: '#0df2a6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postUserInfo: {
    flex: 1,
    marginLeft: 12,
  },
  postUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postUserName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  postTime: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  streakBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  streakBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  postTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  postTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  postContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#e2e8f0',
    marginBottom: 16,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  quittrBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.4,
  },
  quittrText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentCount: {
    fontSize: 12,
    color: '#94a3b8',
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 6,
    backgroundColor: '#334155',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  upvoteButtonActive: {
    backgroundColor: '#0df2a6',
    borderColor: '#0df2a6',
    shadowColor: '#0df2a6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 4,
  },
  upvoteCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  upvoteCountActive: {
    color: '#0F172A',
  },
  upvoteIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upvoteIconBgActive: {
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 6,
  },
  emptyText: {
    fontSize: 18,
    color: '#e2e8f0',
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 10,
  },
});
