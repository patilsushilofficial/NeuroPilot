import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useOnboarding } from '../../hooks/useOnboarding';
import { Button } from '../../components/common/Button';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { avatarSizes, borderWidths, iconSizes } from '../../theme/tokens';
import { fontSizes, fontWeights } from '../../theme/typography';
import {
  ONBOARDING_FEATURES,
  ONBOARDING_QUICK_START_STEPS,
  ONBOARDING_STEPS,
} from '../../constants/onboarding';
import { ONBOARDING_AVATARS, USER_MODE_OPTIONS } from '../../constants/profile';
import { moderateScale } from '../../utils/responsive';
import {
  ModeStepProps,
  ProfileStepProps,
  ReadyStepProps,
  StepProps,
} from './types';

const PROGRESS_DOT_HEIGHT = moderateScale(8);
const PROGRESS_DOT_ACTIVE_WIDTH = moderateScale(24);
const PROGRESS_DOT_WIDTH = moderateScale(8);

type Styles = ReturnType<typeof makeStyles>;
type OnboardingStepProps = StepProps<Styles>;
type OnboardingModeStepProps = ModeStepProps<Styles>;
type OnboardingProfileStepProps = ProfileStepProps<Styles>;
type OnboardingReadyStepProps = ReadyStepProps<Styles>;

const WelcomeStep: React.FC<OnboardingStepProps> = ({ onNext, theme, styles }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.bigEmoji}>🧠</Text>
    <Text style={[theme.text.displayMedium, styles.titleCenter]}>Meet NeuroPilot</Text>
    <Text style={[theme.text.bodyLarge, styles.subtitleCenter]}>
      Your neuro-inclusive companion for ADHD — built on real clinical research, not guesswork.
    </Text>

    <View style={styles.featureList}>
      {ONBOARDING_FEATURES.map((f) => (
        <View key={f.text} style={styles.featureRow}>
          <Text style={styles.featureEmoji}>{f.emoji}</Text>
          <Text style={[theme.text.bodyMedium, styles.featureText]}>{f.text}</Text>
        </View>
      ))}
    </View>

    <Button label="Let's Go →" onPress={onNext} variant="primary" size="lg" fullWidth />
  </View>
);

const HowItWorksStep: React.FC<OnboardingStepProps> = ({ onNext, theme, styles }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.bigEmoji}>🗺️</Text>
    <Text style={[theme.text.h1, styles.titleCenter]}>How to use NeuroPilot</Text>
    <Text style={[theme.text.bodyMedium, styles.modeCaption]}>
      Follow this simple daily flow to stay calm, focused, and consistent.
    </Text>

    <View style={styles.quickStartList}>
      {ONBOARDING_QUICK_START_STEPS.map((item) => (
        <View key={item.title} style={styles.quickStartCard}>
          <Text style={styles.quickStartEmoji}>{item.emoji}</Text>
          <View style={styles.quickStartBody}>
            <Text style={[theme.text.h4, styles.quickStartTitle]}>{item.title}</Text>
            <Text style={[theme.text.bodySmall, styles.quickStartDesc]}>{item.description}</Text>
          </View>
        </View>
      ))}
    </View>

    <Button label="Got it, continue →" onPress={onNext} variant="primary" size="lg" fullWidth />
  </View>
);

const ModeStep: React.FC<OnboardingModeStepProps> = ({ onNext, theme, mode, onSelectMode, styles }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.bigEmoji}>👤</Text>
    <Text style={[theme.text.h1, styles.titleCenter]}>Who is this for?</Text>
    <Text style={[theme.text.bodyMedium, styles.modeCaption]}>
      NeuroPilot adapts its experience to your age group.
    </Text>

    <View style={styles.modeOptions}>
      {USER_MODE_OPTIONS.map((opt) => {
        const selected = mode === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            onPress={() => onSelectMode(opt.key)}
            style={[styles.modeCard, selected ? styles.modeCardActive : styles.modeCardInactive]}
            accessible
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            <Text style={styles.modeEmoji}>{opt.emoji}</Text>
            <Text style={[theme.text.h4, styles.modeTitle]}>{opt.title}</Text>
            <Text style={[theme.text.bodySmall, styles.modeDesc]}>{opt.description}</Text>
            {selected && <Text style={styles.modeCheck}>✅</Text>}
          </TouchableOpacity>
        );
      })}
    </View>

    <Button label="Continue →" onPress={onNext} variant="primary" size="lg" fullWidth />
  </View>
);

