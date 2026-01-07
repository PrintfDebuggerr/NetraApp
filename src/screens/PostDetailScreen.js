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
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

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

const stars = generateStars(30);

// Post Tag Component
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

// Comment Item Component
function CommentItem({ comment }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes || 0);

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  return (
    <View style={styles.commentItem}>
      <View style={styles.commentAvatar}>
        <Ionicons name="person" size={16} color="#9ca3af" />
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>{comment.author}</Text>
          <Text style={styles.commentTime}>{comment.time}</Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.commentAction} 
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={18} 
              color={liked ? PRIMARY : "#9ca3af"} 
            />
            <Text style={[styles.commentActionText, liked && { color: PRIMARY }]}>
              {likeCount}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.commentAction} activeOpacity={0.7}>
            <Ionicons name="chatbubble-outline" size={18} color="#9ca3af" />
            <Text style={styles.commentActionText}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function PostDetailScreen({ route, navigation }) {
  const { post } = route.params;
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(post?.upvotes || 15);

  // Mock comments data
  const [comments, setComments] = useState([
    {
      id: '1',
      author: 'Sarah_Design',
      text: 'Totally agree! My static posts are barely getting seen. I\'ve started doing carousel posts mixed with short clips, seems to help a bit.',
      time: '2h ago',
      likes: 12,
    },
    {
      id: '2',
      author: 'DevMike',
      text: 'It\'s just the trend right now. TikTok influence is everywhere. I wouldn\'t worry too much, quality content usually wins in the long run.',
      time: '4h ago',
      likes: 5,
    },
    {
      id: '3',
      author: 'Elena_Rx',
      text: 'Have you tried optimizing your alt text and hashtags? Sometimes that makes a difference even for static images.',
      time: '5h ago',
      likes: 2,
    },
    {
      id: '4',
      author: 'AlexCode',
      text: 'Short form video is king right now 👑. Adapt or die I guess?',
      time: '6h ago',
      likes: 8,
    },
  ]);

  const handleUpvote = () => {
    if (upvoted) {
      setUpvoteCount(upvoteCount - 1);
    } else {
      setUpvoteCount(upvoteCount + 1);
    }
    setUpvoted(!upvoted);
  };

  const handleSendComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: Date.now().toString(),
        author: user?.email?.split('@')[0] || 'User',
        text: commentText.trim(),
        time: 'Just now',
        likes: 0,
      };
      setComments([newComment, ...comments]);
      setCommentText('');
    }
  };

  const authorName = post?.authorName || post?.author || 'Anonymous';
  const streakDays = post?.streakDays || 0;
  const postType = post?.type || 'Question';
  const postContent = post?.content || post?.text || 'No content available';

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={styles.headerRight}>
            <Text style={styles.upvoteCountHeader}>{upvoteCount}</Text>
            <TouchableOpacity 
              style={[styles.upvoteButton, upvoted && styles.upvoteButtonActive]}
              onPress={handleUpvote}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="arrow-up" 
                size={20} 
                color={upvoted ? '#0B1121' : '#fff'} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
            <Text style={styles.commentsTitle}>Comments</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <View style={styles.commentsList}>
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </View>

          {/* Bottom spacing for input */}
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
            style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendComment}
            disabled={!commentText.trim()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-up" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  upvoteCountHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
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
  upvoteButtonActive: {
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
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
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  authorStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  streakDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9ca3af',
  },
  streakText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  postContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  postTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 16,
  },
  postTagText: {
    fontSize: 14,
    fontWeight: '700',
  },
  postText: {
    fontSize: 16,
    lineHeight: 28,
    color: '#fff',
  },
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
  commentsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  commentsList: {
    paddingTop: 8,
  },
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
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  commentAuthor: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  commentTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  commentText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#e5e7eb',
    marginTop: 6,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 12,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
  },
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
  inputWrapper: {
    flex: 1,
  },
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
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
