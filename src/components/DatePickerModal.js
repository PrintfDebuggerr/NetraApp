import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// ── Star background (same pattern as HomeScreen) ──────────────────────────
const generateStars = (count) => {
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.1,
    });
  }
  return arr;
};
const STARS = generateStars(55);

const DAYS_HEADER = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const TR_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Returns grid of weeks; each week is an array of 7 Date|null entries
// Monday-first layout
function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  // Monday = 0, ..., Sunday = 6
  let startDow = (firstDay.getDay() + 6) % 7; // convert Sun=0 to Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// ── Calendar ─────────────────────────────────────────────────────────────────
function Calendar({ selectedDate, onSelectDate, maxDate }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewYear, setViewYear] = useState(
    (selectedDate || today).getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    (selectedDate || today).getMonth()
  );

  const grid = useMemo(
    () => buildCalendarGrid(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    // Don't go past the month that contains today
    const isCurrentMonth =
      viewYear === today.getFullYear() && viewMonth === today.getMonth();
    if (isCurrentMonth) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isFutureMonth =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  return (
    <View style={cal.root}>
      {/* Month navigation */}
      <View style={cal.navRow}>
        <TouchableOpacity onPress={goPrev} style={cal.navBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        <Text style={cal.monthLabel}>
          {TR_MONTHS[viewMonth]} {viewYear}
        </Text>

        <TouchableOpacity
          onPress={goNext}
          style={[cal.navBtn, isFutureMonth && cal.navBtnDisabled]}
          activeOpacity={isFutureMonth ? 1 : 0.7}
          disabled={isFutureMonth}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isFutureMonth ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.7)'}
          />
        </TouchableOpacity>
      </View>

      {/* Day-of-week headers */}
      <View style={cal.headerRow}>
        {DAYS_HEADER.map((d) => (
          <Text key={d} style={cal.dayHeader}>{d}</Text>
        ))}
      </View>

      {/* Weeks */}
      {grid.map((week, wi) => (
        <View key={wi} style={cal.weekRow}>
          {week.map((date, di) => {
            if (!date) {
              return <View key={di} style={cal.dayCell} />;
            }

            const dateNorm = new Date(date);
            dateNorm.setHours(0, 0, 0, 0);

            const isFuture = dateNorm > today;
            const isToday = isSameDay(dateNorm, today);
            const isSelected = selectedDate && isSameDay(dateNorm, selectedDate);

            return (
              <TouchableOpacity
                key={di}
                style={cal.dayCell}
                onPress={() => !isFuture && onSelectDate(date)}
                activeOpacity={isFuture ? 1 : 0.75}
                disabled={isFuture}
              >
                {isSelected && (
                  <View style={cal.selectedCircle} />
                )}
                {isToday && !isSelected && (
                  <View style={cal.todayCircle} />
                )}
                <Text
                  style={[
                    cal.dayText,
                    isSelected && cal.dayTextSelected,
                    isToday && !isSelected && cal.dayTextToday,
                    isFuture && cal.dayTextFuture,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ── DatePickerModal ───────────────────────────────────────────────────────────
/**
 * Props:
 *   visible      boolean
 *   initialDate  Date
 *   onClose      () => void
 *   onSave       (date: Date) => void
 */
export default function DatePickerModal({ visible, initialDate, onClose, onSave }) {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());

  useEffect(() => {
    if (visible) setSelectedDate(initialDate || new Date());
  }, [visible]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 230, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 14, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 20, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleSave = () => {
    onSave(selectedDate);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['#0B1121', '#162035', '#1a2642']}
          style={StyleSheet.absoluteFill}
        />

        {STARS.map((star) => (
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
          <TouchableOpacity onPress={onClose} style={styles.headerSideBtn} activeOpacity={0.7}>
            <Text style={styles.cancelText}>İptal</Text>
          </TouchableOpacity>

          <View style={styles.titleRow}>
            <Ionicons name="calendar-outline" size={15} color="rgba(255,255,255,0.5)" />
            <Text style={styles.headerTitle}>Tarih Seç</Text>
          </View>

          <TouchableOpacity onPress={handleSave} style={styles.headerSideBtn} activeOpacity={0.7}>
            <Text style={styles.saveText}>Kaydet</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerDivider} />

        {/* Calendar */}
        <Animated.View
          style={[styles.calendarWrap, { transform: [{ translateY: slideAnim }] }]}
        >
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </Animated.View>

        {/* Selected date display */}
        {selectedDate && (
          <View style={styles.selectedDisplay}>
            <Text style={styles.selectedLabel}>Seçilen Tarih</Text>
            <Text style={styles.selectedValue}>
              {selectedDate.getDate()} {TR_MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerHint}>
            Seçilen tarihten itibaren gün sayısı hesaplanacak
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

// ── Calendar styles ───────────────────────────────────────────────────────────
const CELL_SIZE = 42;

const cal = StyleSheet.create({
  root: {
    paddingHorizontal: 8,
  },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingHorizontal: 4,
  },

  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  navBtnDisabled: {
    backgroundColor: 'transparent',
  },

  monthLabel: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  headerRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },

  dayHeader: {
    flex: 1,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    paddingVertical: 4,
  },

  weekRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },

  dayCell: {
    flex: 1,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  selectedCircle: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0df2a6',
  },

  todayCircle: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(56,189,248,0.6)',
  },

  dayText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 15,
    fontWeight: '400',
    zIndex: 1,
  },

  dayTextSelected: {
    color: '#0a0e27',
    fontWeight: '700',
  },

  dayTextToday: {
    color: '#38bdf8',
    fontWeight: '600',
  },

  dayTextFuture: {
    color: 'rgba(255,255,255,0.2)',
  },
});

// ── Modal styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1121',
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
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },

  headerSideBtn: {
    minWidth: 60,
    paddingVertical: 4,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },

  cancelText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
  },

  saveText: {
    color: '#0df2a6',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },

  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  calendarWrap: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 12,
  },

  selectedDisplay: {
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    marginHorizontal: 20,
    gap: 3,
  },

  selectedLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  selectedValue: {
    color: '#0df2a6',
    fontSize: 16,
    fontWeight: '600',
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 44,
    paddingTop: 10,
    alignItems: 'center',
  },

  footerHint: {
    color: 'rgba(255,255,255,0.22)',
    fontSize: 12,
    textAlign: 'center',
  },
});
