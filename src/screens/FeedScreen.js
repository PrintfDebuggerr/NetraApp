import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import CreatePostModal from '../components/CreatePostModal';

const PRIMARY = '#0df2a6';

// Post Tag Component
function PostTag({ type }) {
  const tagStyles = {
    Victory: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.2)', text: '#4ade80' },
    Vent: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', text: '#f87171' },
    Tips: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa' },
    Relapse: { bg: 'rgba(100, 116, 139, 0.1)', border: 'rgba(100, 116, 139, 0.2)', text: '#94a3b8' },
  };
  
  const style = tagStyles[type] || tagStyles.Tips;
  
  return (
    <View style={[styles.postTag, { backgroundColor: style.bg, borderColor: style.border }]}>
      <Text style={[styles.postTagText, { color: style.text }]}>{type}</Text>
    </View>
  );
}

// Streak Badge Component
function StreakBadge({ days }) {
  let color = '#94a3b8';
  let bgColor = 'rgba(100, 116, 139, 0.1)';
  let borderColor = 'rgba(100, 116, 139, 0.2)';
  
  if (days >= 90) {
    color = '#c084fc';
    bgColor = 'rgba(192, 132, 252, 0.1)';
    borderColor = 'rgba(192, 132, 252, 0.2)';
  } else if (days >= 30) {
    color = '#0df2a6';
    bgColor = 'rgba(13, 242, 166, 0.1)';
    borderColor = 'rgba(13, 242, 166, 0.2)';
  } else if (days >= 7) {
    color = '#fb923c';
    bgColor = 'rgba(251, 146, 60, 0.1)';
    borderColor = 'rgba(251, 146, 60, 0.2)';
  }
  
  const label = days === 0 ? 'Day 0' : days >= 90 ? '90+ Days' : `${days} Days`;
  
  return (
    <View style={[styles.streakBadge, { backgroundColor: bgColor, borderColor }]}>
      <Text style={[styles.streakBadgeText, { color }]}>{label}</Text>
    </View>
  );
}

// Post Card Component
function CommunityPostCard({ post, onPress, isHighlighted }) {
  const timeAgo = post.createdAt ? getTimeAgo(post.createdAt.toDate()) : 'Just now';
  const postType = post.type || 'Tips';
  const streakDays = post.streakDays || 0;
  const isUpvoted = post.isUpvoted || false;
  
  return (
    <TouchableOpacity 
      style={[
        styles.postCard, 
        isHighlighted && styles.postCardHighlighted
      ]} 
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
            <Text style={styles.postUserName}>{post.userName || 'Anonymous'}</Text>
            <StreakBadge days={streakDays} />
          </View>
          <Text style={styles.postTime}>{timeAgo}</Text>
        </View>
        <PostTag type={postType} />
      </View>
      
      {/* Post Content */}
      <Text style={styles.postContent}>{post.content}</Text>
      
      {/* Interaction Footer */}
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

// Helper function for time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function FeedScreen({ navigation }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Forum');

  useEffect(() => {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Error fetching posts:', error);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (content) => {
    if (!user) return;

    await addDoc(collection(db, 'posts'), {
      userId: user.uid,
      userName: user.email?.split('@')[0] || 'Anonymous',
      content,
      createdAt: serverTimestamp(),
      likes: 0,
      commentCount: 0,
      type: 'Tips',
      streakDays: 0,
    });
  };

  const handlePostPress = (post) => {
    navigation.navigate('PostDetail', { post });
  };

  const onRefresh = () => {
    setRefreshing(true);
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
      {/* Starry Background */}
      <View style={styles.starsOverlay} />
      <LinearGradient
        colors={['transparent', 'rgba(15, 23, 42, 0.9)']}
        style={styles.gradientOverlay}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Community</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Ionicons name="notifications-outline" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Ionicons name="chatbubble-outline" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Ionicons name="book-outline" size={20} color="rgba(255,255,255,0.8)" />
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
              style={[styles.tabButton, activeTab === 'Teams' && styles.tabButtonActive]}
              onPress={() => setActiveTab('Teams')}
            >
              <Text style={[styles.tabText, activeTab === 'Teams' && styles.tabTextActive]}>Teams</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>New</Text>
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
            isHighlighted={index === 0}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color="#475569" />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share!</Text>
          </View>
        }
      />

      {/* Floating Action Button */}
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    marginBottom: 20,
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
    color: '#94a3b8',
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
    paddingHorizontal: 12,
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
    opacity: 0.5,
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
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
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
