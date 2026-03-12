import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const MOTIVATIONS = [
  "You are worthy of love and respect—including from yourself.",
  "Every day clean is a victory worth celebrating.",
  "Your future self will thank you for today's strength.",
  "You're not fighting urges, you're building character.",
  "Progress, not perfection. You're doing great.",
  "Healing is not linear, but every step forward counts.",
  "You deserve a mind free from addiction.",
  "True strength is choosing better, day after day.",
  "Your brain is rewiring itself every clean day.",
  "You are more than your urges. You always have a choice.",
  "The best version of you is waiting on the other side.",
  "Each breath you take is a step toward freedom.",
  "You have survived every difficult moment so far.",
  "Your discipline today is your freedom tomorrow.",
  "Clarity, confidence, and peace are within reach.",
  "The struggle is real, but so is your strength.",
  "Small steps lead to lasting change.",
  "You are rewriting your story, one day at a time.",
  "Stillness is the foundation of inner strength.",
  "Breathe. You've got this.",
];

const EXERCISES = {
  '478': {
    key: '478',
    name: '4-7-8 Breathing',
    subtitle: 'For sleep & anxiety relief',
    phases: [
      { name: 'Breathe In', duration: 4, scaleTarget: 1.0, glowTarget: 0.7 },
      { name: 'Hold', duration: 7, scaleTarget: 1.0, glowTarget: 0.7 },
      { name: 'Breathe Out', duration: 8, scaleTarget: 0.45, glowTarget: 0.15 },
    ],
    totalCycles: 8,
    color: '#818cf8',
  },
  box: {
    key: 'box',
    name: 'Box Breathing',
    subtitle: 'For focus & calm',
    phases: [
      { name: 'Breathe In', duration: 4, scaleTarget: 1.0, glowTarget: 0.7 },
      { name: 'Hold', duration: 4, scaleTarget: 1.0, glowTarget: 0.7 },
      { name: 'Breathe Out', duration: 4, scaleTarget: 0.45, glowTarget: 0.15 },
      { name: 'Hold', duration: 4, scaleTarget: 0.45, glowTarget: 0.15 },
    ],
    totalCycles: 10,
    color: '#0df2a6',
  },
  wim: {
    key: 'wim',
    name: 'Wim Hof Method',
    subtitle: 'For energy & vitality',
    phases: [
      { name: 'Breathe In', duration: 1, scaleTarget: 1.0, glowTarget: 0.7 },
      { name: 'Breathe Out', duration: 1, scaleTarget: 0.45, glowTarget: 0.15 },
    ],
    totalCycles: 30,
    color: '#f97316',
  },
  fivefive: {
    key: 'fivefive',
    name: '5-5 Breathing',
    subtitle: 'For beginners & calm',
    phases: [
      { name: 'Breathe In', duration: 5, scaleTarget: 1.0, glowTarget: 0.7 },
      { name: 'Breathe Out', duration: 5, scaleTarget: 0.45, glowTarget: 0.15 },
    ],
    totalCycles: 10,
    color: '#34d399',
  },
};

