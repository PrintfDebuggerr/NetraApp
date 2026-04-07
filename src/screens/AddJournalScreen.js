import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const JOURNAL_STORAGE_KEY = '@quittr_journal_entries';

const generateStars = (count) => {
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.35 + 0.08,
    });
  }
  return arr;
};
const stars = generateStars(50);

export default function AddJournalScreen({ navigation, route }) {
  const editEntry = route?.params?.entry ?? null;
  const isEditing = editEntry !== null;

  const [title, setTitle] = useState(editEntry?.title ?? '');
  const [content, setContent] = useState(editEntry?.content ?? '');
  const [saving, setSaving] = useState(false);
  const contentRef = useRef(null);

  const isEmpty = title.trim().length === 0 && content.trim().length === 0;

  const handleSave = async () => {
    if (isEmpty || saving) return;
    setSaving(true);
    try {
      const existing = await AsyncStorage.getItem(JOURNAL_STORAGE_KEY);
      let entries = existing ? JSON.parse(existing) : [];

      if (isEditing) {
        entries = entries.map((e) =>
          e.id === editEntry.id
            ? { ...e, title: title.trim(), content: content.trim() }
            : e
        );
      } else {
        const newEntry = {
          id: Date.now().toString(),
          title: title.trim(),
          content: content.trim(),
          createdAt: new Date().toISOString(),
        };
        entries.unshift(newEntry);
      }

      await AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
      navigation.goBack();
    } catch {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0B1121', '#162035', '#1a2642']} style={styles.gradient}>
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

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* ── Top Bar ── */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.topBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
              <Text style={styles.topBtnText}>Vazgeç</Text>
            </TouchableOpacity>

            <Text style={styles.screenTitle}>
              {isEditing ? 'Günlüğü Düzenle' : 'Günlük Ekle'}
            </Text>

            <TouchableOpacity
              style={[styles.topBtn, styles.topBtnSave, isEmpty && styles.topBtnSaveDim]}
              onPress={handleSave}
              activeOpacity={isEmpty ? 1 : 0.75}
              disabled={isEmpty || saving}
            >
              <Text style={[styles.topBtnText, styles.topBtnSaveText, isEmpty && styles.topBtnSaveTextDim]}>
                Kaydet
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Content ── */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Glass Note Card ── */}
            <View style={styles.noteCard}>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Başlık"
                placeholderTextColor="rgba(255,255,255,0.25)"
                returnKeyType="next"
                onSubmitEditing={() => contentRef.current?.focus()}
                maxLength={100}
                selectionColor="#0df2a6"
              />

              <View style={styles.divider} />

              <TextInput
                ref={contentRef}
                style={styles.contentInput}
                value={content}
                onChangeText={setContent}
                placeholder="Düşüncelerini yaz..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                multiline
                textAlignVertical="top"
                scrollEnabled={false}
                selectionColor="#0df2a6"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  gradient: { flex: 1 },
  star: { position: 'absolute', backgroundColor: '#fff', borderRadius: 10 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  topBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minWidth: 80,
    alignItems: 'center',
  },
  topBtnText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  topBtnSave: {
    backgroundColor: 'rgba(13,242,166,0.15)',
    borderColor: 'rgba(13,242,166,0.35)',
  },
  topBtnSaveDim: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  topBtnSaveText: {
    color: '#0df2a6',
    fontWeight: '600',
  },
  topBtnSaveTextDim: {
    color: 'rgba(255,255,255,0.22)',
  },
  screenTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },

  noteCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    shadowColor: '#0df2a6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 6,
    minHeight: 360,
  },

  titleInput: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 0,
    letterSpacing: 0.2,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 16,
  },

  contentInput: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
    paddingVertical: 0,
    paddingHorizontal: 0,
    minHeight: 260,
  },
});
