import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { useStreak } from '../contexts/StreakContext';

const motivationMessages = [
  "O sözü kendine verdiğini unutma. Birkaç saniyelik haz için bozma.",
  "Her düşüş bir ders, her kalkış bir zafer. Sen bunu yapabilirsin!",
  "Beynin seni kandırmaya çalışıyor. Gerçek mutluluk bu değil.",
  "Şu ana kadar geldin, şimdi pes etme!",
  "Kendine olan saygını koru. Sen bundan daha güçlüsün.",
  "Bu his geçici. 15 dakika bekle, geçecek.",
  "Gelecekteki sen, şu anki kararından gurur duyacak.",
  "Her 'hayır' dediğinde, beynin biraz daha iyileşiyor.",
  "Bağımlılık yalan söyler. Sen özgür olmayı hak ediyorsun.",
  "Nefes al. Bu anı atlatabilirsin.",
];

export default function PanicModal({ visible, onClose }) {
  const { resetStreak } = useStreak();

  const randomMessage = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];

  const handleRelapse = () => {
    Alert.alert(
      'Emin misin?',
      'Streak\'in sıfırlanacak. Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Sıfırla',
          style: 'destructive',
          onPress: () => {
            resetStreak();
            onClose();
            Alert.alert(
              'Yeniden Başla',
              'Düşmek utanç değil, kalkmamak utanç. Yeni bir başlangıç yap!',
            );
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>⚠️ Panik Butonu</Text>
          
          <Text style={styles.message}>{randomMessage}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Vazgeç, İyiyim</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.relapseButton}
              onPress={handleRelapse}
            >
              <Text style={styles.relapseButtonText}>Nüks Ettim</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 350,
    borderWidth: 1,
    borderColor: 'rgba(233,69,96,0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  relapseButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  relapseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
