import { StyleSheet } from 'react-native';
import {
  borderWidths,
  iconSizes,
  avatarSizes,
  controlSizes,
  hitSlop,
  opacity,
  durations,
  springs,
  zIndex,
} from '../tokens';

describe('design tokens', () => {
  describe('borderWidths', () => {
    it('exposes the platform hairline value', () => {
      expect(borderWidths.hairline).toBe(StyleSheet.hairlineWidth);
    });

    it('orders strokes from thin to extra thick', () => {
      expect(borderWidths.thin).toBeLessThan(borderWidths.base);
      expect(borderWidths.base).toBeLessThan(borderWidths.thick);
      expect(borderWidths.thick).toBeLessThan(borderWidths.extraThick);
    });

    it('keeps the zero stroke as a literal 0', () => {
      expect(borderWidths.none).toBe(0);
    });
  });

  describe('iconSizes', () => {
    it('grows monotonically across the scale', () => {
      const ordered = [
        iconSizes.xs,
        iconSizes.sm,
        iconSizes.md,
        iconSizes.lg,
        iconSizes.xl,
        iconSizes['2xl'],
        iconSizes['3xl'],
        iconSizes['4xl'],
        iconSizes['5xl'],
        iconSizes['6xl'],
        iconSizes['7xl'],
      ];
      for (let i = 1; i < ordered.length; i += 1) {
        expect(ordered[i]).toBeGreaterThan(ordered[i - 1]);
      }
    });
  });

  describe('avatarSizes', () => {
    it('grows monotonically', () => {
      const ordered = [
        avatarSizes.xs,
        avatarSizes.sm,
        avatarSizes.md,
        avatarSizes.lg,
        avatarSizes.xl,
        avatarSizes['2xl'],
        avatarSizes['3xl'],
      ];
      for (let i = 1; i < ordered.length; i += 1) {
        expect(ordered[i]).toBeGreaterThan(ordered[i - 1]);
      }
    });
  });

  describe('controlSizes', () => {
    it('keeps button heights monotonically increasing', () => {
      expect(controlSizes.buttonHeight.sm).toBeLessThan(controlSizes.buttonHeight.md);
      expect(controlSizes.buttonHeight.md).toBeLessThan(controlSizes.buttonHeight.lg);
    });

    it('keeps input heights monotonically increasing', () => {
      expect(controlSizes.inputHeight.sm).toBeLessThan(controlSizes.inputHeight.md);
      expect(controlSizes.inputHeight.md).toBeLessThan(controlSizes.inputHeight.lg);
    });

    it('exposes a thumb travel that fits inside the toggle pill', () => {
      const pillInner = controlSizes.toggleWidth - controlSizes.toggleThumb;
      expect(controlSizes.toggleThumbTravel).toBeLessThanOrEqual(pillInner);
    });
  });

  describe('hitSlop', () => {
    it('mirrors top/bottom and left/right values', () => {
      Object.values(hitSlop).forEach((slop) => {
        expect(slop.top).toBe(slop.bottom);
        expect(slop.left).toBe(slop.right);
      });
    });

    it('grows monotonically by tier', () => {
      expect(hitSlop.sm.top).toBeLessThan(hitSlop.md.top);
      expect(hitSlop.md.top).toBeLessThan(hitSlop.lg.top);
    });
  });

  describe('opacity', () => {
    it('lives on a 0–1 scale', () => {
      Object.values(opacity).forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });

    it('clamps to the min and max', () => {
      expect(opacity.none).toBe(0);
      expect(opacity.full).toBe(1);
    });
  });

  describe('durations', () => {
    it('grows monotonically', () => {
      const ordered = [
        durations.instant,
        durations.fast,
        durations.base,
        durations.slow,
        durations.slower,
        durations.long,
      ];
      for (let i = 1; i < ordered.length; i += 1) {
        expect(ordered[i]).toBeGreaterThan(ordered[i - 1]);
      }
    });
  });

  describe('springs', () => {
    it('exposes damping and stiffness for each preset', () => {
      Object.values(springs).forEach((spring) => {
        expect(typeof spring.damping).toBe('number');
        expect(typeof spring.stiffness).toBe('number');
        expect(spring.damping).toBeGreaterThan(0);
        expect(spring.stiffness).toBeGreaterThan(0);
      });
    });
  });

  describe('zIndex', () => {
    it('layers from base to toast', () => {
      expect(zIndex.base).toBeLessThan(zIndex.raised);
      expect(zIndex.raised).toBeLessThan(zIndex.sticky);
      expect(zIndex.sticky).toBeLessThan(zIndex.overlay);
      expect(zIndex.overlay).toBeLessThan(zIndex.drawer);
      expect(zIndex.drawer).toBeLessThan(zIndex.modal);
      expect(zIndex.modal).toBeLessThan(zIndex.toast);
    });
  });
});
