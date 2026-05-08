import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { useAppStore } from '../../store';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { UserMode } from '../../types';
import { spacing, borderRadius } from '../../theme/spacing';
import { useNavigation } from '@react-navigation/native';
import { moderateScale } from '../../utils/responsive';

const AVATARS = ['🧠', '🚀', '⚡', '🎯', '🌊', '🦋', '🔥', '✨', '🎮', '🌟'];

type OnboardingStep = 'welcome' | 'mode' | 'profile' | 'ready';

interface StepProps {
  onNext: () => void;
  theme: ReturnType<typeof useAppTheme>;
  haptics: ReturnType<typeof useHaptics>;
}

const WelcomeStep: React.FC<StepProps> = ({ onNext, theme }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.bigEmoji}>🧠</Text>
    <Text style={[theme.text.displayMedium, { color: theme.colors.textPrimary, textAlign: 'center' }]}>
      Meet NeuroPilot
    </Text>
    <Text
      style={[
        theme.text.bodyLarge,
        { color: theme.colors.textSecondary, textAlign: 'center', marginTop: spacing[1] },
      ]}
    >
      Your neuro-inclusive companion for ADHD — built on real clinical research, not guesswork.
    </Text>

    <View style={styles.featureList}>
      {[
        { emoji: '⚡', text: 'Fast task capture — before thoughts vanish' },
        { emoji: '⏱️', text: 'Visual timers that make time real' },
        { emoji: '🔥', text: 'Habit streaks with dopamine rewards' },
        { emoji: '🏆', text: 'XP & achievements that celebrate YOU' },
      ].map((f) => (
        <View key={f.text} style={styles.featureRow}>
          <Text style={{ fontSize: moderateScale(20) }}>{f.emoji}</Text>
          <Text style={[theme.text.bodyMedium, { color: theme.colors.textSecondary, flex: 1 }]}>
            {f.text}
          </Text>
        </View>
      ))}
    </View>

    <Button label="Let's Go →" onPress={onNext} variant="primary" size="lg" fullWidth />
  </View>
);

const ModeStep: React.FC<
  StepProps & { mode: UserMode; setMode: (m: UserMode) => void }
