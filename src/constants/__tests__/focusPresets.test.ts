import { getPresetById, getLevelThreshold, getLevelFromXP, getXPToNextLevel, getXPProgressInLevel, XP_REWARDS } from '../focusPresets';

describe('focusPresets', () => {
  describe('getPresetById', () => {
    it('should return preset by id', () => {
      expect(getPresetById('classic').id).toBe('classic');
    });
    it('should return default preset if id not found', () => {
      expect(getPresetById('unknown').id).toBe('classic');
    });
  });

  describe('getLevelThreshold', () => {
    it('should return threshold for level', () => {
      expect(getLevelThreshold(1)).toBe(100);
    });
  });

  describe('getLevelFromXP', () => {
    it('should return level 1 for 0 XP', () => {
      expect(getLevelFromXP(0)).toBe(1);
    });
    it('should return level 1 for 50 XP', () => {
      expect(getLevelFromXP(50)).toBe(1);
    });
    it('should return level 2 for 300 XP', () => {
      expect(getLevelFromXP(300)).toBe(2);
    });
  });

  describe('getXPToNextLevel', () => {
    it('should return XP needed for next level', () => {
      expect(getXPToNextLevel(300)).toBe(getLevelThreshold(3) - 300);
    });
  });

  describe('getXPProgressInLevel', () => {
    it('should return progress percentage', () => {
      const progress = getXPProgressInLevel(300);
      const level = getLevelFromXP(300);
      const current = getLevelThreshold(level);
      const next = getLevelThreshold(level + 1);
      expect(progress).toBe((300 - current) / (next - current));
    });
  });

  describe('XP_REWARDS', () => {
    it('should return correct streak bonus', () => {
      expect(XP_REWARDS.streakBonus(2)).toBe(10);
      expect(XP_REWARDS.streakBonus(20)).toBe(100);
    });
  });
});
