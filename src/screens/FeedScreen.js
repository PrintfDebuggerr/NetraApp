import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useStreak } from '../contexts/StreakContext';
import CreatePostModal from '../components/CreatePostModal';

const PRIMARY = '#0df2a6';
const BG = '#0F172A';
const CARD_BG = '#1E293B';
const SURFACE = '#162035';

// ─── Tag styles ─────────────────────────────────────────────────────────────
const TAG_STYLES = {
  'Başarı':  { bg: 'rgba(34, 197, 94, 0.1)',   border: 'rgba(34, 197, 94, 0.2)',   text: '#4ade80' },
  'İpucu':   { bg: 'rgba(59, 130, 246, 0.1)',  border: 'rgba(59, 130, 246, 0.2)',  text: '#60a5fa' },
  'Günlük':  { bg: 'rgba(167, 139, 250, 0.1)', border: 'rgba(167, 139, 250, 0.2)', text: '#a78bfa' },
  'Soru':    { bg: 'rgba(251, 191, 36, 0.1)',  border: 'rgba(251, 191, 36, 0.2)',  text: '#fbbf24' },
  // Legacy English keys
  'Victory': { bg: 'rgba(34, 197, 94, 0.1)',   border: 'rgba(34, 197, 94, 0.2)',   text: '#4ade80' },
  'Vent':    { bg: 'rgba(239, 68, 68, 0.1)',   border: 'rgba(239, 68, 68, 0.2)',   text: '#f87171' },
  'Tips':    { bg: 'rgba(59, 130, 246, 0.1)',  border: 'rgba(59, 130, 246, 0.2)',  text: '#60a5fa' },
  'Relapse': { bg: 'rgba(100, 116, 139, 0.1)', border: 'rgba(100, 116, 139, 0.2)', text: '#94a3b8' },
};

