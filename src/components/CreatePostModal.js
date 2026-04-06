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
} from 'react-native';

const POST_TYPES = [
  { key: 'İpucu',  label: '💡 İpucu',  color: '#60a5fa', bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.3)' },
  { key: 'Günlük', label: '📔 Günlük', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)' },
  { key: 'Soru',   label: '❓ Soru',   color: '#fbbf24', bg: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.3)' },
  { key: 'Başarı', label: '🏆 Başarı', color: '#4ade80', bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)' },
];

export default function CreatePostModal({ visible, onClose, onSubmit }) {
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState('İpucu');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Hata', 'Lütfen bir şeyler yaz');
      return;
    }

    if (content.length > 500) {
      Alert.alert('Hata', 'Post en fazla 500 karakter olabilir');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(content.trim(), selectedType);
      setContent('');
      setSelectedType('İpucu');
      onClose();
    } catch (error) {
      Alert.alert('Hata', 'Post gönderilemedi. Lütfen tekrar dene.');
    }
    setLoading(false);
  };

  const handleClose = () => {
    setContent('');
    setSelectedType('İpucu');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Yeni Post</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Post Tipi Seçici */}
          <View style={styles.typeRow}>
            {POST_TYPES.map((t) => {
              const isActive = selectedType === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[
                    styles.typeChip,
                    { backgroundColor: t.bg, borderColor: isActive ? t.color : t.border },
                    isActive && styles.typeChipActive,
                  ]}
                  onPress={() => setSelectedType(t.key)}
                  disabled={loading}
                >
                  <Text style={[styles.typeChipText, { color: isActive ? t.color : '#9ca3af' }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Ne düşünüyorsun?"
            placeholderTextColor="#9ca3af"
            value={content}
            onChangeText={(text) => setContent(text)}
            multiline={true}
            numberOfLines={5}
            maxLength={500}
            textAlignVertical="top"
            editable={!loading}
          />

          <View style={styles.footer}>
            <Text style={styles.charCount}>{content.length}/500</Text>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Paylaş</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#162035',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(13, 242, 166, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    fontSize: 20,
    color: '#9ca3af',
    padding: 5,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  typeChipActive: {
    borderWidth: 1.5,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1a2642',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    minHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(13, 242, 166, 0.2)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  charCount: {
    color: '#9ca3af',
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: '#0df2a6',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    shadowColor: '#0df2a6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