const ProfileStep: React.FC<OnboardingProfileStepProps> = ({
  onNext,
  theme,
  name,
  setName,
  avatar,
  onSelectAvatar,
  styles,
}) => (
  <View style={styles.stepContainer}>
    <Text style={styles.bigEmoji}>{avatar}</Text>
    <Text style={[theme.text.h1, styles.titleCenter]}>What should we call you?</Text>

    <TextInput
      style={[styles.nameInput, name ? styles.nameInputActive : styles.nameInputInactive]}
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

    <Text style={[theme.text.labelMedium, styles.pickAvatarLabel]}>PICK YOUR AVATAR</Text>

    <View style={styles.avatarGrid}>
      {ONBOARDING_AVATARS.map((a) => {
        const selected = avatar === a;
        return (
          <TouchableOpacity
            key={a}
            onPress={() => onSelectAvatar(a)}
            style={[styles.avatarChip, selected ? styles.avatarChipActive : styles.avatarChipInactive]}
          >
            <Text style={styles.avatarChipText}>{a}</Text>
          </TouchableOpacity>
        );
      })}
    </View>

    <Button
      label="Let's Start! 🚀"
      onPress={onNext}
      variant="primary"
      size="lg"
      fullWidth
      disabled={!name.trim()}
      style={styles.profileBtn}
    />
  </View>
);

const ReadyStep: React.FC<OnboardingReadyStepProps> = ({ onNext, theme, name, avatar, styles }) => (
  <View style={[styles.stepContainer, styles.centered]}>
    <Text style={styles.heroEmoji}>{avatar}</Text>
    <Text style={[theme.text.displayMedium, styles.readyTitle]}>
      You're all set,{'\n'}{name}! 🎉
    </Text>
    <Text style={[theme.text.bodyLarge, styles.readyBody]}>
      Your NeuroPilot is ready to launch. Remember: done is better than perfect.
    </Text>
    <Button
      label="Enter NeuroPilot 🚀"
      onPress={onNext}
      variant="primary"
      size="lg"
      fullWidth
      style={styles.readyBtn}
    />
  </View>
);