export default function MeditationScreen({ navigation }) {
  const [quote] = useState(
    () => MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]
  );
  const [exerciseKey, setExerciseKey] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [cyclesDone, setCyclesDone] = useState(0);

  const breathScale = useRef(new Animated.Value(0.45)).current;
  const glowOpacity = useRef(new Animated.Value(0.15)).current;
  const timeoutsRef = useRef([]);
  const intervalsRef = useRef([]);
  const runningRef = useRef(false);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      intervalsRef.current.forEach(clearInterval);
    };
  }, []);

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    intervalsRef.current.forEach(clearInterval);
    timeoutsRef.current = [];
    intervalsRef.current = [];
  }, []);

  const startExercise = useCallback(
    (key) => {
      clearTimers();
      const ex = EXERCISES[key];
      breathScale.setValue(0.45);
      glowOpacity.setValue(0.15);
      runningRef.current = true;
      setExerciseKey(key);
      setIsRunning(true);
      setIsComplete(false);
      setPhaseIdx(0);
      setCyclesDone(0);

      const runPhase = (idx, cycle) => {
        if (!runningRef.current) return;
        const phase = ex.phases[idx];
        setPhaseIdx(idx);
        setCyclesDone(cycle);
        setCountdown(phase.duration);

        Animated.timing(breathScale, {
          toValue: phase.scaleTarget,
          duration: phase.duration * 1000,
          useNativeDriver: true,
        }).start();

        Animated.timing(glowOpacity, {
          toValue: phase.glowTarget,
          duration: phase.duration * 1000,
          useNativeDriver: true,
        }).start();

        let rem = phase.duration - 1;
        const iv = setInterval(() => {
          setCountdown(rem);
          if (rem <= 0) clearInterval(iv);
          rem--;
        }, 1000);
        intervalsRef.current.push(iv);

        const to = setTimeout(() => {
          clearInterval(iv);
          if (!runningRef.current) return;
          const nextIdx = (idx + 1) % ex.phases.length;
          const nextCycle = nextIdx === 0 ? cycle + 1 : cycle;
          if (nextIdx === 0 && nextCycle >= ex.totalCycles) {
            setIsComplete(true);
            setIsRunning(false);
            runningRef.current = false;
          } else {
            runPhase(nextIdx, nextCycle);
          }
        }, phase.duration * 1000);
        timeoutsRef.current.push(to);
      };

      runPhase(0, 0);
    },
    [clearTimers, breathScale, glowOpacity]
  );

  const stopExercise = useCallback(() => {
    runningRef.current = false;
    clearTimers();
    breathScale.setValue(0.45);
    glowOpacity.setValue(0.15);
    setIsRunning(false);
    setExerciseKey(null);
    setIsComplete(false);
    setPhaseIdx(0);
    setCyclesDone(0);
  }, [clearTimers, breathScale, glowOpacity]);

  const exercise = exerciseKey ? EXERCISES[exerciseKey] : null;
  const phase = exercise ? exercise.phases[phaseIdx] : null;

  const handleBack = () => {
    if (isRunning) {
      stopExercise();
    } else {
      navigation.goBack();
    }
  };

  return (
    <LinearGradient colors={['#070b18', '#0B1121', '#0f1a2e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={isRunning ? 'close' : 'arrow-back'} size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>REFLECT & BREATHE</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* ── Selection Screen ── */}
        {!isRunning && !isComplete && (
          <ScrollView
            contentContainerStyle={styles.selectionContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Motivation quote */}
            <View style={styles.quoteCard}>
              <Text style={styles.quoteEmoji}>✨</Text>
              <Text style={styles.quoteText}>"{quote}"</Text>
            </View>

            <Text style={styles.sectionLabel}>Choose an Exercise</Text>

            {Object.values(EXERCISES).map((ex) => (
              <TouchableOpacity
                key={ex.key}
                onPress={() => startExercise(ex.key)}
                activeOpacity={0.75}
              >
                <View style={[styles.exerciseCard, { borderColor: ex.color + '55' }]}>
                  <View style={[styles.exerciseColorBar, { backgroundColor: ex.color }]} />
                  <View style={styles.exerciseInfo}>
                    <Text style={[styles.exerciseName, { color: ex.color }]}>{ex.name}</Text>
                    <Text style={styles.exerciseSubtitle}>{ex.subtitle}</Text>
                    <Text style={styles.exercisePhases}>
                      {ex.phases.map((p) => `${p.name} ${p.duration}s`).join(' · ')}
                    </Text>
                  </View>
                  <View style={[styles.exercisePlayBtn, { borderColor: ex.color + '88' }]}>
                    <Ionicons name="play" size={16} color={ex.color} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── Breathing Screen ── */}
        {isRunning && exercise && phase && (
          <View style={styles.breathingContent}>
            <Text style={styles.exerciseRunningLabel}>{exercise.name}</Text>

            {/* Animated circle */}
            <View style={styles.circleContainer}>
              <Animated.View
                style={[
                  styles.glowRing,
                  { borderColor: exercise.color + '66', opacity: glowOpacity },
                ]}
              />
              <Animated.View
                style={[
                  styles.breathCircle,
                  {
                    backgroundColor: exercise.color + '2a',
                    borderColor: exercise.color,
                    transform: [{ scale: breathScale }],
                  },
                ]}
              />
              <View style={[styles.centerDot, { backgroundColor: exercise.color }]} />
            </View>

            <Text style={[styles.phaseNameText, { color: exercise.color }]}>
              {phase.name}
            </Text>
            <Text style={styles.countdownText}>{countdown}</Text>

            {/* Cycle progress dots */}
            <View style={styles.cycleDots}>
              {Array.from({ length: exercise.totalCycles }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.cycleDot,
                    {
                      backgroundColor:
                        i < cyclesDone
                          ? exercise.color
                          : i === cyclesDone
                          ? exercise.color + '66'
                          : '#2d3748',
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.cycleLabel}>
              Cycle {cyclesDone + 1} / {exercise.totalCycles}
            </Text>

            <TouchableOpacity style={styles.stopBtn} onPress={stopExercise} activeOpacity={0.7}>
              <Text style={styles.stopBtnText}>Stop</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Complete Screen ── */}
        {isComplete && exercise && (
          <View style={styles.completeContent}>
            <Text style={styles.completeEmoji}>🎉</Text>
            <Text style={styles.completeTitle}>Well done!</Text>
            <Text style={styles.completeSubtitle}>
              You completed {exercise.totalCycles} cycles of{'\n'}
              {exercise.name}.{'\n\n'}
              Take a moment to notice how you feel.
            </Text>
            <TouchableOpacity
              style={[styles.completeBtn, { backgroundColor: exercise.color }]}
              onPress={() => {
                setExerciseKey(null);
                setIsComplete(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.completeBtnText}>Try Another</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backHomeBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backHomeBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3,
  },

  // Selection
  selectionContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 48,
  },
  quoteCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    gap: 12,
  },
  quoteEmoji: { fontSize: 28 },
  quoteText: {
    color: '#e2e8f0',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sectionLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  exerciseColorBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  exerciseInfo: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 3,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
  },
  exerciseSubtitle: {
    color: '#9ca3af',
    fontSize: 13,
  },
  exercisePhases: {
    color: '#6b7280',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  exercisePlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  // Breathing
  breathingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  exerciseRunningLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  circleContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  glowRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1.5,
  },
  breathCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    position: 'absolute',
  },
  centerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
  },
  phaseNameText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  countdownText: {
    color: '#fff',
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 70,
  },
  cycleDots: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    maxWidth: 320,
  },
  cycleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cycleLabel: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
  },
  stopBtn: {
    marginTop: 28,
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  stopBtnText: {
    color: '#9ca3af',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 1,
  },

  // Complete
  completeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  completeEmoji: { fontSize: 72 },
  completeTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
  },
  completeSubtitle: {
    color: '#9ca3af',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  completeBtn: {
    marginTop: 4,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 99,
    width: '100%',
    alignItems: 'center',
  },
  completeBtnText: {
    color: '#0a0e27',
    fontSize: 16,
    fontWeight: '700',
  },
  backHomeBtn: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  backHomeBtnText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '500',
  },
});
