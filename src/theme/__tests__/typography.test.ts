import { textStyles, fontFamilies, defaultFontFamily } from '../typography';

describe('typography', () => {
  it('should have textStyles defined', () => {
    expect(textStyles).toBeDefined();
    expect(textStyles.xpDisplay).toBeDefined();
  });

  it('maps every weight to the corresponding Lexend variant', () => {
    expect(fontFamilies).toEqual({
      regular: 'Lexend_400Regular',
      medium: 'Lexend_500Medium',
      semibold: 'Lexend_600SemiBold',
      bold: 'Lexend_700Bold',
      extrabold: 'Lexend_800ExtraBold',
    });
  });

  it('exposes a Lexend regular default for any unstyled <Text>', () => {
    expect(defaultFontFamily).toBe('Lexend_400Regular');
  });

  it('uses Lexend on every pre-built text style', () => {
    Object.entries(textStyles).forEach(([name, style]) => {
      expect(typeof style.fontFamily).toBe('string');
      expect(style.fontFamily).toMatch(/^Lexend_/);
      // Sanity: the family encodes the same weight as the fontWeight prop.
      const familyWeight = (style.fontFamily as string).match(/Lexend_(\d{3})/)?.[1];
      expect({ name, weight: familyWeight }).toEqual({ name, weight: style.fontWeight });
    });
  });
});
