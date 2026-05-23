import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DebugScreen } from '../DebugScreen';
import { Alert } from 'react-native';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#FFFFFF',
      textPrimary: '#000000',
    },
    text: {
      h2: {},
      h4: {},
    },
  }),
}));

const mockHaptics = {
  light: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
  heavy: jest.fn(),
  achievement: jest.fn(),
};

jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: () => mockHaptics,
}));

const mockAddXP = jest.fn();
const mockStoreState: any = { addXP: mockAddXP };
jest.mock('../../../store', () => ({
  useAppStore: (selector?: any) =>
    typeof selector === 'function' ? selector(mockStoreState) : mockStoreState,
}));

jest.mock('../../../utils/notifications', () => ({
  triggerImmediateFocusAlert: jest.fn().mockResolvedValue(true),
  scheduleTaskReminder: jest.fn().mockResolvedValue('notif_1'),
}));

const mockToastShow = jest.fn();
jest.mock('../../../hooks/useToast', () => ({
  useToast: () => ({
    show: mockToastShow,
    dismiss: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  }),
}));

describe('DebugScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<DebugScreen />);
    expect(getByText('🛠️ Debug Menu')).toBeTruthy();
  });

  it('triggers immediate notification on press', () => {
    const { getByText } = render(<DebugScreen />);
    const { triggerImmediateFocusAlert } = require('../../../utils/notifications');

    fireEvent.press(getByText('Immediate Notif'));
    expect(mockHaptics.light).toHaveBeenCalled();
    expect(triggerImmediateFocusAlert).toHaveBeenCalled();
  });

  it('schedules notification in 5 seconds on press', async () => {
    const { getByText } = render(<DebugScreen />);
    const { scheduleTaskReminder } = require('../../../utils/notifications');
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    fireEvent.press(getByText('In 5 Seconds'));
    expect(mockHaptics.light).toHaveBeenCalled();
    expect(scheduleTaskReminder).toHaveBeenCalled();

    // Wait for the async mock to resolve
    await Promise.resolve();
    expect(alertSpy).toHaveBeenCalledWith(
      'Success',
      'Notification scheduled for 5 seconds from now!'
    );
  });

  it('shows error alert if scheduling fails', async () => {
    const { getByText } = render(<DebugScreen />);
    const { scheduleTaskReminder } = require('../../../utils/notifications');
    scheduleTaskReminder.mockResolvedValueOnce(null);
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    fireEvent.press(getByText('In 5 Seconds'));

    // Wait for the async mock to resolve
    await Promise.resolve();
    expect(alertSpy).toHaveBeenCalledWith(
      'Error',
      'Failed to schedule notification. Check permissions.'
    );
  });

  it('triggers success haptics', () => {
    const { getByText } = render(<DebugScreen />);
    fireEvent.press(getByText('Success'));
    expect(mockHaptics.success).toHaveBeenCalled();
  });

  it('triggers warning haptics', () => {
    const { getByText } = render(<DebugScreen />);
    fireEvent.press(getByText('Warning'));
    expect(mockHaptics.warning).toHaveBeenCalled();
  });

  it('triggers error haptics', () => {
    const { getByText } = render(<DebugScreen />);
    fireEvent.press(getByText('Error'));
    expect(mockHaptics.error).toHaveBeenCalled();
  });

  it('triggers heavy haptics', () => {
    const { getByText } = render(<DebugScreen />);
    fireEvent.press(getByText('Heavy'));
    expect(mockHaptics.heavy).toHaveBeenCalled();
  });

  it('gives 100 XP on press', () => {
    const { getByText } = render(<DebugScreen />);
    fireEvent.press(getByText('Give me 100 XP ⚡'));
    expect(mockHaptics.achievement).toHaveBeenCalled();
    expect(mockAddXP).toHaveBeenCalledWith(100);
  });

  describe('toast triggers', () => {
    // Each pairing (position × variant) maps to one button on the
    // screen. Parametrising keeps the assertions tight and a future
    // sixth pairing is one row of data, not a new test block.
    it.each([
      ['Top — info', 'top', 'info'],
      ['Top — warning', 'top', 'warning'],
      ['Bottom — success', 'bottom', 'success'],
      ['Bottom — error', 'bottom', 'error'],
    ] as const)('%s shows the matching toast', (label, position, variant) => {
      const { getByText } = render(<DebugScreen />);
      fireEvent.press(getByText(label));
      expect(mockHaptics.light).toHaveBeenCalled();
      expect(mockToastShow).toHaveBeenCalledWith(
        expect.objectContaining({
          variant,
          position,
          message: expect.any(String),
          title: expect.any(String),
        })
      );
    });
  });
});
