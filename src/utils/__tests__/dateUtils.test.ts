import { formatDueDate, formatTimerDisplay, formatFocusTime, getTimeGreeting, getPriorityConfig, getLevelTitle, getTodayStr, getWeekDayLabels, getLastNDates } from '../dateUtils';

describe('dateUtils', () => {
  describe('formatDueDate', () => {
    it('should return Today for today date', () => {
      const today = new Date();
      const result = formatDueDate(today.getTime());
      expect(result.label).toBe('Today');
      expect(result.isOverdue).toBe(false);
      expect(result.isUrgent).toBe(true);
    });

    it('should return Tomorrow for tomorrow date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = formatDueDate(tomorrow.getTime());
      expect(result.label).toBe('Tomorrow');
      expect(result.isOverdue).toBe(false);
      expect(result.isUrgent).toBe(true);
    });

    it('should return Yesterday for yesterday date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = formatDueDate(yesterday.getTime());
      expect(result.label).toBe('Yesterday');
      expect(result.isOverdue).toBe(true);
      expect(result.isUrgent).toBe(false);
    });

    it('should return overdue label for past dates', () => {
      const past = new Date();
      past.setDate(past.getDate() - 5);
      const result = formatDueDate(past.getTime());
      expect(result.label).toContain('overdue');
      expect(result.isOverdue).toBe(true);
      expect(result.isUrgent).toBe(false);
    });

    it('formats dates within the upcoming week as a weekday label', () => {
      const upcoming = new Date();
      upcoming.setDate(upcoming.getDate() + 3);
      const result = formatDueDate(upcoming.getTime());
      expect(result.label).toMatch(/[A-Z][a-z]{2}, [A-Z][a-z]{2} \d+/);
    });

    it('formats dates further in the future with month/day only', () => {
      const future = new Date();
      future.setDate(future.getDate() + 30);
      const result = formatDueDate(future.getTime());
      expect(result.label).toMatch(/^[A-Z][a-z]{2} \d+/);
    });
  });

  describe('formatTimerDisplay', () => {
    it('should format seconds to MM:SS', () => {
      expect(formatTimerDisplay(65)).toBe('01:05');
      expect(formatTimerDisplay(0)).toBe('00:00');
      expect(formatTimerDisplay(3599)).toBe('59:59');
    });
  });

  describe('formatFocusTime', () => {
    it('should format minutes to string', () => {
      expect(formatFocusTime(30)).toBe('30m');
      expect(formatFocusTime(60)).toBe('1h');
      expect(formatFocusTime(90)).toBe('1h 30m');
    });
  });

  describe('getTimeGreeting', () => {
    const RealDate = Date;
    const mockHour = (hour: number) => {
      const mockDate = new RealDate('2026-05-08T00:00:00Z');
      jest.spyOn(mockDate, 'getHours').mockReturnValue(hour);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
    };

    afterEach(() => {
      jest.restoreAllMocks();
      global.Date = RealDate;
    });

    it('greets a morning person by name', () => {
      mockHour(8);
      const greeting = getTimeGreeting('John');
      expect(greeting).toContain('John');
      expect(greeting).toContain('Good morning');
    });

    it('greets night owls before 6am', () => {
      mockHour(3);
      expect(getTimeGreeting()).toMatch(/Night owl/);
    });

    it('greets in afternoon, evening and night windows', () => {
      mockHour(13);
      expect(getTimeGreeting()).toMatch(/Good afternoon/);
      mockHour(19);
      expect(getTimeGreeting()).toMatch(/Good evening/);
      mockHour(22);
      expect(getTimeGreeting()).toMatch(/Good night/);
    });
  });

  describe('getPriorityConfig', () => {
    it('should return correct config for high priority', () => {
      const config = getPriorityConfig('high');
      expect(config.label).toBe('High');
      expect(config.emoji).toBe('🔴');
    });
  });

  describe('getLevelTitle', () => {
    it('should return correct title for level 1', () => {
      expect(getLevelTitle(1)).toBe('Spark');
    });
    it('should return correct title for level 10', () => {
      expect(getLevelTitle(10)).toBe('Pilot');
    });
    it('should return correct title for level 100', () => {
      expect(getLevelTitle(100)).toBe('Neuro Legend');
    });
  });

  describe('getTodayStr', () => {
    it('should return today date in YYYY-MM-DD format', () => {
      const todayStr = getTodayStr();
      expect(todayStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getWeekDayLabels', () => {
    it('returns 7 labels starting from Monday', () => {
      expect(getWeekDayLabels()).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
    });
  });

  describe('getLastNDates', () => {
    it('returns N consecutive YYYY-MM-DD entries with the most recent last', () => {
      const dates = getLastNDates(5);
      expect(dates).toHaveLength(5);
      expect(dates.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))).toBe(true);
      const sorted = [...dates].sort();
      expect(sorted).toEqual(dates);
    });
  });

  describe('getPriorityConfig', () => {
    it('returns config for medium and low priorities too', () => {
      expect(getPriorityConfig('medium').label).toBe('Medium');
      expect(getPriorityConfig('low').emoji).toBe('🟢');
    });
  });

  describe('getLevelTitle', () => {
    it.each([
      [4, 'Learner'],
      [6, 'Focused'],
      [10, 'Pilot'],
      [15, 'Navigator'],
      [20, 'Co-Pilot'],
      [30, 'Ace'],
      [40, 'Expert'],
      [60, 'Neuro Legend'],
    ])('returns %s for level %i', (level, expected) => {
      expect(getLevelTitle(level)).toBe(expected);
    });
  });
});
