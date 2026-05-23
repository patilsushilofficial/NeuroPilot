describe('notifeeBackground', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('registers a Notifee background handler on the fallback path', async () => {
    jest.doMock('../native/focusTimerNotificationNative', () => ({
      isFocusTimerNativeAvailable: false,
    }));
    jest.doMock('../store', () => ({
      useAppStore: {
        getState: jest.fn(() => ({
          pauseFocus: jest.fn(),
          resumeFocus: jest.fn(),
          abandonFocus: jest.fn(),
        })),
      },
    }));
    jest.doMock('../services/focusTimerNotification', () => ({
      handleFocusTimerNotificationResponse: jest.fn().mockReturnValue(true),
      syncFocusTimerNotificationFromStore: jest.fn().mockResolvedValue(undefined),
    }));

    let backgroundHandler:
      | ((event: { type: number; detail: { pressAction?: { id: string } } }) => Promise<void>)
      | undefined;

    const notifee = require('@notifee/react-native').default;
    notifee.onBackgroundEvent.mockImplementation((cb: typeof backgroundHandler) => {
      backgroundHandler = cb;
    });

    require('../notifeeBackground');

    expect(notifee.onBackgroundEvent).toHaveBeenCalled();
    await backgroundHandler?.({
      type: 1,
      detail: { pressAction: { id: 'FOCUS_TIMER_PAUSE' } },
    });

    const { syncFocusTimerNotificationFromStore } = require('../services/focusTimerNotification');
    expect(syncFocusTimerNotificationFromStore).toHaveBeenCalled();
  });
});
