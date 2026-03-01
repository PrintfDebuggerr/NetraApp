import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  query,
  where,
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

const PRIMARY = '#0df2a6';

// Yıldız efekti
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
const stars = generateStars(30);

function PostTag({ type }) {
  const tagStyles = {
    Victory: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#4ade80' },
    Vent: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#f87171' },
    Tips: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#60a5fa' },
    Question: { bg: 'rgba(13, 242, 166, 0.1)', border: 'rgba(13, 242, 166, 0.3)', text: PRIMARY },
    Relapse: { bg: 'rgba(100, 116, 139, 0.1)', border: 'rgba(100, 116, 139, 0.3)', text: '#94a3b8' },
  };
  const style = tagStyles[type] || tagStyles.Question;
  return (
    <View style={[styles.postTag, { backgroundColor: style.bg, borderColor: style.border }]}>
      <Text style={[styles.postTagText, { color: style.text }]}>{type}</Text>
    </View>
  );
}

function getTimeAgo(date) {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function CommentItem({ comment }) {
  return (
    <View style={styles.commentItem}>
      <View style={styles.commentAvatar}>
        <Ionicons name="person" size={16} color="#9ca3af" />
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>{comment.userName || 'Anonymous'}</Text>
          <Text style={styles.commentTime}>{getTimeAgo(comment.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{comment.content}</Text>
      </View>
    </View>
  );
}

export default function PostDetailScreen({ route, navigation }) {
  const { post } = route.params;
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);

  // Post'u real-time izle (likes güncellemeleri için)
  const [livePost, setLivePost] = useState(post);

  useEffect(() => {
    const postRef = doc(db, 'posts', post.id);
    const unsubPost = onSnapshot(postRef, (snap) => {
      if (snap.exists()) {
        setLivePost({ id: snap.id, ...snap.data() });
      }
    });
    return () => unsubPost();
  }, [post.id]);

  // Yorumları real-time dinle
  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', post.id),
      orderBy('createdAt', 'desc')
    );
    const unsubComments = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setComments(data);
      setLoadingComments(false);
    }, () => setLoadingComments(false));
    return () => unsubComments();
  }, [post.id]);

  const isUpvoted = user ? (livePost.likedBy || []).includes(user.uid) : false;

  const handleUpvote = async () => {
    if (!user) return;
    const postRef = doc(db, 'posts', post.id);
    await updateDoc(postRef, {
      likes: increment(isUpvoted ? -1 : 1),
      likedBy: isUpvoted ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !user) return;
    setSending(true);
    try {
      const newComment = {
        postId: post.id,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        content: commentText.trim(),
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'comments'), newComment);

      // Yorum sayısını artır
      await updateDoc(doc(db, 'posts', post.id), {
        commentCount: increment(1),
      });

      setCommentText('');
    } catch (e) {
      console.error('Comment error:', e);
    }
    setSending(false);
  };

  const authorName = livePost.userName || livePost.authorName || 'Anonymous';
  const streakDays = livePost.streakDays || 0;
  const postType = livePost.type || 'Question';
  const postContent = livePost.content || 'No content available';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#0B1121', '#162035', '#1a2642']} style={styles.gradient}>
        {/* Yıldız efekti */}
        {stars.map((star) => (
          <View
            key={star.id}
            style={[
              styles.star,
              { left: `${star.left}%`, top: `${star.top}%`, width: star.size, height: star.size, opacity: star.opacity },
            ]}
          />
        ))}

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={styles.headerRight}>
            <Text style={styles.upvoteCountHeader}>{livePost.likes || 0}</Text>
            <TouchableOpacity
              style={[styles.upvoteButton, isUpvoted && styles.upvoteButtonActive]}
              onPress={handleUpvote}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-up" size={20} color={isUpvoted ? '#0B1121' : '#fff'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Post Author Info */}
          <View style={styles.authorSection}>
            <View style={styles.authorAvatar}>
              <Ionicons name="person" size={20} color="#9ca3af" />
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{authorName}</Text>
              <View style={styles.authorStreak}>
                <View style={styles.streakDot} />
                <Text style={styles.streakText}>{streakDays} Day Streak</Text>
              </View>
            </View>
          </View>

          {/* Post Content */}
          <View style={styles.postContent}>
            <PostTag type={postType} />
            <Text style={styles.postText}>{postContent}</Text>
          </View>

          {/* Comments Header */}
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>
              Comments {comments.length > 0 ? `(${comments.length})` : ''}
            </Text>
          </View>

          {/* Comments List */}
          <View style={styles.commentsList}>
            {loadingComments ? (
              <ActivityIndicator color={PRIMARY} style={{ marginTop: 24 }} />
            ) : comments.length === 0 ? (
              <View style={styles.emptyComments}>
                <Ionicons name="chatbubble-outline" size={32} color="#475569" />
                <Text style={styles.emptyCommentsText}>İlk yorumu sen yap!</Text>
              </View>
            ) : (
              comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            )}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Comment Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Say something..."
              placeholderTextColor="#9ca3af"
              value={commentText}
              onChangeText={setCommentText}
              multiline={false}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, (!commentText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSendComment}
            disabled={!commentText.trim() || sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="arrow-up" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  star: { position: 'absolute', backgroundColor: '#fff', borderRadius: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(30, 39, 56, 0.9)',
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  upvoteCountHeader: { fontSize: 18, fontWeight: '700', color: '#fff' },
  upvoteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  upvoteButtonActive: { backgroundColor: '#fff' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  authorStreak: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  streakDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#9ca3af' },
  streakText: { fontSize: 14, color: '#9ca3af', fontWeight: '500' },
  postContent: { paddingHorizontal: 20, paddingBottom: 24 },
  postTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 16,
  },
  postTagText: { fontSize: 14, fontWeight: '700' },
  postText: { fontSize: 16, lineHeight: 28, color: '#fff' },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(22, 32, 53, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  commentsTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  commentsList: { paddingTop: 8 },
  commentItem: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentContent: { flex: 1 },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  commentAuthor: { fontSize: 15, fontWeight: '700', color: '#fff' },
  commentTime: { fontSize: 12, color: '#9ca3af' },
  commentText: { fontSize: 15, lineHeight: 24, color: '#e5e7eb', marginTop: 6 },
  emptyComments: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyCommentsText: { fontSize: 14, color: '#64748b' },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
    backgroundColor: '#1e2738',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  inputWrapper: { flex: 1 },
  input: {
    backgroundColor: '#2a3548',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  sendButtonDisabled: { opacity: 0.5 },
});
