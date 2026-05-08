import { scale, verticalScale, moderateScale } from '../responsive';

// Mock Dimensions before importing responsive
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn().mockReturnValue({ width: 375, height: 812 }),
  },
}));

describe('responsive', () => {
  it('should scale size based on width', () => {
    expect(scale(10)).toBe(10);
  });

  it('should verticalScale size based on height', () => {
    expect(verticalScale(10)).toBe(10);
  });

  it('should moderateScale size', () => {
    expect(moderateScale(10)).toBe(10);
  });
});
