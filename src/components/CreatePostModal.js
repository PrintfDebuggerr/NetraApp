import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#0df2a6';
const BG_DEEP  = '#050b1a';
const CARD_BG  = '#0e1a30';
const SURFACE  = '#162035';

// Deterministic star positions — same every render, no Math.random()
const STARS = Array.from({ length: 70 }, (_, i) => {
  const a = ((i * 7919 + 1234) % 10000) / 10000;
  const b = ((i * 6271 + 5678) % 10000) / 10000;
  const c = ((i * 3541 + 9012) % 10000) / 10000;
  return {
    id: i,
    top:     `${(a * 98).toFixed(2)}%`,
    left:    `${(b * 98).toFixed(2)}%`,
    size:    c * 2.2 + 0.6,
    opacity: a * 0.45 + 0.1,
  };
});

function StarField() {
  return (
    <>
      {STARS.map((s) => (
        <View
          key={s.id}
          style={[
            styles.star,
            {
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              borderRadius: s.size / 2,
              opacity: s.opacity,
            },
          ]}
          pointerEvents="none"
        />
      ))}
    </>
  );
}

export default function CreatePostModal({ visible, onClose, onSubmit }) {
  const [title,   setTitle]   = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = content.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    if (content.length > 500) {
      Alert.alert('Hata', 'İçerik en fazla 500 karakter olabilir');
      return;
    }

    // Merge title into content so first-line extraction in FeedScreen works
    const fullContent = title.trim()
      ? `${title.trim()}\n${content.trim()}`
      : content.trim();

    setLoading(true);
    try {
      await onSubmit(fullContent, 'Günlük');
      handleClose();
    } catch {
      Alert.alert('Hata', 'Gönderi paylaşılamadı. Lütfen tekrar dene.');
    }
    setLoading(false);
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor={BG_DEEP} />
      <View style={styles.root}>
        {/* ── Starfield ── */}
        <StarField />

        {/* ── Subtle radial glow at center ── */}
        <View style={styles.glowCenter} pointerEvents="none" />

        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Header ── */}
            <View style={styles.header}>
              <View style={styles.headerSpacer} />
              <Text style={styles.headerTitle}>Yeni Gönderi</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.8}>
                <Ionicons name="close" size={20} color="rgba(255,255,255,0.9)" />
              </TouchableOpacity>
            </View>

            {/* ── Add image (cosmetic) ── */}
            <TouchableOpacity style={styles.imageArea} activeOpacity={0.7}>
              <View style={styles.imageIconWrap}>
                <Ionicons name="image-outline" size={22} color="#64748b" />
              </View>
              <Text style={styles.imageAreaText}>Görsel ekle</Text>
              <Ionicons name="chevron-forward" size={16} color="#334155" style={styles.imageChevron} />
            </TouchableOpacity>

            {/* ── Input card ── */}
            <View style={styles.inputCard}>
              {/* Başlık */}
              <TextInput
                style={styles.titleInput}
                placeholder="Başlık"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={title}
                onChangeText={setTitle}
                maxLength={120}
                returnKeyType="next"
                editable={!loading}
              />

              {/* İnce ayraç */}
              <View style={styles.inputSeparator} />

              {/* İçerik */}
              <TextInput
                style={styles.contentInput}
                placeholder="Aklından neler geçiyor?"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={5}
                maxLength={500}
                textAlignVertical="top"
                editable={!loading}
              />

              {/* Char count */}
              <Text style={styles.charCount}>{content.length}/500</Text>
            </View>

            {/* ── Helper text ── */}
            <Text style={styles.helperText}>
              İyi gönderilerle toplulukta öne çıkabilirsin.
            </Text>

            {/* ── Paylaş button ── */}
            <TouchableOpacity
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit || loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={canSubmit ? '#0F172A' : '#64748b'} size="small" />
              ) : (
                <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>
                  Paylaş
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG_DEEP,
  },

  // Stars
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
  },

  // Subtle glow bloom at vertical center
  glowCenter: {
    position: 'absolute',
    top: '25%',
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(13,242,166,0.025)',
  },

  kav: {
    flex: 1,
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Image area
  imageArea: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  imageIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  imageAreaText: {
    flex: 1,
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  imageChevron: {
    marginLeft: 4,
  },

  // Input card
  inputCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 18,
    marginBottom: 16,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f1f5f9',
    paddingVertical: 0,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  inputSeparator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: 12,
  },
  contentInput: {
    fontSize: 15,
    color: '#cbd5e1',
    lineHeight: 24,
    minHeight: 100,
    paddingVertical: 0,
  },
  charCount: {
    fontSize: 11,
    color: '#334155',
    textAlign: 'right',
    marginTop: 10,
  },

  // Helper text
  helperText: {
    fontSize: 13,
    color: PRIMARY,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.85,
    lineHeight: 20,
  },

  // Submit button
  submitBtn: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(13,242,166,0.2)',
  },
  submitBtnDisabled: {
    opacity: 0.45,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  submitTextDisabled: {
    color: '#64748b',
  },

  bottomSpacer: {
    height: 20,
  },
});
