import { TextStyle } from 'react-native';
import { fontFamilies } from './typography';

/**
 * Resolve the correct Lexend variant for a given React Native `fontWeight`.
 *
 * Why this exists:
 *   On Android, setting `fontFamily: 'Lexend_400Regular'` together with
 *   `fontWeight: '700'` makes the OS *synthesize* a fake-bold over the
 *   regular variant — producing distorted glyphs. We must point at the
 *   actual designed bold variant (`Lexend_700Bold`) instead.
 *
 * This map collapses uncommon weights (100/200/300, 900) to the closest
 * shipped Lexend file so unusual styles don't fall back to system fonts.
 */
export const lexendFamilyFor = (weight?: TextStyle['fontWeight']): string => {
  switch (String(weight ?? '400')) {
    case 'normal':
    case '100':
    case '200':
    case '300':
    case '400':
      return fontFamilies.regular;
    case '500':
      return fontFamilies.medium;
    case '600':
      return fontFamilies.semibold;
    case 'bold':
    case '700':
      return fontFamilies.bold;
    case '800':
    case '900':
      return fontFamilies.extrabold;
    default:
      return fontFamilies.regular;
  }
};
