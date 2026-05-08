import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FocusShield } from '../FocusShield';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useHaptics } from '../../../hooks/useHaptics';
import { focusShieldService } from '../../../services/FocusShieldService';
import { Alert } from 'react-native';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: jest.fn().mockReturnValue({
    colors: {
      border: '#E5E5EA',
      card: '#FFFFFF',
      textPrimary: '#000',
      textSecondary: '#666',
      textTertiary: '#8E8E93',
    },
  }),
}));

jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: jest.fn().mockReturnValue({
    heavy: jest.fn(),
    light: jest.fn(),
    success: jest.fn(),
    medium: jest.fn(),
    achievement: jest.fn(),
  }),
}));

jest.mock('../../../services/FocusShieldService', () => ({
  focusShieldService: {
    activate: jest.fn(),
    deactivate: jest.fn(),
    openDNDSettings: jest.fn(),
  },
}));

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    useSharedValue: jest.fn().mockReturnValue({ value: 1 }),
    useAnimatedStyle: jest.fn().mockImplementation((cb) => cb()),
    withTiming: jest.fn().mockImplementation((val) => val),
    withSpring: jest.fn().mockImplementation((val, config, cb) => {
      if (cb) cb(true);
      return val;
    }),
    withRepeat: jest.fn().mockImplementation((val) => val),
    withSequence: jest.fn().mockImplementation((...args) => args[0]),
    cancelAnimation: jest.fn(),
    default: {
      View: View,
      createAnimatedComponent: jest.fn().mockImplementation((comp) => comp),
    },
    View: View,
    createAnimatedComponent: jest.fn().mockImplementation((comp) => comp),
    Easing: {
      inOut: jest.fn().mockReturnValue({}),
      ease: {},
    },
  };
});

describe('FocusShield', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when inactive', () => {
    const onToggle = jest.fn();
    const { getByText } = render(<FocusShield isActive={false} onToggle={onToggle} />);
    expect(getByText('Focus Shield')).toBeTruthy();
    expect(getByText('Block all calls, alerts, and distractions')).toBeTruthy();
  });

  it('renders correctly when active', () => {
    const onToggle = jest.fn();
    const { getByText } = render(<FocusShield isActive={true} onToggle={onToggle} />);
    expect(getByText('Shield Active')).toBeTruthy();
    expect(getByText('All notifications silenced. Stay in the zone.')).toBeTruthy();
  });

  it('handles toggle to active', () => {
    const onToggle = jest.fn();
    const { getByRole } = render(<FocusShield isActive={false} onToggle={onToggle} />);
    
    const switch_comp = getByRole('switch');
    
    const spy = jest.spyOn(Alert, 'alert');
    
    fireEvent.press(switch_comp);
    
    expect(spy).toHaveBeenCalled();
    
    const buttons = spy.mock.calls[0][2];
    const activateButton = buttons?.find(b => b.text === 'Activate Shield');
    activateButton?.onPress?.();
    
    expect(onToggle).toHaveBeenCalledWith(true);
    expect(focusShieldService.activate).toHaveBeenCalled();
  });

  it('handles toggle to inactive', () => {
    const onToggle = jest.fn();
    const { getByRole } = render(<FocusShield isActive={true} onToggle={onToggle} />);
    
    const switch_comp = getByRole('switch');
    
    const spy = jest.spyOn(Alert, 'alert');
    
    fireEvent.press(switch_comp);
    
    expect(spy).toHaveBeenCalled();
    
    const buttons = spy.mock.calls[0][2];
    const deactivateButton = buttons?.find(b => b.text === 'Deactivate');
    deactivateButton?.onPress?.();
    
    expect(onToggle).toHaveBeenCalledWith(false);
    expect(focusShieldService.deactivate).toHaveBeenCalled();
  });

  it('opens DND settings', () => {
    const onToggle = jest.fn();
    const { getByLabelText } = render(<FocusShield isActive={true} onToggle={onToggle} />);
    
    const button = getByLabelText('Open Do Not Disturb settings');
    fireEvent.press(button);
    
    expect(focusShieldService.openDNDSettings).toHaveBeenCalled();
  });
});