> = ({ onNext, theme, haptics, mode, setMode }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.bigEmoji}>👤</Text>
    <Text style={[theme.text.h1, { color: theme.colors.textPrimary, textAlign: 'center' }]}>
      Who is this for?
    </Text>
    <Text
      style={[
        theme.text.bodyMedium,
        { color: theme.colors.textSecondary, textAlign: 'center', marginTop: spacing[0.5] },
      ]}
    >
      NeuroPilot adapts its experience to your age group.
    </Text>

    <View style={styles.modeOptions}>
      {([
        {
          key: 'adult' as UserMode,
          emoji: '💼',
          title: 'Adult Mode',
          desc: 'Professional productivity, complex task management, deep work sessions',
        },
        {
          key: 'child' as UserMode,
          emoji: '🌈',
          title: 'Child Mode',
          desc: 'Visual schedules, fun rewards, simple habit tracking for ages 6–17',
        },
      ] as const).map((opt) => (
        <TouchableOpacity
          key={opt.key}
          onPress={() => {
            haptics.medium();
            setMode(opt.key);
          }}
          style={[
            styles.modeCard,
            {
              backgroundColor:
                mode === opt.key ? theme.colors.primaryContainer : theme.colors.card,
              borderColor: mode === opt.key ? theme.colors.primary : theme.colors.border,
            },
          ]}
          accessible
          accessibilityRole="radio"
          accessibilityState={{ selected: mode === opt.key }}
        >
          <Text style={{ fontSize: moderateScale(40) }}>{opt.emoji}</Text>
          <Text
            style={[
              theme.text.h4,
              { color: theme.colors.textPrimary, marginTop: spacing[1], textAlign: 'center' },
            ]}
          >
            {opt.title}
          </Text>
          <Text
            style={[
              theme.text.bodySmall,
              { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 4 },
            ]}
          >
            {opt.desc}
          </Text>
          {mode === opt.key && (
            <Text style={{ fontSize: moderateScale(16), marginTop: 8 }}>✅</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>

    <Button label="Continue →" onPress={onNext} variant="primary" size="lg" fullWidth />
  </View>
);

const ProfileStep: React.FC<
  StepProps & {
    name: string;
    setName: (n: string) => void;
    avatar: string;
    setAvatar: (a: string) => void;
  }
> = ({ onNext, theme, haptics, name, setName, avatar, setAvatar }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.bigEmoji}>{avatar}</Text>
    <Text style={[theme.text.h1, { color: theme.colors.textPrimary, textAlign: 'center' }]}>
      What should we call you?
    </Text>

    <TextInput
      style={[
        styles.nameInput,
        {
          backgroundColor: theme.colors.card,
          borderColor: name ? theme.colors.primary : theme.colors.border,
          color: theme.colors.textPrimary,
        },
      ]}
      placeholder="Your name or nickname…"
      placeholderTextColor={theme.colors.textTertiary}
      value={name}
      onChangeText={setName}
      autoCapitalize="words"
      autoCorrect={false}
      returnKeyType="done"
      accessible
      accessibilityLabel="Name input"
    />

    <Text
      style={[
        theme.text.labelMedium,
        { color: theme.colors.textSecondary, marginTop: spacing[2], marginBottom: spacing[1] },
      ]}
    >
      PICK YOUR AVATAR
    </Text>

    <View style={styles.avatarGrid}>
      {AVATARS.map((a) => (
        <TouchableOpacity
          key={a}
          onPress={() => {
            haptics.light();
            setAvatar(a);
          }}
          style={[
            styles.avatarChip,
            {
              backgroundColor:
                avatar === a ? theme.colors.primaryContainer : theme.colors.card,
              borderColor: avatar === a ? theme.colors.primary : theme.colors.border,
            },
          ]}
        >
          <Text style={{ fontSize: moderateScale(26) }}>{a}</Text>
        </TouchableOpacity>
      ))}
    </View>

    <Button
      label="Let's Start! 🚀"
      onPress={onNext}
      variant="primary"
      size="lg"
      fullWidth
      disabled={!name.trim()}
      style={{ marginTop: spacing[2] }}
    />
  </View>
);

const ReadyStep: React.FC<StepProps & { name: string; avatar: string }> = ({
  onNext,
  theme,
  name,
  avatar,
}) => (
  <View style={[styles.stepContainer, styles.centered]}>
    <Text style={{ fontSize: moderateScale(80) }}>{avatar}</Text>
    <Text
      style={[theme.text.displayMedium, { color: theme.colors.textPrimary, textAlign: 'center', marginTop: spacing[2] }]}
    >
      You're all set,{'\n'}{name}! 🎉
    </Text>
    <Text
      style={[
        theme.text.bodyLarge,
        { color: theme.colors.textSecondary, textAlign: 'center', marginTop: spacing[1] },
      ]}
    >
      Your NeuroPilot is ready to launch. Remember: done is better than perfect.
    </Text>
    <Button
      label="Enter NeuroPilot 🚀"
      onPress={onNext}
      variant="primary"
      size="lg"
      fullWidth
      style={{ marginTop: spacing[3] }}
    />
  </View>
);

export const OnboardingScreen: React.FC = () => {
  const theme = useAppTheme();
  const haptics = useHaptics();
  const { setProfile, updateSettings } = useAppStore();
  const navigation = useNavigation<any>();

  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🧠');
  const [mode, setMode] = useState<UserMode>('adult');

  const steps: OnboardingStep[] = ['welcome', 'mode', 'profile', 'ready'];
  const stepIndex = steps.indexOf(step);
  const progress = (stepIndex + 1) / steps.length;

  const nextStep = useCallback(() => {
    haptics.medium();
    const nextIdx = stepIndex + 1;
    if (nextIdx < steps.length) {
      setStep(steps[nextIdx]);
    }
  }, [stepIndex, steps, haptics]);

  const finish = useCallback(() => {
    haptics.achievement();
    setProfile({
      id: `user_${Date.now()}`,
      name: name.trim() || 'Pilot',
      mode,
      avatar,
      createdAt: Date.now(),
      onboardingComplete: true,
    });
    updateSettings({ userMode: mode });
  }, [name, mode, avatar, setProfile, updateSettings, haptics, navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.progressContainer}>
        {steps.map((s, i) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              {
                backgroundColor:
                  i <= stepIndex ? theme.colors.primary : theme.colors.border,
                width: i === stepIndex ? moderateScale(24) : moderateScale(8),
              },
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'welcome' && (
          <WelcomeStep onNext={nextStep} theme={theme} haptics={haptics} />
        )}
        {step === 'mode' && (
          <ModeStep
            onNext={nextStep}
            theme={theme}
            haptics={haptics}
            mode={mode}
            setMode={setMode}
          />
        )}
        {step === 'profile' && (
          <ProfileStep
            onNext={nextStep}
            theme={theme}
            haptics={haptics}
            name={name}
            setName={setName}
            avatar={avatar}
            setAvatar={setAvatar}
          />
        )}
        {step === 'ready' && (
          <ReadyStep
            onNext={finish}
            theme={theme}
            haptics={haptics}
            name={name.trim() || 'Pilot'}
            avatar={avatar}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScale(6),
    paddingTop: spacing[2],
    paddingBottom: spacing[1],
  },
  progressDot: {
    height: moderateScale(8),
    borderRadius: moderateScale(4),
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing[2],
  },
  stepContainer: {
    flex: 1,
    gap: spacing[2],
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  bigEmoji: {
    fontSize: moderateScale(64),
    textAlign: 'center',
  },
  featureList: {
    gap: spacing[1],
    paddingVertical: spacing[1],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[1],
  },
  modeOptions: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  modeCard: {
    flex: 1,
    borderRadius: borderRadius.xl,
    padding: spacing[1.5],
    borderWidth: 1.5,
    alignItems: 'center',
    gap: moderateScale(4),
  },
  nameInput: {
    borderWidth: 1.5,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1.5],
    fontSize: moderateScale(18),
    fontWeight: '500',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
    justifyContent: 'center',
  },
  avatarChip: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
