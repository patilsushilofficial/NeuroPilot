import { lexendFamilyFor } from '../lexend';

describe('lexendFamilyFor', () => {
  it('returns the regular variant when no weight is provided', () => {
    expect(lexendFamilyFor(undefined)).toBe('Lexend_400Regular');
  });

  it('maps numeric weights to the matching Lexend variant', () => {
    expect(lexendFamilyFor('400')).toBe('Lexend_400Regular');
    expect(lexendFamilyFor('500')).toBe('Lexend_500Medium');
    expect(lexendFamilyFor('600')).toBe('Lexend_600SemiBold');
    expect(lexendFamilyFor('700')).toBe('Lexend_700Bold');
    expect(lexendFamilyFor('800')).toBe('Lexend_800ExtraBold');
  });

  it('handles the keyword weights "normal" and "bold"', () => {
    expect(lexendFamilyFor('normal')).toBe('Lexend_400Regular');
    expect(lexendFamilyFor('bold')).toBe('Lexend_700Bold');
  });

  it('collapses uncommon weights to the closest available variant', () => {
    expect(lexendFamilyFor('100')).toBe('Lexend_400Regular');
    expect(lexendFamilyFor('300')).toBe('Lexend_400Regular');
    expect(lexendFamilyFor('900')).toBe('Lexend_800ExtraBold');
  });

  it('falls back to regular for unknown values', () => {
    expect(lexendFamilyFor('lighter' as any)).toBe('Lexend_400Regular');
  });
});
