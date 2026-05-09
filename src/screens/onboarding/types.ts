import { Theme } from '../../theme';
import { UserMode } from '../../types';

export interface StepProps<TStyles> {
  onNext: () => void;
  theme: Theme;
  styles: TStyles;
}

export interface ModeStepProps<TStyles> extends StepProps<TStyles> {
  mode: UserMode;
  onSelectMode: (mode: UserMode) => void;
}

export interface ProfileStepProps<TStyles> extends StepProps<TStyles> {
  name: string;
  setName: (next: string) => void;
  avatar: string;
  onSelectAvatar: (next: string) => void;
}

export interface ReadyStepProps<TStyles> extends StepProps<TStyles> {
  name: string;
  avatar: string;
}
