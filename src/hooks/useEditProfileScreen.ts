import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { useAppStore } from '../store';
import { UserMode } from '../types';
import { DEFAULT_AVATAR } from '../constants/profile';
import { springs } from '../theme/tokens';
import { useHaptics } from './useHaptics';

/** Save flow defers `goBack` so the success haptic + button text update have
 *  a chance to land before the screen unmounts. */
const SAVE_NAVIGATION_DELAY_MS = 400;

/**
 * View-model for the Edit Profile screen. Owns the local form state, the
 * spring animation that pulses the hero avatar when picked, validation,
 * the dual-store save (`updateProfile` + `updateSettings`), and navigation.
 */
export const useEditProfileScreen = () => {
  const haptics = useHaptics();
  const navigation = useNavigation<any>();
  const { profile, updateProfile, updateSettings } = useAppStore();

  const [name, setName] = useState(profile?.name ?? '');
  const [avatar, setAvatar] = useState(profile?.avatar ?? DEFAULT_AVATAR);
  const [mode, setMode] = useState<UserMode>(profile?.mode ?? 'adult');
  const [isSaving, setIsSaving] = useState(false);

  const scale = useSharedValue(1);
  const avatarAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleSelectAvatar = useCallback(
    (next: string) => {
      haptics.light();
      setAvatar(next);
      scale.value = withSpring(1.3, springs.bouncy, () => {
        scale.value = withSpring(1);
      });
    },
    [haptics, scale]
  );

  const handleSelectMode = useCallback(
    (next: UserMode) => {
      haptics.medium();
      setMode(next);
    },
    [haptics]
  );

  const canSave = !!name.trim();

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a name to continue.');
      return;
    }
    haptics.achievement();
    setIsSaving(true);

    updateProfile({ name: name.trim(), avatar, mode });
    updateSettings({ userMode: mode });

    setTimeout(() => {
      setIsSaving(false);
      navigation.goBack();
    }, SAVE_NAVIGATION_DELAY_MS);
  }, [name, avatar, mode, updateProfile, updateSettings, haptics, navigation]);

  const handleCancel = useCallback(() => navigation.goBack(), [navigation]);

  return {
    name,
    avatar,
    mode,
    isSaving,
    canSave,
    avatarAnimStyle,
    setName,
    handleSelectAvatar,
    handleSelectMode,
    handleSave,
    handleCancel,
  };
};