export const OnboardingScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
    step,
    stepIndex,
    name,
    avatar,
    mode,
    displayName,
    setName,
    handleSelectMode,
    handleSelectAvatar,
    nextStep,
    previousStep,
    skipToProfile,
    finish,
  } = useOnboarding();
  const canGoBack = stepIndex > 0;
  const canSkip = step !== 'ready' && step !== 'profile';

  // Progress dot widths are state-driven (active vs inactive). The structural
  // styling sits in the stylesheet; we only pick a width here.
  const dotWidthFor = useCallback(
    (i: number): ViewStyle =>
      i === stepIndex ? styles.progressDotActiveWidth : styles.progressDotWidth,
    [stepIndex, styles]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        {ONBOARDING_STEPS.map((s, i) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              i <= stepIndex ? styles.progressDotOn : styles.progressDotOff,
              dotWidthFor(i),
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {(canGoBack || canSkip) && (
          <View style={styles.topActions}>
            {canGoBack ? (
              <Button
                label="Back"
                onPress={previousStep}
                variant="ghost"
                size="sm"
                style={styles.topActionButton}
              />
            ) : (
              <View />
            )}
            {canSkip ? (
              <Button
                label="Skip setup"
                onPress={skipToProfile}
                variant="ghost"
                size="sm"
                style={styles.topActionButton}
              />
            ) : (
              <View />
            )}
          </View>
        )}
        {step === 'welcome' && <WelcomeStep onNext={nextStep} theme={theme} styles={styles} />}
        {step === 'howItWorks' && <HowItWorksStep onNext={nextStep} theme={theme} styles={styles} />}
        {step === 'mode' && (
          <ModeStep
            onNext={nextStep}
            theme={theme}
            mode={mode}
            onSelectMode={handleSelectMode}
            styles={styles}
          />
        )}
        {step === 'profile' && (
          <ProfileStep
            onNext={nextStep}
            theme={theme}
            name={name}
            setName={setName}
            avatar={avatar}
            onSelectAvatar={handleSelectAvatar}
            styles={styles}
          />
        )}
        {step === 'ready' && (
          <ReadyStep
            onNext={finish}
            theme={theme}
            name={displayName}
            avatar={avatar}
            styles={styles}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    progressContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing['2xs'],
      paddingTop: spacing.md,
      paddingBottom: spacing.xs,
    },
    progressDot: {
      height: PROGRESS_DOT_HEIGHT,
      borderRadius: PROGRESS_DOT_HEIGHT / 2,
    },
    progressDotOn: { backgroundColor: theme.colors.primary },
    progressDotOff: { backgroundColor: theme.colors.border },
    progressDotActiveWidth: { width: PROGRESS_DOT_ACTIVE_WIDTH },
    progressDotWidth: { width: PROGRESS_DOT_WIDTH },
    scrollContent: {
      flexGrow: 1,
      padding: spacing.md,
    },
    topActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    topActionButton: {
      paddingHorizontal: spacing['2xs'],
    },
    stepContainer: {
      flex: 1,
      gap: spacing.md,
    },
    centered: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    bigEmoji: {
      fontSize: iconSizes['6xl'],
      textAlign: 'center',
    },
    titleCenter: {
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    subtitleCenter: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    featureList: {
      gap: spacing.xs,
      paddingVertical: spacing.xs,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs,
    },
    featureEmoji: { fontSize: iconSizes.lg },
    featureText: {
      color: theme.colors.textSecondary,
      flex: 1,
    },
    quickStartList: {
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    quickStartCard: {
      flexDirection: 'row',
      gap: spacing.sm,
      borderWidth: borderWidths.base,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.sm,
      alignItems: 'flex-start',
    },
    quickStartEmoji: {
      fontSize: iconSizes.xl,
      marginTop: spacing['3xs'],
    },
    quickStartBody: {
      flex: 1,
      gap: spacing['3xs'],
    },
    quickStartTitle: {
      color: theme.colors.textPrimary,
    },
    quickStartDesc: {
      color: theme.colors.textSecondary,
    },
    modeCaption: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing['2xs'],
    },
    modeOptions: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    modeCard: {
      flex: 1,
      borderRadius: borderRadius.xl,
      padding: spacing.sm,
      borderWidth: borderWidths.base,
      alignItems: 'center',
      gap: spacing['3xs'],
    },
    modeCardActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    modeCardInactive: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
    modeEmoji: { fontSize: iconSizes['4xl'] },
    modeTitle: {
      color: theme.colors.textPrimary,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
    modeDesc: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing['3xs'],
    },
    modeCheck: {
      fontSize: iconSizes.md,
      marginTop: spacing.xs,
    },
    nameInput: {
      borderWidth: borderWidths.base,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.medium,
      backgroundColor: theme.colors.card,
      color: theme.colors.textPrimary,
    },
    nameInputActive: { borderColor: theme.colors.primary },
    nameInputInactive: { borderColor: theme.colors.border },
    pickAvatarLabel: {
      color: theme.colors.textSecondary,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    avatarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      justifyContent: 'center',
    },
    avatarChip: {
      width: avatarSizes.lg,
      height: avatarSizes.lg,
      borderRadius: borderRadius.lg,
      borderWidth: borderWidths.thick,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarChipActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    avatarChipInactive: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
    avatarChipText: { fontSize: iconSizes.xl },
    profileBtn: { marginTop: spacing.md },
    heroEmoji: { fontSize: iconSizes['7xl'] },
    readyTitle: {
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    readyBody: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    readyBtn: { marginTop: spacing.xl },
  });
