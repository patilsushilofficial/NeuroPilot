import { focusTransitionAlerts } from '../focusTransitionAlerts';
import {
  cancelNotification,
  scheduleFocusTransitionAlert,
} from '../../utils/notifications';

jest.mock('../../utils/notifications', () => ({
  scheduleFocusTransitionAlert: jest.fn(),
  cancelNotification: jest.fn().mockResolvedValue(undefined),
}));

const mockSchedule = scheduleFocusTransitionAlert as jest.Mock;
const mockCancel = cancelNotification as jest.Mock;

describe('focusTransitionAlerts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    focusTransitionAlerts.__resetForTests();
    mockSchedule.mockResolvedValue('notif_1');
  });

  describe('scheduleFor', () => {
    it('schedules a focus heads-up using the supplied seconds remaining', async () => {
      // 25 minutes left → expect a heads-up scheduled for the focus
      // phase. The service translates seconds → minutes for the
      // underlying expo-notifications call so the slice never has to
      // think about units twice.
      await focusTransitionAlerts.scheduleFor('focus', 25 * 60);
      expect(mockSchedule).toHaveBeenCalledWith('focus', 25);
    });

    it('maps short_break and long_break to the "break" alert phase', async () => {
      // The notifications layer only knows two cue strings ("focus"
      // vs "break"), so the service collapses both break flavours
      // into 'break' before calling out.
      await focusTransitionAlerts.scheduleFor('short_break', 5 * 60 + 30);
      expect(mockSchedule).toHaveBeenLastCalledWith('break', 5.5);

      await focusTransitionAlerts.scheduleFor('long_break', 15 * 60);
      expect(mockSchedule).toHaveBeenLastCalledWith('break', 15);
    });

    it('skips scheduling when the lead time is shorter than the heads-up offset', async () => {
      // The notifications cue lands 3 minutes before the phase ends.
      // For a 2-minute break we'd otherwise schedule a notification
      // dated in the past — explicitly bail out instead.
      await focusTransitionAlerts.scheduleFor('focus', 60); // 1 min
      expect(mockSchedule).not.toHaveBeenCalled();

      await focusTransitionAlerts.scheduleFor('focus', 3 * 60); // exactly 3 min
      expect(mockSchedule).not.toHaveBeenCalled();
    });

    it('cancels a previously scheduled heads-up before scheduling a new one', async () => {
      // Without this, calling scheduleFor twice in a row (e.g. from
      // pause→resume mid-phase) would leave the first notification
      // dangling, and the user would receive *two* heads-ups for the
      // same phase.
      await focusTransitionAlerts.scheduleFor('focus', 25 * 60);
      mockSchedule.mockResolvedValueOnce('notif_2');

      await focusTransitionAlerts.scheduleFor('focus', 25 * 60);
      expect(mockCancel).toHaveBeenCalledWith('notif_1');
      expect(mockSchedule).toHaveBeenCalledTimes(2);
    });

    it('does not store a notif id when the scheduling helper returns null', async () => {
      // If the underlying scheduler bails out (e.g. permissions
      // revoked), there's nothing to cancel — calling cancel()
      // afterwards must be a no-op rather than fall over.
      mockSchedule.mockResolvedValueOnce(null);
      await focusTransitionAlerts.scheduleFor('focus', 25 * 60);

      mockCancel.mockClear();
      await focusTransitionAlerts.cancel();
      expect(mockCancel).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('cancels the active heads-up and forgets the id', async () => {
      await focusTransitionAlerts.scheduleFor('focus', 25 * 60);
      await focusTransitionAlerts.cancel();
      expect(mockCancel).toHaveBeenCalledWith('notif_1');

      // A second cancel should be a no-op — proves the id is cleared
      // after the first call rather than leaking into subsequent ones.
      mockCancel.mockClear();
      await focusTransitionAlerts.cancel();
      expect(mockCancel).not.toHaveBeenCalled();
    });

    it('is a no-op when nothing has been scheduled', async () => {
      await focusTransitionAlerts.cancel();
      expect(mockCancel).not.toHaveBeenCalled();
    });
  });
});
