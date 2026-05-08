import { ACHIEVEMENTS, ACHIEVEMENT_MAP } from '../achievements';

describe('achievements', () => {
  it('should have achievements defined', () => {
    expect(ACHIEVEMENTS).toBeDefined();
    expect(ACHIEVEMENTS.length).toBeGreaterThan(0);
  });

  it('should map achievements by id', () => {
    expect(ACHIEVEMENT_MAP).toBeDefined();
    expect(ACHIEVEMENT_MAP['first_focus']).toBeDefined();
    expect(ACHIEVEMENT_MAP['first_focus'].title).toBe('First Spark');
  });
});
