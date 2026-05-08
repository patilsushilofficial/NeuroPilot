import { palette } from '../colors';

describe('colors', () => {
  it('should have palette defined', () => {
    expect(palette).toBeDefined();
    expect(palette.violet50).toBe('#F3F1FF');
  });
});