function getStreakLevel(days) {
  if (days >= 90) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' };
  if (days >= 30) return { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)' };
  if (days >= 7)  return { color: '#60a5fa', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)' };
  return           { color: '#94a3b8', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)' };
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

// Derive a bold "title" from the first line of content
function deriveTitle(content) {
  const first = content.split('\n')[0].trim();
  return first.length > 90 ? first.substring(0, 90) + '…' : first;
}

// Derive preview from remaining content (after first line)
function derivePreview(content) {
  const lines = content.split('\n');
  if (lines.length > 1) {
    return lines.slice(1).join(' ').trim();
  }
  return null;
}

// ─── PostCard ────────────────────────────────────────────────────────────────
function PostCard({ post, onPress, onUpvote, isHighlighted, currentUserId }) {
  const timeAgo = post.createdAt ? getTimeAgo(post.createdAt.toDate()) : 'Şimdi';
  const postType = post.type || 'İpucu';
  const streakDays = post.streakDays || 0;
  const isUpvoted = currentUserId ? (post.likedBy || []).includes(currentUserId) : false;
  const tagStyle = TAG_STYLES[postType] || TAG_STYLES['İpucu'];
  const level = getStreakLevel(streakDays);

  const title = deriveTitle(post.content || '');
  const preview = derivePreview(post.content || '');

  return (
    <TouchableOpacity
      style={[styles.card, isHighlighted && styles.cardHighlighted]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Top row: avatar + user info + upvote */}
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={18} color="rgba(255,255,255,0.7)" />
        </View>

        <View style={styles.userInfo}>
          <View style={styles.userRow}>
            <Text style={styles.userName}>{post.userName || 'Anonim'}</Text>
            {/* Streak badge */}
            <View style={[styles.streakBadge, { backgroundColor: level.bg, borderColor: level.border }]}>
              <Text style={[styles.streakBadgeText, { color: level.color }]}>{streakDays}. Gün</Text>
            </View>
          </View>
          <Text style={styles.timeText}>{timeAgo}</Text>
        </View>

        {/* Upvote button */}
        <TouchableOpacity
          style={[styles.upvoteBtn, isUpvoted && styles.upvoteBtnActive]}
          onPress={() => onUpvote(post)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-up"
            size={16}
            color={isUpvoted ? '#0F172A' : '#fff'}
          />
          <Text style={[styles.upvoteCount, isUpvoted && styles.upvoteCountActive]}>
            {post.likes || 0}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tag */}
      <View style={[styles.tag, { backgroundColor: tagStyle.bg, borderColor: tagStyle.border }]}>
        <Text style={[styles.tagText, { color: tagStyle.text }]}>{postType}</Text>
      </View>

      {/* Title */}
      <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>

      {/* Preview (only if there's more content after the first line) */}
      {!!preview && (
        <Text style={styles.cardPreview} numberOfLines={3}>{preview}</Text>
      )}

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.commentRow}>
          <Ionicons name="chatbubble-outline" size={14} color="#64748b" />
          <Text style={styles.commentCount}>{post.commentCount || 0} yorum</Text>
        </View>
        <View style={styles.brandRow}>
          <Ionicons name="shield-checkmark" size={12} color="rgba(255,255,255,0.2)" />
          <Text style={styles.brandText}>NETRA</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── SearchBar ───────────────────────────────────────────────────────────────
function SearchBar({ value, onChange }) {
  return (
    <View style={styles.searchContainer}>
      <Ionicons name="search-outline" size={18} color="#64748b" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Ara..."
        placeholderTextColor="#64748b"
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
      />
    </View>
  );
}

// ─── FeedScreen ──────────────────────────────────────────────────────────────
export default function FeedScreen({ navigation }) {
  const { user } = useAuth();
  const { streakData } = useStreak();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter posts based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredPosts(
      posts.filter(
        (p) =>
          (p.content || '').toLowerCase().includes(q) ||
          (p.userName || '').toLowerCase().includes(q)
      )
    );
  }, [searchQuery, posts]);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Topluluk</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Sub-header: Tab + Filter ── */}
      <View style={styles.subHeader}>
        {/* Single active tab */}
        <View style={styles.tabPill}>
          <View style={styles.tabActive}>
            <Ionicons name="chatbubbles-outline" size={14} color="#0F172A" style={{ marginRight: 6 }} />
            <Text style={styles.tabActiveText}>Forum</Text>
          </View>
        </View>

        {/* Filter */}
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterLabel}>Sırala:</Text>
          <Text style={styles.filterValue}>Yeni</Text>
          <Ionicons name="chevron-down" size={14} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchWrapper}>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </View>

      {/* ── Post List ── */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <PostCard
            post={item}
            onPress={() => navigation.navigate('PostDetail', { post: item })}
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
            <Ionicons name="chatbubbles-outline" size={52} color="#334155" />
            <Text style={styles.emptyTitle}>Yalnız değilsin.</Text>
            <Text style={styles.emptySubtitle}>Herkes bu yoldan geçiyor.</Text>
          </View>
        }
      />

      {/* ── FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color="#0F172A" />
      </TouchableOpacity>

      <CreatePostModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Sub-header (tab + filter)
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
  },
  tabPill: {
    flexDirection: 'row',
    backgroundColor: CARD_BG,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 4,
  },
  tabActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  tabActiveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: CARD_BG,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  filterValue: {
    fontSize: 13,
    color: '#cbd5e1',
    fontWeight: '600',
  },

  // Search bar
  searchWrapper: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(13,242,166,0.15)',
    paddingHorizontal: 14,
    height: 46,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 130,
  },

  // Card
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHighlighted: {
    borderColor: 'rgba(13,242,166,0.25)',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2d3f5c',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  streakBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  streakBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#2d3f5c',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  upvoteBtnActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 4,
  },
  upvoteCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  upvoteCountActive: {
    color: '#0F172A',
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f1f5f9',
    lineHeight: 22,
    marginBottom: 6,
  },
  cardPreview: {
    fontSize: 14,
    lineHeight: 21,
    color: '#94a3b8',
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  commentCount: {
    fontSize: 12,
    color: '#64748b',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.35,
  },
  brandText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e2e8f0',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
});
